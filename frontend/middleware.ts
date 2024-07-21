import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.SECRET });

    if (!token) {
        return NextResponse.redirect(new URL('/api/auth/signin', req.url));
    }
    return NextResponse.next();
}

export const config = {
    matcher: ['/test/:path*'],
};
