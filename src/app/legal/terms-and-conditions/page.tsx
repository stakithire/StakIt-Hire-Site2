
import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Terms and Conditions | StakIt Hire',
};

export default function TandCPage() {
  return (
    <div className="container mx-auto max-w-4xl space-y-8 py-12">
      <header className="text-center">
        <h1 className="text-4xl font-headline font-bold text-foreground">
          Terms and Conditions
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Last updated: 11 April 2026
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>1. Agreement to Terms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            By accessing our website and using our services, you agree to be bound by these Terms and Conditions.
          </p>
          <p>
            These Terms constitute a legally binding agreement between you and StakIt Hire (ABN 72 970 045 408).
          </p>
          <p>
            If you do not agree to these Terms, you must not use our services.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Australian Consumer Law</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
            <p>Nothing in these Terms excludes, restricts, or modifies any rights or remedies you may have under the Australian Consumer Law, including consumer guarantees that cannot be excluded.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Services Provided</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
            <p>StakIt Hire provides:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Rental of moving equipment</li>
                <li>Sale of selected goods</li>
            </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>4. Quotes and Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
            <ul className="list-disc pl-6 space-y-2">
                <li>Quotes are valid for 30 days unless otherwise stated</li>
                <li>Full payment is required prior to rental commencement unless otherwise agreed in writing</li>
                <li>Payments are processed via approved third-party providers (e.g. Stripe, PayPal)</li>
                <li>Prices are in AUD and include GST where applicable</li>
            </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>5. Rental Terms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
            <h3 className="text-lg font-semibold text-foreground pt-2">5.1 Rental Period</h3>
            <p>The rental period begins upon delivery or collection and ends upon return or collection by us.</p>

            <h3 className="text-lg font-semibold text-foreground pt-4">5.2 Delivery and Collection</h3>
            <p>Delivery and collection times are agreed in advance within a specified time window.</p>
            <p>You must ensure safe, clear, and reasonable access to the premises, including adequate parking and access for loading and unloading.</p>
            <p>Any person present at the delivery address is deemed authorised to accept delivery on your behalf.</p>
            <p>You must be contactable on the day of delivery and collection.</p>
            <p>If we are unable to complete delivery or collection due to inaccessible premises, unsafe conditions, failure to provide access, or no authorised person being present, additional fees may apply, including:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1 list-inside">
                <li>Re-delivery or re-collection fee: $30–$80 depending on location and logistics</li>
                <li>Waiting time fee: $25 per 30 minutes</li>
            </ul>


            <h3 className="text-lg font-semibold text-foreground pt-4">5.3 Use of Equipment</h3>
            <p>You agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Use equipment safely and only for its intended purpose</li>
                <li>Follow all provided instructions and safety guidelines</li>
                <li>Not modify, repair, or alter equipment</li>
                <li>Store equipment securely to prevent theft or damage</li>
                <li>Be responsible for any use of equipment during the rental period, including use by any third party</li>
            </ul>
            <p>Equipment must be returned empty and in a reasonably clean condition.</p>

            <h3 className="text-lg font-semibold text-foreground pt-4">5.4 Responsibility and Risk</h3>
            <p>You are responsible for the equipment during the rental period and must take reasonable care to prevent damage, loss, or theft.</p>
            <p>This does not include:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Fair wear and tear</li>
                <li>Manufacturing faults not caused by misuse</li>
            </ul>

            <h3 className="text-lg font-semibold text-foreground pt-4">5.5 Damage, Loss, and Fees</h3>
            <p>If equipment is returned damaged (beyond fair wear and tear), lost, or not returned:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Moving Boxes:
                    <ul className="list-disc pl-6 mt-2 space-y-1 list-inside">
                        <li>$20 per damaged box</li>
                        <li>$35 per lost box</li>
                    </ul>
                </li>
                <li>High-Value Equipment (e.g. trolleys):
                    <ul className="list-disc pl-6 mt-2 space-y-1 list-inside">
                        <li>$150–$250 depending on damage severity or replacement cost</li>
                    </ul>
                </li>
                <li>Other Equipment:
                    <ul className="list-disc pl-6 mt-2 space-y-1 list-inside">
                        <li>Reasonable repair cost or full replacement value if irreparable</li>
                    </ul>
                </li>
            </ul>
            <p>We will assess damage in good faith based on inspection and photographic evidence.</p>
            <p>Reasonable cleaning fees may apply where equipment is returned excessively dirty beyond normal use.</p>


            <h3 className="text-lg font-semibold text-foreground pt-4">5.6 Photo Evidence</h3>
            <p>We may take photographs or video recordings of equipment before delivery, at delivery, and upon collection.</p>
            <p>These may be used to:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Verify condition of equipment</li>
                <li>Assess damage, loss, or misuse</li>
                <li>Resolve disputes</li>
            </ul>
            <p>By using our services, you consent to the use of such evidence for these purposes. All evidence will be handled in accordance with our Privacy Policy.</p>

            <h3 className="text-lg font-semibold text-foreground pt-4">5.7 Reporting of Pre-Existing Damage</h3>
            <p>You must inspect all equipment upon delivery.</p>
            <p>Any pre-existing damage must be reported within <strong>12 hours of delivery</strong>.</p>
            <p>If no report is made within this timeframe, the equipment is deemed to have been received in good condition (excluding fair wear and tear).</p>
            <p>This does not limit your rights under the Australian Consumer Law.</p>

            <h3 className="text-lg font-semibold text-foreground pt-4">5.8 Extension and Late Returns</h3>
            <p>Customers may request an extension of the rental period prior to the scheduled collection date, subject to availability.</p>
            <p>Approved extensions will be charged at the applicable rental rate.</p>
            <p>If equipment is not ready for collection on the scheduled date, the rental will automatically extend and additional charges will apply at the applicable rental rate.</p>
            <p>If a scheduled collection cannot be completed due to equipment not being ready, lack of access, or customer unavailability, a re-collection fee may apply.</p>
            <p>Where additional costs are reasonably incurred as a direct result of delayed return, such costs may be charged where permitted by law.</p>

            <h3 className="text-lg font-semibold text-foreground pt-4">5.9 Non-Return of Equipment</h3>
            <p>If equipment is not returned within a reasonable period following the agreed return date, and after reasonable attempts to contact you, the equipment may be deemed lost.</p>
            <p>In such cases, you may be charged:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>The full replacement cost of the equipment</li>
                <li>Any outstanding rental fees</li>
            </ul>
            <p>Any charges will be applied reasonably and in accordance with applicable law.</p>

            <h3 className="text-lg font-semibold text-foreground pt-4">5.10 Access, Safety, and Responsibility</h3>
            <p>You are responsible for ensuring that delivery and collection can be completed safely and without risk to persons or property.</p>
            <p>We reserve the right to refuse or delay delivery or collection where we reasonably believe conditions are unsafe.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>6. Sale of Goods</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>For purchased items:</p>
          <p>You are entitled to rights under Australian Consumer Law, including repair, replacement, or refund where applicable.</p>
          <p>We do not offer refunds for change of mind unless stated otherwise.</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>7. Cancellations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            Cancellations within 48 hours of the scheduled rental may incur a 50% cancellation fee.
          </p>
          <p>
            Cancellation fees will be applied reasonably based on operational costs incurred.
          </p>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle>8. Payments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            All payments must be made in full when due.
          </p>
          <p>
            If you believe a charge is incorrect, you must notify us as soon as possible so the matter can be reviewed and resolved promptly in accordance with applicable law.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>9. Limitation of Liability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            To the maximum extent permitted by law:
          </p>
          <ul className="list-disc pl-6 space-y-2">
                <li>We are not liable for indirect or consequential loss, including loss of income, business interruption, or data loss.</li>
            </ul>
            <p>Nothing in these Terms excludes liability under Australian Consumer Law or for negligence causing death or personal injury.</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>10. Indemnity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            You agree to indemnify us against losses arising from:
          </p>
          <ul className="list-disc pl-6 space-y-2">
              <li>Misuse of equipment</li>
              <li>Negligence</li>
              <li>Breach of these Terms</li>
          </ul>
          <p>This does not apply where we are at fault or where liability cannot be excluded under law.</p>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle>11. Inspection and Determination</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
            <p>We will inspect returned equipment and assess condition, damage, or loss in good faith.</p>
            <p>Our assessment will be based on:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Photographic evidence</li>
                <li>Delivery and return records</li>
                <li>Physical inspection</li>
            </ul>
            <p>Determinations will be made reasonably and in accordance with applicable law.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>12. Safety Disclaimer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            Use of equipment involves inherent risks.
          </p>
          <p>
            You are responsible for safe and appropriate use at all times.
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>13. Governing Law</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            These Terms are governed by the laws of New South Wales, Australia.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>14. Changes to Terms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            We may update these Terms from time to time.
          </p>
          <p>
            Continued use of our services constitutes acceptance of the updated Terms.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
