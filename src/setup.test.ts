import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

jest.setTimeout(10000);

jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: jest.fn(),
}));

jest.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: jest.fn(),
  },
}));

describe('Test Setup', () => {
  it('should have proper test configuration', () => {
    expect(process.env.NODE_ENV).toBeDefined();
    expect(true).toBe(true);
  });
}); 