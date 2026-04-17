---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure RBAC for Resources/TSG: Troubleshooting RBAC Permissions for Azure Resources"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20RBAC%20for%20Resources%2FTSG%3A%20Troubleshooting%20RBAC%20Permissions%20for%20Azure%20Resources"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD-Account-Management
- cw.AAD-Workflow
- cw.AAD-RBAC
- RBAC Permission
- cw.Acct-Support-boundaries
- cw.comm-secaccmgt
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   
The below steps are a troubleshooting guide on how to debug RBAC permissions using Azure Support Center.

[[_TOC_]]

# Prerequisites

<table style="margin-left:.34in">
  <tr style="background:lightyellow;color:black">
    <td>
      <small>&#128276; <b>READ ME</b> &#128276
      <p style="margin-left:.27in">To be effective in troubleshooting RBAC errors requires the customer provide ARM correlation ID and Timestamp.  Please read ARM team's <a href="https://armwiki.azurewebsites.net/troubleshooting/getting_help/correlationid.html">How to get the Correlation ID</a> in addition to the below guide and verify you have obtained the correlation ID and timestamp from customer. </small>
    </td>    
  </tr>
</table>


Gather the following information to begin troubleshooting
- [ ] Scope of the Azure resource: (example: /subscriptions/1234568-####-####-####-############/resourceGroups/myResourceGroup/providers/Microsoft.Network/virtualNetworks/vnet-001)
- [ ] AAD user object ID, or AAD principal object ID: (example: 2e7ee789-####-####-####-############ ).  (Obtained from ASC Tenant Explorer -> User Lookup)
- [ ] Timestamp of permission error in UTC

   NOTE: All of the above info can be captured easily by the customer by reproducing the issue and providing one of the following to you
   1. https://aka.ms/hartrace or https://aka.ms/fiddlercap (w/HTTPS decryption enabled)
   3. If using an Az PowerShell module cmdlet when receiving error, collect debug output by 

       1. Start-Transcript -Path "C:\output.txt"
       2. $debugpreference='continue'
       3. Reproduce the RBAC error using Az PowerShell cmdlet with **-Debug -Verbose** flags added to end of cmdlet
       4. Stop-Transcript
       5. Upload C:\output.txt to DTM for review of RAW RBAC errors

   3. If using Azure CLI cmds when receiving error, collect debug output by adding **--debug --verbose** flags to end of cmdlet causing RBAC error, and upload the verbose debug output to DTM for review.
   3. The RAW RBAC error that contains all of the above info and would look like one of these mentioning "Authorization Failed":

         ```
          {"error":{"code":"InvalidTemplateDeployment","message":"The template deployment failed with error: 'Authorization failed for X 'resourceName' of type 'Microsoft.Network/virtualNetworks'. 
          The client 'user@domain.com' with object id '2e7ee789-####-####-####-############' does not have permission to perform action 'Microsoft.Network/virtualNetworks/write' at 
          scope '/subscriptions/1234568-####-####-####-############/resourceGroups/myResourceGroup/providers/Microsoft.Network/virtualNetworks/vnet-001'.'."}}
         ```
         ```
         unexpected status 403 (403 Forbidden) with error: AuthorizationFailed: The client '07b2b4e8-####-####-####-############' with object id '07b2b4e8-####-####-####-############' does not have authorization to perform action 'Microsoft.Network/publicIPAddresses/read' over scope '/subscriptions/***/resourceGroups/***-aks-rg/providers/Microsoft.Network/publicIPAddresses/6b44b91d-####-####-####-############' or the scope is invalid. If access was recently granted, please refresh your credentials
         ```
        The RAW RBAC error can be found in the Fiddler or HAR trace by following [Intro to Fiddler](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/184220/Introduction-to-Fiddler) , [Capturing and Reading Repro Traces](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/335070/How-to-capture-and-read-customer-repro-traces) and [Azure RBAC Fiddler Steps](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/183995/Azure-RBAC-(Role-Based-Access-Control)?anchor=fiddler) then locating any HTTP 4XX responses from **management.azure.com** endpoint then reviewing Inspectors tab -> Response (lower pane) -> Raw tab

      The RAW RBAC error can also be found by using the [EventServices KUSTO queries below](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/587271/TSG-Troubleshooting-RBAC-Permissions-for-Azure-Resources?anchor=use-kusto-to-locate-rbac-logs) and referencing properties column


# Use Azure Support Center to review permissions

## Step 1. Locate resource with ASC Resource Explorer
1. Using the scope of the resource found in the prerequisites, add the subscriptionID to [ASC Resource Explorer](https://azuresupportcenter.msftcloudes.com/resourceexplorerv2) using the + Add subscription button if subID is not already present:

     ![image.png](/.attachments/image-06ab122b-28f6-486e-8d49-1f72810c4058.png)
2. Switch the view mode to '''Resource group''' mode to list all the resource groups of the subscription
3. From the scope of the resource found in the prerequisites, use the **Search for resources** query to search for the scope's resource name.  For example **SYNCLAB-VNET** in the scope `/subscriptions/1234568-####-####-####-############/resourceGroups/SYNCLAB/providers/Microsoft.Network/virtualNetworks/SYNCLAB-VNET` is the resource name.  From the results,  select the returned resource from the scope's resource provider.  For example Microsoft.Network/virtualNetworks/syncLab-vNET:

   ![image.png](/.attachments/image-c5b6b2b4-a00a-4c85-a705-d0c74e311460.png)

   

## Step 2. Identify what roles principal has at resource scope
1. From the resource's properties, choose the **Access Control** tab
2. From the Access Control tab, locate the **Check access** function
3. Paste the user or principal's AAD **objectID** from the Prerequisites

   ![image.png](/.attachments/image-67f08c0b-0cf1-4bcb-82b5-ae2e0b186c3f.png)

4. From the results of Check access function, review each of the listed **Role assignments** for the principal and note the Role **Name** column and **Scope** column to understand what role the principal has and from what scope the role was assigned\inherited from:

   ![image.png](/.attachments/image-c29fb7d3-fc24-44ad-9ce2-e37595966f58.png)

## Step 3. Identify what Actions and NotActions are granted via the Role name
1. From the Access Control tab, locate the **Roles** listing
2. Use the column filter for **Name** and paste the Role name to filter the list of Roles and locate the assigned Role definition.  NOTE: If you try to filter by roleDefinitionID you need to remove the GUID's dashes.  Recommend to filter by Role name instead of GUID
3. From the results, expand the Role definition to locate the **Permissions** definition
4. Review the **Actions** and **NotActions*** sections to understand what permissions the principal has or doesn't have at the selected scope.  Not the permitted actions are the Actions minus the NotActions and they are permitted at the role assignment's assigned Scope and all child scopes.

   ![image.png](/.attachments/image-21ff1fa9-63bf-489a-8499-f581bd10dd9d.png)

## Step 4. Identify what role is needed to resolve the issue

1. Once the issue is confirmed to be that the principal doesnt have the proper Role assigned to them that grants the needed RBAC Action at the scope requested, the next step is to identify what role should be assigned.  For this the customer has two options

   1. Search (CTRL+F) our [Azure built-in role definition list](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/587271/TSG-Troubleshooting-RBAC-Permissions-for-Azure-Resources) for a built-in role that has the missing Action (ex. `Microsoft.Network/virtualNetworks/write` or `Microsoft.Network/virtualNetworks/*` , and then [assign that role to the principal](https://docs.microsoft.com/en-us/azure/role-based-access-control/role-assignments-steps) at the scope needed to complete the action in the error.

   2. [Create a new Custom RBAC role](https://docs.microsoft.com/en-us/azure/role-based-access-control/custom-roles) and include the missing Action (ex. `Microsoft.Network/virtualNetworks/write` or `Microsoft.Network/virtualNetworks/*` in the Actions permitted, then [assign this custom role to the principal](https://docs.microsoft.com/en-us/azure/role-based-access-control/role-assignments-steps) at the scope needed to complete the action in the error.

   NOTES: 
      1. If the action needed to complete the operation is not documented, or included in a built in role, the resource provider's (example: `Microsoft.Network`) support team should engage their product engineering team to identify the needed permission to complete the task.  Identifying undocumented actions\RBAC permissions is out of scope for the Azure Identity RBAC support team.
      2. Questions on why the Action mentioned in the permissions error is needed to perform the operation customer is trying are also out of scope for the Azure Identity RBAC support team and should be answered by the resource provider's (example: `Microsoft.Network`) support team.

# Use Kusto to locate RBAC logs
If you only have a user, timeframe, and subscription ID you can locate RBAC authorization failures using a Kusto Query to the ARM cluster https://armprodgbl.eastus.kusto.windows.net depending on what information you have available. To use ARM Kusto Cluster you must have access permissions.  Follow [Kusto Logs in ARM](https://armwiki.azurewebsites.net/data/kusto%20v2/overview_kustov2.html) to request access and setup Kusto. 

With the results from these queries, locate any Status=Failed or EventID = 4XX rows and you will have the raw RBAC error mentioned in prerequisites in the properties column for locating permissions in ASC Resource Explorer.

1. Open https://armprodgbl.eastus.kusto.windows.net/ARMProd and verify you have cluster added. Make sure you have followed [Getting permissions](https://armwiki.azurewebsites.net/data/kusto%20v2/getting_access.html) if you can't load cluster due to permission error.
2. Copy and paste any of the below queries and update the parameters to match your scenario and run

## EventServices Query with subscriptionID, principalID, and Timestamp


```json
let subID = "40bf0beb-####-####-####-############"; //replace with target Subscription ID
let principalID = "2e7ee789-####-####-####-############"; //replace with user or principal AAD object ID
let timestamp = datetime(2022-02-14 18:19); // replace with timestamp in UTC of RBAC error
let delta = 1h; // replace with timeframe to search 
Unionizer("Requests", "EventServiceEntries")
| where TIMESTAMP >= timestamp - delta and TIMESTAMP <= timestamp + delta
| where subscriptionId == subID
| where principalOid == principalID
| where status !in ("Started", "Accepted")
| project TIMESTAMP, status, operationName, principalOid, properties, httpRequest, authorization
```

## EventServices Query with correlationID, requestID and Timestamp

See [How to get ARM correlation ID](https://armwiki.azurewebsites.net/troubleshooting/getting_help/correlationid.html)

```json
let id = "67a2d429-c45d-474b-9be5-3352d9f65c9c"; //replace with correlation or request ID
let timestamp = datetime(2022-02-14 18:19); // replace with timestamp in UTC of RBAC error
let delta = 1h; // replace with timeframe to search 
Unionizer("Requests", "EventServiceEntries")
| where TIMESTAMP >= timestamp - delta and TIMESTAMP <= timestamp + delta
| where correlationId == id or ActivityId == id or operationId == id
| project TIMESTAMP, status, operationName, principalOid, properties, httpRequest, authorization
```

## HTTP Request Query with subscriptionID, principalID, and Timestamp
Occasionally you may not find the error in the EventServices log table and will need to query HTTP request logs for ARM.



```json
let subID = "40bf0beb-####-####-####-############"; //replace with subscriptionID
let principalID = "2e7ee789-####-####-####-############"; //replace with user or principal AAD objectID
let timestamp = datetime(2022-02-14 18:19); // replace with timestamp in UTC of RBAC error
let delta = 1h; // replace with timeframe to search 
union
Unionizer("Requests", "HttpIncomingRequests"), Unionizer("Requests", "HttpOutgoingRequests")
| where TIMESTAMP >= timestamp - delta and TIMESTAMP <= timestamp + delta
| where subscriptionId == subID
| where principalOid == principalID
| project TIMESTAMP, authorizationAction, operationName, httpMethod, httpStatusCode, TaskName, principalOid, principalPuid, targetUri, subscriptionId, tenantId, correlationId, userAgent, clientIpAddress, errorCode, errorMessage, commandName, authorizationSource
```

## HTTP Request Query with correlationID, requestID and Timestamp

See [How to get ARM correlation ID](https://armwiki.azurewebsites.net/troubleshooting/getting_help/correlationid.html)

```json
let id = "67a2d429-c45d-474b-9be5-3352d9f65c9c"; //replace with correlation or request ID
let timestamp = datetime(2022-02-14 18:19); // replace with timestamp in UTC of RBAC error
let delta = 1h; // replace with timeframe to search 
union
Unionizer("Requests", "HttpIncomingRequests"), Unionizer("Requests", "HttpOutgoingRequests")
| where TIMESTAMP >= timestamp - delta and TIMESTAMP <= timestamp + delta
| where correlationId == id or ActivityId == id or clientRequestId == id or armServiceRequestId == id
| project TIMESTAMP, authorizationAction, operationName, httpMethod, httpStatusCode, TaskName, principalOid, principalPuid, targetUri, subscriptionId, tenantId, correlationId, userAgent, clientIpAddress, errorCode, errorMessage, commandName, authorizationSource
```

## ARM Trace LogsQuery with correlationID, requestID and Timestamp

See [How to get ARM correlation ID](https://armwiki.azurewebsites.net/troubleshooting/getting_help/correlationid.html)

```json
let id = "9efe0968-3b5b-4b2c-9483-43f2a67184f8";  // customer facing Service request ID = ARM correlationID, ARM activityID and ARM serviceRequestID. Custoemr Facing Client request id = ARM clientRequestID. 
let ts = datetime(2024-04-02 06:25:06.8674148);
let delta = 1h;
union Unionizer("Requests", "HttpOutgoingRequests"),Unionizer("Traces", "Traces"), Unionizer("Traces", "Errors")  
| where TIMESTAMP >= ts - delta and TIMESTAMP <= ts + delta
| where correlationId == id or * contains id
| project-reorder TIMESTAMP, subscriptionId, operationName, message, exception, errorCode, errorMessage, correlationId, clientRequestId, httpMethod, httpStatusCode, targetResourceProvider, targetUri
```
<!--
# Use Jarvis Actions to locate RBAC permissions
An alternative way to find permissions for a principal at a particular scope is to use Jarvis Actions from a SAW VM.  This can be helpful if ASC is not returning the needed results.  For example if you do not know the scope at which the principal has permissions, you cannot use ASC check access function, because this function will only return role assignments at the selected scope.  So Jarvis actions are sometimes needed to find ALL role assignments at all scopes of a subscription.

1. Request and login to a SAW VM environment via RDP from https://tdc.azure.net/ , note if you do not have access to a SAW VM you will have to request\get approval for permissions see https://aka.ms/sawvm
2. Once logged into your SAW VM, visit https://aka.ms/jarvis in a browser
3. Click the **Actions** menu and then the **Extensions** tab and then select the Environment **Public** for public cloud or **Fairfax** for AzGov
4. Search or browse to the following Folder path:  Azure Resource Manager -> Authorization Management -> **Get Subscription role assignments**
5. Fill out the values for the following:

   a. Subscription = <Subscription ID>
   b. Principal ID = <AAD Principal's Object ID>
   c. Include Child Scope = <YES, required to find inherited permissions>

6. Hit **Run** button to list all of the role assignments for the principal at any scope within the Subscription specified
7. You will now have to review the listed role assignments, to verify what RoleDefinitionID the principal has at the target Scope

   ![image.png](/.attachments/image-e054f628-826e-47e6-b4a1-1b604138a503.png)

8. To convert RoleDefinitionIDs to Role Definitions\Permissions you can copy the roleDefinitionID GUID and paste it into a separate Jarvis action found under path: Azure Resource Manager -> Authorization Management -> Get Subscription role definitions.
9.  Fill out the subscription ID and hit Run, the result will be all role definitions in the subscription,  CTRL+F to find the roleDefinitionID you are seeking the permissions for.  NOTE: the definition GUID is at the bottom of the JSON definition so review the actions\notActions ABOVE the GUID as shown in below examples

    ![image.png](/.attachments/image-0edab679-aef2-43d5-9b00-e2c2bf4194c8.png)

    ![image.png](/.attachments/image-827a6722-a865-43d2-9659-1a05c6fb251e.png)
-->

# Classic Administrators (Account Admin, Service Administrator, Co-Administrators)

> <span style="color:red;">**Important**</span>: As of August 31, 2024, Azure classic administrator roles (along with Azure classic resources and Azure Service Manager) 
> [**are retired and no longer supported**](https://learn.microsoft.com/en-us/azure/role-based-access-control/classic-administrators). If you 
> still have active Co-Administrator or Service Administrator role assignments, convert these role assignments to Azure RBAC immediately. 
> Starting in December 2025, Azure will begin to automatically assign the Owner role at subscription scope to users in the public cloud who 
> are still assigned the Co-Administrator or Service Administrator role.

Classic Administrator roles Account Admin, Service Administrator, and Co-Administrators are not ARM RBAC permissions.  They are classic roles used by Azure commerce\billing systems.  They are still used and supported but traditional RBAC authorization troubleshooting described in this TSG does not apply.  Reference [Classic Administrators doc](https://docs.microsoft.com/en-us/azure/role-based-access-control/classic-administrators) for more info

<span style="color:red;">**This capability has been removed from Azure Support Center (ASC)**</span>

To lookup classic administrators, you can 

1. Use Azure Support Center -> Resource Explorer -> Add Subscription
2. Select the main subscription parent node and check the **ARM Properties** section to reference the **Account Admin Email** and **Account Admin PUID** properties:

   ![image.png](/.attachments/image-ceecb0dd-ed26-4703-97d0-638325f95526.png)

3. To find the **Service Administrator** and the **Co-Administrators** , select the **Principals tab** and reference listed users:

   ![image.png](/.attachments/image-7094129a-e10d-460c-a1cb-4a3298b08a75.png)

4. To change Classic Administrator roles Service Administrator and Co-Administrator reference the [public doc on Classic Administrators](https://docs.microsoft.com/en-us/azure/role-based-access-control/classic-administrators#change-the-service-administrator) and [adding\removing co-administrators](https://docs.microsoft.com/en-us/azure/role-based-access-control/classic-administrators#add-a-co-administrator)

5. To change the Account Administrator (also known as the Billing Administrator) the customer can follow [How to transfer billing ownership of a subscription](https://docs.microsoft.com/en-us/azure/cost-management-billing/manage/billing-subscription-transfer).  Note that as this often involves an Azure AD Tenant Transfer (if the new billing admin resides in a different AAD tenant from current billing admin).  You should work with ASMS Subscriptions Team (SAP: Azure/Subscription management/Transfer ownership of my subscription/Questions about transferring a subscription) and be sure to inform customer of [repercussions of changing billing ownership \ changing AAD tenants](https://docs.microsoft.com/en-us/azure/active-directory/fundamentals/active-directory-how-subscriptions-associated-directory).

<br><br>

# Deny Assignments

[[_TOC_]]

Deny Assignments are a special type of RBAC assignment that prevents unauthorized modification of an Azure Resource.  They are not configurable or removable by end customers today.  Customer's must contact the managed application \ managed resource group support team to manage deny assignments.  Often times the managed application is from a 3rd party company who has offered a managed azure application \ resource via the Azure Marketplace.

Helpful resources to understand Deny Assignments
* Public Doc Descriptions: 
   * [What are deny assignments?](https://docs.microsoft.com/en-us/azure/role-based-access-control/deny-assignments)
   * [What is a managed application?](https://learn.microsoft.com/en-us/azure/azure-resource-manager/managed-applications/overview)
   * [What is a managed resource group](https://learn.microsoft.com/en-us/azure/azure-resource-manager/managed-applications/overview#managed-resource-group)

* ARM Dev Team Wikis: 
   * [Unable to remove deny assignment TSG](https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/AzureDev/470845/Unable-to-Remove-Lock-Access-is-denied-because-of-Deny-assignment)
   * [Access denied due to deny assignments TSG]( https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/AzureDev/470845/Access-is-denied-because-of-deny-assignment)

## Identifying Deny Assignment Support Team

1. If the deny assignment is a 1st party (Microsoft Resource) then the ask to "remove the deny assignment" needs to be relayed to the support team for the resource provider.  Some common 1st party resource providers that create deny assignments and their support team SAP for deny assignment questions can be found below.


   |Resource  | Resource Provider  | SAP |
   |--|--|--|
   |Azure Databricks  |Microsoft.Databricks  | Azure/Databricks/Workspace/Unlock managed resource group (Modify deny assignment permissions) |

   

   Otherwise, you will need to follow below process to identify the owner of the deny assignment.

1. Locate the deny assignment via ASC Resource Explorer -> Select resource -> Access Control -> Deny Assignments

   ![image.png](/.attachments/image-b6666966-e3aa-45cd-b0ea-7eea56fc1dc1.png)

2. Locate the Deny Assignment details and find which managed application created the deny assignment, should be found in the Name or Description:

   ![image.png](/.attachments/image-7f6b9c3d-9ad9-4a7b-a82b-54040755451d.png)

3. Use ASC Resource Explorer -> Browse to the managed application mentioned as the creator of the deny assignment in previous step
   
4. On the managed application, locate the details of the managed application including the Managed Resource Group ID, Customer Support Contact \ and Support URLs.

   ![image.png](/.attachments/image-f4121a83-da4e-4b1c-9cad-247fee3b6a9e.png)

5. Occasionally the Deny Assignmentmight not have any owner information, but will have a `Excluded Principals` property.  This is an AAD Service Principal AppID GUID that can be looked up in ASC Tenant Explorer -> Applications.   NOTE: You may have to convert to GUID by using PowerShell on your local machine like this:  
   * Open PowerShell on local machine
   * Run command: `[guid]"abc123fcb2e54d199f743e3e8b11a57b"`  where `abc123fcb2e54d199f743e3e8b11a57b` is the Excluded Principal from ASC deny assignment
   * You will now have a serivce principal object ID to lookup in ASC Tenant Explorer -> Applications -> AppID lookup
   * The Application Configuration details will give you information about the Microsoft or 3rd Party Resource Provider that owns the deny assignment

5. Refer customer to the managed application's support team on how they manage deny assignemnts.  These are mostly 3rd party companies.  

   * Common Example is Cisco Meraki (Reference [Azure IaaS TSG on Cisco Meraki Deny Assignments](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495650/Lock-on-3rd-Party-Deployments_Deploy?anchor=resolution))

## CDOC Unusual Activity \ Fraud Deny Assignments

6. If the deny assignment has a display name like `[UnusualActivity] Full Deny assignment on SUBGUID` this is a CDOC Unusual Activity \ Fraud Microsoft Security implemented deny assignment.  The case will need to be referred to ASMS team SAP : `Azure/Subscription management/Re-enable my subscription/My issue is not listed above` to assist customer in  unblocking subscription \ removing deny assignment by following their TSG https://aka.ms/cssforupa

## Subscription frozen due to inactivity for a year Deny Assignments

8. If the deny assignment makes any mention of `Subscription frozen due to inactivity for an year or more. Please call Microsoft Support to unfreeze` this is a deny assignment due to inactivity and the Azure Subscriptions Management (ASMS) TA team should be engaged to review announcement [CSP and PL subs with no usage will be moved to Deny Assignment]() and follow their TSG for [ASMS - Remove Deny Assignment Blocks](https://internal.evergreen.microsoft.com/topic/eed9368c-79f5-4499-bb63-7a9ad0b2e748?nochrome=true)

<br><br>
# Support Boundaries for Azure Identity RBAC Support Team

| **Scenario** | Supported By |  Support Path | PG Escalation    |
|--|--|--|-------|
| Troubleshooting ARM\RBAC permission denied errors |   MSaaS AAD Account Management  |  Azure/Role Based Access Control (RBAC) for Azure Resources (IAM)/Problem with RBAC role assignments | [Policy Administration Service \ Triage](https://portal.microsofticm.com/imp/v3/oncall/current?categoryId=4&serviceId=10129&teamIds=11482&scheduleType=current&shiftType=current)
| Troubleshooting errors with creating role assignments |   MSaaS AAD Account Management  |  Azure/Role Based Access Control (RBAC) for Azure Resources (IAM)/Problem with RBAC role assignments | [Policy Administration Service \ Triage](https://portal.microsofticm.com/imp/v3/oncall/current?categoryId=4&serviceId=10129&teamIds=11482&scheduleType=current&shiftType=current)
| Troubleshooting errors with the creation of a custom role **when permissions are known** |   MSaaS AAD Account Management  |  Azure/Role Based Access Control (RBAC) for Azure Resources (IAM)/Problem with custom roles | [Policy Administration Service \ Triage](https://portal.microsofticm.com/imp/v3/oncall/current?categoryId=4&serviceId=10129&teamIds=11482&scheduleType=current&shiftType=current)
| Assistance with recovering role assignments after subscription tenant transfer |   MSaaS AAD Account Management  | Azure/Role Based Access Control (RBAC) for Azure Resources (IAM)/Recover RBAC when subscriptions are moved between directories | [Policy Administration Service \ Triage](https://portal.microsofticm.com/imp/v3/oncall/current?categoryId=4&serviceId=10129&teamIds=11482&scheduleType=current&shiftType=current)
| Identifying what permissions are necessary for Azure Identity supported resource providers <li>Microsoft.AAD <li>Microsoft.AzureActiveDirectory <li>Microsoft.ADHybridHealthService <li>Microsoft.ManagedIdentity <li>Microsoft.Token <li>Microsoft.KeyVault <li>Microsoft.HardwareSecurityModules <li>Microsoft.CustomerLockbox</li> | MSaaS AAD Account Management | Azure/Role Based Access Control (RBAC) for Azure Resources (IAM)/Problem with RBAC role assignments | Identified Azure Identity resource provider's PG
| Identifying what permissions are required to perform a specific action via ARM for any non-Identity related resource provider|   Owned by the action's resource provider support team.  |  Owned by the action's resource provider support team as identified by the [listed resource provider's](https://docs.microsoft.com/en-us/azure/azure-resource-manager/management/azure-services-resource-providers) associated Azure Service <br><br> NOTE: If there is no built in role and the permissions required to do what Cx is looking for are not documented.  The resource provider's PG team should be consulted to review and provide proper permissions.<br><br> To assist Identity team can follow [Custom Role Creation Support Boundaries](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/587271/TSG-Troubleshooting-RBAC-Permissions-for-Azure-Resources?anchor=custom-role-creation-support-boundaries) procedure| Identified support team's PG
| Explaining why a certain permisison is required to perform a specific action via ARM resource provider|   Owned by the action's resource provider support team.  |  Owned by the action's resource provider support team as identified by the [listed resource provider's](https://docs.microsoft.com/en-us/azure/azure-resource-manager/management/azure-services-resource-providers) associated Azure Service <br><br> NOTE: If there is no built in role and the permissions required to do what Cx is looking for are not documented.  The resource provider's PG team should be consulted to review and provide proper permissions.<br><br> To assist Identity team can follow [Custom Role Creation Support Boundaries](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/587271/TSG-Troubleshooting-RBAC-Permissions-for-Azure-Resources?anchor=custom-role-creation-support-boundaries) procedure| Identified support team's PG

## Custom Role Creation Support Boundaries

The Azure RBAC support team (MSaaS AAD Account Management) often gets asked to provide what RBAC permissions are required for a customer's desired ARM operation to succeed.  Generally customers have read the public docs for the resource provider which will indicate that only a built-in role like Owner or Contributor are required and these roles are overly permissive and broad for the customer as they want to use least-privileged permission model.  

If the resource provider's public docs don't document granular RBAC permissions needed for the action that is failing then the below procedure can be used to assist the resource provider's support team in determining what granular permissions are needed.

### Determining Granular RBAC Permissions for custom role creation.

1. Request the customer reproduce the ARM RBAC failure and provide the RAW error, correlation ID, and timestamp. Alternatively, you can use your AIRS subscription to repro the same operation the customer is performing with a user assigned the same permissions and gather RBAC failure logs yourself.
2. Use [Kusto to locate RBAC logs procedure](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/587271/TSG-Troubleshooting-RBAC-Permissions-for-Azure-Resources?anchor=use-kusto-to-locate-rbac-logs) and query both EventServices and HTTP Request logs to find the RBAC 403 Unauthorized error.
3. Reference the **operationName** column of EventServices logs, or the **authorizationAction** column of the HTTP logs.
4. Ask customer to [create a custom role](https://docs.microsoft.com/en-us/azure/role-based-access-control/custom-roles-portal) and add these permissions to the allowed actions of the role, and assign this role to the user\principal at the scope of the failure or higher that the failure occurred at.
5. Perform steps 1-4 again until no RBAC permission failures occur.

   <span style="color:red;font-weight:bold">IMPORTANT</span>   If the permission that caused the RBAC failure to occur is not available to be assigned to a custom role or cannot be determined via above process and is also not documented in that resource provider's public docs, then this is the responsibility of the resource provider's support team to engage their engineering team and advise what granular RBAC permissions are required to complete the desired ARM operation using their resource provider.  

   Generally all resource provider RBAC permissions are documented under [Azure resource provider operations](https://docs.microsoft.com/en-us/azure/role-based-access-control/resource-provider-operations) are available for custom role assignment.

# Frequently Asked Questions

---
## Can I block the creation of Azure Subscriptions by normal users in my tenant?

Today there is no officially supported AAD RBAC or ARM RBAC mechanism to prevent the creation of new azure subscriptions by users in your tenant.  See https://learn.microsoft.com/en-us/answers/questions/701756/prevent-standard-users-from-creating-subscriptions .

This is already tracked in Azure Feedback portal if customer wants to vote \ provide additional feedback: See https://feedback.azure.com/d365community/idea/7c7d4d39-b725-ec11-b6e6-000d3a4f0789 .

There are two scenarios where customer can achieve desired affect:

##### Azure Commerce Supported Option 1
If customer uses an Enterprise Agreement for their tenant, they can consider blocking all subscriptions except EA subscriptions which would prevent standard user signup.  This needs ASMS TA review\approval\whitelisting ,  See https://aka.ms/BlockNonEa

ASMS Support Path: Azure/Subscription management/Purchase, sign up or upgrade issues/Unable to sign-up for subscription

##### AAD Workaround\Unsupported Option 2
A unsupported\workaround option is to edit the AAD Enterprise Application "Microsoft Azure Signup Portal" with Graph Explorer to require user assignment (appRoleAssignmentRequired = True) and only [assign users to this app](https://learn.microsoft.com/en-us/azure/active-directory/manage-apps/assign-user-or-group-access-portal?pivots=portal) that should be able to signup for Azure subscription via Microsoft Azure Signup Portal app.

   ```powershell
   $sp = Get-MgServicePrincipal -Filter "displayName eq 'Microsoft Azure Signup Portal'" 
   
   $params = @{
   	appRoleAssignmentRequired = $true
   }
   
   Update-MgServicePrincipal -ServicePrincipalId $sp.Id -BodyParameter $params
   ```

NOTE: For M365 Subscriptions, Global Admin can [disable self-service purchase of M365 subscriptions](https://learn.microsoft.com/en-us/microsoft-365/commerce/subscriptions/manage-self-service-purchases-admins?view=o365-worldwide#enable-or-disable-purchases-and-trials)

---

## As a Global Administrator, how can I obtain access to all Azure Subscriptions associated to my tenant? 
Use the [Elevate Access](https://docs.microsoft.com/en-us/azure/role-based-access-control/elevate-access-global-admin#azure-portal) option from the AAD Portal -> Properties -> Access management for Azure Resources.  

This setting will assign you, a Global Administrator, the User Access Administrator role on the "/" root management group of the tenant. 

This setting is per Global Admin.  IE. If you personally havent turned this setting on, you will not receive the necessary permissions.

---
## As a Global Administrator, how can I assign permissions at scopes other than /subscriptions/SubID etc.
Use the [Elevate Access](https://docs.microsoft.com/en-us/azure/role-based-access-control/elevate-access-global-admin#azure-portal) option from the AAD Portal -> Properties -> Access management for Azure Resources.  

This setting will assign you, a Global Administrator, the User Access Administrator role on the "/" root management group of the tenant.  You can then view all subscriptions associated to the tenant and assign RBAC permissions at any scope in the tenant.  

For example after turning this feature on, and signing out and signing in to Azure, you can assign RBAC permissions at a provider scope instead of subscription scope:


   ```powershell
   Connect-AzAccount -Tenant abc1234-5ead-468c-a6ae-048e103d57f0
   $sp = Get-AzADServicePrincipal -DisplayName "appdisplayname" 
   New-AzRoleAssignment -ObjectId $sp.Id -Scope /providers/Microsoft.Subscription -RoleDefinitionName "Reader"
   ```
---


