import { Schema, type SchemaDefinition } from 'mongoose';

const baseSchemaDefinition: SchemaDefinition = {
  isDeleted: { type: Boolean, default: false },
};

export class BaseSchema extends Schema {
  constructor(definition?: SchemaDefinition) {
    super({ ...baseSchemaDefinition, ...definition }, { timestamps: true });
  }
}
