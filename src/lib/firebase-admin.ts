
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: App | undefined;

function getAdminApp(): App {
    if (adminApp) {
        return adminApp;
    }

    if (getApps().length > 0) {
        adminApp = getApps()[0];
        if (adminApp) {
            return adminApp;
        }
    }

    // In the live environment (Firebase App Hosting), the SDK automatically
    // finds the credentials. No file or variable is needed.
    if (process.env.NODE_ENV === 'production') {
        console.log("Initializing Firebase Admin with Application Default Credentials for production.");
        adminApp = initializeApp();
    } else {
        // In the local development environment, we use the service account key
        // from an environment variable for security and flexibility.
        console.log("Initializing Firebase Admin with service account from environment variable for development.");
        try {
            if (!process.env.SERVICE_ACCOUNT_KEY) {
                throw new Error("SERVICE_ACCOUNT_KEY environment variable is not set. Please copy the entire contents of your service-account.json file into the .env file's SERVICE_ACCOUNT_KEY variable.");
            }
            // Parse the JSON string from the environment variable.
            const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);
            adminApp = initializeApp({
                credential: cert(serviceAccount)
            });
        } catch (error: any) {
            console.error("--------------------------------------------------------------------");
            console.error("ERROR: LOCAL FIREBASE ADMIN INITIALIZATION FAILED");
            if (error instanceof SyntaxError) {
                 console.error("The SERVICE_ACCOUNT_KEY in your .env file is not a valid JSON string.");
                 console.error("This commonly happens if the newline characters (\\n) in the private key are not correctly escaped when copying the JSON content into a single line in the .env file.");
                 console.error("SOLUTION: Ensure the entire JSON object is a single, continuous line and that all newline characters in the 'private_key' field are represented as '\\n'.");
            } else {
                console.error("An unexpected error occurred:", error.message);
            }
            console.error("--------------------------------------------------------------------");
            throw new Error("Could not initialize Firebase Admin SDK for local development. See server logs for detailed diagnostics.");
        }
    }
    
    if (!adminApp) {
        throw new Error("Firebase Admin SDK initialization failed unexpectedly.");
    }

    return adminApp;
}

/**
 * Gets the Firebase Admin Auth service instance.
 */
export function getAdminAuth(): Auth {
    return getAuth(getAdminApp());
}

/**
 * Gets the Firebase Admin Firestore service instance.
 */
export function getAdminFirestore(): Firestore {
    return getFirestore(getAdminApp());
}
