import React, { useState, useCallback } from 'react';
import { Lead, WebhookStatus } from './types';
import LeadScraperForm from './components/LeadScraperForm';
import LeadsTable from './components/LeadsTable';
import { fetchLeads } from './services/geminiService';
import { sendLeadsToWebhook } from './services/webhookService';
import { LogoIcon } from './components/Icons';

const App: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleScrapeLeads = useCallback(async (searchQuery: string, city: string, country: string, leadCount: number, webhookUrl: string) => {
    setIsLoading(true);
    setError(null);
    setLeads([]);

    try {
      const fetchedLeads = await fetchLeads(searchQuery, city, country, leadCount);

      if (fetchedLeads.length === 0) {
        setIsLoading(false);
        return; 
      }
      
      // Set leads with "Sending" status right away
      const processedLeads: Lead[] = fetchedLeads.map((leadData, index) => ({
        ...leadData,
        id: `${Date.now()}-${index}`,
        webhookStatus: WebhookStatus.SENDING,
      }));
      
      setLeads(processedLeads);
      
      // Send all leads to the webhook in one batch
      const success = await sendLeadsToWebhook(processedLeads, webhookUrl);
      
      // Update the status for all leads based on the outcome
      setLeads(currentLeads =>
        currentLeads.map(lead => ({
          ...lead,
          webhookStatus: success ? WebhookStatus.SUCCESS : WebhookStatus.ERROR,
        }))
      );

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setLeads([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
      <div className="container mx-auto px-4 py-8">
        <header className="flex items-center justify-center mb-8 text-center">
          <LogoIcon className="w-12 h-12 mr-4 text-cyan-400" />
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white">AI Lead Scraper</h1>
            <p className="text-slate-400 mt-1">Harness AI to find and qualify business leads globally.</p>
          </div>
        </header>

        <main>
          <div className="max-w-4xl mx-auto bg-slate-800/50 rounded-lg p-6 shadow-lg backdrop-blur-sm border border-slate-700">
            <LeadScraperForm onScrape={handleScrapeLeads} isLoading={isLoading} />
          </div>

          {error && (
            <div className="max-w-4xl mx-auto mt-6 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
            </div>
          )}

          <div className="mt-10">
            {isLoading && leads.length === 0 && (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
                <p className="mt-4 text-slate-400">AI is searching for leads... this may take a moment.</p>
              </div>
            )}
            {leads.length > 0 && <LeadsTable leads={leads} />}
            {!isLoading && leads.length === 0 && !error && (
               <div className="text-center py-10 text-slate-500">
                 <p>Enter your criteria above to start generating leads.</p>
               </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
