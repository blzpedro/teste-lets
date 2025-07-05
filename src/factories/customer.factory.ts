import { Customer, CreateCustomerRequest, CustomerStatus } from '../types';

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
    return `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
} 