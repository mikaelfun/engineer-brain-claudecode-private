---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/SBSL - Slow Logon/Workflow: SBSL: Scenario Based Troubleshooting/Slow Blank Desktop | Black Screen"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/SBSL%20-%20Slow%20Logon/Workflow:%20SBSL:%20Scenario%20Based%20Troubleshooting/Slow%20Blank%20Desktop%20%7C%20Black%20Screen"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/417856&Instance=417856&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/417856&Instance=417856&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**  
This document provides a detailed workflow for troubleshooting issues related to broken secure channels between Virtual Desktop Infrastructure (VDI) machines and Domain Controllers. It includes scenarios for Citrix Provisioning Services (PVS) and Windows Virtual Desktop Service, detailing causes and solutions.

[[_TOC_]]

# Scenario 1 - Abstract
This workflow outlines how to troubleshoot issues of broken secure channels between a VDI machine (such as "Citrix PVS" or "Windows Virtual Desktop Service") and a Domain Controller. The error message encountered is "The trust relationship between this workstation and the primary domain failed."

## Scoping
Comprehensive scoping questions can be found on the "Workflow: Secure Channel: Scoping" page.

## Action Plan
Always start by collecting data as suggested on the "Data Collection" page.

## Cause
To understand the cause, it is important to get familiar with what a non-persistent desktop is.  
A non-persistent VDI is created from a single golden image that gets cloned or replicated according to user demand. When users access a non-persistent desktop, their settings or data are not saved once they log out. At the end of a session, the desktop reverts back to its original state, and the user receives a fresh image the next time they log in.

### Day 1 to Day 30
During the first month, the computer manages to establish a secure channel with no issues.

- Password values from Day 1 to Day 30:

| **LSA Secret** (HKLM\SECURITY\Policy\Secrets\$machine.ACC) | **AD Computer Object**                    |
|------------------------------------------------------------|-------------------------------------------|
| **CurrVal** (The new password)  **Password1**             | **unicodepwd** (Current password)  **Password1** |
| **OldVal** (The previous password)  Null                  | **lmpwdHistory** (Previous password attribute)  Null |

### Day 30
After 30 days, 15 minutes after starting the VDI Desktop, the computer silently initiates a password change. Now the password in LSI Secret and the AD computer account's password has changed.

- Password values on the 30th day:

| **LSA Secret** (HKLM\SECURITY\Policy\Secrets\$machine.ACC) | **AD Computer Object**                                 |
|------------------------------------------------------------|--------------------------------------------------------|
| **CurrVal** (The new password)  **Password2**             | **unicodepwd** (Current password)  **Password2**      |
| **OldVal** (The previous password)  **Password1**         | **lmpwdHistory** (Previous password attribute)  **Password1** |

However, after the user logs off, the desktop reverts back to the previous state, i.e., the old password in the registry.

### Day 31
The next day, when the user logs in, they get a fresh, generic VDI from a golden image that all users share.  
The user still manages to log in because, thanks to the **lmpwdHistory**, the computer successfully establishes a secure channel.

- Password values after the user logs in:

| **LSA Secret** (HKLM\SECURITY\Policy\Secrets\$machine.ACC) | **AD Computer Object**                                 |
|------------------------------------------------------------|--------------------------------------------------------|
| **CurrVal** (The new password)  **Password1**             | **unicodepwd** (Current password)  **Password2**      |
| **OldVal** (The previous password)  Null                  | **lmpwdHistory** (Previous password attribute)  **Password1** |

Since the current SECRET values determine that 31 days have passed since the last password was changed, the computer initiates a password change once again.

- Password values:

| **LSA Secret** (HKLM\SECURITY\Policy\Secrets\$machine.ACC) | **AD Computer Object**                                 |
|------------------------------------------------------------|--------------------------------------------------------|
| **CurrVal** (The new password)  **Password3**             | **unicodepwd** (Current password)  **Password3**      |
| **OldVal** (The previous password)  **Password1**         | **lmpwdHistory** (Previous password attribute)  **Password2** |

And then again, once the user logs off, the VDI desktop reverts back to the previous state, i.e., back to square one.

### Day 32
The fresh VDI from the golden image, which the user gets now, fails to establish a secure channel, and the current SECRET does not match the passwords in the AD computer object.

