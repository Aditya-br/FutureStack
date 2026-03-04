const { verifyToken } = require('@clerk/backend');
const { supabase } = require('../lib/supabase');

// In-memory cache for user IDs to avoid database lookups on every request
// Key: clerk_id, Value: { internalUserId, timestamp }
const userCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Normalize PEM key from environment variable
 * Handles both multi-line PEM and single-line with escaped newlines (\n)
 * Also strips surrounding quotes that some env parsers add
 */
function normalizePemKey(key) {
    if (!key) return null;
    
    return key
        .trim()
        // Remove surrounding quotes (single or double) that some env parsers add
        .replace(/^["']|["']$/g, '')
        // Convert escaped newlines to actual newlines (common on Render, Railway, etc.)
        .replace(/\\n/g, '\n');
}

// Log startup configuration (without exposing secrets)
const jwtPublicKeyConfigured = !!process.env.CLERK_JWT_PUBLIC_KEY;
console.log(`Auth: JWT public key configured: ${jwtPublicKeyConfigured} (networkless verification ${jwtPublicKeyConfigured ? 'enabled' : 'disabled'})`);

/**
 * Clerk JWT Authentication Middleware
 * Validates Bearer token and attaches user info to request
 * 
 * Uses jwtKey (PEM public key) for local verification to avoid network dependency.
 * Get this from Clerk Dashboard > Configure > API Keys > Show JWT Public Key
 */
const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Missing or invalid Authorization header'
            });
        }

        const token = authHeader.split(' ')[1];

        // Build verification options
        const verifyOptions = {};

        // Use JWT public key for local verification if available (recommended for production)
        // This avoids network calls to Clerk's JWKS endpoint
        const jwtKey = normalizePemKey(process.env.CLERK_JWT_PUBLIC_KEY);
        if (jwtKey) {
            verifyOptions.jwtKey = jwtKey;
        } else {
            // Fallback to secret key (requires network call to Clerk)
            verifyOptions.secretKey = process.env.CLERK_SECRET_KEY;
        }

        // Verify the JWT
        let payload;
        try {
            payload = await verifyToken(token, verifyOptions);
        } catch (verifyError) {
            // If network verification fails, provide helpful error
            if (verifyError.message?.includes('fetch failed') ||
                verifyError.message?.includes('ECONNREFUSED') ||
                verifyError.message?.includes('ENOTFOUND') ||
                verifyError.message?.includes('fetch is not defined')) {
                console.error('Auth: Network error verifying token — cannot reach Clerk API.', verifyError.message);
                console.error('Auth: Set CLERK_JWT_PUBLIC_KEY env var to enable local verification.');
                return res.status(503).json({
                    error: 'Service Unavailable',
                    message: 'Authentication service temporarily unavailable. Please try again.'
                });
            }
            throw verifyError; // Re-throw other errors (expired, malformed, etc.)
        }

        if (!payload) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid token'
            });
        }

        // Attach user info to request
        req.auth = {
            userId: payload.sub,
            sessionId: payload.sid,
            email: payload.email
        };

        // Get or create user in Supabase (with caching)
        await ensureUserExists(req.auth);

        next();
    } catch (error) {
        console.error('Auth middleware error:', error.message);

        let message = 'Token verification failed';
        if (error.message?.includes('expired')) {
            message = 'Token has expired';
        } else if (error.message?.includes('malformed') || error.message?.includes('invalid')) {
            message = 'Malformed or invalid token';
        }

        return res.status(401).json({
            error: 'Unauthorized',
            message
        });
    }
};

/**
 * Ensure user exists in Supabase (create on first login)
 * Uses caching to avoid database lookups on every request
 */
async function ensureUserExists(auth) {
    const { userId, email } = auth;

    // Check cache first
    const cached = userCache.get(userId);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL_MS) {
        auth.internalUserId = cached.internalUserId;
        return;
    }

    // Try to find existing user
    const { data: existingUser, error: selectError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', userId)
        .maybeSingle();

    if (selectError) throw selectError;

    if (existingUser) {
        userCache.set(userId, { internalUserId: existingUser.id, timestamp: Date.now() });
        auth.internalUserId = existingUser.id;
        return;
    }

    // User doesn't exist, create them
    const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({ clerk_id: userId, email: email || null })
        .select('id')
        .single();

    if (insertError) {
        // Handle race condition
        if (insertError.code === '23505') {
            const { data: raceUser } = await supabase
                .from('users')
                .select('id')
                .eq('clerk_id', userId)
                .single();
            if (raceUser) {
                userCache.set(userId, { internalUserId: raceUser.id, timestamp: Date.now() });
                auth.internalUserId = raceUser.id;
                return;
            }
        }
        throw insertError;
    }

    userCache.set(userId, { internalUserId: newUser.id, timestamp: Date.now() });
    auth.internalUserId = newUser.id;
}

module.exports = { requireAuth };
