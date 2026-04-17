---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Cloud Sync/General/Cloud Sync Architecture Overview"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Sync%20Provisioning/Cloud%20Sync/General/Cloud%20Sync%20Architecture%20Overview"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD-Sync
---
:::template /.templates/Shared/MBIInfo.md
:::
   
# Cloud Sync Architecture Overview

This document explains the Cloud Sync architecture and demonstrates how to use Microsoft Graph queries to inspect each component. 
When a customer configures Cloud Sync for their on-premises domain (for example, contoso.com), the following resources and relationships are established in Microsoft Entra ID:

**1.Published Resource**

A new published resource with the identifier contoso.com is created under
onPremisesPublishingProfiles/provisioning/publishedResources

**2.Agent Group**

An Agent Group is created and associated with the contoso.com published resource.

- Each agent group is linked to exactly one published resource via its publishedResourceId.

**3.Agents**

An agent can belong to multiple agent groups and can serve across different provisioning scenarios (e.g., Cloud Sync and Workday provisioning).

One or more Agents can be added to an agent group.

**4.Service Principal**

A dedicated Service Principal is created in Entra ID for the provisioning configuration.
 
- One service principal per domain configuration.

- Each service principal can contain multiple synchronization jobs, each identified by a Job ID 
  (e.g., AD2AADProvisioning, AD2AADPasswordHash or AAD2ADProvisioning).
- Each Job has it's own schema.
- Each service principal has secret.
- You can retrieve the service principal secret and synchronization schema settings using Microsoft Graph.

# Graph Query Samples

The diagram below illustrates the hierarchy and Graph API endpoints used to retrieve configuration data for each component:

![cloud-sync-architecture-diagram](cloud-sync-architecture-diagram.png)

>    Note: You can also use Graph Explore in ASC to retrieve all these configuration settings for customer's tenant.
  

## List published resources

**Graph Query Sample**



     GET https://graph.microsoft.com/beta/onPremisesPublishingProfiles/provisioning/publishedResources/?expand=*


In ASC use:
```
onPremisesPublishingProfiles/provisioning/publishedResources/?expand=*
```

**Graph Query Response Sample**
- You will see the domain name in attribute displanname and resourcename
- You will find group agent under published resources which displayname is started with group-domain-xxxxxx
```

      "value": [
        {
            "id": "xxxxxx",
            "displayName": "contoso.com",
            "resourceName": "contoso.com",
            "publishingType": "provisioning",
            "agentGroups": [
                {
                    "id": "xxxxxx",
                    "displayName": "Group-contoso.com-xxxxxx",
                    "publishingType": "provisioning",
                    "isDefault": false
                }
            ]
        }
        
```
## List Agent Group  

**Graph Query Sample**

```
GET https://graph.microsoft.com/beta/onPremisesPublishingProfiles/provisioning/agentGroups/?$expand=*
```
In ASC use:
```
onPremisesPublishingProfiles/provisioning/agentGroups/?$expand=*
```

**Graph Query Response Sample**
- You will see the published resources and agents associated with this Agent Group.
- The displayname "Default group for AD Sync Fabric" indicates it is used for cloud sync.

```
    "value": [
        {
            "id": "xxxxxx",
            "displayName": "Group-contoso.com-xxxxxx",
            "publishingType": "provisioning",
            "isDefault": false,
            "agents": [
                {
                    "id": "xxxxxx",
                    "machineName": "cloudsync.contoso.com",
                    "externalIp": "xxx.xxx.xxx.xxx",
                    "status": "active",
                    "supportedPublishingTypes": [
                        "provisioning"
                    ]
                }
            ],
            "publishedResources": [
                {
                    "id": "xxxxxxx",
                    "displayName": "contoso.com",
                    "resourceName": "contoso.com",
                    "publishingType": "provisioning"
                }
            ]
        },
        {
            "id": "xxxxxx",
            "displayName": "Default group for AD Sync Fabric",
            "publishingType": "provisioning",
            "isDefault": true,
            "agents": [],
            "publishedResources": []
        }
    ]
```

## List Agents

**Graph Query Sample**
```
GET https://graph.microsoft.com/beta/onPremisesPublishingProfiles/provisioning/agents/?$expand=*
```

