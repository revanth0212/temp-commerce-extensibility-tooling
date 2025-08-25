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

import sdkSchemaManager from '../utils/sdk-schema-manager.js';

export async function getToolHandler(name) {
  switch (name) {
    case 'aio-app-deploy':
      return (await import('./aio-app-deploy.js')).default;
    case 'aio-app-dev':
      return (await import('./aio-app-dev.js')).default;
    case 'aio-dev-invoke':
      return (await import('./aio-dev-invoke.js')).default;
    case 'aio-login':
      return (await import('./aio-login.js')).default;
    case 'aio-where':
      return (await import('./aio-where.js')).default;
    case 'aio-app-use':
      return (await import('./aio-app-use.js')).default;
    case 'aio-configure-global':
      return (await import('./aio-configure-global.js')).default;
    case 'onboard':
      return (await import('./onboard.js')).default;
    case 'commerce-event-subscribe':
      return (await import('./commerce-event-subscribe.js')).default;
    case 'search-commerce-app-builder-docs':
      return (await import('./search-commerce-app-builder-docs.js')).default;
    default:
      return null;
  }
}

// List tool schemas for ListToolsRequestSchema
export async function listToolSchemas() {
  // Ensure schemas are loaded
  if (sdkSchemaManager.schemas.size === 0) {
    await sdkSchemaManager.loadSchemas();
  }
  
  return sdkSchemaManager.getAllSchemas();
} 