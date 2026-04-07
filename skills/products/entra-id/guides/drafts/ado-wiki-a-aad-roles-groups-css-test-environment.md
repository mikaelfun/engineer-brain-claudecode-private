---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD Roles and Administrators/AAD Roles and Administrator (Groups and Users based on RAs) w groups assigned to each AAD Role"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20Roles%20and%20Administrators%2FAAD%20Roles%20and%20Administrator%20%28Groups%20and%20Users%20based%20on%20RAs%29%20w%20groups%20assigned%20to%20each%20AAD%20Role"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# AAD Roles and Administrator - Create Test Users/Groups for Every AAD Role (CSS Engineers)

## Overview

PowerShell script for **CSS Support Engineers** to create a complete test environment with a user and group for every AAD Role. Enables CSS engineers to sign in as a specific role holder to reproduce customer issues.

### What the Script Does

For each AAD Role in the tenant, the script:
1. Creates a test User: `UsrRole{RoleName}` (e.g., `UsrRoleSharePointAdministrator`)
2. Creates a Group: `AAD ROLE Group {RoleName}` (mail nickname: `AADRoleGRP_{RoleName}`)
3. Adds the user as a member of the group
4. Assigns the group to the corresponding AAD Role

## Prerequisites

```powershell
$tenantid = "your tenantid"
$onmsftname = "@yourtenantdomainname.onmicrosoft.com"
```

Requires AzureAD or AzureADPreview module.

## Usage Notes

- Some deprecated/unused AAD roles may return errors - ignore these, they do not affect valid role creation
- After creation, search for "AAD Role Group" or "USRRole" in portal Users/Groups blades to find test objects quickly
- Users can view assigned roles in the Group's "Assigned roles" blade in Azure Portal
