import { NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeader } from '@/lib/jwt';
import { listSessions } from '@/lib/googleDrive';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const token = getTokenFromHeader(request);
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const payload = verifyToken(token);
    const files = await listSessions(payload.userId);
    return NextResponse.json({ files });
  } catch (error: any) {
    console.error('Drive list error:', error);
    if (error.message === 'Google Drive no conectado') {
      return NextResponse.json({ error: 'Google Drive no conectado' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error al listar sesiones' }, { status: 500 });
  }
}
