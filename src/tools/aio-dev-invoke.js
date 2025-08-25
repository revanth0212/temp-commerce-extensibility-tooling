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

import { isAioAppProject } from '../utils/project-validator.js';
import https from 'https';
import yaml from 'js-yaml';
import fs from 'fs/promises';
import path from 'path';

// Common action names for discovery (fallback)
const COMMON_ACTIONS = [
  'starter-kit/info',
  'product-commerce/created',
  'product-commerce/updated',
  'order-commerce/created',
  'order-commerce/updated',
  'customer-commerce/created',
  'customer-commerce/updated',
  'inventory-commerce/updated',
  'catalog-commerce/updated'
];

// Parse app.config.yaml to discover all available actions
async function discoverActionsFromConfig(projectRoot) {
  try {
    const configPath = path.join(projectRoot, 'app.config.yaml');
    const configContent = await fs.readFile(configPath, 'utf8');
    const config = yaml.load(configContent);
    
    const allActions = [];
    
    // Parse runtimeManifest.packages
    if (config.application?.runtimeManifest?.packages) {
      for (const [packageName, packageConfig] of Object.entries(config.application.runtimeManifest.packages)) {
        if (packageConfig.actions) {
          // Check if actions contains $include directive
          if (packageConfig.actions.$include) {
            const includePath = packageConfig.actions.$include;
            const includedActions = await parseIncludedActions(projectRoot, includePath);
            includedActions.forEach(actionName => {
              allActions.push(`${packageName}/${actionName}`);
            });
          } else {
            // Handle direct action definitions
            for (const [actionName, actionConfig] of Object.entries(packageConfig.actions)) {
              if (typeof actionConfig === 'object' && actionConfig.function) {
                allActions.push(`${packageName}/${actionName}`);
              }
            }
          }
        }
      }
    }
    
    return allActions;
  } catch (error) {
    console.error('Error parsing app.config.yaml:', error.message);
    return []; // Return empty array if parsing fails
  }
}

// Parse included action config files
async function parseIncludedActions(projectRoot, includePath) {
  try {
    const fullPath = path.resolve(projectRoot, includePath);
    const content = await fs.readFile(fullPath, 'utf8');
    const actions = yaml.load(content);
    
    const actionNames = [];
    for (const [actionName, actionConfig] of Object.entries(actions)) {
      if (typeof actionConfig === 'object' && actionConfig.function) {
        actionNames.push(actionName);
      }
    }
    
    return actionNames;
  } catch (error) {
    console.error(`Error parsing included actions from ${includePath}:`, error.message);
    return [];
  }
}

// Helper function to make HTTPS requests with SSL certificate validation disabled
function makeHttpsRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      rejectUnauthorized: false // This is the key - ignore SSL certificate validation
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          statusText: res.statusMessage,
          headers: res.headers,
          body: data,
          ok: res.statusCode >= 200 && res.statusCode < 300
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

// Check if dev server is running on specified port
async function checkDevServer(port = 9080) {
  try {
    const response = await makeHttpsRequest(`https://localhost:${port}/api/v1/web/starter-kit/info`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer fake-token-123',
        'x-gw-ims-org-id': 'fake-org-id-123'
      }
    });
    return true; // Server is running
  } catch (error) {
    return false; // Server not running or not accessible
  }
}

