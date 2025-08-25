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

export default async function handleCommerceEventSubscribe(args) {
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

  // Check if package.json exists and has the commerce-event-subscribe script
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const packageJsonPath = path.default.join(projectRoot, 'package.json');
    const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageJsonContent);
    
    if (!packageJson.scripts || !packageJson.scripts['commerce-event-subscribe']) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Error: No 'commerce-event-subscribe' script found in package.json

💡 **To add the commerce-event-subscribe script to your package.json:**
\`\`\`json
{
  "scripts": {
    "commerce-event-subscribe": "node --no-warnings -e 'require(\"./scripts/commerce-event-subscribe/index.js\").main()'"
  }
}
\`\`\`

This script typically:
1. Subscribes to Commerce events for product and customer changes
2. Sets up event listeners for catalog and customer operations
3. Configures Commerce OAuth1 authentication`
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
  const cmdArgs = ['run', 'commerce-event-subscribe'];
  
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
          text: `✅ **Commerce Event Subscription Completed Successfully!**

🎉 **What was configured:**
- Subscribed to Commerce events for product and customer changes
- Set up event listeners for catalog operations
- Configured Commerce OAuth1 authentication

📋 **Command:** ${command} ${cmdArgs.join(' ')}

📄 **Output:**
${result.output}

💡 **Next Steps:**
- Your app is now subscribed to Commerce events
- Events will be received when products or customers are modified
- You can test event handling using the 'aio-dev-invoke' tool
- Monitor event logs for incoming Commerce events`
        }
      ]
    };
  } else {
    // Check for common error patterns and provide helpful suggestions
    let errorMessage = `❌ **Commerce Event Subscription Failed!**

📋 **Command:** ${command} ${cmdArgs.join(' ')}

📄 **Error:**
${result.error}

📄 **Output:**
${result.output}`;

    // Add specific error handling for common issues
    if (result.error && result.error.includes('authentication') || result.error.includes('OAuth1')) {
      errorMessage += `\n\n💡 **Authentication Issue**: Commerce OAuth1 authentication failed.
      
🔧 **Common Solutions:**
1. **Check your .env file** - Make sure Commerce authentication credentials are set:
   - COMMERCE_BASE_URL
   - COMMERCE_CONSUMER_KEY
   - COMMERCE_CONSUMER_SECRET
   - COMMERCE_ACCESS_TOKEN
   - COMMERCE_ACCESS_TOKEN_SECRET

2. **Verify Commerce instance** - Ensure the Commerce instance is accessible and credentials are valid

3. **Check authentication method** - The script uses Commerce OAuth1 authentication`;
    } else if (result.error && result.error.includes('Invalid URL') || result.error.includes('ENOTFOUND')) {
      errorMessage += `\n\n💡 **URL Configuration Issue**: The Commerce base URL is invalid or unreachable.
      
🔧 **Common Solutions:**
1. **Check COMMERCE_BASE_URL** - Ensure it's a valid URL (e.g., https://your-instance.magentosite.cloud)
2. **Verify network connectivity** - Make sure the Commerce instance is accessible
3. **Check SSL certificates** - Ensure the Commerce instance has valid SSL certificates`;
    } else if (result.error && result.error.includes('certificate has expired')) {
      errorMessage += `\n\n💡 **SSL Certificate Issue**: The Commerce instance has an expired SSL certificate.
      
🔧 **Common Solutions:**
1. **Check Commerce instance** - Verify the Commerce instance is accessible and has valid SSL
2. **Contact Adobe Support** - If this is a production instance, contact Adobe Commerce support
3. **Use a different environment** - Try with a different Commerce instance if available`;
    } else if (result.error && result.error.includes('event') || result.error.includes('subscription')) {
      errorMessage += `\n\n💡 **Event Subscription Issue**: There's a problem with event subscription.
      
🔧 **Common Solutions:**
1. **Check app configuration** - Ensure your app is properly configured for Commerce events
2. **Verify event providers** - Make sure event providers are set up correctly
3. **Check permissions** - Ensure your Commerce credentials have proper permissions for event subscription`;
    } else if (result.error && result.error.includes('module') || result.error.includes('require')) {
      errorMessage += `\n\n💡 **Script Issue**: The commerce-event-subscribe script is missing or has issues.
      
🔧 **Common Solutions:**
1. **Check script location** - Ensure scripts/commerce-event-subscribe/index.js exists
2. **Install dependencies** - Run 'npm install' to install required dependencies
3. **Check script permissions** - Ensure the script file is executable`;
    } else {
      errorMessage += `\n\n💡 **General Troubleshooting**:
1. **Check your .env file** - Ensure all required Commerce environment variables are set
2. **Verify Commerce credentials** - Make sure Commerce OAuth1 credentials are correct
3. **Check Commerce instance** - Ensure the Commerce instance is accessible
4. **Verify script exists** - Check that scripts/commerce-event-subscribe/index.js exists
5. **Install dependencies** - Run 'npm install' if needed`;
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