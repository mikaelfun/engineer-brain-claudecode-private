---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra Global Secure Access (ZTNA)/GSA for Copilot Studio Agents"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20Global%20Secure%20Access%20(ZTNA)%2FGSA%20for%20Copilot%20Studio%20Agents"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# GSA for Copilot Studio Agents

## Overview

Global Secure Access for agents provides network security controls for Microsoft Copilot Studio agents, enabling you to apply the same security policies to agents that you use for users.

With GSA for agents, you can regulate how agents use knowledge, tools, and actions to access external resources. You can apply network security policies including web content filtering, threat intelligence filtering, and network file filtering to agent traffic.

## How It Works

Agent traffic forwarding is enabled in the Power Platform Admin Center on a per-environment or per-environment-group basis. Supported traffic types:
- HTTP Node traffic
- Custom connectors
- MCP Server Connector

Once forwarded to GSA, security policies are evaluated against agent traffic similar to user traffic.

## Prerequisites

- [Global Secure Access Administrator](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/permissions-reference#global-secure-access-administrator) role in Microsoft Entra ID
- [Power Platform Administrator](https://learn.microsoft.com/en-us/power-platform/admin/use-service-admin-role-manage-tenant) role
- A Power Platform environment with Dataverse added

## Enable Network Controls

1. Sign in to [Power Platform Admin Center](https://admin.powerplatform.microsoft.com/) as Power Platform Admin.
2. Browse to **Security** > **Identity & access** > **Global Secure Access for Agents**.
3. Select the environment or environment group and select **Set up**.
4. Enable **Global Secure Access for Agents**.

**Note:** After enabling, create or update existing custom connectors for them to route through GSA.

## Create Security Policies

1. Sign in to [Microsoft Entra admin center](https://entra.microsoft.com/) as Global Secure Access Administrator.
2. Browse to **Global Secure Access** > **Secure** > **Web content filtering policies**.
3. Select **Create policy**, enter a name and description.
4. Select **Add rule** and configure rules specific to agent requirements.
5. Select **Next** > **Create policy**.

## Link Policies to Baseline Profile

**Important:** Only the baseline profile is supported for Copilot Studio agents. CA-linked security profiles are NOT supported.

1. Browse to **Global Secure Access** > **Secure** > **Security profiles**.
2. Select the **Baseline profile** tab.
3. Select **Edit** > **Link a policy** > **Existing policy**.
4. Select the policy and **Add** > **Save**.

## Known Limitations

- Only the baseline profile is supported for enforcement (per-tenant policies only).
- Integration with third-party DLP and ATP services (e.g., Netskope) is not supported.
- Copilot Studio Bing search network transactions are not supported.
- Only specific Copilot Studio connectors are supported.
- Agent Name in traffic logs shows the agent's unique *schema name* (not display name).
- Block experience shows *502 Bad Gateway* for HTTP Actions or *403 Forbidden* for connectors (known issue, improvements coming).

## Troubleshooting - Kusto Queries

### Verify Connectors Sending Traffic to GSA

```kusto
// Cluster: apim.kusto.windows.net / Database: APIMProd
CustomerProxyDiagnosticLogAllClusters
| where TIMESTAMP > ago(1h)
| where internalProperties contains "<environment-id>"
| extend props = todynamic(internalProperties)
| project PreciseTimeStamp, props.backendUrl
// Ensure returned URLs end in globalsecureaccess.microsoft.com
```

### Verify GSA Received Traffic / Check for Errors

```kusto
// Cluster: idsharedscus.southcentralus.kusto.windows.net / Database: NaasProd
TunnelServerDebug
| where PreciseTimeStamp > ago(1h)
| where TenantId == "<tenant-id>"
| where TunnelType == "AiAgentPlatform"
| project PreciseTimeStamp, NaasSDPRing, Tenant, TenantId, FlowCorrelationId, DestinationHost, error, Message, FirstPartyMeta
// NaasSDPRing & Tenant show which Ring/Edge. Check "error" column for MCS<>GSA protocol errors.
```

### Verify GSA Processed Request / Policy Applied

```kusto
// Cluster: idsharedscus.southcentralus.kusto.windows.net / Database: NaasProd
TalonOperationEvent
| where PreciseTimeStamp > ago(1h)
| where TenantId == "<tenant-id>"
| where TunnelType == "AiAgentPlatform"
| project PreciseTimeStamp, TenantId, FlowCorrelationId, DestinationFqdn, HttpUrl, ResponseCode, PolicyAction, PolicyId, Message
// Check PolicyAction, PolicyId, and backend ResponseCode.
```

## ICM Escalations

| Area | IcM Path |
|------|----------|
| Data Path | Global Secure Access / GSA Datapath |
| Control Plane | Global Secure Access / GSA Control Plane |

## Public Documentation

- [Configure Secure Web and AI Gateway for Copilot Studio agents](https://learn.microsoft.com/en-us/entra/global-secure-access/how-to-secure-web-ai-gateway-agents)
- [Learn about Secure Web and AI Gateway for Copilot Studio agents](https://learn.microsoft.com/en-us/entra/global-secure-access/concept-secure-web-ai-gateway-agents)
