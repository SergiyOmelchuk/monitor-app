import { prisma } from '../prisma.js';

export function saveRefreshToken(token: string, userId: string, expiresAt: Date | null) {
    return prisma.refreshToken.create({
        data: { token, userId, expiresAt },
    });
}

export function findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({ where: { token } });
}

export function deleteRefreshToken(token: string) {
    return prisma.refreshToken.deleteMany({ where: { token } });
}
