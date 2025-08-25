/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import { ToolSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Zod schema for our tool input validation
const ToolInputSchema = z.object({
  name: z.string(),
  description: z.string(),
  inputSchema: z.object({
    type: z.literal('object'),
    properties: z.record(z.any()).optional(),
    required: z.array(z.string()).optional(),
  }).passthrough(),
});

class SDKSchemaManager {
  constructor() {
    this.schemas = new Map();
    this.schemasDir = path.join(__dirname, '../schemas');
    this.zodSchemas = new Map(); // Cache for Zod schemas
  }

  /**
   * Load all schemas from the schemas directory and validate them with Zod
   */
  async loadSchemas() {
    try {
      const files = await fs.readdir(this.schemasDir);
      const jsonFiles = files.filter(file => file.endsWith('.json'));
      
      for (const file of jsonFiles) {
        const schemaPath = path.join(this.schemasDir, file);
        const schemaContent = await fs.readFile(schemaPath, 'utf8');
        const schema = JSON.parse(schemaContent);
        
        // Validate schema structure using Zod
        const validation = ToolInputSchema.safeParse(schema);
        if (validation.success) {
          this.schemas.set(schema.name, schema);
          
          // Create Zod schema for input validation
          this.createZodSchema(schema);
        } else {
          console.error(`Invalid schema structure in ${file}:`, validation.error);
        }
      }
      
      console.error(`Loaded ${this.schemas.size} schemas with Zod validation`);
    } catch (error) {
      console.error('Error loading schemas:', error);
      throw error;
    }
  }

  /**
   * Create a Zod schema for input validation based on the tool schema
   */
  createZodSchema(toolSchema) {
    if (!toolSchema.inputSchema || !toolSchema.inputSchema.properties) {
      return;
    }

    const properties = {};
    const required = toolSchema.inputSchema.required || [];

    for (const [key, propSchema] of Object.entries(toolSchema.inputSchema.properties)) {
      let zodType;

      switch (propSchema.type) {
        case 'string':
          zodType = z.string();
          break;
        case 'boolean':
          zodType = z.boolean();
          break;
        case 'integer':
          zodType = z.number().int();
          break;
        case 'number':
          zodType = z.number();
          break;
        case 'object':
          zodType = z.record(z.any());
          break;
        default:
          zodType = z.any();
      }

      // Handle enums
      if (propSchema.enum) {
          zodType = z.enum(propSchema.enum);
      }

      // Make optional if not required
      if (!required.includes(key)) {
        zodType = zodType.optional();
      }

      properties[key] = zodType;
    }

    const zodSchema = z.object(properties);
    this.zodSchemas.set(toolSchema.name, zodSchema);
  }

  /**
   * Get all tool schemas in SDK format
   */
  getAllSchemas() {
    return Array.from(this.schemas.values());
  }

  /**
   * Get a specific schema by name
   */
  getSchema(name) {
    return this.schemas.get(name);
  }

  /**
   * Validate input against a schema using Zod
   */
  validateInput(schemaName, input) {
    const zodSchema = this.zodSchemas.get(schemaName);
    if (!zodSchema) {
      return { valid: false, error: `Schema not found: ${schemaName}` };
    }

    const validation = zodSchema.safeParse(input);
    if (validation.success) {
      return { valid: true, data: validation.data };
    } else {
      return { 
        valid: false, 
        error: `Validation failed: ${validation.error.errors.map(e => e.message).join(', ')}` 
      };
    }
  }

  /**
   * Apply default values to input based on schema
   */
  applyDefaults(input, schemaName) {
    const schema = this.getSchema(schemaName);
    if (!schema) {
      return input;
    }

    const result = { ...input };
    
    if (schema.inputSchema.properties) {
      for (const [key, propertySchema] of Object.entries(schema.inputSchema.properties)) {
        if (!(key in result) && 'default' in propertySchema) {
          result[key] = propertySchema.default;
        }
      }
    }

    return result;
  }

  /**
   * Validate a complete tool request using SDK schemas
   */
  validateToolRequest(request) {
    const validation = CallToolRequestSchema.safeParse(request);
    if (validation.success) {
      return { valid: true, data: validation.data };
    } else {
      return { 
        valid: false, 
        error: `Invalid tool request: ${validation.error.errors.map(e => e.message).join(', ')}` 
      };
    }
  }

  /**
   * Get schema info with Zod validation
   */
  getSchemaInfo(schemaName) {
    const schema = this.getSchema(schemaName);
    if (!schema) {
      return null;
    }

    return {
      name: schema.name,
      description: schema.description,
      properties: Object.keys(schema.inputSchema.properties || {}),
      required: schema.inputSchema.required || [],
      hasDefaults: Object.values(schema.inputSchema.properties || {}).some(p => 'default' in p),
      hasZodValidation: this.zodSchemas.has(schemaName)
    };
  }

  /**
   * Reload schemas (useful for development)
   */
  async reloadSchemas() {
    this.schemas.clear();
    this.zodSchemas.clear();
    await this.loadSchemas();
  }
}

// Create singleton instance
const sdkSchemaManager = new SDKSchemaManager();

export default sdkSchemaManager; 