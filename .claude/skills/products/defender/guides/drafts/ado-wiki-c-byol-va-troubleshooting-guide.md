---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for Servers/Vulnerability Assessment/BYOL solution [retired]/[Troubleshooting Guide] - Bring Your Own License Vulnerability Assessment"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FWorkload%20Protections%2FDefender%20for%20Servers%2FVulnerability%20Assessment%2FBYOL%20solution%20%5Bretired%5D%2F%5BTroubleshooting%20Guide%5D%20-%20Bring%20Your%20Own%20License%20Vulnerability%20Assessment"
importDate: "2026-04-07"
type: troubleshooting-guide
---

**Troubleshooting Guide (TSG) - Bring Your Own License (BYOL) Vulnerability Assessment (VA)**

[[_TOC_]]

### Certain Linux Virtual Machines (VMs) are not being installed successfully, or Auto-Update does not install them.

Possible reasons:
- This is a Linux Virtual Machine (VM) with an image which wasn't taken from Marketplace.
- This is unsupported Linux Virtual Machine (VM): Vulnerability Assessment (VA) - Qualys & Rapid7 Supported Linux Publishers

### Customer has multiple Vulnerability Assessment (VA) solutions, but only sees one named "Qualys for Azure"/"Rapid7 for Azure"

Solution:

This is by design. The Vulnerability Assessment (VA) solutions are grouped by License, cross subscription, in order to provide a unified view for the customer for all of their resources in Azure that use the same Vulnerability Assessment (VA) vendor's license. Within this grouped solution, there is a detailed list of all solutions contained in the group.

### Customer has a question regarding Qualys Virtual Scanner Appliance/Rapid 7's InsightPlatform he installed via Marketplace

Solutions:

This security appliance has nothing to do with Microsoft Defender for Cloud (MDC), and should be referred to Marketplace support.
- Microsoft Defender for Cloud (MDC) supports the Qualys agent virtual machine extension, which is only available via Microsoft Defender for Cloud (MDC), and not via Marketplace.
- Rapid7's InsightAgent is available in the Marketplace! If users install the agent from Marketplace, Microsoft Defender for Cloud doesn't recommend deploying the agent on the resource and doesn't add it as a protected resource as well!

### Customer installed Vulnerability Assessment (VA) agent on a machine, installation failed, but does not see recommendation anymore

Solutions:
	
This is probably since the extension installation succeeded, but the state machine failed on timeout. This causes the virtual machine (VM) to not be discovered since it has Vulnerability Assessment (VA) agent, but not to be shown in Microsoft Defender for Cloud since it was not linked to any solution.

In Azure, navigate to the machine under virtual machines (VMs) (Arm and classic) -> click on extensions -> find Qualys agent -> click on uninstall. This should cause the virtual machine (VM) to be discovered again.

### Customer has a question about a specific Vulnerability Assessment (VA) agent scan. Why did I get it? What does it mean?

Solutions:

Questions about how the Vulnerability Assessment (VA) agent works should be directed to the Vulnerability Assessment (VA) vendor's support. For more information about how to open a case that requires debugging the agent, see Opening a case with Qualys.

### Health status of solution/resource is not reporting/unreported

This case could also be described as:  
- Virtual Machines (VMs) that were reporting vulnerability data stopped reporting. (AKA the VM is "not reporting")
- Virtual Machines (VMs) that were deployed but have no data in Qualys service and Microsoft Defender for Cloud (AKA the VM is "unreported")  

Possible reasons:  
- Resource (Virtual Machine (VM)) must be running and online in order for health messages to be sent.
- One of the protected resources is not reporting, the solution health is the aggregation of all protected resource health. Check if all protected resources are ok. If not - the solution health would be the worst of them all.
- The following query lists all the subscription's Virtual Machines (VMs) that are protected by Vulnerability Assessment (VA):

   1. If the "VmRunningState" is Running or Started- The Virtual Machine (VM) is turned off and not activated, therefore it can't send health.
   2. If "IsVaAgentInstalled" is False it means that the Virtual Machine (VM) doesn't have the Vulnerability Assessment (VA) extension installed, but is registered in the system- This is a bug and in this case, please forward the case to the Dev team.
   3. In the following cases, the customer should open a ticket with Qualys:  
         1. If the ReportedTime is "0001-01-01 00:00:00.000" it means that the resources have never reported. This is OK if the user just installed the agents. However, if this continues, the customer needs to open a ticket with Qualys.
         2. If the ReportedTime is more than a day from the current time, it means that the resources have stopped reporting.
         3. "Bad" Protection state means that there is an existing solution with the resource. The user should go to the Qualys dashboard and look for the status of this resource. This might mean that his license is over, etc.

