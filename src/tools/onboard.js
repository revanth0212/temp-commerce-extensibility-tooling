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

export default async function handleOnboard(args) {
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

  // Check if package.json exists and has the onboard script
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const packageJsonPath = path.default.join(projectRoot, 'package.json');
    const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageJsonContent);
    
    if (!packageJson.scripts || !packageJson.scripts.onboard) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Error: No 'onboard' script found in package.json

💡 **To add the onboard script to your package.json:**
\`\`\`json
{
  "scripts": {
    "onboard": "aio app use && aio app configure events"
  }
}
\`\`\`

This script typically:
1. Configures the runtime namespace for the app
2. Sets up Adobe I/O event providers
3. Configures the Adobe I/O Events for Commerce module`
          }
        ]
      };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ Error: Could not read package.json: ${error.message}`
        }
      ]
    };
  }

  // Build the npm command
  const command = 'npm';
  const cmdArgs = ['run', 'onboard'];
  
  if (args.verbose) {
    cmdArgs.push('--verbose');
  }

  console.error(`Running: ${command} ${cmdArgs.join(' ')}`);
  const result = await executeCommand(command, cmdArgs);

  if (result.success) {
    return {
      content: [
        {
          type: 'text',
          text: `✅ **Adobe I/O App Onboarding Completed Successfully!**

🎉 **What was configured:**
- Adobe I/O event providers for the application
- Adobe I/O Events for Commerce module
- Runtime namespace configuration

📋 **Command:** ${command} ${cmdArgs.join(' ')}

📄 **Output:**
${result.output}

💡 **Next Steps:**
- Your app is now configured for Adobe I/O Events
- You can now deploy your app using the 'aio-app-deploy' tool
- Test your event handlers using the 'aio-dev-invoke' tool`
        }
      ]
    };
  } else {
    // Check for common error patterns and provide helpful suggestions
    let errorMessage = `❌ **Adobe I/O App Onboarding Failed!**

📋 **Command:** ${command} ${cmdArgs.join(' ')}

📄 **Error:**
${result.error}

📄 **Output:**
${result.output}`;

    // Add specific error handling for common issues based on the examples
    if (result.error && result.error.includes('CANNOT_GENERATE_TOKEN')) {
      errorMessage += `\n\n💡 **Authentication Issue**: The onboarding script cannot generate authentication tokens.
      
🔧 **Common Solutions:**
1. **Check your .env file** - Make sure all required environment variables are set:
   - IO_CONSUMER_ID
   - IO_PROJECT_ID  
   - IO_WORKSPACE_ID
   - COMMERCE_BASE_URL
   - And other authentication credentials

2. **Verify workspace.json** - Ensure your onboarding/config/workspace.json file is up to date

3. **Login to Adobe I/O** - Try running the 'aio-login' tool first

4. **Check authentication method** - The script supports JWT, OAuth2, and CLI authentication methods`;
    } else if (result.error && result.error.includes('invalid json response body') || result.error.includes('Unexpected token')) {
      errorMessage += `\n\n💡 **API Configuration Issue**: The Adobe I/O Events API is returning HTML instead of JSON.
      
🔧 **Common Solutions:**
1. **Check environment variables** - Verify IO_CONSUMER_ID, IO_PROJECT_ID, and IO_WORKSPACE_ID in your .env file
2. **Update workspace.json** - Ensure onboarding/config/workspace.json has the correct values
3. **Verify authentication** - Make sure your Adobe I/O credentials are correct
4. **Check COMMERCE_BASE_URL** - Ensure the Commerce instance URL is correct`;
    } else if (result.error && result.error.includes('Invalid URL')) {
      errorMessage += `\n\n💡 **URL Configuration Issue**: The Commerce base URL is malformed or missing.
      
🔧 **Common Solutions:**
1. **Check COMMERCE_BASE_URL** - Ensure it's a valid URL (e.g., https://your-instance.magentosite.cloud)
2. **Update workspace.json** - Verify the URL in onboarding/config/workspace.json
3. **Check .env file** - Make sure COMMERCE_BASE_URL is properly set`;
    } else if (result.error && result.error.includes('certificate has expired')) {
      errorMessage += `\n\n💡 **SSL Certificate Issue**: The Commerce instance has an expired SSL certificate.
      
🔧 **Common Solutions:**
1. **Check Commerce instance** - Verify the Commerce instance is accessible and has valid SSL
2. **Contact Adobe Support** - If this is a production instance, contact Adobe Commerce support
3. **Use a different environment** - Try with a different Commerce instance if available`;
    } else if (result.error && result.error.includes('AIO_RUNTIME_NAMESPACE')) {
      errorMessage += `\n\n💡 **Runtime Namespace Issue**: The runtime namespace is not configured.
      
🔧 **Solution**: Run the 'aio-app-use' tool to configure the runtime namespace for this project.`;
    } else if (result.error && result.error.includes('authentication') || result.error.includes('login')) {
      errorMessage += `\n\n💡 **Authentication Issue**: You need to authenticate with Adobe I/O.
      
🔧 **Solution**: Run the 'aio-login' tool to authenticate with Adobe I/O.`;
    } else if (result.error && result.error.includes('org') || result.error.includes('project') || result.error.includes('workspace')) {
      errorMessage += `\n\n💡 **Configuration Issue**: Adobe I/O org/project/workspace is not configured.
      
🔧 **Solution**: Run the 'aio-configure-global' tool to configure your Adobe I/O settings.`;
    } else if (result.error && result.error.includes('events') || result.error.includes('event')) {
      errorMessage += `\n\n💡 **Event Configuration Issue**: There's a problem with event provider configuration.
      
🔧 **Common Solutions:**
1. **Check app.config.yaml** - Ensure proper event configurations
2. **Deploy your app first** - Run 'aio app deploy' before onboarding
3. **Verify workspace.json** - Check onboarding/config/workspace.json configuration`;
    } else {
      errorMessage += `\n\n💡 **General Troubleshooting**:
1. **Check your .env file** - Ensure all required environment variables are set
2. **Verify workspace.json** - Check onboarding/config/workspace.json configuration  
3. **Deploy your app first** - Run 'aio app deploy' before onboarding
4. **Check authentication** - Run 'aio-login' if needed
5. **Configure runtime** - Run 'aio-app-use' to set up runtime namespace`;
    }

    return {
      content: [
        {
          type: 'text',
          text: errorMessage
        }
      ]
    };
  }
} 