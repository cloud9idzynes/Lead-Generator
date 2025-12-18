import React from 'react';
import { XMarkIcon } from './Icons';

interface Props {
  onClose: () => void;
}

const WebhookSetupGuide: React.FC<Props> = ({ onClose }) => {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      aria-labelledby="webhook-guide-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] bg-slate-800 border border-slate-700 rounded-lg shadow-2xl text-slate-300 overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <div className="sticky top-0 bg-slate-800/80 backdrop-blur-lg z-10 p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 id="webhook-guide-title" className="text-xl font-bold text-white">Webhook Setup Guide for Make.com</h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Close setup guide"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6 text-sm">
          <p>
            Follow these steps to correctly connect this app to your automation workflows (e.g., to send leads to Google Sheets). These instructions use <strong className="text-cyan-400">Make.com</strong> as an example.
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-white">Step 1: Create a Webhook in Make.com</h3>
              <ol className="list-decimal list-inside mt-2 space-y-1 pl-2 text-slate-400">
                <li>In your Make.com scenario, add a new module and search for <code className="bg-slate-700 px-1 py-0.5 rounded text-cyan-300 text-xs">Webhooks</code>.</li>
                <li>Select the trigger <code className="bg-slate-700 px-1 py-0.5 rounded text-cyan-300 text-xs">Custom webhook</code>.</li>
                <li>Click "Add", give your webhook a name, and click "Save".</li>
                <li>Copy the new webhook URL that Make.com provides.</li>
              </ol>
            </div>
            
            <div className="p-4 bg-yellow-900/50 border border-yellow-600/60 rounded-lg text-yellow-200">
                <h3 className="font-semibold text-yellow-100">Important: Do Not Visit The URL in Your Browser</h3>
                <p className="mt-2 text-sm">
                    Pasting the webhook URL directly into your browser's address bar will result in a <code className="bg-slate-700 px-1 py-0.5 rounded text-xs">401 Unauthorized</code> error.
                </p>
                <p className="mt-1 text-xs">
                    This is because a browser sends a simple request without the required data or security headers. You <strong className="font-semibold">must</strong> use the <strong className="font-semibold">"Send Test"</strong> button within this app to properly trigger and configure your webhook.
                </p>
            </div>

            <div className="p-4 bg-slate-900/50 border border-cyan-500/50 rounded-lg">
              <h3 className="font-semibold text-cyan-300">Step 2: Secure Your Webhook (Choose One Method)</h3>
              <p className="mt-2 text-cyan-300/90">
                Make.com offers two ways to secure a webhook. This app supports both. Make sure the "Auth Method" you select in the app form matches the method you configure below.
              </p>
            </div>

            <div className="space-y-4 p-4 bg-slate-900/60 rounded-lg border border-slate-700">
                <h4 className="font-semibold text-white">Method A: Secret Token (Recommended)</h4>
                 <p className="text-xs text-slate-400">
                    Use this for standard token-based security. In the app, select <code className="bg-slate-700 px-1 py-0.5 rounded text-cyan-300 text-xs">Bearer Token</code> as the Auth Method.
                </p>
                <ol className="list-decimal list-inside mt-2 space-y-1 pl-2 text-slate-400">
                    <li>In Make.com, click your <code className="bg-slate-700 px-1 py-0.5 rounded text-cyan-300 text-xs">Custom webhook</code> module to open its settings.</li>
                    <li>At the bottom, click to expand the <strong className="text-white">"Advanced Settings"</strong>.</li>
                    <li>Find the "Webhook authorization" section and click the <strong className="text-white">"Add"</strong> button next to "Authorized tokens".</li>
                    <li>A field will appear. Create and paste in your secret token (e.g., <code className="bg-slate-700 px-1 py-0.5 rounded text-cyan-300 text-xs">my-super-secret-key-123</code>).</li>
                    <li>Click <strong className="text-white">"Save"</strong>.</li>
                    <li>Paste the <strong className="text-white">exact same token</strong> into the "Secret Auth Token / API Key" field in this app.</li>
                </ol>
            </div>

             <div className="space-y-4 p-4 bg-slate-900/60 rounded-lg border border-slate-700">
                <h4 className="font-semibold text-white">Method B: Make.com API Key</h4>
                 <p className="text-xs text-slate-400">
                    Use this if your organization requires using Make's built-in API keys. In the app, select <code className="bg-slate-700 px-1 py-0.5 rounded text-cyan-300 text-xs">Make.com API Key</code> as the Auth Method.
                </p>
                <ol className="list-decimal list-inside mt-2 space-y-1 pl-2 text-slate-400">
                  <li>In Make.com, go to your webhook settings &rarr; <strong className="text-white">"Advanced Settings"</strong>.</li>
                  <li>Find the "IP restrictions" section. You should see an option for API key restrictions.</li>
                  <li>Select the API key you want to use to secure this webhook.</li>
                  <li>Click <strong className="text-white">"Save"</strong>.</li>
                  <li>Paste your <strong className="text-white">API Key</strong> (not the token from Method A) into the "Secret Auth Token / API Key" field in this app.</li>
                </ol>
            </div>
            
            <div>
              <h3 className="font-semibold text-white">Step 3: Send Test Data to Configure</h3>
              <ol className="list-decimal list-inside mt-2 space-y-1 pl-2 text-slate-400">
                <li>Paste the copied URL into the "Webhook URL" field in this app.</li>
                <li>In Make.com, click the <strong className="text-white">"Redetermine data structure"</strong> button. Your webhook is now listening.</li>
                <li>Back in this app, click the <strong className="text-teal-400">"Send Test"</strong> button (found under "Advanced Settings").</li>
                <li>If successful, Make.com will show "Successfully determined."</li>
              </ol>
            </div>

            <div className="p-4 bg-slate-900/50 border border-orange-500/50 rounded-lg">
                <h3 className="font-semibold text-orange-300">Step 4: The Most Important Step - Parse the JSON</h3>
                <p className="mt-2 text-orange-300/90">
                    The webhook receives all the lead data packed into a single text block (a "JSON String"). You must add a step to unpack it.
                </p>
                <ol className="list-decimal list-inside mt-2 space-y-1 pl-2 text-slate-400">
                    <li>Hover over the line connecting your Webhook module to the next module (e.g., Google Sheets) and click the <strong className="text-white">"+" (Add a module)</strong> button.</li>
                    <li>Search for the <code className="bg-slate-700 px-1 py-0.5 rounded text-cyan-300 text-xs">JSON</code> module and select the action <code className="bg-slate-700 px-1 py-0.5 rounded text-cyan-300 text-xs">Parse JSON</code>.</li>
                    <li>In the <code className="bg-slate-700 px-1 py-0.5 rounded text-cyan-300 text-xs">Parse JSON</code> settings, you'll see a field called "JSON string". Click into it.</li>
                    <li>Select the value that comes from your first webhook module. It might be called <strong className="text-red-400">{'{value}'}</strong> or just be a generic text field. This is the raw, packed data.</li>
                    <li>Leave "Data structure" empty for now. Click "OK".</li>
                </ol>
            </div>

            <div>
              <h3 className="font-semibold text-white">Step 5: Map the Unpacked Fields</h3>
              <ol className="list-decimal list-inside mt-2 space-y-1 pl-2 text-slate-400">
                <li>Now, open your final module (e.g., "Google Sheets - Add a Row").</li>
                <li>When you click to map a field (like "Company Name"), you will see data from two modules: "Webhooks" and "JSON".</li>
                <li className="p-2 bg-red-900/30 border border-red-700/50 rounded-md">
                    <strong className="text-red-300">DO NOT</strong> use any data from the first "Webhooks" module. This is the packed value.
                </li>
                <li className="p-2 bg-green-900/30 border border-green-700/50 rounded-md">
                    <strong className="text-green-300">DO</strong> expand the "JSON" module's data. You will see all the individual fields like `companyName`, `email`, `phone`, etc. Map these to your spreadsheet columns.
                </li>
                <li>Save your scenario and turn it ON. You're all set!</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebhookSetupGuide;