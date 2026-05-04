'use server';

import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { normaliseFirestoreData } from '@/lib/firestore-normaliser';
import type { QuoteRequestWithId } from '@/lib/types';
import { revalidatePath } from 'next/cache';

/**
 * Fetches a quote request for confirmation, ensuring data is normalized.
 */
export async function getQuoteForConfirmation(
    quoteId: string,
    customerId: string
): Promise<{ success: true; data: QuoteRequestWithId } | { success: false; error: string }> {
    try {
        const adminFirestore = getAdminFirestore();
        const docRef = adminFirestore
            .collection('customers')
            .doc(customerId)
            .collection('quoteRequests')
            .doc(quoteId);
            
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return { success: false, error: 'Quote not found.' };
        }

        const data = docSnap.data();
        if (!data) return { success: false, error: 'No data found.' };

        // Normalize the data using our utility to handle Timestamps and complex types
        const quote = {
            id: docSnap.id,
            ...normaliseFirestoreData(data),
        } as QuoteRequestWithId;

        return { success: true, data: quote };
    } catch (error: any) {
        console.error('Error fetching quote for confirmation:', error);
        return { success: false, error: 'An unexpected error occurred.' };
    }
}

/**
 * Updates the delivery confirmation timestamp for a quote.
 */
export async function confirmDelivery(
    quoteId: string,
    customerId: string
): Promise<{ success: true } | { success: false; error: string }> {
    try {
        const adminFirestore = getAdminFirestore();
        const docRef = adminFirestore
            .collection('customers')
            .doc(customerId)
            .collection('quoteRequests')
            .doc(quoteId);

        // Using server-side FieldValue for accurate record keeping
        await docRef.update({
            deliveryConfirmationTimestamp: FieldValue.serverTimestamp(),
        });

        revalidatePath('/admin');
        revalidatePath(`/confirm-delivery/${quoteId}`);

        return { success: true };
    } catch (error: any) {
        console.error('Error confirming delivery:', error);
        return { success: false, error: 'Failed to confirm delivery.' };
    }
}
