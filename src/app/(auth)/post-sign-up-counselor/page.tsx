'use server';

import { clerkClient, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function PostSignUpCounselor() {
  const user = await currentUser();
  if (!user) {
    return redirect('/sign-in');
  }

  const client = await clerkClient();
  await client.users.updateUserMetadata(user.id, {
    publicMetadata: {
      role: 'applicant',
      counselor_status: 'pending',
    },
  });

  return redirect('/verify-counselor');
}

