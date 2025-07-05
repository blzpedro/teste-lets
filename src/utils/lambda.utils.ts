import { APIGatewayProxyResult } from 'aws-lambda';
import { LambdaError, LambdaSuccess } from '../types';

export function createLambdaResponse(
  statusCode: number,
  body: any,
  headers?: Record<string, string>
): APIGatewayProxyResult {
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
  };

  return {
    statusCode,
    headers: { ...defaultHeaders, ...headers },
    body: JSON.stringify(body)
  };
}

export function createSuccessResponse<T>(data?: T, message?: string, statusCode: number = 200): APIGatewayProxyResult {
  const response: LambdaSuccess<T> = {
    success: true,
    statusCode
  };

  if (data !== undefined) response.data = data;
  if (message !== undefined) response.message = message;

  return createLambdaResponse(statusCode, response);
}

export function createErrorResponse(error: string, statusCode: number = 500): APIGatewayProxyResult {
  const response: LambdaError = {
    success: false,
    error,
    statusCode
  };

  return createLambdaResponse(statusCode, response);
}

export function parseLambdaBody<T>(body: string | null): T {
  if (!body) {
    throw new Error('Request body is required');
  }
  
  try {
    return JSON.parse(body) as T;
  } catch (error) {
    throw new Error('Invalid JSON in request body');
  }
} 