---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitoring Essentials/Diagnostic Settings/How-To/How to get diagnostic settings for Azure resources from Kusto"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitoring%20Essentials/Diagnostic%20Settings/How-To/How%20to%20get%20diagnostic%20settings%20for%20Azure%20resources%20from%20Kusto"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

<div style="border:6px solid; margin-bottom:20px; padding:10px; min-width:500px; width:75%; border-radius:10px; color:black; background-color:#7BD689">

Try the new Diagnostic Settings dashboard for troubleshooting Diagnostic Settings cases:
<span style="background-color: #DDFFE2">(https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1666481/-TSG-Diagnostic-Settings-Telemetry)</span>

</div>

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">

**Important**

Kusto data for diagnostic settings registration telemetry is only updated once per day so if a diagnostic setting was recently created it may not show up via this method.  Following article [How to get diagnostic settings for Azure resources from Azure Support Center](/Monitoring-Essentials/Diagnostic-Settings/How%2DTo/How-to-get-diagnostic-settings-for-Azure-resources-from-Azure-Support-Center) or [How to get diagnostic settings for an Azure resource from Jarvis](/Deprecated-Content/How-to-get-diagnostic-settings-for-an-Azure-resource-from-Jarvis) will always be real-time information.
</div>

[[_TOC_]]

# Before You Begin
---
In order to query for diagnostic settings telemetry, you will need to ensure you have installed Kusto Explorer and added a connection for the **Azureinsights** Kusto cluster.

For details on adding Kusto clusters, see article [How to add Kusto clusters needed by Azure Monitor to Kusto Explorer](/Azure-Monitor/How%2DTo/Kusto/How-to-add-Kusto-clusters-needed-by-Azure-Monitor-to-Kusto-Explorer).

# Querying for Diagnostic Settings
---
1. Open Kusto Explorer, select **Home** ribbon and click **New tab**.

   ![image.png](/.attachments/image-5f66b528-26ee-4ec5-95b5-46c8a6f721dd.png)

1. Expand the connection you created to the **Azureinsights** cluster and select the **Insights** database.

   ![image.png](/.attachments/image-ec3f3f84-2400-4fed-9914-3831f15c454f.png)

1. Follow directions in one of the sections below to select the query you want to work with based on your needs.

1. To get full details about diagnostic settings for a specific resource from Jarvis once you've identified it using one of the methods below, see article: [How to get diagnostic settings for an Azure resource from Jarvis](/Deprecated-Content/How-to-get-diagnostic-settings-for-an-Azure-resource-from-Jarvis).

## Get All Settings for an Azure Resource
This query will retrieve all the diagnostic settings that are currently configured for a given Azure resource.

Copy and paste the following Kusto query into the query window and replace AZURERESOURCEIDGOESHERE with the desired Azure resource id, then click **Run (F5)**.

:::template /.templates/Launch-Kusto.md
:::

```

let resId = "AZURERESOURCEIDGOESHERE";
RegistrationTelemetry
| where PreciseTimeStamp > ago(5d)
| where resourceId =~ resId
| summarize max(PreciseTimeStamp) by PreciseTimeStamp, todatetime(creationTimeDate), lastModifiedTimeDate, name, serviceIdentity, resourceId, dataType, categories, usingOms, usingServiceBus, usingStorage, workspaceId, omsWorkspaceResourceId, serviceBusInformation, eventHubName, eventHubLocation, customerStorageAccountId, ['retention'], blobName

```

**Example:**

```

let resId = "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/devtest-cym3/providers/Microsoft.Network/applicationGateways/***cym3";
RegistrationTelemetry
| where PreciseTimeStamp > ago(5d)
| where resourceId =~ resId
| summarize max(PreciseTimeStamp) by PreciseTimeStamp, todatetime(creationTimeDate), lastModifiedTimeDate, name, serviceIdentity, resourceId, dataType, categories, usingOms, usingServiceBus, usingStorage, workspaceId, omsWorkspaceResourceId, serviceBusInformation, eventHubName, eventHubLocation, customerStorageAccountId, ['retention'], blobName

```

