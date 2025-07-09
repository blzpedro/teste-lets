import { CustomerFactory } from '../customer.factory';
import { Customer, CreateCustomerRequest, CustomerStatus } from '../../types';

describe('CustomerFactory', () => {
  let factory: CustomerFactory;

  beforeEach(() => {
    factory = new CustomerFactory();
  });

  it('should build a customer with all required fields and generate unique ID', () => {
    const request: CreateCustomerRequest = {
      name: 'John Doe',
      birthDate: '1990-01-01',
      status: CustomerStatus.ACTIVE,
      addresses: [{ street: 'Main St', number: '123' }],
      contacts: [{ email: 'john@example.com', phone: '123456789', favorite: true }],
    };

    const customer = factory.buildCustomer(request);

    expect(customer.id).toBeDefined();
    expect(customer.name).toBe('John Doe');
    expect(customer.status).toBe(CustomerStatus.ACTIVE);
    expect(customer.createdAt).toBeDefined();
    expect(customer.updatedAt).toBeDefined();
  });

  it('should update customer with new data and timestamp', () => {
    const existingCustomer: Customer = {
      id: 'test_id',
      name: 'Old Name',
      birthDate: '1990-01-01',
      status: CustomerStatus.ACTIVE,
      addresses: [{ street: 'Old St', number: '123' }],
      contacts: [{ email: 'old@example.com', phone: '123456789', favorite: true }],
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
    };

    const updatedCustomer = factory.buildUpdatedCustomer(existingCustomer, { name: 'New Name' });

    expect(updatedCustomer.name).toBe('New Name');
    expect(updatedCustomer.updatedAt).not.toBe(existingCustomer.updatedAt);
  });

  it('should build search filter with name and status', () => {
    const filter = factory.buildSearchFilter('John', CustomerStatus.ACTIVE);

    expect(filter).toEqual({
      name: 'john',
      status: CustomerStatus.ACTIVE,
    });
  });

  it('should build customer list response', () => {
    const customers: Customer[] = [
      {
        id: 'id1',
        name: 'John Doe',
        birthDate: '1990-01-01',
        status: CustomerStatus.ACTIVE,
        addresses: [{ street: 'Main St', number: '123' }],
        contacts: [{ email: 'john@example.com', phone: '123456789', favorite: true }],
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      },
    ];

    const response = factory.buildCustomerListResponse(customers);

    expect(response).toHaveLength(1);
    expect(response[0]).toEqual(customers[0]);
  });

  it('should build error and success responses', () => {
    const errorResponse = factory.buildErrorResponse('Something went wrong', 'ERR_001');
    const successResponse = factory.buildSuccessResponse({ id: 'test' }, 'Success');

    expect(errorResponse.error).toBe(true);
    expect(errorResponse.message).toBe('Something went wrong');
    expect(successResponse.success).toBe(true);
    expect(successResponse.data).toEqual({ id: 'test' });
  });
});
