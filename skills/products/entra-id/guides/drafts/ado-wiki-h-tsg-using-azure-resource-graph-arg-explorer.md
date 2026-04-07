---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/General Guidance/TSG Using Azure Resource Graph (ARG) Explorer"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FGeneral%20Guidance%2FTSG%20Using%20Azure%20Resource%20Graph%20(ARG)%20Explorer"
importDate: "2026-04-05"
type: troubleshooting-guide
---

[The Azure Resource Graph (ARG) Explorer](https://learn.microsoft.com/en-us/azure/governance/resource-graph/first-query-portal) is customer facing feature that allows customers to quickly query their Azure resources using a Kusto experience.

It is also available to support in Azure Support Center's Resource Explorer and can be very helpful for querying various customer resources when you may not know where they are located or what to search for etc. Below are a couple helpful examples of queries that can assist Entra Identity Management team.

# Accessing ASC's ARG Query Explorer

1. From Azure Support Center, open the Azure Resource Explorer blade
2. Add or verify the customer subscription is available, and click the subscription root node
3. Locate the **ARG Query Editor** tab to open the query explorer experience for the subscription
4. Copy and paste an example query from the examples below to your query editor and then choose **Run Query**
5. Inspect the results section for the results of your query and viewing the columns your query requested

# Example ARG Queries By Scenario

## Find a Key Vault's Full ARM properties

```json
resources
| where type == "microsoft.keyvault/vaults"
| where name contains "MyKeyVault"
| project id, properties
```

## Find Managed Identities

Locate any resource where a managed identity named "MyUAMI" was assigned
```json
resources
| where identity contains "MyUAMI"
| project id, identity, properties
```

Get the properties of a VM named "VM01" and inspect what managed identity has been assigned to it:
```json
resources
| where id contains "VM01"
| project id, identity, properties
```

## Find any Resource's ARM properties by searching for it's name
```json
resources
| where name contains "contosoresource"
| project id, properties
```

## Find any resource change operations by resource
```json
resourcechanges
| where id has "/subscriptions/abc1234-a1234-4063-b1b4-4c2e50dd64da/resourceGroups/myresourcegroup/providers/Microsoft.KeyVault/vaults/mykeyvaultname"
| extend timestamp = dynamic_to_json(properties.changeAttributes.timestamp)
| extend changedBy = dynamic_to_json(properties.changeAttributes.changedBy)
| extend changeType = dynamic_to_json(properties.changeType)
| extend changes = dynamic_to_json(properties.changes)
| project timestamp, changedBy, changeType, changes
```

## Get RBAC Role Assignments

List all role assignments at all scopes of a subscription
```json
authorizationresources
| where type == "microsoft.authorization/roleassignments"
| extend scope = tostring(properties['scope'])
| extend principalType = tostring(properties['principalType'])
| extend principalId = tostring(properties['principalId'])
| extend roleDefinitionId = tolower(tostring(properties['roleDefinitionId']))
| mv-expand createdOn = parse_json(properties).createdOn
| mv-expand updatedOn = parse_json(properties).updatedOn
| project createdOn, updatedOn, principalId, principalType, scope, roleDefinitionId
```

Find only role assignments for a specific user principal object ID
```json
authorizationresources
| where type == "microsoft.authorization/roleassignments"
| extend scope = tostring(properties['scope'])
| extend principalType = tostring(properties['principalType'])
| extend principalId = tostring(properties['principalId'])
| extend roleDefinitionId = tolower(tostring(properties['roleDefinitionId']))
| mv-expand createdOn = parse_json(properties).createdOn
| mv-expand updatedOn = parse_json(properties).updatedOn
| where principalId == "abc123fc-aea1-4ef2-9ab6-b2756f9d9d18"
| project createdOn, updatedOn, principalId, principalType, scope, roleDefinitionId
```

Find all role assignments under a specific scope
```json
Authorizationresources
| where type == "microsoft.authorization/roleassignments"
| extend scope = tostring(properties['scope'])
| extend principalType = tostring(properties['principalType'])
| extend principalId = tostring(properties['principalId'])
| extend roleDefinitionId = tolower(tostring(properties['roleDefinitionId']))
| mv-expand createdOn = parse_json(properties).createdOn
| mv-expand updatedOn = parse_json(properties).updatedOn
| where scope contains "/subscriptions/ed6a63cc-c71c-4bfa-8bf7-c1510b559c72/resourceGroups/VerifiableCreds"
| project createdOn, updatedOn, principalId, principalType, scope, roleDefinitionId
```

Find any role assignments at any scope for a custom role definition ID
```json
authorizationresources
| where type == "microsoft.authorization/roleassignments"
| extend scope = tostring(properties['scope'])
| extend principalType = tostring(properties['principalType'])
| extend principalId = tostring(properties['principalId'])
| extend roleDefinitionId = tolower(tostring(properties['roleDefinitionId']))
| where roleDefinitionId contains "abc70f01-a0cb-4f64-b0da-5fdd0df3e5cd"
| mv-expand createdOn = parse_json(properties).createdOn
| mv-expand updatedOn = parse_json(properties).updatedOn
| project createdOn, updatedOn, principalId, principalType, scope, roleDefinitionId
```

Find any role assignments created in the last 1 hour
```json
authorizationresources
| where type == "microsoft.authorization/roleassignments"
| extend scope = tostring(properties['scope'])
| extend principalType = tostring(properties['principalType'])
| extend principalId = tostring(properties['principalId'])
| extend roleDefinitionId = tolower(tostring(properties['roleDefinitionId']))
| mv-expand createdOn = parse_json(properties).createdOn
| mv-expand updatedOn = parse_json(properties).updatedOn
| where createdOn >= ago(1h)
| project createdOn, updatedOn, principalId, principalType, scope, roleDefinitionId
```

## Find Support Cases

Find all support cases open and closed opened under a subscription
```json
SupportResources
| where type =~ 'Microsoft.Support/supportTickets'
| extend TicketId = dynamic_to_json(properties.SupportTicketId)
| extend ProblemClassificationId = dynamic_to_json(properties.ProblemClassificationId)
| extend Title = dynamic_to_json(properties.Title)
| extend Status = dynamic_to_json(properties.Status)
| extend ServiceId = dynamic_to_json(properties.ServiceId)
| project TicketId, Status, Title, ProblemClassificationId, ServiceId
```

# Other resources
* [Public docs for Azure Resource Graph](https://learn.microsoft.com/en-us/azure/governance/resource-graph/first-query-portal)
* [Understanding the query language and other tables supported](https://learn.microsoft.com/en-us/azure/governance/resource-graph/concepts/query-language)
* [Supported tables](https://learn.microsoft.com/en-us/azure/governance/resource-graph/reference/supported-tables-resources)
