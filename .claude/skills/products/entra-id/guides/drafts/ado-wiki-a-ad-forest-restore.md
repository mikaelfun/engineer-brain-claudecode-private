---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Active Directory Disaster Recovery/Forest restore"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FActive%20Directory%20Disaster%20Recovery%2FForest%20restore"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1668270&Instance=1668270&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1668270&Instance=1668270&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This document provides a comprehensive guide for forest recovery in the event of a significant disruption to an Active Directory Forest and Child Domain. The guide includes steps for identifying backups, performing a Bare Metal Restore (BMR), and ensuring the restored system is functioning correctly. It is intended for internal use by technical staff and should not be delivered as-is to customers due to its complexity.
[[_TOC_]]

**Collaborator:** STorres

**Added and edited by:** Alemora and Sagiv

#  CSS engineers scope

The following guide should not be delivered as-is to customers, forest restore is a complex procedure and it always involves different variables and considerations, this type of cases is usually beyond CSS scope, it is recommended to engage the CSAM and work towards getting support from a Customer Engineer, especially if the restore is a result of a security breach. 

#Forest recovery considerations
Forest recovery should be run as a last resort when facing a critical Active Directory issue, security incident or extreme (natural) disaster affecting all domain controllers.

The impact is to the business is critical. In this case, all domain controllers need to be shut down and removed from the network at once. Simultaneous restores of single domain controllers per domain need to be run and coordinated in full isolation from the network, from a single DR location. 

This requires all resources of the organization and impeccable timing. In the meantime  business is unable to use AD DS as a service, almost all business processes come to a halt and results in huge monetary loss and reputation damage. Any misjudgment in execution of the Forest recovery DR steps leads to re-execution of the whole Active Directory disaster recovery process all over again.

For complex domain forests (more than 5 domains), it is important to have all backups in a single location to avoid decentralized restoring, as it is impossible to run. If domains are lacking tools and resources to restore, a decision has to be made to scrap the domain in the forest. Besides technical challenges, communication to the business and decision making have to be aligned.



#Purpose and objective

The following guide will illustrate with an example for the fictitious company "THEHOPE.COM". This disaster recovery plan (DRP) is intended to be used in the event of a significant disruption to its Active Directory Forest and Child Domain (TAX).  The goal of this plan is to outline the key recovery steps to be performed during and after a disruption to return to normal operations as soon as possible.

#Forest technical information

The Forest recovery plan should have a detailed topology map of the Forest. This map should list all information about the domain controllers, such as their names, their roles, backup status and the trust relationships. 

**Domain Controllers: (THEHOPE.COM)**

RootDC01: 192.168.0.40

RootDC02: 192.168.0.41

**Domain Controllers: (TAX.THEHOPE.COM)**

ChildDC01: 192.168.0.42

ChildDC02: 192.168.0.43

**Test Environment isolated VLAN:**

192.168.189.0/24

**IP addresses to be used in test environment:**

RootDC02: 192.168.189.41

RootDC03: 192.168.189.42

ChildDC02: 192.168.189.43

ChildDC03: 192.168.189.44

#Technical staff

**THEHOPE.COM**

First line of Response in case or a disaster: 
John Toro (General Manager)

Santos Torres (Systems Administrator)

Gaby Castillo (Jr. Systems Administrator)

**TAX.THEHOPE.COM**

Santos Torres (Systems Administrator)

Gaby Castillo (Jr. Systems Administrator)

Office.Admin (Default admin Account)

<br> 

#Identify a [Good backup](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/786584/Workflow-Active-directory-disaster-recovery?anchor=good-backup&_a=edit)

At least 1 good backup per domain is required for restoring to the pre-disaster condition.  

The following example table will help to create an inventory of the existing backup/restore tools and availability. This is the first step in creating a sound DR strategy and plan. 

