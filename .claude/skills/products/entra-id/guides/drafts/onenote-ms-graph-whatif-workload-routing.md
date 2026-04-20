---
title: MS Graph API Workload Routing via $whatif
source: onenote
sourceRef: Mooncake POD Support Notebook/POD/VMSCIM/4. Services/Azure AD _ Ms Entra ID/Dev/MS Graph API/Scope.md
product: entra-id
created: 2026-04-18
---

# MS Graph API Workload Routing via $whatif

## Overview
When troubleshooting Microsoft Graph API issues, it is critical to identify which backend workload handles a specific API call. This determines the correct owning support team.

## Using $whatif Parameter

Append `$whatif` to any Graph API call URL to reveal the backend workload routing:

### Simple query (no existing query params)
```
GET https://graph.microsoft.com/v1.0/users?$whatif
```

Response shows:
```json
{
  "Description": "Execute HTTP request",
  "Uri": "https://graph.windows.net/v2/{tenantId}/users(...)",
  "HttpMethod": "GET",
  "TargetWorkloadId": "Microsoft.DirectoryServices"
}
```

### With existing query params (use & instead of ?)
```
GET https://graph.microsoft.com/v1.0/users/{upn}?$select=displayName,birthday&$whatif
```

Response may show multiple workloads when properties span different backends:
- `displayName` → Microsoft.DirectoryServices
- `birthday` → Microsoft.SharePoint

## Finding the Owning Support Team

After identifying the workload, refer to:
- [MS Graph Support Boundaries Wiki](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/473410/Microsoft-Graph-Support-Boundaries)
- Owning team by workload section in the wiki

## Key Takeaway
If a Graph API issue involves multiple properties, the problem may be in a different workload than expected. Always use $whatif to confirm.
