---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows LAPS/Windows LAPS - LAPSv2/Windows LAPS - Storing Password - Active Directory/Restoring LAPS Attributes from Active Directory Backup - Windows LAPS"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Windows%20LAPS/Windows%20LAPS%20-%20LAPSv2/Windows%20LAPS%20-%20Storing%20Password%20-%20Active%20Directory/Restoring%20LAPS%20Attributes%20from%20Active%20Directory%20Backup%20-%20Windows%20LAPS"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/795299&Instance=795299&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/795299&Instance=795299&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This document guides you through the process of restoring a managed administrator password from an Active Directory backup.

[[_TOC_]]
## Restore Managed Admin Password from an Active Directory Backup

**Local Administrator Password Solution (LAPS) v1 Configuration:**  
You have a LAPS v1 or Legacy LAPS configured in your environment with the following parameters:  
- Managed account name: admin  
- Password reset or rollover occurs every 30 days  
- LAPS v1 client-side group policies are configured on the Organizational Unit (OU)  

**Consider a Scenario:**  
- A machine, Server1.contoso.com, is configured for LAPS on February 1, 2022.
- The managed local account on the machine (admin) is reset, updated with a password, and stored in Active Directory (AD).
- The server is backed up on February 10, 2022.
- This password is reset every 1st of each month.
- Today is September 22, 2022, and the server encounters a blue screen.
- The server is beyond repair, and a decision is made to restore the server from the backup.
- The backup from February 10, 2022, is restored.
- When the administrators boot the machine, the secure channel to the domain is lost.
- They need to log in to the machine as a local admin.
- They cannot use the current password as of September 22, 2022, because the server is restored from the February 10, 2022, backup.
- The goal is to know the password that was set in February 2022.
- The domain controllers are backed up every day.

### Steps to Restore the Password:

**Step 1:** Restore a system state backup or snapshot of a domain controller. The backup of the domain controller can be between February 2 and February 28, 2022. (The reason for restoring a backup between February 2 and February 28 is that on February 1, the managed admin on Server1.contoso.com set the password, and on March 1, the password was reset.)

**Step 2:** Copy the NTDS.DIT file to a domain controller to the `C:\RestoreDatabase` folder.

**Step 3:** Run the following command:  
Open an elevated command prompt.  
Browse to the `C:\RestoreDatabase` folder.

`dsamain /dbpath ntds.dit /ldapport 50001`

**Step 4:** Open an elevated command prompt and run the command:  
```powershell
PS C:\Users\Administrator> Get-LpasADPassword -Identity OnPremClient -DomainController OnPremDC.contoso.com -AsPlainText -Port 50001 -IncludeHistory
```  
![a image showing the output of the command](/.attachments/image-742e39e1-39df-4449-9a6a-07483e742f65.png)


## Need additional help or have feedback?

| **Learn more about the Windows LAPS** | **If you need more help, email DSPOD DL** | **To provide feedback to this workshop** |
|---|---|---|
| **Visit** the [Windows LAPS documentation](https://learn.microsoft.com/en-us/windows-server/identity/laps/laps-overv) | **Email** DSPOD DL | **Provide feedback** to this workshop |