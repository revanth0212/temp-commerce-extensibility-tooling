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

export default async function handleAioAppUse(args) {
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
  const command = 'aio';
  const cmdArgs = ['app', 'use', '--global', '--no-input'];
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
          text: `✅ **Runtime Namespace Configured Successfully!**\n\n📋 Command: ${command} ${cmdArgs.join(' ')}\n\n📄 Output:\n${result.output}\n\n🎉 **Next Steps:** You can now try deploying your application using the 'aio-app-deploy' tool.`
        }
      ]
    };
  } else {
    return {
      content: [
        {
          type: 'text',
          text: `❌ **Runtime Namespace Configuration Failed!**\n\n📋 Command: ${command} ${cmdArgs.join(' ')}\n\n📄 Error:\n${result.error}\n\n📄 Output:\n${result.output}\n\n💡 **Suggestions:**\n- Make sure you're logged in with 'aio-login'\n- Check your current configuration with 'aio-where'\n- Try selecting a workspace with 'aio-console-ws-select'`
        }
      ]
    };
  }
} 