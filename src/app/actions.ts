'use server';

import { auth, clerkClient } from '@clerk/nextjs/server';

export async function submitApplication(formData: FormData) {
  try {
    // Authenticate the user
    const { userId } = await auth();

    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Extract form data
    const legalName = formData.get('legalName') as string;
    const experience = formData.get('experience') as string;

    // Split name for Clerk profile
    const nameParts = legalName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    // Update user metadata and profile using clerkClient
    const client = await clerkClient();

    // 1. Update Profile (Triggers webhook to sync name to Supabase)
    await client.users.updateUser(userId, {
      firstName,
      lastName,
    });

    // 2. Update Metadata
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: 'applicant', // Demote to applicant until approved
        counselor_status: 'pending',
      },
      unsafeMetadata: {
        legalName,
        experience,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error submitting application:', error);
    throw error;
  }
}

export async function ensureApplicantMetadata() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const currentRole = (user.publicMetadata as any)?.role as string | undefined;
  const currentStatus = (user.publicMetadata as any)?.counselor_status as string | undefined;

  if (currentRole === 'applicant' || currentRole === 'counselor' || currentStatus === 'pending') {
    return { updated: false };
  }

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      role: 'applicant',
      counselor_status: 'pending',
    },
  });

  return { updated: true };
}

