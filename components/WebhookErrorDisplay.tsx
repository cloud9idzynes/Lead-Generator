import React from 'react';

interface Props {
  error: string;
}

const getTroubleshootingTips = (status: number | null, errorMessage: string): React.ReactNode => {
  if (errorMessage.includes('Failed to fetch')) {
    return (
      <>
        <p><strong>(Network or CORS Error):</strong> This is a common browser security or network error. It usually means one of the following:</p>
        <ul className="list-disc list-inside mt-2 space-y-2">
          <li>
            <strong>Incorrect URL:</strong> The most frequent cause. Please double-check that the webhook URL is copied correctly, with no typos or extra characters.
          </li>
          <li>
            <strong>CORS Policy Issue:</strong> The receiving server (your automation tool) is not configured to accept requests from this web application. This is a security setting on their end.
            <ul className="list-disc list-inside ml-4 mt-1 text-sm text-red-300/80">
                <li>If you're using a standard webhook provider like Zapier or Make.com, this error is rare but could mean their service is having issues. Ensure the URL is correct.</li>
                <li>If sending to a custom server/API, you must configure its CORS policy to allow requests.</li>
            </ul>
          </li>
          <li>
            <strong>Ad Blocker / Extension:</strong> A browser extension or ad blocker might be blocking the request. Try disabling it temporarily and resending.
          </li>
        </ul>
      </>
    );
  }

  if (status === null) {
    return (
      <p>This might be a network issue or a problem with the URL's format. Please check your internet connection and verify the webhook URL is correct.</p>
    );
  }

  switch (status) {
    case 400:
      return <p><strong>(Bad Request):</strong> The receiving server did not understand the data format. This is rare, but check if your automation tool (e.g., Zapier) expects a different data structure.</p>;
    case 401:
    case 403:
      return (
        <>
          <p><strong>(Unauthorized / Forbidden):</strong> The receiving server rejected the request due to an invalid or missing secret token. This is a security measure to protect your webhook.</p>
          <p className="mt-2 font-semibold">Please check the following:</p>
          <ul className="list-disc list-inside mt-2 space-y-2">
            <li>
              <strong>Token Mismatch:</strong> The "Secret Auth Token" you entered in this app must be <strong className="text-white">exactly the same</strong> as the one you configured in your automation tool (e.g., Make.com, Zapier).
              <ul className="list-disc list-inside ml-4 mt-1 text-sm text-red-300/80">
                <li>Check for typos or extra spaces at the beginning or end.</li>
                <li>Tokens are often case-sensitive.</li>
              </ul>
            </li>
            <li>
              <strong>Configuration in Make.com:</strong> Ensure you have correctly added the token in your Make.com scenario.
               <ul className="list-disc list-inside ml-4 mt-1 text-sm text-red-300/80">
                <li>Open your "Custom webhook" module's settings.</li>
                <li>Go to <strong>Advanced Settings</strong> &rarr; <strong>Webhook authorization</strong>.</li>
                <li>The token must be added there.</li>
              </ul>
            </li>
             <li>
                <strong>Saved Changes:</strong> After adding the token to your webhook in your automation tool, did you remember to save the scenario?
             </li>
          </ul>
        </>
      );
    case 404:
      return <p><strong>(Not Found):</strong> The webhook URL you provided does not exist. Please double-check for typos.</p>;
    case 410:
      return (
        <>
          <p><strong>(Gone):</strong> This specific error means the webhook URL used to exist but is now permanently gone. This is common if you have deleted and re-created the webhook in your automation tool.</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Generate a <strong>new</strong> webhook URL in your tool (Zapier, Make, etc.).</li>
            <li>Copy the new URL and paste it into the form above.</li>
            <li>Ensure your automation/scenario is turned <strong>ON</strong>.</li>
          </ul>
        </>
      );
    case 500:
    case 502:
    case 503:
    case 504:
      return <p><strong>(Server Error):</strong> The problem is with the receiving service (e.g., Zapier's servers are temporarily down). Please try again in a few minutes or check their status page.</p>;
    default:
      return <p>Please check your webhook configuration in your automation tool to ensure it's active and correctly set up to receive a POST request with JSON data.</p>;
  }
};


const WebhookErrorDisplay: React.FC<Props> = ({ error }) => {
  const statusMatch = error.match(/status (\d{3})/);
  const status = statusMatch ? parseInt(statusMatch[1], 10) : null;

  return (
    <div className="max-w-4xl mx-auto mt-6 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">
      <p className="font-semibold text-red-200">Webhook Troubleshooting</p>
      <p className="font-mono text-sm my-2 p-2 bg-slate-900 rounded">{error}</p>
      <div className="mt-3 text-sm text-red-200">
        <p className="font-semibold mb-1">How to fix this:</p>
        {getTroubleshootingTips(status, error)}
      </div>
    </div>
  );
};

export default WebhookErrorDisplay;