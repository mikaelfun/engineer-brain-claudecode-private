---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Workbooks/Troubleshooting Guides/Recovering an Azure Workbook"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FInsights%2C%20Workbooks%20and%20Managed%20Products%2FWorkbooks%2FTroubleshooting%20Guides%2FRecovering%20an%20Azure%20Workbook"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Recovering an Azure Workbook

## Symptom
Customer submits a case asking to restore a deleted Azure Workbook.

## Prerequisites
1. The Workbook must have been deleted in the last 30 days.
2. If the customer deleted the Resource Group, that must be recreated first.
3. Check if the customer is using the [bring your own storage feature](https://learn.microsoft.com/azure/azure-monitor/visualize/workbooks-bring-your-own-storage) - a different process is needed if so.

## Process

### Option 1: Workbooks Recycle Bin
A new feature in Azure Workbooks enables the Workbooks Recycle Bin to restore previously deleted Azure Workbooks: [Workbooks Recycle Bin](https://aka.ms/workbooks-recyclebin)

After loading the link, the customer will have to:
1. Choose the subscription that the Workbooks were under
2. Select the check box next to each Workbook to restore (one at a time)
3. Click the restore button on the top bar
4. Check after a few minutes to confirm the Workbook is available

### Option 2: Restore With ICM
1. Determine when the resources were deleted (usually provided in the support case)
2. Obtain the Resource ID of the Workbook. Obtaining the region is desirable but not necessary.
3. Double check the SAP of the case to ensure it's under Azure Workbooks and submit ICM.
4. Product Group will take steps to restore the Workbook back to the Subscription.

### Option 3: Restore When Customer Uses Bring Your Own Storage
If the customer has opted to save Workbooks in their Storage Account:
1. Engage the Storage team via collab requesting to restore the Storage Account.
2. Validate with customer that Workbooks have been restored.
