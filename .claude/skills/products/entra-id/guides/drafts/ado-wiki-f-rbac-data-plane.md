---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure RBAC for Resources/Azure RBAC Extended to the Data Plane"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20RBAC%20for%20Resources%2FAzure%20RBAC%20Extended%20to%20the%20Data%20Plane"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD-Account-Management
- cw.AAD-Workflow
- cw.AAD-RBAC
- users scopes
- cw.comm-secaccmgt
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   
 

[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Account-Management](/Tags/AAD%2DAccount%2DManagement) [AAD-Workflow](/Tags/AAD%2DWorkflow) [AAD-RBAC](/Tags/AAD%2DRBAC)          
 


[[_TOC_]]

## Summary

Traditionally, Azure RBAC (Role Based Access Control) only managed permissions to resources in the Azure Portal. That scope of control is referred to as the "Control Plane" or the "Management Plane". Permissions to resources like Storage Blobs or Storage Files, or Keys and Secrets within a key vault was managed separately by the individual Resource Providers. This scope of control is referred to as the "Data Plane".

RBAC Permissions assigned to Resources at the Control Plane are set by assigning '**Actions**' or '**NonActions**' on the role definitions, and then assigning Users to those RBAC roles.

Resource Providers in Azure are beginning to extended Azure RBAC Roles to the Data Plane to provide authorization to resources. The Policy Administration service where Azure RBAC roles are stored had added two additional properties to Azure RBAC roles called '**DataActions**' and '**NonDataActions**'.

These are the main changes:

  - When providers expose Actions metadata, they can add an “**isDataAction**” property and set it to true for all data plane actions.
  - Role definitions, in addition to “**Actions**” and “**NotActions**” which provide control at the control pane, the new “**DataActions**” and “**NotDataActions**” control access to the data plane.
  - The UI shows both control and data actions, but they are marked as different categories.

## Limitations

Probably the most confusing part for the users will be that the "**Owner**" role doesn't give any permissions to any data actions. The same applies for "**Reader**" and "**Contributor**".

Reader has "\*/read" item in "**Actions**", which means "read access for everything exposed by the portal". In order to give read permissions to the data, a role must have "\<provider/resource\>/read" item in "**DataActions**". Of course "\*/read" in **DataActions** works too.

In order to use Data Actions in PowerShell you have to update to Azure PowerShell to 5.5.0 or above.

## DataActions and NonDataActions

List the Permissions for Control Plane (Actions and NonActions) and Data Plane (DataActions and NonDataActions):

**Note**: NonDataActions are only needed if the customer uses a wildcard to DataActions operations.

**Windows**

```
    PS C:\> Get-AzRoleDefinition  | select Name,Id,Actions,NonActions,DataActions,NonDataActions | fl
    
    Name           : Storage Blob Data Contributor (Preview)
    Id             : ba92f5b4-2d11-453d-a403-e96b0029c9fe
    Actions        : {Microsoft.Storage/storageAccounts/blobServices/containers/delete,
                     Microsoft.Storage/storageAccounts/blobServices/containers/read,
                     Microsoft.Storage/storageAccounts/blobServices/containers/write}
    NonActions     :
    DataActions    : {Microsoft.Storage/storageAccounts/blobServices/containers/blobs/delete,
                     Microsoft.Storage/storageAccounts/blobServices/containers/blobs/read,
                     Microsoft.Storage/storageAccounts/blobServices/containers/blobs/write}
    NonDataActions :
    
    Name           : Storage Blob Data Reader (Preview)
    Id             : 2a2b9908-6ea1-4ae2-8e65-a410df84e7d1
    Actions        : {Microsoft.Storage/storageAccounts/blobServices/containers/read}
    NonActions     :
    DataActions    : {Microsoft.Storage/storageAccounts/blobServices/containers/blobs/read}
    NonDataActions :
    
    Name           : Storage Queue Data Contributor (Preview)
    Id             : 974c5e8b-45b9-4653-ba55-5f855dd0fb88
    Actions        : {Microsoft.Storage/storageAccounts/queueServices/queues/delete,
                     Microsoft.Storage/storageAccounts/queueServices/queues/read,
                     Microsoft.Storage/storageAccounts/queueServices/queues/write}
    NonActions     :
    DataActions    : {Microsoft.Storage/storageAccounts/queueServices/queues/messages/delete,
                     Microsoft.Storage/storageAccounts/queueServices/queues/messages/read,
                     Microsoft.Storage/storageAccounts/queueServices/queues/messages/write}
    NonDataActions :
    
    Name           : Storage Queue Data Reader (Preview)
    Id             : 19e7f393-937e-4f77-808e-94535e297925
    Actions        : {Microsoft.Storage/storageAccounts/queueServices/queues/read}
    NonActions     :
    DataActions    : {Microsoft.Storage/storageAccounts/queueServices/queues/messages/read}
    NonDataActions :
    
    Name           : Virtual Machine Administrator Login
    Id             : 1c0163c0-47e6-4577-8991-ea5c82e286e4
    Actions        : {}
    NonActions     :
    DataActions    : {Microsoft.Compute/virtualMachines/login/action,
                     Microsoft.Compute/virtualMachines/loginAsAdmin/action}
    NonDataActions :
    
    Name           : Virtual Machine User Login
    Id             : fb879df8-f326-4884-b1cf-06f3ad86be52
    Actions        : {}
    NonActions     :
    DataActions    : {Microsoft.Compute/virtualMachines/login/action}
    NonDataActions :
```

