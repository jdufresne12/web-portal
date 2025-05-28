// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/login'];
const alwaysAccessiblePaths = [
    '/_next',
    '/api/auth',
    '/favicon.ico',
];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip middleware for always accessible paths
    if (alwaysAccessiblePaths.some(path => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    // Check BOTH authentication cookies for maximum reliability
    const hasAxiosToken = request.cookies.has('axisToken');
    const isAuthCookie = request.cookies.get('isAuthenticated')?.value === 'true';
    const isAuthenticated = hasAxiosToken && isAuthCookie;

    const isPublicPath = publicPaths.some(path =>
        pathname === path || pathname.startsWith(`${path}/`)
    );

    // Redirect unauthenticated users to login
    if (!isAuthenticated && !isPublicPath) {
        const url = new URL('/login', request.url);
        if (pathname !== '/') {
            url.searchParams.set('returnUrl', pathname);
        }
        return NextResponse.redirect(url);
    }

    // Redirect authenticated users away from login page
    if (isAuthenticated && isPublicPath) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|_next/script|favicon.ico).*)'],
};