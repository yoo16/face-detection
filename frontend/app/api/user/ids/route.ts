import { NextRequest, NextResponse } from 'next/server';
import { userIdList } from '@/app/service/UserService';

export async function GET() {
    try {
        const userIds = await userIdList();
        return NextResponse.json({ ids: userIds });
    } catch (error) {
        return NextResponse.json(error);
    }
}