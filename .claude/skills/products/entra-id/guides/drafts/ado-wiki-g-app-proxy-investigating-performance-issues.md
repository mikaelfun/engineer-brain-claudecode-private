---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra application proxy/Investigating performance issues/Microsoft Entra Application Proxy - Investigating performance issues"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Authentication/Microsoft%20Entra%20application%20proxy/Investigating%20performance%20issues/Microsoft%20Entra%20Application%20Proxy%20-%20Investigating%20performance%20issues"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Microsoft Entra Application Proxy - Investigating Performance Issues

## Background

Entra Application Proxy is cloud-based and involves many components with different network paths. All components can induce latency. The performance should not be compared with VPN or on-premises access speed.

App Proxy might not be suitable for web apps requiring high network performance achievable only on-premises.

## Location of Possible Issues

Main segments in the request flow:
1. Client
2. Network: Client <-> Entra
3. Entra AD Authentication platform
4. Entra Application Proxy Cloud service
5. Network: Cloud service <-> Connector
6. Entra Application Proxy Connector
7. Network: Connector <-> AD infrastructure (IWA SSO)
8. AD infrastructure (IWA SSO)
9. Network: Connector <-> Web app server
10. Web app itself

## Key Questions for Customer

- Since when do you experience performance issues? Was it smooth before?
- Any changes introduced (user count, network, app config, App Proxy config)?
- Geographical location of users, connectors, web application?
- Are all apps published through App Proxy affected, or specific ones (get app IDs)?
- Always slow or random? During specific actions?
- When does it happen (all day, peak hours)?
- What kind of apps (Exchange, SharePoint, etc.)?
- How many users accessing the web apps?
- Do connectors use an outbound proxy?
- Same performance issue when accessing the web app directly on the connector server?
- How many connectors in the connector group assigned to the app?
- How many servers host the affected web app?
- Are connectors and web app in the same subnet? Any intermediate devices (firewall, proxy, LB) between them? SSL termination?

## Support Checks

1. Check if [Moving The MEAP Configuration To Another Region](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/321434/Moving-The-AADAP-Configuration-To-Another-Region) applies
2. Verify latest connector version ([version check guide](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/436400/Azure-AD-Application-Proxy-How-to-get-the-version-of-the-connector))
3. Check if connector uses outbound proxy
4. Check App Proxy app configuration via ASC:
   - ASC -> Tenant Explorer -> Application -> Locate app -> Application Proxy
   - **Pre-authentication type**: If passthrough or Entra ID with no SSO and app uses NTLM, this generates extra network traffic. Using Entra pre-auth with IWA SSO can reduce latency.
   - **Translate URLs in Body (IsTranslateLinksInBodyEnabled)**: If enabled and causing performance issues, see [Link Translation guide](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/344026/Link-Translation-in-the-Response-Body-and-Azure-AD-Application-Proxy)

## Data Collection

Collect at least **4 Fiddler traces** while replicating the issue. Later, more data or other support teams may be needed.

## Checking the Data

### Step 1: Check for errors in Fiddler
Look for HTTP 500, high number of HTTP 401, or other errors that could impact performance. Sort out identified errors first.

### Step 2: Add Overall_Elapsed column in Fiddler
- **Overall Elapsed** = ClientDoneResponse - ClientBeginRequest
- Identifies which transactions took longer
- Note: larger data payloads naturally take longer

### Step 3: Use Kusto for transaction analysis

**Look up a specific transaction:**
```kusto
let tran = 'TRANSACTION_ID';
let transdate = datetime("yyyy-mm-ddThh:mm:ss");
TransactionSummaries
| where TIMESTAMP > transdate-10m and TIMESTAMP < transdate+10m and TransactionId == tran
```

**Key columns:**
| Column | Description |
|--------|-------------|
| TotalLatency | Total latency between request arrival at cloud service and response sent to client |
| BackendLatency | Latency between connector and published app |
| InducedLatency | Latency caused by the App Proxy Cloud service itself |
| RequestBodySize | Size of the request body (mainly POST) |
| RequestBodyTransferTime | Time to send request body to connector |
| ResponseSize | Size of response body |
| ResponseTransferTime | Time to send response from cloud service to client |

**Full flow from cloud service perspective:**
```kusto
let tran = 'TRANSACTION_ID';
let transdate = datetime("yyyy-mm-ddThh:mm:ss");
Traces
| where TIMESTAMP > transdate-10m and TIMESTAMP < transdate+10m
  and (TransactionId == tran or Message contains tran)
| project TIMESTAMP, Message, TransactionId, SubscriptionId
```

### Step 4: Kusto statistics
Create aggregate statistics for latency patterns across time.

## Checking Connector Load

Delays may occur when the connector exceeds its connection limit. See dedicated guide: [Connector High CPU/Memory](./ado-wiki-g-app-proxy-connector-high-cpu-memory.md)
