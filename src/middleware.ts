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

  const redirect = (to: string) => NextResponse.redirect(new URL(to, req.url));

  const targetForRole = () => {
    if (isCounselor) return '/counselor-dashboard';
    if (isApplicant) return '/verify-counselor';
    return '/dashboard';
  };

  const isProtected = ['/dashboard', '/counselor-dashboard', '/verify-counselor'].some((p) =>
    path.startsWith(p)
  );

  const isPublic = [
    '/',
    '/sign-in',
    '/sign-up',
    '/sign-up-counselor',
    '/api/webhooks/clerk' // Explicitly allow webhook
  ].includes(path);

  // Signed-in users shouldn’t see public/auth pages
  if (userId && isPublic) {
    return redirect(targetForRole());
  }

  // Unauthed access to protected routes
  if (!userId && isProtected) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // Student dashboard: block counselors/applicants
  if (path.startsWith('/dashboard')) {
    if (isCounselor) return redirect('/counselor-dashboard');
    if (isApplicant) return redirect('/verify-counselor');
  }

  // Counselor dashboard: allow counselors; applicants -> verify; students -> student dashboard
  if (path.startsWith('/counselor-dashboard')) {
    if (isCounselor) return NextResponse.next();
    if (isApplicant) return redirect('/verify-counselor');
    if (isStudent) return redirect('/dashboard');
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // Verify page: only applicants/counselors (or no-role to let them get set)
  if (path.startsWith('/verify-counselor')) {
    if (isCounselor) return redirect('/counselor-dashboard');
    if (isApplicant || !hasRole) return NextResponse.next();
    if (isStudent) return redirect('/dashboard');
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