| Domain | Backup product | Frequency | Target | Backup type | Virtual or physical | Time to copy | Time to restore | Backup team needed | Backup team availability |Local disaster recovery plan
|--|--|--|--|--|--|--|--|--|--|--|
|**Root(THEHOPE)** | Windows Server backup | Daily | Local Disk | Bare metal recovery (BMR) | Virtual | 2 hour | 15 minutes | No | Escalation support schedule | Yes tested yearly
|**Child1 (TAX)**| Vendor Backup | 12 hour | Filer / SAN | System state | Physical | NA | 30 minutes | Yes | Business  hours only EST | Yes untested

<br>

#Windows Server BMR Backup (Bare metal restore) and Restore Strategy for On Premises

BMR backup and recovery to locally attached storage is the fastest and the most disk space efficient solution for storing Active Directory Backups. A dedicated virtual disk can be used to store hundreds of Active Directory backups including the Operating System changes. This virtual disk can be on premises or attached to an Azure virtual machine, however BMR restores are not possible in Azure. Restoring Azure BMRs requires downloading the VHD to an on premises Hyper-V host and restoring the BMR in a Hyper-V virtual machine. 

System state backups, which are contained in the BMR backup sets, can be restored in Azure on top of the original virtual machine using DSRM but should not be used in security related recoveries as the restore process writes on top of the existing operating system which might be compromised.

The on premises enterprise backup solution or Azure Backup Vault should back up the entire dedicated virtual disk in an effective schedule, allowing offsite copying of this disk to the Active Directory test lab. This helps with regular test restores and DR document validation runs. 

The ADRES for Azure service assists in setting up the right backup solution, on premises and in Recovery Services by using the Backup Vault.



![ADDisasterRecovery_ForestRestore101.png](/.attachments/ADDisasterRecovery/ForestRestore/ADDisasterRecovery_ForestRestore101.png)

#Forest Recovery Plan:

1. Install Windows Server Backup on Production Virtual Machines:

![ADDisasterRecovery_ForestRestore1.png](/.attachments/ADDisasterRecovery/ForestRestore/ADDisasterRecovery_ForestRestore1.png)

2. Configure Windows Server Backup for a Full Server Backup:

![ADDisasterRecovery_ForestRestore3.png](/.attachments/ADDisasterRecovery/ForestRestore/ADDisasterRecovery_ForestRestore3.png)

3. Chose local E: drive for destination:

![ADDisasterRecovery_ForestRestore5.png](/.attachments/ADDisasterRecovery/ForestRestore/ADDisasterRecovery_ForestRestore5.png)

4. Chose these options for full backup:

![ADDisasterRecovery_ForestRestore7.png](/.attachments/ADDisasterRecovery/ForestRestore/ADDisasterRecovery_ForestRestore7.png)

5. Create a new Test Virtual Machine to perform BMR. (TestRootDC02)

![ADDisasterRecovery_ForestRestore9.png](/.attachments/ADDisasterRecovery/ForestRestore/ADDisasterRecovery_ForestRestore9.png)

6. Attach W2012R2 ISO and attach E: Drive from original RootDC02

![ADDisasterRecovery_ForestRestore11.png](/.attachments/ADDisasterRecovery/ForestRestore/ADDisasterRecovery_ForestRestore11.png)

7. Boot from DVD:

![ADDisasterRecovery_ForestRestore13.png](/.attachments/ADDisasterRecovery/ForestRestore/ADDisasterRecovery_ForestRestore13.png)

8. Follow defaults, click Next:

![ADDisasterRecovery_ForestRestore15.png](/.attachments/ADDisasterRecovery/ForestRestore/ADDisasterRecovery_ForestRestore15.png)

9. Pick Repair your computer:

![ADDisasterRecovery_ForestRestore17.png](/.attachments/ADDisasterRecovery/ForestRestore/ADDisasterRecovery_ForestRestore17.png)

10. Pick Troubleshoot:

![ADDisasterRecovery_ForestRestore19.png](/.attachments/ADDisasterRecovery/ForestRestore/ADDisasterRecovery_ForestRestore19.png)

11. Pick System Image Recovery:

![ADDisasterRecovery_ForestRestore21.png](/.attachments/ADDisasterRecovery/ForestRestore/ADDisasterRecovery_ForestRestore21.png)

