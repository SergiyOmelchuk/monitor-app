import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { env } from './env.js';

export interface TokenPayload {
    sub: string;
    email: string;
}

export interface Tokens {
    accessToken: string;
    refreshToken: string;
}

export function generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
        expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    } as SignOptions);
}

export function generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
        expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    } as SignOptions);
}

export function generateTokens(payload: TokenPayload): Tokens {
    return {
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload),
    };
}

export function verifyAccessToken(token: string): TokenPayload {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as jwt.JwtPayload;
    return { sub: decoded.sub as string, email: decoded.email as string };
}

export function verifyRefreshToken(token: string): TokenPayload {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as jwt.JwtPayload;
    return { sub: decoded.sub as string, email: decoded.email as string };
}

export function getTokenExpiry(token: string): Date | null {
    const decoded = jwt.decode(token) as jwt.JwtPayload | null;
    return decoded?.exp ? new Date(decoded.exp * 1000) : null;
}
