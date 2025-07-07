import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CustomerService } from '../services/customer.service';
import { createSuccessResponse, createErrorResponse, parseLambdaBody } from '../utils/lambda.utils';
import { HTTP_STATUS_CODES, CreateCustomerRequest, UpdateCustomerRequest, ListCustomersQueryStringParameters } from '../types';

const customerService = new CustomerService();

export const getCustomersHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const result = await customerService.listCustomers(event.queryStringParameters as ListCustomersQueryStringParameters);
    
    if (result.success) {
      return createSuccessResponse(result.data, undefined, result.statusCode);
    } else {
      return createErrorResponse(result.error || 'Failed to list customers', result.statusCode);
    }
  } catch (error) {
    console.error('Error in getCustomersHandler:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
    );
  }
};

export const createCustomerHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const customerData = parseLambdaBody<CreateCustomerRequest>(event.body);
    const result = await customerService.createCustomer(customerData);
    
    if (result.success) {
      return createSuccessResponse(result.data, undefined, result.statusCode);
    } else {
      return createErrorResponse(result.error || 'Failed to create customer', result.statusCode);
    }
  } catch (error) {
    console.error('Error in createCustomerHandler:', error);
    const statusCode = error instanceof Error && error.message.includes('Invalid') 
      ? HTTP_STATUS_CODES.BAD_REQUEST 
      : HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR;
    
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      statusCode
    );
  }
}; 

export const deleteCustomerHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const customerId = event.pathParameters?.id;
    if (!customerId) {
      return createErrorResponse('Customer ID is required', HTTP_STATUS_CODES.BAD_REQUEST);
    }

    const result = await customerService.deleteCustomer(customerId);

    if (result.success) {
      return createSuccessResponse(undefined, undefined, result.statusCode);
    } else {
      return createErrorResponse(result.error || 'Failed to delete customer', result.statusCode);
    }

  } catch (error) {
    console.error('Error in deleteCustomerHandler:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
    );
  }
};

export const updateCustomerHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const customerId = event.pathParameters?.id;
    if (!customerId) {
      return createErrorResponse('Customer ID is required', HTTP_STATUS_CODES.BAD_REQUEST);
    }

    const customerData = parseLambdaBody<UpdateCustomerRequest>(event.body);
    const result = await customerService.updateCustomer(customerId, customerData);
    
    if (result.success) {
      return createSuccessResponse(result.data, undefined, result.statusCode);
    } else {
      return createErrorResponse(result.error || 'Failed to update customer', result.statusCode);
    }
  } catch (error) {
    console.error('Error in updateCustomerHandler:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
    );
  }
};

export const getCustomerByIdHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const customerId = event.pathParameters?.id;
    if (!customerId) {
      return createErrorResponse('Customer ID is required', HTTP_STATUS_CODES.BAD_REQUEST);
    }

    const result = await customerService.getCustomerById(customerId);
    
    if (result.success) {
      return createSuccessResponse(result.data, undefined, result.statusCode);
    } else {
      return createErrorResponse(result.error || 'Failed to get customer by id', result.statusCode);
    }
  } catch (error) {
    console.error('Error in getCustomerByIdHandler:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
    );
  }
};    