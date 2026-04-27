'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (getApps().length) {
    // If already initialized, just get the existing services.
    const app = getApp();
    return {
      firebaseApp: app,
      auth: getAuth(app),
      firestore: getFirestore(app),
      storage: getStorage(app),
    };
  }

  let firebaseApp: FirebaseApp;

  // This logic ensures a clear separation between production and development environments.
  if (process.env.NODE_ENV === 'production') {
    // In a production environment (like Firebase App Hosting),
    // we rely exclusively on the automatic configuration provided by the hosting environment.
    // If these environment variables are not available, initializeApp() will throw an error.
    // This is the desired behavior, as it indicates a critical configuration issue.
    try {
      firebaseApp = initializeApp();
    } catch (e) {
      console.error(
        'Firebase initialization failed in production. This is a critical error. Ensure your hosting environment is correctly configured with Firebase environment variables.',
        e
      );
      // Re-throw the error to halt execution, as the app cannot function without Firebase.
      throw e;
    }
  } else {
    // In a development environment, we fall back to using the local firebaseConfig object.
    firebaseApp = initializeApp(firebaseConfig);
  }

  // On first initialization, get firestore and enable persistence
  const firestore = getFirestore(firebaseApp);
  enableIndexedDbPersistence(firestore).catch((err) => {
    if (err.code == 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled
      // in one tab at a time. This is a normal scenario.
    } else if (err.code == 'unimplemented') {
      // The current browser does not support all of the
      // features required to enable persistence.
      console.warn('Firestore persistence not supported in this browser.');
    }
  });

  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: firestore,
    storage: getStorage(firebaseApp),
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
export { useUser } from './provider';
export { useAdmin } from '@/hooks/use-admin';
