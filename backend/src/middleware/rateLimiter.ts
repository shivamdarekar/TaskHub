import rateLimit from 'express-rate-limit';

// Rate limiter for invite-related endpoints
export const inviteLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 requests per windowMs
    message: 'Too many invite requests from this IP, please try again later.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Rate limiter for joining workspace (stricter)
export const joinWorkspaceLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 join attempts per windowMs
    message: 'Too many join attempts from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter for creating invites (owner actions)
export const createInviteLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // Limit each IP to 50 invite creations per hour
    message: 'Too many invite creations, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
