---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows Hello and Modern Credential Providers/WHfB/WHFB: Data Collection"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Windows%20Hello%20and%20Modern%20Credential%20Providers/WHfB/WHFB%3A%20Data%20Collection"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/430676&Instance=430676&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/430676&Instance=430676&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**   
This document provides guidelines for data collection for a windows hello for business logon problem, during the troubleshooting process. It includes detailed instructions on where, how, and when to collect data, as well as specific scripts and tools to use. The document also outlines advanced troubleshooting techniques and notes on commonly used logs.

[[_TOC_]]

# Data collection

In this guide, you will learn how to collect data effectively during the scoping phase to ensure an accurate setup and problem description. This may include rescoping the case or changing the case type.

## Where to collect data

Start with the client device and then move to the domain controller (DC) if needed.

## How to collect data

We have a common approach for simplified data collection. **Please ensure to only use the latest version of scripts!**

### Auth script

**Always use the Verbose mode (-vauth)!**

It is mandatory to utilize the -vauth switch to capture information from client devices to collect data covering connections to Azure endpoints when troubleshooting device registration, Azure Active Directory Primary Refresh Token (AAD PRT), and Password-less Sign-in or authentication issues (Windows Hello for Business (WHfB), Fast Identity Online (FIDO)).

```powershell
Start-auth -vauth -acceptEULA  
Stop-auth.ps1
```

