
import { NextResponse, NextRequest } from 'next/server';
import Stripe from 'stripe';
import { getFirestore } from 'firebase-admin/firestore';
import type { QuoteRequestWithId } from '@/lib/types';
import { getAdminApp } from '@/lib/firebase-admin';
import { calculateQuoteTotal } from '@/lib/quote-calculator';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

// Initialize Firebase Admin SDK
const adminFirestore = getFirestore(getAdminApp());


export async function POST(req: NextRequest) {
  try {
    const { quoteId, customerId } = await req.json();

    if (!quoteId || !customerId) {
      return NextResponse.json({ error: 'Missing quoteId or customerId' }, { status: 400 });
    }

    // Fetch the quote from Firestore using the Admin SDK
    const quoteRef = adminFirestore.collection('customers').doc(customerId).collection('quoteRequests').doc(quoteId);
    const quoteDoc = await quoteRef.get();

    if (!quoteDoc.exists) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    const quote = quoteDoc.data() as QuoteRequestWithId;

    if (quote.status !== 'Approved') {
        return NextResponse.json({ error: `Quote status is '${quote.status}', not 'Approved'.` }, { status: 400 });
    }

    // --- RECALCULATE TOTAL PRICE ACCURATELY USING CENTRALIZED FUNCTION ---
    const { total } = calculateQuoteTotal(quote.items, quote.rentalStartDate, quote.rentalEndDate, quote.stakitShield);
    const totalInCents = Math.round(total * 100);
    // --- END OF PRICE CALCULATION ---

    if (totalInCents <= 0) {
        return NextResponse.json({ error: 'Calculated total is zero or less. Cannot create payment.' }, { status: 400 });
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: `StakIt Hire Quote - ${quoteId}`,
          description: quote.projectDescription || 'Equipment rental service',
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
      },
    });

    if (!session.id) {
        throw new Error('Failed to create Stripe session');
    }

    return NextResponse.json({ sessionId: session.id });

  } catch (err: any) {
    console.error('Error creating checkout session:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
