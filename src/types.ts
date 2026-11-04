export type ComplaintCategory = 
  | 'garbage' 
  | 'roads' 
  | 'water' 
  | 'electricity' 
  | 'encroachments' 
  | 'other';

export type ComplaintStatus = 'open' | 'in_progress' | 'resolved';

export interface ComplaintComment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
  isOfficial?: boolean;
}

export interface Complaint {
  id: string;
  ticketNumber: string;
  authorName: string;
  category: ComplaintCategory;
  title: string;
  detailedAddress: string;
  details: string;
  phone?: string;
  imageUrl?: string;
  videoUrl?: string;
  locationCoords?: {
    lat: number;
    lng: number;
  };
  status: ComplaintStatus;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  userVoted?: 'up' | 'down';
  comments: ComplaintComment[];
  dispatchedTo?: {
    group: boolean;
    official: boolean;
    apis: boolean;
  };
}

export interface OfficialContact {
  id: string;
  categoryKey: ComplaintCategory | 'all';
  title: string;
  officialName: string;
  role: string;
  whatsappNumber: string; // e.g. "201012345678"
  webhookApiUrl?: string; // API endpoint
  enabled: boolean;
}

export interface DispatchSettings {
  adminPassword?: string;
  groupWhatsappNumberOrLink: string;
  groupTitle: string;
  officials: {
    garbage: OfficialContact;
    water: OfficialContact;
    municipality: OfficialContact;
  };
  // Free APIs
  callMeBot?: {
    enabled: boolean;
    phone: string;
    apiKey: string;
  };
  telegram?: {
    enabled: boolean;
    botToken: string;
    chatId: string;
  };
  globalWebhookApi?: string;
  autoOpenWhatsappOnSubmit: boolean;
}
