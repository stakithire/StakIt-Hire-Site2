import { Metadata } from 'next';
import { QuoteForm } from '@/components/quote-form';

export const metadata: Metadata = {
  title: 'Request a Quote | StakIt Hire',
};

export default function QuotePage() {
  return (
    <div className="container mx-auto max-w-4xl">
        <QuoteForm />
    </div>
  );
}
