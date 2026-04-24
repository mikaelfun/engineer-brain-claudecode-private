# VM Windows Update 与补丁管理 — 排查速查

**来源数**: 3 (AW, ML, ON) | **条目**: 8 | **21V**: 7/8
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Windows VM stuck during boot with "Error C0000265 applying update operations" during Windows Update, | Core file during KB installation reached NTFS hardlink limit. PendingDeletes ent | Offline: (1) Open \windows\winsxs\poqexec.log, find line with error c0000265 to  | 🔵 7.5 | AW |
| 2 | Windows VM stuck during boot with "Error C01A001D applying update operations" during Windows Update  | OS disk is full, system cannot write files during KB installation causing primit | Offline: Attach OS disk to rescue VM, free disk space (delete temp files, old up | 🔵 7.5 | AW |
| 3 | Windows Server 2012/2012 R2 VM ESU (Extended Security Update) installation fails; CBS log shows ESU: | VM missing intermediate CA certificates required by ESU IMDS validation chain. E | 1) Check CBS log at C:\Windows\Logs\CBS\CBS.log; 2) Download required intermedia | 🔵 7 | ON |
| 4 | Windows Update client is downloading update content via WUfB Deployment Service but does not progres | null | Route to Windows Client queue. Support path: Routing Windows v3 > Installing Win | 🔵 6.5 | AW |
| 5 | Windows Update fails on Azure VM with servicing stack corruption errors such as 0x80073712 (ERROR_SX | Internal corruption in the Windows servicing stack responsible for managing upda | Perform in-place upgrade (IPU) of Windows Server within the Azure VM: 1) Back up | 🔵 6.5 | ML |
| 6 | Azure Windows VM stuck during Windows Update with error C01A001D: 'Error C01A001D applying update op | OS disk is full — the operating system cannot write core files to disk during Wi | Attach OS disk to repair VM. 1) Resize disk up to 1TB if not at max (Expand-AzDi | 🔵 6.5 | ML |
| 7 | Azure VM startup stuck at Windows Update screen: messages like Installing Windows ##%, We could not  | Windows Update installation or rollback process stuck during boot. Update packag | Wait 8 hours first. If still stuck: attach OS disk to rescue VM, run dism /image | 🔵 5.5 | ML |
| 8 | Windows Server 2016 VM unresponsive after applying Windows Update (specifically KB5003638). Boot dia | Insufficient disk space or permission issue with files in %systemroot%\system32\ | Before applying KB5003638: ensure 1GB free space, apply KB5001347 or KB5003197 f | 🔵 5.5 | ML |

## 快速排查路径

1. **Windows VM stuck during boot with "Error C0000265 applying update operations" du**
   - 根因: Core file during KB installation reached NTFS hardlink limit. PendingDeletes entries in WinSxS\Temp\PendingDeletes accum
   - 方案: Offline: (1) Open \windows\winsxs\poqexec.log, find line with error c0000265 to identify blocked file. (2) fsutil hardlink list <drive>:\<file path> t
   - `[🔵 7.5 | AW]`

2. **Windows VM stuck during boot with "Error C01A001D applying update operations" du**
   - 根因: OS disk is full, system cannot write files during KB installation causing primitive operations queue to fail
   - 方案: Offline: Attach OS disk to rescue VM, free disk space (delete temp files, old updates, expand disk). After freeing space, reassemble VM. Close code: O
   - `[🔵 7.5 | AW]`

3. **Windows Server 2012/2012 R2 VM ESU (Extended Security Update) installation fails**
   - 根因: VM missing intermediate CA certificates required by ESU IMDS validation chain. ESU licensing validates against Azure IMD
   - 方案: 1) Check CBS log at C:\Windows\Logs\CBS\CBS.log; 2) Download required intermediate CA certificates from Azure Certificate Authority details page (http
   - `[🔵 7 | ON]`

4. **Windows Update client is downloading update content via WUfB Deployment Service **
   - 根因: null
   - 方案: Route to Windows Client queue. Support path: Routing Windows v3 > Installing Windows Updates, Features, or Roles. More info: https://aka.ms/wufbsuppor
   - `[🔵 6.5 | AW]`

5. **Windows Update fails on Azure VM with servicing stack corruption errors such as **
   - 根因: Internal corruption in the Windows servicing stack responsible for managing updates and system components. Missing files
   - 方案: Perform in-place upgrade (IPU) of Windows Server within the Azure VM: 1) Back up VM using Azure Backup or snapshot. 2) Review CBS logs at C:\Windows\L
   - `[🔵 6.5 | ML]`

