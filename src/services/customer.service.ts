import { 
  PutCommand, 
  GetCommand, 
  UpdateCommand, 
  DeleteCommand, 
  ScanCommand,
  QueryCommand 
} from '@aws-sdk/lib-dynamodb';
import { dynamoClient, TABLE_NAME } from '../config/dynamodb';
import { Customer, CreateCustomerRequest, customerFieldsAndValidations, UpdateCustomerRequest, ListCustomersQueryStringParameters } from '../types';
import { HTTP_STATUS_CODES, Response } from '../types/http.interface';
import { CustomerFactory } from '../factories/customer.factory';
import { validateData } from '../utils';
import { ValidationError } from '../utils/errors.utils';

export class CustomerService {
  private factory: CustomerFactory;

  constructor() {
    this.factory = new CustomerFactory();
  }

  async createCustomer(customerData: CreateCustomerRequest): Promise<Response<Customer>> {
    try {
      validateData(customerData, customerFieldsAndValidations);
      
      const customer = this.factory.buildCustomer(customerData);

      const command = new PutCommand({
        TableName: TABLE_NAME,
        Item: customer,
      });
      await dynamoClient.send(command);

      return { success: true, data: customer, statusCode: HTTP_STATUS_CODES.CREATED };
    } catch (error) {
      if (error instanceof ValidationError || (error instanceof Error && error.name === 'ValidationError')) {
        return { success: false, error: error instanceof Error ? error.message : 'Validation error', statusCode: HTTP_STATUS_CODES.BAD_REQUEST };
      }
      return { success: false, error: error instanceof Error ? error.message : 'Error creating customer', statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR };
    }
  }

  async listCustomers(queryStringParameters: ListCustomersQueryStringParameters): Promise<Response<Customer[]>> {
    try {
      const filterExpression = [];
      const expressionAttributeNames: Record<string, string> = {};
      const expressionAttributeValues: Record<string, any> = {};
      
      if (queryStringParameters?.status) {
        filterExpression.push('#status = :status');
        expressionAttributeNames['#status'] = 'status';
        expressionAttributeValues[':status'] = queryStringParameters.status;
      }
      if (queryStringParameters?.name) {
        filterExpression.push('contains(#name, :name)');
        expressionAttributeNames['#name'] = 'name';
        expressionAttributeValues[':name'] = queryStringParameters.name;
      }
      
      const command = new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: filterExpression.length > 0 ? filterExpression.join(' and ') : undefined,
        ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
        ExpressionAttributeValues: Object.keys(expressionAttributeValues).length > 0 ? expressionAttributeValues : undefined,
      });
      const result = await dynamoClient.send(command);
      return { success: true, data: result.Items as Customer[], statusCode: HTTP_STATUS_CODES.OK };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Error listing customers', statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR };
    }
  }

  async deleteCustomer(customerId: string): Promise<Response<void>> {
    try {
      const getCommand = new GetCommand({
        TableName: TABLE_NAME,
        Key: { id: customerId },
      });
      const existingCustomer = await dynamoClient.send(getCommand);
      
      if (!existingCustomer.Item) {
        return { success: false, error: 'Customer not found', statusCode: HTTP_STATUS_CODES.NOT_FOUND };
      }

      const command = new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { id: customerId },
      });
      await dynamoClient.send(command);
      return { success: true, statusCode: HTTP_STATUS_CODES.NO_CONTENT };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Error deleting customer', statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR };
    }
  }

  async updateCustomer(customerId: string, customerData: UpdateCustomerRequest): Promise<Response<Customer>> {
    try {
      validateData(customerData, customerFieldsAndValidations);

      const getCommand = new GetCommand({
        TableName: TABLE_NAME,
        Key: { id: customerId },
      });
      const existingCustomer = await dynamoClient.send(getCommand);
      if (!existingCustomer.Item) {
        return { success: false, error: 'Customer not found', statusCode: HTTP_STATUS_CODES.NOT_FOUND };
      }

      const command = new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id: customerId },
        UpdateExpression: 'set #name = :name, #birthDate = :birthDate, #status = :status, #addresses = :addresses, #contacts = :contacts',
        ExpressionAttributeNames: {
          '#name': 'name',
          '#birthDate': 'birthDate',
          '#status': 'status',
          '#addresses': 'addresses',
          '#contacts': 'contacts',
        },
        ExpressionAttributeValues: {
          ':name': customerData.name,
          ':birthDate': customerData.birthDate,
          ':status': customerData.status,
          ':addresses': customerData.addresses,
          ':contacts': customerData.contacts,
        },
      });
      await dynamoClient.send(command);
      return { success: true, data: customerData as Customer, statusCode: HTTP_STATUS_CODES.OK }; 
    } catch (error) {
      if (error instanceof ValidationError || (error instanceof Error && error.name === 'ValidationError')) {
        return { success: false, error: error instanceof Error ? error.message : 'Validation error', statusCode: HTTP_STATUS_CODES.BAD_REQUEST };
      }
      return { success: false, error: error instanceof Error ? error.message : 'Error updating customer', statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR };
    }
  }

  async getCustomerById(customerId: string): Promise<Response<Customer>> {
    try {
      const command = new GetCommand({
        TableName: TABLE_NAME,
        Key: { id: customerId },
      });
      const result = await dynamoClient.send(command);
      if (!result.Item) {
        return { success: false, error: 'Customer not found', statusCode: HTTP_STATUS_CODES.NOT_FOUND };
      }

      return { success: true, data: result.Item as Customer, statusCode: HTTP_STATUS_CODES.OK };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Error getting customer by id', statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR };
    }
  } 
} 