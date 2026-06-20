import { NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeader } from '@/lib/jwt';
import { loadSession } from '@/lib/googleDrive';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const token = getTokenFromHeader(request);
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const payload = verifyToken(token);
    const { fileId } = await request.json();

    if (!fileId) {
      return NextResponse.json({ error: 'fileId requerido' }, { status: 400 });
    }

    const session = await loadSession(payload.userId, fileId);
    return NextResponse.json({ session });
  } catch (error: any) {
    console.error('Drive load error:', error);
    if (error.message === 'Google Drive no conectado') {
      return NextResponse.json({ error: 'Google Drive no conectado' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error al cargar sesión' }, { status: 500 });
  }
}
