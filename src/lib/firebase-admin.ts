
import { initializeApp, getApps, App } from "firebase-admin/app";

const appName = 'firebase-admin-app-[StakIt]';

function initializeAdminApp(): App {
    const existingApp = getApps().find(app => app.name === appName);
    if (existingApp) {
        return existingApp;
    }

    // When deployed to a Google managed environment like App Hosting,
    // initializeApp() with no credential automatically uses the 
    // Application Default Credentials (ADC). This is the most secure method.
    // For local development, you will need to set up ADC by running:
    // `gcloud auth application-default login` in your terminal.
    return initializeApp({}, appName);
}

export function getAdminApp(): App {
    return initializeAdminApp();
}
