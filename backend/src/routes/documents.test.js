/**
 * Tests for Documents API routes
 * Run with: npm test -- --testPathPattern=documents.test.js
 */

const request = require('supertest');

// Mock Supabase client
jest.mock('../lib/supabase', () => ({
    supabase: {
        from: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            delete: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis()
        })),
        storage: {
            from: jest.fn(() => ({
                upload: jest.fn().mockResolvedValue({ error: null }),
                remove: jest.fn().mockResolvedValue({ error: null }),
                getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://test.url/file.pdf' } })
            }))
        }
    }
}));

// Mock auth middleware
jest.mock('../middleware/auth', () => ({
    requireAuth: (req, res, next) => {
        req.auth = {
            userId: 'clerk_test_user',
            internalUserId: 'test-uuid-1234',
            email: 'test@example.com'
        };
        next();
    }
}));

const express = require('express');
const documentsRoutes = require('./documents');
const { supabase } = require('../lib/supabase');

// Create test app
const createTestApp = () => {
    const app = express();
    app.use(express.json());
    app.use('/api/documents', documentsRoutes);
    return app;
};

describe('Documents API', () => {
    let app;

    beforeEach(() => {
        app = createTestApp();
        jest.clearAllMocks();
    });

    describe('GET /api/documents', () => {
        it('should return all documents for the authenticated user', async () => {
            const mockDocuments = [
                { id: '1', name: 'Resume v1', type: 'resume', user_id: 'test-uuid-1234' },
                { id: '2', name: 'Cover Letter', type: 'cover_letter', user_id: 'test-uuid-1234' }
            ];

            supabase.from().select().eq().order.mockResolvedValue({
                data: mockDocuments,
                error: null
            });

            const response = await request(app)
                .get('/api/documents')
                .set('Authorization', 'Bearer test-token');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockDocuments);
        });

        it('should return 500 on database error', async () => {
            supabase.from().select().eq().order.mockResolvedValue({
                data: null,
                error: { message: 'Database error' }
            });

            const response = await request(app)
                .get('/api/documents')
                .set('Authorization', 'Bearer test-token');

            expect(response.status).toBe(500);
            expect(response.body.error).toBe('Failed to fetch documents');
        });
    });

    describe('GET /api/documents/:id', () => {
        it('should return a single document by ID', async () => {
            const mockDocument = { id: '1', name: 'Resume v1', type: 'resume' };

            supabase.from().select().eq().eq().single.mockResolvedValue({
                data: mockDocument,
                error: null
            });

            const response = await request(app)
                .get('/api/documents/valid-uuid-here')
                .set('Authorization', 'Bearer test-token');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockDocument);
        });

        it('should return 404 for non-existent document', async () => {
            supabase.from().select().eq().eq().single.mockResolvedValue({
                data: null,
                error: { code: 'PGRST116' }
            });

            const response = await request(app)
                .get('/api/documents/non-existent-uuid')
                .set('Authorization', 'Bearer test-token');

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Document not found');
        });
    });

    describe('POST /api/documents', () => {
        it('should create a new external document', async () => {
            const newDocument = {
                name: 'Portfolio',
                type: 'portfolio',
                file_url: 'https://example.com/portfolio',
                is_external: true
            };

            // Mock document count check
            supabase.from().select.mockReturnValue({
                eq: jest.fn().mockResolvedValue({ count: 5 })
            });

            // Mock document creation
            supabase.from().insert().select().single.mockResolvedValue({
                data: { id: 'new-uuid', ...newDocument },
                error: null
            });

            const response = await request(app)
                .post('/api/documents')
                .set('Authorization', 'Bearer test-token')
                .send(newDocument);

            expect(response.status).toBe(201);
            expect(response.body.name).toBe('Portfolio');
        });

        it('should reject when document limit is reached', async () => {
            supabase.from().select.mockReturnValue({
                eq: jest.fn().mockResolvedValue({ count: 20 })
            });

            const response = await request(app)
                .post('/api/documents')
                .set('Authorization', 'Bearer test-token')
                .send({ name: 'Test', type: 'resume' });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Document limit reached');
        });

        it('should validate required fields', async () => {
            const response = await request(app)
                .post('/api/documents')
                .set('Authorization', 'Bearer test-token')
                .send({}); // Missing required fields

            expect(response.status).toBe(422);
        });
    });

    describe('DELETE /api/documents/:id', () => {
        it('should delete document and file from storage', async () => {
            // Mock fetch document
            supabase.from().select().eq().eq().single.mockResolvedValue({
                data: { storage_path: 'user/123/file.pdf', is_external: false },
                error: null
            });

            // Mock delete
            supabase.from().delete().eq().eq.mockResolvedValue({
                error: null
            });

            const response = await request(app)
                .delete('/api/documents/valid-uuid')
                .set('Authorization', 'Bearer test-token');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(supabase.storage.from().remove).toHaveBeenCalled();
        });

        it('should not delete storage for external links', async () => {
            supabase.from().select().eq().eq().single.mockResolvedValue({
                data: { storage_path: null, is_external: true },
                error: null
            });

            supabase.from().delete().eq().eq.mockResolvedValue({
                error: null
            });

            const response = await request(app)
                .delete('/api/documents/valid-uuid')
                .set('Authorization', 'Bearer test-token');

            expect(response.status).toBe(200);
            expect(supabase.storage.from().remove).not.toHaveBeenCalled();
        });
    });

    describe('POST /api/documents/:id/assign', () => {
        it('should link document to internship opportunity', async () => {
            // Mock document exists
            supabase.from().select().eq().eq().single
                .mockResolvedValueOnce({ data: { id: 'doc-1' }, error: null })
                // Mock opportunity check (internship)
                .mockResolvedValueOnce({ data: { id: 'opp-1', category: 'internship' }, error: null });

            // Mock insert link
            supabase.from().insert().select().single.mockResolvedValue({
                data: { document_id: 'doc-1', opportunity_id: 'opp-1' },
                error: null
            });

            const response = await request(app)
                .post('/api/documents/doc-1/assign')
                .set('Authorization', 'Bearer test-token')
                .send({ opportunity_id: 'opp-1' });

            expect(response.status).toBe(201);
        });

        it('should reject linking to hackathon opportunity', async () => {
            // Mock document exists
            supabase.from().select().eq().eq().single
                .mockResolvedValueOnce({ data: { id: 'doc-1' }, error: null })
                // Mock opportunity check (hackathon)
                .mockResolvedValueOnce({ data: { id: 'opp-1', category: 'hackathon' }, error: null });

            const response = await request(app)
                .post('/api/documents/doc-1/assign')
                .set('Authorization', 'Bearer test-token')
                .send({ opportunity_id: 'opp-1' });

            expect(response.status).toBe(400);
            expect(response.body.error).toContain('internship');
        });
    });
});
