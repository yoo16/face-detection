import { NextRequest, NextResponse } from 'next/server';
import { loadModels, recognizeFace } from '@/app/service/FaceService';
import { userIdList } from '@/app/service/UserService';

// 顔認証処理を行うAPIエンドポイント
export async function POST(req: NextRequest) {
    try {
        await loadModels();

        const userIds = await userIdList();
        if (!userIds) {
            return NextResponse.json({ error: 'No user IDs found' });
        }

        const formData = await req.formData();
        try {
            const bestMatch = await recognizeFace(formData, userIds);
            return NextResponse.json(bestMatch);
        } catch (error) {
            return NextResponse.json({ error: "cannot authorization" });
        }
    } catch (error) {
        console.error('Error processing face verification:', error);
        return NextResponse.json({ error: 'Internal Server Error' });
    }
}