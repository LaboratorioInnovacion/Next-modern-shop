// middleware.ts
import { auth } from './lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = await auth();
  const isProtected = request.nextUrl.pathname.startsWith('/admin');

  if (isProtected && (!session || session.user.role !== 'ADMIN')) {
    return NextResponse.redirect(new URL('/(auth)/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};
