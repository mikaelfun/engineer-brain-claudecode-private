---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/🔄Workflows/Deployment Failures/Deployment fails with "template validation" error"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop?pagePath=%2F%F0%9F%94%84Workflows%2FDeployment%20Failures%2FDeployment%20fails%20with%20%22template%20validation%22%20error"
importDate: "2026-04-24"
type: guide-draft
---

# AVD Deployment: Template Validation Failure Troubleshooting

## Overview
When AVD deployment fails with a template validation error, the ARM template could not pass validation before resource creation. The root cause varies and must be identified from the detailed error message.

## Diagnostic Options

### Option 1: ASC
1. Open ASC > enter case number > Resource Explorer
2. Select customer Subscription > Operations > RDFE Operations
3. Use correlation ID, deployment ID, or resource group name to find the failure
4. Expand the error to see why validation failed

### Option 2: Portal Error Message
1. Ask customer to click the error message in the Azure Portal deployment
2. Review the Summary and Raw Error sections for the specific failure reason

### Option 3: Activity Log
1. Azure Portal > Activity Log
2. Filter for "Validate Deployment" failures (select the red icon entry)
3. Click JSON > scroll to statusMessage for the detailed error

## Important Notes
- Some resources may already be created (host pool, workspace, availability set, application group)
- If starting over, customer may need to delete these resources first for a clean deployment
- The specific resolution depends entirely on the validation error message found through the diagnostic steps above
