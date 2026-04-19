
import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { AppFooter } from '@/components/layout/app-footer';
import { FirebaseClientProvider } from '@/firebase';
import { BackToTopButton } from '@/components/layout/back-to-top-button';
import { AuthSpinnerWrapper } from '@/components/layout/auth-spinner-wrapper';

export const metadata: Metadata = {
  title: 'StakIt Hire',
  description: 'Your one-stop shop for equipment rental.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
        )}
      >
        <div 
          className="fixed inset-0 z-0 bg-center bg-no-repeat opacity-10" 
          style={{ backgroundImage: 'url(/watermark.png)', backgroundSize: '40%' }}
        />
        <FirebaseClientProvider>
          <div className="relative z-10 flex min-h-dvh flex-col">
            <div className="flex-1">
              <div className="flex">
                <AppSidebar />
                <div className="flex flex-1 flex-col">
                  <AppHeader />
                  <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <AuthSpinnerWrapper>{children}</AuthSpinnerWrapper>
                  </main>
                </div>
              </div>
            </div>
            <AppFooter />
          </div>
          <BackToTopButton />
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