12. Select a System Image:

![ADDisasterRecovery_ForestRestore23.png](/.attachments/ADDisasterRecovery/ForestRestore/ADDisasterRecovery_ForestRestore23.png)

13. Select a good backup and click next:

![ADDisasterRecovery_ForestRestore25.png](/.attachments/ADDisasterRecovery/ForestRestore/ADDisasterRecovery_ForestRestore25.png)

14. Attach the storage device in which the system image is stored, select the location of the good backup. And click Next:

![ADDisasterRecovery_ForestRestore27.png](/.attachments/ADDisasterRecovery/ForestRestore/ADDisasterRecovery_ForestRestore27.png)

15. Click Next:

![ADDisasterRecovery_ForestRestore29.png](/.attachments/ADDisasterRecovery/ForestRestore/ADDisasterRecovery_ForestRestore29.png)

16. Click Finish to complete the Recovery Image process:

![ADDisasterRecovery_ForestRestore31.png](/.attachments/ADDisasterRecovery/ForestRestore/ADDisasterRecovery_ForestRestore31.png)

17. Click Yes to restore all disks:

![ADDisasterRecovery_ForestRestore33.png](/.attachments/ADDisasterRecovery/ForestRestore/ADDisasterRecovery_ForestRestore33.png)

18. Let the restore continue:

![ADDisasterRecovery_ForestRestore35.png](/.attachments/ADDisasterRecovery/ForestRestore/ADDisasterRecovery_ForestRestore35.png)

Restore Issues:

- Wrong number of target disk drives 
- Inadequate target disk drive size 
- Unable to reach the source backup
- Target disk ID mix up 
- The WindowsImageBackup folder should be in the root of the source drive.
- Check Disk Layout!


19. After Restore completes, the Virtual Machine will restart (reboot may take longer than usual):

![ADDisasterRecovery_ForestRestore37.png](/.attachments/ADDisasterRecovery/ForestRestore/ADDisasterRecovery_ForestRestore37.png)

20. After successful reboot, login with your Domain Admin (Default Domain Admin credentials):

![ADDisasterRecovery_ForestRestore39.png](/.attachments/ADDisasterRecovery/ForestRestore/ADDisasterRecovery_ForestRestore39.png)

21. Verify Active Directory has restored properly:

![ADDisasterRecovery_ForestRestore41.png](/.attachments/ADDisasterRecovery/ForestRestore/ADDisasterRecovery_ForestRestore41.png)

22. Login as administrator, change domain administrator (500 account) password. All (sensitive) accounts should have new passwords in case of a security breach.:

![ADDisasterRecovery_ForestRestore43.png](/.attachments/ADDisasterRecovery/ForestRestore/ADDisasterRecovery_ForestRestore43.png)

23. Verify/Optimize (Virtual) network card settings: Use IP address from the 192.168.189.0 address pool: (For testing purposes, on an isolated lab, keep original IP configuration)

![ADDisasterRecovery_ForestRestore45.png](/.attachments/ADDisasterRecovery/ForestRestore/ADDisasterRecovery_ForestRestore45.png)

24. Verify domain name is showing on the NIC Properties. (Unidentified network will give you problems with DNS or SYSVOL. Verify if SYSVOL is shared and DNS is working properly)

![ADDisasterRecovery_ForestRestore47.png](/.attachments/ADDisasterRecovery/ForestRestore/ADDisasterRecovery_ForestRestore47.png)

25. Review Domain Administrator permissions

26. Open Command Prompt as an Admin

27. Type whoami /all to verify Domain Administrator is a member of: 
- Domain Admins
- Enterprise Admins
- Schema Admins

28. If not, add account to Domain Admins, Enterprise Admins or Schema Admins as needed.

29. Log off, log back in to refresh Kerberos token.

30. Add Registry entry: Repl Perform Initial Synchronizations: (to avoid restored DC to start searching for the old partners)

![ADDisasterRecovery_ForestRestore49.png](/.attachments/ADDisasterRecovery/ForestRestore/ADDisasterRecovery_ForestRestore49.png)

