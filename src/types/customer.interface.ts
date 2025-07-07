import { FieldValidation, Type } from "./data.interface";

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

export interface ListCustomersQueryStringParameters {
  status?: CustomerStatus;
  name?: string;
}

export interface CreateCustomerRequest {
  name: string;
  birthDate: string;
  status: CustomerStatus;
  addresses: Address[];
  contacts: Contact[];
} 

export interface UpdateCustomerRequest {
  name?: string;
  birthDate?: string;
  status?: CustomerStatus;
  addresses?: Address[];
  contacts?: Contact[];
}

export const customerFieldsAndValidations: { [key: string]: FieldValidation } = {
  name: {
    required: true,
    type: Type.string,
    minLength: 3,
  },
  birthDate: {
    required: true,
    type: Type.string,
    format: 'date',
  },
  status: {
    required: true,
    type: Type.string,
    enum: Object.values(CustomerStatus),
  },
  addresses: {
    required: true,
    type: Type.array,
    items: {
      type: Type.object,
      properties: {
        street: { type: Type.string, required: true },
        number: { type: Type.string, required: true },
        complement: { type: Type.string, required: false }, 
      },
    },
  },
  contacts: {
    required: true,
    type: Type.array,
    items: {
      type: Type.object, 
      properties: {
        email: { type: Type.string, required: true },
        phone: { type: Type.string, required: true },
        favorite: { type: Type.boolean, required: true },
      },
    },
  },
};
