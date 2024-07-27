import { PrismaClient } from '@prisma/client';
import { User } from 'next-auth';

const prisma = new PrismaClient();

export const userList = async () => {
    const users = await prisma.user.findMany();
    return users;
}

export const userIdList = async () => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
            }
        });
        if (!users) return [];
        const userIds = users.map(user => user.id);
        return userIds;
    } catch (error) {
        return [];
    }
}

export const findUser = async (userId: number) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });
    return user;
}

export const findUserByEmail = async (email: string) => {
    const user = await prisma.user.findUnique({
        where: { email: email },
    });
    return user;
}

export const createUser = async (user: User, account: Account) => {
    if (!user.email) return;
    try {
        const newUser = await prisma.user.create({
            data: {
                name: user.name,
                email: user.email,
                image: user.image,
                createdAt: new Date(),
                updatedAt: new Date(),
                accounts: {
                    create: {
                        provider: account.provider,
                        providerAccountId: account.providerAccountId,
                        refreshToken: account.refresh_token ?? undefined,
                        accessToken: account.access_token ?? undefined,
                        accessTokenExpires: account.expires_at ? new Date(account.expires_at * 1000) : undefined,
                    },
                },
            },
        });
        return newUser;
    } catch (error) {

    }
};