31. Seize FSMO Roles:

`Move-ADDirectoryServerOperationMasterRole -Identity DCName OperationMasterRole DomainNamingMaster,PDCEmulator,RIDMaster,SchemaMaster,InfrastructureMaster -force`

![ADDisasterRecovery_ForestRestore51.png](/.attachments/ADDisasterRecovery/ForestRestore/ADDisasterRecovery_ForestRestore51.png)

32. Delete old Domain Controllers from Active Directory Users and Computers, metadata cleanup.

33. Set domain controller SYSVOL authoritative/primary for DFSR: 
- Open ADUC, Enable Advanced Features and Users, Contacts, Groups and Computers as Containers:
- Expand Domain Controllers OU, Expand DC Name, Expan DFSR-LocalSettings, Expand Domain System Volume. Right Click SYSVOL Domain Subscription and click Properties

![ADDisasterRecovery_ForestRestore53.png](/.attachments/ADDisasterRecovery/ForestRestore/ADDisasterRecovery_ForestRestore53.png)

![ADDisasterRecovery_ForestRestore55.png](/.attachments/ADDisasterRecovery/ForestRestore/ADDisasterRecovery_ForestRestore55.png)

- Verify msDFSR-Enabled is TRUE
- Edit msDFSR-Options and change it 1

![ADDisasterRecovery_ForestRestore57.png](/.attachments/ADDisasterRecovery/ForestRestore/ADDisasterRecovery_ForestRestore57.png)

- Click OK
- Open PowerShell and type Update-DfsrConfigurationFromAD
- Restart DFSR Service
- Open Event Viewer and verify event id 4602 is present

![ADDisasterRecovery_ForestRestore59.png](/.attachments/ADDisasterRecovery/ForestRestore/ADDisasterRecovery_ForestRestore59.png)

- If 4602 does not show up. Perform an Authoritative restore for SYSVOL, screenshots provided at end of document.

34.Raise DC TestRootDC01 RID Pool:

>Open ADSI Edit, connect to default naming context:

![ADDisasterRecovery_ForestRestore61.png](/.attachments/ADDisasterRecovery/ForestRestore/ADDisasterRecovery_ForestRestore61.png)

35. Browse to the following distinguished name path: CN=RID Manager$,CN=System,DC=THEHOPE,DC=COM

![ADDisasterRecovery_ForestRestore63.png](/.attachments/ADDisasterRecovery/ForestRestore/ADDisasterRecovery_ForestRestore63.png)

36. Right-click and and select the properties of CN=RID Manager$. Select the attribute rIDAvailablePool, click Edit, and then copy the large integer value to the clipboard

![ADDisasterRecovery_ForestRestore65.png](/.attachments/ADDisasterRecovery/ForestRestore/ADDisasterRecovery_ForestRestore65.png)

- Increase value by 100,000 (Increase 6th number from right to left by 1)

![ADDisasterRecovery_ForestRestore67.png](/.attachments/ADDisasterRecovery/ForestRestore/ADDisasterRecovery_ForestRestore67.png)

37-	Invalidate Local RID Pool with the powershell commands:

``` powershell
$Domain = New-Object System.DirectoryServices.DirectoryEntry  
$DomainSid = $Domain.objectSid  
$RootDSE = New-Object System.DirectoryServices.DirectoryEntry("LDAP://RootDSE")  
$RootDSE.UsePropertyCache = $false  
$RootDSE.Put("invalidateRidPool", $DomainSid.Value)  
$RootDSE.SetInfo()
```

**PowerShell Commands: (for SERVER CORE)**

38. Get Current Rid Pool:

``` powershell
get-adobject "CN=RID Manager$,CN=SYSTEM,DC=thehope,dc=me" properties
#Raise Current Rid Pool by 100,000:
$rid=get-adobject CN=RID Manager$,CN=SYSTEM,dc=tax,dc=thehope,dc=me properties *
$rid. rIDAvailablePool
$rid. rIDAvailablePool=$rid. rIDAvailablePool+100000
Set-adobject instance $rid
#Get final Rid Pool:
get-adobject "CN=RID Manager$,CN=SYSTEM,DC=thehope,dc=me" properties *
``` 


