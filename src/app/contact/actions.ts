
'use server';

import { getAdminFirestore } from '@/lib/firebase-admin';
import type { ContactMessage } from '@/lib/types';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
  message: z.string().min(10, 'Message must be at least 10 characters long.'),
});

export async function submitContactForm(
    formData: z.infer<typeof contactFormSchema>
): Promise<{ success: true } | { success: false; error: string }> {
     try {
        const validatedData = contactFormSchema.parse(formData);
        const adminFirestore = getAdminFirestore();

        const messageData: ContactMessage = {
            ...validatedData,
            status: 'New',
            submittedDate: new Date().toISOString(),
        };

        await adminFirestore.collection('contactMessages').add(messageData);

        revalidatePath('/admin');
        
        return { success: true };

     } catch (error: any) {
        console.error(`Error submitting contact form:`, error);
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors.map(e => e.message).join(', ') };
        }
        return { success: false, error: error.message || 'An unknown error occurred.' };
     }
}
