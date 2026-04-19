
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// This is a "lazy-loaded singleton" pattern.
// It ensures that the Firebase Admin app is initialized only once.
let adminApp: App | undefined;

function getAdminApp(): App {
    if (adminApp) {
        return adminApp;
    }

    // Check if the app is already initialized, which can happen in some environments.
    if (getApps().length > 0) {
        adminApp = getApps()[0];
        return adminApp;
    }
    
    // If not initialized, try to use environment variables.
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
    };

    if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
         adminApp = initializeApp({
            credential: cert(serviceAccount),
        });
    } else {
        // Fallback for App Hosting's automatic credentials
        console.log("Initializing Firebase Admin with default credentials.");
        adminApp = initializeApp();
    }
    
    return adminApp;
}

/**
 * Gets the Firebase Admin Auth service instance.
 * This function ensures the app is initialized before getting the service.
 * @returns {Auth} The Firebase Admin Auth service.
 */
export function getAdminAuth(): Auth {
    return getAuth(getAdminApp());
}

/**
 * Gets the Firebase Admin Firestore service instance.
 * This function ensures the app is initialized before getting the service.
 * @returns {Firestore} The Firebase Admin Firestore service.
 */
export function getAdminFirestore(): Firestore {
    return getFirestore(getAdminApp());
}
