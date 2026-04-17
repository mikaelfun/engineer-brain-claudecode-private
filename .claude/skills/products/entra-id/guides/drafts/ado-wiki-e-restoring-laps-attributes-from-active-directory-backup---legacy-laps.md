---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows LAPS/Windows LAPS - LAPSv2/Windows LAPS - Storing Password - Active Directory/Restoring LAPS Attributes from Active Directory Backup - Legacy LAPS"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Windows%20LAPS/Windows%20LAPS%20-%20LAPSv2/Windows%20LAPS%20-%20Storing%20Password%20-%20Active%20Directory/Restoring%20LAPS%20Attributes%20from%20Active%20Directory%20Backup%20-%20Legacy%20LAPS"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/782127&Instance=782127&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/782127&Instance=782127&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** 
This Document helps you to restore Managed Admin Password from an Active Directory Backup.

[[_TOC_]]


**LAPSv1 configuration:**
You have an LAPSv1 or Legacy LAPS configured in your environment with the following parameters:
- Managed account name: admin
- Password reset or roll-over occurs every 30 days
- LAPSv1 client-side group policies are configured on the OU

**Consider a scenario:**
- A machine, Server1.contoso.com, is configured for LAPS on February 1, 2022.
- The managed local account on the machine (admin) is reset and updated with a password, which is stored in AD.
- The server is backed up on February 10, 2022.
- This password is reset on the 1st of every month.
- Today is September 22, 2022, and the server encounters a blue screen.
- The server is beyond repair, and a decision is made to restore the server from backup.
- The backup from February 10, 2022, is restored.
- When the administrators boot the machine, the secure channel to the domain is lost.
- They need to log in to the machine as a local admin.
- They cannot use the current password as of September 22, 2022, because this server is restored from the February 10, 2022, backup.
- The goal is to know the password that was set in February 2022.
- The domain controllers are backed up every day.

### Step 1: Restore a System State Backup or Snapshot of a Domain Controller
The backup of the DC can be between February 2 and February 28, 2022. The reason for this is that on February 1, the managed admin on Server1.contoso.com set the password, and on March 1, the password was reset.

### Step 2: Copy the NTDS.DIT to a Domain Controller
Copy the NTDS.DIT file to the C:\RestoreDatabase folder on a domain controller.

### Step 3: Run the Command
Open an elevated command prompt and browse to the `C:\RestoreDatabase` folder.
`dsamain /dbpath ntds.dit /ldapport 50001`

**Step 4:** Open an elevated command prompt and run the command:  
```powershell
PS C:\Users\Administrator> get-adcomputer -server localhost:50001 OnPremServer -properties ms-Mcs-AdmPwd
```
![an exmaple of the output of the command above](/.attachments/image-20a8d112-8c3a-4512-95b1-957fa911e51f.png)

**Step 5:**  
```powershell
PS C:\Users\Administrator> get-adcomputer -server localhost:50001 OnPremServer -properties ms-Mcs-AdmPwd | fl ms-Mcs-AdmPwd
```

![a image showing the output of the command](/.attachments/image-94f56e17-2b64-473a-a028-f607c96d09fd.png)



## Need additional help or have feedback?

| **Learn more about the Windows LAPS** | **If you need more help, email DSPOD DL** | **To provide feedback to this workshop** |
|---|---|---|
| **Visit** the [Windows LAPS documentation](https://learn.microsoft.com/en-us/windows-server/identity/laps/laps-overv) | **Email** DSPOD DL | **Provide feedback** to this workshop |