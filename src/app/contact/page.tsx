
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Mail, Clock, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { submitContactForm } from './actions';
import { useToast } from '@/hooks/use-toast';

const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
  message: z.string().min(10, 'Message must be at least 10 characters long.'),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
    const { toast } = useToast();
    const form = useForm<ContactFormValues>({
        resolver: zodResolver(contactFormSchema),
        defaultValues: {
            name: '',
            email: '',
            message: '',
        }
    });

    const onSubmit = async (data: ContactFormValues) => {
        const result = await submitContactForm(data);
        if (result.success) {
            toast({
                title: "Message Sent!",
                description: "Thanks for reaching out. We'll get back to you shortly.",
            });
            form.reset();
        } else {
            toast({
                variant: 'destructive',
                title: 'Submission Failed',
                description: result.error,
            });
        }
    };
    
    const { isSubmitting } = form.formState;

  return (
    <div className="container mx-auto max-w-4xl space-y-12 py-8">
      <header className="text-center">
        <h1 className="text-4xl font-headline font-bold text-foreground">
          Contact Us
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Have a question? We'd love to hear from you.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              Reach out to us directly via phone or email.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
                <Mail className="h-5 w-5 text-primary" />
                <a href="mailto:stakithire@gmail.com" className="text-muted-foreground hover:text-foreground">
                    stakithire@gmail.com
                </a>
            </div>
            <div className="flex items-center gap-4">
                <Clock className="h-5 w-5 text-primary" />
                <span className="text-muted-foreground">7 days a week 9am-7pm</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Send Us a Message</CardTitle>
            <CardDescription>
                For general inquiries, fill out the form below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                     <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Your Name" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                     <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="your@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                     <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Your message..." {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Send Message
                    </Button>
                </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <Card className="text-center bg-muted/50">
          <CardHeader>
            <CardTitle>Looking for a Price?</CardTitle>
            <CardDescription>
                For detailed pricing and equipment requests, please use our quote form.
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
