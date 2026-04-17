---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Cloud PC Actions/Provisioning/CPC integrate with WDAC"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Cloud%20PC%20Actions/Provisioning/CPC%20integrate%20with%20WDAC"
importDate: "2026-04-05"
type: troubleshooting-guide
---

**Issue:**  

Received the error PowerShell Constrained Language Mode is causing provisioning to fail during the provisioning of CPCs for the Hybrid joined scenario.  

**Troubleshooting steps**

-  Check below in the Customer Environment:   
- [ ] What is the networking deployment options : Microsoft-hosted network / ANC 
- [ ] For Microsoft-hosted network : Raised an ICM to infrastructure team 
- [ ] For ANC:  Is the issue happening to the Microsoft Entra join / Microsoft Entra Hybrid Joined only, or Is the issue happening to both Microsoft Entra join and Microsoft Entra Hybrid Joined models 

- What is the Image type : Gallery Image / Custom Image 

- What is the licensing type : Frontline / Enterprise 

- Check if all of the endpoints and URLs outlined at Network requirements for Windows 365 | Microsoft Learn are whitelisted

- Areas/Information to confirm / check from the customer side (e.g. integration) 
- [ ] Any PowerShell policies being deployed via Intune / GPOs ?  Possible places including, but not limited to From DS servers and/or Group Policy management on DS servers where the CPCs resident 
- [ ] From Intune admin center : Configuration Policies, and/or Scripts and remediations section 
- [ ] Any other 1ST party services (e.g. WDAC or AppLocker) in use? In the WDAC policy xml, what is the policy settings, and/or Any specific AppLocker policies used
- [ ]  Any 3rd party tools (e.g. Cisco, Zscalar) in use? 


**CPCD logs** 
1. Under the Provision Failed Event in CPCD, get Activity ID and Error message

2. Run the below Kusto to check more details 

```kql
let activityId = "Activity ID from the Provision Failed Event ";
cluster('cloudpc.eastus2.kusto.windows.net').database('CloudPC').CloudPCEvent
| union cluster('cloudpcneu.northeurope.kusto.windows.net').database('CloudPCProd').CloudPCEvent
| where ApplicationName in ('prov', 'prov-function')
| where env_cloud_environment == "PROD"
| where ComponentName != "OperationContextHolder"  
| where ActivityId == activityId
| where (TraceLevel == 2 or ComponentName == 'ParseVmExtensionErrorActivity')
and ComponentName !in ('IntuneService', 'LoadDeviceUnregistrationContextActivity', 'ZtdAadUnjoinActivity', 'GraphClientProvider', 'DeviceUnregistrationOrchestrator', 'CleanUpOrphanResourceOrchestrator', 'TimerOrchestratorBase')
| project ActivityId, ApplicationName, env_time, AccountId, ComponentName, EventUniqueName, Message, OtherIdentifiers, Col1, Col2, Col3, Col4, Col5, Col6
| order by env_time asc 
```

**Kusto Results (example):**

"Message": ,
"OtherIdentifiers": Intune enrollment status: False, Device name:, Intune enrollment output: {"intuneDeviceId":"","intuneEnrollErrorCode":"","intuneEnrollMessage":". Ran into an exception: Cannot add type. Definition of new types is not supported in this language mode."}


**Potential Causes:**

There are several potential reasons where the PowerShell Constrained Language is enabled. Including GPOs, WDAC/AppLocker or Intune Policies 


**Potential Solutions**

- If there is any GPO / Intune Policies applying the Constrained Language Mode for PowerShell, please disable it and test again
- If Option 11 Disabled: Script Enforcement is not set in the WDAC policy xml, need to open a Collab with the WDAC team for assistance to enable/apply it.


**Collaboration tips**
Depending on where the issue is, you may require assistance from the following teams:

- **Windows Defender Application Control (WDAC):** Windows/Windows 11/Windows 11 Enterprise Multi-Session, version 23H2/Windows Setup, Upgrade and Deployment/Windows Defender Application Control (WDAC, formerly Device Guard)
- **AppLocker**: Windows/Windows 11/Windows 11 Enterprise Multi-Session, version 23H2/Remote Desktop Services and Terminal Services/Remote Desktop Connection (RDC) client (includes UWP app)
- **Intune**: Azure/Microsoft Intune/Set Up Intune 
- **OnPrem Active Directory Services** : Windows/Windows 11/Windows 11 Enterprise and Education, version 22H2/Active Directory/On-premises Active Directory domain join


**Additional information:**

PowerShell automatically runs in ConstrainedLanguage mode when it is running under a system application control policy. The WDAC policies must allow all PowerShell scripts (.ps1), modules (.psm1), and manifests (.psd1) for them to run with Full Language rights. By default, script enforcement is enabled for all WDAC policies unless the option **11 Disabled:Script Enforcement** is set in the policy.

- [Understand WDAC script enforcement](https://learn.microsoft.com/en-us/windows/security/application-security/application-control/windows-defender-application-control/design/script-enforcement)
- [About Language Modes](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_language_modes?view=powershell-7.4)
