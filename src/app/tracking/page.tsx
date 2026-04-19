
'use client';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { CheckCircle, Clock, History, Loader2, XCircle, AlertTriangle, CreditCard, Calendar as CalendarIcon, Truck } from 'lucide-react';
import type { QuoteRequestWithId } from '@/lib/types';
import { useFirebase, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { loadStripe } from '@stripe/stripe-js';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useState, useMemo } from 'react';
import { calculateQuoteTotal, calculateExtensionCost } from '@/lib/quote-calculator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';


// Make sure to use your actual Stripe publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

const statusInfo: { [key: string]: { icon: React.ElementType, style: string, description: string } } = {
  Pending: { icon: Clock, style: 'text-yellow-600', description: 'Your request is submitted and awaiting review.' },
  'In Review': { icon: Loader2, style: 'text-yellow-600 animate-spin', description: 'Our team is reviewing your request.' },
  Approved: { icon: CheckCircle, style: 'text-green-600', description: 'Your quote is approved. Please proceed to payment.' },
  Paid: { icon: CreditCard, style: 'text-indigo-600', description: 'Your order is confirmed and scheduled for delivery.' },
  'Day of Delivery': { icon: Truck, style: 'text-cyan-600', description: 'Your order is out for delivery today!' },
  Delivered: { icon: Truck, style: 'text-blue-600', description: 'Your equipment has been delivered.' },
  Completed: { icon: History, style: 'text-gray-600', description: 'This rental has been completed.' },
  Rejected: { icon: XCircle, style: 'text-red-600', description: 'Your request could not be approved at this time.' },
};

const statusStyles: { [key: string]: string } = {
  Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800',
  'In Review': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800',
  Approved: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800',
  Paid: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-800',
  'Day of Delivery': 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/50 dark:text-cyan-300 dark:border-cyan-800',
  Delivered: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800',
  Completed: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/50 dark:text-gray-300 dark:border-gray-800',
  Rejected: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800',
};


