
import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Target, Users, Eye } from 'lucide-react';
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
        <h1 className="text-5xl font-headline font-bold text-foreground">
          Who Is StakIt Hire?
        </h1>
        <p className="mt-4 text-xl text-muted-foreground font-sans italic">
          Boxes that don&apos;t quit — Pack. Stack. Move.
        </p>
      </header>

      {aboutImage && (
         <Card className="overflow-hidden rounded-2xl shadow-premium border-none">
            <div className="relative h-80 w-full">
                <Image
                    src={aboutImage.imageUrl}
                    alt="A stack of our eco-friendly moving boxes"
                    fill
                    className="object-cover"
                    data-ai-hint={aboutImage.imageHint}
                />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                 <div className="absolute bottom-0 left-0 p-8">
                    <h2 className="text-4xl font-headline font-bold text-white">Our Story</h2>
                 </div>
            </div>
            <CardContent className="p-8 text-muted-foreground space-y-6 text-lg leading-relaxed">
               <p>
                  Moving is one of life’s biggest headaches — but it doesn’t have to be. Most of the stress doesn’t come from the move itself… it comes from everything leading up to it. Finding boxes. Fighting with tape. Hoping they don’t collapse halfway to the car. Digging through piles of mismatched cardboard and scrunched-up packing paper.
                </p>
                <p>
                  At StakIt Hire, we knew there had to be a better way. So we built one.
                </p>
                <div className="bg-primary/5 p-6 rounded-xl border-l-4 border-primary">
                    <p className="font-headline font-bold text-foreground text-2xl mb-2">A Modern Way to Move</p>
                    <p>
                        Our goal is to replace the chaos of packing with a system that’s strong, simple, and built for real life. Our durable, reusable crates are designed to survive whatever your move throws at them — stairs, rain, heavy books, awkward kitchen gear. They don’t crumple. They don’t buckle. They don’t quit.
                    </p>
                </div>
                <p>
                  We deliver the crates to your door, you pack at your own pace, stack them securely, move with confidence, and we collect them when you’re done. That’s it. Zero waste. Zero fuss. Zero “oh no, the box just tore.”
                </p>
            </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-8 text-center">
        <Card className="border-none shadow-soft hover:shadow-premium transition-all">
          <CardHeader>
            <div className="mx-auto bg-primary/10 p-5 rounded-2xl w-fit">
               <Target className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl mt-4 font-headline">Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              To make the moving process simpler, smarter, and more sustainable for our community by providing a hassle-free rental service for high-quality moving equipment.
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-soft hover:shadow-premium transition-all">
          <CardHeader>
            <div className="mx-auto bg-primary/10 p-5 rounded-2xl w-fit">
               <Eye className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl mt-4 font-headline">Our Vision</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
                To become the go-to alternative to cardboard boxes, setting a new standard for how people pack, move, and organise — with cleaner, smarter, and more sustainable solutions.
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-soft hover:shadow-premium transition-all">
          <CardHeader>
            <div className="mx-auto bg-primary/10 p-5 rounded-2xl w-fit">
               <Users className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl mt-4 font-headline">Our Commitment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              We are a local business dedicated to serving the Greater Penrith Area. We promise transparent pricing, reliable service, and a friendly face every step of the way.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="text-center bg-muted/50 border-2 border-dashed border-muted">
          <CardHeader>
            <CardTitle className="text-3xl font-headline">Ready to Plan Your Move?</CardTitle>
            <CardDescription className="text-lg">
                Let us help make it your easiest one yet.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
              <Button asChild size="lg" className="h-14 px-10 shadow-premium">
                  <Link href="/quote">
                      Request a Quote
                      <ArrowRight className="ml-3 h-5 w-5" />
                  </Link>
              </Button>
          </CardContent>
      </Card>
    </div>
  );
}
