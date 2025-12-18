import React, { useState } from 'react';
import { WebhookSettings } from '../types';
import { XMarkIcon, InformationCircleIcon, PaperAirplaneIcon } from './Icons';
import { sendTestWebhook } from '../services/webhookService';
import WebhookSetupGuide from './WebhookSetupGuide';

interface Props {
  onClose: () => void;
  onSave: (settings: WebhookSettings) => void;
  initialSettings: WebhookSettings;
}

const sampleLeadPayload = {
    generatedDate: "2024-08-15T10:30:00Z",
    searchCity: "New York",
    searchCountry: "USA",
    leadNumber: 1,
    companyName: "Sample Pizzeria",
    category: "Pizza Restaurants",
    description: "A sample pizzeria offering delicious, hand-tossed pizzas with fresh ingredients.",
    address: "123 Pizza Lane, New York, NY 10001",
    city: "New York",
    country: "USA",
    coordinates: { lat: 40.7128, lon: -74.0060 },
    phone: "212-555-0187",
    email: "contact@samplepizzeria.com",
    website: "https://www.samplepizzeria.com",
    linkedIn: null,
    facebook: "https://facebook.com/samplepizzeria",
    instagram: "https://instagram.com/samplepizzeria",
    twitter: null,
    rating: 4.5,
    reviewCount: 150,
    businessHours: { "Monday": "11-22", "Tuesday": "11-22", "Wednesday": "11-22", "Thursday": "11-22", "Friday": "11-23", "Saturday": "11-23", "Sunday": "12-21" },
    services: ["Pizza Delivery", "Dine-in", "Catering"],
    companySize: "11-50 employees",
    employeeCount: 25,
    postFrequency: 'Weekly',
    engagementLevel: 'Medium',
    qualityScore: 85,
    qualityReasoning: "Good online presence with a complete GBP listing and active social media.",
    status: 'New',
    contacted: false,
    notes: '',
    hasWebsite: true,
    websiteSeoScore: 7,
    hasGbpListing: true,
    gbpSeoScore: 8,
    seoRecommendations: "### Website SEO Suggestions\n**DIY Tips:** Improve page load speed.\n### Google Business Profile Suggestions\n**DIY Tips:** Encourage more customer reviews."
};

const SettingsModal: React.FC<Props> = ({ onClose, onSave, initialSettings }) => {
  const [settings, setSettings] = useState<WebhookSettings>(initialSettings);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testSendResult, setTestSendResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isCopied, setIsCopied] = useState(false);


  const handleSave = () => {
    onSave(settings);
  };

  const handleSendTest = async () => {
    if (!settings.url) {
      setTestSendResult({ success: false, message: "Please enter a webhook URL first." });
      return;
    }
    setIsSendingTest(true);
    setTestSendResult(null);

    const result = await sendTestWebhook(settings.url, settings.token, settings.authType, [sampleLeadPayload]);

    setTestSendResult({ success: result.success, message: result.message ?? "An unknown error occurred." });
    setIsSendingTest(false);

    setTimeout(() => {
        setTestSendResult(null);
    }, 8000);
  };

    const handleCopySampleJson = () => {
    const jsonPayload = JSON.stringify([sampleLeadPayload], null, 2);
    navigator.clipboard.writeText(jsonPayload).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    });
  };

  const inputClasses = "w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors";

  return (
    <>
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-fast"
      aria-labelledby="settings-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] bg-slate-800 border border-slate-700 rounded-lg shadow-2xl text-slate-300 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-slate-800/80 backdrop-blur-lg z-10 p-4 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
          <h2 id="settings-title" className="text-xl font-bold text-white">Webhook Settings</h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Close settings"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto">
           <div>
                <div className="flex items-center gap-2 mb-1">
                    <label htmlFor="webhookUrl" className="block text-sm font-medium text-slate-300">Webhook URL</label>
                    <button type="button" onClick={() => setIsGuideOpen(true)} className="text-slate-400 hover:text-cyan-400 transition-colors" aria-label="Open webhook setup guide">
                        <InformationCircleIcon className="w-5 h-5" />
                    </button>
                </div>
                <p className="text-xs text-slate-400 mb-2">
                    Enter the URL from your automation tool (e.g., Make.com, Zapier) to receive leads.
                </p>
                <input
                    id="webhookUrl"
                    type="url"
                    value={settings.url}
                    onChange={(e) => setSettings(s => ({ ...s, url: e.target.value }))}
                    placeholder="https://hook.us2.make.com/..."
                    className={inputClasses}
                />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <label htmlFor="authToken" className="block text-sm font-medium text-slate-300 mb-1">Secret Auth Token / API Key</label>
                 <input
                   id="authToken"
                   type="text"
                   value={settings.token}
                   onChange={(e) => setSettings(s => ({ ...s, token: e.target.value }))}
                   placeholder="Secret Token or API Key (Optional)"
                   className={inputClasses}
                 />
               </div>
               <div>
                 <label htmlFor="authType" className="block text-sm font-medium text-slate-300 mb-1">Auth Method</label>
                 <select
                   id="authType"
                   value={settings.authType}
                   onChange={(e) => setSettings(s => ({ ...s, authType: e.target.value as 'bearer' | 'apikey' }))}
                   className={inputClasses}
                 >
                   <option value="bearer">Bearer Token (Authorization Header)</option>
                   <option value="apikey">Make.com API Key (x-make-apikey Header)</option>
                 </select>
               </div>
            </div>
             <p className="text-xs text-slate-500 -mt-2">
                {settings.authType === 'bearer' 
                    ? "Typically used with Zapier or Make.com's 'Webhook authorization' feature." 
                    : "Used with Make.com's API Key restriction feature."
                }
              </p>
            
            <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700 space-y-4">
                <div className="flex justify-between items-center">
                     <h4 className="text-sm font-medium text-slate-300">Test Your Webhook</h4>
                     <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleCopySampleJson}
                            className="text-xs bg-slate-600 hover:bg-slate-500 text-slate-200 font-semibold py-1 px-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-default"
                            disabled={isCopied}
                        >
                            {isCopied ? 'Copied!' : 'Copy Sample JSON'}
                        </button>
                        <button
                            type="button"
                            onClick={handleSendTest}
                            className="text-xs bg-teal-600 hover:bg-teal-500 text-white font-semibold py-1 px-2 rounded-md transition-colors disabled:opacity-50 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center"
                            disabled={isSendingTest || !settings.url}
                        >
                            {isSendingTest ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Sending...
                            </>
                            ) : (
                            <>
                                <PaperAirplaneIcon className="w-3 h-3 mr-1.5" />
                                Send Test
                            </>
                            )}
                        </button>
                    </div>
                </div>
                <p className="text-xs text-slate-500 mt-1">Use "Send Test" to automatically configure your automation tool (e.g., Make.com, Zapier).</p>
                 {testSendResult && (
                    <div className={`mt-2 text-xs p-2 rounded-md ${testSendResult.success ? 'bg-green-900/50 text-green-300 border border-green-700/50' : 'bg-red-900/50 text-red-300 border border-red-700/50'}`}>
                        <p className="font-semibold">{testSendResult.success ? 'Success:' : 'Error:'}</p>
                        <p className="font-mono">{testSendResult.message}</p>
                    </div>
                )}
            </div>

        </div>

        <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-end gap-3 flex-shrink-0">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-semibold bg-slate-600 hover:bg-slate-500 text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 rounded-md text-sm font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
    {isGuideOpen && <WebhookSetupGuide onClose={() => setIsGuideOpen(false)} />}
    </>
  );
};

export default SettingsModal;
