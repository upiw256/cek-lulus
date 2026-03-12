import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Di proxy.ts, fungsi utamanya harus bernama 'proxy' atau di-export default
export default function proxy(request: NextRequest) {
  const token = request.cookies.get('admin_token');

  if (request.nextUrl.pathname.startsWith('/admin') && !token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next();
}

// Konfigurasi tetap sama
export const config = {
  matcher: '/admin/:path*',
}