![image.png](/.attachments/image-437d6434-e547-49bf-8f6b-10904b81a158.png)

## Get All Settings for an Azure Subscription
This query will retrieve all the diagnostic settings that are currently configured for a given Azure subscription.

Copy and paste the following Kusto query into the query window and replace SUBSCRIPTIONIDGOESHERE with the desired Azure subscription id, then click **Run (F5)**.

:::template /.templates/Launch-Kusto.md
:::

```

let subId = "SUBSCRIPTIONIDGOESHERE";
RegistrationTelemetry
| where PreciseTimeStamp > ago(5d)
| where subscriptionId =~ subId
| summarize max(PreciseTimeStamp) by PreciseTimeStamp, todatetime(creationTimeDate), lastModifiedTimeDate, name, serviceIdentity, resourceId, dataType, categories, usingOms, usingServiceBus, usingStorage, workspaceId, omsWorkspaceResourceId, serviceBusInformation, eventHubName, eventHubLocation, customerStorageAccountId, ['retention'], blobName


```

**Example**:

```

let subId = "00000000-0000-0000-0000-000000000000";
RegistrationTelemetry
| where PreciseTimeStamp > ago(5d)
| where subscriptionId =~ subId
| summarize max(PreciseTimeStamp) by PreciseTimeStamp, todatetime(creationTimeDate), lastModifiedTimeDate, name, serviceIdentity, resourceId, dataType, categories, usingOms, usingServiceBus, usingStorage, workspaceId, omsWorkspaceResourceId, serviceBusInformation, eventHubName, eventHubLocation, customerStorageAccountId, ['retention'], blobName

```

![image.png](/.attachments/image-4a0550ee-d63c-41f5-8b8f-0f828ac8f0f5.png)

## Get All Settings for an Azure AD Tenant
This query will retrieve all the diagnostic settings that are currently configured for a given Azure Active Directory tenant.

Copy and paste the following Kusto query into the query window and replace TENANTIDGOESHERE with the desired Azure AD tenant id, then click **Run (F5)**.

:::template /.templates/Launch-Kusto.md
:::

```

let AADTenantId = "TENANTIDGOESHERE";
RegistrationTelemetry
| where PreciseTimeStamp > ago(5d)
| where tenantId =~ AADTenantId
| where isTenantLevel==true
| summarize max(PreciseTimeStamp) by PreciseTimeStamp, todatetime(creationTimeDate), lastModifiedTimeDate, name, serviceIdentity, resourceId, dataType, categories, usingOms, usingServiceBus, usingStorage, workspaceId, omsWorkspaceResourceId, serviceBusInformation, eventHubName, eventHubLocation, customerStorageAccountId, ['retention'], blobName


```
**Example:**

```

let AADTenantId = "00000000-0000-0000-0000-000000000000";
RegistrationTelemetry
| where tenantId =~ AADTenantId
| where isTenantLevel==true
| summarize max(PreciseTimeStamp) by PreciseTimeStamp, todatetime(creationTimeDate), lastModifiedTimeDate, name, serviceIdentity, resourceId, dataType, categories, usingOms, usingServiceBus, usingStorage, workspaceId, omsWorkspaceResourceId, serviceBusInformation, eventHubName, eventHubLocation, customerStorageAccountId, ['retention'], blobName

```

![image.png](/.attachments/image-3587e512-3655-4161-8892-e29ec0dd45d4.png)

## Get All Settings Writing to a Log Analytics Workspace
This query will retrieve all the diagnostic settings that are currently configured to write to a given Azure Monitor Log (Log Analytics) workspace.

Copy and paste the following Kusto query into the query window and replace LOGANALYTICSWORKSPACEIDGOESHERE with the desired Azure Monitor Log (Log Analytics) workspace id, then click **Run (F5)**.

:::template /.templates/Launch-Kusto.md
:::

