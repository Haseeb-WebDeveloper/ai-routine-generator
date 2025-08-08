export interface UserEmail {
  id: string
  email: string
  created_at: string
  is_active: boolean
  quiz_completed: boolean
  unique_link?: string
}

export interface QuizResponse {
  id: string
  user_email: string
  skin_type: string
  concerns: string[]
  age: number
  budget: string
  skin_sensitivity: string
  climate: string
  lifestyle: string
  created_at: string
  updated_at: string
}

export interface AdminStats {
  total_users: number
  active_users: number
  quiz_completions: number
  recent_signups: number
}

export interface CSVUploadResult {
  success: number
  failed: number
  errors: string[]
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  created_at: string
  updated_at: string
}

export interface Campaign {
  id: string
  name: string
  description?: string
  template_id: string
  selected_users: string[] // Array of user emails
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled'
  scheduled_at?: string
  sent_at?: string
  created_at: string
  updated_at: string
  stats?: {
    total_recipients: number
    sent: number
    delivered: number
    opened: number
    clicked: number
    failed: number
  }
}

export interface CampaignCreateData {
  name: string
  description?: string
  template_id: string
  selected_users: string[]
  scheduled_at?: string
}
