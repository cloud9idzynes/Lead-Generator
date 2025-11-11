export enum WebhookStatus {
  IDLE = 'IDLE',
  SENDING = 'SENDING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
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
  rating: number | null;
  reviewCount: number | null;
  businessHours: Record<string, string> | null;
  services: string[] | null;
  qualityScore: number;
  qualityReasoning: string;
  status: 'New' | 'Contacted' | 'Closed';
  contacted: boolean;
  notes: string;
  webhookStatus: WebhookStatus;
}
