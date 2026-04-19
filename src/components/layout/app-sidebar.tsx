'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, FileText, History, Shield, Menu, List, HelpCircle, Mail, Users } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { useAdmin } from '@/firebase';
import { useState } from 'react';

const navItems = [
  { href: '/pricing', label: 'Pricing', icon: List },
  { href: '/quote', label: 'New Quote', icon: FileText },
  { href: '/tracking', label: 'My Requests', icon: History },
  { href: '/about', label: 'About Us', icon: Users },
  { href: '/faq', label: 'FAQ', icon: HelpCircle },
  { href: '/contact', label: 'Contact', icon: Mail },
];

function NavContent() {
  const pathname = usePathname();
  const { isAdmin } = useAdmin();

  return (
    <nav className="flex flex-col items-start gap-2 p-4">
        {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                pathname.startsWith(item.href) ? 'bg-muted text-primary' : ''
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        )}
        
    </nav>
  );
}


export function MobileNav() {
    const pathname = usePathname();
    const { isAdmin } = useAdmin();
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <SheetHeader>
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              </SheetHeader>
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 text-lg font-semibold mb-4 h-12"
                >
                  <div className="relative w-36 h-full">
                    <Icons.logo />
                  </div>
                  <span className="font-bold font-headline text-lg sr-only">StakIt Hire</span>
                </Link>
                {navItems.map((item) => (
                    <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                        'mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground',
                        pathname.startsWith(item.href) ? 'bg-accent text-accent-foreground' : ''
                    )}
                    >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                    </Link>
                   )
                )}
              </nav>
            </SheetContent>
        </Sheet>
    )
}

export function AppSidebar() {
  return (
    <aside className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-16 items-center border-b px-6">
             <Link href="/" className="relative w-36 h-12 flex items-center gap-2 font-semibold">
                <Icons.logo />
                <span className="sr-only font-bold font-headline text-lg">StakIt Hire</span>
            </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
            <NavContent />
        </div>
      </div>
    </aside>
  );
}
