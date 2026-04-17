---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/PKI - AD Certificate Services/Workflow: PKI Client/Workflow: PKI Client: Credential Roaming/Workflow: PKI Client: Credential Roaming Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/PKI%20-%20AD%20Certificate%20Services/Workflow%3A%20PKI%20Client/Workflow%3A%20PKI%20Client%3A%20Credential%20Roaming/Workflow%3A%20PKI%20Client%3A%20Credential%20Roaming%20Troubleshooting"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1753237&Instance=1753237&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1753237&Instance=1753237&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This article provides a comprehensive guide to troubleshooting issues related to Credential Roaming in Active Directory. It includes scoping questions, data collection methods, and detailed troubleshooting steps. 

[[_TOC_]]

# Scoping questions

- Schedule a remote session with the customer and give the customer the opportunity to describe the issue on their own.
- What OS version(s) is impacted?
- What users are impacted (all users, admins, non-admins, etc.)?
- What is the error received, if any?
- What is the Group Policy Object (GPO) configuration for Credential Roaming? Are local Domain Controllers (DCs) in the same Active Directory (AD) Site?
- When was the issue first noticed?
- Did any recent changes happen around this time frame?
- Where are the impacted clients located?
- How many machines/users are impacted?
- Was this working before?
- Is this issue intermittent or permanent?
- Is it reproducible? How?

# Data collection

