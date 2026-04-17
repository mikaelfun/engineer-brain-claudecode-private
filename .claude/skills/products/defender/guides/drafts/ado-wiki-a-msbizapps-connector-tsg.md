---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Data Ingestion - Connectors/Microsoft First Party Connectors/[TSG] - MsBizApps"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=%2FMicrosoft%20Sentinel%20Wiki%2FData%20Ingestion%20-%20Connectors%2FMicrosoft%20First%20Party%20Connectors%2F%5BTSG%5D%20-%20MsBizApps"
importDate: "2026-04-07"
type: troubleshooting-guide
---

Full TSG can be found [here](https://microsofteur-my.sharepoint.com/:w:/g/personal/wiking_microsoft_com/EVlv8567R5ZJlF_y2RQrWZcBGaVGaWJM3eO2wKFZ82C24w?e=nXDKOm).

# Activity Logs Data Collection

Tables in scope:
* [Dynamics365Activity](https://learn.microsoft.com/en-us/power-platform/admin/enable-use-comprehensive-auditing)
* [PowerAppsActivity](https://learn.microsoft.com/en-us/power-platform/admin/logging-powerapps)
* [PowerAutomateActivity](https://learn.microsoft.com/en-us/power-platform/admin/logging-power-automate)
* [PowerPlatformConnectorActivity](https://learn.microsoft.com/en-us/power-platform/admin/connector-events-power-platform)
* [PowerPlatformDlpActivity](https://learn.microsoft.com/en-us/power-platform/admin/dlp-activity-logging)
* [PowerPlatformAdminActivity](https://learn.microsoft.com/en-us/power-platform/admin/admin-activity-logging)
* [DataverseActivity](https://learn.microsoft.com/en-us/power-platform/admin/enable-use-comprehensive-auditing)

# DataverseActivity vs Dynamics365Activity

These tables are the same, although the `Dynamics365Activity` table has been around longer and will be deprecated, replaced by `DataverseActivity` which reflects the rebranding of Power Platform. `DataverseActivity` also supports DCR whereas the former only supports workspace based transformation. Customer should migrate to `DataverseActivity` for continued support.

## No data is collected

1. Check the customer is eligible for, and has turned on, the Microsoft Purview Audit log. This is the unified audit log available in [https://security.microsoft.com](https://security.microsoft.com/). If this log has not been activated, or the customer does not enable at least one Office 365 license, then no data can be collected by Sentinel.
2. In case of the `DataverseActivity` table, then verify the following:
   * Customer is using a Production Dataverse instance.
   * Customer has turned on auditing at global level.
   * Customer has turned on auditing at entity and field level.
   * In case of read/retrieval events such as export to excel, they need to enable retrieve and retrievemultiple auditing at the entity and field level. More information can be found in the Sentinel Solution for Power Platform documentation.

## Some data is missing or incorrect in Sentinel

The source of truth for the tables in scope is the Microsoft Purview Audit log. If the customer reports that certain fields are missing in the data, we first need to ask them to verify if the data is showing up in Purview. If the data is not showing up in Purview, the ticket must be routed to the Dynamics team as this issue is not Sentinel related.

Ask them to verify by following these steps:

1. Navigate to Microsoft Purview Audit log within [https://security.microsoft.com](https://security.microsoft.com/)
2. Create a new audit log search, setting the filters based on the timestamp of the affected audit log record in Sentinel. They can narrow the workload further by selecting the workload (Dynamics365 or DataverseActivity is `CRM`), the time, and the user account.
3. Open the details of the audit log and check the data is correct here. The data should be the same as Sentinel. If Sentinel has different data, then escalate to engineering, otherwise, send to Dynamics queue.

# Power Platform Inventory Data Collection

The Power Platform Inventory data connector uses a customer deployed Azure Function App. The data connector collects data from the customer's Azure Storage account which is used by the Power Platform Self Service Analytics feature.

## No data is being collected

1. Validate the Self-Service Analytics feature is configured properly, check there is data within the storage account used by the customer. There should be a container called `powerplatform` and inside it, subfolders with .json files. If this is not the case, make sure the customer has followed [Microsoft Power Platform self-service analytics export Power Platform inventory and usage data (preview)](https://learn.microsoft.com/en-us/power-platform/admin/self-service-analytics).
2. If there is data inside the storage account, then check the IAM blade of the storage account and make sure the System Assigned Managed Identity (MSI) of the Azure Function App has been granted the `Storage Blob Data Reader` role on the storage account. This is necessary otherwise the function app can not read the data.
3. Check permissions on the DCR. Make sure that the MSI of the Function App has been granted `Monitoring Metrics Publisher` role over the Microsoft-Sentinel-PPInventory-DCR within Data Collection Rules in the Azure portal. This is necessary otherwise no data can reach log analytics. Note that if the function had been previously triggered without this permission it may take up to 24 hours for the token refresh to receive the updated permissions.
4. Examine the Function App logs. Open the Function app in the portal and on the overview blade click on the `PowerPlatformInventoryDataConnector` function. Click on the monitoring blade and open the latest log entry. Check for any error messages in the logs.

## Some data is missing or incorrect

1. Ask the customer to check if the missing data is present in the Azure Storage account used for Self Service Analytics feature.
2. If the data is missing from the Storage Account, the ticket should be moved to the Power Platform team. If the data is present in the storage account but not collected, please raise an ICM and include screenshots of the missing data including file paths in storage and sample data that is missing.
