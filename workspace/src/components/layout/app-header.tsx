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
import { useAuth, useUser } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { useEffect } from 'react';
import { MobileNav } from '@/components/layout/app-sidebar';

export function AppHeader() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && !user && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [isUserLoading, user, auth]);

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
      // After sign out, you might want to sign in a new anonymous user
      initiateAnonymousSignIn(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'A';
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
                    <AvatarFallback>{getInitials(user.displayName || (user.isAnonymous ? 'A' : 'U'))}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  {user.isAnonymous ? (
                     <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Anonymous User</p>
                       <p className="text-xs leading-none text-muted-foreground">Sign in for full features</p>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName}</p>
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
                        <DropdownMenuItem>Profile</DropdownMenuItem>
                        <DropdownMenuItem>Settings</DropdownMenuItem>
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