- The script can be downloaded from [here](https://cesdiagtools.blob.core.windows.net/windows/Auth.zip) or [here](https://aka.ms/authscripts).
- For more information, visit [ADDS: Security: WHFB: Tools: Scripts for collecting data when investigating Windows Authentication, Hybrid Identity, and related scenarios](https://internal.evergreen.microsoft.com/topic/944d1348-83b9-87c0-7ef4-1d76b5c2e5f9).

### TSS

```powershell
.\TSS.ps1 -Start -Scenario ADS_AUTH
```

This scenario contains the same set of logs as the auth script using the command `Start-auth -v`.

- The script can be downloaded from [here](https://aka.ms/gettssv2).
- For more details, visit [Windows ADS TSSv2](https://internal.evergreen.microsoft.com/en-us/topic/a22d8100-3f02-3972-0e0d-760cafc1843a).

### Important notice

The batch file versions of the auth scripts (start-auth.bat / Stop-auth.bat) **have been decommissioned and should no longer be used or distributed.** The batch file versions were decommissioned as per instructions from the Trust & Integrity Protection (TrIP) team, as part of an Application Risk Assessment (ARA). Further communications will be sent out to Customer Service and Support (CSS) regarding the use of unsigned tools or scripts. 

Please ensure that only the PowerShell version of the auth scripts are used after July 11, 2021. The PowerShell version of the auth scripts is code signed to ensure that the customer can trust that they come from Microsoft and that they have not been altered. 

The scripts should be sent out to the customers without any changes to ensure that the digital signature remains valid and can be validated by the customer. The scripts should be made available to the customer by uploading them to the Diagnostic and Troubleshooting Manager (DTM) workspace associated with the case you are working on.

## When to collect data

Collect data while reproducing the issue. Once you obtain the logs, you can either:
- [Read some insights](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/430674/Workflow-WHFB-References) to refresh your memory.
- Start to verify the configuration: [Group Policy Objects (GPOs)](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/430702/WHFB-GPO).

### Advanced troubleshooting: Auth script and IDNA

In some scenarios, like PIN reset ("I forgot my PIN"), you may need an IDNA capture of logonui.exe. Here is the complete action plan:

1. Install IDNA (`\\dbg\privates\LKG\partner`).
2. Use auth scripts.
3. Log in as admin and start the auth script and configure IDNA to collect logonUI.exe.
4. When it is launched: `tttracer -onlaunch logonui.exe -out c:\ttt`.
   - **Note**: `c:\ttt` is the directory where TTTracer.exe is installed  you can change `c:\ttt` to whatever you want.
5. Log in as user and lock the screen  select "forgot my pin" and go through the process.
6. Once it is complete, record the result and log off the user.
7. Log in as admin and stop the auth scripts.
8. Then stop the logonUI IDNA: `tttracer -delete logonui.exe`.
9. Save all the IDNA files (logonUI*.run and logonui*.out) and the auth scripts and make them available.

### Biometric issue

For biometric issues, collect the status using:
```cmd
pnputil.exe /export-pnpstate c:\temp\pnpexport.pnp
```

### Notes on commonly used logs from auth script

- **Kerberos.etl**: Shows error codes, in hex, received from a DC or authentication point. Know what identity was trying to authenticate and what it was trying to reach (what SPN, URL, etc). Do not just blindly search for "fail" or "error."
- **KDC.etl**: Important data to collect from a DC when the KDC service is returning an error. Reveals more information about why the KDC failed to find a SPN, route a UPN, etc.
- **Dsregcmd**: Details regarding device state, user state, and NGC state.
- **Cert_MPassportKey.txt**: Export of certificates stored in WHFB location.
- **Hfb_Oper.evtx**: Details regarding provisioning processes.
- **NgcPolicyGp-key.txt / NgcPolicyGpUser-key.txt**: GPO settings applied on the devices related to WHFB.

### Extra tools

- **Azure support center**: You can grab some details regarding the objects stored in Azure AD: [Azure Support Center](https://azuresupportcenter.msftcloudes.com/ticketdetails).
  - **Requirements**: [CSS Access to Azure Support Center](https://azsupportdocs.azurewebsites.net/asc/articles/ASCAccess.html).
  - To be performed by the customer: [Allow collection of advanced diagnostic information](https://docs.microsoft.com/en-us/azure/azure-portal/supportability/how-to-manage-azure-support-request#allow-collection-of-advanced-diagnostic-information).

- **WHfbTools PowerShell module on PowerShellGallery.com**: This can be used to query the date of WHfB keys in Azure AD and ADDS.
  - Install using:
    ```powershell
    Install-Module WHfBTools
    Install-Module -Name MSAL.PS -RequiredVersion 4.5.1.1
    Install-WindowsFeature -Name RSAT-AD-Tools
    ```
  - For On-Premises Hello deployment:
    ```powershell
    Get-ADWHfBKeys -Logging -Report -Domain sc | Out-GridView
    Get-ADWHfBKeys -Logging -Report -Domain sc | Export-Csv C:\ADKeys.csv
    ```

- **DSInternals**:
  - **Note**: Features exposed through this module are not supported by Microsoft and are not intended to be used in production environments. Improper use might cause irreversible damage to domain controllers or negatively impact domain security.
  - Install using:
    ```powershell
    Install-Module -Name DSInternals -RequiredVersion 4.1
    ```
  - NuGet provider is required to continue:
    ```powershell
    Install-PackageProvider -Name NuGet -MinimumVersion 2.8.5.201 -Force
    ```
  - Example usage:
    ```powershell
    get-aduser -Identity whfbhkt1 | get-adobject -Properties msds-keycredentiallink | select-object -ExpandProperty msds-keycredentiallink | get-keycredential
    ```

    Output:
    | Usage | Source | Flags | DeviceId | Created | HolderDN |
    |:--:|:--:|:--:|:--:|:--:|:--:|
    | NGC | AzureAD | None | b83xx-xx-xx-xx-xxxc54d6 | 2020-02-26 | CN=whfbhkt1,OU=Accounts,DC=adforest1,DC=com |

- **Graph Explorer**: In Azure AD, using Graph Explorer, you can see the _devicekey_ where it was originally created: in Azure AD. [Graph Explorer](https://graph.microsoft.com/beta/users/user@domain.com).

![Workflow_WHFB_Data_Collection_1.png](https://supportability.visualstudio.com/d71be795-62a4-4613-9918-217237a648ba/_apis/git/repositories/7d4ee831-cd65-46bb-9527-bae6917085be/Items?path=%2FWindowsDirectoryServices%2F.attachments%2FWHfB%2FWorkflow_WHFB_Data_Collection_1.png&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1&sanitize=true&versionDescriptor.version=master)

- **Identify convenience PIN users**: Check GPO settings to clarify (Turn on convenience PIN sign-in policy).
  - Enabled Value: decimal: 1
  - Disabled Value: decimal: 0
  - Setting type: Machine
  - Supported On: At least Windows Server 2012, Windows 8, or Windows RT
  - Key: `HKLM\Software\Policies\Microsoft\Windows\System`
  - Value: `AllowDomainPINLogon`
  - Admx: `CredentialProviders.admx`