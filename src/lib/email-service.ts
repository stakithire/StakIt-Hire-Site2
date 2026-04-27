'use server';

import * as SibApiV3Sdk from '@getbrevo/brevo';

// Initialize the Brevo API client
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

if (process.env.BREVO_API_KEY) {
    // Set the API key from environment variables
    apiInstance.setApiKey(
        SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
        process.env.BREVO_API_KEY
    );
}


// Define the structure for our email sending function
interface EmailOptions {
    to: { email: string; name: string }[];
    subject: string;
    templateId: number;
    params?: { [key: string]: any };
}

/**
 * Sends a transactional email using the Brevo API.
 * @param options - The email options including recipient, subject, template ID, and dynamic parameters.
 */
export async function sendTransactionalEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
    if (!process.env.BREVO_API_KEY) {
        console.error("Brevo API key is not configured. Email not sent.");
        // In development, we might not want to fail hard, but in production this is an issue.
        // For now, we will return an error but not throw.
        return { success: false, error: "Email service is not configured." };
    }

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.sender = { email: 'stakithire@gmail.com', name: 'StakIt Hire' };
    sendSmtpEmail.to = options.to;
    sendSmtpEmail.subject = options.subject;
    sendSmtpEmail.templateId = options.templateId;
    if (options.params) {
        sendSmtpEmail.params = options.params;
    }
    sendSmtpEmail.replyTo = { email: 'stakithire@gmail.com', name: 'StakIt Hire' };

    try {
        await apiInstance.sendTransacEmail(sendSmtpEmail);
        return { success: true };
    } catch (error: any) {
        console.error('Error sending email via Brevo:', error.response?.body || error.message);
        return { success: false, error: 'Failed to send email.' };
    }
}
