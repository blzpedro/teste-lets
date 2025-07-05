import { FieldValidation } from '../types/data.interface';
import { ValidationError } from './errors.utils';

export function validateData(data: any, fieldsAndValidations: { [key: string]: FieldValidation }) {
  for (const [key, validation] of Object.entries(fieldsAndValidations)) {
    if (validation.required && (data[key] === undefined || data[key] === null || data[key] === '')) {
      throw new ValidationError(`A propriedade ${key} é obrigatória`);
    }
    if (validation.type === 'string' && typeof data[key] !== 'string') {
      throw new ValidationError(`A propriedade ${key} deve ser uma string`);
    }
    if (validation.type === 'number' && typeof data[key] !== 'number') {
      throw new ValidationError(`A propriedade ${key} deve ser um número`);
    }
    if (validation.type === 'boolean' && typeof data[key] !== 'boolean') {
      throw new ValidationError(`A propriedade ${key} deve ser um booleano`);
    }
    if (validation.type === 'array' && !Array.isArray(data[key])) {
      throw new ValidationError(`A propriedade ${key} deve ser um array`);
    }
    if (validation.type === 'object' && typeof data[key] !== 'object') {
      throw new ValidationError(`A propriedade ${key} deve ser um objeto`);
    }
    if (validation.minLength && data[key].length < validation.minLength) {
      throw new ValidationError(`A propriedade ${key} deve ter pelo menos ${validation.minLength} caracteres`);
    }
    if (validation.format === 'date' && !isValidDate(data[key])) {
      throw new ValidationError(`A propriedade ${key} deve ser uma data válida`);
    }
    if (validation.enum && !validation.enum.includes(data[key])) {
      throw new ValidationError(`A propriedade ${key} deve ser um dos valores permitidos: ${validation.enum.join(', ')}`);
    }
    if (validation.items) {
      if (!Array.isArray(data[key])) {
        throw new ValidationError(`A propriedade ${key} deve ser um array`);
      }
      for (const item of data[key]) {
        validateData(item, validation.items.properties as { [key: string]: FieldValidation });
      }
    }
  }
}

function isValidDate(date: string): boolean {
  if (typeof date !== 'string') {
    return false;
  }
  
  const regex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const match = date.match(regex);
  
  if (!match) {
    return false;
  }
  
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);
  
  if (month < 1 || month > 12) {
    return false;
  }
  
  const dateObj = new Date(year, month - 1, day);
  return dateObj.getFullYear() === year && 
         dateObj.getMonth() === month - 1 && 
         dateObj.getDate() === day;
}