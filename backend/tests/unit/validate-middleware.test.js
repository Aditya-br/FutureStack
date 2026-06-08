const Joi = require('joi');
const { validate } = require('../../src/middleware/validate');

const testSchema = Joi.object({
    title: Joi.string().trim().min(1).required(),
});

describe('validate middleware', () => {
    it('calls next and replaces body when valid', () => {
        const middleware = validate(testSchema);
        const req = { body: { title: '  Hello  ' } };
        const res = {};
        const next = jest.fn();

        middleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.body.title).toBe('Hello');
    });

    it('returns 400 with field errors when invalid', () => {
        const middleware = validate(testSchema);
        const req = { body: { title: '' } };
        const json = jest.fn();
        const res = { status: jest.fn(() => ({ json })) };
        const next = jest.fn();

        middleware(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(json).toHaveBeenCalledWith(
            expect.objectContaining({
                error: 'Validation Error',
                details: expect.arrayContaining([
                    expect.objectContaining({ field: 'title' }),
                ]),
            })
        );
    });
});
