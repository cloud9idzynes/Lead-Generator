import { Lead } from '../types';

export async function sendLeadsToWebhook(leads: Lead[], webhookUrl: string, authToken?: string, authType: 'bearer' | 'apikey' = 'bearer'): Promise<{ success: boolean; message: string | null; status: number | null }> {
  if (leads.length === 0) {
    return { success: true, message: null, status: 200 }; // Nothing to send, operation is trivially successful
  }

  if (!webhookUrl) {
    console.error('Webhook URL is not provided.');
    return { success: false, message: 'Webhook URL is not provided.', status: null };
  }
  
  try {
    // We remove client-side only properties from each lead before sending
    const payload = leads.map(lead => {
      const { id, webhookStatus, ...leadData } = lead;
      return leadData;
    });

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (authToken) {
      if (authType === 'apikey') {
        headers['x-make-apikey'] = authToken;
      } else { // Default to 'bearer'
        headers['Authorization'] = `Bearer ${authToken}`;
      }
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload), // Send the entire array of leads
    });

    if (!response.ok) {
      const errorText = await response.text();
      const message = `Webhook failed with status ${response.status}. The service responded with: "${errorText || 'No response body'}"`;
      console.error(message);
      return { success: false, message: message, status: response.status };
    }
    
    console.log(`Successfully sent ${leads.length} leads to webhook.`);
    return { success: true, message: null, status: response.status };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown network error occurred.';
    console.error('Error sending leads to webhook:', error);
    return { success: false, message: `Network Error: ${message}`, status: null };
  }
}

export async function sendTestWebhook(webhookUrl: string, authToken: string, authType: 'bearer' | 'apikey', samplePayload: any[]): Promise<{ success: boolean; message: string | null; status: number | null }> {
  if (!webhookUrl) {
    return { success: false, message: 'Webhook URL is not provided.', status: null };
  }
  
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (authToken) {
      if (authType === 'apikey') {
        headers['x-make-apikey'] = authToken;
      } else { // Default to 'bearer'
        headers['Authorization'] = `Bearer ${authToken}`;
      }
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(samplePayload),
    });

    const responseBody = await response.text();

    if (!response.ok) {
      const message = `Webhook test failed with status ${response.status}. Response: "${responseBody || 'No response body'}"`;
      return { success: false, message: message, status: response.status };
    }
    
    return { success: true, message: `Test sent successfully! Response: "${responseBody || 'No response body'}"`, status: response.status };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown network error occurred.';
    return { success: false, message: `Network Error: ${message}`, status: null };
  }
}