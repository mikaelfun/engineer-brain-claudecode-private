---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Resource Manager (ARM)/Architecture/Role-Based Access Control/RBAC evaluation on ARM"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=/[ARM] Azure Resource Manager (ARM)/Architecture/Role-Based Access Control/RBAC evaluation on ARM"
importDate: "2026-04-05"
type: troubleshooting-guide
---

[[_TOC_]]

## Evaluation flow
This diagram covers the main steps involved in ARM evaluation:

1. An user (or service principal) acquires a token for Azure Resource Manager from AAD
2. The token includes the user's group memberships (including transitive group memberships)
3. The user makes a REST API call to Azure Resource Manager with the token attached
4. Azure Resource Manager retrieves all the role assignments and deny assignments that apply to the resource upon which the action is being taken
5. Azure Resource Manager narrows the role assignments that apply to this user or their group and determines what roles the user has for this resource
6. Azure Resource Manager determines if the action in the API call is included in the roles the user has for this resource
7. Check If the user has a role with the action at the requested scope → False = Access denied (403), True → check deny assignment
8. Check if deny assignment applies → True = Access denied, False = Access granted

## ARM operation
ARM determines the operation a principal is executing based on the REST API method and the URL.

The method indicates whether the user is writing, reading, deleting, or executing an action against a resource. The URL provides information about the scope, the resource type and in some cases (for POST requests) the action being executed on a resource.

## Authorization action
After filtering down all role assignments that apply for the security principal/scope, ARM needs to look at the operation the user is executing against the role definitions in those role assignments to determine if access can be granted.

In most cases, the operation the customer is executing will match the operation required in the role definition for authorization to be granted, but RPs can customize this in their manifest by mapping authorization to a different action. Example from Microsoft.Resources RP manifest:
```json
"authorizationActionMappings": [
    {
        "original": "Microsoft.Resources/subscriptions/resourceGroups/exportTemplate/action",
        "desired": "Microsoft.Resources/subscriptions/resourceGroups/read"
    }
],
```

For troubleshooting purposes, use the **authorizationAction** column in **HttpIncomingRequests** table to identify the action ARM validated on RBAC.

## Linked Access Checks
There are operations on certain resources that require the user to have authorization on another resource id. For example, attaching a NIC to a VM requires `Microsoft.Network/networkInterfaces/join/action` permissions on the NIC itself.

RPs declare this in their resource provider manifest:
```json
"linkedAccessChecks": [
    {
        "actionName": "Microsoft.Compute/virtualMachines/write",
        "linkedProperty": "properties.networkProfile.networkInterfaces[*].id",
        "linkedAction": "Microsoft.Network/networkInterfaces/join/action"
    }
]
```

## ARM permissions caching
When a user executes an operation against ARM, the permissions for that user are cached on the instance the request arrived to.

The cache is refreshed on two scenarios:
- 30 minutes have passed since the cache was created.
- The token the user used to authenticate has been renewed.

This means that permissions recently assigned will not be effective right away, and the user can either wait up to 30 minutes, or log out/log in to renew its token and get a fresh cache.

Permissions caching is done on specific ARM instances — hitting another instance will cause the permissions to be cached freshly from storage.
