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

export default async function handleAioConfigureGlobal(args) {
  const { action, org, project, workspace, verbose } = args;
  let command = 'aio';
  let cmdArgs = [];
  switch (action) {
    case 'list-orgs':
      cmdArgs = ['console', 'org', 'list'];
      break;
    case 'list-projects':
      cmdArgs = ['console', 'project', 'list'];
      break;
    case 'list-workspaces':
      cmdArgs = ['console', 'workspace', 'list'];
      break;
    case 'select-org':
      if (!org) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Error: Organization name is required for 'select-org' action. Please provide the 'org' parameter.`
            }
          ]
        };
      }
      cmdArgs = ['console', 'org', 'select', org];
      break;
    case 'select-project':
      if (!project) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Error: Project name is required for 'select-project' action. Please provide the 'project' parameter.`
            }
          ]
        };
      }
      cmdArgs = ['console', 'project', 'select', project];
      break;
    case 'select-workspace':
      if (!workspace) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Error: Workspace name is required for 'select-workspace' action. Please provide the 'workspace' parameter.`
            }
          ]
        };
      }
      cmdArgs = ['console', 'workspace', 'select', workspace];
      break;
    case 'show-current':
      cmdArgs = ['where'];
      break;
    default:
      return {
        content: [
          {
            type: 'text',
            text: `❌ Error: Unknown action '${action}'. Valid actions are: list-orgs, list-projects, list-workspaces, select-org, select-project, select-workspace, show-current`
          }
        ]
      };
  }
  // Only add verbose flag for commands that support it
  // aio where doesn't support --verbose flag
  if (verbose && action !== 'show-current') {
    cmdArgs.push('--verbose');
  }
  console.error(`Running: ${command} ${cmdArgs.join(' ')}`);
  const result = await executeCommand(command, cmdArgs);
  if (result.success) {
    let actionText = '';
    switch (action) {
      case 'list-orgs':
        actionText = '📋 **Available Organizations:**';
        break;
      case 'list-projects':
        actionText = '📋 **Available Projects:**';
        break;
      case 'list-workspaces':
        actionText = '📋 **Available Workspaces:**';
        break;
      case 'select-org':
        actionText = `✅ **Organization Selected:** ${org}`;
        break;
      case 'select-project':
        actionText = `✅ **Project Selected:** ${project}`;
        break;
      case 'select-workspace':
        actionText = `✅ **Workspace Selected:** ${workspace}`;
        break;
      case 'show-current':
        actionText = '📋 **Current Configuration:**';
        break;
    }
    return {
      content: [
        {
          type: 'text',
          text: `${actionText}\n\n📋 Command: ${command} ${cmdArgs.join(' ')}\n\n📄 Output:\n${result.output}`
        }
      ]
    };
  } else {
    return {
      content: [
        {
          type: 'text',
          text: `❌ **Configuration Change Failed!**\n\n📋 Command: ${command} ${cmdArgs.join(' ')}\n\n📄 Error:\n${result.error}\n\n📄 Output:\n${result.output}\n\n💡 **Suggestions:**\n- Make sure you're logged in with 'aio-login'\n- Check your current configuration with 'aio-where'`
        }
      ]
    };
  }
} 