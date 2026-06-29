import { NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeader } from '@/lib/jwt';
import { getAuthUrl } from '@/lib/googleDrive';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const token = getTokenFromHeader(request);
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    verifyToken(token);
    const url = getAuthUrl(token);
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
}
