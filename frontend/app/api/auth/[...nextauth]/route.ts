import NextAuth, { NextAuthOptions } from "next-auth";
import prisma from '@/app/lib/prisma';
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import AppleProvider from "next-auth/providers/apple";
import FacebookProvider from "next-auth/providers/facebook";
import { cookies } from "next/headers";

import { Session } from "next-auth";
import { createUser } from "@/app/service/createUser";

export const authOptions: NextAuthOptions = {
    debug: false,
    pages: {
        signIn: '/auth/login',
        error: '/auth/login',
    },
    session: { strategy: "jwt" },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (!user || !user.email) return false;
            if (!account) return false;

            const existingUser = await prisma.user.findUnique({
                where: { email: user.email },
            });
            if (existingUser) {
                user.id = existingUser.id as unknown as string;
            } else {
                const newUser = await createUser(user, account);
                user.id = newUser?.id as unknown as string;
            }
            return true;
        },
        async redirect({ url, baseUrl }) {
            return baseUrl
        },
        async jwt({ token, user }) {
            // console.log("jwt:", token, user)
            if (user) {
                token.id = user.id;
            }
            return { ...token, ...user }
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
            }
            // console.log("session user:", session)
            return session;
        },
    }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }