import React from 'react';
import { Lead, WebhookStatus } from '../types';
import { CheckCircleIcon, ClockIcon, ExclamationCircleIcon, PaperAirplaneIcon } from './Icons';

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

const LeadsTable: React.FC<LeadsTableProps> = ({ leads }) => {
  const headers = [
    'Webhook Status', 'Company Name', 'Category', 'Services', 'Business Hours', 'Phone', 'Email', 'Website', 'Address',
    'Rating', 'Reviews', 'Quality Score', 'Quality Reasoning', 'Description', 'LinkedIn', 'Facebook', 'Instagram'
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
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-slate-800/60 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm"><WebhookStatusIndicator status={lead.webhookStatus} /></td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{lead.companyName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{lead.category}</td>
              <td className="px-6 py-4 text-sm text-slate-300 max-w-sm whitespace-normal">{lead.services?.join(', ') || 'N/A'}</td>
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
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default LeadsTable;
