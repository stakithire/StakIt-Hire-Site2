'use client';

import Link from 'next/link';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth, useUser, useAdmin } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { useEffect, useState } from 'react';
import { MobileNav } from '@/components/layout/app-sidebar';
import { Badge } from '@/components/ui/badge';
import { makeMeAdmin } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Shield } from 'lucide-react';

export function AppHeader() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { isAdmin, isCheckingAdmin } = useAdmin();
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && !user && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [isUserLoading, user, auth]);

  // --- ONE-TIME ADMIN GRANT SCRIPT ---
  useEffect(() => {
    const runAdminGrant = async () => {
      // Conditions to run: User is logged in, not anonymous, is the target admin email,
      // and we have confirmed they are NOT an admin yet.
      if (user && !user.isAnonymous && user.email === 'stakithire@gmail.com' && !isAdmin && !isCheckingAdmin) {
        
        // Use sessionStorage to ensure this runs only once per session to avoid spamming.
        const hasRunKey = `admin_grant_attempted_${user.uid}`;
        if (sessionStorage.getItem(hasRunKey)) {
          return;
        }
        sessionStorage.setItem(hasRunKey, 'true');

        console.log('Attempting to grant admin role automatically...');

        const result = await makeMeAdmin();

        if (result.success) {
          toast({
            title: "Admin Role Granted",
            description: "Successfully granted admin privileges. You will be signed out now. Please sign back in to access admin features.",
            duration: 5000,
          });
          // Automatically sign the user out after a delay to allow them to read the toast.
          setTimeout(() => {
            if (auth) {
              signOut(auth);
            }
          }, 5000);
        } else {
          toast({
            variant: 'destructive',
            title: "Admin Grant Failed",
            description: result.error || "Could not grant admin role. Please check server logs.",
            duration: 9000,
          });
          // If it fails, remove the flag so it can be retried on the next login.
          sessionStorage.removeItem(hasRunKey);
        }
      }
    };

    // We wait for the admin check to be complete before trying to run the grant.
    if (!isCheckingAdmin && user) {
        runAdminGrant();
    }
  }, [user, isAdmin, isCheckingAdmin, auth, toast]);
  // --- END OF ONE-TIME ADMIN GRANT SCRIPT ---

  const handleSignIn = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  const handleSignOut = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      initiateAnonymousSignIn(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'G'; // G for Guest
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name[0];
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <MobileNav />
        <div className="w-full flex-1">
          {/* You can add a search bar or other header elements here */}
        </div>
        <div className="flex items-center space-x-4">
          {isUserLoading ? (
             <Avatar className="h-9 w-9">
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-9 w-9">
                    {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'User Avatar'} />}
                    <AvatarFallback>{getInitials(user.displayName || (user.isAnonymous ? 'Guest' : 'U'))}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  {user.isAnonymous ? (
                     <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Guest User</p>
                       <p className="text-xs leading-none text-muted-foreground">Sign in for full features</p>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center justify-between">
                         <p className="text-sm font-medium leading-none">{user.displayName}</p>
                         {isAdmin && <Badge variant="secondary">Admin</Badge>}
                      </div>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.isAnonymous ? (
                    <DropdownMenuItem onClick={handleSignIn}>
                        Sign In with Google
                    </DropdownMenuItem>
                ) : (
                    <>
                        <DropdownMenuItem asChild>
                           <Link href="/profile">Profile</Link>
                        </DropdownMenuItem>
                         {isAdmin && (
                            <DropdownMenuItem asChild>
                               <Link href="/admin"><Shield className="mr-2 h-4 w-4"/>Admin Dashboard</Link>
                            </DropdownMenuItem>
                         )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut}>Log out</DropdownMenuItem>
                    </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
    </header>
  );
}
