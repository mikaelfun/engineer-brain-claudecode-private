---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for Servers/Vulnerability Assessment/Built-in solution/MDVM - TVM/[TSG] - MDVM"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/Workload%20Protections/Defender%20for%20Servers/Vulnerability%20Assessment/Built-in%20solution/MDVM%20-%20TVM/%5BTSG%5D%20-%20MDVM"
importDate: "2026-04-07"
type: troubleshooting-guide
---

**Microsoft Defender Vulnerability Management (MDVM)  (formerly known as TVM)**

[[_TOC_]]

# Scenarios
- I enabled Auto-provisioning on my subscription with “Microsoft threat and vulnerability management”, but my Virtual machines remain unhealthy in the Microsoft Defender for Cloud recommendation **“A vulnerability assessment solution should be enabled on your virtual machines”**.
- I manually configured my Virtual Machine with the “Microsoft threat and vulnerability management” option, but my VM remains unhealthy in the Microsoft Defender for Cloud recommendation **“A vulnerability assessment solution should be enabled on your virtual machines”**.
- I allowed Microsoft defender for endpoint to access my subscription data (The integration is checked on), but I still don’t see some of my VMs’ installed applications in the MDC inventory blade.

## Details
The scenario in which a VM has been onboarded to MDVM but remains ‘unhealthy’ in the MDC VA recommendation will usually happen when we do not receive any MDVM connected data for that VM. It will usually mean that the VM is not properly onboarded to MDE the VM is not reporting to MDE due to various reasons such as connectivity issues.  
The same issue will also cause the VMs to not have the “installed applications” in the inventory blade.

## How do I troubleshoot?
1.	<u>Make sure Microsoft Defender for Endpoint integration is turned on for this subscription</u>
    - If this is a Linux Virtual Machine, please follow these steps to [Enable on Linux machines (plan/integration enabled)](https://learn.microsoft.com/en-us/azure/defender-for-cloud/enable-defender-for-endpoint#enable-on-linux-machines-planintegration-enabled)

2.	Refer to the [Defender for Cloud MDE integration documentation](https://docs.microsoft.com/en-us/azure/defender-for-cloud/integration-defender-for-endpoint?tabs=windows) and make sure the VM's OS Type is supported in the integration.
2.	<u>Find the VM’s MDE Device ID using one of these methods:</u>
    - The MDE Portal’s address for this VM:<br />
![MDCTVM2.png](/.attachments/MDCTVM2-9cdc8d38-74c2-4828-b729-59cd505f2bff.png)
    - [<b>Windows</b>] Running this powershell cmdlet on the Virtual Machine (this can run either on the VM itself, or use 'RunCommand' and then 'RunPowerShellScript' from the VM blade in the Azure Portal) and extract ‘senseId’ from output:


```powershell
Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows Advanced Threat Protection\' -Name senseId
```
   - [<b>Linux</b>] SSL into the machine, and run `mdatp health`. Extract the **'edr_machine_id'** value. 
   - If this is a Windows 2019+/Linux VM: try using table no. 5 in the dashboard (“DeviceID From GuestAgentExtensionEvents (Extension-based only)”)
   - Using <b>MDATPClientAnalyzer</b> [Kusto MachineID - InvestigationMachine - Overview](https://dev.azure.com/ASIM-Security/Endpoint%20Protection/_wiki/wikis/Defender%20for%20Endpoint/809/Kusto-MachineID-InvestigationMachine) for details.
3.	<u>Go to the dashboard:</u>
    - [VA TVM / Software Inventory CSS Dashboard](https://portal.microsoftgeneva.com/dashboard/RomeR3Prod/CSS%2520dashboards/VA%2520TVM)
    - Enter both the Azure Resource ID and the Device ID in the fields on top, select lookback time
4.	<u>Machine Health [Section 1]</u>
    - Is Machine Reporting to MDE Cloud Backend?
            - If this table is empty, or you see only partial results and it’s only reporting intermittently (which could lead to the VM changing from ‘healthy’ to ‘unhealthy’ constantly), there are issues with the VM reporting to MDE cloud backend. 
    - TVM Data For VM (TvmAssetVulnerabilitiesSnapshotCooked & TvmNaxosAssetSnapshot)
            - If the machine is reporting but there is no data in these tables – it means that the machine is communicating with MDE server, but no data is collected for this VM for some reason. 
    - If you recognize any issues with the traces above - <b>Please open a collab task with the MDE support team to investigate and include this data</b>.
5.	<u>Extension Onboarding Status [Section 2]</u>
    - Windows 2019+/Linux – make sure the onboarding status of the extension is ‘successful’. If you’re seeing an issue here – follow the [MDE integration for Windows 2019 and above and Linux TSG](https://dev.azure.com/SupportabilityWork/Azure%20Security/_wiki/wikis/Azure%20Security%20Center%20CSS%20wiki/4619/MDE-integration-for-Windows-2019-and-above-and-Linux-TSG).
    - If the onboarding status is ‘Not applicable’, use the [MDE integration for Windows 2016 and below TSG](https://dev.azure.com/SupportabilityWork/Azure%20Security/_wiki/wikis/Azure%20Security%20Center%20CSS%20wiki/4618/MDE-integration-for-Windows-2016-and-below-TSG) to make sure the agent is installed properly. (if you’re seeing data in table 6 and the ‘MissingAzureResourceId’ value is ‘false’, or you're seeing this resource is written to ARG in table 14 - you may skip this stage – it means the agent is installed and is reporting azure context data successfully). 
    - <b>Is the MMA Workspace enabled?</b> (down-level VMs only): use table 2C to see the VM's assigned MMA workspace, and check if it's enabled (more info in table 2D). If the workspace is not enabled - it's possible the customer has changed the VM's configuration manually. Changing the VM's workspace should fix the issue. 
6.	<u>Does MDE Export This VM to MDC? [Section 3]</u>
    - If you’re seeing continuous data in these tables, it means that this device is included in the export for MDC. If you’re seeing data only in the Software Inventory table (3A), it simply means that the device is healthy, and that there are no recommendations for it (which is a valid state). 
    - If MissingAzureResourceId is true in table 3A – this means that the device is exported, but without the AzureResourceId. If you’ve already established that the agent/extension is installed successfully, this indicates an issue in the flow which means that the azure context is not reported to MDE. <b>Please open a collab task with the MDE support team to investigate why the Azure context data is not sent</b>. 
    - <i>Windows 2019+/Linux only</i> - If you're seeing no data in both of these tables - make sure that Device Tags are set. This is a value which is set in the machine's registry by the extension, and sends the Azure VM ID context along with MDE scanning data. To find the VM's Device Tags, follow [this guide](https://dev.azure.com/SupportabilityWork/Azure%20Security/_wiki/wikis/Azure%20Security%20Center%20CSS%20wiki/5034/Find-VM's-MDE-Device-Tags). If device tags are not set, **please open a ticket to MDfC, for the MDE RP team**.
7.	<u>VA Resource Data and Pipeline Failures [Section 4] </u>
    - If there are no results for the selected VM, it means that the VM is not registered as one that had an onboarding attempt at all. If at least a couple of hours had passed since the VA onboarding attempt, the customer should try the onboarding again manually (via the recommendation).
    - If the VM’s entry still doesn’t appear after the second attempt, open a ticket to the server VA team.
    - If the VM’s ‘VaType’ in the result is not ‘TVM’ (e.g. QualysGrayLabel), it means that the VM is onboarded to a different VA provider such as Qualys. The customer should offboard from the existing provider and properly onboard to TVM for that VM.
    - If the VM’s ‘onboarding state’ in the result is not ‘Succeeded’, the customer should retry the TVM onboarding on the VM.
    - If none of the above steps work identified the issue – please open a ticket to the <b>Server VA team</b> and include all data collected from the dashboard.
8. <u>Is the resource on GOV? </u>
    - If the resource is onboarded on MDE, MDE Extension is provision succeeded but you don´t have MDVM data. Check if your customer is on Public Cloud or GOV. Enter this link (replace customer tenant id)
`https://login.microsoftonline.com/<customer tenant id>/.well-known/openid-configuration`

    - The following combination indicate this is a GCC customer:

      `"tenant_region_scope": "NA",` <br>
      `"tenant_region_sub_scope": "GCC",`
    - In such cases the data won´t be present on Microsoft Defender for Cloud, This is because the MDC recommendation and VA service are currently not deployed in Gov. Additionally, Gov data in MDE cannot flow to public cloud services (like our VA service) due to security constraints and isolation. Thus, even though the machines are reporting to MDE Gov cloud, the results cannot reach MDC and be presented in the public portal.

---
<br>

![MDCTVM3.png](/.attachments/MDCTVM3-c73e8fb8-0d72-4ee1-b539-5c21c4460d30.png)

##{TEMP} Recognizing VMs related to [CRI] VA CRI: 2112130060003019 - MDE - Windows 2012/2016 Taking Very Long to Send Azure Resource ID Context to MDE
- [Incident 278472443 : [CRI] VA CRI: 2112130060003019 - MDE - Windows 2012/2016 Taking Very Long to Send Azure Resource ID Context to MDE](https://portal.microsofticm.com/imp/v3/incidents/details/278472443/home)
- Using the dashboard, look at table 3A
- If the value in 'MissingAzureResourceId' is <b>true</b> (please make sure that you've entered both Azure VM Id and MDE ID at the top of the dash), then it means that we are getting the data for this VM from MDE, but its Azure VM ID is missing
- <i>Only in such case</i> could this be related to the ongoing incident. In any other cases - please open a separate ticket.
- ![MDCTVM4.png](/.attachments/MDCTVM4-1a826c28-b69c-43d8-ac27-4dba70654668.png)

##How to Validate what VA Solution is installed.
Kusto Query
```
////Identify VA Solution
cluster('romelogs.kusto.windows.net').database('RomeTelemetry').GrayLabelResources
| where UploadTime > ago(1d)
| where SubscriptionId == "{SubscriptionId}"
| where AzureId contains "/{ResourceId}"
| project UploadTime, SubscriptionId, AzureId, OsInfo, OnBoardingState, VaType
| order by UploadTime
```
Results
![MDCTVM6.png](/.attachments/MDCTVM6-c3feda94-e010-41ff-9f26-e8ce4547f01e.png)

### Onboarding and offboard TVM
TVM is part of MDE agent (SENSE) and to activate TVM, the resource must be onboarded to MDE.  
MDC collects TVM data in any case, even if customer uses other VA solution (e.g., built-in Qualys).  
When customer chooses TVM as the VA solution then MDC publish the TVM findings instead of the other solutions.  
- By enabling TVM Auto-provisionig there is an internal API (AzureServerSetting) that enables the TVM data streamed for MDC.
- To check the current VA provider:  
`GET https://management.azure.com/subscriptions/<subscriptionId>/providers/Microsoft.Security/serverVulnerabilityAssessmentsSettings/AzureServersSetting?api-version=2022-01-01-preview`

   Example response:
   ```json
     "properties": {
        "selectedProvider": "MdeTvm"
    },
    "systemData": {
        "createdBy": "elsagie@microsoft.com",
        "createdByType": "User",
        "createdAt": "2022-10-03T08:13:37.9286463Z",
        "lastModifiedBy": "someone@microsoft.com",
        "lastModifiedByType": "User",
        "lastModifiedAt": "2022-10-03T08:13:37.9286463Z"
    },
    "kind": "AzureServersSetting",
    "name": "AzureServersSetting",
    "type": "Microsoft.Security/serverVulnerabilityAssessmentsSettings",
    "id": "/subscriptions/<subscriptionId>/providers/Microsoft.Security/serverVulnerabilityAssessmentsSettings/AzureServersSetting"
   ```

   If 404 response:  
   ```json
    "error": {
        "code": "NotFound",
        "message": "A ServerVulnerabilityAssessmentsSettings resource of the kind: AzureServersSetting was not found for the subscription: 95a23c10-d404-4e08-85c2-0db5b8b67132"
       }
   ```
  It is probably BYOL solution.

#### Onboarding options  

1. Defender plans - Servers - Settings - Vulnerability assessment for machines - Edit configuration:  
select Microsoft Defender vulnerability management.  
**This will deprovision TVM from all subscription's VMs.**
  
2. Using API
   `PUT https://management.azure.com/subscriptions/<subscriptionId>/providers/Microsoft.Security/serverVulnerabilityAssessmentsSettings/AzureServersSetting?api-version=2022-01-01-preview`

   With Content-Type:application/json
   ``` json
   {
       "kind": "AzureServersSetting",
       "properties": {
       "selectedProvider": "MdeTvm"
      }
   }
   ```
3. Using policy
   1. Disable the auto-provisioning
   1. Assign policy definition "Configure machines to receive a vulnerability assessment provider" (id: 13ce0167-8ca6-4048-8e6b-f996402e3c1b)
   1. Set "Vulnerability assessment provider type" parameter to mdeTvm:  
   ![MDCTVM5.png](/.attachments/MDCTVM5-9ef6c057-a41a-4bb9-bc37-1c80e554c0d3.png)
        
      ('default' is for built-in Qualys)


---
#### "Offboard" TVM
   - Turn off Auto-provisioning (Settings & monitoring -> Turn off the "Endpoint protection" component) or switch it to different scanner
   - If a single VM is still using TVM as the VA solution, to remove use:  
`DELETE https://management.azure.com/<resourceId>/providers/Microsoft.Security/serverVulnerabilityAssessments/mdeTvm?api-Version=2015-06-01-preview`


<!-- ask Avishalom to review the above and what this is for?
Offboarding is currently available only from API- which is an easy DELETE request on:  `https://management.azure.com/<resourceId>/providers/Microsoft.Security/serverVulnerabilityAssessments/mdeTvm?api-Version=2020-01-01` -->


<!--Original doc of this TSG is [here](https://microsofteur-my.sharepoint.com/:w:/g/personal/nogoro_microsoft_com/ETdoIWvpBStBjPSZDjyoI5oBxKhc1MWJYMg9GQFneUVxeQ?e=7pxafX)</font> -->

#### **Example (To be executed from Azure Cloud Shell's Bash Terminal)**

To get authorization (Per [Acquire and use access token in Cloud Shell
](https://learn.microsoft.com/en-us/azure/cloud-shell/msi-authorization#acquire-token)):

```
response=$(curl http://localhost:50342/oauth2/token --data "resource=https://management.azure.com/" -H Metadata:true -s)
access_token=$(echo $response | python -c 'import sys, json; print (json.load(sys.stdin)["access_token"])')
echo The access token is $access_token
```

Then:

- **To "offboard" MDVM for a  single VM:**

  ```
  curl -i -X DELETE https://management.azure.com/<resourceId>/providers/Microsoft.Security/serverVulnerabilityAssessments/mdeTvm?api-Version=2015-06-01-preview -H "Authorization: Bearer $access_token" -H "x-ms-version: 2019-02-02"
  ```

- **To "offboard" MDVM for a subscription:**

  Note: The call below disables the  VA auto provisioning setting. It does not only offboard the machines from MDVM
  ```
  curl -i -X DELETE  
  https://management.azure.com/subscriptions/<SubscriptionID>/providers/Microsoft.Security/serverVulnerabilityAssessmentsSettings/AzureServersSetting?api-version=2022-01-01-preview -H "Authorization: Bearer $access_token" -H "x-ms-version: 2019-02-02"
  ```

---

<!--Original doc of this TSG is [here](https://microsofteur-my.sharepoint.com/:w:/g/personal/nogoro_microsoft_com/ETdoIWvpBStBjPSZDjyoI5oBxKhc1MWJYMg9GQFneUVxeQ?e=7pxafX)</font> -->

#Additional resource
- [Microsoft Defender for Servers - CVE Dashboard](https://aka.ms/CVEDashboard)

---

:::template /.templates/Wiki-Feedback.md 
:::

---

:::template /.templates/Ava-GetHelp.md 
:::
