
'use server';

import { revalidatePath } from 'next/cache';
import { getAdminAuth } from '@/lib/firebase-admin';

/**
 * A server action to grant admin privileges to a specific user UID.
 * This is intended for initial setup.
 */
export async function makeMeAdmin(uid: string) {
  try {
    if (!uid) {
        return { success: false, error: 'A user UID must be provided.' };
    }
    
    const adminAuth = getAdminAuth();
    console.log(`Attempting to grant admin role to UID: ${uid}`);

    const user = await adminAuth.getUser(uid);
    
    if (user.customClaims && user.customClaims.admin === true) {
      console.log(`User with UID ${uid} is already an admin.`);
      return { success: true, message: 'User is already an admin.' };
    }

    await adminAuth.setCustomUserClaims(user.uid, { admin: true });
    
    console.log(`Successfully granted admin role to UID ${user.uid}.`);
    
    // Revalidate paths to ensure UI updates after claim is set.
    revalidatePath('/', 'layout');

    return { success: true, message: `Admin role granted to UID ${user.uid}. Please sign out and sign back in.` };
  } catch (error: any) {
    console.error('Error in makeMeAdmin action:', error);
    const errorMessage = error.code === 'auth/user-not-found' 
      ? `User with UID '${uid}' not found in Firebase.`
      : error.message;
      
    return { success: false, error: `Failed to grant admin role: ${errorMessage}` };
  }
}
