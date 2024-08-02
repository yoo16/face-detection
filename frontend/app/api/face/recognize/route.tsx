import { NextRequest, NextResponse } from 'next/server';
import { loadModels, recognizeFace } from '@/app/service/FaceService';
import { userIdList } from '@/app/service/UserService';

export async function POST(req: NextRequest) {
    try {
        await loadModels();

        const userIds = await userIdList();
        if (!userIds) return NextResponse.json({ error: 'No user IDs found' });

        const formData = await req.formData();
        const imageFile = formData.get('image') as File;
        if (!imageFile) {
            return NextResponse.json({ error: 'No image file provided' });
        }

        const imageArrayBuffer = await imageFile.arrayBuffer();
        const imageBuffer = Buffer.from(imageArrayBuffer) as unknown as Blob;
        const bestMatch = await recognizeFace(imageBuffer, userIds);

        if (bestMatch) {
            return NextResponse.json(bestMatch);
        } else {
            return NextResponse.json({ error: 'No matching face found' });
        }
        return NextResponse.json({ message: 'ok' });
    } catch (error) {
        console.error('Error processing face verification:', error);
        return NextResponse.json({ error: 'Internal Server Error' });
    }
}