1. Download TSS via [https://aka.ms/gettss](https://aka.ms/gettss) and extract it, for example, to c:\tmp\tss.
2. Open a PowerShell console as Administrator and run the following two commands:
Set-ExecutionPolicy -scope Process -ExecutionPolicy RemoteSigned -Force
.\TSS.ps1 -Scenario ADS_AuthEx -Procmon
3. Enter Y to allow PSR recording.
4. Wait until authentication logging is fully initialized and you see:  
Reproduce the issue and press 'Y' key AFTER finishing the repro (with window focus here) [Y]? in the PowerShell console do NOT type Y yet.
5. Open CMD as user and run: gpupdate /force
6. Open the MMC Task Scheduler console (taskschd) and manually run the task UserTask-Roam
7. In the PowerShell console where TSS was executed, type Y and press ENTER.
8. Wait for tracing and data collection to finish in the folder c:\MS_DATA  upload the ZIP file to DTM.
9. Go to the folder TSS\scripts\CRUtil and run in PowerShell as Administrator:
.\install_cru.ps1
10.  
* a. If the user has admin privileges, run:
.\get_complete_user_credroam_data.ps1 -dctouse domain_controller_name

* b. othersiwe, in PowerShell as Administrator:
.\get_user_credroam_ad_data.ps1 -dctouse domain_controller_name -username domain\username
.\cru.ps1 -dumpconfig local -username domain\username -verbose enable
11. Just wait for the scripts to finish there is no explicit stop command.
  
The following steps must be repeated for 3 scenarios (good, bad, roaming situation).  
You need to send us the generated logs:
*   TSS (default C:\MS_DATA)
*   The contents of TSS2\scripts\CRUtil

As soon as you have all the traces, please upload them to the workspace:

# Notes:

* I addition to cru.ps1 (that is coupled with DLLs and 2 TXT files and 2 ps1 scripts), there is a standalone app CRUtil.exe.
CRUtil.exe can be (and should be) used separately from the remaining files in TSS\scripts\CRUtil folder.
CRUtil.exe does not require installation (this is advantage comparing to cru.ps1 suite).
CRUtil.exe gets ONLY AD cred roam data for the given user from the given DC.
In short, CRUtil.exe is easier to use, no need to be local admin, no installation, but it gets only AD data (which could be in some cases sufficient).
CRUtil.exe is described in ALTERNATIVES section:

[ADDS: Credential Roaming: Tools: Scripts for collecting data when investigating Credential Roaming and AD DS database size increase (caused by credential roaming) scenarios](https://internal.evergreen.microsoft.com/en-us/topic/2e5615de-2b20-2e43-2dbb-8c9803486279)


      
* If installation fails with the error:

![image.png](/.attachments/image-10fac054-4331-40c6-8b92-bee610e00090.png)

      
Save the below script as Fix-CredRoamSnapins.ps1.
*   Open PowerShell as Administrator.
*   Run:  
    Set-ExecutionPolicy RemoteSigned -Scope Process  
    .\Fix-CredRoamSnapins.ps1
*   confirm by running : Get-PSSnapin -Registered

Script:

```
      
# Define the folder where your DLLs are located  
$DllPath = "C:\CredRoamUtil"  
  
# 1. Unblock all DLL files  
Write-Host "Unblocking DLL files in $DllPath..."  
Get-ChildItem -Path $DllPath -Filter *.dll | Unblock-File  
  
# 2. Register each DLL using InstallUtil  
$InstallUtil = "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\InstallUtil.exe"  
Write-Host "Registering DLLs..."  
Get-ChildItem -Path $DllPath -Filter *.dll | ForEach-Object {  
Write-Host "Registering $($_.FullName)..."  
& $InstallUtil /LogToConsole=true $_.FullName  
}  
  
# 3. Add PowerShell snap-ins (update names as needed)  
$snapIns = @("CredRoamADData", "CredRoamVRData")  
foreach ($snapIn in $snapIns) {  
try {  
Write-Host "Adding snap-in: $snapIn"  
Add-PSSnapin $snapIn -ErrorAction Stop  
} catch {  
Write-Warning "Failed to add snap-in $snapIn. Check registration."  
}  
}  
  
Write-Host "Process completed."
```


# Troubleshooting credential roaming

## AD replication

Verify replication health and status between domain controllers.

[Determine AD replication Status | Health in the Forest | Domain](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/423391/Determine-AD-replication-Status-Health-in-the-Forest-Domain)

## GPO processing

Verify Group Policy settings are applied to the user.

Expected registry keys values on a client machine if the credential roaming group policy settings have applied successfully:

```
HKEY_CURRENT_USER\Software\Policies\Microsoft\Cryptography\AutoEnrollment
- "AEPolicy"=dword:00000007
- "DIMSRoaming"=dword:00000001
- "DIMSRoamingTombstoneDays"=dword:0000003c
- "DIMSRoamingMaxNumTokens"=dword:000007d0
- "DIMSRoamingMaxTokenSize"=dword:0000ffff
```

![registry keys for credential roaming group policy](/.attachments/image-a12dda8e-09e2-4232-b8ec-0245c996eaf9.png)

**NOTE:** The credential roaming task will fire off BEFORE autoenrollment so autoenrollment does not re-enroll for certificates that are already being roamed.

## User profile

If you are using roaming profiles or folder redirection in your environment, in a large enterprise with many administrators, this could prove to be a daunting task. It will be necessary to modify these policies to configure an exclusion list in Group Policy for the roaming folders required for credential roaming.

User Configuration\Administrative Templates\System\User Profiles\Exclude directories in roaming profile: Enabled

- AppData\Roaming\Microsoft\Credentials
- AppData\Roaming\Microsoft\Crypto
- AppData\Roaming\Microsoft\Protect
- AppData\Roaming\Microsoft\SystemCertificates

You can check the following locations in the registry on the client computer manually. This is where the exclusion settings can be verified. You must check both locations below because the profile code merges the two locations.

Standard registry location:

```
HKEY_Current_User\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon
- Value name: ExcludeProfileDirs
- Data type: REG_SZ
```

Group Policy registry location:

```
HKEY_Current_User\SOFTWARE\Policies\Microsoft\Windows\System
- Value name: ExcludeProfileDirs
- Data type: REG_SZ
```

## Verify State.dat file creation

When credential roaming is enabled, there are two files created on the client machine. As a post-configuration task after Credential Roaming is configured, you should verify that there are **state.dat** and **state.da~** files in the following directory: **(%LOCALAPPDATA%\Microsoft\DIMS)**

**NOTE:** You have to make sure that you can see hidden and system files. The State.dat file acts like a traffic cop between the client machine and AD. It reconciles the certificates that are present in the user certificate store with the information that is stored in Active Directory. We can verify the last roaming timestamp on the State.dat file, which will be modified whenever the credential roaming series of events occur.

## Active Directory database size growth

Before deploying Group Policy to enable credential roaming for client computers, you should plan for the estimated growth of the Active Directory database.

Taking the necessary preliminary steps to configure credential roaming and taking the time to perform initial testing in a controlled deployment will help to eliminate headaches later.

In the **Considerations for implementing Credential Roaming** section, there is more information on key sizes and a formula to determine the potential growth of the NTDS.DIT ahead of time. Keep in mind that the use of the word Token refers to a certificate private key, certificate public key, Data Protection API (DPAPI) Master key, and, if enabled for Windows Vista, each stored username and password.

Useful command for troubleshooting: 

```
Repadmin /showobjmeta cont-dc CN=test_user,CN=Users,DC=contoso,DC=com
```

**PRESENT:** An existing linked value replication.

**ABSENT:** Unlinked value replication. The object itself will be permanently deleted from the AD database once the TSL period is reached.

**Note:** It is normal to have some **ABSENT:** values; however, when we have a massive number of **ABSENT:** entries, it would be needed to investigate the application which heavily modifies "deletions then creation". This could be investigated via process monitor mainly.
