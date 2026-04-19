
import { Metadata } from 'next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { carouselItems } from '@/lib/data';
import placeholderImageData from '@/lib/placeholder-images.json';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PackageSearch, ClipboardCheck, Truck, Leaf, Sparkles, ArrowRight, MapPin, Rocket, Smile, Home } from 'lucide-react';


export const metadata: Metadata = {
  title: 'StakIt Hire',
  description: 'Your one-stop shop for equipment rental.',
};

export default function HomePage() {
  const { placeholderImages } = placeholderImageData;
  const heroImage = placeholderImages.find(img => img.id === 'hero-background');

  return (
    <div className="space-y-12">
        <section className="relative text-center py-20 md:py-32 rounded-lg overflow-hidden -m-4 sm:-m-6 lg:-m-8">
            {heroImage && (
                <Image
                    src={heroImage.imageUrl}
                    alt="Background of a person moving into a new home"
                    fill
                    className="object-cover"
                    data-ai-hint={heroImage.imageHint}
                    priority
                />
            )}
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative z-10 container mx-auto">
                <h1 className="text-5xl font-bold text-white mb-2">
                    Welcome to StakIt Hire
                </h1>
                <h2 className="text-2xl font-semibold text-white/80 tracking-wide uppercase mb-4">
                    Boxes that don&apos;t quit — Pack. Stack. Move.
                </h2>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                    Everything you need to move house — delivered to your door, organised, and taken away when you&apos;re done.
                    <span className="block mt-4 font-medium tracking-wide">No cardboard. No chaos. No wasted time.</span>
                </p>
                <div className="flex justify-center gap-4">
                    <Button asChild size="lg">
                    <Link href="/pricing">View Our Prices</Link>
                    </Button>
                    <Button asChild variant="secondary" size="lg">
                    <Link href="/quote">Request a Quote</Link>
                    </Button>
                </div>
            </div>
        </section>

        <section className="container mx-auto">
            <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6 flex items-center justify-center text-center">
                    <div className="flex flex-col items-center gap-2">
                        <MapPin className="h-8 w-8 text-primary" />
                        <h2 className="text-xl font-semibold">Currently Servicing the Greater Penrith Area</h2>
                        <p className="text-muted-foreground max-w-md">
                            Our standard delivery zone covers the greater Penrith region. If you are outside this area, please contact us for a custom delivery quote.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </section>

      <main className="container mx-auto space-y-12">
        <section className="py-12">
          <h2 className="text-3xl font-bold text-center mb-8">
            Our Most Popular Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {carouselItems.map((item) => (
              <div key={item.id} className="p-1 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg rounded-lg">
                <Card className="overflow-hidden h-full flex flex-col">
                  <div className="relative h-48 w-full">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                      data-ai-hint={item.imageHint}
                    />
                  </div>
                  <div className="flex flex-col flex-grow">
                      <CardHeader>
                      <CardTitle>
                          {item.name}
                      </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-grow">
                      <CardDescription>{item.description}</CardDescription>
                      </CardContent>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </section>

        <section className="py-12">
          <h2 className="text-3xl font-bold text-center mb-8">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center space-y-4">
                  <div className="bg-primary/10 p-4 rounded-full">
                      <PackageSearch className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">1. Choose Your Move Setup</h3>
                  <p className="text-muted-foreground">Pick a kit or customise what you need — we’ll help you get it right.</p>
              </div>
              <div className="flex flex-col items-center space-y-4">
                  <div className="bg-primary/10 p-4 rounded-full">
                      <ClipboardCheck className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">2. Book in Seconds</h3>
                  <p className="text-muted-foreground">Request a quote and lock in your delivery dates.</p>
              </div>
              <div className="flex flex-col items-center space-y-4">
                  <div className="bg-primary/10 p-4 rounded-full">
                      <Truck className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">3. We Deliver & Collect</h3>
                  <p className="text-muted-foreground">We bring everything to your door — and pick it up when you're done.</p>
              </div>
          </div>
        </section>

        <section className="py-12 bg-muted -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="container mx-auto text-center">
              <h2 className="text-3xl font-bold mb-10">
                Why Choose StakIt Hire?
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="flex flex-col items-center space-y-3">
                      <div className="bg-primary/10 p-4 rounded-full">
                         <Rocket className="h-10 w-10 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold pt-2">Move Faster</h3>
                      <p className="text-muted-foreground">Pack in less time with stackable, ready-to-use crates — no tape, no building boxes.</p>
                  </div>
                  <div className="flex flex-col items-center space-y-3">
                      <div className="bg-primary/10 p-4 rounded-full">
                          <Smile className="h-10 w-10 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold pt-2">Less Stress, Less Mess</h3>
                      <p className="text-muted-foreground">No cardboard clutter, no last-minute runs to the shops — just a clean, organised move.</p>
                  </div>
                   <div className="flex flex-col items-center space-y-3">
                      <div className="bg-primary/10 p-4 rounded-full">
                          <Truck className="h-10 w-10 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold pt-2">Delivered & Done</h3>
                      <p className="text-muted-foreground">We drop everything off and collect it when you're finished. Simple.</p>
                  </div>
                   <div className="flex flex-col items-center space-y-3">
                      <div className="bg-primary/10 p-4 rounded-full">
                          <Leaf className="h-10 w-10 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold pt-2">Smarter & More Sustainable</h3>
                      <p className="text-muted-foreground">Reusable crates that are stronger, cleaner, and better for the environment.</p>
                  </div>
                   <div className="flex flex-col items-center space-y-3">
                      <div className="bg-primary/10 p-4 rounded-full">
                          <Sparkles className="h-10 w-10 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold pt-2">Professionally Cleaned</h3>
                      <p className="text-muted-foreground">Every crate is thoroughly cleaned and ready for your move.</p>
                  </div>
                  <div className="flex flex-col items-center space-y-3">
                        <div className="bg-primary/10 p-4 rounded-full">
                            <Home className="h-10 w-10 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold pt-2">Designed for Real Moves</h3>
                        <p className="text-muted-foreground">From small apartments to full family homes — our kits are built to match your move size.</p>
                    </div>
              </div>
          </div>
        </section>

        <section className="py-16">
            <div className="container mx-auto text-center">
                <h2 className="text-3xl font-bold">Ready for a smarter move?</h2>
                <p className="text-muted-foreground mt-2 mb-6">Check out our packages and find the perfect fit for your needs.</p>
                <Button asChild size="lg">
                    <Link href="/pricing">
                        View Our Pricing
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
        </section>
      </main>
    </div>
  );
}
