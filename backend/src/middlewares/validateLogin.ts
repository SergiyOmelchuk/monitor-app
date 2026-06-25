import type { Request, Response, NextFunction } from 'express';

export function validateLogin(req: Request, res: Response, next: NextFunction) {
    const { email, password } = req.body ?? {};

    if (typeof email !== 'string' || email.length === 0) {
        return res.status(400).json({ message: 'Email is required' });
    }

    if (typeof password !== 'string' || password.length === 0) {
        return res.status(400).json({ message: 'Password is required' });
    }

    return next();
}
