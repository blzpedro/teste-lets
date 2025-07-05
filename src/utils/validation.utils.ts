import { CreateCustomerRequest, Customer } from '../types';
import { ValidationError } from './errors.utils';

export function validateCreateCustomer(data: any): CreateCustomerRequest {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Dados de entrada inválidos');
  }

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    throw new ValidationError('Nome é obrigatório e deve ser uma string não vazia');
  }

  if (data.birthDate !== undefined && typeof data.birthDate !== 'string') {
    throw new ValidationError('Data de nascimento deve ser uma string');
  }

  return {
    name: data.name.trim(),
    birthDate: data.birthDate?.trim(),
    status: data.status,
    addresses: data.addresses,
    contacts: data.contacts,
  };
}

export function validateUpdateCustomer(data: any): Customer {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Dados de entrada inválidos');
  }

  if (!data.id || typeof data.id !== 'string' || data.id.trim().length === 0) {
    throw new ValidationError('ID é obrigatório e deve ser uma string não vazia');
  }

  if (data.name !== undefined && (typeof data.name !== 'string' || data.name.trim().length === 0)) {
    throw new ValidationError('Nome deve ser uma string não vazia');
  }

  if (data.birthDate !== undefined && typeof data.birthDate !== 'string') {
    throw new ValidationError('Data de nascimento deve ser uma string');
  }

  return {
    id: data.id.trim(),
    name: data.name?.trim(),
    birthDate: data.birthDate?.trim(),
    status: data.status,
    addresses: data.addresses,
    contacts: data.contacts,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}