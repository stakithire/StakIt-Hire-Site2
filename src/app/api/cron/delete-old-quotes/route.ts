
import { NextResponse } from 'next/server';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getAdminApp } from '@/lib/firebase-admin';
import { OAuth2Client } from 'google-auth-library';

const authClient = new OAuth2Client();

// Helper function to recursively delete a collection in batches.
// This is necessary because you can't delete a collection directly in the Admin SDK.
async function deleteCollection(collectionPath: string, firestore: FirebaseFirestore.Firestore) {
    const collectionRef = firestore.collection(collectionPath);
    // Process in batches of 100 to stay within limits
    const query = collectionRef.limit(100);

    return new Promise<void>((resolve, reject) => {
        deleteQueryBatch(query, resolve, reject);
    });

    async function deleteQueryBatch(query: FirebaseFirestore.Query, resolve: () => void, reject: (reason?: any) => void) {
        try {
            const snapshot = await query.get();

            if (snapshot.size === 0) {
                // When there are no documents left, we are done
                resolve();
                return;
            }

            // Delete documents in a batch
            const batch = firestore.batch();
            snapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });
            await batch.commit();

            // Recurse on the next process tick to avoid hitting stack size limits
            // and to allow other I/O operations to run.
            process.nextTick(() => {
                deleteQueryBatch(query, resolve, reject);
            });
        } catch(error) {
            reject(error);
        }
    }
}

export async function GET(request: Request) {
    // --- Secure the endpoint ---
    // This endpoint should only be triggered by Google Cloud Scheduler.
    // We verify the OIDC token sent by the scheduler.
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
    const functionUrl = `${process.env.NEXT_PUBLIC_URL}/api/cron/delete-old-quotes`;

    if (!process.env.NEXT_PUBLIC_URL) {
        console.error("CRON ERROR: NEXT_PUBLIC_URL environment variable is not set. Cannot verify audience.");
        return NextResponse.json({ error: 'Configuration error: Server URL not set.' }, { status: 500 });
    }

    if (!idToken) {
        return NextResponse.json({ error: 'Unauthorized: No token provided.' }, { status: 401 });
    }

    try {
        // Verify the token's signature and that it was intended for our function.
        const ticket = await authClient.verifyIdToken({
            idToken,
            audience: functionUrl,
        });
        
        const payload = ticket.getPayload();
        // Optional: Extra check to ensure it's from a service account we expect.
        if (!payload || !payload.email_verified) {
             throw new Error('Invalid token payload.');
        }
        console.log(`Verified cron request from service account: ${payload.email}`);
    
    } catch (error: any) {
        console.error('Token verification failed:', error.message);
        return NextResponse.json({ error: 'Unauthorized: Invalid token.' }, { status: 401 });
    }

    // --- Deletion Logic ---
    try {
        const firestore = getFirestore(getAdminApp());

        // Calculate the cutoff date: 12 months ago
        const now = new Date();
        const cutoffDate = new Date(now.setFullYear(now.getFullYear() - 1));

        console.log(`Starting deletion job for quotes with a rental end date before ${cutoffDate.toISOString()}`);

        // Query for all quote requests that ended over a year ago.
        // The rentalEndDate is stored as an ISO string, which is lexicographically sortable.
        const oldQuotesQuery = firestore.collectionGroup('quoteRequests')
            .where('rentalEndDate', '<', cutoffDate.toISOString());
            
        const oldQuotesSnapshot = await oldQuotesQuery.get();

        if (oldQuotesSnapshot.empty) {
            console.log("No old quotes found to delete.");
            return NextResponse.json({ success: true, message: 'No old quotes to delete.' });
        }
        
        let deletedCount = 0;
        const deletionPromises: Promise<any>[] = [];

        // Iterate over each old quote and prepare deletions
        for (const doc of oldQuotesSnapshot.docs) {
            console.log(`Scheduling deletion for quote ${doc.id} from customer ${doc.ref.parent.parent?.id}.`);
            
            // 1. Delete the 'evidence' subcollection associated with the quote.
            const evidencePath = `${doc.ref.path}/evidence`;
            deletionPromises.push(deleteCollection(evidencePath, firestore));

            // 2. Delete the quote document itself.
            deletionPromises.push(doc.ref.delete());

            deletedCount++;
        }

        // Wait for all deletion operations to complete
        await Promise.all(deletionPromises);

        const message = `Successfully deleted ${deletedCount} old quote(s) and their associated evidence.`;
        console.log(message);
        return NextResponse.json({ success: true, message, deletedCount });

    } catch (error: any) {
        console.error('Error running delete-old-quotes cron job:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
