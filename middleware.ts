import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get('side-quest')?.value;

  // Allow access to admin login page without authentication
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Protect admin routes (except login)
  if (pathname.startsWith('/admin')) {
    if (!authToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Allow authenticated users to stay on any page they want
  // No automatic redirects

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/'],
};
