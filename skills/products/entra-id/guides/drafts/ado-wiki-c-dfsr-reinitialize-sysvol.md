---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/DFSR/DFSR: SYSVOL/DFSR: Reinitialize Sysvol on a DC"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FDFSR%2FDFSR%3A%20SYSVOL%2FDFSR%3A%20Reinitialize%20Sysvol%20on%20a%20DC"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1372805&Instance=1372805&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1372805&Instance=1372805&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**   
This article provides detailed steps for reinitializing the Sysvol folder on Domain Controllers (DCs) using both non-authoritative and authoritative synchronization methods. It emphasizes the importance of having a backup and outlines commands and procedures for ensuring successful replication.

[[_TOC_]]

# How to reinitialize Sysvol on a Domain Controller

It is sometimes needed to reinitialize Sysvol on a Domain Controller (DC) or multiple DCs for the entire domain. Before making any changes, always ensure you have a good backup of the Sysvol domain folder (for example, C:\Windows\Sysvol\Domain) on any DC that contains a complete set of the files. A system state backup should contain this also for disaster recovery. Making a copy on the same volume where Sysvol is located should preserve the permissions and be sufficient most of the time, but there is no substitute for a good system state backup. _**Customer must have a backup/recovery plan and solution in place**_.

The following article outlines the steps and commands: [Force authoritative and non-authoritative synchronization](https://learn.microsoft.com/en-us/troubleshoot/windows-server/group-policy/force-authoritative-non-authoritative-synchronization).

The above article and steps below reference forcing Active Directory (AD) replication multiple times. To accomplish that, do the following:

### Command Prompt

1. Log on to the Domain Controller where you are connecting to in ADSIedit.msc.
2. Open an elevated command prompt and run the following command:

   ```plaintext
   repadmin /syncall /AePd /force
   ```

### PowerShell

PowerShell does not have full parity of Repadmin at this time and requires a more complex set of commands to accomplish the same task as the above. As parity improves or we are able to work out a reliable and easily transferable to a customer command, we will update this information. For now, please use Repadmin.

## How to perform a non-authoritative synchronization of DFSR-replicated Sysvol replication (like D2 for FRS)

1. In the ADSIEDIT.MSC tool, modify the following distinguished name (DN) value and attribute on each of the domain controllers (DCs) that you want to make non-authoritative:

   ```plaintext
   CN=SYSVOL Subscription,CN=Domain System Volume,CN=DFSR-LocalSettings,CN=<the server name>,OU=Domain Controllers,DC=<domain>
   
   msDFSR-Enabled=FALSE
   ```

2. Force Active Directory replication throughout the domain.
3. Run the following command from an elevated command prompt on the same servers that you set as non-authoritative:

   ```plaintext
   DFSRDIAG POLLAD
   ```

4. You'll see Event ID **4114** in the DFSR event log indicating Sysvol replication is no longer being replicated.
5. On the same DN from Step 1, set **msDFSR-Enabled=TRUE**.
6. Force Active Directory replication throughout the domain.
7. Run the following command from an elevated command prompt on the same servers that you set as non-authoritative:

   ```plaintext
   DFSRDIAG POLLAD
   ```

8. You'll see Event ID **4614** and **4604** in the DFSR event log indicating Sysvol replication has been initialized. That domain controller has now done a **D2** of Sysvol replication.

## How to perform an authoritative synchronization of DFSR-replicated Sysvol replication (like D4 for FRS)

1. Set the DFS Replication service Startup Type to Manual, and stop the service on all domain controllers in the domain.
2. In the ADSIEDIT.MSC tool, modify the following DN and two attributes on the domain controller you want to make authoritative (preferably the PDC Emulator, which is usually the most up-to-date for Sysvol replication contents):

   ```plaintext
   CN=SYSVOL Subscription,CN=Domain System Volume,CN=DFSR-LocalSettings,CN=<the server name>,OU=Domain Controllers,DC=<domain>
   
   msDFSR-Enabled=FALSE
   
   msDFSR-options=1
   ```

3. Modify the following DN and single attribute on all other domain controllers in that domain:

   ```plaintext
   CN=SYSVOL Subscription,CN=Domain System Volume,CN=DFSR-LocalSettings,CN=<each other server name>,OU=Domain Controllers,DC=<domain>
   
   msDFSR-Enabled=FALSE
   ```

4. Force Active Directory replication throughout the domain and validate its success on all DCs.
5. Start the DFSR service on the domain controller that was set as authoritative in Step 2.
6. You'll see Event ID **4114** in the DFSR event log indicating Sysvol replication is no longer being replicated.
7. On the same DN from Step 2, set **msDFSR-Enabled=TRUE**.
8. Force Active Directory replication throughout the domain and validate its success on all DCs.
9. Run the following command from an elevated command prompt on the same server that you set as authoritative:

   ```plaintext
   DFSRDIAG POLLAD
   ```

10. You'll see Event ID **4602** in the DFSR event log indicating Sysvol replication has been initialized. That domain controller has now done a **D4** of Sysvol replication.
11. Start the DFSR service on the other non-authoritative DCs. You'll see Event ID 4114 in the DFSR event log indicating Sysvol replication is no longer being replicated on each of them.
12. Modify the following DN and single attribute on all other domain controllers in that domain:

    ```plaintext
    CN=SYSVOL Subscription,CN=Domain System Volume,CN=DFSR-LocalSettings,CN=<each other server name>,OU=Domain Controllers,DC=<domain>
    
    msDFSR-Enabled=TRUE
    ```

13. Run the following command from an elevated command prompt on all non-authoritative DCs (that is, all but the formerly authoritative one):

    ```plaintext
    DFSRDIAG POLLAD
    ```

14. Return the DFSR service to its original Startup Type (Automatic) on all DCs.  

## More information

- You can modify the following registry to point to an available source domain controller:  

  ```
  HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\DFSR\Parameters\SysVols\Seeding SysVols  
  Parent Computer (REG_SZ) = "fqdn partner"
  ```
  Source: [A newly promoted domain controller may fail to advertise after completion of DCpromo](https://learn.microsoft.com/en-us/troubleshoot/windows-server/active-directory/newly-promoted-domain-controller-fail-advertise)

- **If setting the authoritative flag on one DC, you must non-authoritatively synchronize all other DCs in the domain.** Otherwise, you'll see conflicts on DCs, originating from any DCs where you did not set authoritative/non-authoritative and restarted the DFSR service. For example, if all logon scripts were accidentally deleted and a manual copy of them was placed back on the PDC Emulator role holder, making that server authoritative and all other servers non-authoritative would guarantee success and prevent conflicts.

- **If making any DC authoritative, the PDC Emulator as authoritative is preferable, since its Sysvol replication contents are most up-to-date.**

- **The use of the authoritative flag is only necessary if you need to force synchronization of all DCs.** If only repairing one DC, make it non-authoritative and don't touch other servers.

This article is designed with a 2-DC environment in mind, for simplicity of description. If you have more than one affected DC, expand the steps to include all of them as well. It also assumes you have the ability to restore data that was deleted, overwritten, damaged, and so on previously if it's a disaster recovery scenario on all DCs in the domain.

_All screenshots, machine name references, IP addresses, and log outputs are from internal lab machines and not customer data._