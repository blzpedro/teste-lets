
import { healthHandler } from './handlers/health.handler';
import { getCustomersHandler, createCustomerHandler } from './handlers/customer.handler';
import { Route, RouteHandler } from './types/http.interface';

export const routes: Route[] = [
  { method: 'GET', path: '/health', handler: healthHandler },
  { method: 'GET', path: '/api/customers', handler: getCustomersHandler },
  { method: 'POST', path: '/api/customers', handler: createCustomerHandler },
];

export const findRoute = (method: string, path: string): RouteHandler | null => {
  const route = routes.find(r => r.method === method && r.path === path);
  return route ? route.handler : null;
}; 