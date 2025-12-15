import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/counselor-dashboard(.*)',
  '/verify-counselor(.*)',
]);

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sign-up-counselor(.*)',
  '/api/webhooks(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();
  const path = req.nextUrl.pathname;

  // 1. Handle Public Routes & Non-User Access
  if (isPublicRoute(req)) {
    // If user is logged in and trying to access auth pages, redirect them to their home base
    if (userId && (path.startsWith('/sign-in') || path.startsWith('/sign-up') || path === '/')) {
      const role = (sessionClaims?.metadata as any)?.role || 'student';
      if (role === 'counselor') return NextResponse.redirect(new URL('/counselor-dashboard', req.url));
      if (role === 'applicant') return NextResponse.redirect(new URL('/verify-counselor', req.url));
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  // 2. Protect Private Routes
  if (!userId && isProtectedRoute(req)) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // 3. Strict Role-Based Routing (The Security Matrix)
  if (userId) {
    const roleRaw = (sessionClaims?.metadata as any)?.role as string | undefined;
    const role = roleRaw ?? 'student'; // Default to student if undefined

    // --- Role: APPLICANT ---
    if (role === 'applicant') {
      // Allowed: /verify-counselor
      // Blocked: Everything else protected
      if (path.startsWith('/dashboard') || path.startsWith('/counselor-dashboard')) {
        return NextResponse.redirect(new URL('/verify-counselor', req.url));
      }
    }

    // --- Role: COUNSELOR ---
    if (role === 'counselor') {
      // Allowed: /counselor-dashboard
      // Blocked: /dashboard (Student area), /verify-counselor (Already verified)
      if (path.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/counselor-dashboard', req.url));
      }
      if (path.startsWith('/verify-counselor')) {
        return NextResponse.redirect(new URL('/counselor-dashboard', req.url));
      }
    }

    // --- Role: STUDENT ---
    if (role === 'student') {
      // Allowed: /dashboard
      // Blocked: /counselor-dashboard, /verify-counselor
      if (path.startsWith('/counselor-dashboard')) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      if (path.startsWith('/verify-counselor')) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
