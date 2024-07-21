import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: { id: string } }): NextResponse {
    try {
        // const userId = 1;
        const userId = parseInt(params.id, 10);
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json(error);
    }
}