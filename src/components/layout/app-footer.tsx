
'use client';

import Link from 'next/link';

export function AppFooter() {
  return (
    <footer className="mt-auto border-t">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()} StakIt Hire. All rights reserved.
          </p>
        </div>
        <div className="flex items-center gap-4 md:gap-8 flex-wrap justify-center">
            <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground">
                FAQ
            </Link>
            <Link href="/legal/damage-waiver" className="text-sm text-muted-foreground hover:text-foreground">
                Box Protection Plan
            </Link>
            <Link href="/legal/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy Policy
            </Link>
            <Link href="/legal/terms-and-conditions" className="text-sm text-muted-foreground hover:text-foreground">
                Terms & Conditions
            </Link>
        </div>
      </div>
    </footer>
  );
}
