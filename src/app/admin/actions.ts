'use server';

import { FieldValue } from 'firebase-admin/firestore';

import { getAdminAuth, getAdminFirestore } from '@/lib/firebase-admin';
import { normaliseFirestoreData } from '@/lib/firestore-normaliser';

import type {
  QuoteRequestWithId,
  ContactMessageWithId,
  InventoryItem,
  InventoryActivityWithId
} from '@/lib/types';

import { revalidatePath } from 'next/cache';
import { sendTransactionalEmail } from '@/lib/email-service';

async function verifyAdmin(idToken: string) {
    const adminAuth = getAdminAuth();

    const decodedToken = await adminAuth.verifyIdToken(idToken);

    if (decodedToken.admin !== true) {
        throw new Error('Access Denied: User is not an admin.');
    }

    return decodedToken;
}

/**
 * Get all quote requests
 */
export async function getAdminQuoteRequests(
    idToken: string
): Promise<
    { success: true; data: QuoteRequestWithId[] } |
    { success: false; error: string }
> {
    try {
        await verifyAdmin(idToken);

        const adminFirestore = getAdminFirestore();

        const quoteRequestsSnapshot =
            await adminFirestore.collectionGroup('quoteRequests').get();

        const quoteRequests = quoteRequestsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...normaliseFirestoreData(doc.data()),
        })) as QuoteRequestWithId[];

        return {
            success: true,
            data: quoteRequests,
        };

    } catch (error: unknown) {
        console.error('Error fetching admin quote requests:', error);

        const message =
            error instanceof Error
                ? error.message
                : 'An unknown error occurred.';

        return {
            success: false,
            error: message,
        };
    }
}

/**
 * Update quote status
 */
export async function updateQuoteStatus(
    idToken: string,
    {
        customerId,
        quoteId,
        status
    }: {
        customerId: string;
        quoteId: string;
        status: QuoteRequestWithId['status'];
    }
): Promise<
    { success: true } |
    { success: false; error: string }
> {
    try {
        await verifyAdmin(idToken);

        const adminFirestore = getAdminFirestore();

        const docRef = adminFirestore
            .collection('customers')
            .doc(customerId)
            .collection('quoteRequests')
            .doc(quoteId);

        /**
         * Send approval email
         */
        if (status === 'Approved') {
            const quoteSnap = await docRef.get();

            if (quoteSnap.exists) {
                const quoteData = {
                    id: quoteId,
                    ...normaliseFirestoreData(quoteSnap.data())
                } as QuoteRequestWithId;

                if (quoteData.customerEmail) {
                    await sendTransactionalEmail({
                        to: [
                            {
                                email: quoteData.customerEmail,
                                name: quoteData.customerName || 'Customer'
                            }
                        ],
                        subject: 'Your StakIt Hire Quote has been Approved!',
                        templateId: 1,
                        params: {
                            customerName:
                                quoteData.customerName || 'Customer',
                            quoteId,
                            paymentUrl:
                                `${process.env.NEXT_PUBLIC_URL}/tracking`
                        }
                    });
                }
            }
        }

        await docRef.update({
            status
        });

        revalidatePath('/admin');
        revalidatePath('/tracking');

        return {
            success: true,
        };

    } catch (error: unknown) {
        console.error(
            `Error updating quote status for ${quoteId}:`,
            error
        );

        const message =
            error instanceof Error
                ? error.message
                : 'An unknown error occurred.';

        return {
            success: false,
            error: message,
        };
    }
}

/**
 * Update quote details
 */
export async function updateQuoteDetails(
    idToken: string,
    {
        customerId,
        quoteId,
        data
    }: {
        customerId: string;
        quoteId: string;
        data: Partial<QuoteRequestWithId>;
    }
): Promise<
    { success: true } |
    { success: false; error: string }
> {
    try {
        await verifyAdmin(idToken);

        const adminFirestore = getAdminFirestore();

        const docRef = adminFirestore
            .collection('customers')
            .doc(customerId)
            .collection('quoteRequests')
            .doc(quoteId);

        await docRef.set(data, { merge: true });

        revalidatePath('/admin');
        revalidatePath('/tracking');

        return {
            success: true,
        };

    } catch (error: unknown) {
        console.error(
            `Error updating quote details for ${quoteId}:`,
            error
        );

        const message =
            error instanceof Error
                ? error.message
                : 'An unknown error occurred.';

        return {
            success: false,
            error: message,
        };
    }
}

/**
 * Get contact messages
 */
export async function getContactMessages(
    idToken: string
): Promise<
    { success: true; data: ContactMessageWithId[] } |
    { success: false; error: string }
> {
    try {
        await verifyAdmin(idToken);

        const adminFirestore = getAdminFirestore();

        const messagesSnapshot = await adminFirestore
            .collection('contactMessages')
            .orderBy('submittedDate', 'desc')
            .get();

        const messages = messagesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...normaliseFirestoreData(doc.data()),
        })) as ContactMessageWithId[];

        return {
            success: true,
            data: messages,
        };

    } catch (error: unknown) {
        console.error('Error fetching contact messages:', error);

        const message =
            error instanceof Error
                ? error.message
                : 'An unknown error occurred.';

        return {
            success: false,
            error: message,
        };
    }
}

