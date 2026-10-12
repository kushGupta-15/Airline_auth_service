const { z } = require('zod');

const userAuthSchema = z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address format'),
    password: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters long')
});

const isAdminSchema = z.object({
    id: z.union([z.number(), z.string().regex(/^\d+$/)], { required_error: 'User id is required' })
});

const validateUserAuth = (req, res, next) => {
    const result = userAuthSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            success: false,
            data: {},
            message: "Validation failed",
            err: (result.error.issues || []).map(e => e.message).join(', ')
        });
    }
    next();
};

const validateIsAdminRequest = (req, res, next) => {
    const payload = (req.body && req.body.id !== undefined) ? req.body : req.query;
    const result = isAdminSchema.safeParse(payload);
    if (!result.success) {
        return res.status(400).json({
            success: false,
            data: {},
            message: "Validation failed",
            err: (result.error.issues || []).map(e => e.message).join(', ')
        });
    }
    next();
};

module.exports = {
    validateUserAuth,
    validateIsAdminRequest
};