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
import path from 'path';
import fs from 'fs/promises';

export default async function handleAioAppDeploy(args) {
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

  // First, check current configuration and ask for confirmation
  // For modularity, we will call the where tool handler directly (import inline)
  const { default: handleAioWhere } = await import('./aio-where.js');
  const whereResult = await handleAioWhere({ verbose: args.verbose });
  if (whereResult.content[0].text.includes('❌ Failed to get Adobe I/O configuration')) {
    return whereResult;
  }
  const configMessage = whereResult.content[0].text.replace('⚠️ **Please confirm:** Do you want to deploy to this org/project/workspace?', '');

  // Build the aio command
  const command = 'aio';
  const cmdArgs = ['app', 'deploy'];
  if (args.action) {
    cmdArgs.push('-a', args.action);
  }
  if (args.skipBuild) {
    cmdArgs.push('--no-build');
  } else if (args.forceBuild) {
    cmdArgs.push('--force-build');
  }
  if (args.skipStatic) {
    cmdArgs.push('--no-web-assets');
  }
  if (args.skipActions) {
    cmdArgs.push('--no-actions');
  } else if (args.forceDeploy) {
    cmdArgs.push('--force-deploy');
  }
  if (args.verbose) {
    cmdArgs.push('--verbose');
  }

  console.error(`Running: ${command} ${cmdArgs.join(' ')}`);
  const result = await executeCommand(command, cmdArgs);

  // Check if the deployment actually deployed anything
  const noActionsBuilt = result.output.includes('No actions built for');
  const noActionsDeployed = result.output.includes('No actions deployed for');
  const hasDeployedActions = result.output.includes('Your deployed actions:');
  const successfulDeployment = result.output.includes('Successful deployment');

  if (result.success && (hasDeployedActions || successfulDeployment) && !noActionsBuilt && !noActionsDeployed) {
    return {
      content: [
        {
          type: 'text',
          text: `✅ Adobe I/O App deployment completed successfully!\n\n${configMessage}\n\n📋 Command: ${command} ${cmdArgs.join(' ')}\n\n📄 Output:\n${result.output}`
        }
      ]
    };
  } else if (result.success && (!hasDeployedActions && !successfulDeployment)) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ **No actions were deployed!**\n\n${configMessage}\n\n📋 Command: ${command} ${cmdArgs.join(' ')}\n\n📄 Output:\n${result.output}\n\n💡 **Possible reasons:**\n- The specified action name doesn't exist in this project\n- Check the action name in app.config.yaml\n- Try deploying without specifying an action to deploy all actions\n- Common action names: starter-kit/info, product-commerce/created, etc.`
        }
      ]
    };
  } else {
    // Check if the error is due to missing Adobe I/O Runtime namespace
    const isNamespaceError = result.error && result.error.includes('missing Adobe I/O Runtime namespace');
    const isAuthError = result.error && (
      result.error.includes('AIO_RUNTIME_NAMESPACE') ||
      result.error.includes('authentication') ||
      result.error.includes('credentials')
    );
    let errorMessage = `❌ Adobe I/O App deployment failed!\n\n${configMessage}\n\n📋 Command: ${command} ${cmdArgs.join(' ')}\n\n📄 Error:\n${result.error}\n\n📄 Output:\n${result.output}`;
    if (isNamespaceError || isAuthError) {
      errorMessage += `\n\n💡 **Suggestion**: This error typically means you need to configure the runtime namespace. Try running the 'aio-app-use' tool first to set up the runtime namespace for this project.`;
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