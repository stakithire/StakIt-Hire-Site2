
import { Metadata } from 'next';
import { PricingTable } from '@/components/pricing-table';
import {
  boxHireServices,
  services,
  protectionAddOns,
  tvProtectionAddOns,
  pricingBundles
} from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, Truck } from 'lucide-react';
import type { Service } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Our Pricing | StakIt Hire',
  description: 'View our rental prices for moving boxes and equipment.',
};

export default function PricingPage() {
  const standardMattressProtectors = protectionAddOns.filter(
    (s) => s.group === 'Mattress Protector'
  );

  const reusableProtector = protectionAddOns.find(s => s.id === 'reusable-protector');
  
  let modifiedProtectionAddOns = [...standardMattressProtectors];
  if(reusableProtector) {
    const displayReusableProtector = {
      ...reusableProtector,
      id: 'reusable-protector-display', // Unique key for display
      name: 'Reusable Mattress Protector (Various Sizes)',
      description: 'Eco-friendly zip-close sleeve. Specific sizes available on the quote page.'
    };
    modifiedProtectionAddOns.push(displayReusableProtector);
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-12">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-foreground">
          Our Pricing
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Affordable and transparent pricing for all your moving needs.
        </p>
      </header>

      <div className="space-y-8">
        <PricingTable
          title="Box Hire"
          description="Build your own moving kit. Prices are for a one-week hire period, with a reduced rate for each additional week."
          services={boxHireServices}
          footerContent={
            <CardContent>
              <div className="text-xs text-muted-foreground">
                <p>
                  For more details on our services, please see our{' '}
                  <Link
                    href="/legal/terms-and-conditions"
                    className="underline hover:text-primary"
                  >
                    Terms and Conditions
                  </Link>
                  .
                </p>
              </div>
            </CardContent>
          }
        />

        <PricingTable
          title="Optional Add-Ons"
          description="A range of additional items to help with your move. Hire price is a flat fee covering your entire rental period."
          services={services}
        />

        <PricingTable
          title="Protection Add-Ons"
          description="Protect your valuables during the move. Hire price is a flat fee covering your entire rental period."
          services={modifiedProtectionAddOns}
          subheading="Mattress Protection"
        />

        <PricingTable
          title=""
          description=""
          services={tvProtectionAddOns}
          subheading="TV Protection"
        />
      </div>

      <section className="space-y-4 pt-8">
        <h2 className="text-3xl font-bold text-center">Or, Choose a Pre-Made Moving Kit</h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto">Save time with our curated bundles. You can select any kit directly on the quote page to get started.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {pricingBundles.map(bundle => (
                <Card key={bundle.id} className="flex flex-col">
                    <CardHeader>
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <CardTitle>{bundle.name}</CardTitle>
                                <CardDescription>{bundle.description}</CardDescription>
                            </div>
                            <div className="text-right shrink-0">
                                <div className="text-3xl font-bold">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(bundle.price)}
                                </div>
                                {bundle.followOnPrice && (
                                    <p className="text-sm text-muted-foreground">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(bundle.followOnPrice)} per extra week
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <ul className="space-y-2 text-sm text-muted-foreground pt-4 border-t">
                            {bundle.contents.map(item => (
                                <li key={item} className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            ))}
        </div>
      </section>

      <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2"><Truck className="h-6 w-6 text-primary" /> Delivery & Collection</CardTitle>
          </CardHeader>
          <CardContent>
              <p className="text-muted-foreground">
                  A single, flat fee of <span className="font-bold text-foreground">$30</span> applies to all orders within the Greater Penrith Area. This fee covers both the delivery of your equipment at the start of your rental and the collection from your specified address at the end. No surprises.
              </p>
          </CardContent>
      </Card>

       <Card className="text-center bg-muted/50">
          <CardContent className="p-8">
              <h2 className="text-2xl font-bold">Ready to build your own quote?</h2>
              <p className="text-muted-foreground mt-2 mb-6">Let us know what you need and we'll create a custom quote for your project.</p>
              <Button asChild>
                  <Link href="/quote">
                      Request a Quote
                      <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
              </Button>
          </CardContent>
      </Card>
    </div>
  );
}
