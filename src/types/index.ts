export type AdminRole = 'super_admin' | 'admin' | 'support';
export type ApplicationStatus = 'pending' | 'approved' | 'declined' | 'under_review';
export type ChatTicketStatus = 'open' | 'claimed' | 'resolved' | 'closed';

export interface Admin {
  id: string;
  email: string;
  full_name: string;
  role: AdminRole;
  avatar_url?: string;
  created_at: string;
  last_seen_at?: string;
}

export interface VendorApplication {
  id: string;
  store_name: string;
  owner_name: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  country?: string;
  business_type: string;
  description?: string;
  website_url?: string;
  logo_url?: string;
  documents?: string[];
  status: ApplicationStatus;
  reviewed_by?: string;
  reviewer?: Admin;
  review_notes?: string;
  submitted_at: string;
  reviewed_at?: string;
  created_at: string;
}

export interface ChatTicket {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_avatar?: string;
  subject: string;
  status: ChatTicketStatus;
  claimed_by?: string;
  claimer?: Admin;
  claimed_at?: string;
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_type: 'user' | 'admin';
  sender_name: string;
  content: string;
  created_at: string;
  read_at?: string;
}
