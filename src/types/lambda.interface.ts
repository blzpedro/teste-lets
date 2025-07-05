import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

export interface LambdaHandler {
  (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult>;
}

export interface LambdaResponse {
  statusCode: number;
  headers: {
    'Content-Type': string;
    'Access-Control-Allow-Origin': string;
    'Access-Control-Allow-Headers': string;
    'Access-Control-Allow-Methods': string;
  };
  body: string;
}

export interface LambdaError {
  success: false;
  error: string;
  statusCode: number;
}

export interface LambdaSuccess<T> {
  success: true;
  data?: T;
  message?: string;
  statusCode: number;
}