```q
cluster("Romelogs").database("RomeTelemetry").ProtectedResourcesIngestion 
| where ProtectedType == "VaVm" | where UploadTime > ago(1d) | project AzureResourceId, ReportedTime, ProtectionState
| join kind= leftouter ( cluster("Romelogs").database("Rome3Prod").TraceEvent
| where env_time > ago(1d) | where env_cloud_role == "SecuritySolutionsServiceRole"
| where message has "VulnerabilityAssessmentDiscoveryHandler" and message has "doesNotHaveVaExtension"
| extend AzureResourceId = extract("Virtual Machine (VM) ([^:]+)", 1, message)
| extend IsVaAgentInstalled = extract("doesNotHaveVaExtension: ([^\\.]+)", 1, message)  
| summarize max(env_time) by AzureResourceId, IsVaAgentInstalled
) on AzureResourceId
| join kind= leftouter ( cluster("Romelogs").database("Rome3Prod").TraceEvent
| where env_time > ago(1d) | where env_cloud_role == "SecuritySolutionsServiceRole" | where message has "VulnerabilityAssessmentDiscoveryHandler" and message has "PowerState"
| extend AzureResourceId = extract("For Virtual Machine (VM) ([^:]+)", 1, message)
| extend VmRunningState = extract("PowerState is ([^,]+)", 1, message)
| summarize max(env_time) by AzureResourceId, VmRunningState
) on AzureResourceId
| where AzureResourceId contains "{SubscriptionId}"
| project AzureResourceId, VmRunningState, IsVaAgentInstalled, ReportedTime, ProtectionState
```

### Vulnerability Assessment (VA) recommendations of type "Add a vulnerability assessment solution" does not appear for Virtual Machines (VMs), when none of my Virtual Machines (VMs) have Vulnerability Assessment (VA) installed

