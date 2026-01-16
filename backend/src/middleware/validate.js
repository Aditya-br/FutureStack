/**
 * Validation middleware factory
 * Creates middleware that validates request data against a Joi schema
 */
const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        const dataToValidate = req[property];

        const { error, value } = schema.validate(dataToValidate, {
            abortEarly: false, // Return all errors, not just the first one
            stripUnknown: true, // Remove unknown fields
            convert: true // Enable type coercion (e.g., string to number)
        });

        if (error) {
            // Format validation errors for user-friendly response
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                error: 'Validation Error',
                message: 'The request data is invalid',
                details: errors
            });
        }

        // Replace request data with validated and sanitized data
        req[property] = value;
        next();
    };
};

module.exports = { validate };
