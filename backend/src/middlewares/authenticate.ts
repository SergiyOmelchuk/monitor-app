import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, type TokenPayload } from '../config/jwt.js';

export interface AuthRequest extends Request {
    user?: TokenPayload;
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization token is required' });
    }

    const token = header.slice('Bearer '.length);

    try {
        (req as AuthRequest).user = verifyAccessToken(token);
    } catch {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }

    return next();
}
