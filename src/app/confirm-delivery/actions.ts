
'use server';

import { getFirestore } from 'firebase-admin/firestore';
import { getAdminApp } from '@/lib/firebase-admin';
import type { QuoteRequestWithId } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function getQuoteForConfirmation(
    quoteId: string,
    customerId: string
): Promise<{ success: true; data: QuoteRequestWithId } | { success: false; error: string }> {
    try {
        const adminFirestore = getFirestore(getAdminApp());
        const docRef = adminFirestore.collection('customers').doc(customerId).collection('quoteRequests').doc(quoteId);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return { success: false, error: 'Quote not found.' };
        }

        const data = docSnap.data();
        const quote = {
            id: docSnap.id,
            ...data,
            submittedDate: data.submittedDate?.toDate ? data.submittedDate.toDate().toISOString() : data.submittedDate,
            rentalStartDate: data.rentalStartDate?.toDate ? data.rentalStartDate.toDate().toISOString() : data.rentalStartDate,
            rentalEndDate: data.rentalEndDate?.toDate ? data.rentalEndDate.toDate().toISOString() : data.rentalEndDate,
        } as QuoteRequestWithId;

        return { success: true, data: quote };
    } catch (error: any) {
        console.error('Error fetching quote for confirmation:', error);
        return { success: false, error: 'An unexpected error occurred.' };
    }
}

export async function confirmDelivery(
    quoteId: string,
    customerId: string
): Promise<{ success: true } | { success: false; error: string }> {
    try {
        const adminFirestore = getFirestore(getAdminApp());
        const docRef = adminFirestore.collection('customers').doc(customerId).collection('quoteRequests').doc(quoteId);

        await docRef.update({
            deliveryConfirmationTimestamp: new Date().toISOString(),
        });

        revalidatePath('/admin');
        revalidatePath(`/confirm-delivery/${quoteId}`);

        return { success: true };
    } catch (error: any) {
        console.error('Error confirming delivery:', error);
        return { success: false, error: 'Failed to confirm delivery.' };
    }
}
