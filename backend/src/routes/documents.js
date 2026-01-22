const express = require('express');
const multer = require('multer');
const { supabase } = require('../lib/supabase');
const { validate } = require('../middleware/validate');
const {
    createDocumentSchema,
    updateDocumentSchema,
    assignDocumentSchema,
    documentIdParamSchema,
    unassignDocumentParamsSchema
} = require('../validation/documents-schemas');

const router = express.Router();

// File size limit: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;
// Max documents per user
const MAX_DOCUMENTS_PER_USER = 20;
// Allowed file types
const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// Configure multer for memory storage (we'll upload to Supabase Storage)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
        if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF, DOC, and DOCX files are allowed'), false);
        }
    }
});

/**
 * Audit logging helper
 */
function logAudit(action, userId, resourceId = null, outcome = 'success', details = {}) {
    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        type: 'AUDIT',
        action,
        userId,
        resourceId,
        outcome,
        details
    }));
}

/**
 * GET /api/documents
 * Get all documents for the authenticated user
 */
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('documents')
            .select(`
                *,
                opportunity_documents(
                    opportunity_id,
                    submitted_at,
                    opportunities(id, title, status)
                )
            `)
            .eq('user_id', req.auth.internalUserId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Error fetching documents:', error.message);
        res.status(500).json({ error: 'Failed to fetch documents' });
    }
});

/**
 * GET /api/documents/:id
 * Get a single document by ID
 */
router.get('/:id', validate(documentIdParamSchema, 'params'), async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('documents')
            .select(`
                *,
                opportunity_documents(
                    opportunity_id,
                    submitted_at,
                    opportunities(id, title, status, category)
                )
            `)
            .eq('id', id)
            .eq('user_id', req.auth.internalUserId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Document not found' });
            }
            throw error;
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching document:', error.message);
        res.status(500).json({ error: 'Failed to fetch document' });
    }
});

/**
 * POST /api/documents
 * Create a new document (metadata only, for external links)
 */
router.post('/', validate(createDocumentSchema), async (req, res) => {
    try {
        // Check document limit
        const { count } = await supabase
            .from('documents')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', req.auth.internalUserId);

        if (count >= MAX_DOCUMENTS_PER_USER) {
            return res.status(400).json({
                error: 'Document limit reached',
                message: `You can only store up to ${MAX_DOCUMENTS_PER_USER} documents. Please delete some to add more.`
            });
        }

        const { name, type, file_url, version, notes, is_external } = req.body;

        const { data, error } = await supabase
            .from('documents')
            .insert({
                user_id: req.auth.internalUserId,
                name,
                type,
                file_url: file_url || null,
                version: version || 'v1',
                notes: notes || null,
                is_external: is_external !== undefined ? is_external : true
            })
            .select()
            .single();

        if (error) throw error;

        logAudit('CREATE_DOCUMENT', req.auth.internalUserId, data.id, 'success', { type });

        res.status(201).json(data);
    } catch (error) {
        console.error('Error creating document:', error.message);
        res.status(500).json({ error: 'Failed to create document' });
    }
});

