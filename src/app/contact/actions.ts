
'use server';

/**
 * This server action is no longer in use.
 * The contact form now submits directly from the client-side
 * to align with security best practices and Firestore rules.
 * This file is kept for historical purposes but can be safely removed.
 */
export async function submitContactForm(
    formData: any
): Promise<{ success: true } | { success: false; error: string }> {
     console.warn("submitContactForm server action is deprecated and should not be used.");
     return { success: false, error: "This function is deprecated." };
}
