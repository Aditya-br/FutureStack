const { createChain } = require('../mocks/supabase');
const { mockRequireAuth, TEST_AUTH } = require('../mocks/auth');

jest.mock('../../src/middleware/auth', () => ({
    requireAuth: (...args) => mockRequireAuth(...args),
}));

const mockFrom = jest.fn();
jest.mock('../../src/lib/supabase', () => ({
    supabase: {
        from: (...args) => mockFrom(...args),
    },
}));

const request = require('supertest');
const app = require('../../src/app');

const authHeader = { Authorization: 'Bearer test-token' };

describe('Opportunities API', () => {
    beforeEach(() => {
        mockFrom.mockReset();
    });

    it('GET /api/opportunities returns 401 without auth', async () => {
        const res = await request(app).get('/api/opportunities');
        expect(res.status).toBe(401);
    });

    it('POST /api/opportunities returns 400 for invalid body', async () => {
        const res = await request(app)
            .post('/api/opportunities')
            .set(authHeader)
            .send({ title: '' });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Validation Error');
        expect(res.body.details).toEqual(
            expect.arrayContaining([expect.objectContaining({ field: 'title' })])
        );
    });

    it('POST /api/opportunities creates opportunity when valid', async () => {
        const created = {
            id: 'opp-1',
            user_id: TEST_AUTH.internalUserId,
            title: 'Backend Intern',
            status: 'applied',
            category: 'internship',
        };

        mockFrom.mockReturnValue(
            createChain({ data: created, error: null })
        );

        const res = await request(app)
            .post('/api/opportunities')
            .set(authHeader)
            .send({
                title: 'Backend Intern',
                category: 'internship',
                link: 'https://example.com/jobs/1',
            });

        expect(res.status).toBe(201);
        expect(res.body.title).toBe('Backend Intern');
        expect(mockFrom).toHaveBeenCalledWith('opportunities');
    });

    it('PATCH /api/opportunities/:id returns 404 when not found', async () => {
        mockFrom.mockReturnValue(
            createChain({ data: null, error: { code: 'PGRST116', message: 'not found' } })
        );

        const res = await request(app)
            .patch('/api/opportunities/00000000-0000-4000-8000-000000000099')
            .set(authHeader)
            .send({ status: 'rejected' });

        expect(res.status).toBe(404);
        expect(res.body.error).toBe('Opportunity not found');
    });
});
