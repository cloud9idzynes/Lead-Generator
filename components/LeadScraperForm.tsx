import React, { useState } from 'react';
import { SearchIcon, SparklesIcon } from './Icons';

interface LeadScraperFormProps {
  onScrape: (searchQuery: string, city: string, country: string, leadCount: number, runSeoAnalysis: boolean) => void;
  isLoading: boolean;
}

const gbpCategories = [
  "Accountants",
  "Auto Repair Shops",
  "Bakeries",
  "Bookstores",
  "Cafes",
  "Car Dealers",
  "Car Washes",
  "Chiropractors",
  "Clothing Stores",
  "Dentists",
  "Electricians",
  "Florists",
  "Gyms",
  "HVAC Contractors",
  "Italian Restaurants",
  "Jewelry Stores",
  "Landscapers",
  "Law Firms",
  "Marketing Agencies",
  "Massage Therapists",
  "Mexican Restaurants",
  "Painters",
  "Pet Stores",
  "Pizza Restaurants",
  "Plumbers",
  "Real Estate Agents",
  "Roofing Contractors",
  "Sushi Restaurants",
  "Tire Shops",
  "Web Designers",
  "Yoga Studios",
].sort();

const LeadScraperForm: React.FC<LeadScraperFormProps> = ({ onScrape, isLoading }) => {
  const [searchQuery, setSearchQuery] = useState('Italian Restaurants');
  const [customSearchQuery, setCustomSearchQuery] = useState('');
  const [city, setCity] = useState('New York');
  const [country, setCountry] = useState('USA');
  const [leadCount, setLeadCount] = useState(10);
  const [runSeoAnalysis, setRunSeoAnalysis] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSearchQuery = searchQuery === '_OTHER_' ? customSearchQuery : searchQuery;
    if (finalSearchQuery && city && country && !isLoading) {
      onScrape(finalSearchQuery, city, country, leadCount, runSeoAnalysis);
    }
  };

  const inputClasses = "w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors";

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="searchQuery" className="block text-sm font-medium text-slate-400 mb-1">Business Category</label>
           <select
            id="searchQuery"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={inputClasses}
          >
            {gbpCategories.map((category) => (
                <option key={category} value={category}>{category}</option>
            ))}
            <option value="_OTHER_">Other (please specify)</option>
          </select>
          {searchQuery === '_OTHER_' && (
             <input
                type="text"
                value={customSearchQuery}
                onChange={(e) => setCustomSearchQuery(e.target.value)}
                placeholder="Enter custom business category"
                className={`${inputClasses} mt-2`}
                required
              />
          )}
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

      <div className="flex items-center justify-between bg-slate-700/50 p-4 rounded-lg border border-cyan-500/30 shadow-inner">
        <div className="flex-grow flex items-start">
          <SparklesIcon className="w-6 h-6 mr-3 text-cyan-400 flex-shrink-0 mt-1" />
          <div>
            <label htmlFor="seoAnalysis" className="font-medium text-slate-200">
              Enable AI SEO Power-Up
            </label>
            <p className="text-xs text-slate-400 mt-1">
              Analyze website and Google Business Profile for SEO scores and actionable recommendations.
            </p>
          </div>
        </div>
        <div className="ml-4">
            <label htmlFor="seoAnalysis" className="relative inline-flex items-center cursor-pointer">
                <input 
                    type="checkbox" 
                    id="seoAnalysis" 
                    className="sr-only peer" 
                    checked={runSeoAnalysis}
                    onChange={(e) => setRunSeoAnalysis(e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
            </label>
        </div>
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
    </>
  );
};

export default LeadScraperForm;
