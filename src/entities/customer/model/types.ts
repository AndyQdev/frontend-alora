export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  country?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerInput {
  name: string;
  phone: string;
  email?: string;
  country?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
}

export interface CustomersResponse {
  statusCode: number;
  data: Customer[];
  countData: number;
}

export interface CustomerQueryParams {
  limit?: number;
  offset?: number;
  order?: 'ASC' | 'DESC';
  attr?: string;
  value?: string;
}
