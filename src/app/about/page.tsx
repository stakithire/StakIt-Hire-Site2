
import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Mountain, Target, Users, Eye } from 'lucide-react';
import Image from 'next/image';
import placeholderImageData from '@/lib/placeholder-images.json';

export const metadata: Metadata = {
  title: 'Who Is StakIt Hire? | StakIt Hire',
  description: 'Learn about the mission and story behind StakIt Hire.',
};

export default function AboutPage() {
    const aboutImage = placeholderImageData.placeholderImages.find(img => img.id === 'moving-boxes');
    
  return (
    <div className="container mx-auto max-w-4xl space-y-12 py-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-foreground">
          Who Is StakIt Hire?
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Boxes that don&apos;t quit — Pack. Stack. Move.
        </p>
      </header>

      {aboutImage && (
         <Card className="overflow-hidden">
            <div className="relative h-64 w-full">
                <Image
                    src={aboutImage.imageUrl}
                    alt="A stack of our eco-friendly moving boxes"
                    fill
                    className="object-cover"
                    data-ai-hint={aboutImage.imageHint}
                />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                 <div className="absolute bottom-0 left-0 p-6">
                    <h2 className="text-3xl font-bold text-white">Our Story</h2>
                 </div>
            </div>
            <CardContent className="p-6 text-muted-foreground space-y-4">
               <p className="text-base">
                  Moving is one of life’s biggest headaches — but it doesn’t have to be. Most of the stress doesn’t come from the move itself… it comes from everything leading up to it. Finding boxes. Fighting with tape. Hoping they don’t collapse halfway to the car. Digging through piles of mismatched cardboard and scrunched-up packing paper.
                </p>
                <p className="text-base">
                  At StakIt Hire, we knew there had to be a better way. So we built one.
                </p>
                <p className="font-semibold text-foreground pt-4">A Modern Way to Move</p>
                <p className="text-base">
                  Our goal is to replace the chaos of packing with a system that’s strong, simple, and built for real life. Our durable, reusable crates are designed to survive whatever your move throws at them — stairs, rain, heavy books, awkward kitchen gear. They don’t crumple. They don’t buckle. They don’t quit.
                </p>
                <p className="text-base">
                  We deliver the crates to your door, you pack at your own pace, stack them securely, move with confidence, and we collect them when you’re done. That’s it. Zero waste. Zero fuss. Zero “oh no, the box just tore.”
                </p>
            </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-8 text-center">
        <Card>
          <CardHeader>
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
               <Target className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              To make the moving process simpler, smarter, and more sustainable for our community by providing a hassle-free rental service for high-quality moving equipment. We are committed to reducing waste and providing exceptional customer service.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
               <Eye className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Our Vision</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
                To become the go-to alternative to cardboard boxes, setting a new standard for how people pack, move, and organise — with cleaner, smarter, and more sustainable solutions.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
               <Users className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Our Commitment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We are a local business dedicated to serving the Greater Penrith Area. Our commitment is to our customers and our community. We promise transparent pricing, reliable service, and a friendly face every step of the way. Your seamless move is our highest priority.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="text-center bg-muted/50">
          <CardHeader>
            <CardTitle>Ready to Plan Your Move?</CardTitle>
            <CardDescription>
                Let us help make it your easiest one yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
