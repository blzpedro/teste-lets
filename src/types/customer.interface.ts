export enum CustomerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
}

export interface Contact {
  email: string;
  phone: string;
  favorite: boolean;
}

export interface Customer {
  id: string;
  name: string;
  birthDate: string;
  status: CustomerStatus;
  addresses: Address[];
  contacts: Contact[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerRequest {
  name: string;
  birthDate: string;
  status: CustomerStatus;
  addresses: Address[];
  contacts: Contact[];
} 