# Entra ID Global Secure Access (GSA) — 排查工作流

**来源草稿**: ado-wiki-a-gsa-advanced-threat-protection.md, ado-wiki-a-gsa-auth-troubleshooting-guide.md, ado-wiki-a-gsa-byod.md, ado-wiki-a-gsa-copilot-studio-agents.md, ado-wiki-a-gsa-custom-block-pages.md, ado-wiki-a-gsa-datapipeline-trafficlogconnections.md, ado-wiki-a-gsa-dlp-atp.md, ado-wiki-a-gsa-m365-signaling-changes.md, ado-wiki-a-gsa-mac-client.md, ado-wiki-a-gsa-prompt-shield-gateway.md... (+20 more)
**场景数**: 25
**生成日期**: 2026-04-07

---

## Scenario 1: GSA Auth Troubleshooting Guide
> 来源: ado-wiki-a-gsa-auth-troubleshooting-guide.md | 适用: Mooncake ✅ / Global ✅

### 关键 KQL 查询
```kql
// Check if CA signaling is enabled
RoxyHttpOperationEvent
| where TenantId == "INSERT_TENANT_ID"
| summarize max(TIMESTAMP) by CaSignalingEnabled
```
`[来源: ado-wiki-a-gsa-auth-troubleshooting-guide.md]`

---

## Scenario 2: GSA - Bring Your Own Device
> 来源: ado-wiki-a-gsa-byod.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Install Microsoft Authenticator from the App Store and register the device to the tenant or install the Company Portal app (no device enrollment required).
- 2. Install the Microsoft Defender app from Google Play and complete sign-in.

---

## Scenario 3: GSA for Copilot Studio Agents
> 来源: ado-wiki-a-gsa-copilot-studio-agents.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting - Kusto Queries**

### 关键 KQL 查询
```kql
// Cluster: apim.kusto.windows.net / Database: APIMProd
CustomerProxyDiagnosticLogAllClusters
| where TIMESTAMP > ago(1h)
| where internalProperties contains "<environment-id>"
| extend props = todynamic(internalProperties)
| project PreciseTimeStamp, props.backendUrl
// Ensure returned URLs end in globalsecureaccess.microsoft.com
```
`[来源: ado-wiki-a-gsa-copilot-studio-agents.md]`

```kql
// Cluster: idsharedscus.southcentralus.kusto.windows.net / Database: NaasProd
TunnelServerDebug
| where PreciseTimeStamp > ago(1h)
| where TenantId == "<tenant-id>"
| where TunnelType == "AiAgentPlatform"
| project PreciseTimeStamp, NaasSDPRing, Tenant, TenantId, FlowCorrelationId, DestinationHost, error, Message, FirstPartyMeta
// NaasSDPRing & Tenant show which Ring/Edge. Check "error" column for MCS<>GSA protocol errors.
```
`[来源: ado-wiki-a-gsa-copilot-studio-agents.md]`

```kql
// Cluster: idsharedscus.southcentralus.kusto.windows.net / Database: NaasProd
TalonOperationEvent
| where PreciseTimeStamp > ago(1h)
| where TenantId == "<tenant-id>"
| where TunnelType == "AiAgentPlatform"
| project PreciseTimeStamp, TenantId, FlowCorrelationId, DestinationFqdn, HttpUrl, ResponseCode, PolicyAction, PolicyId, Message
// Check PolicyAction, PolicyId, and backend ResponseCode.
```
`[来源: ado-wiki-a-gsa-copilot-studio-agents.md]`

---

