import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/app/lib/prisma';

export async function POST(req: NextApiRequest, res: NextApiResponse) {
    const { userId, imageUrl } = req.body;

    if (!userId || !imageUrl) {
        return res.status(400).json({ error: 'UserId and imageUrl are required' });
    }

    try {
        const newUser = await prisma.user.create({
            data: {
                userId,
                imageUrl,
            },
        });
        res.status(200).json(newUser);
    } catch (error) {
        res.status(500).json({ error: 'User registration failed' });
    }
}