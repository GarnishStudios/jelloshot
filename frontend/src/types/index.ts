export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  production_company?: string;
  director?: string;
  producer?: string;
  location?: string;
  shoot_date?: string;
  status?: 'pre_production' | 'production' | 'post_production' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface Shotlist {
  id: string;
  project_id: string;
  name: string;
  shooting_date?: string;
  call_time?: string;
  wrap_time?: string;
  location?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  items?: ShotlistItem[];
}

export interface ShotlistItem {
  id: string;
  shotlist_id: string;
  shot_name: string;
  shot_details?: string;
  scheduled_time?: string; // 24-hour format HH:MM
  shot_duration: number; // in minutes
  start_time?: string; // Calculated start time based on order
  notes?: string;
  shot_reference_image?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface ReorderRequest {
  item_ids: string[];
}