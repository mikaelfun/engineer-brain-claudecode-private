---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for Servers/Vulnerability Assessment/BYOL solution [retired]/[Technical Knowledge] - BYOL VA"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FWorkload%20Protections%2FDefender%20for%20Servers%2FVulnerability%20Assessment%2FBYOL%20solution%20%5Bretired%5D%2F%5BTechnical%20Knowledge%5D%20-%20BYOL%20VA"
importDate: "2026-04-07"
type: troubleshooting-guide
---

**Technical Knowledge] - BYOL VA**

Page containing general information about the BYOL VA features.

[[_TOC_]]
#Overview of VA flows

This Is a condensed, short version of VA documentation, to allow other ASC engineers to understand the VA flow and being able to identify which scenario may be broken, given a customer complaint or ICM.

![MDCBYOLWorkflow.png](/.attachments/MDCBYOLWorkflow-23498ed4-f16b-4a17-9769-9368f7d3c34a.png =x400)

There are 4 main scenarios to VA  

## 1. Partner Solution Health
- The VA solution health reflects the health status sent to us by the VA vendor for both the solution and the protected resources. This status reflects whether the resources are healthy, have stopped reporting, have never reported (unreported), or is unknown. 
- The solution health value is the worst of all protected resource health for resources protected by the solution. This is so that the protected resource health will be reflected in the solution level as well.
	
## 2. VA discovery flow for unprotected VMs

a. Discovery will search through all subscription VMs, and create tasks to install VA agent only if all the following conditions apply:  
- VA Policy is on  
- VM must be running
- VM must not have VA agent already installed
- We support only IaaS machines currently.  

b. These tasks will be displayed to user under "install vulnerability assessment" recommendation, through which he will be able to follow the flow, choose which VMs to install VA on and create a solution to which the resources will be linked.  
To do so, the user MUST:   
- Obtain a ticket from the VA vendor:  
	- License from Qualys  
	- Config-ZIP file from Rapid7  
- Obtain a public key from Qualys/Rapid7  
	
## 3. State machine flow
There are 3 flows:  
1. Provision VA solution  
2. Add VA protected resource  
3. Delete VA protected resource (And optionally De-provision solution)  
  

### a. Provision VA solution
Once following a "install VA agent" recommendation, the user will be shown an option to choose which VMs to install VA agent on, and will be then prompted for information regarding the solution:	 
1. Name is auto-generated since it is of no relevance (VA solutions are logical entities only and are required for Rome purposes. A license is enough to install VA agent on any VM. Therefore we only allow 1 solution per subscription & license, and group VA solutions in UI by license.)
1. Resource group
1. License (provided by Qualys/Rapid7)/Config-ZIP (Provided by Rapid7) used to install VA agent on VM
1. Public key (provided by Qualys/Rapid7) used to encrypt logging details to which messages will be send containing health and recommendations.
1. Auto-deploy- a checkbox indicating whether the user wants us to automatically install VA agents on VMs with recommendations, when available.
			
The provisioning process can be debugged using the VaProvisionStateContext  TSG. In short, it only creates entries in our tables for the solution information as well as configuration provided by user (license, public key and auto-update)
			
### b. Add VA protected resource
This state machine can be reached via two flows:
1. When creating a solution (see a. above), after the solution has been created, all VM's which were selected for VA installation will be sent to the "AddProtectedResourceStateMachine" for installation.
2. When a solution already exists, users can link a VM to the solution, which will install VA agent on in and link resource to the solution. This can be done via:
   - "Install vulnerability assessment" task and choosing an existing solution rather than creating a new one
   - Partners solution dashboard, by navigating to a solution and clicking on the "link VM" command.  
    The state machine, in a nutshell, does the following:  
      - Wait for the solution provision to complete successfully
      - Prepare data for extension installation
      - For each VM in state machine:
        1. Install VA extension on VM
        2. Query status
        3. If successful, add to repository and link to solution  

Debugging the state machine can be done via the AddProtectedResourcesContext TSG
		
### c. Delete VA protected resource
This state machine can be reached via two flows:  
When deleting a solution and all of its protected resources, and when unlinking a single VM.  
1. When deleting a solution, all of its protected resources will be sent to the "DeleteProtectedResourcesStateMachine". Once they have all been successfully removed, the solution will be deleted as well.
2. When unlinking a single resource, the resource will be deleted (see below what "deleted" means), and the solution and all other protected resources will stay intact.  

Deleting protected VA resources can be done one at a time, or all at once only.
The state machine, in a nutshell, does the following:  

For each VM in state machine:
1) Uninstall VA extension from VM
2) Query status
3) If successful, remove from repository and unlink from solution
4) If solution should be deleted as well, and all resources have been successfully deleted, delete solution as well.
				
