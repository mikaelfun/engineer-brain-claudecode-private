---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Data Ingestion - Connectors/Microsoft First Party Connectors/Microsoft Defender for Cloud and Defender XDR"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=/Microsoft%20Sentinel%20Wiki/Data%20Ingestion%20-%20Connectors/Microsoft%20First%20Party%20Connectors/Microsoft%20Defender%20for%20Cloud%20and%20Defender%20XDR"
importDate: "2026-04-07"
type: troubleshooting-guide
---

#Defender for Cloud & Defender XDR Connectors in Microsoft Sentinel

[[_TOC_]]

# 1. Overview
Microsoft has introduced **a new tenant-level Defender for Cloud connector** to replace the older **subscription-level connector** for Azure Sentinel integration.
Additionally, Defender for Cloud alerts can be ingested into Sentinel through **Defender XDR**, enabling consolidated incident management across Microsoft Defender products.

# 2. Connector Types
## 2.1 Subscription-Level Connector (Legacy)
 * Works at **the subscription scope**.
 * Forwards alerts directly from Defender for Cloud to Sentinel.
 * Supports **limited bi-directional synchronization**:

     * If an alert is closed in Sentinel, its status updates to **Resolved** in Defender for Cloud.

This diagram illustrates the path of the incident creation <span style="color:blue">(blue arrows)</span> and the synchronization of alerts and incidents <span style="color:red">(red arrows)</span>:

[![Architecture Diagram](/.attachments/mdc-sentinel-connection.png)](/.attachments/mdc-sentinel-connection.png)

## 2.2 Tenant-Level Connector (New)
 * Works at the **tenant scope**.
 * Retrieves alerts through **Defender XDR** instead of direct push from Defender for Cloud.
 * Supports **bi-directional synchronization** similar to the subscription-level connector.
 * Recommended for **centralized alert ingestion** and better integration with XDR.

## 2.3 Comparison of the Two MDC Sentinel Connectors

|  | Subscription-based | Tenant-based |
| - | - | - |
| XDR Dependency | No dependency | The MDC config in XDR needs to be set to �All Alerts� |
| Incident Creation | Via ICR | Via ICR |
| Sync with Sentinel | Has Sync | No direct Sync |
| Maintenance | New Sub need to be manually covered | New Sub in the tenant are automatically monitored |
| Alert Link | Link to MDC alert | Link to XDR alert |

This diagram depicting the alert flow from MDC to Sentinel using both Defender for Cloud connectors. In it the <span style="color:purple">purple</span> color represents the path of the alerts with the condition-less subscription-based connector, while the <span style="color:green">green</span> line indicates the path of the alerts via the tenant-based connector, which only functions when XDR uses the default (All alerts) setting. 

[![Architecture Diagram](/.attachments/tenantMDC.png)](/.attachments/tenantMDC.png)

## 2.4 Defender XDR Connector
 * Consolidates alerts, incidents, and telemetry from multiple Microsoft Defender sources into Sentinel.
 * Enables **full bi-directional synchronization** of incidents:
     * Status, ownership, and comments are updated across both Sentinel and Defender XDR.
 * **Important**: If XDR is enabled **without** a Defender for Cloud connector (subscription or tenant), Sentinel may receive incidents **without underlying alert details**, limiting investigation capabilities.

The architecture of how the modules are working together functionality-wise

[![Architecture Diagram](/.attachments/MDCandXDR.png)](/.attachments/MDCandXDR.png)

## 2.5 Connector Behavior Summary

| MDC Connector Type | XDR Connector (Alerts/Incidents) | MDC Config in XDR | Alerts in Sentinel | Incidents in Sentinel | Alerts/Incidents in XDR |
| - | - | - | - | - | - |
| Sub-based | Disabled | Enabled (default) | Yes | Rule Is Needed | Yes |
| Tenant-based | Disabled | Enabled (default) | Yes | Rule Is Needed | Yes|
| Sub-based | Disabled | Disabled | Yes | Rule Is Needed | No |
| Tenant-based | Disabled | Disabled | No | No | No |
| No MDC Connector | Enabled | Enabled (default) | No | Yes (Limited info) | Yes |
| Sub-based | Enabled | Enabled (default) | Yes | Yes | Yes |
| Tenant-based | Enabled | Enabled (default) | Yes | Yes | Yes |

# 3. Investigation
## 2 way sync
## Verify Publisher service identifies it should publish the change to ASC(MDC)

Once you have a complete picture of the events (and closure) of an incident based on [alerts and incidents telemetry](/Viewing-Alerts-and-Incidents/Alerts-and-incidents-telemetry) you can use the following query to check the if the publish event was triggered.

```q
let startTime = datetime(2023-07-29);
let endTime = datetime(2023-07-31);
cluster('securityinsights.kusto.windows.net').database('SecurityInsightsProd').Operations
| where env_time between (startTime .. endTime)
| where serviceName == "fabric:/CasesApplication/CasesPublisherService"
| extend workspaceId = tostring(todynamic(customData).workspaceId)
| extend incidentId = tostring(todynamic(customData).incidentId)
| extend OldStatus = tostring(todynamic(customData).OldStatus)
| extend NewStatus = tostring(todynamic(customData).NewStatus)
| extend ShouldPublish = tostring(todynamic(customData).ShouldPublish)
| where workspaceId == "3a96fad4-f823-4ebe-b9f3-36a64d011bff"
| where incidentId contains "a586ac28-4403-4e6c-b5dd-36d13518a251"
| where operationName == "Sentinel.CasesPublisherService.MessageProcessors.AscPublishing.AscIncidentPublisher.ShouldPublishIncidentToAsc"
| project
    env_time,
    rootOperationId,
    operationName,
    resultType,
    OldStatus,
    NewStatus,
    ShouldPublish
```

