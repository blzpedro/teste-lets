export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class DynamoDBError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'DynamoDBError';
  }
}

export function handleError(error: unknown): never {
  if (error instanceof ValidationError || error instanceof DynamoDBError) {
    throw error;
  }
  
  if (error && typeof error === 'object' && 'name' in error) {
    const awsError = error as any;
    throw new DynamoDBError(`AWS Error: ${awsError.name} - ${awsError.message}`, awsError);
  }
  
  throw new Error(`Unexpected error: ${error}`);
} 