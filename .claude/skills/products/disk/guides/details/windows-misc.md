# Disk Windows Server Misc KB — 详细速查

**条目数**: 12 | **类型**: 📊 速查（无融合素材）
**生成日期**: 2026-04-07

---

### 1. Windows Storage Server 2016 may result in a Bugcheck 0xD1 during installation on a server with more 

**分数**: 🔵 7.5 | **来源**: [KB] | **置信度**: medium
**21V 适用**: ✅ 是

**根因**: This is by design. Windows Storage Server 2016 has system requirements with a maximum of two CPU sockets.

**方案**: The workaround is to install Windows Server 2016 Standard or Windows Server 2016 Datacenter. Once installed Storage Services may be deployed. Windows Server Standard and Windows Server Datacenter do not have the same processor limits.

**标签**: unknown, contentidea-kb

---

### 2. **:**  OS (Windows Storage Server 2016) 9  Log Name: {Namepii}  Source: Microsoft-Windows-Distribute

**分数**: 🔵 7.5 | **来源**: [KB] | **置信度**: medium
**21V 适用**: ✅ 是

**根因**: KM review showed that it was not following the MS Writing Style

**方案**: converted the article into a format approved by the M Writing Style

**标签**: unknown, contentidea-kb

---

### 3. 2 DFSR Servers running Windows Server 2016, both upstream and downstream.We do see that Access is de

**分数**: 🔵 7.5 | **来源**: [KB] | **置信度**: medium
**21V 适用**: ✅ 是

**根因**: We found below errors in the DFSR Debug logs after we manually zipped them and got it uploaded. gvsn:{09D00EE9-E86D-47CD-AE96-04C6FE55A04B}-v16110110 connId:{4328CFFE-B55F-452E-B2AC-139202FD8AB8} csName:(foldername)20190617 17:13:35.130 14136 MEET 1426 Meet::Install -> WAIT Error processing update. updateName:ACCDDSF.DLL uid:{09D00EE9-E86D-47CD-AE96-04C6FE55A04B}-v16110110 gvsn:{09D00EE9-E86D-47CD-AE96-04C6FE55A04B}-v16110110 connId:{4328CFFE-B55F-452E-B2AC-139202FD8AB8} csName:<RFname>csId:{52545321-0A82-4E70-9D96-B8EEDD005BF9} code:5 Error:+ [Error:5(0x5) Meet::InstallStep meet.cpp:1889 14136 W Access is denied.]+ [Error:5(0x5) Meet::InstallRename meet.cpp:3286 14136 W Access is denied.]+ [Error:5(0x5) NtfsFileSystem::Move ntfsfilesystem.cpp:1223 14136 W Access is denied.]+ [Error:5(0x5) NtfsFileSystem::Move ntfsfilesystem.cpp:1034 14136 W Access is denied.]+ [Error:5(0x5) FileUtil::RenameByHandle fileutil.cpp:376 14136 W Access is denied.]similar issues reported and found to be due to some FSRM components. In our case customer has FSRM configured on the DFSR replication members. They have hard quota, later configured soft quota.

**方案**: After removing the FSRM components from the downstream server the replication backlogs just finished in few hours.

**标签**: Content Idea Request, contentidea-kb

---

### 4. AbstractCustomer is trying to configure NTFS volume mount points up to 100 on Windows Server 2016. f

**分数**: 🔵 7.5 | **来源**: [KB] | **置信度**: medium
**21V 适用**: ✅ 是

**根因**: This is by design.

**方案**: A DCR has been filed to request the design change. https://microsoft.visualstudio.com/OS/_workitems/edit/23057887

**标签**: Content Idea Request, contentidea-kb

---

### 5. Multiple VMs on same CSV: after network disconnection under 2 minutes, some VMs recover while others

**分数**: 🔵 7.5 | **来源**: [KB] | **置信度**: medium
**21V 适用**: ✅ 是

**根因**: VM Storage resiliency is out of sync - the recovery is pended for CsvFsHandleLmrWaitForActive and keeps looping even though CSV is active.

**方案**: Bug has been filed with product group.

**标签**: kb, contentidea-kb

---

### 6. Mapping drive to Azure Files SMB endpoint fails with error 53 (0xC000000D STATUS_INVALID_PARAMETER) 

