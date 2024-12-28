export interface Member {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  date_of_birth: string;
  address: string;
  membership_status: 'active' | 'inactive' | 'pending';
  family_unit_id?: string;
  created_at: string;
  updated_at: string;
}

export interface FamilyUnit {
  id: string;
  name: string;
  head_of_family_id: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  member_id: string;
  amount: number;
  type: 'tithe' | 'offering' | 'donation' | 'welfare';
  payment_method: 'card' | 'bank_transfer' | 'cash';
  status: 'completed' | 'pending' | 'failed';
  date: string;
  created_at: string;
}

export interface WelfareCase {
  id: string;
  member_id: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'rejected';
  amount_requested: number;
  amount_approved?: number;
  created_at: string;
  updated_at: string;
}