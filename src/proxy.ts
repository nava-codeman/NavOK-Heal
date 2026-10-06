import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Protect all /admin routes
  if (path.startsWith('/admin')) {
    const roleCookie = request.cookies.get('navok-role');
    
    // If there is no cookie or the role is not 'admin', redirect to login
    if (!roleCookie || roleCookie.value !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