In ASC use:
```
onPremisesPublishingProfiles/provisioning/agents/?$expand=*
```
**Graph Query Response Sample**
- You can check machinename, external IP of the agent, also the status to check if it active.
- You will also find the agent group it is associated with. 

```     
     "value": [
        {
            "id": "xxxxxx",
            "machineName": "cloudsync.contoso.com",
            "externalIp": "xxx.xxx.xxx.xxx",
            "status": "active",
            "supportedPublishingTypes": [
                "provisioning"
            ],
            "agentGroups": [
                {
                    "id": "xxxxxx",
                    "displayName": "Group-contoso.com-xxxxxx",
                    "publishingType": "provisioning",
                    "isDefault": false
                },
                {
                    "id": "xxxxxx",
                    "displayName": "Default group for AD Sync Fabric",
                    "publishingType": "provisioning",
                    "isDefault": false
                }
            ]
        }
    ]
```

## List Service Principal (configuration):

**Graph Query Sample**
- Get service principal by filtering on premise domain name

```
GET https://graph.microsoft.com/v1.0/serviceprincipals?$filter=displayname eq 'contoso.com'
```

in ASC use:
```
serviceprincipals?$filter=displayname eq 'contoso.com'
```

**Graph Query Response Sample**

```
    "value": [
        {
            "id": "xxxxxx,
            "deletedDateTime": null,
            "accountEnabled": true,
            "alternativeNames": [],
            "appDisplayName": "contoso.com",
            "appDescription": null,
            "appId": "xxxxxx",
            "applicationTemplateId": "xxxxxx,
            "appOwnerOrganizationId": "xxxxxx",
            "appRoleAssignmentRequired": true,
            "createdDateTime": "2025-03-28T10:31:52Z",
            "description": null,
            "disabledByMicrosoftStatus": null,
            "displayName": "contoso.com",
            "homepage": "https://account.activedirectory.windowsazure.com:444/applications/default.aspx?metadata=AD2AADProvisioning|ISV9.1|primary|z",
            "loginUrl": null,
            "logoutUrl": null,
            "notes": null,
            "notificationEmailAddresses": [],
            "preferredSingleSignOnMode": null,
            "preferredTokenSigningKeyThumbprint": null,
            "replyUrls": [],
            "servicePrincipalNames": [
                xxxxxx"
        .....
        .....
        .....
            }
        }
    ]
```


## List Synchronization Job

**Graph Query Sample**

- Replace [spid] by the id returned in query List Service Principal above

```
GET https://graph.microsoft.com/v1.0/serviceprincipals/[spid]/synchronization/jobs?$filter=templateid eq 'AD2AADProvisioning'
```

In ASC use:
```
serviceprincipals/[spid]/synchronization/jobs?$filter=templateid eq 'AD2AADProvisioning'
```
**Graph Query Response Sample**

- You will see details of last execution and see if any error reported.
- You will also see quarantine details if it is quarantined.

