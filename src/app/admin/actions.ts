
'use server';

import { getFirestore, FieldValue, runTransaction } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import type { QuoteRequestWithId, ContactMessageWithId, InventoryItem, InventoryActivityWithId } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { sendTransactionalEmail } from '@/lib/email-service';
import { getAdminApp } from '@/lib/firebase-admin';

async function verifyAdmin(idToken: string) {
    const adminAuth = getAuth(getAdminApp());
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    if (decodedToken.admin !== true) {
        throw new Error('Access Denied: User is not an admin.');
    }
    return { adminFirestore: getFirestore(getAdminApp()) };
}

/**
 * A secure server action to get all quote requests.
 * It uses the Admin SDK to bypass client-side security rules.
 */
export async function getAdminQuoteRequests(
    idToken: string
): Promise<{ success: true; data: QuoteRequestWithId[] } | { success: false; error: string }> {
  try {
    const { adminFirestore } = await verifyAdmin(idToken);

    // Fetch all quote requests using the Admin SDK
    const quoteRequestsSnapshot = await adminFirestore.collectionGroup('quoteRequests').get();
    
    const quoteRequests = quoteRequestsSnapshot.docs.map(doc => {
      const data = doc.data();
      // Firestore Timestamps need to be converted to serializable format (ISO string)
      return {
        id: doc.id,
        ...data,
        submittedDate: data.submittedDate?.toDate ? data.submittedDate.toDate().toISOString() : data.submittedDate,
        rentalStartDate: data.rentalStartDate?.toDate ? data.rentalStartDate.toDate().toISOString() : data.rentalStartDate,
        rentalEndDate: data.rentalEndDate?.toDate ? data.rentalEndDate.toDate().toISOString() : data.rentalEndDate,
        deliveryConfirmationTimestamp: data.deliveryConfirmationTimestamp || null,
      } as QuoteRequestWithId;
    });

    return { success: true, data: quoteRequests };

  } catch (error: any) {
    console.error('Error fetching admin quote requests:', error);
    return { success: false, error: error.message || 'An unknown error occurred.' };
  }
}

/**
 * A secure server action to update the status of a quote.
 */
export async function updateQuoteStatus(
    idToken: string,
    { customerId, quoteId, status }: { customerId: string, quoteId: string, status: QuoteRequestWithId['status'] }
): Promise<{ success: true } | { success: false; error: string }> {
     try {
        const { adminFirestore } = await verifyAdmin(idToken);

        const docRef = adminFirestore.collection('customers').doc(customerId).collection('quoteRequests').doc(quoteId);
        
        // Before updating, check if the new status is 'Approved' to trigger the email
        if (status === 'Approved') {
            const quoteSnap = await docRef.get();
            if (quoteSnap.exists) {
                const quoteData = { id: quoteId, ...quoteSnap.data() } as QuoteRequestWithId;

                // Make sure customer has an email before trying to send one
                if (quoteData.customerEmail) {
                    await sendTransactionalEmail({
                        to: [{ email: quoteData.customerEmail, name: quoteData.customerName || 'Customer' }],
                        subject: 'Your StakIt Hire Quote has been Approved!',
                        templateId: 1, 
                        params: {
                            customerName: quoteData.customerName || 'Customer',
                            quoteId: quoteId,
                            paymentUrl: `${process.env.NEXT_PUBLIC_URL}/tracking`
                        }
                    });
                }
            }
        }
        
        // Update the document using the Admin SDK
        await docRef.update({ status: status });

        // Revalidate paths to ensure the UI updates
        revalidatePath('/admin');
        revalidatePath('/tracking');
        
        return { success: true };

     } catch (error: any) {
        console.error(`Error updating quote status for ${quoteId}:`, error);
        return { success: false, error: error.message || 'An unknown error occurred.' };
     }
}

/**
 * A secure server action to update the full details of a quote.
 */
export async function updateQuoteDetails(
    idToken: string,
    { customerId, quoteId, data }: { customerId: string, quoteId: string, data: Partial<QuoteRequestWithId> }
): Promise<{ success: true } | { success: false; error: string }> {
     try {
        const { adminFirestore } = await verifyAdmin(idToken);
        const docRef = adminFirestore.collection('customers').doc(customerId).collection('quoteRequests').doc(quoteId);

        // Update the document with the new data. `set` with `merge` overwrites fields in the data object.
        await docRef.set(data, { merge: true });

        // Revalidate paths to ensure UI updates for both admin and user.
        revalidatePath('/admin');
        revalidatePath('/tracking');
        
        return { success: true };

     } catch (error: any) {
        console.error(`Error updating quote details for ${quoteId}:`, error);
        return { success: false, error: error.message || 'An unknown error occurred.' };
     }
}