**分数**: 🔵 7.5 | **来源**: [KB] | **置信度**: medium
**21V 适用**: ✅ 是

**根因**: Azure Files SMB endpoint returns STATUS_INVALID_PARAMETER when receiving fragmented Kerberos authentication data. The endpoint does not support accumulation of security blob fragments during negotiation.

**方案**: Workaround: reduce user group membership to keep Kerberos ticket under 16K. Ensure resource group compression is enabled on DCs. Bug tracked by Azure Files PG.

**标签**: kb, contentidea-kb

---

### 7. Microsoft Print to PDF option: Print button greyed out. Creating new printer with Print to PDF drive

**分数**: 🔵 7.5 | **来源**: [KB] | **置信度**: medium
**21V 适用**: ✅ 是

**根因**: Printer driver installation fails with error code 0x80070002 due to incorrect driver INF file references in the DriverDatabase registry.

**方案**: 1. Launch registry using psexec -s -i regedit. 2. Load the DRIVERS Hive. 3. Update: HKLM\DRIVERS\DriverDatabase\DriverInfFiles\oem0.inf to prnms009.inf_amd64_bd3f6a64dee1535d; HKLM\DRIVERS\DriverDatabase\DriverInfFiles
tprint.inf\Active=ntprint.inf_amd64_addb31f9bff9e936. 4. Restart the spooler.

**标签**: print-to-pdf, printer-driver, registry, contentidea-kb

---

### 8. Azure Fileshare not accessible if the user is added to a security group on client

**分数**: 🔵 7.5 | **来源**: [KB] | **置信度**: medium
**21V 适用**: ✅ 是

**根因**: Happening due to the reason that the group is created in the cloud and it might not be recognized by the on-premise machine as the sync will be happening one way from on-prem to azure.

**方案**: You can refer the below URL which would suggest the same that the security group needs to be created in the on-prem and the users needed to be added over there and then synced to cloud. https://docs.microsoft.com/en-us/azure/storage/files/storage-files-identity-ad-ds-assign-permissions?tabs=azure-portal Extracted portion from the Article :

**标签**: unknown, contentidea-kb

---

### 9. Abstract Windows Updates released between 2023 6D and 2023 10B depending on OS version addressed an 

**分数**: 🔵 7.5 | **来源**: [KB] | **置信度**: medium
**21V 适用**: ✅ 是

**根因**: Root cause&nbsp; Leading theory as of April 12, 2024 The stack that was fixed in OS Bug 41639332: &#128064;[Fe][DBD] Server 2022: Event ID 1644 is not logged when the LDAP search filter is larger than ~29KB - Boards (visualstudio.com) was: # Child-SP &nbsp; &nbsp; &nbsp; &nbsp; Return &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Call Site &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Info0 0000009f2ef7cf90 00007ffc13f1774b ntdsai!DoLogEventW+0x128fdd1 0000009f2ef7d0b0 00007ffc140b0c12 ntdsai!DoLogEventAndTrace+0x20b2 0000009f2ef7d2e0 00007ffc13eaad5d ntdsai!SearchPerformanceLogFilter+0x8ea3 0000009f2ef7d650 00007ffc13ed81d7 ntdsai!LocalSearch+0x2c554 0000009f2ef7e560 00007ffc13ed7f56 ntdsai!SearchBody+0x8b&nbsp;The stack that caused the AV was: Ntdsai!computeEventHashntdsai!DoLogEventW+0x128fdd ntdsai!DoLogEventAndTrace+0x20b ntdsai!SearchPerformanceLogFilter+0x8eantdsai!LocalSearch+0x2c55 ntdsai!SearchBody+0x8b

**方案**: Root cause is under investigation. This KB will be continually updated. POR is to file an ADO bug once it has been determined if this is a 10B post-rel or a new issue.&nbsp; Track related bugs. Install corrective or preventative OS versions or OS updates as they become available &nbsp; OS Bug # Resolving KB Release Date Comments VNEXT \ Active Branch &nbsp;50367417 &nbsp;RTM RTM&nbsp; T:&nbsp;[AB] Field Engineering diagnostics logging intermittently crashes lsass on domain controllers Windows Server 2022 &nbsp;50203031 &nbsp;KB5040437 2024 7B&nbsp; T:&nbsp;Server 2022: Field Engineering diagnostics logging intermittently crashes lsass on domain controllers &lt;Ph&gt;

