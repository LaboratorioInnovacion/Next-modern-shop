// middleware.ts
import { auth } from './lib/auth';
import { NextResponse, NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const isProtected = request.nextUrl.pathname.startsWith('/admin');
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/(auth)/login', request.url));
  }
  try {
    // Edge Runtime no soporta process.env, usa un valor fijo o variable pública
    const secret = new TextEncoder().encode('tu_secreto_jwt');
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/(auth)/login', request.url));
    }
    return NextResponse.next();
  } catch (err) {
    return NextResponse.redirect(new URL('/(auth)/login', request.url));
  }
}

export const config = {
  matcher: ['/admin/:path*']
};


////////codigo anterior
// // middleware.ts
// import { auth } from './lib/auth';
// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// export async function middleware(request: NextRequest) {
//   const session = await auth();
//   const isProtected = request.nextUrl.pathname.startsWith('/admin');

//   if (isProtected && (!session || session.user.role !== 'ADMIN')) {
//     return NextResponse.redirect(new URL('/(auth)/login', request.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ['/admin/:path*']
// };
