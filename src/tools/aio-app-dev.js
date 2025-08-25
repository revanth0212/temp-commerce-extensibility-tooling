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

import { executeCommand } from '../utils/command-executor.js';
import { isAioAppProject } from '../utils/project-validator.js';
import { spawn } from 'child_process';

// Check for port conflicts before starting
async function checkPortAvailability(port = 9080) {
  try {
    const response = await fetch(`https://localhost:${port}/api/v1/web/starter-kit/info`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    return false; // Port is in use
  } catch (error) {
    return true; // Port is available
  }
}

// Add polling mechanism to detect when server is ready
async function waitForServerReady(port = 9080, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`https://localhost:${port}/api/v1/web/starter-kit/info`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (response.status === 401) { // Expected auth error means server is ready
        return true;
      }
    } catch (error) {
      // Server not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return false;
}

// Capture and parse aio app dev output
function parseAioOutput(output) {
  const webActions = [];
  const nonWebActions = [];
  
  // Parse the output to extract endpoint information
  const lines = output.split('\n');
  let inWebActions = false;
  let inNonWebActions = false;
  
  for (const line of lines) {
    if (line.includes('web actions:')) {
      inWebActions = true;
      inNonWebActions = false;
      continue;
    }
    if (line.includes('non-web actions:')) {
      inWebActions = false;
      inNonWebActions = true;
      continue;
    }
    if (line.includes('press CTRL+C')) {
      break;
    }
    
    if (inWebActions && line.includes('->')) {
      webActions.push(line.trim());
    }
    if (inNonWebActions && line.includes('->')) {
      nonWebActions.push(line.trim());
    }
  }
  
  return { webActions, nonWebActions };
}

// Enhanced error handling
function handleStartupError(error, port = 9080) {
  if (error.message && error.message.includes('EADDRINUSE')) {
    return {
      status: "error",
      error: "PORT_IN_USE",
      message: `Port ${port} is already in use. Please kill the process or use a different port.`,
      suggestion: `Run: lsof -i :${port} && kill <PID>`
    };
  }
  
  return {
    status: "error", 
    error: "STARTUP_FAILED",
    message: "Failed to start development server",
    details: error.message
  };
}

// Return structured response with all necessary information
function createSuccessResponse(port, pid, endpoints, output) {
  return {
    content: [
      {
        type: 'text',
        text: `🚀 **Adobe I/O App Development Server Started Successfully!**

📋 **Server Information:**
- **URL**: https://localhost:${port}
- **Process ID**: ${pid}
- **Started**: ${new Date().toISOString()}

🔗 **Available Endpoints:**

**Web Actions:**
${endpoints.webActions.map(action => `- ${action}`).join('\n')}

**Non-Web Actions:**
${endpoints.nonWebActions.map(action => `- ${action}`).join('\n')}

🧪 **Testing Examples:**
\`\`\`bash
# Test a web action (requires authentication)
curl -k -H 'Authorization: Bearer YOUR_TOKEN' https://localhost:${port}/api/v1/web/starter-kit/info

# Test with proper headers
curl -k -H 'Content-Type: application/json' -H 'Authorization: Bearer YOUR_TOKEN' https://localhost:${port}/api/v1/web/starter-kit/info
\`\`\`

💡 **Notes:**
- Server requires authentication for web actions
- Use \`-k\` flag for self-signed certificates
- Press Ctrl+C in terminal to stop the server
- Server automatically reloads on file changes

📄 **Command Output:**
\`\`\`
${output}
\`\`\``
      }
    ]
  };
}

export default async function handleAioAppDev(args) {
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

  // Check port availability first
  const port = 9080; // Default port
  const isPortAvailable = await checkPortAvailability(port);
  if (!isPortAvailable) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ **Port Conflict Detected!**

Port ${port} is already in use. Please kill the existing process or use a different port.

**To fix this:**
\`\`\`bash
# Find the process using the port
lsof -i :${port}

# Kill the process (replace <PID> with actual process ID)
kill <PID>

# Or kill all processes on the port
lsof -ti:${port} | xargs kill -9
\`\`\`

**Alternative:** Set a different port using environment variable:
\`\`\`bash
export SERVER_DEFAULT_PORT=9081
aio app dev
\`\`\``
        }
      ]
    };
  }

  // Build the aio command with correct parameters
  const command = 'aio';
  const cmdArgs = ['app', 'dev'];
  
  // Add optional parameters based on actual aio app dev flags
  if (args.extension) {
    cmdArgs.push('-e', args.extension);
  }
  if (args.open) {
    cmdArgs.push('-o');
  }
  if (args.verbose) {
    cmdArgs.push('-v');
  }

  console.error(`Running: ${command} ${cmdArgs.join(' ')}`);
  
  // Start the process and capture output
  return new Promise((resolve) => {
    const process = spawn(command, cmdArgs, {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true
    });

    let stdout = '';
    let stderr = '';
    let isServerReady = false;

    process.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      
      // Check for success indicators
      if (output.includes('Building the app...') || 
          output.includes('Your actions:') ||
          output.includes('press CTRL+C to terminate the dev environment') ||
          output.includes('watching action files')) {
        isServerReady = true;
      }
      
      // If we see the success indicators, wait a bit then check if server is actually ready
      if (isServerReady && output.includes('press CTRL+C')) {
        setTimeout(async () => {
          const serverReady = await waitForServerReady(port);
          if (serverReady) {
            const endpoints = parseAioOutput(stdout);
            resolve(createSuccessResponse(port, process.pid, endpoints, stdout));
          } else {
            resolve({
              content: [
                {
                  type: 'text',
                  text: `⚠️ **Server Started But Not Ready**

The development server process has started but may not be fully ready yet.

📋 **Command**: ${command} ${cmdArgs.join(' ')}

📄 **Output**:
\`\`\`
${stdout}
\`\`\`

💡 **Try accessing**: https://localhost:${port}/api/v1/web/starter-kit/info

If the server doesn't respond, wait a moment and try again.`
                }
              ]
            });
          }
        }, 2000); // Wait 2 seconds for server to fully start
      }
    });

    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    process.on('close', (code) => {
      if (code !== 0 && !isServerReady) {
        // Handle errors
        const error = stderr || 'Unknown error occurred';
        const isPortInUse = error.includes('EADDRINUSE') || error.includes('address already in use');
        const isNotValidApp = error.includes('Not a valid application root folder') || error.includes('Couldn\'t find configuration');
        const isAuthError = error.includes('authentication') || error.includes('credentials') || error.includes('login');
        
        let errorMessage = `❌ **Failed to start Adobe I/O App development server!**

📋 **Command**: ${command} ${cmdArgs.join(' ')}

📄 **Error**:
\`\`\`
${error}
\`\`\`

📄 **Output**:
\`\`\`
${stdout}
\`\`\``;

        if (isPortInUse) {
          errorMessage += `\n\n💡 **Port Conflict**: Port ${port} is already in use. Try:\n\`\`\`bash\nlsof -ti:${port} | xargs kill -9\n\`\`\``;
        } else if (isNotValidApp) {
          errorMessage += `\n\n💡 **Invalid Project**: Please run this command from a folder generated by 'aio app init' or ensure you have at least one extension or standalone app configured.`;
        } else if (isAuthError) {
          errorMessage += `\n\n💡 **Authentication Required**: Try running the 'aio-login' tool before starting the development server.`;
        } else {
          errorMessage += `\n\n💡 **Troubleshooting**:\n- Make sure you're in a valid Adobe I/O App project\n- Check that all dependencies are installed\n- Verify your app.config.yaml is properly configured\n- Try running 'aio app use' to configure the runtime namespace`;
        }

        resolve({
          content: [
            {
              type: 'text',
              text: errorMessage
            }
          ]
        });
      }
    });

    process.on('error', (error) => {
      resolve({
        content: [
          {
            type: 'text',
            text: `❌ **Process Error**: ${error.message}

📋 **Command**: ${command} ${cmdArgs.join(' ')}

💡 **Suggestion**: Check if 'aio' command is available in your PATH.`
          }
        ]
      });
    });
  });
} 