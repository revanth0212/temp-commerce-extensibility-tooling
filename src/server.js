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

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { getToolHandler, listToolSchemas } from './tools/index.js';
import sdkSchemaManager from './utils/sdk-schema-manager.js';

class AdobeIOMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'adobe-io-tools',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );
    this.setupTools();
    this.setupTransport();
  }

  setupTools() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: await listToolSchemas()
      };
    });
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      // Validate the complete request using SDK schemas
      const requestValidation = sdkSchemaManager.validateToolRequest(request);
      if (!requestValidation.valid) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Invalid request format: ${requestValidation.error}`
            }
          ]
        };
      }

      const { name, arguments: args } = request.params;
      try {
        // Validate input against schema using Zod
        const validation = sdkSchemaManager.validateInput(name, args);
        if (!validation.valid) {
          return {
            content: [
              {
                type: 'text',
                text: `❌ Input validation failed: ${validation.error}`
              }
            ]
          };
        }

        // Apply default values
        const validatedArgs = sdkSchemaManager.applyDefaults(validation.data, name);

        const toolHandler = await getToolHandler(name);
        if (!toolHandler) {
          throw new Error(`Unknown tool: ${name}`);
        }
        return await toolHandler(validatedArgs);
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`
            }
          ]
        };
      }
    });
  }

  setupTransport() {
    this.transport = new StdioServerTransport();
    this.server.connect(this.transport);
  }

  async start() {
    console.error('Adobe I/O MCP Server starting...');
    // Load schemas on startup with Zod validation
    await sdkSchemaManager.loadSchemas();
    // The transport starts automatically when connect() is called
  }
}

export { AdobeIOMCPServer }; 