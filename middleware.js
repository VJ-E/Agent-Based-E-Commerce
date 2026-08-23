import { NextResponse } from 'next/server';

import { verifyToken } from '@/lib/auth';

export async function middleware(request) {
  const token = request.cookies.get('bentely_auth_token')?.value;
  const path = request.nextUrl.pathname;
  
  const protectedPaths = ['/checkout', '/account'];
  const isAdminPath = path.startsWith('/admin');
  
  const isProtectedPath = protectedPaths.some(p => path.startsWith(p));
  
  if (isProtectedPath && !token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', path);
    return NextResponse.redirect(url);
  }
  
  if (isAdminPath) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/checkout/:path*', '/account/:path*', '/admin/:path*']
};