## Scenario 4: GSA DataPipeline - Connections (Traffic Logs)
> 来源: ado-wiki-a-gsa-datapipeline-trafficlogconnections.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Go to [Azure Support Center Portal](https://aka.ms/azuresupportcenter) and insert the Case Id.
- 2. Navigate to **Graph Explorer** Tab in the left pane.
- 3. Insert in Query URL:
- 1. Get the relevant connectionId from the connections query result.
- 2. Run query:

---

## Scenario 5: GSA Data Loss Prevention (DLP) / Advanced Threat Protection (ATP)
> 来源: ado-wiki-a-gsa-dlp-atp.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Step 1: Enable Internet access traffic profile**
2. **Step 2: Enable TLS Termination**
   - Create a Key Vault, obtain CA Certificate, upload to Key Vault, enable TLS Inspection
3. **Step 3: Enable DLP Policy**
   - Activate the Netskope Offer, create a DLP Policy
4. **Step 4: Link DLP Policy to a Security Profile**
5. **Step 5: Assign Security Profile to Users with CA Policy**
6. **Step 6: Verify the Configuration**
7. **Step 7: Test DLP**
8. **Troubleshooting**

### 关键 KQL 查询
```kql
TalonOperationEvent
   | where FilterChain contains "tls-intercept"
   | where Vendors contains "Netskope"
   | project TIMESTAMP, TlsAction, TenantId
```
`[来源: ado-wiki-a-gsa-dlp-atp.md]`

```kql
TalonOperationEvent
   | where FlowCorrelationId == "<correlation-id>"
   | project FilterChain, TenantId, DestinationFqdn, FlowCorrelationId
```
`[来源: ado-wiki-a-gsa-dlp-atp.md]`

```kql
TalonOperationEvent
   | where FlowCorrelationId == "<correlation-id>"
   | where Vendors contains "Netskope"
   | project TIMESTAMP, TenantId, Vendors
```
`[来源: ado-wiki-a-gsa-dlp-atp.md]`

---

## Scenario 6: Global Secure Access on Mac
> 来源: ado-wiki-a-gsa-mac-client.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting**
   - **Get latest policy**: Downloads and applies the latest forwarding profile.
   - **Clear cached data**: Deletes internal cached data (authentication, forwarding profile, FQDNs, IPs).
   - **Export logs**: Exports client logs into a zip file.

---

## Scenario 7: Global Secure Access - AI Prompt Shield Gateway
> 来源: ado-wiki-a-gsa-prompt-shield-gateway.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. [Enable the Internet Access traffic forwarding profile](https://learn.microsoft.com/en-us/entra/global-secure-access/how-to-manage-internet-access-profile#enable-the-internet-access-traffic-forward
- 2. Configure [TLS inspection settings](https://learn.microsoft.com/en-us/entra/global-secure-access/how-to-transport-layer-security-settings) and [TLS Inspection policies](https://learn.microsoft.com/
- 3. Install and configure the [Global Secure Access client](https://learn.microsoft.com/en-us/entra/global-secure-access/how-to-install-windows-client).
- 1. Sign in to [Microsoft Entra admin center](https://entra.microsoft.com/) as GSA Administrator.
- 2. Browse to **Global Secure Access** > **Secure** > **Prompt policies**.
- 3. Select **Create policy**, enter Name and Description.
- 4. On the **Rules** tab, select **Add rule**.
- 5. Configure: Rule Name, Description, Priority, Status, and set **Action** to **Block**.
- 6. Select **+ Conversation scheme** to choose target LLMs.
- 7. From **Type** menu, select the language model. If not listed:

---

## Scenario 8: GSA - Threat Intelligence Filtering
> 来源: ado-wiki-a-gsa-threat-intelligence-filtering.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Enable internet traffic forwarding
- 2. Create a threat intelligence policy
- 3. Configure your allow list (optional)
- 4. Create a security profile
- 5. Link the security profile to a Conditional Access policy
- 1. Browse to **Global Secure Access** > **Secure** > **Threat Intelligence Policies**.
- 2. Select **Create policy**.
- 3. Enter a name and description for the policy and select **Next**.
- 4. The default action for threat intelligence is "Allow" (traffic not matching a rule will proceed to the next security control).
- 5. Select **Next** and **Review** your new threat intelligence policy.

---

## Scenario 9: Global Secure Access Client for iOS
> 来源: ado-wiki-b-gsa-client-for-ios.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting**

---

## Scenario 10: GSA Client Advanced Log Collection Files for MacOS
> 来源: ado-wiki-b-gsa-log-collection-macos.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Check `system_extensions_logs.txt` - GSA Network Extension must be active
- 2. Check `policy.json` - verify profiles/segments are loaded
- 3. Check `dns_logs.txt` - verify GSA resolvers (6.6.255.254 / 240.0.3.3) reachable
- 4. Check `ifconfig_logs.log` - verify utun4 tunnel interface exists
- 5. Check tunnel log - look for "Tunnel created successfully" vs "BypassByConfig"
- 6. Check app log - look for PolicyFetchSuccess and connected state
- 7. If tunnel fails - check plist files for stale state, delete to force re-auth

---

## Scenario 11: GSA Client Advanced Log Collection Files for Windows
> 来源: ado-wiki-b-gsa-log-collection-windows.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Diagnostic Text Files**

---

## Scenario 12: ado-wiki-c-gsa-asc-graph-explorer-queries
> 来源: ado-wiki-c-gsa-asc-graph-explorer-queries.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 13: GSA Deployment Logs
> 来源: ado-wiki-c-gsa-deployment-logs.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting Workflow**

---

## Scenario 14: GSA Intelligent Local Access (ILA) for Private Access
> 来源: ado-wiki-c-gsa-intelligent-local-access.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting**
   - Registry: HKEY_LOCAL_MACHINE SOFTWARE Microsoft Global Secure Access Client (REG_SZ)
   - Network Definitions array contains DNS probe settings and IP configurations
   - ASC: Tenant Explorer > Global Secure Access > Private Network

---

## Scenario 15: GSA Multi-Geo Capability for Entra Private Access
> 来源: ado-wiki-c-gsa-multi-geo-private-access.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting - Graph API**
   - Get app + connector group: GET /beta/applications/{id}?=onPremisesPublishing&=connectorGroup
   - Get connector membership: GET /beta/onPremisesPublishingProfiles/applicationProxy/connectors/{id}/memberOf
   - Get connector group details: GET /beta/onPremisesPublishingProfiles/applicationProxy/connectorGroups/{id}

---

## Scenario 16: Private DNS
> 来源: ado-wiki-c-gsa-nrpt-issues.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 17: General Troubleshooting Questions for Application Access Issues
> 来源: ado-wiki-c-gsa-private-access-data-collection.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Run the MEPNC Data collector script with **-GSA** switch on the connector. Note: if you have more than one connector in the connector group please be sure to run the script in all of them.
- 1. Ensure you have the latest GSA client installed.  [latest version](https://learn.microsoft.com/en-us/entra/global-secure-access/reference-windows-client-release-history)
- 2. Collect data using Advanced log collection:
- 3. Reproduce the issue by accessing the Application configured with GSA from the GSA Client device.
- 5. Once you finish, stop the Data collector on the Connector server, stop the Advanced log collection.
- 6. Ask the customer to upload the data collected from the connector and client.
- 1.  **Disable the GSA client**.
- 2.  Follow the previously outlined action plan, but�**skip the MEPNC Data Collector Script**.
- 3.  Make sure that the�**working and non-working traces are clearly distinguishable**.

---

## Scenario 18: GSA Entra Private Access for Domain Controllers
> 来源: ado-wiki-c-gsa-private-access-domain-controllers.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting**
   - Event Viewer: Review Private Access Sensor logs
   - Log Collection: Run PrivateAccessSensorLogsCollector from sensor install path
   - GSA Client Logs: Right-click tray icon > Advanced Diagnostics > Advanced log collection

---

## Scenario 19: GSA Scoping Questions
> 来源: ado-wiki-c-gsa-scoping-questions.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Tenant ID where GSA is configured
- 2. Does customer have M365 linked to same tenant?
- 3. Evaluating or production deployment?
- 4. Existing web-proxy/VPN/SSE solution?
- 5. Which GSA scenario deployed? (See matrix below)
- 6. Client type: Windows, Android, iOS? Latest version?
- 7. Agent or branch setup?
- 8. Run Client Checker or Connection Diagnostics tool
- 9. Internet Access or Private Access issue?
- 10. CA policy deployed to GSA traffic profile?

---

## Scenario 20: ado-wiki-c-gsa-trace-etl-advanced-troubleshooting
> 来源: ado-wiki-c-gsa-trace-etl-advanced-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 21: Error When Adding a Network Segment - GSA Private Access
> 来源: ado-wiki-d-gsa-error-adding-network-segment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Step-by-Step Troubleshooting**
   - Multiple root causes can produce the error above. Follow the steps below to identify the root cause and resolve the issue. Proceed step-by-step and stop as soon as the cause is confirmed.

---

## Scenario 22: ado-wiki-d-gsa-private-access-network-performance-tsg
> 来源: ado-wiki-d-gsa-private-access-network-performance-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1.  **Which application is affected?**
- 2.  **What network requirements does it have?**
- 3.  **Business impact**
- 4.  **Is this a new implementation or a regression?**
- 5.  **Network Access app configured for the app**
- 6. **Is any 1st or 3rd party software like VPN client, Security Software involved?**
- 7. **What is the download and upload metrics for the Internet connection provided by ISP?**

---

## Scenario 23: Microsoft Entra GSA App Discovery
> 来源: ado-wiki-e-gsa-app-discovery.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting**
   - If the workbook fails to load data or displays partial data:
   - 1. [Re-export the traffic logs](https://learn.microsoft.com/entra/global-secure-access/how-to-view-traffic-logs#how-to-view-the-traffic-logs) and reload the workbook
   - 2. If that does not resolve the issue, open an IcM with PSR repro and [HAR file](https://learn.microsoft.com/azure/azure-portal/capture-browser-trace)

---

## Scenario 24: Private DNS Support for GSA
> 来源: ado-wiki-e-private-dns-support-gsa.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting**

---

## Scenario 25: Global Secure Access Client for Windows — Troubleshooting Guide
> 来源: mslearn-global-secure-access-client-windows.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. **Advanced diagnostics**: Troubleshoot the Global Secure Access client advanced diagnostics
- 2. **Health check tab**: Troubleshoot the Global Secure Access client diagnostics health check

---
