import { NextResponse, NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { exchangeCode, saveTokens } from '@/lib/googleDrive';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code');
    const state = request.nextUrl.searchParams.get('state'); // Contains JWT token

    if (!code || !state) {
      return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 });
    }

    // Verify the state token (which is the user's JWT)
    let payload;
    try {
      payload = verifyToken(state);
    } catch {
      return NextResponse.redirect(new URL('/login?error=google_session_expired', request.url));
    }

    const tokens = await exchangeCode(code);
    await saveTokens(payload.userId, tokens);

    // Redirect back to main app
    return NextResponse.redirect(new URL('/?drive=connected', request.url));
  } catch (error) {
    console.error('Drive callback error:', error);
    return NextResponse.redirect(new URL('/?drive=error', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
  }
}
