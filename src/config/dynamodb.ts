import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { config } from 'dotenv';

config();

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });

export const dynamoClient = DynamoDBDocumentClient.from(client);

export const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME; 