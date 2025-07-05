import { 
  PutCommand, 
  GetCommand, 
  UpdateCommand, 
  DeleteCommand, 
  ScanCommand,
  QueryCommand 
} from '@aws-sdk/lib-dynamodb';
import { dynamoClient, TABLE_NAME } from '../config/dynamodb';
import { Customer, CreateCustomerRequest, customerFieldsAndValidations } from '../types';
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
      if (error instanceof ValidationError) {
        return { success: false, error: error.message, statusCode: HTTP_STATUS_CODES.BAD_REQUEST };
      }
      throw error; 
    }
  }

  async listCustomers(): Promise<Response<Customer[]>> {
    try {
      const command = new ScanCommand({
        TableName: TABLE_NAME,
      });
      const result = await dynamoClient.send(command);
      return { success: true, data: result.Items as Customer[], statusCode: HTTP_STATUS_CODES.OK };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Erro ao listar clientes', statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR };
    }
  }
} 