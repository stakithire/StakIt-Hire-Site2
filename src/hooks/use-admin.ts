
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/firebase';

export function useAdmin() {
  const { user, isUserLoading, idToken } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  useEffect(() => {
    // Start checking as soon as the hook runs
    setIsCheckingAdmin(true);

    if (isUserLoading) {
      // If the user object is still loading, we wait.
      return;
    }

    if (!user || !idToken) {
      // If there's no user or no token, they're not an admin.
      setIsAdmin(false);
      setIsCheckingAdmin(false);
      return;
    }

    // If we have a user and a token, parse the token to check for the admin claim.
    try {
        // The ID token is a JWT (JSON Web Token). The payload is the middle part, Base64-encoded.
        const payload = JSON.parse(atob(idToken.split('.')[1]));
        // Check for the 'admin' custom claim.
        setIsAdmin(payload.admin === true);
    } catch (e) {
        console.error("Failed to parse ID token:", e);
        setIsAdmin(false);
    } finally {
        // We're done checking.
        setIsCheckingAdmin(false);
    }

  }, [user, isUserLoading, idToken]);

  return { isAdmin, isCheckingAdmin };
}
