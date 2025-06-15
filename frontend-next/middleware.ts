
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Middleware runs on the Edge Runtime
export function middleware(request: NextRequest) {
    // Currently no server-side auth checks
    // All auth is handled client-side with localStorage
    return NextResponse.next()
}

// Configure which routes the middleware runs on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}