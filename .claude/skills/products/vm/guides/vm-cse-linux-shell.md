# VM CSE Linux Shell 脚本 — 排查速查

**来源数**: 2 (AW, ON) | **条目**: 14 | **21V**: 全部
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Custom Script Extension (CSE) fails on AKS VMSS with ExitCode 50 ('Connection reset by peer') or Exi | Firewalls, NSGs, or bad networking routing block outbound connectivity from AKS  | 1. Check DNS resolution, routing table, and NSG rules for blocked connectivity.  | 🔵 7.5 | AW |
| 2 | Custom Script Extension (CSE) on Linux fails with 'Timed out waiting for lock on custom-script-exten | A previous CSE execution (customer script) is still running and holding a lock o | Customer should review their script to ensure it completes in a reasonable time. | 🔵 7.5 | AW |
| 3 | Any Linux VM extension fails with 'Non-zero exit code: 126' (e.g., RunCommandLinux, CustomScript, or | The /var mount point in /etc/fstab has the 'noexec' option set (e.g., '/dev/mapp | 1. Remove the 'noexec' option from the /var mount entry in /etc/fstab. 2. Unmoun | 🔵 7.5 | AW |
| 4 | RunCommand install/uninstall fails with 'failed to parse protected settings: decrypting protected se | Required OpenSSL library version is missing or incompatible on the Linux VM. Run | Check OpenSSL: rpm -qa / grep openssl (RPM) or apt list --installed / grep opens | 🔵 7.5 | AW |
| 5 | RunCommand install/uninstall fails on Linux VM with error 'failed to parse protected settings: decry | Required OpenSSL library version (libssl.so.3, libcrypto.so.3) is missing or inc | 1) Check OpenSSL: rpm -qa / grep openssl (RPM) or apt list --installed / grep op | 🔵 7.5 | AW |
| 6 | Custom Script Extension fails with exit code 127 or error: The specified executable is not a valid a | Wrong extension publisher for OS. Microsoft.Azure.Extensions.CustomScript is Lin | Windows: Microsoft.Compute.CustomScriptExtension. Linux: Microsoft.Azure.Extensi | 🔵 7 | ON |
| 7 | Custom Script Extension (CSE) on Linux fails with Timed out waiting for lock on custom-script-extens | Customer script is taking too long to run or failed with a non-zero error code,  | Customer should review their script for long execution time or errors. If AV/ant | 🔵 6.5 | AW |
| 8 | Azure File Share mount fails when accessing from on-premises or a different Azure region. Client can | Client OS only supports SMB 2.1 (e.g., Windows Server 2008 R2, Windows 7, or Lin | Upgrade client OS to one supporting SMB 3.0 with encryption: Windows Server 2012 | 🔵 6.5 | AW |
| 9 | Azure File Share mount fails on Linux with DNS lookup failure for Azure Files endpoint. | Technologies like Mesosphere manipulate DNS configuration, causing DNS lookup of | Mount directly via IP address, or add DNS name and IP mapping into /etc/hosts to | 🔵 6.5 | AW |
| 10 | Azure File Share mount fails on Linux during system boot. The fstab entry for the file share fails t | Entries in /etc/fstab are processed before networking is enabled, causing mount  | Add the _netdev option to the Azure File Share entry in /etc/fstab so it is not  | 🔵 6.5 | AW |
| 11 | Any Linux VM extension fails with 'Non-zero exit code: 126' in /var/log/waagent.log (e.g. RunCommand | The /etc/fstab has the 'noexec' mount option set on the /var partition. This pre | 1) Remove the 'noexec' option from the /var mountpoint in /etc/fstab. 2) Remount | 🔵 6.5 | AW |
| 12 | Linux Custom Script Extension (CSE) stays on Transitioning status indefinitely; operations like disk | Customer included a Reboot command in the custom script, causing the extension t | Remove Reboot command from the custom script; check CSE logs at /var/lib/waagent | 🔵 5 | ON |
| 13 | Set-AzVMCustomScriptExtension fails on Linux VM with error: binCustomScriptHandler.exe command not f | Set-AzVMCustomScriptExtension installs from publisher Microsoft.Compute.CustomSc | Use Set-AzVMExtension instead with correct publisher: Set-AzVMExtension -Publish | 🔵 5 | ON |
| 14 | Linux Custom Script Extension (CSE) stuck in Transitioning state with status Enable in progress; CSE | WALinuxAgent was upgraded while CSE was executing; agent restart causes CSE to l | Wait for WALinuxAgent upgrade to complete then re-trigger CSE with updated setti | 🔵 5 | ON |

## 快速排查路径

1. **Custom Script Extension (CSE) fails on AKS VMSS with ExitCode 50 ('Connection re**
   - 根因: Firewalls, NSGs, or bad networking routing block outbound connectivity from AKS nodes to AKS control plane or package re
   - 方案: 1. Check DNS resolution, routing table, and NSG rules for blocked connectivity. 2. Verify outbound requirements per https://learn.microsoft.com/en-us/
   - `[🔵 7.5 | AW]`

2. **Custom Script Extension (CSE) on Linux fails with 'Timed out waiting for lock on**
   - 根因: A previous CSE execution (customer script) is still running and holding a lock on the custom-script-extension executable
   - 方案: Customer should review their script to ensure it completes in a reasonable time. The lock contention is a race condition that may be caused by AV/anti
   - `[🔵 7.5 | AW]`

3. **Any Linux VM extension fails with 'Non-zero exit code: 126' (e.g., RunCommandLin**
   - 根因: The /var mount point in /etc/fstab has the 'noexec' option set (e.g., '/dev/mapper/rootvg-varlv /var xfs defaults,noexec
   - 方案: 1. Remove the 'noexec' option from the /var mount entry in /etc/fstab. 2. Unmount and remount: 'umount /var && mount -a'. 3. Retry the extension opera
   - `[🔵 7.5 | AW]`

4. **RunCommand install/uninstall fails with 'failed to parse protected settings: dec**
   - 根因: Required OpenSSL library version is missing or incompatible on the Linux VM. RunCommand extension requires specific Open
   - 方案: Check OpenSSL: rpm -qa | grep openssl (RPM) or apt list --installed | grep openssl (APT). If installed, reinstall: yum reinstall openssl* or apt-get i
   - `[🔵 7.5 | AW]`

5. **RunCommand install/uninstall fails on Linux VM with error 'failed to parse prote**
   - 根因: Required OpenSSL library version (libssl.so.3, libcrypto.so.3) is missing or incompatible on the Linux VM.
   - 方案: 1) Check OpenSSL: rpm -qa | grep openssl (RPM) or apt list --installed | grep openssl (APT). 2) If installed, reinstall: yum reinstall openssl* or apt
   - `[🔵 7.5 | AW]`

