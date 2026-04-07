---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Data Ingestion - Connectors/Microsoft First Party Connectors/Microsoft 365 Defender/M365 Defender incident integration Data Connector"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=%2FMicrosoft%20Sentinel%20Wiki%2FData%20Ingestion%20-%20Connectors%2FMicrosoft%20First%20Party%20Connectors%2FMicrosoft%20365%20Defender%2FM365%20Defender%20incident%20integration%20Data%20Connector"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# TSG Microsoft 365 Defender-Sentinel Bi-directional incident integration

## Mandatory information to collect when investigating an issue:
- Issue description as detailed as possible
- Azure Tenant ID
- Azure Workspace ID
- Sentinel / M365 Defender Incident ID(s)
- Screenshots
- Timeframe
- Errors & stack trace if available

## Known issues & limitations
- Sentinel incidents can contain max 150 alerts, M365 Defender incidents support more alerts.
- M365 Defender incidents may take up to 10 minutes to appear in Sentinel.
- An incident can contain 0 alerts! In this case the incident will contain a tag of "Redirected".
- Disconnecting the following connectors is disabled while M365 defender connector is connected:
  - Microsoft Defender for Endpoint
  - Microsoft Defender for Identity
  - Microsoft Defender for Office 365
  - Microsoft Cloud App Security
- In order to disconnect these connectors, you must first disconnect M365 defender connector.

