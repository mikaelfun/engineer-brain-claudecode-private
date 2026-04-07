---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/How-To/How To: Workspace verification and Management using the omsadmin.sh commands"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FHow-To%2FHow%20To%3A%20Workspace%20verification%20and%20Management%20using%20the%20omsadmin.sh%20commands"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# How To: Workspace Verification and Management using omsadmin.sh

- OMS Agent for Linux: All versions

## Scenario
There are times where you will need to validate which workspace the OMS agent is connected to. This guide can be used to check the agent status, display the associated workspace, and manage workspace registration on On-Prem environments.

> **Note**: This is not a recommended procedure for Azure Resources as the Guest Agent will reconnect the local agent to the original workspace it was provisioned with.

## Script Capabilities
Depending on which parameter is used, you can view current registration/agent status, unregister from a workspace, or register to a workspace.

### 1. Verify Workspace registration and agent status
```bash
/opt/microsoft/omsagent/bin/omsadmin.sh -l
```

### 2. Unregister the agent from the current workspace
```bash
/opt/microsoft/omsagent/bin/omsadmin.sh -X
```

### 3. Register the agent to a workspace
```bash
/opt/microsoft/omsagent/bin/omsadmin.sh -w <workspace id> -s <shared key>
```

> **Note**: The agent service does not need to be restarted in order for the changes to take effect.

While it is not recommended to register an Azure resource agent to a new workspace, this action can also be used to **recreate the local agent endpoint certificates**.
