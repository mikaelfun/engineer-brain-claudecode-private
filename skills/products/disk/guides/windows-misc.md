# Disk Windows Server Misc KB — 排查速查

**来源数**: 12 | **21V**: 全部适用
**最后更新**: 2026-04-07
**关键词**: print-to-pdf, printer-driver, registry

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Windows Storage Server 2016 may result in a Bugcheck 0xD1 during installation on a server with more than two processors  | This is by design. Windows Storage Server 2016 has system requirements with a maximum of two CPU soc | The workaround is to install Windows Server 2016 Standard or Windows Server 2016 Datacenter. Once installed Storage Serv | 🔵 7.5 | [KB] |
| 2 | **:**  OS (Windows Storage Server 2016) 9  Log Name: {Namepii}  Source: Microsoft-Windows-DistributedCOM  Date: {ALPHANU | KM review showed that it was not following the MS Writing Style | converted the article into a format approved by the M Writing Style | 🔵 7.5 | [KB] |
| 3 | 2 DFSR Servers running Windows Server 2016, both upstream and downstream.We do see that Access is denied errors for �ACC | We found below errors in the DFSR Debug logs after we manually zipped them and got it uploaded. gvsn | After removing the FSRM components from the downstream server the replication backlogs just finished in few hours. | 🔵 7.5 | [KB] |
| 4 | AbstractCustomer is trying to configure NTFS volume mount points up to 100 on Windows Server 2016. further to that they  | This is by design. | A DCR has been filed to request the design change. https://microsoft.visualstudio.com/OS/_workitems/edit/23057887 | 🔵 7.5 | [KB] |
| 5 | Multiple VMs on same CSV: after network disconnection under 2 minutes, some VMs recover while others remain in PAUSE cri | VM Storage resiliency is out of sync - the recovery is pended for CsvFsHandleLmrWaitForActive and ke | Bug has been filed with product group. | 🔵 7.5 | [KB] |
| 6 | Mapping drive to Azure Files SMB endpoint fails with error 53 (0xC000000D STATUS_INVALID_PARAMETER) when Kerberos ticket | Azure Files SMB endpoint returns STATUS_INVALID_PARAMETER when receiving fragmented Kerberos authent | Workaround: reduce user group membership to keep Kerberos ticket under 16K. Ensure resource group compression is enabled | 🔵 7.5 | [KB] |
| 7 | Microsoft Print to PDF option: Print button greyed out. Creating new printer with Print to PDF driver fails with 'Printe | Printer driver installation fails with error code 0x80070002 due to incorrect driver INF file refere | 1. Launch registry using psexec -s -i regedit. 2. Load the DRIVERS Hive. 3. Update: HKLM\DRIVERS\DriverDatabase\DriverIn | 🔵 7.5 | [KB] |
| 8 | Azure Fileshare not accessible if the user is added to a security group on client | Happening due to the reason that the group is created in the cloud and it might not be recognized by | You can refer the below URL which would suggest the same that the security group needs to be created in the on-prem and  | 🔵 7.5 | [KB] |
| 9 | Abstract Windows Updates released between 2023 6D and 2023 10B depending on OS version addressed an issue where 1644 eve | Root cause&nbsp; Leading theory as of April 12, 2024 The stack that was fixed in OS Bug 41639332: &# | Root cause is under investigation. This KB will be continually updated. POR is to file an ADO bug once it has been deter | 🔵 7.5 | [KB] |
| 10 | Abstract  This page view count and last modify date stamp for this article will be low because (1.) support call volume  | Error 0x80090034 for SID protector would normally indicate issues outside of BitLocker area. It is r | (1.) Host DC role computers on WS 2019 or a newer OS and (2.) install the latest Window Update on WS 2019 and newer DCs  | 🔵 7.5 | [KB] |
| 11 | After installing April 2024 update for Windows Sever 2008 or Windows Server 2008 R2, there is a code change in DFSR that | The MSRC added a code check, but it is not passing in the&nbsp;FILE_OPEN_FOR_BACKUP_INTENT flag on t | Possible workaround would be to give SYSTEM full control permissions in the replicated folder group.&nbsp; Downside to t | 🔵 7.5 | [KB] |
| 12 | Getting continuous Access is denied when accessing Azure Files share through domain-based DFS UNC path in File Explorer: | In TSS logs with scenario NET_DFScli&nbsp;if we filter Procmon traces for DFS root namespace, we can | Validating user is assigned at least the following NTFS permissions on C:\DFSRoots\RootNamespace folder in DFS-N server: | 🔵 7.5 | [KB] |

## 快速排查路径

1. Windows Storage Server 2016 may result in a Bugcheck 0xD1 during installation on → The workaround is to install Windows Server 2016 Standard or Windows Server 2016 Datacenter `[来源: contentidea-kb]`
2. **:**  OS (Windows Storage Server 2016) 9  Log Name: {Namepii}  Source: Microsof → converted the article into a format approved by the M Writing Style `[来源: contentidea-kb]`
3. 2 DFSR Servers running Windows Server 2016, both upstream and downstream.We do s → After removing the FSRM components from the downstream server the replication backlogs just finished `[来源: contentidea-kb]`
4. AbstractCustomer is trying to configure NTFS volume mount points up to 100 on Wi → A DCR has been filed to request the design change `[来源: contentidea-kb]`
5. Multiple VMs on same CSV: after network disconnection under 2 minutes, some VMs  → Bug has been filed with product group `[来源: contentidea-kb]`
