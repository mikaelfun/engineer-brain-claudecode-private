---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD Roles and Administrators/AAD Roles CSV Export (All, Groups, Users, Service Principals) powershell script"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20Roles%20and%20Administrators%2FAAD%20Roles%20CSV%20Export%20%28All%2C%20Groups%2C%20Users%2C%20Service%20Principals%29%20powershell%20script"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# AAD Roles CSV Export (All, Groups, Users, Service Principals) PowerShell Script

## Overview

Script to export all AAD Role assignments for Groups, Users, and Service Principals to CSV. Use cases:
- Auditing current AAD role assignments
- Backing up role assignments before making changes
- Restoring role assignments after accidentally deleting a security group

Combined with the Group/Group membership/Group Attributes script and the UI RBAC Script, can fully rebuild a deleted security group and restore all AAD + RBAC roles.

## Usage

Requires AzureAD or AzureADPreview PowerShell module.

1. Download script "UI Export AAD Roles v3.ps1" (distributed as .ps1.txt; remove .txt extension)
2. From PowerShell: `& ".\UI AAD Roles CSV report.ps1"` (the & prefix is required)
3. Sign in, then select export type: All Roles / All Groups / All Users / All Service Principals
4. Click OK; when complete, save the generated CSV file

## Related Export Scripts

- UI Export Azure RBAC Roles for Resources to CSV: https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/471467
- CLI Export RBAC Assigned Roles: https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/587865