Debugging the state machine can be done via the DeleteProtectedResourcesContext TSG
	
## 4)  VA discovery flow for protected VMs (recommendation tasks)
Once VA agent has successfully been installed on the VM, the agent will begin scanning the VM for vulnerabilities. It will then send its findings to the VA Vendor's service, (which can be in different regions regions), as well as information regarding the vulnerabilities  
Finding messages contain information about a specific vulnerability found on a specific resource, including details about the resource, the scan, and the vulnerability name and id.  
Information messages are resource-agnostic and contain static information about a specific vulnerability (name, id, product, description, solution, links, etc..)  
Messages sent to us (== sent to event hub configured during solution installation), will be consumed and validated by RDS and persisted into "VaFinding" and "VaInfo" tables.


**Our VA discovery for recommendations will run the following logic**  
1. For all VM's with resource Group/subscription policy on for VA:
   - Get all finding messages for subscription
   - Get all information messages for subscription
   - For each resource:
     1. If the resource is an existing vm (i.e has not been deleted), and the resource is a protected resource (i.e has not been unlinked from solution)
     2. Find the corresponding information messages for the for all finding messages of the resource.
     3. Merge them into a "VA recommendation" task.
  2. Return tasks

2. Tasks will appear under recommendations or virtual machine blade with title "vulnerabilities found" or "remediate vulnerabilities".
	
### Auto-Deploy
Auto-deploy is an option, configurable either at the time of solution installation or via the "partners solution-> VA solution -> configurations" blade. This option implies that the customer would like any newly discovered VM, for which a "Install VA" recommendation exists (and a solution to link it to), to be auto-resolved. 
		
