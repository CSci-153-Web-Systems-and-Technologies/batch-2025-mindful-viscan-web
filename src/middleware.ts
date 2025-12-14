import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();
  const path = req.nextUrl.pathname;

  const roleRaw = (sessionClaims?.metadata as any)?.role as string | undefined;
  const role = roleRaw ?? 'student';
  const isCounselor = role === 'counselor';
  const isStudent = role === 'student';

  const redirect = (to: string) => NextResponse.redirect(new URL(to, req.url));

  const targetForRole = () => {
    if (isCounselor) return '/counselor-dashboard';
    return '/dashboard';
  };

  const isProtected = ['/dashboard', '/counselor-dashboard'].some((p) =>
    path.startsWith(p)
  );

  const authRoutes = [
    '/sign-in',
    '/sign-up',
    '/sign-up-counselor',
  ];

  const isPublic =
    path === '/' ||
    path === '/api/webhooks/clerk' ||
    authRoutes.some(p => path.startsWith(p));

  // Signed-in users shouldn’t see public/auth pages
  if (userId && isPublic) {
    return redirect(targetForRole());
  }

  // Unauthed access to protected routes
  if (!userId && isProtected) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // Student dashboard: block counselors
  if (path.startsWith('/dashboard')) {
    if (isCounselor) return redirect('/counselor-dashboard');
  }

  // Counselor dashboard: allow all counselors; students -> student dashboard
  if (path.startsWith('/counselor-dashboard')) {
    if (isCounselor) return NextResponse.next();
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
