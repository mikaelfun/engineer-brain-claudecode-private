---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Policy/Special RP considerations"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Policy%2FSpecial%20RP%20considerations"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

## Microsoft.Compute
### /virtualMachines
#### diagnosticSettings extension resource can not be enabled via Portal
This is regarding `Microsoft.Insights/diagnosticSettings` extension resource, and **not** the diagnostic settings that are available via Portal (which install an extension on the VM).

The classic diagnostic settings can only be enabled through Powershell or CLI. This is documented [here](https://learn.microsoft.com/en-us/azure/azure-monitor/vm/monitor-vm-azure#collect-platform-metrics-and-activity-log), and instructions to do this are [here](https://learn.microsoft.com/en-us/azure/azure-monitor/essentials/diagnostic-settings?tabs=CMD#create-using-powershell).

#### instanceView is not supported
Any property under instanceView is not accessible by policy, since it does not follow the `resourceType/resourceName` pattern on the API.

#### osType property is only available on GET calls
Therefore, policies that check for this property will likely omit resources during greenfield scenarios.

## Microsoft.Logic
### /workflows
#### Policy scan jobs are disabled for this resource type in some Microsoft tenant
If the user wants to test a policy definition for this resource type, they must use a non Microsoft tenant

Associated thread with reasoning for this being disabled (too many workflow resource scans): https://microsoft-my.sharepoint.com/:u:/p/hanc/EaPIkkje4xNKqL7XqI9D2VgBrACBJ9MS9awwfyChyfHTBA

Impacted tenants: 
- 72f988bf-86f1-41af-91ab-2d7cd011db47
- 33e01921-4d64-4f8c-a055-5bdaffd5e33d
- 975f013f-7f24-47e8-a7d3-abc4752bf346

## Microsoft.Network
### /networkSecurityGroups/securityRules
#### securityRules is a resource type, but also a property of the NSG
Therefore, when writing a policy that blocks security rules from being created, the policy needs to target `Microsoft.Network/networkSecurityGroups` (to block the securityRules property) but also the `Microsoft.Network/networkSecurityGroups/securityRules` resource types.

## Microsoft.Sql
### /servers/databases
#### Diagnostic Settings UI does not show all available logs
When enabling diagnostic settings through the UI, the experience will show 9 logs available, but the API supports 11 logs. This needs to be considered when writing a policy that checks all logs to be enabled, since setting up this resource through the UI will leave 2 logs in a disabled state.

According to SQL these 2 logs do not need to be enabled, since they are only supported on the **master** database, but since they are still present on the API the policy evaluation does not make a difference.

## Microsoft.PowerPlatform
#### Several resource types under this RP use logical regions
Most regions in Azure are classified as **physical** locations, these are the regions users are more familiar with since the majority of resource types in Azure are created on these physical regions.

However, Azure also has the concept of **logical** locations.

PowerPlatform RP has resource types that are created on logical regions, such as unitedstates or unitedkingdom.

Since logical regions are not common, and most resource types do not use them, several Azure experiences, such as the **locations** Azure Policy strongType hide them by default.

**These regions would need to be added directly to the parameter value via another client if these RP's resources get blocked by an allowed locations Policy.**

> Another workaround could be to duplicate the policy and remove the strongType, but that will require the user to enter the parameter values manually.

## <span>Microsoft.Web</span>
### /sites
#### PUT as PATCH
This resource provider uses PUT instead of PATCH for some partial resource changes. Policy expects a full payload on a PUT instead of a partial payload, and that means policy might evaluate `null` values on properties missing in a partial update using PUT.

If the property is expected to have a fixed value (like `true` or `false`) and not something that varies per resource, an append +deny Policy pattern might help mitigate this problem: If the property is missing, the append is triggered and it adds it with the value expected, but if the property exists with the wrong value, the deny policy would catch it.

#### siteConfig does not work on Brownfield
siteConfig can be used for Greenfield scenarios, but the compliance will always be inconsistent. This is because siteConfig properties return null on a GET operation, even if they are configured on the `Microsoft.Web/sites/config` resource.

For compliance, you would need another AINE policy that targets the `Microsoft.Web/sites/config` resource type on the details section of the policy.

### /sites/config
#### Kind property is not provided
Since function apps and app services use the same resource type, the way the resource provider tells them apart is through the `kind` property on the `Microsoft.Web/sites` resource payload. 

However, this property is not available on the `Microsoft.Web/sites/config` resource, which means, a policy that targets this resource type cannot tell apart a function app from an app service.
#### Only web.config is supported
A collection GET on the `Microsoft.Web/sites/config` resource type only returns the resource with name **web**, therefore only properties on that resource are visible to Azure Policy.

#### When creating the site, this resource is not created directly
When the app service is created, this resource would be populated directly from the siteConfig property of the parent `/sites` resource.

After the /sites/config resource is created, it can also be modified directly.

That means, a deny policy should consider both the parent (on siteConfig property) and the child resource property for a setting to be enforced properly. However, the **deny** policy on the parent would never show the right compliance because of the siteConfig brownfield limitation.
