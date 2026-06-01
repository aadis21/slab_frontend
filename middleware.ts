import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedUserPaths = [
  '/dashboard',
  '/plans',
  '/confirm',
  '/referral',
];

const protectedAdminPaths = [
  '/admin',
];

const authPaths = ['/login', '/register'];

// Decode JWT payload in Next.js edge runtime
function getJwtPayload(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = atob(base64);
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookie or Authorization header
  const token =
    request.cookies.get('token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  const isUserProtected = protectedUserPaths.some((p) => pathname.startsWith(p));
  const isAdminProtected = protectedAdminPaths.some((p) => pathname.startsWith(p));
  const isAuth = authPaths.some((p) => pathname.startsWith(p));

  // 1. If trying to access any protected path (user or admin) and no token exists
  if ((isUserProtected || isAdminProtected) && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. If token exists, decode payload for role checks
  if (token) {
    const payload = getJwtPayload(token);
    const role = payload?.role;

    // Redirect authenticated users away from login/register pages
    if (isAuth) {
      if (role === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      } else {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // Redirect non-admin users trying to access admin paths
    if (isAdminProtected && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/plans/:path*',
    '/confirm/:path*',
    '/referral/:path*',
    '/admin/:path*',
    '/login',
    '/register',
  ],
};
