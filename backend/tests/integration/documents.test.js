const { createChain, createCountChain } = require('../mocks/supabase');
const { mockRequireAuth, TEST_AUTH } = require('../mocks/auth');

jest.mock('../../src/middleware/auth', () => ({
    requireAuth: (...args) => mockRequireAuth(...args),
}));

const mockFrom = jest.fn();
const mockStorageFrom = jest.fn(() => ({
    createSignedUrl: jest.fn().mockResolvedValue({ data: { signedUrl: null }, error: null }),
    remove: jest.fn(),
}));

jest.mock('../../src/lib/supabase', () => ({
    supabase: {
        from: (...args) => mockFrom(...args),
        storage: {
            from: (...args) => mockStorageFrom(...args),
        },
    },
}));

const request = require('supertest');
const app = require('../../src/app');

const authHeader = { Authorization: 'Bearer test-token' };

describe('Documents API', () => {
    beforeEach(() => {
        mockFrom.mockReset();
    });

    it('GET /api/documents returns 401 without auth', async () => {
        const res = await request(app).get('/api/documents');
        expect(res.status).toBe(401);
    });

    it('POST /api/documents returns 400 for invalid type', async () => {
        const res = await request(app)
            .post('/api/documents')
            .set(authHeader)
            .send({ name: 'My doc', type: 'invalid_type' });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Validation Error');
    });

    it('GET /api/documents returns list for authenticated user', async () => {
        const documents = [
            {
                id: 'doc-1',
                user_id: TEST_AUTH.internalUserId,
                name: 'Resume',
                type: 'resume',
                is_external: true,
                opportunity_documents: [],
            },
        ];

        mockFrom.mockReturnValue(
            createChain({ data: documents, error: null })
        );

        const res = await request(app).get('/api/documents').set(authHeader);

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].name).toBe('Resume');
    });

    it('POST /api/documents creates external link document', async () => {
        mockFrom
            .mockReturnValueOnce(createCountChain(0, null))
            .mockReturnValueOnce(
                createChain({
                    data: {
                        id: 'doc-2',
                        name: 'Portfolio',
                        type: 'portfolio',
                        user_id: TEST_AUTH.internalUserId,
                    },
                    error: null,
                })
            );

        const res = await request(app)
            .post('/api/documents')
            .set(authHeader)
            .send({
                name: 'Portfolio',
                type: 'portfolio',
                file_url: 'https://example.com/portfolio',
            });

        expect(res.status).toBe(201);
        expect(res.body.name).toBe('Portfolio');
    });
});
