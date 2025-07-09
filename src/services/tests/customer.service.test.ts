import { CustomerService } from '../customer.service';
import { CustomerFactory } from '../../factories/customer.factory';
import { Customer, CustomerStatus, CreateCustomerRequest, UpdateCustomerRequest } from '../../types';
import { HTTP_STATUS_CODES } from '../../types/http.interface';
import { ValidationError } from '../../utils/errors.utils';

// Mock DynamoDB commands
jest.mock('@aws-sdk/lib-dynamodb', () => ({
  PutCommand: jest.fn().mockImplementation((params) => ({ input: params })),
  GetCommand: jest.fn().mockImplementation((params) => ({ input: params })),
  UpdateCommand: jest.fn().mockImplementation((params) => ({ input: params })),
  DeleteCommand: jest.fn().mockImplementation((params) => ({ input: params })),
  ScanCommand: jest.fn().mockImplementation((params) => ({ input: params })),
  QueryCommand: jest.fn().mockImplementation((params) => ({ input: params })),
}));

// Mock DynamoDB client
jest.mock('../../config/dynamodb', () => ({
  dynamoClient: {
    send: jest.fn(),
  },
  TABLE_NAME: 'test-table',
}));

// Mock validation utility
jest.mock('../../utils', () => ({
  validateData: jest.fn(),
}));

// Mock CustomerFactory
jest.mock('../../factories/customer.factory', () => ({
  CustomerFactory: jest.fn().mockImplementation(() => ({
    buildCustomer: jest.fn().mockImplementation((data) => ({
      id: 'test-id',
      name: data.name,
      birthDate: data.birthDate,
      status: data.status,
      addresses: data.addresses,
      contacts: data.contacts,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    })),
  })),
}));