Meaning, we will automatically identify a newly discovered VM, install VA agent on it, and link it to an existing security solution in the subscription for which auto-update is on. (note - if multiple solutions with the auto-update turned on exist in a subscription, the first available one will be used to install (using its license) the agent on the VM and link it to the solution.  
![MDCBYOL1.png](/.attachments/MDCBYOL1-277a9f17-b175-4ac8-97a7-c1e6ebf62b27.png =x411)
![MDCBYOL2.png](/.attachments/MDCBYOL2-f109e803-852d-44c4-aabc-6f31d2c6b1a4.png =x400)
![MDCBYOL3.png](/.attachments/MDCBYOL3-ef3a14fd-6559-4f39-91d6-a929a68828f8.png =x410)
		
####Method
		
Currently, auto-update will run in the same frequency as task discovery. i.e. - once every few minutes for online users, and once every 12 hours for offline users. This will be changed in the future to run consistently every few hours.
		
Once the agents are installed on the VM, the rest of the process and expected timeline for recommendation receival is identical to the flow of linking a VM to a solution via the UI.

# API For VA Paid Solution (BYOL)

## Creating the VA solution
### 0. Use this script from GitHub: [New-ASCVASolution.ps1](https://github.com/Azure/Azure-Security-Center/tree/master/Powershell%20scripts/Vulnerability%20Solution)
<br>  

**Alternatively use your favorite API method:**
### 1. Fetch subscription home region (location)
   - GET https://management.azure.com/subscriptions/{SubscriptionId}/providers/Microsoft.Security/locations?{apiVersion}
   - Fetch the value in "homeRegionName"
   - Alternatively user Az.Security powershell module and run "Get-AzSecurityLocation" when relevant subscription is set.

### 2. Prepare license code and public key 
   - Qualys license code is provided by Qualys
   - Rapid7 License code is the base64 representation of the config zip file provided by Rapid7
   - Public key is provided by Qualys/Rapid7  

### 3. Create the VA Security Solution:

```json
PUT https://management.azure.com/subscriptions/{SubscriptionId}/resourceGroups/{SelectedResourceGroup}/providers/Microsoft.Security/locations/{subscriptionLocation}/securitySolutions/{SelectedSolutionName}?{apiVersion} (Current: api-version=2015-06-01-preview)
		With body:
			{
			Properties:{
			Location: "$($loc)",
			Template: "rapid7.insightplatform",
			ProvisioningParameters:
			"{\"Licensecode\":\"{ConfigZipFileInBase64}\",\"publicKey\":\"{publicKey}\",\"autoUpdate\":{true/false}}"
			}
		
		Or:
			{
			Properties:{
			Location: "$($loc)",
			Template: "qualys.qualysAgent",
			ProvisioningParameters:
			"{\"Licensecode\":\"{QualysLicense}\",\"publicKey\":\"{QualysPublicKey}\",\"autoUpdate\":{true/false}}"
			}
```
	
### 4. Delete a VA BYOL Solution:  
    DELETE https://management.azure.com/subscriptions/{subscritionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Security/locations/{ASCLocation}/securitySolutions/{solutionName}/?api-version=2015-06-01-preview

\* ASC location can be fetched by ```(Get-AzSecurityLocation).Name```

for example:  
>DELETE https://management.azure.com/subscriptions/xxxxxxxx-f466-499c-a8be-85427e154baf/resourceGroups/Amit-VA/providers/Microsoft.Security/locations/westcentralus/securitySolutions/Rapid7Va1?api-version=2015-06-01-preview
 

## Adding resource to the solution
### Add VMs to the solution:
    PUT https://management.azure.com/subscriptions/{SubscriptionId}/resourceGroups/{RG}/providers/Microsoft.Security/locations/{subscriptionLocation}/securitySolutions/{SolutionName}/protectedResources?api-version=2015-06-01-preview 
With body:  
      ``[{
	ResourceAzureId: "{vmId}"
      }]``
		
		
### Script example:
```powershell  
Connect-AzAccount

function Get-AzCachedAccessToken() {
  $azProfile = [Microsoft.Azure.Commands.Common.Authentication.Abstractions.AzureRmProfileProvider]::Instance.Profile
  $currentAzureContext = Get-AzContext
  $profileClient = New-Object Microsoft.Azure.Commands.ResourceManager.Common.RMProfileClient($azProfile)
  Write-Debug ("Getting access token for tenant" + $currentAzureContext.Subscription.TenantId)
  $token = $profileClient.AcquireAccessToken($currentAzureContext.Subscription.TenantId)
  $token.AccessToken
}

$token = Get-AzCachedAccessToken

$requestHeader = @{
  "Authorization" = "Bearer " + $token
  "Content-Type" = "application/json"
}

$subscriptionId = "<Subscription Id>"
$resourceGroupName = "<Resource Group Name for resource group that Qualys solution was installed to>"
$qualysSolution = "<Qualys Solution Name>"

$loc = (Get-AzSecurityLocation).Name    
	
$instBody = @"
    [{
	ResourceAzureId: "<Azure Resource ID of VM>"
    }]
"@

$installUri = "https://management.azure.com/subscriptions/" + $subscriptionId + "/resourceGroups/" + $resourceGroupName + "/providers/Microsoft.Security/locations/" + $loc + "/securitySolutions/" + $qualysSolution + "/protectedResources?api-version=2015-06-01-preview"

Invoke-RestMethod -Uri $installUri -Method PUT -Headers $requestHeader -Body $instBody  
```

## Removing a resource from the solution
### Unlink a VM from the solution
    DELETE https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{RGName}/providers/Microsoft.Security/locations/{subscriptionLocation}/securitySolutions/{solutionName}/protectedResources/{azureResourceId}?api-version=2015-06-01-preview 

### Script Example
```powershell
Connect-AzAccount

function Get-AzCachedAccessToken() {
  $azProfile = [Microsoft.Azure.Commands.Common.Authentication.Abstractions.AzureRmProfileProvider]::Instance.Profile
  $currentAzureContext = Get-AzContext
  $profileClient = New-Object Microsoft.Azure.Commands.ResourceManager.Common.RMProfileClient($azProfile)
  Write-Debug ("Getting access token for tenant" + $currentAzureContext.Subscription.TenantId)
  $token = $profileClient.AcquireAccessToken($currentAzureContext.Subscription.TenantId)
  $token.AccessToken
}

$token = Get-AzCachedAccessToken

$requestHeader = @{
  "Authorization" = "Bearer " + $token
  "Content-Type" = "application/json"
}

$subscriptionId = "<Subscription Id>"
$resourceGroupName = "<Resource Group Name for resource group that Qualys solution was installed to>"
$qualysSolution = "<Qualys Solution Name>"

$loc = (Get-AzSecurityLocation).Name 

$azureVMID = "<Azure Resource ID of VM>"

$deleteUri = "https://management.azure.com/subscriptions/" + $subscriptionId + "/resourceGroups/" + $resourceGroupName + "/providers/Microsoft.Security/locations/" + $loc + "/securitySolutions/" + $qualysSolution + "/protectedResources" + $azureVMID + "?api-version=2015-06-01-preview"

Invoke-RestMethod -Uri $deleteUri -Method DELETE -Headers $requestHeader
```

## Listing existing BYOL Solutions 
    GET https://management.azure.com/subscriptions/{subscriptionId}/providers/Microsoft.Security/securitySolutions?api-version=2015-06-01-preview                                                                                       

## Listing all resources in the solution
### Get a list of linked VMs
    GET https://management.azure.com/subscriptions/{SubscriptionId}/resourceGroups/{RG}/providers/Microsoft.Security/locations/{subscriptionLocation}/securitySolutions/{SolutionName}?api-version=2015-06-01-preview&includeProtectedResources=true

### Script Example
```powershell
Connect-AzAccount

function Get-AzCachedAccessToken() {
  $azProfile = [Microsoft.Azure.Commands.Common.Authentication.Abstractions.AzureRmProfileProvider]::Instance.Profile
  $currentAzureContext = Get-AzContext
  $profileClient = New-Object Microsoft.Azure.Commands.ResourceManager.Common.RMProfileClient($azProfile)
  Write-Debug ("Getting access token for tenant" + $currentAzureContext.Subscription.TenantId)
  $token = $profileClient.AcquireAccessToken($currentAzureContext.Subscription.TenantId)
  $token.AccessToken
}

$token = Get-AzCachedAccessToken

$requestHeader = @{
  "Authorization" = "Bearer " + $token
  "Content-Type" = "application/json"
}

$subscriptionId = "<Subscription Id>"
$resourceGroupName = "<Resource Group Name for resource group that Qualys solution was installed to>"
$qualysSolution = "<Qualys Solution Name>"

$loc = (Get-AzSecurityLocation).Name 

$listUri = "https://management.azure.com/subscriptions/" + $subscriptionId + "/resourceGroups/" + $resourceGroupName + "/providers/Microsoft.Security/locations/" + $loc + "/securitySolutions/" + $qualysSolution + "?api-version=2015-06-01-preview&includeProtectedResources=true"

Invoke-RestMethod -Uri $listUri -Method GET -Headers $requestHeader
```

## Deploy by Policy
Unlike the Built-in VA, Solution VA (BYOL) cannot use Azure Policy to auto-deploy the old  solutions.  

Why?  
>"The way azure policy works, is that users create a policy definition – which mean that some type of a resource is assessed and found as compliant/non-compliant.  
This compliance check validates things on this resource that are specified in the definition (it can look in the resource’s data for that).  
The way it works with Built-in VA is that it checks if a resource of type “Server vulnerability assessment” (which is an extension resource of a virtual machine in the api) is existing for each virtual machine.  
A VM is not compliant if it does not have this extension resource.  
After the compliance check, comes the part of the “Effect” – some action that is done on each non-compliant resource.  
This action can be audit and it can be “deployIfNotExist” (and some other things).  
The  deployIfNotExist action calls the API action to create the missing resource type (ARM knows to make the connection because every API that is published has to go through ARM and set those values).    
The reason it works for built-in VA is that it is an extension resource, which means that first of all ARM can identify it is missing on a resource of type “Virtual machine”, and second of all – the API to provision the built-in VA is made in a single virtual machine context (so the deployIdNotExist action can just call the PUT action and it will provision VA on a VM).  
With the old BYOL VA there is a problem. The security solution (which is the resource for this type of VA) is not an extension resource. It is a resource by itself and it contains VMs that are linked to it. Which means that when the compliance check assesses the VM it will not know if it is connected to any security solution or not (at least not as far as I know).  
Also, the deployIfNotExists action for the security solution resource type does not have an easy api call to make – because in this api you first need to create a security solution and only later link VMs to it.  
To sum it up, I don’t think it is possible for the BYOL VA, hope my explanation is clear enough (I’m not 100% familiar with all the Azure policy capabilities myself).  
 
>Thanks,  
Nomi"

# Qualys license on multiple subscriptions

**Can the same Qualys license be used for multiple subscriptions?**

Yes, if the customer bought one Qualys license, the same license can be used for multiple subscriptions, what is not allowed is to use the same license in the same subscription to create 2 different solutions in the same subscription.

#CIDR and URLs
All Qualys products, such as Vulnerability Management, Policy Compliance, Cloud Agent, and more, are designed to communicate with the Qualys SOC at regular intervals to update and perform the various operations that they are meant for as a part of product functionality.  
Hence, you must include in an allow list the Qualys SOC CIDR and URLs to allow inbound and outbound traffic to enable these products to communicate seamlessly with the SOC.  
There are multiple Qualys platforms spread in different geographies of the globe. The SOC CIDR and URLs will differ based on the platform where your Qualys subscription is hosted. 
Also, you can refer to this URL https://www.qualys.com/platform-identification/ to identify your Qualys platform.

Use this allow list to the Qualys SOC CIDR and URLs
[QAG Public Servers.pdf](/.attachments/QAG%20Public%20Servers-0a0a19bb-a71e-4312-8c7f-2a9e53220f92.pdf)

---

:::template /.templates/Wiki-Feedback.md 
:::

---

:::template /.templates/Ava-GetHelp.md 
:::