```
        "value": [
        {
            "id": "AD2AADProvisioning.cabb4771b63143ff86f4983c475e61ae.af9b1615-1e82-4854-8dc4-4ff6027f700d",
            "templateId": "AD2AADProvisioning",
            "schedule": {
                "expiration": null,
                "interval": "PT20M",
                "state": "Active"
            },
            "status": {
                "countSuccessiveCompleteFailures": 0,
                "escrowsPruned": false,
                "code": "Active",
                "lastSuccessfulExecutionWithExports": null,
                "quarantine": null,
                "steadyStateFirstAchievedTime": "2025-06-17T09:20:28.4706449Z",
                "steadyStateLastAchievedTime": "2025-06-18T03:01:26.7971718Z",
                "troubleshootingUrl": "",
                "lastExecution": {
                    "activityIdentifier": "da115b40-a858-46b9-8f75-10965f0b1319",
                    "countEntitled": 0,
                    "countEntitledForProvisioning": 0,
                    "countEscrowed": 0,
                    "countEscrowedRaw": 11,
                    "countExported": 0,
                    "countExports": 0,
                    "countImported": 0,
                    "countImportedDeltas": 0,
                    "countImportedReferenceDeltas": 0,
                    "state": "Succeeded",
                    "error": null,
                    "timeBegan": "2025-06-18T03:01:17.6855592Z",
                    "timeEnded": "2025-06-18T03:01:26.7981716Z"
                },
                "lastSuccessfulExecution": {
                    "activityIdentifier": null,
                    "countEntitled": 0,
                    "countEntitledForProvisioning": 0,
                    "countEscrowed": 0,
                    "countEscrowedRaw": 0,
                    "countExported": 5,
                    "countExports": 0,
                    "countImported": 0,
                    "countImportedDeltas": 0,
                    "countImportedReferenceDeltas": 0,
                    "state": "Succeeded",
                    "error": null,
                    "timeBegan": "0001-01-01T00:00:00Z",
                    "timeEnded": "2025-06-17T09:20:28.4706449Z"
                },
                "progress": [],
                },

                "synchronizedEntryCountByType": [
                    {
                        "key": "group to Group",
                        "value": 3
                    },
                    {
                        "key": "user to User",
                        "value": 2
                    }
                ]
            },
            "synchronizationJobSettings": [
                {
                    "name": "AzureIngestionAttributeOptimization",
                    "value": "False"
                },
                {
                    "name": "LookaheadQueryEnabled",
                    "value": "False"
                },
                {
                    "name": "Domain",
                    "value": "{\"DomainDiscoveredAt\":\"2025-06-17T09:07:29.6734347Z\",\"DomainFQDN\":\"contoso.com\",\"DomainNetBios\":\"contoso\",\"ForestFQDN\":\"contoso.com\",\"ForestNetBios\":\"contoso\"}"
                },
                {
                    "name": "DomainDiscoveredAt",
                    "value": "2025-06-17T09:07:29.6734347Z"
                },
                {
                    "name": "DomainFQDN",
                    "value": "contoso.com"
                },
                {
                    "name": "DomainNetBios",
                    "value": "contoso"
                },
                {
                    "name": "ForestFQDN",
                    "value": "contoso.com"
                },
                {
                    "name": "ForestNetBios",
                    "value": "contoso"
                },
                {
                    "name": "LookaheadQueryIntervalValue",
                    "value": "30"
                }
            ]
        }
    ]

```
## List Synchronization Schema

**Graph Query Sample**

- Replace [spid] by the id returned in query List Service Principal
- Replace [runprofileid] by id [AD2AADProvisioning.xxxxxx.xxxxx] returned in query List Synchronization Job

```
GET https://graph.microsoft.com/v1.0/serviceprincipals/[spid]/synchronization/jobs/[runprofileid]/schema
```

In ASC use:
```
serviceprincipals/[spid]/synchronization/jobs/[runprofileid]/schema
```
**Graph Query Response Sample**

- You will get all the details in provisioning schema including:
     - ContainerFilter
     - GroupFilter
     - SynchronizaitonRules
     - Attributemappings for contact, group and user
     - Available Schema Attributes in AD and Entra ID

