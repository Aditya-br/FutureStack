const TEST_AUTH = {
    userId: 'clerk_user_test',
    internalUserId: '00000000-0000-4000-8000-000000000001',
    email: 'contributor@test.local',
};

/**
 * Mock requireAuth: 401 without Bearer token; attaches TEST_AUTH when present.
 */
function mockRequireAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Missing or invalid Authorization header',
        });
    }

    req.auth = { ...TEST_AUTH };
    next();
}

module.exports = { mockRequireAuth, TEST_AUTH };
