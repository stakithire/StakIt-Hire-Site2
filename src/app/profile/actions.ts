
'use server';

import { revalidatePath } from 'next/cache';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase-admin';

async function verifyUser(idToken: string) {
    const adminAuth = getAdminAuth();
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return decodedToken.uid;
}

interface ProfileData {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
}

export async function updateCustomerProfile(
    idToken: string,
    profileData: ProfileData
): Promise<{ success: true } | { success: false; error: string }> {
     try {
        const userUid = await verifyUser(idToken);
        const adminFirestore = getAdminFirestore();
        const customerRef = adminFirestore.collection('customers').doc(userUid);
        
        // Prepare data for update, removing any undefined fields
        const dataToUpdate: { [key: string]: any } = {};
        if (profileData.firstName !== undefined) dataToUpdate.firstName = profileData.firstName;
        if (profileData.lastName !== undefined) dataToUpdate.lastName = profileData.lastName;
        if (profileData.phone !== undefined) dataToUpdate.phone = profileData.phone;
        if (profileData.address !== undefined) dataToUpdate.address = profileData.address;

        if (Object.keys(dataToUpdate).length === 0) {
            return { success: true }; // Nothing to update
        }

        // Use set with merge:true to create or update the document
        await customerRef.set(dataToUpdate, { merge: true });

        // Revalidate the profile page to show fresh data
        revalidatePath('/profile');
        
        return { success: true };

     } catch (error: any) {
        console.error(`Error updating profile for user ${idToken.substring(0,10)}...:`, error);
        return { success: false, error: error.message || 'An unknown error occurred while updating the profile.' };
     }
}
