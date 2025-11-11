import { Lead } from '../types';

export async function sendLeadsToWebhook(leads: Lead[], webhookUrl: string): Promise<boolean> {
  if (leads.length === 0) {
    return true; // Nothing to send, operation is trivially successful
  }

  if (!webhookUrl) {
    console.error('Webhook URL is not provided.');
    return false;
  }
  
  try {
    // We remove client-side only properties from each lead before sending
    const payload = leads.map(lead => {
      const { id, webhookStatus, ...leadData } = lead;
      return leadData;
    });

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload), // Send the entire array of leads
    });

    if (!response.ok) {
      console.error(`Webhook failed with status: ${response.status}`, await response.text());
      return false;
    }
    
    console.log(`Successfully sent ${leads.length} leads to webhook.`);
    return true;
  } catch (error) {
    console.error('Error sending leads to webhook:', error);
    return false;
  }
}
