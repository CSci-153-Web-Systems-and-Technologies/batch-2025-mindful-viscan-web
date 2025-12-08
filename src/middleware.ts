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

  const requiresAuth = ['/dashboard', '/counselor-dashboard', '/verify-counselor'].some((p) =>
    path.startsWith(p)
  );

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
    // Allow if counselor or applicant, or if no role yet (so page can set role to applicant)
    if (isCounselor || isApplicant || !hasRole) return NextResponse.next();
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
