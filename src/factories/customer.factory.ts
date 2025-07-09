import { Customer, CreateCustomerRequest, CustomerStatus } from '../types';
import { randomBytes } from 'crypto';

export class CustomerFactory {

  buildCustomer(data: CreateCustomerRequest): Customer {
    const now = new Date().toISOString();
    const id = this.generateId();
    
    return {
      id,
      name: data.name,
      birthDate: data.birthDate,
      status: data.status || CustomerStatus.ACTIVE,
      addresses: data.addresses,
      contacts: data.contacts,
      createdAt: now,
      updatedAt: now,
    };
  }

  buildUpdatedCustomer(existingCustomer: Customer, updateData: Partial<CreateCustomerRequest>): Customer {
    const now = new Date().toISOString();
    
    return {
      ...existingCustomer,
      ...updateData,
      updatedAt: now,
    };
  }

  buildSearchFilter(name?: string, status?: CustomerStatus) {
    return {
      name: name?.toLowerCase(),
      status,
    };
  }

  buildCustomerResponse(customer: Customer) {
    return {
      id: customer.id,
      name: customer.name,
      birthDate: customer.birthDate,
      status: customer.status,
      addresses: customer.addresses,
      contacts: customer.contacts,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }

  buildCustomerListResponse(customers: Customer[]) {
    return customers.map(customer => this.buildCustomerResponse(customer));
  }

  buildErrorResponse(message: string, code?: string) {
    return {
      error: true,
      message,
      code,
      timestamp: new Date().toISOString(),
    };
  }

  buildSuccessResponse(data: any, message?: string) {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  private generateId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 15);
    const cryptoPart = this.generateCryptoString(8);
    return `${timestamp}_${randomPart}_${cryptoPart}`;
  }

  private generateCryptoString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const bytes = randomBytes(length);
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(bytes[i] % chars.length);
    }
    return result;
  }
} 