| **LSA Secret** (HKLM\SECURITY\Policy\Secrets\$machine.ACC) | **AD Computer Object**                                 |
|------------------------------------------------------------|--------------------------------------------------------|
| **CurrVal** (The new password)  **Password1**             | **unicodepwd** (Current password)  **Password3**      |
| **OldVal** (The previous password)  Null                  | **lmpwdHistory** (Previous password attribute)  **Password2** |

## Solution
With pooled desktops that are based on an image and are restored to a snapshot when a user logs off, you will always have to manage this issue. The approach is to set the **Domain member: Maximum machine account password age** policy to, say, 120 days, and the expectation is that the customers are refreshing their images with security updates as part of lifecycle management at least every three months. At that time, reset to a new password using the **Reset-ComputerMachinePassword** cmdlet or join the VDI desktops to the domain.

# Scenario 2 - Citrix VDI broken secure channel PvsVMAgent
VDIs lose the trust relationship with their domains and enter the broken secure channel state once they are rebooted, and the duration specified for the machine account password age (HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\Netlogon\Parameters\ 'MaximumPasswordAge') has passed.

Consider the following example:  
A VDI machine installed with the PvsVMAgent service has its machine password age set to 30 days.  
The machine is joined to the domain, and after 30 days, _NlChangePassword_ is called (changing the machine's password). The machine is then rebooted, causing it to return to its non-persistent state. Upon the following logon, an error message indicating the machine has lost its trust relationship with the domain appears.  
Comparing the machine's password in AD using [GetADComputer_PwdLastSet.ps1](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1115733/Data-Collection-for-The-trust-relationship-between-this-workstation%E2%80%A6-?anchor=getadcomputer_pwdlastset.ps1) and the local machine's value using [GetSecret_CupdTime_from_stale_comp.ps1](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1115733/Data-Collection-for-The-trust-relationship-between-this-workstation%E2%80%A6-?anchor=getsecret_cupdtime_from_stale_comp.ps1) shows that the AD value has been updated, but the local machine's registry value is outdated.  
Checking the netlogon.log shows the machine's password successfully changed both locally and in AD.

## Scoping
Comprehensive scoping questions can be found on the "Workflow: Secure Channel: Scoping" page.

## Action Plan
Always start by collecting data as suggested on the "Data Collection" page.  
Screenshot of Procmon taken from a machine during a reboot that was set to persistent for the duration of the log collection:  
![Screenshot of Procmon taken from a machine during a reboot that was set to persistent for the duration of the log collection](/.attachments/image-2e4d95db-b952-4bb3-965c-4f3ddc354c8a.png)

## Cause
When Netlogon changes the password and updates the registry, the PVS VM Agent Service that has registered for notifications when that specific registry key is updated should receive the notification and update its ini file. This ensures that the next time the VDA reboots, it will have the up-to-date information to set those registry keys with.  
If the PVS VM Agent didnt get notified, it will have the old info in its ini file, and the next time the VDA reboots, it will set the registry keys to whatever value it knows.  

If the Workstation service lacks the dependency on the PvsVMAgent service, it will not be notified of the change and will not update its ini file, causing the **old value** to be written to the registry.  

The PvsVMAgent service dependencies should look like:  
![ PvsVMAgent service dependencies ](/.attachments/image-d4d302e6-f2c9-4ba4-81d2-6312f17a717f.png)

Workstation service dependencies should look like:  
![Workstation service dependencies](/.attachments/image-f2096dae-38bc-4f6a-af93-a66ff9bdccff.png)

## Solution
The missing dependency for the **Workstation** service on **PvsVMAgent** should be added. 
 
This change needs to be done at the base image of the machine; otherwise, it will be reverted back to the saved state.  
To add this dependency, run the following command from an elevated command prompt ( **this command is an example and should be changed according to the actual dependencies currently configured on the service and as long as the Citrix service name remains the same**):
```
sc config LanmanWorkstation depend= Bowser/MRxSmb20/NSI/pvsVMAgent
```

Edit the following registry value:
```
HKLM\SYSTEM\CurrentControlSet\LanmanWorkstation  
REG_MULTI_SZ Value DependOnService
```

**Add** "PvsVmAgent" to the list.

##Additional Information
Customer can contact Citrix support and ask for access to the following article pertaining to this issue:  
https://support.citrix.com/article/CTX249833  
https://support.citrix.com/article/CTX251326
