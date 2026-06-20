import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that don't require authentication
const publicPaths = ['/login', '/register', '/api/auth/login', '/api/auth/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('gymlog_token')?.value;

  // Allow public paths
  if (publicPaths.some(p => pathname.startsWith(p))) {
    // Redirect to home if already logged in
    if (token && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Protect API routes
  if (pathname.startsWith('/api/')) {
    // Auth endpoints handle their own auth
    if (pathname.startsWith('/api/auth/')) {
      return NextResponse.next();
    }
    // Drive endpoints check auth internally via Bearer token, allow through
    if (pathname.startsWith('/api/drive/')) {
      return NextResponse.next();
    }
    return NextResponse.next();
  }

  // Protect pages - redirect to login if no token
  // We check client-side too, but middleware adds server-side protection
  if (!token && pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|manifest.json).*)'],
};