39. Create new user to test:	
``` powershell
New-ADComputer -Name "Server01" -SamAccountName "Server01" -Path "CN=Computers,DC=thehope,DC=me"
```
Reset domain controller machine account twice:
From Admin PowerShell type: Reset-ComputerMachinePassword (twice)

![ADDisasterRecovery_ForestRestore71.png](/.attachments/ADDisasterRecovery/ForestRestore/ADDisasterRecovery_ForestRestore71.png)

40. Reset krbtgt password twice:

![ADDisasterRecovery_ForestRestore73.png](/.attachments/ADDisasterRecovery/ForestRestore/ADDisasterRecovery_ForestRestore73.png)

- 59.	Reset the trust password using Netdom for all trusts.

`NETDOM TRUST thehope.com /Domain:tax.thehope.com /ResetOneSide /pT:Password123 /uo: administrator /po:*`

- This should be done for intra-forest trusts.

- External/Forest/Realm trusts should be recreated

41. Remove Global Catalog for RootDC02:

>1. Open Server Manager, click Tools and click Active Directory Sites and Services.
>2. In the console tree, expand the Sites container, and then select the appropriate site that contains the target server.
>3. Expand the Servers container, and then expand the server object for the DC from which you want to remove the global catalog. Right-click NTDS Settings, and then click Properties.
>4. Clear the Global Catalog check box. 

![ADDisasterRecovery_ForestRestore75.png](/.attachments/ADDisasterRecovery/ForestRestore/ADDisasterRecovery_ForestRestore75.png)

- For Server Core use: `repadmin /options <DCName> -IS_GC`
- Verify eventid 1120 is shown in DFS Replication Log.

42. Update NTP settings for root PDC:

```
net stop w32time 
w32tm /config /syncfromflags:manual /manualpeerlist:"0.pool.ntp.org 1.pool.ntp.org 2.pool.ntp.org 3.pool.ntp.org" /reliable:yes /update
net start w32time
```

![ADDisasterRecovery_ForestRestore77.png](/.attachments/ADDisasterRecovery/ForestRestore/ADDisasterRecovery_ForestRestore77.png)

43. Dont Perform the W32time procedure for Child Domains.
- Only the Forest PDC should be the authoritative NTP Server, old other Domain Controllers, including the Child Domain PDCs should be set as NT5DS.

![ADDisasterRecovery_ForestRestore79.png](/.attachments/ADDisasterRecovery/ForestRestore/ADDisasterRecovery_ForestRestore79.png)

44. **Wait around 45 minutes to 1 hour after updating Child Domain trust password**

45. During the process verify that the FSMO roles holders are pointing to the new Domain Controllers, Root and Child domains as well.
- Open CMD type: `netdom query fsmo`
46. Verify replication between DCs using AD Sites and Services.

47. Verify replication using:

```
Repadmin /viewlist *
Repadmin /replsum
Repadmin /showrepls
```

- (No errors should be showing in the results)
48. **Important**: After successful replication, re-enable the Global Catalogs:
- Open CMD in each Domain Controller, type:

`Repadmin /options <dcname> +IS_GC`
- Verify entry 1119 stating that this server is a global catalog
49. If all these steps are successful, open regedit and change registry entry to 1:
Repl Perform Initial Synchronizations (in each restored DC):

![ADDisasterRecovery_ForestRestore81.png](/.attachments/ADDisasterRecovery/ForestRestore/ADDisasterRecovery_ForestRestore81.png)

50. End of Forest Recovery


#Resources:

[ADRES6.3_Delivery_Guide_V1.0.docx](/.attachments/ADDisasterRecovery/ForestRestore/ADRES6.3_Delivery_Guide_V1.0.docx)

[ADRES_THEHOPE_Active Directory_Forest_Recovery_Document.docx](/.attachments/ADDisasterRecovery/ForestRestore/ADRES_THEHOPE_Active_Directory_Forest_Recovery_Document.docx)