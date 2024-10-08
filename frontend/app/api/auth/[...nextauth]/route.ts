import NextAuth, { NextAuthOptions } from "next-auth";
import prisma from '@/app/lib/prisma';
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { createUser, findUser, findUserByEmail } from "@/app/service/UserService";

export const authOptions: NextAuthOptions = {
    debug: false,
    pages: {
        signIn: '/auth/login',
        error: '/auth/login',
    },
    secret: process.env.SECRET,
    session: { strategy: "jwt" },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        }),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                userId: { label: 'UserId', type: 'text' },
            },
            async authorize(credentials, req) {
                if (credentials && credentials.userId) {
                    const user = await findUser(parseInt(credentials.userId, 10));
                    if (user) {
                        const authUser = {
                            id: user.id.toString(),
                            name: user.name,
                            email: user.email,
                        }
                        return authUser;
                    }
                }
                return null;
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (!user.email) return false;
            if (!account) return false;

            console.log("User:", user)
            console.log("Account:", account)

            const existsUser = await findUserByEmail(user.email)
            console.log(existsUser)
            if (existsUser) {
                user.id = existsUser.id as unknown as string;
            } else {
                const newUser = await createUser(user, account);
                user.id = newUser?.id as unknown as string;
            }
            return true;
        },
        async redirect({ url, baseUrl }) {
            // if (url === '/auth/login') {
            //     return `${baseUrl}/register`;
            // }
            return baseUrl;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return { ...token, ...user }
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
            }
            return session;
        },
    }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }