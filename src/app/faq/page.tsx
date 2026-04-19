
import { Metadata } from 'next';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'FAQ | StakIt Hire',
  description: 'Frequently asked questions about our equipment rental services.',
};

const faqSections = {
    "Booking & Ordering": [
        {
            question: "Do I need an account to request a quote?",
            answer: "You don't need to create an account beforehand. When you request your first quote, a guest profile is automatically created for you so you can track its status. You can choose to sign in with Google to save your details for future requests."
        },
        {
            question: "How far in advance should I book?",
            answer: "We recommend booking at least one to two weeks in advance to ensure availability, especially during peak moving seasons (like the end of the month or holidays). However, we will always do our best to accommodate last-minute requests."
        },
        {
            question: "Can I change my order after it has been placed?",
            answer: "Yes, you can modify your order up to 48 hours before your scheduled delivery date, subject to availability. Please contact our team as soon as possible to make any adjustments to your order."
        },
        {
            question: "Can I order more boxes if I run out during my move?",
            answer: "Absolutely. If you find you need more equipment mid-move, simply contact us and we can arrange an additional delivery. Please note that additional delivery fees and rental charges will apply."
        }
    ],
    "Pricing & Payment": [
        {
            question: "When do I pay for my order?",
            answer: "Payment is required after your quote has been reviewed and approved by our team. Once approved, you will be able to complete the payment securely online through the 'My Requests' page. We require payment to be completed before the delivery is scheduled."
        },
        {
            question: "What is the standard hire period?",
            answer: "Our standard hire period is one week, which is included in your package price. We understand that sometimes moves take a little longer, so we offer a flexible and affordable extension option that is calculated automatically when you select your dates on the quote form."
        },
        {
            question: "Do I get a refund if I don't use all the boxes?",
            answer: "Our curated packages are offered at a discounted bundle rate, and unfortunately, we cannot offer refunds for unused boxes within these kits. We always recommend using our kit descriptions as a guide to choose the best fit for your home size. If you're unsure, it's often better to order slightly more than you think you'll need."
        },
        {
            question: "What is the Box Protection Plan?",
            answer: "The Box Protection Plan is an optional $20 add-on that provides peace of mind. It covers the standard $20 damage fee for up to three (3) of our moving boxes. Please note it does not cover lost items or damage to other equipment like trolleys or mattress protectors. You can read the full details on our Box Protection Plan policy page."
        },
        {
            question: "What happens if I damage or lose equipment?",
            answer: "We understand accidents happen. A fee of $20 per damaged box and $35 per lost box will be charged. For high-value items like our Hand Trolley or Stair Climber Trolley, a $250 fee applies if they are lost or returned with significant, irreparable damage. We recommend opting for our Box Protection Plan to cover minor box damage."
        },
        {
            question: "Do you have a cancellation policy?",
            answer: "Yes. Cancellations made within 48 hours of the scheduled rental date will incur a 50% fee to cover administration and operational costs."
        },
    ],
    "Delivery & Logistics": [
        {
            question: "What areas do you deliver to?",
            answer: "We currently service the Greater Penrith Area. Delivery to our standard service zone is included in the delivery fee. For deliveries outside this area, additional charges may apply. Please contact us with your address for a specific quote if you are unsure."
        },
        {
            question: "Do you collect from a different address?",
            answer: "Yes, we can collect from a different address. However, the collection must still be within the Greater Penrith Area, otherwise additional fees may apply."
        },
        {
            question: "What does the delivery fee cover?",
            answer: "Our standard delivery fee covers both the drop-off of your hired equipment at the beginning of your rental period and the collection from your specified address at the end of it."
        },
        {
            question: "What if I'm not home for delivery or collection?",
            answer: "Not a problem! As long as there is a safe and accessible place for us to leave or retrieve the equipment (e.g., a covered porch, inside a garage), you do not need to be present. Just be sure to specify this in the 'Additional Information' section when you request your quote."
        }
    ],
    "Using the Equipment": [
        {
            question: "Do I need to clean the boxes before you collect them?",
            answer: "A general clean isn't required as we professionally clean and sanitize every box between uses. However, we do ask that you wipe down any heavily soiled boxes before collection."
        },
        {
            question: "Can I use my own labels or stickers on the boxes?",
            answer: "We provide a dedicated space on each box for labels so you can easily identify the contents, and we sell moving sticker packs for this purpose. To avoid cleaning fees, please avoid using strong adhesives or permanent markers on other parts of the boxes."
        }
    ]
};

export default function FAQPage() {
  return (
    <div className="container mx-auto max-w-4xl space-y-12 py-8">
      <header className="text-center">
        <h1 className="text-4xl font-headline font-bold text-foreground">
          Frequently Asked Questions
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Find answers to common questions about our services.
        </p>
      </header>

      <div className="space-y-8">
        {Object.entries(faqSections).map(([sectionTitle, items]) => (
             <Card key={sectionTitle}>
                <CardHeader>
                    <CardTitle>{sectionTitle}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Accordion type="single" collapsible className="w-full">
                        {items.map((item, index) => (
                            <AccordionItem value={`${sectionTitle}-${index}`} key={index} className="px-6">
                                <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline">
                                    {item.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-base text-muted-foreground">
                                    {item.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        ))}
      </div>


      <Card className="text-center bg-muted/50">
          <CardHeader>
            <CardTitle>Can't find your answer?</CardTitle>
            <CardDescription>
                If you have other questions, we're here to help.
            </CardDescription>
          </CardHeader>
          <CardContent>
              <Button asChild>
                  <Link href="/contact">
                      Contact Us
                      <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
              </Button>
          </CardContent>
      </Card>
    </div>
  );
}
