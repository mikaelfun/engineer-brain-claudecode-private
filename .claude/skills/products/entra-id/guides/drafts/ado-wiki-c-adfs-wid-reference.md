---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/ADFS and WAP/ADFS Databases/ADFS WID Windows Internal Database"
importDate: "2026-04-06"
type: troubleshooting-guide
---

:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   
[[_TOC_]]

###Purpose ###
This is an entry for Windows Internal Database (WID) and how it relates to ADFS using WID.

## **What is WID** ##
WID is a feature in Windows Server that is used by the AD Rights Management Services (ADRM), AD Federation Services (ADFS), RDS Connection Broker, IPAM, and WSUS.  
These roles use WID, which is a small version of SQL Server, limited to 10GB size and it supports only two local connections.  
 The binaries are copied directly from SQL Server to Windows Server. 


### **WID Database versions on ADFS servers** ###

|Type | SQL versions
|--|--|
|ADFS 2.0?|Supports SQL 2005 to SQL 2008? 
|ADFS 2.1 (Server 2012 (without R2)) |Supports SQL2008/SQL2008R2/SQL2012
|ADFS 3.0?(Server 2012 R2)|Support SQL Server 2008 and higher, including SQL Server 2012 and SQL Server 2014.
|ADFS 4.0+ (Server 2016, 2019, 2022, 2025) |Supports anything from SQL 2008 to the recent version


### **WID support** ###
WID support -- SQL Server 2014 is End Of Support (EOS) on July 9, 2024.  
https://learn.microsoft.com/en-us/lifecycle/products/sql-server-2014

When WID is used on a product such as ADFS, the WID remains supported for the life of the Operating System.
However, the WID support itself, currently running on SQL Server 2014, will be EOS.

WID support for SQL 2022 escalation path is first team to contact would be Windows Server Customer Support Services (Jason Pratt), and then internally they will contact Nishanth, who will reach out to SQL Server if there is an issue.

### **Future of WID** ###

April 2025  
WID testing completed on Server 2025.
Feature will not be backported to Server 2022.  
The update will come at 5D release (last week of May 2025).

March 2025  
Regression testing took place on Server 2025 having WID on SQL 2022. 

June 2024  
The bits for Windows Server 2025 will have the new WID on either 8B or 9B Patch Tuesday release.  
ADFS PG is aware and will do regression testing.

May 2024  
An option to upgrade WID to SQL Server 2022 using v-pack is being explored.  
We will have more information on this. later in June 2024.

April 2024    
There are efforts by Windows to update WID to SQL 2022 in the Server 2025 OS.
Past that OS, they will look to backport to Server 2022, TBD.
  
## Checking WID version using SQL Server Management Studio (SSMS) ##  

On ADFS, you can find the SQL connection string if you searched for the ArtifactDbConnection entry in Get-AdfsProperties  
ArtifactDbConnection?????????????????????? : Data Source=np:**\\.\pipe\microsoft##wid\tsql\query**;Initial
???????????????????????????????????????????? Catalog=AdfsArtifactStore;Integrated Security=True
  
Open SSMS and input the following in the Server name: \\.\pipe\microsoft##wid\tsql\query  
Encryption should be: Optional  
Click Connect  
![==image_0==.png](/.attachments/==image_0==-c706e1d4-cc1e-4855-ad42-e86dd1118eb3.png) 

Expand the Databases folder, look for the appropriate Configuration DB version, right click it and choose New Query  
![2025-04-09_162201.png](/.attachments/2025-04-09_162201-cfefed9d-a539-4845-ab46-d76c8cd55206.png)

On Server 2022 with WID  
  
Enter: SELECT @@VERSION  
Click Execute

![image.png](/.attachments/image-6a92d1e9-d33c-4e50-9415-6312ae92c3d0.png)

Note, it says:  
**Microsoft SQL Server 2014** (SP2-GDR) (KB4057120) - 12.0.5214.6 (X64)?? Jan? 9 2018 15:03:12?? Copyright (c) Microsoft Corporation? **Windows Internal Database** (64-bit) on Windows NT 6.3 <X64> (Build 17763: ) (Hypervisor)

On Server 2025 with upgraded WID bits  

Enter: SELECT @@VERSION  
Click Execute
![image.png](/.attachments/image-431d7e7a-9cb5-4050-b38c-0a4b2125e251.png)

Note, it says:  
**Microsoft SQL Server 2022** (RTM-CU14) (KB5038325) - 16.0.4135.4 (X64)?? Jul 10 2024 14:09:09?? Copyright (C) 2022 Microsoft Corporation? **Windows Internal Database** (64-bit) on Windows Server 2025 Datacenter 10.0 <X64> (Build 26378: ) (Hypervisor)

## More info ##
[DCR] Update Windows Internal Database (WID) binaries from SQL Server 2022 - currently WID is using SQL Server 2014 binaries.   
https://microsoft.visualstudio.com/OS/_workitems/edit/49202659

We should refresh WID to capture SQL Server engine bugfixes that have been made over the past 8 years.
