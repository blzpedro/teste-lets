import { ServerResponse, IncomingMessage } from 'http';
import { ApiResponse } from '../types/http.interface';
import { Route } from '../types/http.interface';

export function sendResponse(res: ServerResponse, response: ApiResponse): void {
  res.writeHead(response.statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(response, null, 2));
}

export function parseBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

export function identifyRoute(path: string, method: string, routes: Route[]): Route | null {
  return routes.find(route => 
    route.path === path && route.method === method
  ) || null;
}

export function setupCORS(res: ServerResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}