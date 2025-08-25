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

export default async function handleAioWhere(args) {
  const { verbose } = args;
  const command = 'aio';
  const cmdArgs = ['where'];
  // Note: aio where doesn't support verbose flag, so we ignore it
  console.error(`Running: ${command} ${cmdArgs.join(' ')}`);
  const result = await executeCommand(command, cmdArgs);
  if (result.success) {
    return {
      content: [
        {
          type: 'text',
          text: `📍 **Current Adobe I/O Configuration:**\n\n📋 Command: ${command} ${cmdArgs.join(' ')}\n\n📄 Output:\n${result.output}\n\n⚠️ **Please confirm:** Do you want to deploy to this org/project/workspace?`
        }
      ]
    };
  } else {
    return {
      content: [
        {
          type: 'text',
          text: `❌ Failed to get Adobe I/O configuration!\n\n📋 Command: ${command} ${cmdArgs.join(' ')}\n\n📄 Error:\n${result.error}\n\n📄 Output:\n${result.output}\n\n💡 **Suggestion**: You may need to run 'aio console ws select' to configure your workspace first.`
        }
      ]
    };
  }
} 