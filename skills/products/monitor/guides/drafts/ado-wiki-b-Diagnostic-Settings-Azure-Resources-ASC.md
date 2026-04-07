---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitoring Essentials/Diagnostic Settings/How-To/How to get diagnostic settings for Azure resources from Azure Support Center"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitoring%20Essentials/Diagnostic%20Settings/How-To/How%20to%20get%20diagnostic%20settings%20for%20Azure%20resources%20from%20Azure%20Support%20Center"
importDate: "2026-04-07"
type: troubleshooting-guide
---

::: template /.templates/Common-Header.md
:::

::: template /.templates/Note-ASCGetPermissions.md
:::

[[_TOC_]]

# Instructions
---
:::template /.templates/AzMon-OpenASCFromSupportRequest.md
:::

:::template /.templates/ASC-NavigateToResourceExplorer.md
:::

1. Select the **Resource Provider** view.

   ![image.png](/.attachments/image-ASC-ResourceView-ResourceProvider.png)

1. Click on the **microsoft.insights** blade in the left hand navigation.

   ![image.png](/.attachments/image-0b85d566-9432-4e38-82ad-7e772e0c263c.png)

1. Click on the **Diagnostic Settings V2 (Azure Monitor)** tab.

   ![image.png](/.attachments/image-c9e699ae-82aa-47c2-bac7-5ae72bb94397.png)

1. In the **Get Diagnostic setting : Resource Level** section, populate the desired Azure resource identifier and then click **Run**.

   ![image.png](/.attachments/image-f17d8fc0-72e0-4a04-b44f-336c98ae9570.png)
    
# Reviewing the results
---
For each diagnostic setting configured, results will be returned with sections broken out by the diagnostic setting name and within that section, three subsections for diagnostic settings properties, metrics and logs configurations.

**Diagnostic Settings Properties**

| Property | Description |
|:---------|:------------|
| id | The Azure resourceId of the diagnostic setting.  The text before "/providers/microsoft.insights/diagnosticSettings" represents the resourceId of the source Azure resource.<br><br>Example:<br><ul><li><b>Diagnostic Settings resourceId</b> - /subscriptions/00000000-0000-0000-0000-000000000000/resourcegroups/testing1/providers/microsoft.logic/workflows/logicapp1/providers/microsoft.insights/diagnosticSettings/service</li><li><b>Source Azure resourceId</b> - /subscriptions/00000000-0000-0000-0000-000000000000/resourcegroups/testing1/providers/microsoft.logic/workflows/logicapp1</li></ul> |
| name | Name of the diagnostic setting. |
| storageAccountId | The Azure resourceId of the storage account target destination.  If a storage account is not configured as a target destination, N/A will be returned. |
| workspaceId | The Azure resourceId of the Log Analytics workspace target destination.  If a Log Analytics workspace is not configured as a target destination, N/A will be returned. |
| eventHubAuthorizationRuleId | The Azure resourceId to the Event Hub namespace target destination authorization rule.  If an Event Hub is not configured as a target destination, N/A will be returned. |
| eventHubName | The name of the Event Hub target destination configured for the Event Hub namespace.  If an Event Hub namespace is configured but this returns N/A then the namespace will be created automatically.  If an Event Hub is not configured as a target destination, N/A will be returned. |
| logAnalyticsDestinationType | This is a legacy property that is no longer used and will most commonly be returned as N/A since it is not applicable.  If a configuration does have this property populated then valid values are:<br><ul><li>AzureDiagnostics - Data flows to the AzureDiagnostics table.</li><li>Dedicated - (aka resource-specific) Data flows to a dedicated table specific to the resource type.</li></ul>

**Logs**

| Property | Description |
|:---------|:------------|
| category | List of log categories available for the resource type. |
| categoryGroup | List of log category groups available for this resource type. |
| enabled | Whether or not the log category is enabled for sending data to the target destinations. |
| retentionPolicy/enabled | Whether or not a storage retention policy is enabled (only applies to storage target destinations). |
| retentionPolicy/days | The number of days data should be retained (only applies to storage target destinations). |

**Metrics**

| Property | Description |
|:---------|:------------|
| category | List of metrics categories available for the resource type. |
| categoryGroup | List of metrics category groups available for this resource type. |
| enabled | Whether or not the metrics category is enabled for sending data to the target destinations. |
| retentionPolicy/enabled | Whether or not a storage retention policy is enabled (only applies to storage target destinations). |
| retentionPolicy/days | The number of days data should be retained (only applies to storage target destinations). |

**Example:**

```
{
  "value": [
    {
      "id": "/subscriptions/00000000-0000-0000-0000-000000000000/resourcegroups/testing1/providers/microsoft.logic/workflows/logicapp1/providers/microsoft.insights/diagnosticSettings/service",
      "type": "Microsoft.Insights/diagnosticSettings",
      "name": "service",
      "location": "eastus",
      "kind": null,
      "tags": null,
      "properties": {
        "storageAccountId": "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/Testing1/providers/Microsoft.Storage/storageAccounts/azmoncsstesting1",
        "serviceBusRuleId": null,
        "workspaceId": "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/testing1/providers/Microsoft.OperationalInsights/workspaces/Testing1",
        "eventHubAuthorizationRuleId": "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/Testing1/providers/Microsoft.EventHub/namespaces/azmoncsstesting1/authorizationrules/RootManageSharedAccessKey",
        "eventHubName": null,
        "metrics": [
          {
            "category": "AllMetrics",
            "enabled": true,
            "retentionPolicy": {
              "enabled": false,
              "days": 0
            }
          }
        ],
        "logs": [
          {
            "category": "WorkflowRuntime",
            "categoryGroup": null,
            "enabled": true,
            "retentionPolicy": {
              "enabled": false,
              "days": 0
            }
          }
        ],
        "logAnalyticsDestinationType": null
      },
      "identity": null
    },
    {
      "id": "/subscriptions/00000000-0000-0000-0000-000000000000/resourcegroups/testing1/providers/microsoft.logic/workflows/logicapp1/providers/microsoft.insights/diagnosticSettings/DATADOG_DS_V2_b0af2b63",
      "type": "Microsoft.Insights/diagnosticSettings",
      "name": "DATADOG_DS_V2_b0af2b63",
      "location": "eastus",
      "kind": null,
      "tags": null,
      "properties": {
        "storageAccountId": null,
        "serviceBusRuleId": null,
        "workspaceId": null,
        "eventHubAuthorizationRuleId": null,
        "eventHubName": null,
        "marketplacePartnerId": "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/Datadog1/providers/Microsoft.Datadog/monitors/Datadog1",
        "metrics": [
          {
            "category": "AllMetrics",
            "enabled": false,
            "retentionPolicy": {
              "enabled": false,
              "days": 0
            }
          }
        ],
        "logs": [
          {
            "category": "WorkflowRuntime",
            "categoryGroup": null,
            "enabled": true,
            "retentionPolicy": {
              "enabled": false,
              "days": 0
            }
          }
        ],
        "logAnalyticsDestinationType": null
      },
      "identity": null
    }
  ]
}
```

