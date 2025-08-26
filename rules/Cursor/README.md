# Adobe Commerce Extension Development - Cursor Rules

A comprehensive set of Cursor IDE rules for Adobe Commerce extension development using Adobe Developer App Builder. These rules transform the AI assistant into an expert Adobe Commerce Solutions Architect specialized in modern, out-of-process extensibility.

## Overview

This rule system provides structured guidance for generating well-architected, secure, performant, and maintainable Adobe Commerce extensions using Adobe Developer App Builder framework. The rules are designed to ensure compatibility with both Adobe Commerce PaaS and SaaS offerings while following industry best practices.

## Rule Architecture

The rules are organized in a modular architecture for better maintainability and focused expertise:

### Main Orchestrator
- **`main-orchestrator.mdc`** - Central coordination rule that references all specialized modules

### Core Foundation Rules (Always Active)

1. **`adobe-commerce-basics.mdc`** - Agent persona and platform knowledge
2. **`dos-and-donts.mdc`** - Rules and decision frameworks
3. **`development-workflow.mdc`** - Development workflow and processes
4. **`commerce-scope-guardrails.mdc`** - Usage boundaries and professional guidelines

### Specialized Guides (Apply When Relevant)

5. **`app-builder-technical-guide.mdc`** - Technical foundation and architecture
6. **`security-and-coding-standards.mdc`** - Security and quality requirements
7. **`events-and-webhooks-guide.mdc`** - Event-driven integration patterns
8. **`deployment-and-cleanup.mdc`** - Production readiness and optimization
9. **`requirements-documentation.mdc`** - Requirements documentation protocol
10. **`developer-tools-integration.mdc`** - MCP tools integration guidance

## Key Features

### 🎯 **Expert Persona**
- Transforms AI into an Adobe Commerce Solutions Architect
- Deep understanding of PaaS vs SaaS architectural differences
- Specialized in out-of-process extensibility patterns

### 🏗️ **Structured Development Process**
- **Phase 1:** Requirements analysis and clarification
- **Phase 2:** Architectural planning
- **Phase 3:** Code generation and implementation
- **Phase 4:** Documentation and validation

### 📋 **Requirements Management**
- Automatic `REQUIREMENTS.md` file creation and management
- Single source of truth for all extension requirements
- Traceability from requirements to implementation

### 🔒 **Security by Design**
- Comprehensive security principles and best practices
- Secure secrets management using App Builder default parameters
- Authentication and authorization guidance

### ⚡ **Performance & Scalability**
- Event-driven, asynchronous patterns
- State management optimization
- API orchestration with API Mesh

### 🛠️ **MCP Tools Integration**
- Seamless integration with Adobe I/O MCP Server tools
- Authentication, deployment, and testing workflow automation
- Commerce-specific integration tools
- Latest documentation search for up-to-date technical guidance

## Rule Details

### Adobe Commerce Basics
**File:** `adobe-commerce-basics.mdc`

Establishes the agent's expert persona and foundational knowledge including:
- Adobe Commerce ecosystem understanding
- PaaS vs SaaS critical differences
- Out-of-process extensibility paradigm
- Platform nature and customization capabilities

### Dos and Don'ts
**File:** `dos-and-donts.mdc`

Provides guardrails and decision-making guidance:
- Hard constraints (no core modifications, App Builder only)
- PaaS vs SaaS decision matrix
- Use case scenario templates
- Advanced customization guidance

### Development Workflow
**File:** `development-workflow.mdc`

Defines development methodology including:
- Integration Starter Kit structure and usage
- Four-phase operational protocol
- Critical clarifying questions
- Code generation workflow

### App Builder Technical Guide
**File:** `app-builder-technical-guide.mdc`

Covers technical foundation including:
- JAMStack architecture and application types
- Core components (I/O Runtime, Events, API Mesh)
- Security architecture and tenant isolation
- State management and project configuration
- Essential CLI commands

### Security and Coding Standards
**File:** `security-and-coding-standards.mdc`

Establishes non-negotiable requirements for:
- Security by design principles
- Performance and scalability patterns
- Code quality and maintainability standards
- Testing strategy (conditional based on user preference)

### Events and Webhooks Guide
**File:** `events-and-webhooks-guide.mdc`

Comprehensive event-driven integration guidance:
- Commerce event registration and subscription workflow
- Event handler implementation patterns
- Webhook security and validation
- Event testing and debugging strategies

### Deployment and Cleanup
**File:** `deployment-and-cleanup.mdc`

Production readiness and optimization guidance:
- Pre-deployment cleanup protocols
- Code optimization and security hardening
- Performance tuning and best practices
- Deployment readiness verification

### Requirements Documentation
**File:** `requirements-documentation.mdc`

Establishes requirements documentation protocol:
- REQUIREMENTS.md as single source of truth
- Standardized requirements structure and format
- Requirements gathering, updating, and validation processes
- Integration with all development phases

### Developer Tools Integration
**File:** `developer-tools-integration.mdc`

