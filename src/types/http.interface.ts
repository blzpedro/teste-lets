import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";

export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
  timestamp?: string;
  statusCode: number;
}

export interface Response<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
}

export enum HTTP_STATUS_CODES {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

export type RouteHandler = (event: APIGatewayProxyEvent, context: Context) => Promise<APIGatewayProxyResult>;

export interface Route {
  method: string;
  path: string;
  handler: RouteHandler;
}