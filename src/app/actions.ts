
'use server';

import { getAuth } from 'firebase-admin/auth';
import { revalidatePath } from 'next/cache';
import { getAdminApp } from '@/lib/firebase-admin';

/**
 * A one-time server action to grant admin privileges to the hardcoded admin email.
 * This is intended for initial setup only.
 */
export async function makeMeAdmin() {
  try {
    const auth = getAuth(getAdminApp());

    // The one and only admin email for this app.
    const adminEmail = 'stakithire@gmail.com';
    
    console.log(`Attempting to grant admin role to: ${adminEmail}`);

    const user = await auth.getUserByEmail(adminEmail);
    
    if (user.customClaims && user.customClaims.admin === true) {
      console.log(`${adminEmail} is already an admin.`);
      return { success: true, message: 'User is already an admin.' };
    }

    await auth.setCustomUserClaims(user.uid, { admin: true });
    
    console.log(`Successfully granted admin role to ${adminEmail} (UID: ${user.uid}).`);
    
    // Revalidate paths to ensure UI updates after claim is set.
    revalidatePath('/', 'layout');

    return { success: true, message: `Admin role granted to ${adminEmail}. Please sign out and sign back in.` };
  } catch (error: any) {
    console.error('Error in makeMeAdmin action:', error);
    const errorMessage = error.code === 'auth/user-not-found' 
      ? `User with email 'stakithire@gmail.com' not found in Firebase.`
      : error.message;
      
    return { success: false, error: `Failed to grant admin role: ${errorMessage}` };
  }
}
