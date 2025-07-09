import { validateData } from '../validation.utils';
import { ValidationError } from '../errors.utils';
import { Type } from '../../types/data.interface';

describe('Validation Utils', () => {
  describe('Required Validation', () => {
    it('should pass when required field is present', () => {
      const data = { name: 'John' };
      const validations = { name: { required: true, type: Type.string } };
      
      expect(() => validateData(data, validations)).not.toThrow();
    });

    it('should throw when required field is missing', () => {
      const data = {};
      const validations = { name: { required: true, type: Type.string } };
      
      expect(() => validateData(data, validations)).toThrow(ValidationError);
      expect(() => validateData(data, validations)).toThrow('The field name is required');
    });

    it('should throw when required field is empty string', () => {
      const data = { name: '' };
      const validations = { name: { required: true, type: Type.string } };
      
      expect(() => validateData(data, validations)).toThrow('The field name is required');
    });
  });

  describe('Type Validation', () => {
    it('should validate string type', () => {
      const data = { name: 'John' };
      const validations = { name: { required: false, type: Type.string } };
      
      expect(() => validateData(data, validations)).not.toThrow();
    });

    it('should validate number type', () => {
      const data = { age: 25 };
      const validations = { age: { required: false, type: Type.number } };
      
      expect(() => validateData(data, validations)).not.toThrow();
    });

    it('should validate boolean type', () => {
      const data = { active: true };
      const validations = { active: { required: false, type: Type.boolean } };
      
      expect(() => validateData(data, validations)).not.toThrow();
    });

    it('should validate array type', () => {
      const data = { tags: ['tag1', 'tag2'] };
      const validations = { tags: { required: false, type: Type.array } };
      
      expect(() => validateData(data, validations)).not.toThrow();
    });

    it('should validate object type', () => {
      const data = { address: { street: 'Main St' } };
      const validations = { address: { required: false, type: Type.object } };
      
      expect(() => validateData(data, validations)).not.toThrow();
    });

    it('should throw for wrong type', () => {
      const data = { age: '25' };
      const validations = { age: { required: false, type: Type.number } };
      
      expect(() => validateData(data, validations)).toThrow('The field age must be a number');
    });

    it('should skip validation for null/undefined', () => {
      const data = { age: null };
      const validations = { age: { required: false, type: Type.number } };
      
      expect(() => validateData(data, validations)).not.toThrow();
    });
  });

  describe('Min Length Validation', () => {
    it('should pass when string meets minimum length', () => {
      const data = { name: 'John Doe' };
      const validations = { name: { required: false, type: Type.string, minLength: 3 } };
      
      expect(() => validateData(data, validations)).not.toThrow();
    });

    it('should throw when string is too short', () => {
      const data = { name: 'Jo' };
      const validations = { name: { required: false, type: Type.string, minLength: 3 } };
      
      expect(() => validateData(data, validations)).toThrow('The field name must have at least 3 characters');
    });

    it('should skip validation for null/undefined', () => {
      const data = { name: null };
      const validations = { name: { required: false, type: Type.string, minLength: 3 } };
      
      expect(() => validateData(data, validations)).not.toThrow();
    });
  });

  describe('Date Format Validation', () => {
    it('should validate correct date format', () => {
      const data = { birthDate: '15/03/1990' };
      const validations = { birthDate: { required: false, type: Type.string, format: 'date' } };
      
      expect(() => validateData(data, validations)).not.toThrow();
    });

    it('should throw for invalid date format', () => {
      const data = { birthDate: '1990-03-15' };
      const validations = { birthDate: { required: false, type: Type.string, format: 'date' } };
      
      expect(() => validateData(data, validations)).toThrow('The field birthDate must be a valid date');
    });

    it('should throw for invalid date', () => {
      const data = { birthDate: '32/13/1990' };
      const validations = { birthDate: { required: false, type: Type.string, format: 'date' } };
      
      expect(() => validateData(data, validations)).toThrow('The field birthDate must be a valid date');
    });

    it('should skip validation for null/undefined', () => {
      const data = { birthDate: null };
      const validations = { birthDate: { required: false, type: Type.string, format: 'date' } };
      
      expect(() => validateData(data, validations)).not.toThrow();
    });
  });

  describe('Enum Validation', () => {
    it('should validate allowed enum value', () => {
      const data = { status: 'active' };
      const validations = { status: { required: false, type: Type.string, enum: ['active', 'inactive', 'pending'] } };
      
      expect(() => validateData(data, validations)).not.toThrow();
    });

    it('should throw for disallowed enum value', () => {
      const data = { status: 'invalid' };
      const validations = { status: { required: false, type: Type.string, enum: ['active', 'inactive', 'pending'] } };
      
      expect(() => validateData(data, validations)).toThrow('The field status must be one of the allowed values: active, inactive, pending');
    });

    it('should skip validation for null/undefined', () => {
      const data = { status: null };
      const validations = { status: { required: false, type: Type.string, enum: ['active', 'inactive'] } };
      
      expect(() => validateData(data, validations)).not.toThrow();
    });
  });

  describe('Array Items Validation', () => {
    it('should validate array items', () => {
      const data = { 
        items: [
          { name: 'Item 1', price: 10 },
          { name: 'Item 2', price: 20 }
        ]
      };
      const validations = {
        items: {
          required: false,
          type: Type.array,
          items: {
            type: Type.object,
            properties: {
              name: { required: true, type: Type.string },
              price: { required: true, type: Type.number }
            }
          }
        }
      };
      
      expect(() => validateData(data, validations)).not.toThrow();
    });

    it('should throw when array item is invalid', () => {
      const data = { 
        items: [
          { name: 'Item 1', price: 'invalid' }
        ]
      };
      const validations = {
        items: {
          required: false,
          type: Type.array,
          items: {
            type: Type.object,
            properties: {
              name: { required: true, type: Type.string },
              price: { required: true, type: Type.number }
            }
          }
        }
      };
      
      expect(() => validateData(data, validations)).toThrow('The field price must be a number');
    });
  });

  describe('Combined Validations', () => {
    it('should validate multiple rules together', () => {
      const data = { 
        name: 'John Doe',
        age: 25,
        email: 'john@example.com'
      };
      const validations = {
        name: { required: true, type: Type.string, minLength: 3 },
        age: { required: true, type: Type.number },
        email: { required: true, type: Type.string, minLength: 5 }
      };
      
      expect(() => validateData(data, validations)).not.toThrow();
    });

    it('should throw for first validation error', () => {
      const data = { 
        name: 'Jo',
        age: '25'
      };
      const validations = {
        name: { required: true, type: Type.string, minLength: 3 },
        age: { required: true, type: Type.number }
      };
      
      expect(() => validateData(data, validations)).toThrow('The field name must have at least 3 characters');
    });
  });
});
