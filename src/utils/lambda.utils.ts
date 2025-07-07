import { APIGatewayProxyResult } from 'aws-lambda';
import { LambdaError, LambdaSuccess } from '../types';

export class LambdaResponseBuilder {
  private headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
  };

  withHeader(key: string, value: string): this {
    this.headers[key] = value;
    return this;
  }

  withHeaders(headers: Record<string, string>): this {
    this.headers = { ...this.headers, ...headers };
    return this;
  }

  success<T>(data?: T, message?: string, statusCode: number = 200): APIGatewayProxyResult {
    const response: LambdaSuccess<T> = {
      success: true,
      statusCode
    };

    if (data !== undefined) response.data = data;
    if (message !== undefined) response.message = message;

    return {
      statusCode,
      headers: this.headers,
      body: JSON.stringify(response)
    };
  }

  error(error: string, statusCode: number = 500): APIGatewayProxyResult {
    const response: LambdaError = {
      success: false,
      error,
      statusCode
    };

    return {
      statusCode,
      headers: this.headers,
      body: JSON.stringify(response)
    };
  }

  custom(statusCode: number, body: any): APIGatewayProxyResult {
    return {
      statusCode,
      headers: this.headers,
      body: JSON.stringify(body)
    };
  }
}

export function parseBody<T>(body: string | null): T {
  if (!body) {
    throw new Error('Request body is required');
  }
  
  try {
    return JSON.parse(body) as T;
  } catch (error) {
    throw new Error('Invalid JSON in request body');
  }
}

export const createLambdaResponse = (statusCode: number, body: any, headers?: Record<string, string>): APIGatewayProxyResult => {
  return new LambdaResponseBuilder().withHeaders(headers || {}).custom(statusCode, body);
};

export const createSuccessResponse = <T>(data?: T, message?: string, statusCode: number = 200): APIGatewayProxyResult => {
  return new LambdaResponseBuilder().success(data, message, statusCode);
};

export const createErrorResponse = (error: string, statusCode: number = 500): APIGatewayProxyResult => {
  return new LambdaResponseBuilder().error(error, statusCode);
};

export const parseLambdaBody = parseBody; 