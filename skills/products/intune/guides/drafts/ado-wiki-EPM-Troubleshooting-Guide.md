---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Endpoint Security/Endpoint Privilege Management/Troubleshooting Guide for Endpoint Privilege Management"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FEndpoint%20Security%2FEndpoint%20Privilege%20Management%2FTroubleshooting%20Guide%20for%20Endpoint%20Privilege%20Management"
importDate: "2026-04-05"
type: troubleshooting-guide
---
EPM Troubleshooting Guide

[[_TOC_]]

# Introduction
Microsoft Intune Endpoint Privilege Management (EPM) allows your organizationÆs users to run as a standard user (without administrator rights) and complete tasks that require elevated privileges.

Tasks that commonly require administrative privileges are application installs (like Microsoft 365 Applications), updating device drivers, and running certain Windows diagnostics.

## Architecture
###Overall Architecture
![](/.attachments/Security/Endpoint-Privilege-Management/tsg1.png)

###Client-Side Components/Architecture
![](/.attachments/Security/Endpoint-Privilege-Management/tsg2.png)

##EPM requirements (check this first!):
Please review the 2 public document links below:<br>
We are seeing customer cases where the very [basic prerequisites](https://learn.microsoft.com/en-us/mem/intune/protect/epm-overview#requirements) are not met or the very [basic minimum requirements](https://learn.microsoft.com/en-us/mem/intune/protect/epm-overview#getting-started-with-endpoint-privilege-management).
The basic minimum requirements are:
- You must verify they have a valid license for either Endpoint Privilege Management or Intune Suite (Assist365 >> Subscriptions) and that it is properly assigned
- They MUST deploy an EPM Client Settings policy that enables EPM
- If they do not have a default elevation behavior property set in the EPM Client Settings policy above, then they MUST have at least one Elevation Rules policy properly deployed
<br>

#Escalations such as RFC or IET requests:
==================================<br>
- **SE should first post to the EndPointSecurity Teams Channel for assistance**, _along with working with their TA/TL_, and reviewing the TSG available here. 
- Please also review the "Collect this information via the EPM Powershell cmdlet that you import" section below, too.


#? Policy displays error for "Allow Device Health Monitoring" state = noncompliant
###Screen capture of Profile Settings while in error
![](/.attachments/Security/Endpoint-Privilege-Management/tsg3.png)
###Screen capture of Settings Details showing noncompliant
![](/.attachments/Security/Endpoint-Privilege-Management/tsg4.png)
###**Troubleshooting steps**

1.  Verify youráOSáis a supported version.

    1.  á[<u>Learn about using Endpoint Privilege Management with Microsoft Intune \| Microsoft Learn</u>](https://learn.microsoft.com/en-us/mem/intune/protect/epm-overview#windows-client-requirements)

2.  Check the following registry key:

    1. **HKLM:\\SOFTWARE\\Microsoft\\PolicyManager\\current\\device\\DeviceHealthMonitoring\\ConfigDeviceHealthMonitoringScope**ácontains "**PrivilegeManagement**"

        1.  If "**PrivilegeManagement**" is not included:

            1.  Ensure you haveá**EPMáclient**á**Enabled**áiná**EPMáClient Settings,**áand it is assigned to the device.

            2.  Restartá**IME (Microsoft Intune Management Extension) service**á&gt; check registry value again

                1.  Currently Sidecar requires a restart before it picks upáEPMápolicies, this will change in the future.

3.  Verify Dual enrollment is successful.

    1.  Opená**Event Viewer &gt; Applications and Services Logs &gt; Microsoft &gt; Windows &gt; DeviceManagement-Enterprise-Diagnostics-Provider**

        1.  Search forá**Event 4023**áto verifyá**MMPC**ádual enrollment is successful.

4.  Primary reasonáMMPCádual enrollment is unsuccessful

    1.  Opená**Event Viewer &gt; Applications and Services Logs &gt; Microsoft &gt; Windows &gt; DeviceManagement-Enterprise-Diagnostics-Provider**

        1.  Search forá**Event 4022 (The endpoint address URL is invalid.)**

            1.  Ensure nothing is blocking traffic toá**\*.dm.microsoft.com**áin addition to Intune networking endpointsá[<u>Network endpoints for Microsoft Intune \| Microsoft Learn</u>](https://learn.microsoft.com/en-us/mem/intune/fundamentals/intune-endpoints)

    2.  Ensure there is no SSL inspection. The inspection of SSL traffic is not supported oná**'manage.microsoft.com', 'a.manage.microsoft.com' or 'dm.microsoft.com' endpoints**.

#? ..organization doesn't allow you to run this app as administrator

1.  You're on a supportedáOSá([<u>Learn about using Endpoint Privilege Management with Microsoft Intune \| Microsoft Learn</u>](https://learn.microsoft.com/en-us/mem/intune/protect/epm-overview#windows-client-requirements))

2.  EPMáclient is enabled. Checkáthe following registry keyá**HKLM:\\SOFTWARE\\Microsoft\\PolicyManager\\current\\device\\DeviceHealthMonitoring\\DHMScopeValue**ácontains "**PrivilegeManagement**"

    1.  a\. If "**PrivilegeManagement**" is not included:

        1.  Ensure you haveáEPMáclientá**enabled**áiná**EPMáClient Settings**áand deployed.

    2.  Restartá**IME**á&gt; check above registry value again

3. **Default**áEPMá**elevation settings**áset to "**deny all**"

#? Missing right click &gt; run as elevated menu options.

1.  Missingá**right click**á&gt;á**run as elevated**ámenu options.

    1.  On Windows 11 select "**show more options"**

        1.  This won't be required in the future.

    2.  Verify youráOSáis a supported version.

        1.  á[<u>Learn about using Endpoint Privilege Management with Microsoft Intune \| Microsoft Learn</u>](https://learn.microsoft.com/en-us/mem/intune/protect/epm-overview#windows-client-requirements)

    3.  Verify you haveá**enabled**áEPMáclient, and it is targeted at the device / user viaá**Elevation settings policy**

        1.  VerifyáEPMáclient enrollment state.

            1. **Task Scheduler &gt; Microsoft &gt; Windows &gt; EnterpriseMgmt &gt; expand EnterpriseMgmt &gt;**áIf you see twoá**GUIDs**áyour devices are enrolled.

                1.  Note it can take up to 15 minutes.

            2.  CheckáEPMáclient installation folder

                1. **C:\\Program Files\\MicrosoftáEPMáAgent**

            3.  ValidateáEPMáService is running.

                1.  Opená**Task Manager**á&gt; verifyá**EPMáService**áis running.

            4.  Validate youráEPMápolicy has been received and processed.

                1.  Navigate toá**c:\\program files\\microsoftáEPMáagent\\epmtools**

                    1.  Open the readme.txt file for directions on how to use theáEPMáPowerShelláModule

#? Missing Elevation Reporting data

1.  EPMáElevation reports take 24 hours to process/populate.

2.  Verify youráOSáis a supported version.

    1.  [<u>Learn about using Endpoint Privilege Management with Microsoft Intune \| Microsoft Learn</u>](https://learn.microsoft.com/en-us/mem/intune/protect/epm-overview#windows-client-requirements)

3.  Verifyá**EPMáReporting**ásettings are enabled iná**EPMáClient Settings**áand deployed.

    1.  Verifyá**DeviceHealthMontoringScope**ácontains "**PrivilegeManagement**"

        1. **HKLM:\\SOFTWARE\\Microsoft\\PolicyManager\\current\\device\\DeviceHealthMonitoring\\ConfigDeviceHealthMonitoringScope**ácontains "**PrivilegeManagement**

    2.  If "**PrivilegeManagement**" is not included:

4.  Ensure you haveáEPMáreportsá**enabled**áiná**EPMáClient Settings**áand deployed.

    1.  Restartá**IME**á&gt; check above registry value again

5.  Verify ifá**sensor.log**áexists in the following location.

    1. **C:\\ProgramData\\Microsoft\\IntuneManagementExtension\\Logs**

6.  Ifá**sensor.log**áis not present validate all above steps in this section and the steps identified iná**"Troubleshooting:áEPMásettings policy displays error for "Allow Device Health Monitoring" state = noncompliant"**

    1.  Searchá**sensor.log**áforá**e4cd0c46-8d75-4d93-b5ac-99cf25388591**áû This identifies the number of diagnostic events being sent to IntuneáEPMáservice.

    2.  Searchá**sensor.log**á**2ef6314a-cc15-487d-abfc-24a02cc9180f**áû This identifies the number of Elevation request being reported on

EPMáclient logs
1.  EPMáLogs:á**C:\\Program Files\\MicrosoftáEPMáAgent\\Logs**

    1.  EPM.Log û Rule Management Library, Extensibility Adapter, Interop Functions, Client Stub

    2.  EPMConsentUI.log ûáUXáforáEPMáthat pops client side (and all of the info inside of it)

    3.  EPMService.log ûáEPMáService operation, elevation facilitation, etc.

    4.  EPMServiceStub.log - Stub to launch the file post validation.

<!-- -->

1.  Sensor.log û Used to validateáEPMáis sending reporting data back into theáEPMáserviceá**C:\\ProgramData\\Microsoft\\IntuneManagementExtension\\Logs**

    1.  GUID:á**e4cd0c46-8d75-4d93-b5ac-99cf25388591**áû This identifies the number of diagnostic events being sent to IntuneáEPMáservice.

    2.  GUID:á**2ef6314a-cc15-487d-abfc-24a02cc9180f**áû This identifies the number of Elevation request being reported on



#? ForceáEPMápolicy sync

The below PS will force WinDC policies includingáEPMápolicies.
<br>**C:\\Windows\\system32\\DeviceEnroller.exe /c /declaredconfigurationrefresh**

#Collect this information via the EPM Powershell cmdlet that you import:
  
## Steps to Use the EPM Cmdlets:
1. Open PowerShell with admin privileges.
2. Go to the EpmTools folder (`cd 'C:\Program Files\Microsoft EPM Agent\EpmTools\'`).
3. Import the Epm Agent cmdlets (`Import-Module .\EpmCmdlets.dll`).

You can now verify the timestamp of the latest synced policies/collect this information for IET:

- **C:\\Program Files\\Microsoft EPM Agent\\EpmTools\\Get-Policies -PolicyType elevationrules -Verbose \| fl**
- **C:\\Program Files\\MicrosoftáEPMáAgent\\EpmTools\\Get-Policies -PolicyType clientsettings -Verbose \| fl**


  
## Available Commands:
1. **Get-Policies**: Retrieves a list of all policies received by the Epm Agent for a given PolicyType (ElevationRules, ClientSettings).
á á - Example:
á á á ```powershell
á á á Get-Policies -PolicyType ElevationRules -Verbose | Format-Table -AutoSize
á á á Get-Policies -PolicyType ClientSettings -Verbose | Format-Table -AutoSize
á á á ```
2. **Get-DeclaredConfiguration**: Retrieves a list of WinDC documents received by Declared Configuration targeting a given PolicyType (ElevationRules, ClientSettings). These are the policies targeted to the device, and for every policy, two WinDC documents are received in the device: one of type MSFTPolicies (actual policy) and one of type MSFTInventory (inventory operation).
á á - Example:
á á á ```powershell
á á á Get-DeclaredConfiguration -PolicyType ElevationRules -Verbose | Format-Table -AutoSize
á á á Get-DeclaredConfiguration -PolicyType ClientSettings -Verbose | Format-Table -AutoSize
á á á ```
3. **Get-DeclaredConfigurationAnalysis**: Retrieves a list of WinDC documents of type MSFTPolicies and checks if the policy is already present in the Epm Agent (Processed column).
á á - Example:
á á á ```powershell
á á á Get-DeclaredConfigurationAnalysis -PolicyType ElevationRules -Verbose | Format-Table -AutoSize
á á á Get-DeclaredConfigurationAnalysis -PolicyType ClientSettings -Verbose | Format-Table -AutoSize
á á á ```
4. **Get-ElevationRules**: Query the EpmAgent lookup functionality and retrieves rules given lookup and target. Currently, two kinds of lookups are supported (FileName, CertificatePayload).
á á - Example:
á á á ```powershell
á á á Get-ElevationRules -Target 0F8E191824716C293476BA7BCA6A8A3859C4E4D8C9BC261ED14086C782453701 -Lookup CertificatePayload -Verbose
á á á Get-ElevationRules -Target ccmclean.exe -Lookup FileName -Verbose
á á á ```
5. **Get-ClientSettings**: Process all existing client settings policies, analyze conflicts (multiple policies with different values for the same setting), and use hardcoded defaults if needed for policies not present or in conflict. This results in displaying the effective client settings used by the EPM Agent.
á á - Example:
á á á ```powershell
á á á Get-ClientSettings -Verbose
á á á ```
6. **Get-FileAttributes**: Retrieves File Attributes for a .exe file and extracts its Publisher and CA certificates to a set location that can be used to populate Elevation Rule Properties for a particular application. The default Hash Algorithm used is Sha256 to get the File Hash.
á á- Notes:
á á á- Cmdlet supports Catalog signed certificates.
á á á- CA Cert chain is indexed. Index 1: Root Cert, Index 2: Intermediary CA cert issued by Root Cert.
á á á- Hash Algorithms Supported: Sha256, Sha384, Sha512.
á á- Example:
á á á```powershell
á á áGet-FileAttributes -FilePath "C:\\Program Files\\Notepad++\\notepad++.exe" -CertOutputPath "C:\\Certs" -HashAlgorithm "Sha256" -Verbose
á á á```
