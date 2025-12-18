import React from 'react';
import { Lead, WebhookStatus } from '../types';
import { CheckCircleIcon, ClockIcon, ExclamationCircleIcon, PaperAirplaneIcon, CheckIcon, XCircleIcon } from './Icons';

interface LeadsTableProps {
  leads: Lead[];
}

const WebhookStatusIndicator: React.FC<{ status: WebhookStatus }> = ({ status }) => {
  switch (status) {
    case WebhookStatus.IDLE:
      return <span className="flex items-center text-slate-400"><ClockIcon className="w-4 h-4 mr-1.5" /> Idle</span>;
    case WebhookStatus.SENDING:
      return <span className="flex items-center text-blue-400 animate-pulse"><PaperAirplaneIcon className="w-4 h-4 mr-1.5" /> Sending...</span>;
    case WebhookStatus.SUCCESS:
      return <span className="flex items-center text-green-400"><CheckCircleIcon className="w-4 h-4 mr-1.5" /> Sent</span>;
    case WebhookStatus.ERROR:
      return <span className="flex items-center text-red-400"><ExclamationCircleIcon className="w-4 h-4 mr-1.5" /> Error</span>;
    default:
      return null;
  }
};

const formatBusinessHours = (hours: Record<string, string> | null): string => {
  if (!hours) return 'N/A';
  // Compact representation for the table cell
  return Object.entries(hours)
    .map(([day, time]) => `${day.substring(0, 3)}: ${time}`)
    .join(' | ');
};

const EngagementPill: React.FC<{ level: 'High' | 'Medium' | 'Low' | null }> = ({ level }) => {
  if (!level) return <span className="text-slate-400">N/A</span>;

  const baseClasses = "px-2 py-0.5 text-xs font-semibold rounded-full";
  let colorClasses = "";

  switch (level) {
    case 'High': colorClasses = "bg-green-800 text-green-200"; break;
    case 'Medium': colorClasses = "bg-yellow-800 text-yellow-200"; break;
    case 'Low': colorClasses = "bg-red-800 text-red-200"; break;
  }

  return <span className={`${baseClasses} ${colorClasses}`}>{level}</span>;
}

const SeoScore: React.FC<{ score?: number | null }> = ({ score }) => {
  if (score === null || score === undefined) return <span className="text-slate-400">N/A</span>;
  
  let colorClass = 'text-orange-400';
  if (score >= 8) {
    colorClass = 'text-green-400';
  } else if (score >= 5) {
    colorClass = 'text-yellow-400';
  }

  return (
    <span className={`font-bold ${colorClass}`}>
      {score} <span className="font-normal text-slate-400">/ 10</span>
    </span>
  );
};

const YesNoIndicator: React.FC<{ value?: boolean }> = ({ value }) => {
    if (typeof value === 'undefined') {
        return <span className="text-slate-400">-</span>;
    }
    return value ? 
        <span className="flex items-center text-green-400"><CheckIcon className="w-4 h-4 mr-1.5" /> Yes</span> :
        <span className="flex items-center text-red-400"><XCircleIcon className="w-4 h-4 mr-1.5" /> No</span>;
};

const SeoRecommendations: React.FC<{ recommendations?: string | null }> = ({ recommendations }) => {
  if (!recommendations) return <span className="text-slate-400">N/A</span>;

  const createMarkup = (markdown: string) => {
    const html = markdown
      .replace(/### (.*)/g, '<h4 class="font-semibold text-slate-200 mt-2 mb-1">$1</h4>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-slate-300">$1</strong>')
      .replace(/- (.*)/g, '<div class="pl-4">&bull; $1</div>') // Simple indented bullet
      .replace(/\n/g, '<br />')
      .replace(/<\/h4><br \/>/g, '</h4>') // Fix double br after h4
      .replace(/<br \/><div/g, '<div'); // Fix br before bullet

    return { __html: html };
  };

  return (
    <div
      className="text-xs text-slate-400 max-w-sm whitespace-normal font-sans"
      dangerouslySetInnerHTML={createMarkup(recommendations)}
    />
  );
};

const LeadsTable: React.FC<LeadsTableProps> = ({ leads }) => {
  const headers = [
    'Webhook Status', 'Company Name', 'Has Website?', 'Website SEO', 'Has GBP?', 'GBP SEO', 'SEO Recommendations', 'Category', 'Services', 'Company Size', 'Employees', 'Post Freq.', 'Engagement', 'Business Hours', 'Phone', 'Email', 'Website', 'Address',
    'Rating', 'Reviews', 'Quality Score', 'Quality Reasoning', 'Description', 'LinkedIn', 'Facebook', 'Instagram', 'Twitter'
  ];

  return (
    <div className="bg-slate-800/50 rounded-lg shadow-lg border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-700">
        <thead className="bg-slate-800">
          <tr>
            {headers.map(header => (
              <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider whitespace-nowrap">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-slate-900/50 divide-y divide-slate-800">
          {leads.length > 0 ? (
            leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-slate-800/60 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm"><WebhookStatusIndicator status={lead.webhookStatus} /></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{lead.companyName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm"><YesNoIndicator value={lead.hasWebsite} /></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm"><SeoScore score={lead.websiteSeoScore} /></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm"><YesNoIndicator value={lead.hasGbpListing} /></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm"><SeoScore score={lead.gbpSeoScore} /></td>
                <td className="px-6 py-4"><SeoRecommendations recommendations={lead.seoRecommendations} /></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{lead.category}</td>
                <td className="px-6 py-4 text-sm text-slate-300 max-w-sm whitespace-normal">{lead.services?.join(', ') || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{lead.companySize || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{lead.employeeCount || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{lead.postFrequency || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm"><EngagementPill level={lead.engagementLevel} /></td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400" title={formatBusinessHours(lead.businessHours)}>{formatBusinessHours(lead.businessHours)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{lead.phone || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{lead.email || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-cyan-400 hover:text-cyan-300"><a href={lead.website || '#'} target="_blank" rel="noopener noreferrer">{lead.website || 'N/A'}</a></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{lead.address || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{lead.rating !== null ? `${lead.rating} / 5` : 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{lead.reviewCount !== null ? lead.reviewCount : 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                  <span className={lead.qualityScore > 75 ? 'text-green-400' : lead.qualityScore > 50 ? 'text-yellow-400' : 'text-orange-400'}>
                    {lead.qualityScore}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-400 max-w-xs whitespace-normal">{lead.qualityReasoning}</td>
                <td className="px-6 py-4 text-sm text-slate-400 max-w-xs whitespace-normal">{lead.description || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-cyan-400 hover:text-cyan-300"><a href={lead.linkedIn || '#'} target="_blank" rel="noopener noreferrer">{lead.linkedIn ? 'Profile' : 'N/A'}</a></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-cyan-400 hover:text-cyan-300"><a href={lead.facebook || '#'} target="_blank" rel="noopener noreferrer">{lead.facebook ? 'Page' : 'N/A'}</a></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-cyan-400 hover:text-cyan-300"><a href={lead.instagram || '#'} target="_blank" rel="noopener noreferrer">{lead.instagram ? 'Profile' : 'N/A'}</a></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-cyan-400 hover:text-cyan-300"><a href={lead.twitter || '#'} target="_blank" rel="noopener noreferrer">{lead.twitter ? 'Profile' : 'N/A'}</a></td>
              </tr>
            ))
          ) : (
             <tr>
                <td colSpan={headers.length} className="px-6 py-10 text-center text-slate-500">
                    No leads match your current filter criteria.
                </td>
             </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default LeadsTable;