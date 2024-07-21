import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, res: NextResponse) {
    const result = { message: "api test" }
    try {
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return NextResponse.json(error, { status: 200 });
    }
}