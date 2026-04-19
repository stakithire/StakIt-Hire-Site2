
import { NextResponse, NextRequest } from 'next/server';
import Stripe from 'stripe';
import { getFirestore } from 'firebase-admin/firestore';
import type { QuoteRequestWithId } from '@/lib/types';
import { getAdminApp } from '@/lib/firebase-admin';
import { calculateExtensionCost } from '@/lib/quote-calculator';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

// Initialize Firebase Admin SDK
const adminFirestore = getFirestore(getAdminApp());

export async function POST(req: NextRequest) {
  try {
    const { quoteId, customerId, newEndDate } = await req.json();

    if (!quoteId || !customerId || !newEndDate) {
      return NextResponse.json({ error: 'Missing quoteId, customerId, or newEndDate' }, { status: 400 });
    }

    // Fetch the quote from Firestore using the Admin SDK
    const quoteRef = adminFirestore.collection('customers').doc(customerId).collection('quoteRequests').doc(quoteId);
    const quoteDoc = await quoteRef.get();

    if (!quoteDoc.exists) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    const quote = quoteDoc.data() as QuoteRequestWithId;

    if (quote.status !== 'Paid') {
        return NextResponse.json({ error: `Cannot extend a quote with status '${quote.status}'.` }, { status: 400 });
    }
    
    if (new Date(newEndDate) <= new Date(quote.rentalEndDate)) {
        return NextResponse.json({ error: 'New end date must be after the current end date.' }, { status: 400 });
    }

    // --- SECURELY RECALCULATE EXTENSION COST ON THE SERVER ---
    const { cost: extensionCost } = calculateExtensionCost(quote.items, quote.rentalStartDate, quote.rentalEndDate, newEndDate);
    const totalInCents = Math.round(extensionCost * 100);
    // --- END OF CALCULATION ---

    if (totalInCents <= 0) {
        return NextResponse.json({ error: 'Calculated extension cost is zero or less. Cannot create payment.' }, { status: 400 });
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: `Rental Extension for Quote - ${quoteId}`,
          description: `Extending rental period to ${new Date(newEndDate).toLocaleDateString()}`,
        },
        unit_amount: totalInCents,
      },
      quantity: 1,
    }];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_URL}/tracking?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/tracking?payment=cancelled`,
      customer_email: quote.customerEmail || undefined,
      metadata: {
        quoteId: quoteId,
        customerId: customerId,
        newEndDate: newEndDate,
        type: 'extension', // Flag to identify this as an extension payment
      },
    });

    if (!session.id) {
        throw new Error('Failed to create Stripe session for extension');
    }

    return NextResponse.json({ sessionId: session.id });

  } catch (err: any) {
    console.error('Error creating extension checkout session:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
