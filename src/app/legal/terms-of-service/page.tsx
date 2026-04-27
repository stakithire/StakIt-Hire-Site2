import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Terms of Service | StakIt Hire',
};

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto max-w-4xl space-y-8 py-12">
      <header className="text-center">
        <h1 className="text-4xl font-headline font-bold text-foreground">
          Terms of Service
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>1. Terms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            By accessing the website at StakIt Hire, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Use License</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            Permission is granted to temporarily download one copy of the materials (information or software) on StakIt Hire's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
          </p>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle>3. Disclaimer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
            <p>
                The materials on StakIt Hire's website are provided on an 'as is' basis. StakIt Hire makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>4. Limitations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            In no event shall StakIt Hire or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on StakIt Hire's website.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>5. Accuracy of Materials</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            The materials appearing on StakIt Hire's website could include technical, typographical, or photographic errors. StakIt Hire does not warrant that any of the materials on its website are accurate, complete or current.
          </p>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle>6. Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            StakIt Hire has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by StakIt Hire of the site.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>7. Modifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            StakIt Hire may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