```
   "id": "AD2AADProvisioning.cabb4771b63143ff86f4983c475e61ae.af9b1615-1e82-4854-8dc4-4ff6027f700d",
    "version": "Date:2025-03-30T07:00:28.2095357Z, ActivityId:816f35a8-1135-4983-a437-8fc8494d7929",
    "synchronizationRules": [
        {
            "editable": true,
            "id": "6c409270-f78a-4bc6-af23-7cf3ab6482fe",
            "name": "AD2AADProvisioning",
            "priority": 0,
            "sourceDirectoryName": "Active Directory",
            "targetDirectoryName": "Microsoft Entra ID",
            "containerFilter": {
                "includedContainers": []
            },
            "groupFilter": {
                "includedGroups": []
            },
            "metadata": [
                {
                    "key": "defaultSourceObjectMappings",
                    "value": "[{\"AttributeMappings\":[{\"DefaultValue\":null,\"ExportMissingReferences\":false,\"FlowBehavior\":0,\"FlowType\":0,\"MatchingPriority\":1,\"ReferencedObjects\":null,\"Source\":null,\"TargetAttributeName\":\"objectGUID\"}],\"DisableMonitoringForChanges\":false,\"Disposition\":0,\"Enabled\":false,\"EscrowBehavior\":1,\"FlowTypes\":7,\"Internal\":false,\"IsCustomerDefined\":false,\"Name\":null,\"OriginalJoiningProperty\":\"objectGUID\",\"Scope\":{\"CategoryFilterGroups\":null,\"Groups\":null,\"InputFilterGroups\":[{\"Clauses\":[{\"MultiValuedComparisonType\":0,\"OperatorName\":\"IS FALSE\",\"SourceOperandName\":\"isCriticalSystemObject\",\"TargetOperand\":null},{\"MultiValuedComparisonType\":0,\"OperatorName\":\"NOT REGEX MATCH\",\"SourceOperandName\":\"mailNickname\",\"TargetOperand\":{\"Values\":[\"^CAS_([^{]*){\"]}},{\"MultiValuedComparisonType\":0,\"OperatorName\":\"NOT REGEX MATCH\",\"SourceOperandName\":\"distinguishedName\",\"TargetOperand\":{\"Values\":[\"^CN\\\\s*=\\\\s*([^\\\\,]*)\\\\0ACNF\"]}},{\"MultiValuedComparisonType\":0,\"OperatorName\":\"REGEX MATCH\",\"SourceOperandName\":\"proxyAddresses\",\"Tar
               ......
               ......
               ......
                                {
                    "enabled": true,
                    "flowTypes": "Add,Update,Delete",
                    "name": "Provision Active Directory users",
                    "sourceObjectName": "user",
                    "targetObjectName": "User",
                    "attributeMappings": [
                        {
                            "defaultValue": null,
                            "exportMissingReferences": false,
                            "flowBehavior": "FlowWhenChanged",
                            "flowType": "Always",
                            "matchingPriority": 0,
                            "targetAttributeName": "AccountEnabled",
                            "source": {
                                "expression": "IIF(IsPresent([userAccountControl]), IIF(BitAnd([userAccountControl], 2)=\"0\", \"True\", \"False\"), Not([accountDisabled]))",
                                "name": "IIF",
                                "type": "Function",
                                "parameters": [
                                    {
                                        "key": "one",
                                        "value": {
                                            "expression": "IsPresent([userAccountControl])",
                                            "name": "IsPresent",
                                            "type": "Function",
                                            "parameters": [
                                                {
                                                    "key": "source",
                                                    "value": {
                                                        "expression": "[userAccountControl]",
                                                        "name": "userAccountControl",
                                                        "type": "Attribute",
                                                        "parameters": []
                                                    }
               ......
               ......
               ......
                "id": "66e4a8cc-1b7b-435e-95f8-f06cea133828",
            "discoveryDateTime": null,
            "discoverabilities": "AttributeNames,AttributeDataTypes",
            "name": "Microsoft Entra ID",
            "readOnly": true,
            "version": "Date:2025-03-30T07:00:28.2095357Z, ActivityId:816f35a8-1135-4983-a437-8fc8494d7929",
            "objects": [
                {
                    "name": "Contact",
                    "supportedApis": [
                        "Contact"
                    ],
                    "attributes": [
                        {
                            "anchor": false,
                            "caseExact": false,
                            "defaultValue": null,
                            "flowNullValues": true,
                            "multivalued": false,
                            "mutability": "ReadWrite",
                            "name": "Alias",
                            "required": false,
                            "type": "String",
                            "apiExpressions": [],
                            "metadata": [],
                            "referencedObjects": []
                        },
                        {
               ......
               ......
               ......
```          



## List service principal (configuration) secret

**Graph Query Sample**

- Replace [spid] by the id returned in query List Service Principal
```
GET https://graph.microsoft.com/v1.0/serviceprincipals/[spid]/synchronization/secrets
```
In ASC use:
```
serviceprincipals/[spid]/synchronization/secrets
```

**Graph Query Response Sample**
- You will find deletethreshold details and account info in the response
```
    "value": [
        {
            "key": "Domain",
            "value": "{\"domain\":\"contoso.com\"}"
        },
        {
            "key": "SyncNotificationSettings",
            "value": "{\"Enabled\":true,\"Recipients\":\"\",\"DeleteThresholdEnabled\":true,\"DeleteThresholdValue\":500}"
        },
        {
            "key": "UserName",
            "value": "ADToAADSyncServiceAccount@xxxxxx.onmicrosoft.com"
        },
        {
            "key": "Password",
            "value": "*"
        }
    ]
```