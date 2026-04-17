---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Troubleshooting Guides/MDO Permissions/TSG"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=%2FTroubleshooting%20Guides%2FMDO%20Permissions%2FTSG"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# MDO Permissions Troubleshooting Guide

## Purpose

Guide for troubleshooting RBAC permissions issues in Microsoft Defender portal and determining assigned permissions for specific admins.

## Step 1: Determine Permissions Type

Verify whether the customer uses Legacy RBAC or Defender XDR URBAC:

### Legacy RBAC
- **Indicator**: Email and Collaboration tab visible under Permissions in Defender portal
- **Tools**: Get-ManagementRole, Get-RoleGroup, Get-RoleGroupMember (EXO/S&C modules)
- **Assist365 SOPs**: RBAC Roles Diagnostic, Analyze RBAC Configuration, Compare RBAC Configuration

### Defender XDR URBAC
- **Indicator**: Email and Collaboration tab disappears; Microsoft Defender XDR appears under Permissions
- **Check**: Access Permissions > Microsoft Defender XDR > Workloads to see if MDO is active
- **Note**: Assist365 cannot retrieve XDR permissions; must use HAR logs

## Step 2: Check Permissions via HAR Logs

### URBAC Status Check
If URBAC is enabled for MDO and ExO workloads, ExO RBAC is not used for ExO operations in MDO portal.

Check in HAR: GET /api/v2/auth/GetCachedRoles?refreshCache=false, look for `urbacStatus:mdo` and `urbacStatus:exo`.

Console check: `await $host.auth.isInRoles(["urbacStatus:mdo","urbacStatus:exo"])`

### TenantContext
Search for **TenantContext (TenantContext?realTime)** in HAR. Expand Auth Info > Mtp Permissions > Oatp Permissions for MDO roles.

### Microsoft Entra Roles (DirRoles)
Check "Dir Roles" in HAR response. Common role GUIDs:
- **Global Administrator**: 62e90394-69f5-4237-9190-012177145e10
- **Security Administrator**: 194ae4cb-b126-40b2-bd5b-6091b380977d
- **Security Reader**: 5d6b6bb7-de71-4623-b4af-96380a352509
- **Security Operator**: 5f2222b1-57c3-48ba-8ad5-d4759f1fde6f
- **Global Reader**: f2ef992c-3afb-46b9-b7cf-a126ee74c451

### HAR Tool
[Microsoft HAR Analyzer](https://hartool.azurewebsites.net) - Insert HAR file > Detections > Edit Detections > Microsoft Defender for Office > Role Identifier.yaml > Run

### Fiddler
Open HAR in Fiddler > Search TenantContext?realTime > Inspectors > JSON (Response) > AuthInfo/Roles > MtpPermissions > Oatp

## Important Notes

- After configuring new Unified RBAC role and assigning it to users, remember to **activate** it
- PIM (Privileged Identity Management) assignments should be checked
- B2B/GDAP delegation status should be verified
- Engineering escalations must include full SecurityPermissions Checker output

## Engineering Escalation Checklist

Include in every permissions escalation:
1. Type of Permissions Assigned (Legacy/URBAC/Entra/PIM/B2B/GDAP)
2. DirRoles Assigned (from HAR logs)
3. Full SecurityPermissions Checker HTML report
