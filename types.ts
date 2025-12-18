export enum WebhookStatus {
  IDLE = 'IDLE',
  SENDING = 'SENDING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface WebhookSettings {
  url: string;
  token: string;
  authType: 'bearer' | 'apikey';
}

export interface Lead {
  id: string; // Client-side unique ID
  generatedDate: string;
  searchCity: string;
  searchCountry: string;
  leadNumber: number;
  companyName: string;
  category: string;
  description: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  coordinates: { lat: number; lon: number } | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  linkedIn: string | null;
  facebook: string | null;
  instagram: string | null;
  twitter: string | null;
  rating: number | null;
  reviewCount: number | null;
  businessHours: Record<string, string> | null;
  services: string[] | null;
  companySize: string | null; // e.g., "11-50 employees"
  employeeCount: number | null;
  postFrequency: 'Daily' | 'Weekly' | 'Monthly' | 'Inactive' | null;
  engagementLevel: 'High' | 'Medium' | 'Low' | null;
  qualityScore: number;
  qualityReasoning: string;
  status: 'New' | 'Contacted' | 'Closed';
  contacted: boolean;
  notes: string;
  webhookStatus: WebhookStatus;

  // New SEO fields
  hasWebsite?: boolean;
  websiteSeoScore?: number | null;
  hasGbpListing?: boolean;
  gbpSeoScore?: number | null;
  seoRecommendations?: string | null;
}

export interface FilterState {
  webhookStatus: 'ALL' | WebhookStatus;
  hasWebsite: 'ALL' | 'YES' | 'NO';
  hasGbp: 'ALL' | 'YES' | 'NO';
  minQualityScore: number;
}
