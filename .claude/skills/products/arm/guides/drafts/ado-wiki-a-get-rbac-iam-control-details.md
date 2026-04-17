---
source: ado-wiki
sourceRef: "Supportability/AzureDev/AzureDev:/Shared/Tools/Get RBAC (IAM control) Details"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/AzureDev?pagePath=/Shared/Tools/Get%20RBAC%20(IAM%20control)%20Details"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Get RBAC (IAM control) Details

Tags: RBAC, JarvisAction, ASC

## Overview

This Wiki introduces how to get RBAC detail for single user/principal

## Required Information

- **Resource URI**.
- **User email** or User **Object ID**.
- **Tenant ID** or **Name**.

## Get Object ID via Azure Support Center

1. Go to [Azure Support Center](https://azuresupportcenter.msftcloudes.com/)
2. In Tenant Explorer (renamed from Azure AD Explorer) -> User, Search by user email or object ID

## Get User/Group/Application Role Assignment

### via Jarvis Action

Sample query https://jarvis-west.dc.ad.msft.net/9E9F7980

### via ASC

1. Go to Resource Explorer -> Subscription -> Access Control
2. Use the object ID to query the Role Assignments

### Sample data

```json
{
    "value": [
        {
            "properties": {
                "roleDefinitionId": "/subscriptions/{sub-id}/providers/Microsoft.Authorization/roleDefinitions/{role-def-id}",
                "principalId": "{principal-id}",
                "scope": "/subscriptions/{sub-id}/resourceGroups/{rg}/providers/Microsoft.Storage/storageAccounts/{sa}",
                "createdOn": "2019-03-26T03:03:19.1451173Z",
                "updatedOn": "2019-03-26T03:03:19.1451173Z",
                "createdBy": "{creator-id}",
                "updatedBy": "{updater-id}"
            },
            "id": "/subscriptions/{sub-id}/resourceGroups/{rg}/providers/Microsoft.Storage/storageAccounts/{sa}/providers/Microsoft.Authorization/roleAssignments/{assignment-id}",
            "type": "Microsoft.Authorization/roleAssignments",
            "name": "{assignment-id}"
        }
    ]
}
```

## Get Role Definition

### via Jarvis Action

How to check Subscription Role Definitions? sample query: https://jarvis-west.dc.ad.msft.net/2813A9D0

Please compare whether the user role of the backend is consistent with the client configuration. Otherwise, please re-add the roles that are not available.

### via ASC

Use above ASC Access Control page, scroll down to get the Role Definition details

> **NOTE**: some built-in (MSFT shared) role may not be seen here, so you need to use the Role Definition ID to query in Azure Portal.
