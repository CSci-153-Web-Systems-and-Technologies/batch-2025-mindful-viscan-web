import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();
  const path = req.nextUrl.pathname;

  const roleRaw = (sessionClaims?.metadata as any)?.role as string | undefined;
  const counselorStatus = (sessionClaims?.metadata as any)?.counselor_status;
  const role = roleRaw ?? 'student';
  const hasRole = Boolean(roleRaw);
  const isCounselor = role === 'counselor';
  const isApplicant = role === 'applicant' || counselorStatus === 'pending';
  const isStudent = role === 'student';

  const targetForRole = () => {
    if (isCounselor) return '/counselor-dashboard';
    if (isApplicant) return '/verify-counselor';
    return '/dashboard';
  };

  const requiresAuth = ['/dashboard', '/counselor-dashboard', '/verify-counselor'].some((p) =>
    path.startsWith(p)
  );

  // If signed in and hitting public/auth pages, redirect to role-based destination
  const publicOrAuth = ['/', '/sign-in', '/sign-up', '/sign-up-counselor'];
  if (userId && publicOrAuth.includes(path)) {
    return NextResponse.redirect(new URL(targetForRole(), req.url));
  }

  if (!userId && requiresAuth) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // Student dashboard: block counselors/applicants
  if (path.startsWith('/dashboard')) {
    if (isCounselor) {
      return NextResponse.redirect(new URL('/counselor-dashboard', req.url));
    }
    if (isApplicant) {
      return NextResponse.redirect(new URL('/verify-counselor', req.url));
    }
  }

  // Counselor dashboard: allow counselors; applicants -> verify; students -> student dashboard
  if (path.startsWith('/counselor-dashboard')) {
    if (isCounselor) return NextResponse.next();
    if (isApplicant) {
      return NextResponse.redirect(new URL('/verify-counselor', req.url));
    }
    if (isStudent) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // Verify page: only applicants/counselors
  if (path.startsWith('/verify-counselor')) {
    if (isCounselor) {
      return NextResponse.redirect(new URL('/counselor-dashboard', req.url));
    }
    // Allow if applicant/pending, or if no role yet (so page can set role to applicant)
    if (isApplicant || !hasRole) return NextResponse.next();
    if (isStudent) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return redirectToSignIn({ returnBackUrl: req.url });
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