**Azure CLI 2.0**

Use version 2.0.30 or later to see DataAction and NotDataActions.

## Get Operations Descriptions

### PowerShell

Use Get-AzProviderOperation to query the Description of a specific DataAction or NonDataAction.

```
    PS C:\>  Get-AzProviderOperation Microsoft.Compute/virtualMachines/login/action | ft Operation,OperationName
    
    Operation                                      OperationName
    ---------                                      -------------
    Microsoft.Compute/virtualMachines/login/action Log in to Virtual Machine
    
    
    PS C:\> Get-AzureRmProviderOperation Microsoft.Compute/virtualMachines/loginAsAdmin/action | ft Operation,OperationName
    
    Operation                                             OperationName
    ---------                                             -------------
    Microsoft.Compute/virtualMachines/loginAsAdmin/action Log in to Virtual Machine as administrator
```

### Portal

Indicators of what DataAction and NonDataAction Operations can also be performed for a selected role can be viewed from the portal user experience as shown here.

1. Access the **Access Control (IAM**) blade of any management group, subscription, resource group or resource.
2. Click the **Role Assignments** tab to View existing Azure RBAC role assignments or Add new ones.
3. Click on the *name* of the role to launch the **Permissions** preview pane. Here the admin can view what NonDataAction and DataAction Operations the role is able to perform.

![StorageBlobReaderInIAMBlade](/.attachments/AAD-Account-Management/183996/StorageBlobReaderInIAMBlade.jpg =1011x339)

4. From the **Permissions** preview pane, click the resource type to expand and see all *Management* plane and *Data* plane operations (both sections are in green) are defined for the role and what actions they can perform.

**Note**: Each resource type that the role manages has permissions for will be listed as its own folder (there may be more than one). In the example below the **Microsoft Storage** resource type is the only one shown because the selected role only has permissions applicable to the selected resource.  

![ViewResourceTypeData](/.attachments/AAD-Account-Management/183996/ViewResourceTypeData.jpg =490x772)

5. Clicking on a specific permission brings up a detailed view of what actions that permission allows to be performed.

![DetailedViewOfPermission](/.attachments/AAD-Account-Management/183996/DetailedViewOfPermission.jpg =477x388)

A brief demo showing how to view Management plane and Data plane permissions in the portal.

![DataPaneOperation](/.attachments/AAD-Account-Management/183996/DataPaneOperation.gif =891x557)

## Troubleshooting/Tools

Jarvis queries can be used to dump all role memberships for all Scopes within a subscription. This will dump

### RBAC Queries in Jarvis

Items needed to troubleshoot RBAC:

  - **Name** and/or **RoleDefinitionId** of the RBAC Role that the user is a member of, or should be a member of.
  - **Scope** where the user is assigned to the RBAC role. This will be either the SubscriptionID, Resource Group Name or the Resource Name.
  - **ObjectID** of the User or Service Principal, not the ApplicationID.
  - **SubscriptionID**
  - **TenantID**

