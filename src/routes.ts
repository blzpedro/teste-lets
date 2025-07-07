import { healthHandler } from './handlers/health.handler';
import { getCustomersHandler, createCustomerHandler, deleteCustomerHandler, updateCustomerHandler, getCustomerByIdHandler } from './handlers/customer.handler';
import { Route, RouteHandler } from './types/http.interface';

export const routes: Route[] = [
  { method: 'GET', path: '/health', handler: healthHandler },
  { method: 'GET', path: '/api/customers', handler: getCustomersHandler },
  { method: 'POST', path: '/api/customers', handler: createCustomerHandler },
  { method: 'DELETE', path: '/api/customers/{id}', handler: deleteCustomerHandler },
  { method: 'PUT', path: '/api/customers/{id}', handler: updateCustomerHandler },
  { method: 'GET', path: '/api/customers/{id}', handler: getCustomerByIdHandler },
];

export const findRoute = (method: string, path: string): RouteHandler | null => {
  const route = routes.find(r => {
    if (r.method !== method) return false;
    
    const pattern = r.path.replace(/\{([^}]+)\}/g, '([^/]+)');
    const regex = new RegExp(`^${pattern}$`);
    
    return regex.test(path);
  });
  
  return route ? route.handler : null;
}; 