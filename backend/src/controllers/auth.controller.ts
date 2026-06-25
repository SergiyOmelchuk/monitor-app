import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { createUser, findUserByEmail, findUserById, type CreateUserInput } from '../models/user.model.js';
import type { AuthRequest } from '../middlewares/authenticate.js';
import { generateAccessToken, generateTokens, verifyRefreshToken, getTokenExpiry } from '../config/jwt.js';
import {
    saveRefreshToken,
    findRefreshToken,
    deleteRefreshToken,
} from '../models/refreshToken.model.js';

const SALT_ROUNDS = 10;

export async function register(req: Request, res: Response) {
    const { email, password, name } = req.body as {
        email: string;
        password: string;
        name?: string;
    };

    const existing = await findUserByEmail(email);
    if (existing) {
        return res.status(409).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const data: CreateUserInput = { email, password: hashedPassword };
    if (typeof name === 'string' && name.length > 0) {
        data.name = name;
    }

    const user = await createUser(data);

    const tokens = generateTokens({ sub: user.id, email: user.email });
    await saveRefreshToken(tokens.refreshToken, user.id, getTokenExpiry(tokens.refreshToken));

    return res.status(201).json({
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
        },
        tokens,
    });
}

export async function login(req: Request, res: Response) {
    const { email, password } = req.body as {
        email: string;
        password: string;
    };

    const user = await findUserByEmail(email);
    if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const tokens = generateTokens({ sub: user.id, email: user.email });
    await saveRefreshToken(tokens.refreshToken, user.id, getTokenExpiry(tokens.refreshToken));

    return res.status(200).json({
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
        },
        tokens,
    });
}

export async function refresh(req: Request, res: Response) {
    const { refreshToken } = req.body as { refreshToken: string };

    let payload;
    try {
        payload = verifyRefreshToken(refreshToken);
    } catch {
        return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    // The token must still be active in the DB (not logged out / revoked).
    const stored = await findRefreshToken(refreshToken);
    if (!stored) {
        return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    const user = await findUserByEmail(payload.email);
    if (!user) {
        return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    const accessToken = generateAccessToken({ sub: user.id, email: user.email });

    return res.status(200).json({ accessToken });
}

export async function logout(req: Request, res: Response) {
    const { refreshToken } = req.body as { refreshToken: string };

    await deleteRefreshToken(refreshToken);

    return res.status(200).json({ message: 'Logged out successfully' });
}

export async function me(req: Request, res: Response) {
    const auth = (req as AuthRequest).user;
    if (!auth) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await findUserById(auth.sub);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt,
        },
    });
}
