
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { buffer } from 'micro';
import { getFirestore } from 'firebase-admin/firestore';
import { sendTransactionalEmail } from '@/lib/email-service';
import type { QuoteRequestWithId } from '@/lib/types';
import { getAdminApp } from '@/lib/firebase-admin';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Initialize Firebase Admin SDK
const adminFirestore = getFirestore(getAdminApp());


async function handleInitialPayment(session: Stripe.Checkout.Session) {
    const { quoteId, customerId } = session.metadata || {};
    if (!quoteId || !customerId) throw new Error('Missing metadata for initial payment.');

    const quoteRef = adminFirestore.collection('customers').doc(customerId).collection('quoteRequests').doc(quoteId);
    await quoteRef.update({ status: 'Paid' });
    console.log(`✅ Successfully updated quote ${quoteId} to Paid.`);

    const quoteSnap = await quoteRef.get();
    if (quoteSnap.exists) {
        const quoteData = { id: quoteId, ...quoteSnap.data() } as QuoteRequestWithId;
        if (quoteData.customerEmail) {
            await sendTransactionalEmail({
                to: [{ email: quoteData.customerEmail, name: quoteData.customerName || 'Customer' }],
                subject: 'Your StakIt Hire Order is Confirmed!',
                templateId: 2, 
                params: {
                    customerName: quoteData.customerName || 'Customer',
                    quoteId: quoteId,
                    deliveryDate: new Date(quoteData.rentalStartDate).toLocaleDateString(),
                    deliveryAddress: quoteData.dropOffAddress,
                    trackingUrl: `${process.env.NEXT_PUBLIC_URL}/tracking`
                }
            });
            console.log(`✅ Sent order confirmation email for quote ${quoteId}.`);
        }
    } else {
         console.error(`🔥 Could not find quote ${quoteId} to send confirmation email.`);
    }
}


async function handleExtensionPayment(session: Stripe.Checkout.Session) {
    const { quoteId, customerId, newEndDate } = session.metadata || {};
    if (!quoteId || !customerId || !newEndDate) throw new Error('Missing metadata for extension payment.');

    const quoteRef = adminFirestore.collection('customers').doc(customerId).collection('quoteRequests').doc(quoteId);
    await quoteRef.update({ rentalEndDate: newEndDate });
    console.log(`✅ Successfully extended quote ${quoteId} to ${newEndDate}.`);

    const quoteSnap = await quoteRef.get();
    if (quoteSnap.exists) {
        const quoteData = { id: quoteId, ...quoteSnap.data() } as QuoteRequestWithId;
        if (quoteData.customerEmail) {
            await sendTransactionalEmail({
                to: [{ email: quoteData.customerEmail, name: quoteData.customerName || 'Customer' }],
                subject: 'Your StakIt Hire Rental Has Been Extended!',
                templateId: 3, // ASSUMPTION: Template ID 3 is for rental extensions
                params: {
                    customerName: quoteData.customerName || 'Customer',
                    quoteId: quoteId,
                    newEndDate: new Date(newEndDate).toLocaleDateString(),
                    trackingUrl: `${process.env.NEXT_PUBLIC_URL}/tracking`
                }
            });
             console.log(`✅ Sent rental extension confirmation email for quote ${quoteId}.`);
        }
    } else {
        console.error(`🔥 Could not find quote ${quoteId} to send extension email.`);
    }
}


export async function POST(req: NextRequest) {
  const buf = await buffer(req.body as any);
  const sig = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.error(`❌ Error message: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    try {
        const paymentType = session.metadata?.type || 'initial';
        
        if (paymentType === 'extension') {
            await handleExtensionPayment(session);
        } else {
            await handleInitialPayment(session);
        }
    } catch (error: any) {
        console.error(`🔥 Failed to process webhook for session ${session.id}:`, error.message);
        // If something fails, return a 500 to signal Stripe to retry the webhook.
        return NextResponse.json({ received: false, error: `Webhook processing failed: ${error.message}` }, { status: 500 });
    }
  } else {
     console.log(`🤷‍♀️ Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