/**
 * POST /api/documents/upload
 * Upload a file and create document record
 */
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Check document limit
        const { count } = await supabase
            .from('documents')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', req.auth.internalUserId);

        if (count >= MAX_DOCUMENTS_PER_USER) {
            return res.status(400).json({
                error: 'Document limit reached',
                message: `You can only store up to ${MAX_DOCUMENTS_PER_USER} documents. Please delete some to add more.`
            });
        }

        const { name, type, version, notes } = req.body;

        if (!name || !type) {
            return res.status(400).json({ error: 'Name and type are required' });
        }

        // Generate unique file path: userId/timestamp-filename
        const timestamp = Date.now();
        const sanitizedName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const storagePath = `${req.auth.internalUserId}/${timestamp}-${sanitizedName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase
            .storage
            .from('documents')
            .upload(storagePath, req.file.buffer, {
                contentType: req.file.mimetype,
                upsert: false
            });

        if (uploadError) {
            console.error('Storage upload error:', uploadError);
            return res.status(500).json({ error: 'Failed to upload file' });
        }

        // Get public URL (or signed URL for private bucket)
        const { data: urlData } = supabase
            .storage
            .from('documents')
            .getPublicUrl(storagePath);

        // Create document record
        const { data, error } = await supabase
            .from('documents')
            .insert({
                user_id: req.auth.internalUserId,
                name,
                type,
                file_url: urlData.publicUrl,
                file_size: req.file.size,
                storage_path: storagePath,
                version: version || 'v1',
                notes: notes || null,
                is_external: false
            })
            .select()
            .single();

        if (error) {
            // Rollback: delete uploaded file
            await supabase.storage.from('documents').remove([storagePath]);
            throw error;
        }

        logAudit('UPLOAD_DOCUMENT', req.auth.internalUserId, data.id, 'success', {
            type,
            fileSize: req.file.size
        });

        res.status(201).json(data);
    } catch (error) {
        console.error('Error uploading document:', error.message);
        res.status(500).json({ error: 'Failed to upload document' });
    }
});

/**
 * PATCH /api/documents/:id
 * Update document metadata
 */
router.patch('/:id', validate(documentIdParamSchema, 'params'), validate(updateDocumentSchema), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type, file_url, version, notes, is_external } = req.body;

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (type !== undefined) updateData.type = type;
        if (file_url !== undefined) updateData.file_url = file_url;
        if (version !== undefined) updateData.version = version;
        if (notes !== undefined) updateData.notes = notes;
        if (is_external !== undefined) updateData.is_external = is_external;

        const { data, error } = await supabase
            .from('documents')
            .update(updateData)
            .eq('id', id)
            .eq('user_id', req.auth.internalUserId)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Document not found' });
            }
            throw error;
        }

        logAudit('UPDATE_DOCUMENT', req.auth.internalUserId, id, 'success', {
            updatedFields: Object.keys(updateData)
        });

        res.json(data);
    } catch (error) {
        console.error('Error updating document:', error.message);
        res.status(500).json({ error: 'Failed to update document' });
    }
});

/**
 * DELETE /api/documents/:id
 * Delete a document and its file from storage
 */
router.delete('/:id', validate(documentIdParamSchema, 'params'), async (req, res) => {
    try {
        const { id } = req.params;

        // First get the document to check storage_path
        const { data: doc, error: fetchError } = await supabase
            .from('documents')
            .select('storage_path, is_external')
            .eq('id', id)
            .eq('user_id', req.auth.internalUserId)
            .single();

        if (fetchError) {
            if (fetchError.code === 'PGRST116') {
                return res.status(404).json({ error: 'Document not found' });
            }
            throw fetchError;
        }

        // Delete from storage if it's an uploaded file
        if (doc.storage_path && !doc.is_external) {
            const { error: storageError } = await supabase
                .storage
                .from('documents')
                .remove([doc.storage_path]);

            if (storageError) {
                console.error('Storage delete error:', storageError);
                // Continue with database deletion anyway
            }
        }

        // Delete from database (cascades to opportunity_documents)
        const { error } = await supabase
            .from('documents')
            .delete()
            .eq('id', id)
            .eq('user_id', req.auth.internalUserId);

        if (error) throw error;

        logAudit('DELETE_DOCUMENT', req.auth.internalUserId, id, 'success');

        res.json({ success: true, message: 'Document deleted' });
    } catch (error) {
        console.error('Error deleting document:', error.message);
        res.status(500).json({ error: 'Failed to delete document' });
    }
});

/**
 * POST /api/documents/:id/assign
 * Link a document to an opportunity
 */
router.post('/:id/assign', validate(documentIdParamSchema, 'params'), validate(assignDocumentSchema), async (req, res) => {
    try {
        const { id } = req.params;
        const { opportunity_id } = req.body;

        // Verify document belongs to user
        const { data: doc, error: docError } = await supabase
            .from('documents')
            .select('id')
            .eq('id', id)
            .eq('user_id', req.auth.internalUserId)
            .single();

        if (docError) {
            if (docError.code === 'PGRST116') {
                return res.status(404).json({ error: 'Document not found' });
            }
            throw docError;
        }

        // Verify opportunity belongs to user and is internship
        const { data: opp, error: oppError } = await supabase
            .from('opportunities')
            .select('id, category')
            .eq('id', opportunity_id)
            .eq('user_id', req.auth.internalUserId)
            .single();

        if (oppError) {
            if (oppError.code === 'PGRST116') {
                return res.status(404).json({ error: 'Opportunity not found' });
            }
            throw oppError;
        }

        // Only allow document attachment for internships
        if (opp.category !== 'internship') {
            return res.status(400).json({
                error: 'Documents can only be attached to internship opportunities'
            });
        }

        // Create the link
        const { data, error } = await supabase
            .from('opportunity_documents')
            .insert({
                opportunity_id,
                document_id: id
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return res.status(409).json({ error: 'Document already linked to this opportunity' });
            }
            throw error;
        }

        logAudit('ASSIGN_DOCUMENT', req.auth.internalUserId, id, 'success', { opportunity_id });

        res.status(201).json(data);
    } catch (error) {
        console.error('Error assigning document:', error.message);
        res.status(500).json({ error: 'Failed to assign document' });
    }
});

/**
 * DELETE /api/documents/:id/unassign/:opportunityId
 * Unlink a document from an opportunity
 */
router.delete('/:id/unassign/:opportunityId', validate(unassignDocumentParamsSchema, 'params'), async (req, res) => {
    try {
        const { id, opportunityId } = req.params;

        // Verify ownership through document
        const { data: doc } = await supabase
            .from('documents')
            .select('id')
            .eq('id', id)
            .eq('user_id', req.auth.internalUserId)
            .single();

        if (!doc) {
            return res.status(404).json({ error: 'Document not found' });
        }

        const { error, count } = await supabase
            .from('opportunity_documents')
            .delete({ count: 'exact' })
            .eq('document_id', id)
            .eq('opportunity_id', opportunityId);

        if (error) throw error;

        if (count === 0) {
            return res.status(404).json({ error: 'Link not found' });
        }

        logAudit('UNASSIGN_DOCUMENT', req.auth.internalUserId, id, 'success', { opportunity_id: opportunityId });

        res.json({ success: true, message: 'Document unlinked' });
    } catch (error) {
        console.error('Error unassigning document:', error.message);
        res.status(500).json({ error: 'Failed to unassign document' });
    }
});

/**
 * GET /api/documents/by-opportunity/:opportunityId
 * Get all documents linked to an opportunity
 */
router.get('/by-opportunity/:opportunityId', async (req, res) => {
    try {
        const { opportunityId } = req.params;

        // Verify opportunity belongs to user
        const { data: opp, error: oppError } = await supabase
            .from('opportunities')
            .select('id')
            .eq('id', opportunityId)
            .eq('user_id', req.auth.internalUserId)
            .single();

        if (oppError) {
            if (oppError.code === 'PGRST116') {
                return res.status(404).json({ error: 'Opportunity not found' });
            }
            throw oppError;
        }

        const { data, error } = await supabase
            .from('opportunity_documents')
            .select(`
                submitted_at,
                documents(*)
            `)
            .eq('opportunity_id', opportunityId);

        if (error) throw error;

        // Flatten the response
        const documents = data.map(item => ({
            ...item.documents,
            submitted_at: item.submitted_at
        }));

        res.json(documents);
    } catch (error) {
        console.error('Error fetching opportunity documents:', error.message);
        res.status(500).json({ error: 'Failed to fetch documents' });
    }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'File too large',
                message: `Maximum file size is ${MAX_FILE_SIZE / 1024 / 1024}MB`
            });
        }
    }
    if (error.message === 'Only PDF, DOC, and DOCX files are allowed') {
        return res.status(400).json({ error: error.message });
    }
    next(error);
});

module.exports = router;