## Documentation to send to customers:
- [Microsoft 365 Defender integration with Azure Sentinel](https://docs.microsoft.com/en-us/azure/sentinel/microsoft-365-defender-sentinel-integration)
- [Connect data from Microsoft 365 Defender to Azure Sentinel](https://docs.microsoft.com/en-us/azure/sentinel/connect-microsoft-365-defender)

## Duplicated Incidents
This may be caused due to incident creation rule + incident integration both enabled. While Connecting the connector we have a checkbox offering the user to disable their alert rules but this isn't enforced.

## Issues related to M365 Defender internal providers should be forwarded to M365 Defender provider:
- Microsoft Defender for Endpoint
- Microsoft Defender for Identity
- Microsoft Defender for Office 365
- Microsoft Defender for Cloud Apps
- Microsoft Defender Alert Evidence

## M365 Defender incident doesn't sync after changing an incident
- Did you try to choose the incident in Sentinel after refresh?
- Are you sure this incident is from the incident integration and not from an incident creation rule? Validate the "Product name" of the incident in the incidents page is "Microsoft 365 Defender" (before USOP/USX integration).
- How did you change the incident (via Sentinel portal or via MTP portal)? Could you please try different direction?
- Did you receive some error during the change?
- Could you please reproduce again the issue on most updated incidents and send screenshots and time frame?

**Notes:** Bi-directional sync between Sentinel and Microsoft 365 Defender incidents on **status, owner, and closing reason**. The synchronization will take place in both portals immediately after the change to the incident is applied, with no delay. A refresh might be required to see the latest changes.

## M365 Defender incident doesn't appear in Sentinel
- Do you see the Incident in MTP portal?
- Can you find the incident in Sentinel in LA query?
- Please re-check that you are searching data in correct LA Workspace and with correct time interval?
- Was this incident created before the incident integration (MTP connector) was connected?
- Do you see other incidents from Product name = "Microsoft 365 Defender" or is this the only one missing?

## M365 Defender incidents retention
M365 Defender incidents have a retention period (default is 6 months), these incidents will continue to appear in Sentinel but the link to M365 Defender portal will redirect to the home page and not the incident page. Notice this can occur to incidents that are 6 months old.

## Incident status mapping
When updating the incident in M365D, classification works as the following:

| Sentinel | M365 Defender |
|----------|---------------|
| Not set (the default) | Undetermined |
| True positive | True Positive |
| Informational / expected activity | Benign Positive |
| False positive | False Positive |

This mapping is for Sentinel incidents <-> M365 Defender incidents. Not for Sentinel incidents <-> M365 Defender alerts.

## MTP-M365-XDR backend queries

### Get the tenant region, OrgId and telemetry cluster

```kusto
cluster('wcdprod').database('TenantsStoreReplica').TenantsV2
| where AadTenantId =="{TenantId}"
| summarize arg_max(Timestamp, *) by AadTenantId
| project DcId,OrgId,ScrubbedKustoClusterName
| extend wcdCluster=strcat("https://",todynamic(ScrubbedKustoClusterName).Scrubbed.roleToCluster.Read,".kusto.windows.net")
```

### Get alert data

```kusto
let alertId="{ALERT_ID}";
let cluster="{wcdCluster}";
cluster(cluster).database('scrubbeddata').MtpAlerts
| where AlertId == alertId
```

### Get alert status

```kusto
let alertId="{ALERT_ID}";
let cluster="{wcdCluster}";
cluster(cluster).database('scrubbeddata').MtpAlertStatus
| where AlertId == alertId
| order by Timestamp desc
```

### Get alert evidences

```kusto
let alertId="{ALERT_ID}";
let cluster="{wcdCluster}";
cluster(cluster).database('scrubbeddata').MtpAlertEvidence
| where OrgId == "{ORG_ID}"
| where AlertId contains alertId
| sort by FirstSeen desc
```

### Incident and alerts

```kusto
let incidentId="{INCIDENT_NUMBER}";
let alertId="{ALERT_ID}";
let TenantIdValue=hash_sha1("{TENANT_ID}");
let cluster="{wcdCluster}";
cluster(cluster).database('scrubbeddata').MtpAlertIncidents
| where IncidentId == incidentId
| where AlertId == alertId
| where TenantId has TenantIdValue
```

### Incident status (check if redirected)

```kusto
let incidentId="{INCIDENT_NUMBER}";
let orgId="{ORG_ID}";
let TenantIdValue=hash_sha1("{TENANT_ID}");
let cluster="{wcdCluster}";
cluster(cluster).database('scrubbeddata').MtpIncidentStatus
| where IncidentId == incidentId
| where OrgId ==orgId
| where TenantId has TenantIdValue
```

## Alert ID prefix mapping

| Alert source | Alert ID prefix |
|:---|:---|
| Microsoft Defender XDR | `ra{GUID}`, `ta{GUID}` (ThreatExperts), `ea{GUID}` (custom detections) |
| Microsoft Defender for Office 365 | `fa{GUID}` |
| Microsoft Defender for Endpoint | `da{GUID}`, `ed{GUID}` (custom detections) |
| Microsoft Defender for Identity | `aa{GUID}` |
| Microsoft Defender for Cloud Apps | `ca{GUID}` |
| Microsoft Entra ID Protection | `ad{GUID}` |
| App Governance | `ma{GUID}` |
| Microsoft Data Loss Prevention | `dl{GUID}` |
| Microsoft Defender for Cloud | `dc{GUID}` |
| Microsoft Sentinel | `sn{GUID}` |

## StrPII values
The tenantId and other fields can be obfuscated for privacy. Use sha1 hash to search:
```kusto
let TenantIdValue=hash_sha1("{TENANT_ID}");
```

## Notes about clusters (post June 19, 2024)
Users must use follower clusters:

| Follower Cluster | Leader Cluster | Connection URI |
|---|---|---|
| Wcdscrubbedfollowercus | wcdscrubbedcus | https://wcdscrubbedfollowercus.centralus.kusto.windows.net |
| Wcdscrubbedfollowereus | wcdscrubbedservice | https://wcdscrubbedfollowereus.eastus2.kusto.windows.net |
| Wcdscrubbed2followeus | wcdscrubbed2eus | https://wcdscrubbed2followeus.eastus2.kusto.windows.net |
| Wcdscrubbedfollowerweu | wcdscrubbedweu | https://wcdscrubbedfollowerweu.westeurope.kusto.windows.net |
| Wcdscrubbedfollowerneu | wcdscrubbedneu | https://wcdscrubbedfollowerneu.northeurope.kusto.windows.net |
