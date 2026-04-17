---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Advisor/How Tos/Service retirement"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Azure%20Advisor/How%20Tos/Service%20retirement"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Summary
Guide for assisting engineers when customers request to identify which resources will be deprecated/retired. Even if email notifications are sent to subscription owners, sometimes the case-opening engineer doesn't have visibility.

## Using Service Retirement Workbook

### Steps
1. Navigate to Azure Portal, search **Advisor** from the top search input
2. Access Advisor, find **Workbooks** section below
3. Select **Service Retirement (Preview)**

### Direct Link
Also available via: [Azure updates | Microsoft Azure](https://azure.microsoft.com/en-us/updates/) - updates posted weekly.

### Views Available

| View | Description |
|------|-------------|
| **Impacted Services** | Shows services with resource-level impact analysis |
| **All Services** | Retiring Azure services (no resource-level impact analysis) |
| **Retired Services** | Retired Azure Services and Features (Post February 2024) |

### Filtering
- Filter by subscription from the subscription filter dropdown
- Use the search bar above the table to filter by specific service
- Table shows: resource type, retiring service/feature, retirement date, and impact details
