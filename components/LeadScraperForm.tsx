import React, { useState } from 'react';
import { SearchIcon } from './Icons';

interface LeadScraperFormProps {
  onScrape: (searchQuery: string, city: string, country: string, leadCount: number, webhookUrl: string) => void;
  isLoading: boolean;
}

const LeadScraperForm: React.FC<LeadScraperFormProps> = ({ onScrape, isLoading }) => {
  const [searchQuery, setSearchQuery] = useState('Italian Restaurants');
  const [city, setCity] = useState('New York');
  const [country, setCountry] = useState('USA');
  const [leadCount, setLeadCount] = useState(10);
  const [webhookUrl, setWebhookUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery && city && country && webhookUrl && !isLoading) {
      onScrape(searchQuery, city, country, leadCount, webhookUrl);
    }
  };

  const inputClasses = "w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="searchQuery" className="block text-sm font-medium text-slate-400 mb-1">Search Query</label>
          <input
            id="searchQuery"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="e.g., 'plumbers', 'software companies'"
            className={inputClasses}
            required
          />
        </div>
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-slate-400 mb-1">City</label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g., 'London'"
            className={inputClasses}
            required
          />
        </div>
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-slate-400 mb-1">Country</label>
          <input
            id="country"
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="e.g., 'Canada'"
            className={inputClasses}
            required
          />
        </div>
        <div>
          <label htmlFor="leadCount" className="block text-sm font-medium text-slate-400 mb-1">Number of Leads</label>
          <select
            id="leadCount"
            value={leadCount}
            onChange={(e) => setLeadCount(Number(e.target.value))}
            className={inputClasses}
          >
            {[...Array(10)].map((_, i) => {
                const count = (i + 1) * 10;
                return <option key={count} value={count}>{count}</option>
            })}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="webhookUrl" className="block text-sm font-medium text-slate-400 mb-1">Webhook URL</label>
        <input
          id="webhookUrl"
          type="url"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
          placeholder="https://your-automation-webhook.com"
          className={inputClasses}
          required
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-md transition-all duration-300 transform hover:scale-105 disabled:scale-100"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Scraping...
          </>
        ) : (
          <>
            <SearchIcon className="w-5 h-5 mr-2"/>
            Scrape Leads
          </>
        )}
      </button>
    </form>
  );
};

export default LeadScraperForm;
