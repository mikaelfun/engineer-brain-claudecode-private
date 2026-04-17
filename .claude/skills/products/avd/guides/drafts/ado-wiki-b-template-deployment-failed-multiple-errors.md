---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Workflows/Deployment Failures/The template deployment failed with multiple errors"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/467783"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# The template deployment failed with multiple errors

## Troubleshooting

### Option 1 - ASC
1. Open ASC -> enter case number -> go to Resource Explorer
2. Select the customer's Subscription -> Operations -> RDFE Operations
3. Identify failure using correlation ID (from Summary Error/Raw Error), deployment ID, or resource group name
4. Expand error and review to determine why the validation failed

### Option 2 - Customer Error Details
1. Ask the customer to click the error message in Azure Portal
2. Review the Summary and Raw Error - typically this will tell you why failed
- Note: Some resources may have already been created (host pool, workspace, availability set, application group). If starting over, delete these first for a clean installation.

### Option 3 - Activity Log
1. Ask customer to login to Azure Portal and go to Activity Log
2. Look for "Validate Deployment" failures (select the operation with the red icon)
3. On the right side select "JSON" and scroll to "statusMessage" for more information about the actual issue