describe('CustomerService', () => {
  let customerService: CustomerService;
  let mockDynamoClient: any;
  let mockValidateData: any;
  let mockCustomerFactory: any;

  const mockCustomer: Customer = {
    id: 'test-id',
    name: 'John Doe',
    birthDate: '1990-01-01',
    status: CustomerStatus.ACTIVE,
    addresses: [{ street: 'Test St', number: '123' }],
    contacts: [{ email: 'john@test.com', phone: '123456789', favorite: true }],
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  };

  const mockCreateRequest: CreateCustomerRequest = {
    name: 'John Doe',
    birthDate: '1990-01-01',
    status: CustomerStatus.ACTIVE,
    addresses: [{ street: 'Test St', number: '123' }],
    contacts: [{ email: 'john@test.com', phone: '123456789', favorite: true }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    customerService = new CustomerService();
    mockDynamoClient = require('../../config/dynamodb').dynamoClient;
    mockValidateData = require('../../utils').validateData;
    mockCustomerFactory = require('../../factories/customer.factory').CustomerFactory;
  });

  describe('createCustomer', () => {
    it('should create a customer successfully', async () => {
      mockValidateData.mockImplementation(() => {});
      mockDynamoClient.send.mockResolvedValue({});

      const result = await customerService.createCustomer(mockCreateRequest);

      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(HTTP_STATUS_CODES.CREATED);
      expect(result.data).toMatchObject({
        name: mockCreateRequest.name,
        birthDate: mockCreateRequest.birthDate,
        status: mockCreateRequest.status,
      });
      expect(mockDynamoClient.send).toHaveBeenCalledTimes(1);
    });

    it('should return validation error for invalid data', async () => {
      const validationError = new ValidationError('Invalid data');
      mockValidateData.mockImplementation(() => {
        throw validationError;
      });

      const result = await customerService.createCustomer(mockCreateRequest);

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(result.error).toBe('Invalid data');
      expect(mockDynamoClient.send).not.toHaveBeenCalled();
    });

    it('should throw error for DynamoDB failures', async () => {
      mockValidateData.mockImplementation(() => {});
      mockDynamoClient.send.mockRejectedValue(new Error('DynamoDB error'));

      await expect(customerService.createCustomer(mockCreateRequest)).rejects.toThrow('DynamoDB error');
    });
  });

  describe('getCustomerById', () => {
    it('should return customer when found', async () => {
      mockDynamoClient.send.mockResolvedValue({ Item: mockCustomer });

      const result = await customerService.getCustomerById('test-id');

      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(HTTP_STATUS_CODES.OK);
      expect(result.data).toEqual(mockCustomer);
    });

    it('should return not found when customer does not exist', async () => {
      mockDynamoClient.send.mockResolvedValue({ Item: null });

      const result = await customerService.getCustomerById('non-existent-id');

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(HTTP_STATUS_CODES.NOT_FOUND);
      expect(result.error).toBe('Customer not found');
    });
  });

  describe('listCustomers', () => {
    it('should return all customers when no filters', async () => {
      const mockCustomers = [mockCustomer];
      mockDynamoClient.send.mockResolvedValue({ Items: mockCustomers });

      const result = await customerService.listCustomers({});

      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(HTTP_STATUS_CODES.OK);
      expect(result.data).toEqual(mockCustomers);
    });

    it('should filter customers by status', async () => {
      mockDynamoClient.send.mockResolvedValue({ Items: [mockCustomer] });

      const result = await customerService.listCustomers({ status: CustomerStatus.ACTIVE });

      expect(result.success).toBe(true);
      expect(mockDynamoClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            FilterExpression: '#status = :status',
            ExpressionAttributeNames: { '#status': 'status' },
            ExpressionAttributeValues: { ':status': CustomerStatus.ACTIVE },
          }),
        })
      );
    });

    it('should filter customers by name', async () => {
      mockDynamoClient.send.mockResolvedValue({ Items: [mockCustomer] });

      const result = await customerService.listCustomers({ name: 'John' });

      expect(result.success).toBe(true);
      expect(mockDynamoClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            FilterExpression: 'contains(#name, :name)',
            ExpressionAttributeNames: { '#name': 'name' },
            ExpressionAttributeValues: { ':name': 'John' },
          }),
        })
      );
    });
  });

  describe('updateCustomer', () => {
    const updateData: UpdateCustomerRequest = {
      name: 'Jane Doe',
      status: CustomerStatus.INACTIVE,
    };

    it('should update customer successfully', async () => {
      mockValidateData.mockImplementation(() => {});
      mockDynamoClient.send
        .mockResolvedValueOnce({ Item: mockCustomer }) // get customer
        .mockResolvedValueOnce({}); // update customer

      const result = await customerService.updateCustomer('test-id', updateData);

      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(HTTP_STATUS_CODES.OK);
      expect(mockDynamoClient.send).toHaveBeenCalledTimes(2);
    });

    it('should return not found when customer does not exist', async () => {
      mockValidateData.mockImplementation(() => {});
      mockDynamoClient.send.mockResolvedValue({ Item: null });

      const result = await customerService.updateCustomer('non-existent-id', updateData);

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(HTTP_STATUS_CODES.NOT_FOUND);
      expect(result.error).toBe('Customer not found');
    });

    it('should return validation error for invalid data', async () => {
      const validationError = new ValidationError('Invalid data');
      mockValidateData.mockImplementation(() => {
        throw validationError;
      });

      const result = await customerService.updateCustomer('test-id', updateData);

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
      expect(result.error).toBe('Invalid data');
    });
  });

  describe('deleteCustomer', () => {
    it('should delete customer successfully', async () => {
      mockDynamoClient.send
        .mockResolvedValueOnce({ Item: mockCustomer }) // get customer
        .mockResolvedValueOnce({}); // delete customer

      const result = await customerService.deleteCustomer('test-id');

      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(HTTP_STATUS_CODES.NO_CONTENT);
      expect(mockDynamoClient.send).toHaveBeenCalledTimes(2);
    });

    it('should return not found when customer does not exist', async () => {
      mockDynamoClient.send.mockResolvedValue({ Item: null });

      const result = await customerService.deleteCustomer('non-existent-id');

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(HTTP_STATUS_CODES.NOT_FOUND);
      expect(result.error).toBe('Customer not found');
    });
  });
});
