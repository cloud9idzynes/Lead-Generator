import React from 'react';
import { FilterState, WebhookStatus } from '../types';
import { FilterIcon, XMarkIcon } from './Icons';

interface LeadsFilterProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  totalLeads: number;
  filteredLeadsCount: number;
}

const LeadsFilter: React.FC<LeadsFilterProps> = ({ filters, onFilterChange, totalLeads, filteredLeadsCount }) => {
    
  const handleFilterChange = (field: keyof FilterState, value: any) => {
    onFilterChange({ ...filters, [field]: value });
  };
    
  const resetFilters = () => {
    onFilterChange({
        webhookStatus: 'ALL',
        hasWebsite: 'ALL',
        hasGbp: 'ALL',
        minQualityScore: 0,
    });
  };

  const selectClasses = "w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors text-sm";
  const labelClasses = "block text-xs font-medium text-slate-400 mb-1";

  return (
    <div className="max-w-full mx-auto my-6 bg-slate-800/50 rounded-lg p-4 shadow-lg backdrop-blur-sm border border-slate-700">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
            <FilterIcon className="w-5 h-5 text-cyan-400" />
            <h3 className="text-md font-semibold text-white">Filter Leads</h3>
        </div>
        <div className="text-sm text-slate-400">
            Showing <span className="font-bold text-white">{filteredLeadsCount}</span> of <span className="font-bold text-white">{totalLeads}</span> leads
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
        {/* Webhook Status Filter */}
        <div>
          <label htmlFor="webhookStatusFilter" className={labelClasses}>Webhook Status</label>
          <select
            id="webhookStatusFilter"
            value={filters.webhookStatus}
            onChange={(e) => handleFilterChange('webhookStatus', e.target.value)}
            className={selectClasses}
          >
            <option value="ALL">All Statuses</option>
            <option value={WebhookStatus.IDLE}>Idle</option>
            <option value={WebhookStatus.SENDING}>Sending</option>
            <option value={WebhookStatus.SUCCESS}>Success</option>
            <option value={WebhookStatus.ERROR}>Error</option>
          </select>
        </div>

        {/* Has Website Filter */}
        <div>
          <label htmlFor="hasWebsiteFilter" className={labelClasses}>Has Website?</label>
          <select
            id="hasWebsiteFilter"
            value={filters.hasWebsite}
            onChange={(e) => handleFilterChange('hasWebsite', e.target.value)}
            className={selectClasses}
          >
            <option value="ALL">Any</option>
            <option value="YES">Yes</option>
            <option value="NO">No</option>
          </select>
        </div>

        {/* Has GBP Filter */}
        <div>
          <label htmlFor="hasGbpFilter" className={labelClasses}>Has GBP?</label>
          <select
            id="hasGbpFilter"
            value={filters.hasGbp}
            onChange={(e) => handleFilterChange('hasGbp', e.target.value)}
            className={selectClasses}
          >
            <option value="ALL">Any</option>
            <option value="YES">Yes</option>
            <option value="NO">No</option>
          </select>
        </div>

        {/* Min Quality Score Filter */}
        <div className="lg:col-span-2">
          <label htmlFor="qualityScoreFilter" className={labelClasses}>Min. Quality Score ({filters.minQualityScore})</label>
           <input
            id="qualityScoreFilter"
            type="range"
            min="0"
            max="100"
            step="5"
            value={filters.minQualityScore}
            onChange={(e) => handleFilterChange('minQualityScore', Number(e.target.value))}
            className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <button 
            onClick={resetFilters}
            className="text-xs flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
        >
            <XMarkIcon className="w-4 h-4" />
            Reset Filters
        </button>
      </div>
    </div>
  );
};

export default LeadsFilter;
