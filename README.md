# Adobe I/O MCP Server

A Model Context Protocol (MCP) server that provides Adobe I/O CLI tools for deployment and management of Adobe Developer App Builder applications.

## 🚀 Quick Start

### 1. Install the MCP Server

```bash
# Clone the repository
git clone <repository-url>
cd adobe-io-mcp-server

# Install dependencies
npm install

# Install globally for Cursor integration
npm install -g .
```

### 2. Configure Cursor IDE

**Option A: One-Click Installation (Recommended)**
[![Install MCP Server](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/install-mcp?name=adobe-io-tools&config=JTdCJTIyY29tbWFuZCUyMiUzQSUyMmFkb2JlLWlvLXRvb2xzLW1jcC1zZXJ2ZXIlMjIlN0Q%3D)

**Option B: Manual Configuration**
Create or update your `.cursor/mcp.json` file:

```json
{
  "mcpServers": {
    "adobe-io-tools": {
      "command": "adobe-io-tools-mcp-server"
    }
  }
}
```

**Option C: Manual Configuration with Environment Variables**
If you need to configure environment variables (e.g., for the documentation search tool), create or update your `.cursor/mcp.json` file:

```json
{
  "mcpServers": {
    "adobe-io-tools": {
      "command": "adobe-io-tools-mcp-server",
      "env": {
        "CLOUDFLARE_WORKER_URL": "https://your-custom-worker.workers.dev"
      }
    }
  }
}
```

**Note**: The `CLOUDFLARE_WORKER_URL` environment variable is optional. If not set, the documentation search tool will use the default worker URL: `https://app-builder-commerce-docs-embed.apimesh-adobe-test.workers.dev`

### 3. Restart Cursor

After configuration, restart Cursor IDE to load the new MCP server.

### 4. Verify Installation

```bash
# Check if the command is available
which adobe-io-tools-mcp-server

# Test the server directly
adobe-io-tools-mcp-server
```

## Overview

This MCP server enables integration with Adobe I/O CLI tools through Cursor IDE, allowing you to:

- Deploy Adobe I/O applications to runtime
- Manage Adobe I/O configurations (org, project, workspace)
- Authenticate with Adobe I/O services
- Monitor and manage Adobe Commerce integrations

## Features

### Available Tools

- **aio-app-deploy**: Deploy Adobe I/O applications to runtime
- **aio-app-dev**: Start local development server for Adobe I/O applications
- **aio-dev-invoke**: Invoke runtime actions running locally via aio app dev
- **aio-login**: Authenticate with Adobe I/O services
- **aio-where**: Show current Adobe I/O configuration
- **aio-app-use**: Configure runtime namespace
- **aio-configure-global**: Manage global Adobe I/O configuration
- **onboard**: Configure Adobe I/O event providers and Commerce Events module
- **commerce-event-subscribe**: Subscribe to Commerce events for product and customer changes
- **search-commerce-app-builder-docs**: Search Commerce App Builder Extension documentation for coding guidance and implementation details

### Supported Actions

- List and select organizations, projects, and workspaces
- Deploy applications with various options (skip build, force deploy, etc.)
- Start local development servers for testing
- Invoke runtime actions running locally
- Handle authentication flows
- Manage Adobe Commerce event configurations
- Configure Adobe I/O event providers and Commerce Events module
- Create event registrations and metadata for Commerce integrations
- Search Commerce App Builder Extension documentation for coding guidance and implementation details

### Development Workflow

1. **Start Development Server**: Use `aio-app-dev` to start local development
2. **Test Actions**: Use `aio-dev-invoke` to call runtime actions locally
3. **Deploy**: Use `aio-app-deploy` to deploy to production
4. **Configure Events**: Use `onboard` to set up event providers and Commerce integration
5. **Monitor**: Use `aio-where` and other tools to manage configuration

## 📋 Detailed Installation

### Prerequisites

- Node.js 18.0.0 or higher
- Adobe I/O CLI (`aio`) installed globally
- Cursor IDE (for MCP integration)

### Environment Setup

1. Install Adobe I/O CLI:
```bash
npm install -g @adobe/aio-cli
```

## Testing and Debugging

### Using the MCP Inspector

The MCP Inspector is an interactive developer tool for testing and debugging MCP servers. You can use it to:

- Test all available tools with custom inputs
- Inspect tool schemas and descriptions
- Monitor server logs and notifications
- Debug connectivity issues

#### Quick Start

```bash
# Run the inspector with your server
npm test
```

#### Manual Inspector Usage

```bash
# Direct inspector command
npx @modelcontextprotocol/inspector node index.js

# With custom arguments
npx @modelcontextprotocol/inspector node index.js --verbose
```

#### Inspector Features

- **Tools Tab**: Test all Adobe I/O tools with custom parameters
- **Notifications Pane**: Monitor server logs and debug messages
- **Server Connection**: Verify basic connectivity and capability negotiation

#### Development Workflow

1. **Start Inspector**: `npm test`
2. **Test Tools**: Use the Tools tab to test each Adobe I/O tool
3. **Monitor Logs**: Watch the Notifications pane for server messages
4. **Iterate**: Make changes to your server and reconnect to test

For more information about the MCP Inspector, visit: [MCP Inspector Documentation](https://modelcontextprotocol.io/legacy/tools/inspector)

## Configuration

### Prerequisites

- Node.js 18.0.0 or higher
- Adobe I/O CLI (`aio`) installed globally
- Valid Adobe Developer Console project
- Cursor IDE (for MCP integration)

### Environment Setup

1. Install Adobe I/O CLI:
```bash
npm install -g @adobe/aio-cli
```

2. Configure your Adobe I/O project:
```bash
aio login
aio console ws select
```

## Usage

### With Cursor IDE

1. **Configure the MCP server** (see Quick Start section above)
2. **Restart Cursor** to load the new MCP server
3. **Access tools** through Cursor's MCP interface:
   - Use `/` to access MCP tools
   - Select "adobe-io-tools" from the available servers
   - Choose from available Adobe I/O tools

#### Quick Commands in Cursor

Once configured, you can use these tools directly in Cursor:

- **Deploy your app**: `/aio-app-deploy` - Deploy your Adobe I/O application
- **Start development**: `/aio-app-dev` - Start local development server
- **Authenticate**: `/aio-login` - Authenticate with Adobe I/O
- **Check config**: `/aio-where` - Check current configuration
- **Setup events**: `/onboard` - Configure event providers
- **Invoke actions**: `/aio-dev-invoke` - Test runtime actions locally
- **Search docs**: `/search-commerce-app-builder-docs` - Search Commerce App Builder documentation

### Command Line

For development and testing:
```bash
# Start the server directly
node index.js

# Or use npm
npm start

# Test with MCP Inspector
npm test
```

## 📚 Documentation Search Tool

The `search-commerce-app-builder-docs` tool provides intelligent search capabilities for Commerce App Builder Extension documentation, helping developers find relevant information for coding decisions and implementation details.

### Features

- **Semantic Search**: Uses advanced search algorithms to find the most relevant documentation
- **Rich Results**: Returns documentation with metadata, source URLs, and content previews
- **Configurable Results**: Control the number of results returned (default: 5, max: configurable)
- **Cloudflare Integration**: Uses Cloudflare Workers for fast, reliable document retrieval

### Usage Examples

#### Basic Search
```bash
# Search for general App Builder information
/search-commerce-app-builder-docs "What is App Builder?"
```

#### Specific Implementation Search
```bash
# Search for specific implementation details
/search-commerce-app-builder-docs "How to create custom actions in App Builder?"
```

#### Configuration Search
```bash
# Search for configuration and setup information
/search-commerce-app-builder-docs "How to configure authentication in App Builder?"
```

### Tool Parameters

- **query** (required): The search query for Commerce App Builder Extension documentation
- **maxResults** (optional): Maximum number of results to return (defaults to 5)

### Environment Configuration

The tool uses the following environment variables:

- `CLOUDFLARE_WORKER_URL`: URL of the Cloudflare Worker for document retrieval
  - Default: `https://app-builder-commerce-docs-embed.apimesh-adobe-test.workers.dev`

### Example Response

```json
{
  "success": true,
  "query": "What is App Builder?",
  "resultsCount": 3,
  "documents": [
    {
      "rank": 1,
      "source": "src/pages/intro_and_overview/faq.md",
      "content": "App Builder is a complete design, application, and runtime framework...",
      "contentPreview": "App Builder is a complete design, application, and runtime framework...",
      "metadata": {
        "repository": "https://github.com/AdobeDocs/app-builder",
        "source": "src/pages/intro_and_overview/faq.md"
      }
    }
  ],
  "timestamp": "2025-08-21T13:12:19.214Z"
}
```

### Use Cases

- **Development Guidance**: Find relevant documentation for coding decisions
- **Best Practices**: Search for implementation best practices and patterns
- **API Reference**: Look up specific API documentation and usage examples
- **Troubleshooting**: Find solutions for common issues and error messages
- **Architecture Decisions**: Research architectural patterns and design principles

## 🔧 Troubleshooting

### Installation Issues

#### MCP Server Not Found
```bash
# Check if the command is available
which adobe-io-tools-mcp-server

# If not found, reinstall globally
npm install -g .

# Verify the bin field in package.json
cat package.json | grep -A 5 '"bin"'
```

#### Permission Errors
```bash
# Make sure the index.js file has execute permissions
chmod +x index.js

# Check if npm global bin is in your PATH
npm config get prefix
echo $PATH
```

#### Cursor Not Recognizing Server
- Restart Cursor after configuration changes
- Check that `.cursor/mcp.json` is properly formatted
- Verify the command path in the configuration

### Common Issues

1. **Authentication Errors**: Ensure you're logged in with `aio login`
2. **Configuration Issues**: Use `aio where` to check current configuration
3. **Deployment Failures**: Verify your Adobe I/O project is properly configured
4. **Onboarding Issues**: Check environment variables and workspace.json for event configuration

### Cursor-Specific Issues

1. **MCP Server Not Found**: Ensure the server is installed globally or linked
2. **Command Not Found**: Check that the `bin` field is properly configured in package.json
3. **Permission Errors**: Make sure the index.js file has execute permissions
4. **Cursor Not Recognizing Server**: Restart Cursor after configuration changes

### Verifying Installation

To verify the MCP server is properly installed:
```bash
# Check if the command is available
which adobe-io-tools-mcp-server

# Test the server directly
adobe-io-tools-mcp-server
```

### Debug Mode

Enable verbose output for debugging:

```bash
# Set verbose flag when calling tools
# The server will show detailed command execution
```

## Development

### Project Structure

```
adobe-io-mcp-server/
├── index.js                    # Main entry point
├── package.json                # Dependencies and scripts
├── SDK_IMPROVEMENTS.md         # SDK optimization tracking
├── src/
│   ├── server.js               # MCP server implementation
│   ├── tools/                  # Tool implementations
│   │   ├── index.js            # Tool registry
│   │   ├── aio-app-deploy.js
│   │   ├── aio-app-dev.js
│   │   ├── aio-dev-invoke.js
│   │   ├── aio-login.js
│   │   ├── aio-where.js
│   │   ├── aio-app-use.js
│   │   ├── aio-configure-global.js
│   │   ├── onboard.js
│   │   ├── commerce-event-subscribe.js
│   │   └── search-commerce-app-builder-docs.js
│   ├── schemas/                # JSON schema definitions
│   │   ├── aio-app-deploy.json
│   │   ├── aio-app-dev.json
│   │   ├── aio-login.json
│   │   ├── aio-where.json
│   │   ├── aio-app-use.json
│   │   ├── aio-dev-invoke.json
│   │   ├── aio-configure-global.json
│   │   ├── onboard.json
│   │   ├── commerce-event-subscribe.json
│   │   └── search-commerce-app-builder-docs.json
│   └── utils/                  # Utility functions
│       ├── sdk-schema-manager.js  # SDK-aware schema management with Zod
│       ├── command-executor.js
│       └── project-validator.js
```

### Adding New Tools

1. Create a new tool file in `src/tools/`
2. Create a corresponding JSON schema file in `src/schemas/`
3. Export a default async function that handles the tool logic
4. Add the tool to the registry in `src/tools/index.js`

### Example Tool Implementation

```javascript
import { executeCommand } from '../utils/command-executor.js';

export default async function handleMyTool(args) {
  const { param1, param2 } = args;
  
  const command = 'my-command';
  const cmdArgs = [param1, param2];
  
  const result = await executeCommand(command, cmdArgs);
  
  if (result.success) {
    return {
      content: [
        {
          type: 'text',
          text: `✅ Success: ${result.output}`
        }
      ]
    };
  } else {
    return {
      content: [
        {
          type: 'text',
          text: `❌ Error: ${result.error}`
        }
      ]
    };
  }
}
```

### Example Schema Definition

```json
{
  "name": "my-tool",
  "description": "Description of what this tool does",
  "inputSchema": {
    "type": "object",
    "properties": {
      "param1": {
        "type": "string",
        "description": "Description of parameter 1"
      },
      "param2": {
        "type": "boolean",
        "description": "Description of parameter 2",
        "default": false
      }
    },
    "required": ["param1"]
  }
}
```

## Support

For issues related to:
- Adobe I/O CLI: [Adobe Developer Documentation](https://developer.adobe.com/app-builder/docs/)
- MCP Protocol: [Model Context Protocol](https://modelcontextprotocol.io/)
- Cursor IDE: [Cursor Documentation](https://cursor.sh/docs)

## Contributing

Contributions are welcomed! Read the [Contributing Guide](./.github/CONTRIBUTING.md) for more information.

## Licensing

This project is licensed under the Apache V2 License. See [LICENSE](LICENSE) for more information.
