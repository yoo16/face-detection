import { PrismaClient } from '@prisma/client';
import { User } from 'next-auth';
import { AdapterUser } from 'next-auth/adapters';

const prisma = new PrismaClient();

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
