'use client';
import { usePathname } from 'next/navigation';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';
import React from 'react';

// Define routes that depend on user authentication.
const AUTH_DEPENDENT_ROUTES = ['/profile', '/admin', '/tracking', '/quote'];

/**
 * A client component that displays a loading spinner on specific routes
 * while the initial user authentication is in progress.
 * This prevents a flash of content or redirects on pages that need user data.
 */
export function AuthSpinnerWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isUserLoading } = useUser();

  // Check if the current route is one that requires auth data.
  const isAuthDependentRoute = AUTH_DEPENDENT_ROUTES.some(route => pathname.startsWith(route));

  // If we're on an auth-dependent route and the user state is still loading,
  // show a spinner instead of the page content.
  if (isUserLoading && isAuthDependentRoute) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Otherwise, render the page content.
  return <>{children}</>;
}
