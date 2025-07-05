import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { createSuccessResponse } from '../utils/lambda.utils';
import { HTTP_STATUS_CODES } from '../types';

export const healthHandler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  return createSuccessResponse(
    {
      timestamp: new Date().toISOString(),
      service: 'Customer API',
      status: 'healthy'
    },
    'Server is running',
    HTTP_STATUS_CODES.OK
  );
}; 