Provides comprehensive MCP tools integration guidance:
- Adobe I/O MCP Server tools and capabilities
- Development workflow integration patterns
- Authentication, deployment, and testing tools
- Commerce-specific integration tools and best practices
- Documentation search tools for latest technical guidance

### Scope Guardrails
**File:** `commerce-scope-guardrails.mdc`

Usage boundaries and professional guidelines:
- Authorized usage scope for Adobe Commerce development
- Professional response protocols for out-of-scope requests
- Context validation and scope enforcement

## Installation

1. Clone or download the rules to your project's `.cursor/rules/` directory
2. Ensure all `.mdc` files are present in the directory
3. The rules will automatically be applied when working with Adobe Commerce extensions

## Usage

### Getting Started

When you request Adobe Commerce extension development, the AI will:

1. **Check for REQUIREMENTS.md** - Look for existing requirements or create one
2. **Gather requirements** - Ask clarifying questions about your specific needs
3. **Present architectural plan** - Show the proposed solution structure
4. **Generate code** - Create App Builder-based extension code
5. **Provide documentation** - Include diagrams and implementation guides

### Example Request

```
"I need to create an extension that syncs new customers from my Adobe Commerce store to our CRM when they register."
```

The AI will guide you through:
- Target environment selection (PaaS/SaaS/Both)
- Event triggering mechanism confirmation
- External API integration details
- Application type selection (headless vs SPA)
- State management requirements
- Testing preferences

### Supported Patterns

- **Customer Data Synchronization** - Sync customer data to external CRMs
- **Order Processing Workflows** - Handle order events and notifications
- **Product Catalog Integration** - Sync product data with external systems
- **Inventory Management** - Stock level synchronization
- **Shipping Notifications** - Logistics system integrations

## Best Practices

### ✅ Do's
- Always use the Integration Starter Kit structure
- Store secrets in App Builder default parameters
- Implement proper input validation
- Use IMS authentication for SaaS compatibility
- Follow the four-phase development process
- Document requirements in REQUIREMENTS.md

### ❌ Don'ts
- Never modify Adobe Commerce core files
- Don't store secrets in .env files for production
- Avoid in-process PHP extensions for SaaS
- Don't skip the requirements clarification phase
- Never assume missing information

## Advanced Configuration

### Customizing for Your Team

The rules can be adapted for specific needs:

1. **Security Requirements** - Add team-specific security measures
2. **Coding Standards** - Enforce specific naming conventions
3. **Application Types** - Focus on SPA vs headless patterns
4. **Logging Libraries** - Mandate specific logging tools

### Environment-Specific Adaptations

- **PaaS-focused teams** - Emphasize composer and git-based workflows
- **SaaS-focused teams** - Emphasize API-only integration patterns
- **Security-sensitive environments** - Add compliance requirements

## Decision Matrix: PaaS vs SaaS

| Feature | PaaS | SaaS | Agent Behavior |
|---------|------|------|----------------|
| **Extensibility** | In-process & Out-of-process | Out-of-process only | Default to out-of-process |
| **Authentication** | IMS optional | IMS mandatory | Use IMS for future-proofing |
| **API Endpoints** | Separate Core/Catalog | Unified endpoint | Conditional URL selection |
| **Events** | XML or REST | Admin UI or REST | Query for event names |

## MCP Tools Integration

When available, the rules integrate with Adobe I/O MCP Server tools:

### Core Development
- `aio-app-deploy` - Deploy applications
- `aio-app-dev` - Local development server
- `aio-dev-invoke` - Test actions locally

### Authentication & Configuration
- `aio-login` - Authenticate with Adobe I/O
- `aio-where` - Show current configuration
- `aio-configure-global` - Manage global settings

### Commerce Integration
- `aio-onboard` - Configure event providers
- `aio-commerce-event-subscribe` - Subscribe to events

### Documentation & Research
- `search-commerce-app-builder-docs` - Search latest Adobe Commerce App Builder documentation

## Support & Documentation

### Adobe Resources
- [Adobe Developer App Builder Documentation](https://developer.adobe.com/app-builder/)
- [Adobe Commerce Integration Starter Kit](https://github.com/adobe/commerce-integration-starter-kit)
- [Adobe I/O Events](https://developer.adobe.com/events/)

### Generated Documentation
Each extension includes:
- Architecture diagrams (Mermaid)
- API integration details
- Local development setup
- Testing procedures
- Troubleshooting guides

## Contributing

To improve or extend these rules:

1. Follow the modular architecture pattern
2. Update cross-rule dependencies as needed
3. Maintain consistency with Adobe best practices
4. Test with real-world extension scenarios
5. Update documentation and examples

## License

These rules are designed for Adobe Commerce extension development and follow Adobe's recommended practices and architectural patterns.

---

**Version:** 2.0.0  
**Last Updated:** December 2024  
**Compatibility:** Adobe Commerce PaaS & SaaS, App Builder Framework