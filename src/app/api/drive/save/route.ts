import { NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeader } from '@/lib/jwt';
import { saveSession } from '@/lib/googleDrive';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const token = getTokenFromHeader(request);
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const payload = verifyToken(token);
    const { date, session } = await request.json();

    if (!date || !session) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    const fileId = await saveSession(payload.userId, date, session);
    return NextResponse.json({ fileId });
  } catch (error: any) {
    console.error('Drive save error:', error);
    if (error.message === 'Google Drive no conectado') {
      return NextResponse.json({ error: 'Google Drive no conectado' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error al guardar en Drive' }, { status: 500 });
  }
}
