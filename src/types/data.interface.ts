export enum Type {
  string = 'string',
  number = 'number',
  boolean = 'boolean',
  array = 'array',
  object = 'object',
}

export interface FieldValidation {
  required: boolean;
  type: Type;
  minLength?: number;
  format?: string;
  enum?: string[];
  items?: {
    type: Type;
    properties?: {
      [key: string]: FieldValidation;
    };
  };
}