// Discover available actions by trying action names from config
async function discoverActions(port = 9080, projectRoot = process.cwd()) {
  const availableActions = [];
  
  // First, try to get actions from app.config.yaml
  let actionsToTest = await discoverActionsFromConfig(projectRoot);
  
  let usedConfig = false;
  
  // If no actions found in config, fall back to common actions
  if (actionsToTest.length === 0) {
    actionsToTest = COMMON_ACTIONS;
  } else {
    usedConfig = true;
  }
  
  // Test each action to see if it's available
  for (const actionName of actionsToTest) {
    try {
      const response = await makeHttpsRequest(`https://localhost:${port}/api/v1/web/${actionName}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': 'Bearer fake-token-123',
          'x-gw-ims-org-id': 'fake-org-id-123'
        }
      });
      
      // If we get any response (even 401/403), the action exists
      if (response.status !== 404) {
        availableActions.push(actionName);
      }
    } catch (error) {
      // Action doesn't exist or server error
    }
  }
  
  return { actions: availableActions, usedConfig };
}

// Invoke a specific action
async function invokeAction(actionName, parameters = {}, method = 'POST', port = 9080) {
  const url = `https://localhost:${port}/api/v1/web/${actionName}`;
  
  const requestOptions = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer fake-token-123',
      'x-gw-ims-org-id': 'fake-org-id-123'
    }
  };
  
  // Add body for POST/PUT requests
  if (method !== 'GET' && Object.keys(parameters).length > 0) {
    requestOptions.body = JSON.stringify(parameters);
  }
  
  try {
    const response = await makeHttpsRequest(url, requestOptions);
    
    let responseBody;
    try {
      responseBody = JSON.parse(response.body);
    } catch (e) {
      responseBody = response.body;
    }
    
    return {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      body: responseBody,
      headers: response.headers
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      status: 0,
      statusText: 'Network Error'
    };
  }
}

// Create success response with formatted output
function createSuccessResponse(actionName, result, parameters, method, port) {
  const statusEmoji = result.success ? '✅' : '❌';
  const statusText = result.success ? 'Success' : 'Failed';
  
  let responseText = `${statusEmoji} **Action Invocation ${statusText}**

📋 **Details:**
- **Action**: ${actionName}
- **Method**: ${method}
- **URL**: https://localhost:${port}/api/v1/web/${actionName}
- **Status**: ${result.status} ${result.statusText}

📤 **Request Parameters:**
\`\`\`json
${JSON.stringify(parameters, null, 2)}
\`\`\`

📥 **Response:**
\`\`\`json
${JSON.stringify(result.body, null, 2)}
\`\`\``;

  if (result.headers) {
    responseText += `\n\n📋 **Response Headers:**
\`\`\`json
${JSON.stringify(result.headers, null, 2)}
\`\`\``;
  }

  return {
    content: [
      {
        type: 'text',
        text: responseText
      }
    ]
  };
}

// Create discovery response
function createDiscoveryResponse(availableActions, port, usedConfig = false) {
  if (availableActions.length === 0) {
    return {
      content: [
        {
          type: 'text',
          text: `🔍 **Action Discovery Results**

❌ **No actions found** on port ${port}

💡 **Suggestions:**
- Make sure \`aio app dev\` is running
- Check if your app has different action names
- Try running the action with a specific name you know exists

📋 **Common action names tried:**
${COMMON_ACTIONS.map(action => `- ${action}`).join('\n')}`
        }
      ]
    };
  }

  return {
    content: [
      {
        type: 'text',
        text: `🔍 **Action Discovery Results**

✅ **Found ${availableActions.length} available actions** on port ${port}

📋 **Available Actions:**
${availableActions.map(action => `- ${action}`).join('\n')}

💡 **Usage Example:**
\`\`\`json
{
  "actionName": "${availableActions[0]}",
  "parameters": {"key": "value"},
  "method": "POST"
}
\`\`\`

🔧 **Discovery Method:** ${usedConfig ? 'Parsed from app.config.yaml' : 'Used common action names (fallback)'}`
      }
    ]
  };
}

export default async function handleAioDevInvoke(args) {
  // Check if we're in an Adobe I/O App project
  const projectRoot = process.cwd();
  if (!(await isAioAppProject(projectRoot))) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ Error: No app.config.yaml found in current directory (${projectRoot}). Please run this command from an Adobe I/O App project root.`
        }
      ]
    };
  }

  const port = args.port || 9080;
  const method = args.method || 'POST';

  // Check if dev server is running
  const isServerRunning = await checkDevServer(port);
  if (!isServerRunning) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ **Development Server Not Running**

The Adobe I/O development server is not running on port ${port}.

💡 **To start the server:**
\`\`\`bash
aio app dev
\`\`\`

**Or if you're using a different port:**
\`\`\`bash
export SERVER_DEFAULT_PORT=${port + 1}
aio app dev
\`\`\`

Then try this tool again.`
        }
      ]
    };
  }

  // If discovery is requested
  if (args.discoverActions) {
    const discoveryResult = await discoverActions(port, projectRoot);
    return createDiscoveryResponse(discoveryResult.actions, port, discoveryResult.usedConfig);
  }

  // Validate required parameters
  if (!args.actionName) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ **Missing Required Parameter**

The \`actionName\` parameter is required.

💡 **Example Usage:**
\`\`\`json
{
  "actionName": "starter-kit/info",
  "parameters": {"name": "test"},
  "method": "POST"
}
\`\`\`

🔍 **To discover available actions:**
\`\`\`json
{
  "discoverActions": true,
  "port": ${port}
}
\`\`\``
        }
      ]
    };
  }

  // Invoke the action
  const parameters = args.parameters || {};
  const result = await invokeAction(args.actionName, parameters, method, port);

  return createSuccessResponse(args.actionName, result, parameters, method, port);
} 