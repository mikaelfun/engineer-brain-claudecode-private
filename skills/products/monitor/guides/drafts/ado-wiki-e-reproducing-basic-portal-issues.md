---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Common Concepts/Reproducing Basic Portal issues"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FCommon%20Concepts%2FReproducing%20Basic%20Portal%20issues"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Reproducing Basic Portal Issues

## When to Use

Customer reports portal issues such as:
- Blade stuck during loading
- User Experience issues related to basic portal functionality
- But you cannot reproduce the issue

## Root Cause

Internal users may be routed to `ms.portal.azure.com` which could point to a stage not yet deployed.

## Steps

1. Navigate to the following URL to use the latest production portal:
   ```
   https://portal.azure.com/?feature.customportal=false&feature.canmodifystamps=true&Microsoft_Azure_Monitoring_Logs=stage1&Microsoft_OperationsManagementSuite_Workspace=stage1
   ```
   An orange banner will appear at the top confirming you're on the latest stage.

2. Try to reproduce the issue again.

3. If issue still persists:
   - Try different browsers (Chrome, Firefox, Edge)
   - Clear browser cache and reload
   - Collect HAR trace: https://learn.microsoft.com/azure/azure-portal/capture-browser-trace
   - Copy the full URL from the browser showing the issue
   - Contact TL and/or EE for next steps