This case could also be described as:
- There are Virtual Machines (VMs) in my subscription that are not being deployed with Vulnerability Assessment (VA), although I have "Auto update" activated.
  - (This means that the Virtual Machines (VMs) were not discovered as eligible for Vulnerability Assessment (VA) deployment, so they can't be deployed with Vulnerability Assessment (VA))

Possible reasons:
- Virtual Machines (VMs) do not qualify for discovery- This could be caused by the following reasons: (see conditions in Vulnerability Assessment (VA) discovery flow for unprotected Virtual Machines (VMs))
  - Operations Management Suite (OMS) agent is not installed ("isVmAgentInstalled = False" in the query below)
  - Virtual Machine (VM) is turned off
  - Vulnerability Assessment (VA) policy is "off" for the subscription or resource group.
  - Virtual Machine (VM) already has a Vulnerability Assessment (VA) agent.
  - This is a Linux Virtual Machine (VM) with an image that wasn't taken from Marketplace.

Run the query below, with the specific subscription to see why its resources weren't discovered.

```q
let subscription = "***USER SUBSCRIPTION HERE***";

TraceEvent
| where env_time > ago(1d)
| where message contains "VulnerabilityAssessmentDiscoveryHandler" and message contains subscription
| extend messageNoLocation = replace("\\[(.+?)\\]", "-", message)
| extend vmName = extract("'(.*)':",1,message )
| project env_time, messageNoLocation
| summarize argmax(env_time, *) by messageNoLocation
```

### Vulnerability Assessment (VA) health not arriving after installing Vulnerability Assessment (VA) agent  

Possible reasons:
- Vulnerability Assessment (VA) Vendor's service is down.
  - To check Qualys' availability in all regions, see: [Qualys Status](https://status.qualys.com/) (Rapid7 TBD)
  - Please allow up to 8 hours from installation for data to be populated.
  - If none of these lead to resolution, open a case with Qualys via Opening a case with Qualys instructions or with Rapid7 at [TBD]

### Vulnerability Assessment (VA) Recommendations of type "Remediate vulnerabilities (by a Vulnerability Assessment provider)" do not appear after linking a Virtual Machine (VM) with Vulnerability Assessment (VA)

Possible reasons:

- Note that recommendations will only appear if Microsoft Defender for Cloud detects at least one Virtual Machine (VM) with Vulnerability Assessment (VA) findings. Findings are sent to Microsoft Defender for Cloud with a certain delay, that could be up to 24hrs.
- Vulnerability Assessment (VA) vendor's service is down.
  - To check Qualys' availability in all regions, see: [Qualys Status](https://status.qualys.com/) (Rapid7 TBD)
  - Vulnerability Assessment (VA) agent does not have Virtual Machine (VM) scanning enabled.
  - License has exceeded the maximum number of Virtual Machines (VMs) and thus the agent does not send scans.
  - For Qualys: Should be checked with Qualys via [Qualys Support](https://www.qualys.com/support/). This is under ongoing discussion with Qualys to be reflected in the "health" sent by them.
  - Rapid7 [TBD]
  - Vulnerability Assessment (VA) Policy has been turned off for the subscription/ResourceGroup in question.

You can see which Vulnerability Assessment (VA) recommendations were discovered by running this query:

```q
TraceEvent
| where env_time > ago(1d) // Feel free to change if needed
| where message contains "VulnerabilityAssessmentRecommendationHandlerTracer" and message contains {subscriptionId} // insert here
| extend messageNoLocation = replace("\\[(.+?)\\]", "-", message)
| summarize argmax(env_time, *) by messageNoLocation // this will take most recent discover
```

"found a total of X finding messages" => should mean that X tasks were created

If not, extract the env_cv from the message, search by env_cv to see if there were any warnings or errors during the discovery.

If none of these lead to resolution, open a case with the Vulnerability Assessment (VA) vendor.

### Vulnerability Assessment (VA) recommendations not solved, even though I fixed it.

Possible reasons:
- Verify (on Customer's screen) with the customer exactly what the vulnerability is, and whether his actions solved the issue or not. It is possible that the recommendation was not correctly understood.  
Example: "DCOM enabled" vulnerability means DCOM should be disabled and is currently enabled. Users could understand this as "Enable DCOM" instead of "disable DCOM" and then wonder why, when DCOM is enabled, they still see recommendations. Going over the recommendation with the Customer would have helped identify the issue immediately and solve it.

- Vulnerability Assessment (VA) agent did not identify the issue as "solved". This can be verified by having the customer look at the Qualys portal [Qualys Support](https://www.qualys.com), logging in to his user (and region), and checking the Virtual Machine (VM) for all recommendations. If it DOES appear as active, this should be checked with Qualys support why this was not resolved. [Qualys Support](https://www.qualys.com/forms/contact-support/)
- If the recommendation is resolved in the Qualys portal, and still appears as active, this can be a bug in RDS or in portal task discovery. Check:
   - Does the task appear in 'VaFindings' table, for the subscription and Azure Id of Virtual Machine (VM), with state "active"? If so - may not have been overridden by RDS.
   - If the task is resolved, then Vulnerability Assessment (VA) task discovery should NOT discover it, and it should become resolved in the "securityTasks" table by the next discovery.

### User tried to delete a solution with more than 100 resources and the flow failed.

We currently don't support deleting a solution with more than 100 resources. The user should unlink his resources manually until it will be less than 100 resources, then try again.

### User wants to remove a solution, but the "Delete solution" button is grayed out.

User wants to link/unlink a solution, but these buttons are grayed out.

Possible reasons:

- Note that Vulnerability Assessment (VA) solution deletion takes ~ 3 minutes per Virtual Machine (VM).
- When Link/Unlink/"Delete solution" buttons are grayed out- that means that the solution is busy. A busy solution is one which is currently in a process of modification. In most cases it is in progress of linking or unlinking resources. It might be that the user tried to link or unlink a Virtual Machine (VM), or AutoUpdate is on - causing an automatic linking by the system. The user should wait for the solution to finish in order to be able to delete the solution/link/unlink a resource via the User Interface (UI).
- If the solution is stuck for a long time, it might be a bug- and should be escalated to the engineering team.

### User tried to unlink a Virtual Machine (VM) from a Vulnerability Assessment (VA) solution, but the Virtual Machine (VM) wasn't unlinked.

User tried to remove a Qualys solution, and eventually it failed and some Virtual Machines (VMs) stayed attached.

Possible reasons:

- Make sure all the protected resources of this solution are turned on. We must have the Virtual Machines (VMs) up in order to remove the Qualys extension from it.
- The following query lists all the resources that are turned off and causes this flow to fail, at a certain point of time. (Change subscription ID):

```powershell
TraceEvent 
| where env_cloud_deploymentUnit == "cus-rp-solutions-prod" 
| where message has "SUBSCRIPTION_ID_HERE" and message has "DeleteProtectedResource" and message has "isn't running or its provision state isn't succeeded"
| extend resourceId = extract("resource ([^ ]+) isn't", 1, message) 
| summarize max(env_time) by resourceId
```

### User claims his resources' health shown in Microsoft Defender for Cloud are different than what he sees in the Qualys service dashboard

Reason:
- The health statuses that are presented in Microsoft Defender for Cloud reflect whether the Qualys service is sending health to Microsoft Defender for Cloud (MDC) for this resource. What Qualys is showing in their dashboard is something completely different, defined by them, which we can't give any support to.

### Latest reporting time of a Virtual Machine (VM)

```q
cluster("Romelogs").database('Rome3Prod').FabricTraceEvent
| where env_time > ago(30d)
| where applicationName contains "sol"
| where message has "{VM resource ID}"
| where message contains "InternalSecuritySolutionsLoggingController" and message contains "Health reports"
| project env_time, message, env_cv
| distinct message, env_cv, env_time
| order by env_time desc
```

### Customer can't configure auto-provisioning of a vulnerability assessment solution because a Bring Your Own License (BYOL) solution is already configured on this subscription

1. In Azure portal, navigate to “**Defender for Cloud**”. In the left menu, navigate to “**Security solutions**” under “**Management**”  
   ![Image description: Defender for Cloud Security solutions section](https://microsoft.sharepoint.com/_api/v2.1/sites/microsoft.sharepoint.com,e67d7728-a9a4-494d-8248-ab7a513e9d54,5adf7fc0-b7c6-4ef9-8676-23eb2c617b7a/lists/df05ed33-8656-4474-838c-480f2699d72a/items/9da0f6a0-653e-431c-95d8-c2c27d4ca34b/driveItem/thumbnails/0/c960x99999/content?prefer=noRedirect,extendCacheMaxAge&clientType=modernWebPart&ow=987&oh=674&format=webp)

2. Under “Connected solutions”, you'll see Qualys Vulnerability Assessment if it is still enabled. Click on “**View**”, select your Virtual Machines (VMs), and “**unlink**”.  
   ![Image description: Qualys Vulnerability Assessment View option](https://microsoft.sharepoint.com/_api/v2.1/sites/microsoft.sharepoint.com,e67d7728-a9a4-494d-8248-ab7a513e9d54,5adf7fc0-b7c6-4ef9-8676-23eb2c617b7a/lists/df05ed33-8656-4474-838c-480f2699d72a/items/b2603158-4f9e-4a8f-b199-6f5b3929b94d/driveItem/thumbnails/0/c960x99999/content?prefer=noRedirect,extendCacheMaxAge&clientType=modernWebPart&ow=1369&oh=523&format=webp)

   ![Image description: Select VMs and unlink](https://microsoft.sharepoint.com/_api/v2.1/sites/microsoft.sharepoint.com,e67d7728-a9a4-494d-8248-ab7a513e9d54,5adf7fc0-b7c6-4ef9-8676-23eb2c617b7a/items/7bd2021c-f7ec-407a-b474-9e6c7e6ab69e/driveItem/thumbnails/0/c960x99999/content?prefer=noRedirect,extendCacheMaxAge&clientType=modernWebPart&ow=627&oh=526&format=webp)

   ![Image description: Select VMs and unlink confirmation](https://microsoft.sharepoint.com/_api/v2.1/sites/microsoft.sharepoint.com,e67d7728-a9a4-494d-8248-ab7a513e9d54,5adf7fc0-b7c6-4ef9-8676-23eb2c617b7a/items/21c97916-711e-4c1a-bb1f-af12e2914219/driveItem/thumbnails/0/c960x99999/content?prefer=noRedirect,extendCacheMaxAge&clientType=modernWebPart&ow=729&oh=475&format=webp)

3. After unlinking all Virtual Machines (VMs), delete the Qualys solution (needs **Owner** permissions on the subscription).

4. Now that Qualys is removed, you can enable the **Vulnerability assessment for machines** under the Server plan.

---

---

:::template /.templates/Wiki-Feedback.md 
:::

---

:::template /.templates/Ava-GetHelp.md 
:::
