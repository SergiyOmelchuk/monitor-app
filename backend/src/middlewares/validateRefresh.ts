import type { Request, Response, NextFunction } from 'express';

export function validateRefresh(req: Request, res: Response, next: NextFunction) {
    const { refreshToken } = req.body ?? {};

    if (typeof refreshToken !== 'string' || refreshToken.length === 0) {
        return res.status(400).json({ message: 'refreshToken is required' });
    }

    return next();
}
