---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Defender for AI/[TSG] - SCC AI inventory (UI)"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FDefender%20for%20AI%2F%5BTSG%5D%20-%20SCC%20AI%20inventory%20%28UI%29"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# [TSG] SCC AI Inventory (UI)

## Data Flow

**Copilot Studio Data Flow:**
Copilot Studio data provider → EKG (cloud map) + Advanced Hunting `AIAgentsInfo` table → DataStore → AI Agents Inventory UI

**Cloud Resource Agents Data Flow (Azure Foundry, AWS Bedrock, GCP Vertex):**
Cloud Assets Inventory pipeline → EKG → DataStore → AI Agents Inventory UI

> Note: EKG MAP is not used directly — it's first copied to DataStore, then collected for AI inventory view.

## EKG Relevant Labels

| Resource Type | Node Label |
|---------------|-----------|
| AI Foundry agent | azure-microsoft.cognitiveservices/accounts/project_agent |
| AWS Bedrock agent | bedrock.agent |
| GCP agent | gcp-discoveryengine.engine |

---

## TSG: Agent with Wrong or Missing Data

IcM Queue: **Microsoft Defender for Cloud / Defender4AI Posture Team**
IcM Template: https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=j19221

### Cloud Resource Agents

1. Go to the agent's resource page → take screenshot.
2. Click **Go hunt** button → advanced hunting opens with:
   ```kusto
   search in (ExposureGraphNodes)
   NodeId == "<nodeID>"
   ```
3. Note the map node ID. Check if query yielded results. Screenshot the Properties field.
4. Have customer run:
   ```kusto
   let nodeId = "<nodeID>";
   ExposureGraphEdges
   | where TargetNodeId == nodeId or SourceNodeId == nodeId
   | project SourceNodeId, SourceNodeLabel, EdgeLabel, TargetNodeId, TargetNodeLabel
   ```
5. Provide to IcM: TenantID, Id, Name, Platform + screenshots of all steps.

### Copilot Studio

1. Go to agent's resource page → take screenshot.
2. Click **Go hunt** button:
   ```kusto
   AIAgentsInfo
   | where AIAgentId == "<agentID>"
   | summarize arg_max(Timestamp, *) by AIAgentId
   ```
3. Note the agent ID from the query.
4. Run detailed query:
   ```kusto
   AIAgentsInfo
   | where AIAgentId == "<agentId>"
   | summarize arg_max(Timestamp, *) by AIAgentId
   | project
       agentId = AIAgentId,
       agentName = AIAgentName,
       agentCreationTime = AgentCreationTime,
       agentCreatedBy = CreatorAccountUpn,
       platform = "copilotStudio",
       status = AgentStatus,
       environmentId = EnvironmentId,
       authenticationType = UserAuthenticationType,
       accessControlPolicy = case(
           tolower(AccessControlPolicy) == "copilot readers", "CopilotReaders",
           tolower(AccessControlPolicy) == "group membership", "GroupMembership",
           tolower(AccessControlPolicy) == "any multi tenant", "AnyMultiTenant",
           tolower(AccessControlPolicy) == "not applicable", "NotApplicable",
           AccessControlPolicy
       ),
       authorizedSecurityGroupIds = AuthorizedSecurityGroupIds,
       owner = OwnerAccountUpns
   ```
5. Compare `AIAgentsInfo`, `ExposureGraphNodes`, `ExposureGraphEdges` with UI data:
   - Different → data propagation can take up to **24 hours**. If older than 24h → IcM to **Defender4AI Posture Team**
   - Same in all tables → problem originates in provider → IcM to MDA/Copilot team

---

## TSG: Missing Agent

### Copilot Studio

```kusto
-- Check AIAgentsInfo
AIAgentsInfo
| where AIAgentId == "<agentId>"
```

```kusto
-- Check EKG
ExposureGraphNodes
| where NodeLabel == "copilot-studio-ai-agent"
| where NodeProperties.aiAgentMetadata.id == "<agent ID>"
```

Provide to IcM: TenantID, Agent Name, Agent ID, Environment ID

### Cloud Resource Agents

```kusto
-- Search by Agent ID
ExposureGraphNodes
| where NodeLabel == "<agent's label>"
| where NodeProperties.aiAgentMetadata.id == "<agent ID>"
```

---

## TSG: Page Fails to Load

API routes to check (path: `views/inventory/ai-agents`):

| Route | Functionality |
|-------|---------------|
| /agents-discovered-overtime-v2-metrics | Discovery metrics |
| /agents-count-by-platform-metrics | Count agents metrics |
| /agents-requiring-attention-overtime-metrics | Agents requiring attention metrics |
| /items | Fetch items list for grid |
| /item | Fetch specific agent details |
| /schema | Fetch grid metadata (columns and filters) |

**Collect for IcM:** TenantID, Environment, failing API command, Status code, Payload sent, UI screenshots, full error including inner errors and correlation ID.

**IcM Queue:** Microsoft Defender for Cloud / Defender4AI Posture Team

---

## TSG: Onboarded but No Agents Showing After 24 Hours

### Copilot Studio

1. Verify onboarding: In MDC portal → **Secure AI Agents** → confirm **Copilot Studio AI Agents** is enabled and **AI Agents inventory** is connected.
2. Follow [Missing Agent TSG](#tsg-missing-agent) to trace data flow.

### Cloud Resource Agents

1. Verify CSPM is enabled on agent's subscription: MDC → **Environment settings**.
2. Follow [Missing Agent TSG](#tsg-missing-agent).
