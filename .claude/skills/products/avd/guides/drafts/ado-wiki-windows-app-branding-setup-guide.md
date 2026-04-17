---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Sandbox/In-Development Content/Windows App Branding/Setup Guide"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Sandbox/In-Development%20Content/Windows%20App%20Branding/Setup%20Guide"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Windows App Branding - Setup Guide

## Admin - Windows 365 (Intune)
1. Sign in to Intune admin center
2. Navigate to Devices > Windows 365 > Settings
3. Create a new Windows App Settings policy
4. Configure branding fields (company name, logo, colors, support info, URLs)
5. Assign policy to users or groups
6. Review and create

## Admin - Azure Virtual Desktop
1. Sign in to Azure Portal
2. Navigate to Azure Virtual Desktop > Windows App settings
3. Create Windows App Settings object with unique rank
4. Configure branding properties
5. Assign users or groups
6. Save configuration

## CSS Verification Checklist
- Policy is assigned to affected user
- No conflicting higher-priority policy exists
- Branding fields meet size and format requirements
- User has signed in after policy creation