**标签**: unknown, contentidea-kb

---

### 10. Abstract  This page view count and last modify date stamp for this article will be low because (1.) 

**分数**: 🔵 7.5 | **来源**: [KB] | **置信度**: medium
**21V 适用**: ✅ 是

**根因**: Error 0x80090034 for SID protector would normally indicate issues outside of BitLocker area. It is returned when talking to Windows encryption APIs to protect BitLocker key to the principal indicated by the SID (group or user). The problem could lay in whether KDS (key distribution service) feature was properly setup on the corresponding domain controller to which this device is domain-joined, whether group or user identity is properly setup, etc. (assuming there are no sync/networking issues be

**方案**: (1.) Host DC role computers on WS 2019 or a newer OS and (2.) install the latest Window Update on WS 2019 and newer DCs that allows KDCSVC startup to succeed when the domain controller is located outside of the CN=Domain Controllers container.&nbsp; OS  Bug #  Resolving KB  Release Date  Comments  VNEXT \ Active Branch (Gallium)Server OS 23H2 (Zn)  &nbsp;45502317&nbsp;&nbsp;45634240  RTM&nbsp;KB5034130  RTM&nbsp;2024 1B  &nbsp;  Windows 11 SV2 22H2  &nbsp;45613160&nbsp;(EBD)  KB5029351  2023 8D&nbsp;  &nbsp;  Windows 11 SV1 21H2  &nbsp;45613158&nbsp;(EBD)  KB5029332  2023 8D&nbsp;  &nbsp;  Windows Server 2022  &nbsp;45613155&nbsp;(DBD)&nbsp;45634239&nbsp;(EBD)  KB5030216KB5034129  2023 9B&nbsp;2024 1B  KIR MSI file attached to DBD bug.&nbsp;  Windows 10 21H2 + 22H2  &nbsp;45613157&nbsp;(EBD  KB5029331  2023 8D  &nbsp;  1809 \ RS5 \ Windows Server 2019  &nbsp;45634241&nbsp;(EBD)  KB5034127  2024 1B&nbsp;  &nbsp;  1607 \ RS1 \ Windows Server 2016  &nbsp;won't fix  won't fix&nbsp;  won't 

**标签**: unknown, contentidea-kb

---

### 11. After installing April 2024 update for Windows Sever 2008 or Windows Server 2008 R2, there is a code

**分数**: 🔵 7.5 | **来源**: [KB] | **置信度**: medium
**21V 适用**: ✅ 是

**根因**: The MSRC added a code check, but it is not passing in the&nbsp;FILE_OPEN_FOR_BACKUP_INTENT flag on the NtCreateFile API call.&nbsp; So, when SYSTEM does not have permissions in the replicated folders it will fail.  DFSR Debug log files will have lines like the following: 127107 20240705 08:27:46.984 12892 MEET &nbsp;1438 Meet::Install -&gt; WAIT Error processing update. updateName:folderfilename uid:{DB6C9EDA-47C7-4BF6-AD8C-FE446E9D9DD2}-v39822592 gvsn:{DB6C9EDA-47C7-4BF6-AD8C-FE446E9D9DD2}-v398

**方案**: Possible workaround would be to give SYSTEM full control permissions in the replicated folder group.&nbsp; Downside to this would be that such a change would generate replication traffic depending on how large the data set is and if there are any subfolders that also do not allow inheritance.

**标签**: unknown, contentidea-kb

---

### 12. Getting continuous Access
is denied when accessing Azure
Files share through domain-based DFS UNC pa

**分数**: 🔵 7.5 | **来源**: [KB] | **置信度**: medium
**21V 适用**: ✅ 是

**根因**: In TSS logs with scenario NET_DFScli&nbsp;if we filter Procmon traces for DFS root namespace, we can see&nbsp;ACCESS DENIED&nbsp;when accessing \\contoso.com\RootNamespace DFS path both by File
Explorer and Outlook.exe: 2/7/2025
3:49:29
PM&nbsp;&nbsp;&nbsp;&nbsp;0.0368855&nbsp;&nbsp;&nbsp;&nbsp;Explorer.EXE&nbsp;&nbsp;&nbsp;&nbsp;43900&nbsp;&nbsp;&nbsp;&nbsp;35608&nbsp;&nbsp;&nbsp;&nbsp;IRP_MJ_CREATE&nbsp;&nbsp;&nbsp;&nbsp;ACCESS
DENIED&nbsp;&nbsp;&nbsp;&nbsp;\\contoso.com\RootNamespace&nbsp;&nbsp;&nbsp;&nbsp;Desired
Access: Read Attributes, Synchronize, Disposition: Open, Options: Synchronous
IO Non-Alert, Attributes: n/a, ShareMode: Read, Write, Delete, AllocationSize:
n/a&nbsp;&nbsp;&nbsp;&nbsp;CONTOSO\USER12/7/2025
3:49:41 PM&nbsp;&nbsp;&nbsp;&nbsp;0.0362544&nbsp;&nbsp;&nbsp;&nbsp;Explorer.EXE&nbsp;&nbsp;&nbsp;&nbsp;43900&nbsp;&nbsp;&nbsp;&nbsp;35608&nbsp;&nbsp;&nbsp;&nbsp;IRP_MJ_CREATE&nbsp;&nbsp;&nbsp;&nbsp;ACCESS DENIED&nbsp;&nbsp;&nbsp;&nbsp;\\contoso.com\RootNamespace&nbsp;&nbsp;&nbsp;&nbsp;Desired
Access: Read Attributes, Synchronize, Disposition: Open, Options: Synchronous
IO Non-Alert, Attributes: n/a, ShareMode: Read, Write, Delete, AllocationSize:
n/a&nbsp;&nbsp;&nbsp;&nbsp;CONTOSO\USER12/7/2025
3:49:42 PM&nbsp;&nbsp;&nbsp;&nbsp;0.0367745&nbsp;&nbsp;&nbsp;&nbsp;Explorer.EXE&nbsp;&nbsp;&nbsp;&nbsp;43900&nbsp;&nbsp;&nbsp;&nbsp;35608&nbsp;&nbsp;&nbsp;&nbsp;IRP_MJ_CREATE&nbsp;&nbsp;&nbsp;&nbsp;ACCESS DENIED&nbsp;&nbsp;&nbsp;&nbsp;\\contoso.com\RootNamespace&nbsp;&nbsp;&nbsp;&nbsp;Desired
Access: Read Attributes, Synchronize, Disposition: Open, Options: Synchronous
IO Non-Alert, Attributes: n/a, ShareMode: Read, Write, Delete, AllocationSize:
n/a&nbsp;&nbsp;&nbsp;&nbsp;CONTOSO\USER12/7/2025
3:50:54 PM&nbsp;&nbsp;&nbsp;&nbsp;0.0369908&nbsp;&nbsp;&nbsp;&nbsp;OUTLOOK.EXE&nbsp;&nbsp;&nbsp;&nbsp;34272&nbsp;&nbsp;&nbsp;&nbsp;43900&nbsp;&nbsp;&nbsp;&nbsp;IRP_MJ_CREATE&nbsp;&nbsp;&nbsp;&nbsp;ACCESS DENIED&nbsp;&nbsp;&nbsp;&nbsp;\\contoso.com\RootNamespace&nbsp;&nbsp;&nbsp;&nbsp;Desired
Access: Read Attributes, Synchronize, Disposition: Open, Options: Synchronous
IO Non-Alert, Attributes: n/a, ShareMode: Read, Write, Delete, AllocationSize:
n/a&nbsp;&nbsp;&nbsp;&nbsp;CONTOSO\USER12/7/2025
3:50:55 PM&nbsp;&nbsp;&nbsp;&nbsp;0.0404463&nbsp;&nbsp;&nbsp;&nbsp;OUTLOOK.EXE&nbsp;&nbsp;&nbsp;&nbsp;34272&nbsp;&nbsp;&nbsp;&nbsp;43900&nbsp;&nbsp;&nbsp;&nbsp;IRP_MJ_CREATE&nbsp;&nbsp;&nbsp;&nbsp;ACCESS DENIED&nbsp;&nbsp;&nbsp;&nbsp;\\contoso.com\RootNamespace&nbsp;&nbsp;&nbsp;&nbsp;Desired
Access: Read Attributes, Synchronize, Disposition: Open, Options: Synchronous
IO Non-Alert, Attributes: n/a, ShareMode: Read, Write, Delete, AllocationSize:
n/a&nbsp;&nbsp;&nbsp;&nbsp;CONTOSO\USER1Filtering the same TSS's packet capture for SMB packets containing DFS Namespace root path, there are STATUS_ACCESS_DENIED responses to Create Request File by client machine 10402&nbsp;&nbsp;&nbsp;&nbsp;2025-02-07
15:49:41.983287&nbsp;&nbsp;&nbsp;&nbsp;0.222510&nbsp;&nbsp;&nbsp;&nbsp;xxx.yyy.0.5&nbsp;&nbsp;&nbsp;&nbsp;61192&nbsp;&nbsp;&nbsp;&nbsp;xxx.yyy.0.10&nbsp;&nbsp;&nbsp;&nbsp;445&nbsp;&nbsp;&nbsp;&nbsp;SMB2&nbsp;&nbsp;&nbsp;&nbsp;296&nbsp;&nbsp;&nbsp;&nbsp;350&nbsp;&nbsp;&nbsp;&nbsp;Aa:bb:cc:dd:ee:05&nbsp;&nbsp;&nbsp;&nbsp;Aa:bb:cc:dd:ee:10&nbsp;&nbsp;&nbsp;&nbsp;Create
Request File: CONTOSO.COM\RootNamespace10414&nbsp;&nbsp;&nbsp;&nbsp;2025-02-07
15:49:42.019609&nbsp;&nbsp;&nbsp;&nbsp;0.036322&nbsp;&nbsp;&nbsp;&nbsp;xxx.yyy.0.10&nbsp;&nbsp;&nbsp;&nbsp;445&nbsp;&nbsp;&nbsp;&nbsp;xxx.yyy.0.5&nbsp;&nbsp;&nbsp;&nbsp;61192&nbsp;&nbsp;&nbsp;&nbsp;SMB2&nbsp;&nbsp;&nbsp;&nbsp;76&nbsp;&nbsp;&nbsp;&nbsp;130&nbsp;&nbsp;&nbsp;&nbsp;Aa:bb:cc:dd:ee:10&nbsp;&nbsp;&nbsp;&nbsp;Aa:bb:cc:dd:ee:05&nbsp;&nbsp;&nbsp;&nbsp;Create
Response, Error: STATUS_ACCESS_DENIED10415&nbsp;&nbsp;&nbsp;&nbsp;2025-02-07
15:49:42.020508&nbsp;&nbsp;&nbsp;&nbsp;0.000899&nbsp;&nbsp;&nbsp;&nbsp;xxx.yyy.0.5&nbsp;&nbsp;&nbsp;&nbsp;61192&nbsp;&nbsp;&nbsp;&nbsp;xxx.yyy.0.10&nbsp;&nbsp;&nbsp;&nbsp;445&nbsp;&nbsp;&nbsp;&nbsp;SMB2&nbsp;&nbsp;&nbsp;&nbsp;220&nbsp;&nbsp;&nbsp;&nbsp;274&nbsp;&nbsp;&nbsp;&nbsp;Aa:bb:cc:dd:ee:05&nbsp;&nbsp;&nbsp;&nbsp;Aa:bb:cc:dd:ee:10&nbsp;&nbsp;&nbsp;&nbsp;Create
Request File: CONTOSO.COM\RootNamespace10419&nbsp;&nbsp;&nbsp;&nbsp;2025-02-07
15:49:42.055918&nbsp;&nbsp;&nbsp;&nbsp;0.035410&nbsp;&nbsp;&nbsp;&nbsp;xxx.yyy.0.10&nbsp;&nbsp;&nbsp;&nbsp;445&nbsp;&nbsp;&nbsp;&nbsp;xxx.yyy.0.5&nbsp;&nbsp;&nbsp;&nbsp;61192&nbsp;&nbsp;&nbsp;&nbsp;SMB2&nbsp;&nbsp;&nbsp;&nbsp;76&nbsp;&nbsp;&nbsp;&nbsp;130&nbsp;&nbsp;&nbsp;&nbsp;Aa:bb:cc:dd:ee:10&nbsp;&nbsp;&nbsp;&nbsp;Aa:bb:cc:dd:ee:05&nbsp;&nbsp;&nbsp;&nbsp;Create
Response, Error: STATUS_ACCESS_DENIED29433&nbsp;&nbsp;&nbsp;&nbsp;2025-02-07
15:50:54.922060&nbsp;&nbsp;&nbsp;&nbsp;2.470199&nbsp;&nbsp;&nbsp;&nbsp;xxx.yyy.0.5&nbsp;&nbsp;&nbsp;&nbsp;61358&nbsp;&nbsp;&nbsp;&nbsp;xxx.yyy.0.10&nbsp;&nbsp;&nbsp;&nbsp;445&nbsp;&nbsp;&nbsp;&nbsp;SMB2&nbsp;&nbsp;&nbsp;&nbsp;296&nbsp;&nbsp;&nbsp;&nbsp;350&nbsp;&nbsp;&nbsp;&nbsp;Aa:bb:cc:dd:ee:05&nbsp;&nbsp;&nbsp;&nbsp;Aa:bb:cc:dd:ee:10&nbsp;&nbsp;&nbsp;&nbsp;Create
Request File: CONTOSO.COM\RootNamespace29454&nbsp;&nbsp;&nbsp;&nbsp;2025-02-07
15:50:54.959720&nbsp;&nbsp;&nbsp;&nbsp;0.037660&nbsp;&nbsp;&nbsp;&nbsp;xxx.yyy.0.10&nbsp;&nbsp;&nbsp;&nbsp;445&nbsp;&nbsp;&nbsp;&nbsp;xxx.yyy.0.5&nbsp;&nbsp;&nbsp;&nbsp;61358&nbsp;&nbsp;&nbsp;&nbsp;SMB2&nbsp;&nbsp;&nbsp;&nbsp;76&nbsp;&nbsp;&nbsp;&nbsp;130&nbsp;&nbsp;&nbsp;&nbsp;Aa:bb:cc:dd:ee:10&nbsp;&nbsp;&nbsp;&nbsp;Aa:bb:cc:dd:ee:05&nbsp;&nbsp;&nbsp;&nbsp;Create
Response, Error: STATUS_ACCESS_DENIED29455&nbsp;&nbsp;&nbsp;&nbsp;2025-02-07
15:50:54.960976&nbsp;&nbsp;&nbsp;&nbsp;0.001256&nbsp;&nbsp;&nbsp;&nbsp;xxx.yyy.0.5&nbsp;&nbsp;&nbsp;&nbsp;61358&nbsp;&nbsp;&nbsp;&nbsp;xxx.yyy.0.10&nbsp;&nbsp;&nbsp;&nbsp;445&nbsp;&nbsp;&nbsp;&nbsp;SMB2&nbsp;&nbsp;&nbsp;&nbsp;220&nbsp;&nbsp;&nbsp;&nbsp;274&nbsp;&nbsp;&nbsp;&nbsp;Aa:bb:cc:dd:ee:05&nbsp;&nbsp;&nbsp;&nbsp;Aa:bb:cc:dd:ee:10&nbsp;&nbsp;&nbsp;&nbsp;Create
Request File: CONTOSO.COM\RootNamespace29459&nbsp;&nbsp;&nbsp;&nbsp;2025-02-07
15:50:54.996957&nbsp;&nbsp;&nbsp;&nbsp;0.035981&nbsp;&nbsp;&nbsp;&nbsp;xxx.yyy.0.10&nbsp;&nbsp;&nbsp;&nbsp;445&nbsp;&nbsp;&nbsp;&nbsp;xxx.yyy.0.5&nbsp;&nbsp;&nbsp;&nbsp;61358&nbsp;&nbsp;&nbsp;&nbsp;SMB2&nbsp;&nbsp;&nbsp;&nbsp;76&nbsp;&nbsp;&nbsp;&nbsp;130&nbsp;&nbsp;&nbsp;&nbsp;Aa:bb:cc:dd:ee:10&nbsp;&nbsp;&nbsp;&nbsp;Aa:bb:cc:dd:ee:05&nbsp;&nbsp;&nbsp;&nbsp;Create
Response, Error: STATUS_ACCESS_DENIED29460&nbsp;&nbsp;&nbsp;&nbsp;2025-02-07
15:50:54.998038&nbsp;&nbsp;&nbsp;&nbsp;0.001081&nbsp;&nbsp;&nbsp;&nbsp;xxx.yyy.0.5&nbsp;&nbsp;&nbsp;&nbsp;61358&nbsp;&nbsp;&nbsp;&nbsp;xxx.yyy.0.10&nbsp;&nbsp;&nbsp;&nbsp;445&nbsp;&nbsp;&nbsp;&nbsp;SMB2&nbsp;&nbsp;&nbsp;&nbsp;296&nbsp;&nbsp;&nbsp;&nbsp;350&nbsp;&nbsp;&nbsp;&nbsp;Aa:bb:cc:dd:ee:05&nbsp;&nbsp;&nbsp;&nbsp;Aa:bb:cc:dd:ee:10&nbsp;&nbsp;&nbsp;&nbsp;Create
Request File: CONTOSO.COM\RootNamespace29464&nbsp;&nbsp;&nbsp;&nbsp;2025-02-07
15:50:55.035147&nbsp;&nbsp;&nbsp;&nbsp;0.037109&nbsp;&nbsp;&nbsp;&nbsp;xxx.yyy.0.10&nbsp;&nbsp;&nbsp;&nbsp;445&nbsp;&nbsp;&nbsp;&nbsp;xxx.yyy.0.5&nbsp;&nbsp;&nbsp;&nbsp;61358&nbsp;&nbsp;&nbsp;&nbsp;SMB2&nbsp;&nbsp;&nbsp;&nbsp;76&nbsp;&nbsp;&nbsp;&nbsp;130&nbsp;&nbsp;&nbsp;&nbsp;Aa:bb:cc:dd:ee:10&nbsp;&nbsp;&nbsp;&nbsp;Aa:bb:cc:dd:ee:05&nbsp;&nbsp;&nbsp;&nbsp;Create
Response, Error: STATUS_ACCESS_DENIED29465&nbsp;&nbsp;&nbsp;&nbsp;2025-02-07
15:50:55.036234&nbsp;&nbsp;&nbsp;&nbsp;0.001087&nbsp;&nbsp;&nbsp;&nbsp;xxx.yyy.0.5&nbsp;&nbsp;&nbsp;&nbsp;61358&nbsp;&nbsp;&nbsp;&nbsp;xxx.yyy.0.10&nbsp;&nbsp;&nbsp;&nbsp;445&nbsp;&nbsp;&nbsp;&nbsp;SMB2&nbsp;&nbsp;&nbsp;&nbsp;220&nbsp;&nbsp;&nbsp;&nbsp;274&nbsp;&nbsp;&nbsp;&nbsp;Aa:bb:cc:dd:ee:05&nbsp;&nbsp;&nbsp;&nbsp;Aa:bb:cc:dd:ee:10&nbsp;&nbsp;&nbsp;&nbsp;Create
Request File: CONTOSO.COM\RootNamespace29512&nbsp;&nbsp;&nbsp;&nbsp;2025-02-07
15:50:55.075740&nbsp;&nbsp;&nbsp;&nbsp;0.039506&nbsp;&nbsp;&nbsp;&nbsp;xxx.yyy.0.10&nbsp;&nbsp;&nbsp;&nbsp;445&nbsp;&nbsp;&nbsp;&nbsp;xxx.yyy.0.5&nbsp;&nbsp;&nbsp;&nbsp;61358&nbsp;&nbsp;&nbsp;&nbsp;SMB2&nbsp;&nbsp;&nbsp;&nbsp;76&nbsp;&nbsp;&nbsp;&nbsp;130&nbsp;&nbsp;&nbsp;&nbsp;Aa:bb:cc:dd:ee:10&nbsp;&nbsp;&nbsp;&nbsp;Aa:bb:cc:dd:ee:05&nbsp;&nbsp;&nbsp;&nbsp;Create
Response, Error: STATUS_ACCESS_DENIED
This hints at the likely issue with permissions of the accessing user (CONTOSO\User1) on DFS-N Servers root namespace share. Checking effective NTFS permissions (share permissions were set to Full Control for Everyone) of the user on DFS-N server's&nbsp;C:\DFSRoots\RootNamespace folder, it was confirmed the user didn't have least necessary permissions on the folder.&nbsp;

**方案**: Validating
user is assigned at least the following NTFS permissions on C:\DFSRoots\RootNamespace
folder in DFS-N server:

**标签**: Content Idea Request, contentidea-kb

---

