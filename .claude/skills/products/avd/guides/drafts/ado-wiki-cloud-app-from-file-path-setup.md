---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Sandbox/In-Development Content/Cloud App from File Path/Setup Guide"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Sandbox/In-Development%20Content/Cloud%20App%20from%20File%20Path/Setup%20Guide"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Cloud App from File Path — Setup Guide

## Step-by-step (Admin perspective)

1. Navigate to Intune Admin Center > Windows 365 > Cloud Apps
2. Select Add app > From file path
3. Enter required properties:
   - File path
   - App name
   - Display name (must be unique)
   - Icon path and index
4. (Optional) Enter command-line arguments and description
5. Select Add
6. System validates file and icon paths
7. App status transitions to Ready to publish

## What CSS should verify

- File path exists on Cloud PC
- Icon path is valid and renders correctly
- App status is not stuck in validation

## What good looks like

- App appears in Cloud Apps list
- Status = Ready to publish / Published
- Icon renders correctly or default icon is shown
