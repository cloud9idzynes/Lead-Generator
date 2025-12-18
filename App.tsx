import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Lead, WebhookStatus, FilterState, WebhookSettings } from './types';
import LeadScraperForm from './components/LeadScraperForm';
import LeadsTable from './components/LeadsTable';
import LeadsFilter from './components/LeadsFilter';
import SettingsModal from './components/SettingsModal';
import { fetchLeads } from './services/geminiService';
import { sendLeadsToWebhook } from './services/webhookService';
import { LogoIcon, PaperAirplaneIcon, Cog6ToothIcon } from './components/Icons';
import WebhookErrorDisplay from './components/WebhookErrorDisplay';

const App: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSendingWebhook, setIsSendingWebhook] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    webhookStatus: 'ALL',
    hasWebsite: 'ALL',
    hasGbp: 'ALL',
    minQualityScore: 0,
  });
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [webhookSettings, setWebhookSettings] = useState<WebhookSettings>({
    url: '',
    token: '',
    authType: 'bearer',
  });

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('webhookSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setWebhookSettings(parsedSettings);
        // Open settings on first visit if URL is not set
        if (!parsedSettings.url) {
            setIsSettingsModalOpen(true);
        }
      } else {
        setIsSettingsModalOpen(true);
      }
    } catch (e) {
      console.error("Failed to load settings from localStorage", e);
      setIsSettingsModalOpen(true);
    }
  }, []);

  const handleSaveSettings = (newSettings: WebhookSettings) => {
    setWebhookSettings(newSettings);
    try {
      localStorage.setItem('webhookSettings', JSON.stringify(newSettings));
    } catch (e) {
      console.error("Failed to save settings to localStorage", e);
    }
    setIsSettingsModalOpen(false);
  };

  const handleScrapeLeads = useCallback(async (searchQuery: string, city: string, country: string, leadCount: number, runSeoAnalysis: boolean) => {
    setIsLoading(true);
    setError(null);
    setLeads([]);
    setProgressMessage('Initializing AI search...');

    try {
      const fetchedLeads = await fetchLeads(searchQuery, city, country, leadCount, runSeoAnalysis, setProgressMessage);

      if (fetchedLeads.length === 0) {
        setIsLoading(false);
        setProgressMessage(null);
        return;
      }
      
      if (!webhookSettings.url) {
        const processedLeads: Lead[] = fetchedLeads.map((leadData, index) => ({
          ...leadData,
          id: `${Date.now()}-${index}`,
          webhookStatus: WebhookStatus.IDLE,
        }));
        setLeads(processedLeads);
        setIsLoading(false);
        setProgressMessage(null);
        return;
      }

      const processedLeads: Lead[] = fetchedLeads.map((leadData, index) => ({
        ...leadData,
        id: `${Date.now()}-${index}`,
        webhookStatus: WebhookStatus.SENDING,
      }));
      
      setLeads(processedLeads);
      
      const result = await sendLeadsToWebhook(processedLeads, webhookSettings.url, webhookSettings.token, webhookSettings.authType);
      
      if (!result.success && result.message) {
        setError(`Webhook Error: ${result.message}`);
      }

      setLeads(currentLeads =>
        currentLeads.map(lead => ({
          ...lead,
          webhookStatus: result.success ? WebhookStatus.SUCCESS : WebhookStatus.ERROR,
        }))
      );

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setLeads([]);
    } finally {
      setIsLoading(false);
      setProgressMessage(null);
    }
  }, [webhookSettings]);

  const handleSendAllUnsentLeads = async () => {
    if (!webhookSettings.url) {
      setError("Please configure your webhook URL in the settings first.");
      setIsSettingsModalOpen(true);
      return;
    }
    setError(null);
    setIsSendingWebhook(true);
  
    const leadsToSend = leads.filter(
      (lead) => lead.webhookStatus === WebhookStatus.IDLE || lead.webhookStatus === WebhookStatus.ERROR
    );
  
    if (leadsToSend.length === 0) {
      setIsSendingWebhook(false);
      return;
    }
  
    setLeads((currentLeads) =>
      currentLeads.map((lead) =>
        leadsToSend.find((lts) => lts.id === lead.id)
          ? { ...lead, webhookStatus: WebhookStatus.SENDING }
          : lead
      )
    );
  
    const result = await sendLeadsToWebhook(leadsToSend, webhookSettings.url, webhookSettings.token, webhookSettings.authType);
  
    if (!result.success && result.message) {
      setError(`Webhook Error: ${result.message}`);
    }

    setLeads((currentLeads) =>
      currentLeads.map((lead) => {
        if (leadsToSend.find((lts) => lts.id === lead.id)) {
          return {
            ...lead,
            webhookStatus: result.success ? WebhookStatus.SUCCESS : WebhookStatus.ERROR,
          };
        }
        return lead;
      })
    );
    setIsSendingWebhook(false);
  };

  const hasUnsentLeads = leads.some(
    l => l.webhookStatus === WebhookStatus.IDLE || l.webhookStatus === WebhookStatus.ERROR
  );

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      if (filters.webhookStatus !== 'ALL' && lead.webhookStatus !== filters.webhookStatus) {
        return false;
      }
      if (filters.hasWebsite !== 'ALL') {
        const hasSite = lead.hasWebsite === true;
        if (filters.hasWebsite === 'YES' && !hasSite) return false;
        if (filters.hasWebsite === 'NO' && hasSite) return false;
      }
      if (filters.hasGbp !== 'ALL') {
         const hasGbp = lead.hasGbpListing === true;
        if (filters.hasGbp === 'YES' && !hasGbp) return false;
        if (filters.hasGbp === 'NO' && hasGbp) return false;
      }
      if (lead.qualityScore < filters.minQualityScore) {
        return false;
      }
      return true;
    });
  }, [leads, filters]);


  return (
    <>
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
      <div className="container mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-8 text-center">
          <div className="flex-1 flex justify-start"></div>
          <div className="flex items-center justify-center">
            <LogoIcon className="w-12 h-12 mr-4 text-cyan-400" />
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-white">AI Lead Scraper</h1>
              <p className="text-slate-400 mt-1">Harness AI to find and qualify business leads globally.</p>
            </div>
          </div>
          <div className="flex-1 flex justify-end">
             <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
              aria-label="Open settings"
            >
              <Cog6ToothIcon className="w-6 h-6" />
            </button>
          </div>
        </header>

        <main>
          <div className="max-w-4xl mx-auto bg-slate-800/50 rounded-lg p-6 shadow-lg backdrop-blur-sm border border-slate-700">
            <LeadScraperForm onScrape={handleScrapeLeads} isLoading={isLoading} />
          </div>

          {error && (
            error.startsWith('Webhook Error:') ? (
              <WebhookErrorDisplay error={error.replace('Webhook Error: ', '')} />
            ) : (
              <div className="max-w-4xl mx-auto mt-6 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">
                <p className="font-semibold">Error:</p>
                <p>{error}</p>
              </div>
            )
          )}
          
          {hasUnsentLeads && !isLoading && (
            <div className="max-w-4xl mx-auto my-6">
                <button
                    onClick={handleSendAllUnsentLeads}
                    disabled={isSendingWebhook}
                    className="w-full flex items-center justify-center bg-teal-600 hover:bg-teal-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-md transition-all duration-300 transform hover:scale-105 disabled:scale-100"
                >
                {isSendingWebhook ? (
                    <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                    </>
                ) : (
                    <>
                    <PaperAirplaneIcon className="w-5 h-5 mr-2" />
                    Send All Unsent Leads
                    </>
                )}
                </button>
            </div>
          )}

          {leads.length > 0 && (
            <LeadsFilter 
              filters={filters}
              onFilterChange={setFilters}
              totalLeads={leads.length}
              filteredLeadsCount={filteredLeads.length}
            />
          )}

          <div className="mt-6">
            {isLoading && (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
                <p className="mt-4 text-slate-400">{progressMessage || 'AI is searching for leads... this may take a moment.'}</p>
              </div>
            )}
            {leads.length > 0 && !isLoading && <LeadsTable leads={filteredLeads} />}
            {!isLoading && leads.length === 0 && !error && (
               <div className="text-center py-10 text-slate-500">
                 <p>Enter your criteria above to start generating leads.</p>
                 <p className="text-xs mt-2">If this is your first time, click the settings icon <Cog6ToothIcon className="w-4 h-4 inline-block -mt-1" /> to configure your webhook.</p>
               </div>
            )}
          </div>
        </main>
      </div>
    </div>
    {isSettingsModalOpen && 
        <SettingsModal 
            onClose={() => setIsSettingsModalOpen(false)}
            onSave={handleSaveSettings}
            initialSettings={webhookSettings}
        />
    }
    </>
  );
};

export default App;