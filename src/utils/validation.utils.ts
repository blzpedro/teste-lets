import { FieldValidation, Type } from '../types/data.interface';
import { ValidationError } from './errors.utils';

interface ValidationRule {
  validate(value: any, fieldName: string): void;
}

class RequiredValidation implements ValidationRule {
  validate(value: any, fieldName: string): void {
    if (value === undefined || value === null || value === '') {
      throw new ValidationError(`A propriedade ${fieldName} é obrigatória`);
    }
  }
}

class TypeValidation implements ValidationRule {
  constructor(private expectedType: Type) {}

  validate(value: any, fieldName: string): void {
    if (value === undefined || value === null) return;

    let isValid = false;
    switch (this.expectedType) {
      case Type.string:
        isValid = typeof value === 'string';
        break;
      case Type.number:
        isValid = typeof value === 'number';
        break;
      case Type.boolean:
        isValid = typeof value === 'boolean';
        break;
      case Type.array:
        isValid = Array.isArray(value);
        break;
      case Type.object:
        isValid = typeof value === 'object' && !Array.isArray(value);
        break;
    }

    if (!isValid) {
      throw new ValidationError(`A propriedade ${fieldName} deve ser um ${this.expectedType}`);
    }
  }
}

class MinLengthValidation implements ValidationRule {
  constructor(private minLength: number) {}

  validate(value: any, fieldName: string): void {
    if (value === undefined || value === null) return;
    if (value.length < this.minLength) {
      throw new ValidationError(`A propriedade ${fieldName} deve ter pelo menos ${this.minLength} caracteres`);
    }
  }
}

class DateFormatValidation implements ValidationRule {
  validate(value: any, fieldName: string): void {
    if (value === undefined || value === null) return;
    if (!this.isValidDate(value)) {
      throw new ValidationError(`A propriedade ${fieldName} deve ser uma data válida`);
    }
  }

  private isValidDate(date: string): boolean {
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
}

class EnumValidation implements ValidationRule {
  constructor(private allowedValues: any[]) {}

  validate(value: any, fieldName: string): void {
    if (value === undefined || value === null) return;
    if (!this.allowedValues.includes(value)) {
      throw new ValidationError(`A propriedade ${fieldName} deve ser um dos valores permitidos: ${this.allowedValues.join(', ')}`);
    }
  }
}

class ArrayItemsValidation implements ValidationRule {
  constructor(private itemValidations: { [key: string]: FieldValidation }) {}

  validate(value: any, fieldName: string): void {
    if (value === undefined || value === null) return;
    if (!Array.isArray(value)) {
      throw new ValidationError(`A propriedade ${fieldName} deve ser um array`);
    }
    
    for (const item of value) {
      Validator.validateData(item, this.itemValidations);
    }
  }
}

export class Validator {
  private rules: ValidationRule[] = [];

  static validateData(data: any, fieldsAndValidations: { [key: string]: FieldValidation }): void {
    const validator = new Validator();
    validator.validateObject(data, fieldsAndValidations);
  }

  private validateObject(data: any, fieldsAndValidations: { [key: string]: FieldValidation }): void {
    for (const [key, validation] of Object.entries(fieldsAndValidations)) {
      this.validateField(data[key], key, validation);
    }
  }

  private validateField(value: any, fieldName: string, validation: FieldValidation): void {
    const rules: ValidationRule[] = [];

    if (validation.required) {
      rules.push(new RequiredValidation());
    }

    if (validation.type) {
      rules.push(new TypeValidation(validation.type));
    }

    if (validation.minLength) {
      rules.push(new MinLengthValidation(validation.minLength));
    }

    if (validation.format === 'date') {
      rules.push(new DateFormatValidation());
    }

    if (validation.enum) {
      rules.push(new EnumValidation(validation.enum));
    }

    if (validation.items) {
      rules.push(new ArrayItemsValidation(validation.items.properties as { [key: string]: FieldValidation }));
    }

    for (const rule of rules) {
      rule.validate(value, fieldName);
    }
  }
}

export function validateData(data: any, fieldsAndValidations: { [key: string]: FieldValidation }): void {
  Validator.validateData(data, fieldsAndValidations);
}