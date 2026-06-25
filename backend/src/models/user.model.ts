import { prisma } from '../prisma.js';
import { Prisma } from '@prisma/client';
import type { User } from '@prisma/client';

export type CreateUserInput = Prisma.UserCreateInput;


export function findUserByEmail(email: string): Promise<User | null>  {
    return prisma.user.findUnique({ where: { email } });
}

export function findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
}

export function createUser(data: CreateUserInput) {
    return prisma.user.create({ data });
}
