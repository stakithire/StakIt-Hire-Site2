import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | StakIt Hire',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-4xl space-y-8 py-12">
      <header className="text-center">
        <h1 className="text-4xl font-headline font-bold text-foreground">
          Privacy Policy
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Last updated: 11 April 2026
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>1. Introduction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            StakIt Hire (ABN 72 970 045 408) (“we”, “us”, “our”) is committed to protecting your privacy and handling your personal information in accordance with the Privacy Act 1988 and the Australian Privacy Principles (APPs).
          </p>
          <p>
            This Privacy Policy explains how we collect, use, disclose, and store your personal information when you use our website and services.
          </p>
          <div>
            <p className="font-semibold text-foreground">Contact details:</p>
            <p>Email: <a href="mailto:stakithire@gmail.com" className="text-primary hover:underline">stakithire@gmail.com</a></p>
            <p>Location: Cranebrook, NSW, Australia 2749</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. What Personal Information We Collect</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
            <p>We may collect the following types of personal information:</p>
            <h3 className="text-lg font-semibold text-foreground pt-2">a) Personal Details</h3>
            <ul className="list-disc pl-6 space-y-1">
                <li>Full name</li>
                <li>Email address</li>
                <li>Phone number</li>
            </ul>

            <h3 className="text-lg font-semibold text-foreground pt-2">b) Transaction & Account Information</h3>
            <ul className="list-disc pl-6 space-y-1">
                <li>Delivery and billing address</li>
                <li>Order details (including rental and purchase history)</li>
                <li>Account login details (username, encrypted password)</li>
            </ul>

            <h3 className="text-lg font-semibold text-foreground pt-2">c) Payment Information</h3>
            <ul className="list-disc pl-6 space-y-1">
                <li>Payment details are processed securely via third-party providers (e.g. Stripe, PayPal)</li>
                <li>We do not store full credit or debit card details</li>
            </ul>

            <h3 className="text-lg font-semibold text-foreground pt-2">d) Identity Verification Information (if required)</h3>
            <ul className="list-disc pl-6 space-y-1">
                <li>Government-issued identification (e.g. driver licence)</li>
                <li>Proof of address</li>
                <li>Date of birth</li>
            </ul>
            <p>We only collect identity verification information where reasonably necessary, such as for fraud prevention, high-value rentals, or dispute resolution.</p>

            <h3 className="text-lg font-semibold text-foreground pt-2">e) Visual Records (Photo and Video Evidence)</h3>
            <p>We may collect photographs and/or video recordings of rental equipment before delivery, at the time of delivery, and upon collection.</p>
            <p>These records may be used to:</p>
            <ul className="list-disc pl-6 space-y-1">
                <li>Verify the condition of equipment</li>
                <li>Assess damage, loss, or misuse</li>
                <li>Support dispute resolution processes</li>
                <li>Prevent fraud or false damage claims</li>
            </ul>
            <p>These visual records may incidentally include surrounding property, delivery locations, or other contextual information necessary to document equipment condition.</p>
            <p>We handle all visual records in accordance with this Privacy Policy and take reasonable steps to ensure they are stored securely and accessed only when necessary.</p>
            
            <h3 className="text-lg font-semibold text-foreground pt-2">f) Technical & Usage Information</h3>
            <ul className="list-disc pl-6 space-y-1">
                <li>IP address</li>
                <li>Device and browser type</li>
                <li>Pages viewed and website interactions</li>
            </ul>

            <h3 className="text-lg font-semibold text-foreground pt-2">g) Additional Information</h3>
            <ul className="list-disc pl-6 space-y-1">
                <li>Information you provide when requesting a quote or contacting us</li>
            </ul>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle>3. How We Collect Your Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
            <p>We collect personal information when you:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Create an account</li>
                <li>Place an order or book a rental</li>
                <li>Submit identification for verification (where required)</li>
                <li>Request a quote</li>
                <li>Contact us via email or website forms</li>
                <li>Use our website (including through cookies and analytics tools)</li>
                <li>Receive delivery or collection of rental equipment (including visual records)</li>
            </ul>
            <p>We may also collect information automatically through cookies and analytics technologies.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>4. Why We Collect and Use Your Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            We collect and use your personal information for the following purposes:
          </p>
          <ul className="list-disc pl-6 space-y-2">
              <li>To provide and manage our rental and sales services</li>
              <li>To process payments and transactions</li>
              <li>To coordinate delivery and collection of goods</li>
              <li>To create and manage user accounts</li>
              <li>To verify identity and prevent fraud</li>
              <li>To assess eligibility for rental services</li>
              <li>To manage disputes, loss, or damage claims</li>
              <li>To improve our website and services</li>
              <li>To communicate with you, including customer support</li>
              <li>To send marketing communications (where you have opted in)</li>
              <li>To comply with legal obligations</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>5. Disclosure of Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
            <p>We may disclose your personal information to:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Payment providers (e.g. Stripe, PayPal, and future providers such as Afterpay or Klarna)</li>
                <li>Delivery and logistics providers</li>
                <li>Cloud hosting and infrastructure providers (e.g. Google Firebase)</li>
                <li>Identity verification or fraud prevention service providers (if used)</li>
                <li>Analytics and advertising providers (e.g. Google Analytics, Meta/Facebook)</li>
                <li>Email marketing providers (e.g. Brevo or similar platforms)</li>
                <li>Professional advisers (legal, accounting, insurance)</li>
                <li>Government or regulatory authorities where required by law</li>
            </ul>
            <p>We do <strong className="text-foreground">not sell your personal information</strong> to third parties.</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>6. Overseas Disclosure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            Some of our third-party service providers may store or process personal information outside Australia.
          </p>
          <p>
            Where this occurs, we take reasonable steps to ensure overseas recipients handle your personal information in accordance with the Australian Privacy Principles.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>7. Data Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            We take reasonable steps to protect your personal information from misuse, interference, loss, and unauthorised access, modification, or disclosure.
          </p>
          <p>These measures include:</p>
          <ul className="list-disc pl-6 space-y-2">
              <li>Secure cloud infrastructure (Google Firebase)</li>
              <li>Encrypted data transmission (HTTPS)</li>
              <li>Access controls and authentication measures</li>
              <li>Use of trusted third-party payment processors</li>
          </ul>
          <p>Sensitive information, including identity verification data and visual records, is subject to additional access restrictions.</p>
          <p>However, no method of electronic storage or transmission is completely secure.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>8. Data Retention</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            We retain personal information for up to <strong className="text-foreground">one (1) year</strong> from your last interaction with us, unless a longer retention period is required or permitted by law.
          </p>
          <p>
            Visual records (photos and videos) are retained only as long as necessary for operational, dispute resolution, or legal purposes.
          </p>
          <p>
            After this period, we take reasonable steps to destroy or de-identify personal information.
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>9. Access and Correction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            You may request access to, or correction of, personal information we hold about you.
          </p>
          <p>
            To make a request, contact us at:<br/>
            📧 <a href="mailto:stakithire@gmail.com" className="text-primary hover:underline">stakithire@gmail.com</a>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>10. Complaints</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            If you believe we have breached the Australian Privacy Principles, you may contact us at:
          </p>
          <p>
            📧 <a href="mailto:stakithire@gmail.com" className="text-primary hover:underline">stakithire@gmail.com</a>
          </p>
          <p>If you are not satisfied with our response, you may contact the Office of the Australian Information Commissioner (OAIC).</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>11. Cookies and Analytics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            We use cookies and similar technologies to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Improve user experience</li>
            <li>Analyse website traffic</li>
            <li>Support marketing and advertising</li>
          </ul>
          <p>
            You can disable cookies in your browser settings.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>12. Third-Party Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            We are not responsible for the privacy practices of external websites linked from our platform.
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>13. Changes to This Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            We may update this Privacy Policy from time to time.
          </p>
          <p>
            Updates will be posted on this page with a revised “Last updated” date. Continued use of our services indicates acceptance of the updated policy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
