import { createServer, IncomingMessage, ServerResponse } from 'http';
import { URL } from 'url';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { findRoute } from './routes';

const PORT = process.env.PORT || 3000;

function createLambdaEvent(req: IncomingMessage, url: URL): APIGatewayProxyEvent {
  return {
    httpMethod: req.method || 'GET',
    path: url.pathname,
    headers: req.headers as Record<string, string>,
    multiValueHeaders: {},
    queryStringParameters: Object.fromEntries(url.searchParams),
    multiValueQueryStringParameters: {},
    pathParameters: null,
    stageVariables: null,
    requestContext: {} as any,
    resource: '',
    body: null,
    isBase64Encoded: false
  };
}

function sendLambdaResponse(res: ServerResponse, lambdaResponse: APIGatewayProxyResult): void {
  const headers = lambdaResponse.headers || {};
  res.writeHead(lambdaResponse.statusCode, headers as any);
  res.end(lambdaResponse.body);
}

async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    const event = createLambdaEvent(req, url);
    const context = {} as Context;
    
    const handler = findRoute(event.httpMethod, event.path);
    
    if (handler) {
      const lambdaResponse = await handler(event, context);
      sendLambdaResponse(res, lambdaResponse);
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Not Found' }));
    }

  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Internal Server Error' }));
  }
}

const server = createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`🚀 Customer API server running on port ${PORT}`);
});

export default server; 