/**
 * Update message status
 */
export async function updateMessageStatus(
    idToken: string,
    {
        messageId,
        status
    }: {
        messageId: string;
        status: ContactMessageWithId['status'];
    }
): Promise<
    { success: true } |
    { success: false; error: string }
> {
    try {
        await verifyAdmin(idToken);

        const adminFirestore = getAdminFirestore();

        const docRef = adminFirestore
            .collection('contactMessages')
            .doc(messageId);

        await docRef.update({
            status
        });

        revalidatePath('/admin');

        return {
            success: true,
        };

    } catch (error: unknown) {
        console.error(
            `Error updating message status for ${messageId}:`,
            error
        );

        const message =
            error instanceof Error
                ? error.message
                : 'An unknown error occurred.';

        return {
            success: false,
            error: message,
        };
    }
}

/**
 * Get inventory
 */
export async function getInventory(
    idToken: string
): Promise<
    { success: true; data: InventoryItem[] } |
    { success: false; error: string }
> {
    try {
        await verifyAdmin(idToken);

        const adminFirestore = getAdminFirestore();

        const inventorySnapshot =
            await adminFirestore.collection('inventory').get();

        const inventory = inventorySnapshot.docs.map(doc => ({
            id: doc.id,
            ...normaliseFirestoreData(doc.data()),
        })) as InventoryItem[];

        return {
            success: true,
            data: inventory,
        };

    } catch (error: unknown) {
        console.error('Error fetching inventory:', error);

        const message =
            error instanceof Error
                ? error.message
                : 'An unknown error occurred.';

        return {
            success: false,
            error: message,
        };
    }
}

/**
 * Update inventory item
 */
export async function setInventoryItem(
    idToken: string,
    {
        itemId,
        data
    }: {
        itemId: string;
        data: Partial<InventoryItem>;
    }
): Promise<
    { success: true } |
    { success: false; error: string }
> {
    try {
        await verifyAdmin(idToken);

        const adminFirestore = getAdminFirestore();

        const docRef = adminFirestore
            .collection('inventory')
            .doc(itemId);

        await docRef.set(data, { merge: true });

        revalidatePath('/admin');

        return {
            success: true,
        };

    } catch (error: unknown) {
        console.error(
            `Error updating inventory for ${itemId}:`,
            error
        );

        const message =
            error instanceof Error
                ? error.message
                : 'An unknown error occurred.';

        return {
            success: false,
            error: message,
        };
    }
}

/**
 * Get inventory activity
 */
export async function getInventoryActivity(
    idToken: string
): Promise<
    { success: true; data: InventoryActivityWithId[] } |
    { success: false; error: string }
> {
    try {
        await verifyAdmin(idToken);

        const adminFirestore = getAdminFirestore();

        const activitySnapshot = await adminFirestore
            .collection('inventoryActivity')
            .orderBy('date', 'desc')
            .get();

        const activities = activitySnapshot.docs.map(doc => ({
            id: doc.id,
            ...normaliseFirestoreData(doc.data()),
        })) as InventoryActivityWithId[];

        return {
            success: true,
            data: activities,
        };

    } catch (error: unknown) {
        console.error('Error fetching inventory activity:', error);

        const message =
            error instanceof Error
                ? error.message
                : 'An unknown error occurred.';

        return {
            success: false,
            error: message,
        };
    }
}

/**
 * Log crate retirement
 */
export async function logCrateRetirement(
    idToken: string,
    {
        quantity,
        notes
    }: {
        quantity: number;
        notes?: string;
    }
): Promise<
    { success: true } |
    { success: false; error: string }
> {
    try {
        const decodedToken = await verifyAdmin(idToken);

        const adminFirestore = getAdminFirestore();

        if (quantity <= 0) {
            return {
                success: false,
                error: 'Retirement quantity must be positive.',
            };
        }

        await adminFirestore.runTransaction(async (transaction) => {

            const inventoryRef =
                adminFirestore.collection('inventory').doc('crates');

            const inventoryDoc =
                await transaction.get(inventoryRef);

            if (!inventoryDoc.exists) {
                throw new Error('Crate inventory item not found.');
            }

            const currentQuantity =
                inventoryDoc.data()?.quantity || 0;

            const newQuantity =
                currentQuantity - quantity;

            if (newQuantity < 0) {
                throw new Error(
                    `Cannot retire ${quantity} crates. Only ${currentQuantity} are in stock.`
                );
            }

            /**
             * Update inventory
             */
            transaction.update(inventoryRef, {
                quantity: newQuantity,
            });

            /**
             * Create activity log
             */
            const activityRef =
                adminFirestore.collection('inventoryActivity').doc();

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

        return {
            success: true,
        };

    } catch (error: unknown) {
        console.error('Error retiring crates:', error);

        const message =
            error instanceof Error
                ? error.message
                : 'An unknown error occurred.';

        return {
            success: false,
            error: message,
        };
    }
}
