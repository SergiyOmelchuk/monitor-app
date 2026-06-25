import type { Request, Response, NextFunction } from 'express';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegister(req: Request, res: Response, next: NextFunction) {
    const { email, password } = req.body ?? {};

    if (typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
        return res.status(400).json({ message: 'Valid email is required' });
    }

    if (typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    return next();
}
