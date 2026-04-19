'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { QuoteRequestWithId } from '@/lib/types';
import { getQuoteForConfirmation, confirmDelivery } from '../actions';
import { Separator } from '@/components/ui/separator';

const confirmationSchema = z.object({
  receivedItems: z.boolean().refine(val => val === true, { message: 'You must confirm receipt of items.' }),
  inspectedItems: z.boolean().refine(val => val === true, { message: 'You must confirm item inspection.' }),
  reportDamage: z.boolean().refine(val => val === true, { message: 'You must acknowledge the damage reporting policy.' }),
});

type ConfirmationFormValues = z.infer<typeof confirmationSchema>;

export default function ConfirmDeliveryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [quote, setQuote] = useState<QuoteRequestWithId | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const quoteId = params.quoteId as string;
  const customerId = searchParams.get('customerId');

  const form = useForm<ConfirmationFormValues>({
    resolver: zodResolver(confirmationSchema),
    defaultValues: {
      receivedItems: false,
      inspectedItems: false,
      reportDamage: false,
    },
  });

  useEffect(() => {
    if (!quoteId || !customerId) {
      setError('Invalid confirmation link. Please scan the QR code again.');
      setIsLoading(false);
      return;
    }

    const fetchQuote = async () => {
      const result = await getQuoteForConfirmation(quoteId, customerId);
      if (result.success) {
        setQuote(result.data);
        if(result.data.deliveryConfirmationTimestamp) {
          setIsConfirmed(true);
        }
      } else {
        setError(result.error);
      }
      setIsLoading(false);
    };

    fetchQuote();
  }, [quoteId, customerId]);
  
  const onSubmit = async () => {
    if (!quoteId || !customerId) return;
    
    const result = await confirmDelivery(quoteId, customerId);
    if (result.success) {
        toast({
            title: 'Delivery Confirmed!',
            description: 'Thank you for confirming. Your records have been updated.',
        });
        setIsConfirmed(true);
    } else {
        toast({
            variant: 'destructive',
            title: 'Confirmation Failed',
            description: result.error,
        });
    }
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-10 w-10 animate-spin" /></div>;
  }

  if (error) {
    return (
        <div className="flex h-screen items-center justify-center">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
                    <CardTitle className="text-destructive">An Error Occurred</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground">{error}</p>
                </CardContent>
            </Card>
        </div>
    );
  }

  if (isConfirmed) {
    return (
        <div className="flex h-screen items-center justify-center">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                    <CardTitle>Delivery Already Confirmed</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground">
                        This delivery was confirmed on {new Date(quote?.deliveryConfirmationTimestamp!).toLocaleString()}. No further action is needed.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="container mx-auto max-w-lg py-8 md:py-16">
      <Card>
        <CardHeader>
          <CardTitle>Confirm Your Delivery</CardTitle>
          <CardDescription>Please review your order and confirm the following points.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="mb-6 space-y-2">
                <h3 className="font-semibold">Items Delivered:</h3>
                {quote && quote.items.length > 0 ? (
                    <ul className="list-disc pl-5 text-sm text-muted-foreground">
                        {quote.items.map(item => <li key={item.id}>{item.name} (x{item.quantity})</li>)}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground">No items listed for this order.</p>
                )}
            </div>

            <Separator className="my-6" />

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="receivedItems"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>I confirm I have received all listed items.</FormLabel>
                                <FormMessage />
                            </div>
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="inspectedItems"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>I have inspected the items OR had the opportunity to inspect them.</FormLabel>
                                <FormMessage />
                            </div>
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="reportDamage"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>I understand I must report pre-existing damage within 12 hours.</FormLabel>
                                <FormMessage />
                            </div>
                        </FormItem>
                    )}
                />

              <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm & Accept Delivery
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
