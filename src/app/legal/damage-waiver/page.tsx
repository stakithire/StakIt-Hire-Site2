
import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, ShieldOff } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Box Protection Plan | StakIt Hire',
};

export default function DamageWaiverPage() {
  return (
    <div className="container mx-auto max-w-4xl space-y-8 py-12">
      <header className="text-center">
        <h1 className="text-4xl font-headline font-bold text-foreground">
          Box Protection Plan
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Your peace of mind, covered.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>1. The Optional Box Protection Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            For a flat fee of <strong>$20.00</strong>, customers can add our optional Box Protection Plan to their order. This plan is designed to provide peace of mind by covering the cost of minor, accidental damage to our moving boxes during your rental period.
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10">
            <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-300">
                <ShieldCheck /> What Is Covered
            </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
                <p>The Box Protection Plan covers the standard $20.00 damage fee for up to **three (3) individual moving boxes**.</p>
                <p>This includes minor damages that can occur during a typical move, such as:</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Small cracks or chips</li>
                    <li>Scuffs and deep scratches</li>
                    <li>Minor damage to lids or handles</li>
                </ul>
                <p>If the plan is purchased, you will not be charged for the first three boxes found to have such damage upon inspection.</p>
            </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10">
            <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-300">
                <ShieldOff /> What Is NOT Covered
            </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
                <p>To protect our assets and keep the plan affordable, the following are explicitly excluded from coverage:</p>
                <ul className="list-disc pl-6 space-y-2 font-medium">
                    <li>Lost, stolen, or unreturned equipment of any kind.</li>
                    <li>Major or catastrophic damage due to misuse or negligence (e.g., boxes returned in pieces).</li>
                    <li>Damage to any non-box items, including trolleys, blankets, mattress protectors, etc.</li>
                </ul>
                <p>Standard fees as outlined in our Terms and Conditions will apply to any of the situations listed above, regardless of whether the Box Protection Plan was purchased.</p>
            </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>2. How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            After your rental period ends and the equipment is collected, our team inspects all items.
          </p>
          <ul className="list-decimal pl-6 space-y-2">
            <li>We first count all returned items. The standard fees for any lost items are calculated.</li>
            <li>We then inspect the returned moving boxes for damage.</li>
            <li>If you have purchased the Box Protection Plan, we will not charge you for the first three (3) boxes that have minor damage. If more than three boxes are damaged, you will only be charged the standard $20 fee for each additional damaged box (e.g., if five boxes are damaged, you pay for two).</li>
            <li>If you have not purchased the plan, the standard $20 fee applies to every damaged box.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