export async function getContactMessages(idToken: string): Promise<{ success: true; data: ContactMessageWithId[] } | { success: false; error: string }> {
    try {
        const { adminFirestore } = await verifyAdmin(idToken);
        const messagesSnapshot = await adminFirestore.collection('contactMessages').orderBy('submittedDate', 'desc').get();
        const messages = messagesSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                submittedDate: data.submittedDate?.toDate ? data.submittedDate.toDate().toISOString() : data.submittedDate,
            } as ContactMessageWithId;
        });
        return { success: true, data: messages };
    } catch (error: any) {
        console.error('Error fetching contact messages:', error);
        return { success: false, error: error.message || 'An unknown error occurred.' };
    }
}

export async function updateMessageStatus(
    idToken: string,
    { messageId, status }: { messageId: string, status: ContactMessageWithId['status'] }
): Promise<{ success: true } | { success: false; error: string }> {
    try {
        const { adminFirestore } = await verifyAdmin(idToken);
        const docRef = adminFirestore.collection('contactMessages').doc(messageId);
        await docRef.update({ status });
        revalidatePath('/admin');
        return { success: true };
    } catch (error: any) {
        console.error(`Error updating message status for ${messageId}:`, error);
        return { success: false, error: error.message || 'An unknown error occurred.' };
    }
}

export async function getInventory(idToken: string): Promise<{ success: true; data: InventoryItem[] } | { success: false; error: string }> {
    try {
        const { adminFirestore } = await verifyAdmin(idToken);
        const inventorySnapshot = await adminFirestore.collection('inventory').get();
        const inventory = inventorySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }) as InventoryItem);
        return { success: true, data: inventory };
    } catch (error: any) {
        console.error('Error fetching inventory:', error);
        return { success: false, error: error.message || 'An unknown error occurred.' };
    }
}

export async function setInventoryItem(
    idToken: string,
    { itemId, data }: { itemId: string, data: Partial<InventoryItem> }
): Promise<{ success: true } | { success: false; error: string }> {
    try {
        const { adminFirestore } = await verifyAdmin(idToken);
        const docRef = adminFirestore.collection('inventory').doc(itemId);
        await docRef.set(data, { merge: true });
        revalidatePath('/admin');
        return { success: true };
    } catch (error: any) {
        console.error(`Error updating inventory for ${itemId}:`, error);
        return { success: false, error: error.message || 'An unknown error occurred.' };
    }
}

export async function getInventoryActivity(idToken: string): Promise<{ success: true; data: InventoryActivityWithId[] } | { success: false; error: string }> {
    try {
        const { adminFirestore } = await verifyAdmin(idToken);
        const activitySnapshot = await adminFirestore.collection('inventoryActivity').orderBy('date', 'desc').get();
        const activities = activitySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                date: data.date?.toDate ? data.date.toDate().toISOString() : data.date,
            } as InventoryActivityWithId;
        });
        return { success: true, data: activities };
    } catch (error: any) {
        console.error('Error fetching inventory activity:', error);
        return { success: false, error: error.message || 'An unknown error occurred.' };
    }
}

export async function logCrateRetirement(
    idToken: string,
    { quantity, notes }: { quantity: number; notes?: string }
): Promise<{ success: true } | { success: false; error: string }> {
    try {
        const adminAuth = getAuth(getAdminApp());
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        if (decodedToken.admin !== true) {
            throw new Error('Access Denied: User is not an admin.');
        }

        const adminFirestore = getFirestore(getAdminApp());

        if (quantity <= 0) {
            return { success: false, error: 'Retirement quantity must be positive.' };
        }

        await runTransaction(adminFirestore, async (transaction) => {
            const inventoryRef = adminFirestore.collection('inventory').doc('crates');
            const inventoryDoc = await transaction.get(inventoryRef);

            if (!inventoryDoc.exists) {
                throw new Error('Crate inventory item not found.');
            }

            const currentQuantity = inventoryDoc.data()?.quantity || 0;
            const newQuantity = currentQuantity - quantity;

            if (newQuantity < 0) {
                throw new Error(`Cannot retire ${quantity} crates. Only ${currentQuantity} are in stock.`);
            }

            // 1. Update the inventory count
            transaction.update(inventoryRef, { quantity: newQuantity });

            // 2. Create the activity log
            const activityRef = adminFirestore.collection('inventoryActivity').doc();
            transaction.set(activityRef, {
                date: FieldValue.serverTimestamp(),
                type: 'retire',
                itemId: 'crates',
                quantity,
                notes: notes || '',
                adminId: decodedToken.uid,
            });
        });

        revalidatePath('/admin');
        return { success: true };

    } catch (error: any) {
        console.error('Error retiring crates:', error);
        return { success: false, error: error.message || 'An unknown error occurred.' };
    }
}
