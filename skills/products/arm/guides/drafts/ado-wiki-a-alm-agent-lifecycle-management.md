---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Readiness/Infrastructure/Agent Lifecycle Management Agent"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Disconnected%20Operations%2FReadiness%2FInfrastructure%2FAgent%20Lifecycle%20Management%20Agent"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# ALM - Agent Lifecycle Management Agent

## Overview

Agent Lifecycle Manager (ALM) is responsible for deploying and updating other agents on role VMs and host nodes in Azure Local / HCI environments.

## High Level Architecture

- ALM reads its configuration file on startup, specializes based on external config
- Reads role-specific configuration containing the list of Agents (Nuget names) to install
- Monitors the Nuget store for latest versions, unpacks each nuget locally
- Installs agents following information in `AgentManifest.yml`
- Ensures idempotency and atomicity of agent updates

## ALM on HCI & Azure Local

ALM manages the lifecycle of many services on Azure Local. It is deployed on each of the 4 bare metal nodes and is only aware of its own node.

### Deployment Flow

1. ALM is unpacked through an action plan, manually started on each node
2. ECE places a **trigger file** listing agent types to deploy (deployed in categories)
3. **First category: bootstrap** — system agents (FCA, FWA, TCA)
4. ALM picks up trigger file, checks against agent list, downloads nugets from store
5. Nugets unpacked in `C:\Agents`
6. ALM sets up required resources and installs agents
7. ALM produces either:
   - **Success Indication file** (all good), OR
   - **Results file** (listing errors)
   - Location: `C:\Agents\Orchestration\AgentLifecycleManagement\SuccessIndication*\`
8. ECE waits for results (25 minute timeout), reads error messages if no success indication
9. Deployment continues
10. ECE places new trigger for **ECE Agent** → deployed
11. ECE places new trigger for **all agents** → remaining agents updated

### Troubleshooting ALM

- **Check trigger files**: Verify ECE has placed the correct trigger file
- **Check agent list**: Ensure the agent list in ALM's nuget matches expected agents
- **Check nuget store**: Verify nugets are available and accessible
- **Check results files**: Look at `C:\Agents\Orchestration\AgentLifecycleManagement\` for success/error files
- **25-minute timeout**: ECE times out after 25 minutes waiting for ALM results

### Key References

- [ALM Agent Lifecycle Management Overview](https://dev.azure.com/azssaturn/Documentation/_wiki/wikis/Documentation.wiki/542/ALM-Agent-Lifecycle-Management-Agent)
- [ALM on HCI & Azure Local](https://dev.azure.com/azssaturn/Documentation/_wiki/wikis/Documentation.wiki/1606/ALM-on-HCI-Azure-Local)
- [How to trigger ALM to update agents](https://dev.azure.com/azssaturn/Documentation/_wiki/wikis/Documentation.wiki/1610/How-to-get-ALM-to-install-agents-manually)
- [Agent Specialization](https://dev.azure.com/azssaturn/Documentation/_wiki/wikis/Documentation.wiki?pagePath=/Products/Agents/ALM/Role-based%20Agent%20Specialization)
- [ALM Configuration & Agent Lists](https://dev.azure.com/azssaturn/Documentation/_wiki/wikis/Documentation.wiki?pagePath=/Products/Agents/ALM/ALM%20Configuration%20%26%20Agent%20Lists)
- [Agent Manifest Reference](https://dev.azure.com/azssaturn/Documentation/_wiki/wikis/Documentation.wiki?pagePath=/Products/Agents/ALM/Agent%20Manifest%20Reference)
- [Idempotent Agent Update](https://dev.azure.com/azssaturn/Documentation/_wiki/wikis/Documentation.wiki?pagePath=/Products/Agents/ALM/Idempotent%20Agent%20Update)