### Discover if a user is assigned to a Role at a specific Scope

The first three Jarvis queries should help identify if the user is assigned to either the "Virtual Machine Administrator Login" or "Virtual Machine User Login" roles.

#### Get Subscription Tenant ID

Use the [Get Subscription Tenant ID](https://jarvis-west.dc.ad.msft.net/365CE7E9?genevatraceguid=033b163e-2304-4502-994d-b2c707c45349) query to determine the Azure AD Tenant ID that is associated with the SubscriptionID in the case.

**Folder Structure:** AzureRT / Subscription Management /

**Name**: Get Subscription Tenant ID

**Required Input Parameters**

  - Subscription Id: \<SubscriptionID\>

#### Get the Role ID Assigned to an RBAC Role Name

Use the [Get Role Definition](https://jarvis-west.dc.ad.msft.net/1C8A2519?genevatraceguid=7e52f85f-0c7c-401b-a593-6b63c791bbfb) query if you have a Role Name, and you need to find the ID or Description of that role. This query returns all of the meta-data about the RBAC role.

**Note**: If you know the Role ID but not the name, leave 'Role Name' blank and enter the 'Role ID'. Also, custom RBAC roles are queried by un-checking "**Is Built In**" and including the "**Tenant Id**"

**Queries**:

[Built-in RBAC Role ID](https://jarvis-west.dc.ad.msft.net/3C077191?genevatraceguid=6aef91f9-8fd1-43e6-ae71-04d434ea05f1)

[Built-in RBAC Role Name](https://jarvis-west.dc.ad.msft.net/8070BAF?genevatraceguid=6aef91f9-8fd1-43e6-ae71-04d434ea05f1)

[Custom RBAC Role ID](https://jarvis-west.dc.ad.msft.net/7A7E1E94?genevatraceguid=6aef91f9-8fd1-43e6-ae71-04d434ea05f1)

[Custom RBAC Role Name](https://jarvis-west.dc.ad.msft.net/E40DEA2D?genevatraceguid=6aef91f9-8fd1-43e6-ae71-04d434ea05f1) 

**Folder Structure:** AAD Developer Acceleration / PAS Management Workflows /

**Name**: Get Role Definition

##### Required Input Parameters

  - **Endpoint**: PAS in Production
  - **Deployment Unit**: Any unit
  - **Data Store**: Default
  - **Is Built In**: *Checked if this is a Built-in role, unchecked if it is a custom role*
  - **Tenant Id**: *empty if using built-in roles, populated for custom roles.*
  - **Application Id**: ARM
  - **Role Id**: *empty*
  - **Role Name**: *\<RBAC Role Name\>*

Examine the '**roleAssignment.json**' file and copy the "**Id**" guid for the RBAC Role Name that was queried.

#### Get All Members of a Specific RBAC Role at all Scopes in a Subscription

Use the [Get Role Assignment](https://jarvis-west.dc.ad.msft.net/84F49576?genevatraceguid=946846ce-ca98-479c-ac62-21e1388b9a60) query the Role ID copied from the previous query. This will list all members (user or service principals) of the specific RBAC role for all Scopes in a subscription.

**NOTE:** Without an ObjectID (aka: Principal Id), this query will retrieve role assignments for All users that are members of the RBAC Role that is specified. The query can be targeted to the specific ObjectId/PrincipalID of the user. Also, when querying for a service principal, you must use the ObjectID (aka: PrincipalID), not the ApplicationID. This query will not consider assignments based on security groups like the Get Role Permissions query does.

**Folder Structure:** AAD Developer Acceleration / PAS Management Workflows /

**Name** : Get Role Assignment

##### Required Input Parameters

  - **Endpoint**: PAS in Production
  - **Deployment Unit**: Any unit
  - **Data Store**: Default
  - **Is Built In**: Unchecked
  - **Tenant Id**: \<Tenant ID\>
  - **Application Id**: ARM
  - **Role Assignment Id**: empty
  - **Principal Id**: *empty*
  - **Role Id**: *\<RBAC Role ID\>*
  - **Scope**: /subscriptions/\<subscriptionId\>
  - **Scope Search Direction**: ScopeAndBelow
  - **Include Tombstones**: unchecked
  - **Include Data Layer Property**: unchecked
  - **Deleted Principal Container**: unchecked

Examine the '**roleAssignment.json**' file to see the all of the 'PrincipalId' (aka: user objectId) that are assigned to a specific RBAC role, and the Scope at which they are applied under the subscription.

### PowerShell

#### Use RBAC Role Name and UPN to Find All Scopes Where User is a Member

Find all Scopes where a specific user has been added to a known RBAC Role Name.

```
    PS C:\> Get-AzRoleAssignment -SignInName adams@contoso.info -RoleDefinitionName "Storage Blob Data Reader (Preview)"
   
RoleAssignmentName : dfeee7ee-####-####-####-############
RoleAssignmentId   : /subscriptions/d32a0288-####-####-####-###########/providers/Microsoft.Authorization/roleAssignments/3c708804-####-####-####-############
Scope              : /subscriptions/43e19234-####-####-####-############/resourceGroups/############/providers/Microsoft.Storage/storageAccounts/########
DisplayName        : Adam Stanfield
SignInName         : AdamS@contoso.info
RoleDefinitionName : Storage Blob Data Reader (Preview)
RoleDefinitionId   : 2a2b9908-6ea1-4ae2-8e65-a410df84e7d1
ObjectId           : 579d54a6-####-####-####-############
ObjectType         : User
CanDelegate        : False
Description        :
ConditionVersion   :
Condition          :
```
## ICM Submission

If credential registration is failing use the process below to engage the correct product group

See the the [CID CRI Template List](https://microsoft.sharepoint.com/teams/CloudIdentityPOD/SitePages/CID%20CRI%20Template%20List.aspx) for the latest information about ICM paths for Support Delivery.

### Azure RBAC (not Azure AD RBAC)

This team investigates issues related to Azure RBAC failures, not Azure AD Directory Roles.

**NOTE**: PLEASE CONFIRM WITH THE OWNING SERVICE THAT THE RBAC SETTINGS THE CUSTOMER HAS SET WILL ALLOW THE CUSTOMER TO PERFORM THE REQUESTED ACTIONS, YET RBAC STILL FAILS.

<https://portal.microsofticm.com/imp/v3/incidents/cri?tmpl=V3L3oP>

**Critical**: The ICM must contain the customer's "**tenantid**", "**subscription**" and "**roledefinition id**".

#### Target ICM Team for TA use

  - **Owning Service**: Policy Administration Service
  - **Owning Team**: Triage

## Training

**Title**: Azure RBAC Extended to the Data Plane

**Course ID**: S2066635

**Format**: Self-paced eLearning

**Duration**: 50 minutes

**Audience**: Cloud Identity Support Team [AAD - Account Management Professional](https://expert.partners.extranet.microsoft.com/expert/Radius?QueueName=AAD%20-%20Account%20Management%20Professional&QueueNameFilter=account%20management&SearchFlag=True), [AAD - Account Management Premier](https://expert.partners.extranet.microsoft.com/expert/Radius?QueueName=AAD%20-%20Account%20Management%20Premier&QueueNameFilter=account%20management&SearchFlag=True)

**Tool Availability**: May 18, 2018

**Training Completion**: May 10, 2018

**Region**: All regions

**Course Location**: [QA](https://aka.ms/AArjrgr)

**Note**: To access the course, click **Login with your company account** and type `Microsoft` in the *Company Subdomain* field, then click **Continue**.

## Additional RBAC Documentation


[Understand Azure role definitions](https://learn.microsoft.com/en-us/azure/role-based-access-control/role-definitions?branch=main&branchFallbackFrom=pr-en-us-36677)

[Manage Role-Based Access Control with the Azure command-line interface](https://docs.microsoft.com/en-us/azure/role-based-access-control/role-assignments-cli)

[Manage Role-Based Access Control with Azure PowerShell](https://docs.microsoft.com/en-us/azure/role-based-access-control/role-assignments-powershell)

[Manage Role-Based Access Control with the REST API](https://docs.microsoft.com/en-us/azure/role-based-access-control/role-assignments-rest)

[Create custom roles for Azure Role-Based Access Control](https://docs.microsoft.com/en-us/azure/role-based-access-control/custom-roles)
