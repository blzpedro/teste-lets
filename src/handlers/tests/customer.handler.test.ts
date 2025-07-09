import { APIGatewayProxyEvent } from 'aws-lambda';
import { CustomerStatus, CreateCustomerRequest, UpdateCustomerRequest } from '../../types';
import { HTTP_STATUS_CODES } from '../../types/http.interface';

const mockCustomerService = {
  listCustomers: jest.fn(),
  createCustomer: jest.fn(),
  deleteCustomer: jest.fn(),
  updateCustomer: jest.fn(),
  getCustomerById: jest.fn(),
  factory: {
    createCustomer: jest.fn(),
    createAddress: jest.fn(),
    createContact: jest.fn(),
  },
};

jest.mock('../../services/customer.service', () => ({
  CustomerService: jest.fn().mockImplementation(() => mockCustomerService)
}));

import * as customerHandlers from '../customer.handler';

describe('Customer Handlers', () => {
  const createMockEvent = (overrides: Partial<APIGatewayProxyEvent> = {}): APIGatewayProxyEvent => ({
    body: null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: 'GET',
    isBase64Encoded: false,
    path: '/customers',
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as any,
    resource: '',
    ...overrides
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get customers successfully', async () => {
    const mockCustomers = [
      { 
        id: '1', 
        name: 'John Doe', 
        birthDate: '1990-01-01',
        status: CustomerStatus.ACTIVE,
        addresses: [],
        contacts: [],
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01'
      },
      { 
        id: '2', 
        name: 'Jane Doe', 
        birthDate: '1995-05-15',
        status: CustomerStatus.INACTIVE,
        addresses: [],
        contacts: [],
        createdAt: '2023-01-02',
        updatedAt: '2023-01-02'
      }
    ];

    mockCustomerService.listCustomers.mockResolvedValue({
      success: true,
      data: mockCustomers,
      statusCode: HTTP_STATUS_CODES.OK
    });

    const event = createMockEvent({
      queryStringParameters: { status: CustomerStatus.ACTIVE }
    });

    const result = await customerHandlers.getCustomersHandler(event);

    expect(result.statusCode).toBe(HTTP_STATUS_CODES.OK);
    const responseBody = JSON.parse(result.body);
    expect(responseBody.success).toBe(true);
    expect(responseBody.data).toEqual(mockCustomers);
    expect(mockCustomerService.listCustomers).toHaveBeenCalledWith({ status: CustomerStatus.ACTIVE });
  });

  it('should create customer successfully', async () => {
    const customerData: CreateCustomerRequest = {
      name: 'John Doe',
      birthDate: '1990-01-01',
      status: CustomerStatus.ACTIVE,
      addresses: [{ street: 'Main St', number: '123' }],
      contacts: [{ email: 'john@example.com', phone: '123456789', favorite: true }]
    };

    const createdCustomer = { id: 'new-id', ...customerData, createdAt: '2023-01-01', updatedAt: '2023-01-01' };

    mockCustomerService.createCustomer.mockResolvedValue({
      success: true,
      data: createdCustomer,
      statusCode: HTTP_STATUS_CODES.CREATED
    });

    const event = createMockEvent({
      body: JSON.stringify(customerData)
    });

    const result = await customerHandlers.createCustomerHandler(event);

    expect(result.statusCode).toBe(HTTP_STATUS_CODES.CREATED);
    const responseBody = JSON.parse(result.body);
    expect(responseBody.success).toBe(true);
    expect(responseBody.data).toEqual(createdCustomer);
    expect(mockCustomerService.createCustomer).toHaveBeenCalledWith(customerData);
  });

  it('should delete customer successfully', async () => {
    mockCustomerService.deleteCustomer.mockResolvedValue({
      success: true,
      statusCode: HTTP_STATUS_CODES.NO_CONTENT
    });

    const event = createMockEvent({
      pathParameters: { id: 'customer-id' }
    });

    const result = await customerHandlers.deleteCustomerHandler(event);

    expect(result.statusCode).toBe(HTTP_STATUS_CODES.NO_CONTENT);
    const responseBody = JSON.parse(result.body);
    expect(responseBody.success).toBe(true);
    expect(mockCustomerService.deleteCustomer).toHaveBeenCalledWith('customer-id');
  });

  it('should update customer successfully', async () => {
    const updateData: UpdateCustomerRequest = {
      name: 'Updated Name',
      status: CustomerStatus.INACTIVE
    };

    const updatedCustomer = { 
      id: 'customer-id', 
      name: 'Updated Name',
      birthDate: '1990-01-01',
      status: CustomerStatus.INACTIVE,
      addresses: [],
      contacts: [],
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01'
    };

    mockCustomerService.updateCustomer.mockResolvedValue({
      success: true,
      data: updatedCustomer,
      statusCode: HTTP_STATUS_CODES.OK
    });

    const event = createMockEvent({
      pathParameters: { id: 'customer-id' },
      body: JSON.stringify(updateData)
    });

    const result = await customerHandlers.updateCustomerHandler(event);

    expect(result.statusCode).toBe(HTTP_STATUS_CODES.OK);
    const responseBody = JSON.parse(result.body);
    expect(responseBody.success).toBe(true);
    expect(responseBody.data).toEqual(updatedCustomer);
    expect(mockCustomerService.updateCustomer).toHaveBeenCalledWith('customer-id', updateData);
  });

  it('should get customer by id successfully', async () => {
    const customer = {
      id: 'customer-id',
      name: 'John Doe',
      birthDate: '1990-01-01',
      status: CustomerStatus.ACTIVE,
      addresses: [],
      contacts: [],
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01'
    };

    mockCustomerService.getCustomerById.mockResolvedValue({
      success: true,
      data: customer,
      statusCode: HTTP_STATUS_CODES.OK
    });

    const event = createMockEvent({
      pathParameters: { id: 'customer-id' }
    });

    const result = await customerHandlers.getCustomerByIdHandler(event);

    expect(result.statusCode).toBe(HTTP_STATUS_CODES.OK);
    const responseBody = JSON.parse(result.body);
    expect(responseBody.success).toBe(true);
    expect(responseBody.data).toEqual(customer);
    expect(mockCustomerService.getCustomerById).toHaveBeenCalledWith('customer-id');
  });

  it('should handle missing customer id in delete handler', async () => {
    const event = createMockEvent({
      pathParameters: null
    });

    const result = await customerHandlers.deleteCustomerHandler(event);

    expect(result.statusCode).toBe(HTTP_STATUS_CODES.BAD_REQUEST);
    const responseBody = JSON.parse(result.body);
    expect(responseBody.success).toBe(false);
    expect(responseBody.error).toBe('Customer ID is required');
  });

  it('should handle missing customer id in update handler', async () => {
    const event = createMockEvent({
      pathParameters: null,
      body: JSON.stringify({ name: 'Updated Name' })
    });

    const result = await customerHandlers.updateCustomerHandler(event);

    expect(result.statusCode).toBe(HTTP_STATUS_CODES.BAD_REQUEST);
    const responseBody = JSON.parse(result.body);
    expect(responseBody.success).toBe(false);
    expect(responseBody.error).toBe('Customer ID is required');
  });

  it('should handle missing customer id in get by id handler', async () => {
    const event = createMockEvent({
      pathParameters: null
    });

    const result = await customerHandlers.getCustomerByIdHandler(event);

    expect(result.statusCode).toBe(HTTP_STATUS_CODES.BAD_REQUEST);
    const responseBody = JSON.parse(result.body);
    expect(responseBody.success).toBe(false);
    expect(responseBody.error).toBe('Customer ID is required');
  });
});