```

let wkspId = "LOGANALYTICSWORKSPACEIDGOESHERE";
RegistrationTelemetry
| where PreciseTimeStamp > ago(3d)
| where workspaceId =~ wkspId
| where usingOms==1
| summarize max(PreciseTimeStamp) by todatetime(creationTimeDate), todatetime(lastModifiedTimeDate), name, subscriptionId, serviceIdentity, resourceId, dataType, categories, usingOms, omsWorkspaceResourceId

```

**Example:**

```

let wkspId = "65b9fc60-7793-4b13-94f2-8cd9084b959d";
RegistrationTelemetry
| where PreciseTimeStamp > ago(3d)
| where workspaceId =~ wkspId
| where usingOms==1
| summarize max(PreciseTimeStamp) by todatetime(creationTimeDate), todatetime(lastModifiedTimeDate), name, subscriptionId, serviceIdentity, resourceId, dataType, categories, usingOms, omsWorkspaceResourceId

```

![image.png](/.attachments/image-10ff939f-e56c-4b55-8ddc-44f613c786fb.png)

## Get All Settings Writing to an Azure Storage Account
This query will retrieve all diagnostic settings that are currently configured to write to a given Azure Storage Account.

Copy and paste the following Kusto query into the query window and replace STORAGEACCOUNTRESOURCEIDGOESHERE with the desired Azure Storage Account resource id, then click **Run (F5)**.

:::template /.templates/Launch-Kusto.md
:::

```

let storageAcctId = "STORAGEACCOUNTRESOURCEIDGOESHERE";
RegistrationTelemetry
| where PreciseTimeStamp > ago(3d)
| where customerStorageAccountId =~ storageAcctId
| where usingStorage==1
| summarize max(PreciseTimeStamp) by todatetime(creationTimeDate), todatetime(lastModifiedTimeDate), name, subscriptionId, serviceIdentity, resourceId, dataType, categories, usingStorage,customerStorageAccountId
```

**Example:**

```

let storageAcctId = "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/TestingVMs/providers/Microsoft.Storage/storageAccounts/*******testingvmsdiags";
RegistrationTelemetry
| where PreciseTimeStamp > ago(3d)
| where customerStorageAccountId =~ storageAcctId
| where usingStorage==1
| summarize max(PreciseTimeStamp) by todatetime(creationTimeDate), todatetime(lastModifiedTimeDate), name, subscriptionId, serviceIdentity, resourceId, dataType, categories, usingStorage,customerStorageAccountId
```

![image.png](/.attachments/image-d000f2a5-e603-4472-be65-fef79fa718d7.png)

## Get All Settings Writing to an Azure Event Hub
This query will retrieve all diagnostic settings that are currently configured to write to a given Azure Event Hubs namespace.

Copy and paste the following Kusto query into the query window and replace EVENTHUBSNAMESPACENAMEGOESHERE with the desired Azure Event Hubs namespace, then click **Run (F5)**.

:::template /.templates/Launch-Kusto.md
:::

```

let eventHubsNamespace = "EVENTHUBSNAMESPACENAMEGOESHERE";
RegistrationTelemetry
| where PreciseTimeStamp > ago(3d)
| where serviceBusInformation startswith strcat("Endpoint=sb://", eventHubsNamespace)
| where usingServiceBus==1
| summarize max(PreciseTimeStamp) by todatetime(creationTimeDate), todatetime(lastModifiedTimeDate), name, subscriptionId, serviceIdentity, resourceId, dataType, categories, usingServiceBus,eventHubAuthorizationRuleId,eventHubName
```

**Example:**

```

let eventHubsNamespace = "eventhubtest1";
RegistrationTelemetry
| where PreciseTimeStamp > ago(3d)
| where serviceBusInformation startswith strcat("Endpoint=sb://", eventHubsNamespace)
| where usingServiceBus==1
| summarize max(PreciseTimeStamp) by todatetime(creationTimeDate), todatetime(lastModifiedTimeDate), name, subscriptionId, serviceIdentity, resourceId, dataType, categories, usingServiceBus, eventHubAuthorizationRuleId,eventHubName
```

![image.png](/.attachments/image-29fff319-cdf6-4645-b09d-921ec7e83f44.png)

