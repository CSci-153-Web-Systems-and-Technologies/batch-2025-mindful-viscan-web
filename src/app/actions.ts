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

    // Update user metadata using clerkClient
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: 'applicant',
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