function QuoteCard({ request, onExtend }: { request: QuoteRequestWithId; onExtend: (quote: QuoteRequestWithId) => void; }) {
    const { toast } = useToast();
    const isStripeConfigured = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    const isDeliveryDay = useMemo(() => {
        if (request.status !== 'Paid') return false;
        const today = new Date();
        const startDate = new Date(request.rentalStartDate);
        today.setHours(0, 0, 0, 0);
        startDate.setHours(0, 0, 0, 0);
        return today.getTime() === startDate.getTime();
    }, [request.status, request.rentalStartDate]);

    const displayStatus = isDeliveryDay ? 'Day of Delivery' : request.status;

    const StatusIcon = statusInfo[displayStatus]?.icon || Clock;
    const statusStyle = statusInfo[displayStatus]?.style || 'text-gray-600';
    const statusDescription = statusInfo[displayStatus]?.description || '';

    const calculation = useMemo(() => {
        return calculateQuoteTotal(request.items, request.rentalStartDate, request.rentalEndDate, request.stakitShield);
    }, [request]);

    const { subtotal, extensionFee, extraWeeks, deliveryFee, stakitShieldFee, total } = calculation;

    const formatPrice = (price: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);

    const handlePayment = async (request: QuoteRequestWithId) => {
        if (!isStripeConfigured) {
            toast({
                variant: 'destructive',
                title: 'Payment System Not Configured',
                description: 'Please add your Stripe API keys to the .env file to enable payments.',
            });
            return;
        }
        try {
            const response = await fetch('/api/checkout_sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quoteId: request.id, customerId: request.customerId }),
            });

            if (!response.ok) {
                const { error } = await response.json();
                throw new Error(error || 'Failed to create checkout session.');
            }

            const { sessionId } = await response.json();
            const stripe = await stripePromise;

            if (!stripe) {
                throw new Error('Stripe.js has not loaded yet.');
            }

            const { error } = await stripe.redirectToCheckout({ sessionId });

            if (error) {
                toast({
                    variant: 'destructive',
                    title: 'Payment Error',
                    description: error.message || 'An unexpected error occurred.',
                });
            }
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Could not initiate payment.',
            });
        }
    };
    
    const isRentalActive = (request.status === 'Paid' || request.status === 'Delivered') && new Date(request.rentalEndDate) > new Date();

    return (
         <Card key={request.id} className="overflow-hidden">
            <CardHeader className="flex flex-row items-start bg-muted/50">
                <div className="grid gap-0.5">
                <CardTitle className="group flex items-center gap-2 text-lg font-headline">
                    {request.projectDescription || `Request from ${new Date(request.submittedDate).toLocaleDateString()}`}
                    <Badge variant="outline" className={cn("whitespace-nowrap", statusStyles[displayStatus])}>
                        {displayStatus}
                    </Badge>
                </CardTitle>
                <CardDescription>Request ID: {request.id}</CardDescription>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    {request.status === 'Approved' && (
                        <Button onClick={() => handlePayment(request)}>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Pay Now
                        </Button>
                    )}
                    {isRentalActive && (
                        <Button variant="outline" onClick={() => onExtend(request)}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            Extend Rental
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-6 text-sm">
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <div className="font-semibold mb-3">Equipment Requested</div>
                        <ul className="grid gap-3">
                            {request.items.map((item, index) => (
                                <li key={`${item.id}-${index}`} className="flex items-start justify-between">
                                    <div>
                                        <span className="text-muted-foreground">
                                            {item.name} (x{item.quantity})
                                        </span>
                                         {item.sizes && item.sizes.length > 0 && (
                                            <p className="text-xs text-muted-foreground/80 pl-2">
                                                ({item.sizes.filter(s => s).join(', ') || 'Sizes not specified'})
                                            </p>
                                        )}
                                    </div>
                                    <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <div className="font-semibold">Price Summary</div>
                        <ul className="grid gap-3">
                             <li className="flex items-center justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>{formatPrice(subtotal)}</span>
                            </li>
                             <li className="flex items-center justify-between">
                                <span className="text-muted-foreground">Delivery & Collection Fee</span>
                                <span>{formatPrice(deliveryFee)}</span>
                            </li>
                            {extensionFee > 0 && (
                                 <li className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Rental Extension ({extraWeeks} extra {extraWeeks > 1 ? 'weeks' : 'week'})</span>
                                    <span>{formatPrice(extensionFee)}</span>
                                </li>
                            )}
                            {stakitShieldFee > 0 && (
                                <li className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Box Protection Plan</span>
                                    <span>{formatPrice(stakitShieldFee)}</span>
                                </li>
                            )}
                        </ul>
                        <Separator className="my-2" />
                        <div className="flex items-center justify-between font-semibold">
                            <span className="text-base">Total</span>
                            <span className="text-base">{formatPrice(total)}</span>
                        </div>
                    </div>
                </div>
                <Separator className="my-4" />
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-3">
                    <div className="font-semibold">Rental Start</div>
                    <dd className="text-muted-foreground">
                        {new Date(request.rentalStartDate).toLocaleDateString()}
                    </dd>
                    </div>
                    <div className="grid gap-3">
                    <div className="font-semibold">Rental End</div>
                    <dd className="text-muted-foreground">
                        {new Date(request.rentalEndDate).toLocaleDateString()}
                    </dd>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
                <div className="text-sm text-muted-foreground flex items-center">
                <StatusIcon className={cn("mr-2 h-4 w-4", statusStyle)} />
                <span className="mr-1 font-semibold">{displayStatus}:</span>
                {statusDescription}
                </div>
            </CardFooter>
        </Card>
    );
}

function ExtensionDialog({ quote, onClose }: { quote: QuoteRequestWithId, onClose: () => void }) {
    const { toast } = useToast();
    const [newEndDate, setNewEndDate] = useState<Date | undefined>();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { cost, additionalWeeks } = useMemo(() => {
        if (!newEndDate) return { cost: 0, additionalWeeks: 0 };
        return calculateExtensionCost(quote.items, quote.rentalStartDate, quote.rentalEndDate, newEndDate.toISOString());
    }, [newEndDate, quote]);

    const formatPrice = (price: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
    
    const handleExtensionPayment = async () => {
        if (!newEndDate) {
            toast({ variant: 'destructive', title: 'Please select a new end date.' });
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/checkout_sessions/extend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    quoteId: quote.id, 
                    customerId: quote.customerId, 
                    newEndDate: newEndDate.toISOString() 
                }),
            });

            if (!response.ok) {
                const { error } = await response.json();
                throw new Error(error || 'Failed to create extension checkout session.');
            }

            const { sessionId } = await response.json();
            const stripe = await stripePromise;
            if (!stripe) throw new Error('Stripe.js has not loaded yet.');

            const { error } = await stripe.redirectToCheckout({ sessionId });
            if (error) throw new Error(error.message || 'An unexpected error occurred during checkout.');

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={!!quote} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Extend Your Rental</DialogTitle>
                    <DialogDescription>
                        Select a new end date for your rental period. The additional cost will be calculated below.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                        <h4 className="font-semibold">Select New End Date</h4>
                        <Calendar
                            mode="single"
                            selected={newEndDate}
                            onSelect={setNewEndDate}
                            disabled={(date) => date <= new Date(quote.rentalEndDate)}
                            initialFocus
                        />
                    </div>
                    <div className="space-y-4">
                         <div>
                            <h4 className="font-semibold">Current End Date</h4>
                            <p className="text-muted-foreground">{new Date(quote.rentalEndDate).toLocaleDateString()}</p>
                        </div>
                        {newEndDate && (
                            <div>
                                <h4 className="font-semibold">New End Date</h4>
                                <p className="text-muted-foreground">{newEndDate.toLocaleDateString()}</p>
                            </div>
                        )}
                        {additionalWeeks > 0 && (
                            <div>
                                <h4 className="font-semibold">Extension Period</h4>
                                <p className="text-muted-foreground">{additionalWeeks} extra {additionalWeeks > 1 ? 'weeks' : 'week'}</p>
                            </div>
                        )}
                        <Separator />
                        <div className="text-lg font-bold flex justify-between">
                            <span>Extension Cost:</span>
                            <span>{formatPrice(cost)}</span>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleExtensionPayment} disabled={isSubmitting || cost <= 0}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                        Pay for Extension
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


export default function TrackingPage() {
    const { firestore } = useFirebase();
    const { user, isUserLoading } = useUser();
    const [extendingQuote, setExtendingQuote] = useState<QuoteRequestWithId | null>(null);
    
    const quoteRequestsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return collection(firestore, 'customers', user.uid, 'quoteRequests');
    }, [firestore, user]);

    const { data: quoteRequests, isLoading: isQuotesLoading } = useCollection<QuoteRequestWithId>(quoteRequestsQuery);

  const isLoading = isUserLoading || isQuotesLoading;

  return (
    <div className="container mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-headline font-bold text-foreground">My Quote Requests</h1>
        <p className="mt-2 text-lg text-muted-foreground">Track the status of your equipment rental quotes.</p>
      </header>
      <div className="space-y-6">
        {isLoading ? (
             <div className="flex justify-center items-center h-64">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
             </div>
        ) : !user || user.isAnonymous ? (
            <Card className="text-center">
                <CardHeader>
                    <CardTitle>Please Sign In</CardTitle>
                    <CardDescription>You need to be logged in to view your quote requests.</CardDescription>
                </CardHeader>
            </Card>
        ) : quoteRequests && quoteRequests.length > 0 ? (
          quoteRequests
            .sort((a,b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime())
            .map((request) => <QuoteCard key={request.id} request={request} onExtend={setExtendingQuote} />)
        ) : (
             <Card className="text-center">
                <CardHeader>
                    <CardTitle>No Requests Found</CardTitle>
                    <CardDescription>You haven't submitted any quote requests yet.</CardDescription>
                </CardHeader>
             </Card>
        )}
      </div>

       {extendingQuote && (
        <ExtensionDialog 
            quote={extendingQuote} 
            onClose={() => setExtendingQuote(null)} 
        />
      )}

    </div>
  );
}