## Verify update was sent to ASC successfully

Once you have the logs you can use the `rootOperationId` value to check the details:

```q
let startTime = datetime(2023-07-29);
let endTime = datetime(2023-07-31);
cluster('securityinsights.kusto.windows.net').database('SecurityInsightsProd').Operations
| where env_time between (startTime .. endTime)
| where rootOperationId == "74fcf57e-b47f-4464-9bb5-46c074f6a098"
| project env_time, rootOperationId, operationName, resultType, customData
```

# Subscription-based Microsoft Defender for Cloud (Legacy)

## Check if a subscription is connected

If the customer can't check the connector status this query can help:

```q
cluster('securityinsights.kusto.windows.net').database('SecurityInsightsProd').Operations
| where around(env_time, datetime(2024-01-22 12:24:50.4593990),2d)
| where customData has "{workspaceID}"
| where customData contains "scubaRoutingRules"
| mv-expand customData.scubaRoutingRules to typeof(dynamic)
| extend
    env_time,
    workspaceId=tostring(customData_scubaRoutingRules.extra.workspaceId),
    scubaId=tostring(customData_scubaRoutingRules.id),
    source=tostring(customData_scubaRoutingRules.source),
    workflowName=tostring(customData_scubaRoutingRules.extra.workflowName),
    DestinationTable=tostring(customData_scubaRoutingRules.extra.metadata.DestinationTable),
    routing=tostring(customData_scubaRoutingRules.routing.Workload),
    connectorName=tostring(customData_scubaRoutingRules.extra.connectorName),
    EffectiveSubscriptionId=tostring(customData_scubaRoutingRules.routing["ASI.EffectiveSubscriptionId"]),
    Metadata=tostring(customData_scubaRoutingRules.extra["metadata"]),
    DataProvider=tostring(customData_scubaRoutingRules.extra["dataProvider"]),
    Type=tostring(customData_scubaRoutingRules.extra["type"])
| summarize arg_max(env_time,*) by scubaId
| project env_time,workspaceId,scubaId,source,workflowName,DestinationTable,routing,connectorName,EffectiveSubscriptionId,Metadata,DataProvider,Type
```

# 4. Delete the Subscription-based Microsoft Defender for Cloud (Legacy) - API Method to delete connector.
##  Ensure that all the subscriptions inside this connector are turned off/disconnected 
 ![image.png](/.attachments/image-463ab354-0c12-45af-ae50-e1d75d63bc7f.png)
�

First, find the MDFC data connector id,
 Use the�[Data Connectors - List - REST API (Azure Sentinel) | Microsoft Learn](https://learn.microsoft.com/en-us/rest/api/securityinsights/data-connectors/list?view=rest-securityinsights-2025-09-01&tabs=HTTP "https://learn.microsoft.com/en-us/rest/api/securityinsights/data-connectors/list?view=rest-securityinsights-2025-09-01&tabs=http")�api
. 

Then call the�[Data Connectors - Delete - REST API (Azure Sentinel) | Microsoft Learn](https://learn.microsoft.com/en-us/rest/api/securityinsights/data-connectors/delete?view=rest-securityinsights-2025-09-01&tabs=HTTP "https://learn.microsoft.com/en-us/rest/api/securityinsights/data-connectors/delete?view=rest-securityinsights-2025-09-01&tabs=http")�with the data connector id

Ensure Response 200 OK in results.

If needed delete the routing rules manually.
Running the following PowerShell commends with an authorized user in Azure Cloud Shell should resolve the issue.  

```q  
$resourceGroup�=�"<your-resource-group>"
$workspaceName�=�"<your-workspace-name>"

$connectors = Get-AzSentinelDataConnector `
  -ResourceGroupName $resourceGroup `� 
  -WorkspaceName $workspaceName `�
  | Where-Object { $_.Kind -eq "AzureSecurityCenter" }

foreach ($connector in $connectors) 
{� � 

     Write-Host "Deleting connector: $($connector.Name)"  � �Remove-AzSentinelDataConnector `
  � � � -ResourceGroupName $resourceGroup `
  � � � -WorkspaceName $workspaceName `�
    � � -DataConnectorId $connector.Name `
}
```

 
|Contributor Name|  Details|  Date|
|--|--|--|
| JEHAD ABU SULTAN (jabusultan) | Created the part (1 to 2.5) | 21/08/2025 |
| JOYDEEP DUTT (joydeepdutt) | Created the part (4) | 05/03/2026 |
|  |  |  |
|  |  |  |
|  |  |  |
|  |  |  |
|  |  |  |
---

:::template /.templates/Wiki-Feedback.md 
:::

---

:::template /.templates/Ava-GetHelp.md 
:::
