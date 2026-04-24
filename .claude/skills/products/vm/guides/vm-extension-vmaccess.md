# VM VMAccess 扩展（密码重置） — 排查速查

**来源数**: 3 (AW, ML, ON) | **条目**: 34 | **21V**: 全部
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Cannot login to Azure VM, password incorrect, VMAccess extension not installed or broken. | VM created without Azure VM Extension (VMAccess) or extension is broken/corrupte | Windows: reset password without agent via offline method. Linux: VMAccessForLinu | 🟢 8 | ON |
| 2 | Ubuntu Linux VM cannot be accessed: SSH fails, VMAccess agent does not work, VM cannot obtain IP; se | Ubuntu does not support password reset via serial console natively; when both VM | Use az vm repair to create a recovery VM with OS disk attached as data disk. Mou | 🟢 8 | ON |
| 3 | After using Reset Password (EnableVMAccess extension) on a Linux VM, ChallengeResponseAuthentication | By design — the EnableVMAccess extension explicitly sets ChallengeResponseAuthen | This is expected behavior. If the customer requires ChallengeResponseAuthenticat | 🔵 7.5 | AW |
| 4 | After using Reset Password feature on a Linux VM, ChallengeResponseAuthentication is set to no in /e | The EnableVMAccess extension explicitly sets ChallengeResponseAuthentication to  | Inform customer this is by design - a security measure implemented by the VMAcce | 🔵 7.5 | AW |
| 5 | VM Access Extension fails to reset password; RDP and serial console unavailable. VMAccessAgent repor | Local security policy (inherited from base image) enforces minimum password leng | 1) Verify password policy with 'net accounts' command. 2) Temporarily lower mini | 🔵 7.5 | AW |
| 6 | VMAccessAgent fails with COMException 0x800706D9: 'There are no more endpoints available from the en | Windows Firewall service (MpsSvc) is disabled. VMAccess cannot enumerate firewal | 1) Run Windows Guest Analyzer from ASC RE Diagnostics tab. 2) Check if MpsSvc se | 🔵 7.5 | AW |
| 7 | VMAccessForLinux extension fails: 'ascii' codec can't decode byte 0xe2 in position 852. Extension ve | Non-ASCII characters (e.g., UTF-8 encoded chars) present in /etc/ssh/sshd_config | 1) Snapshot OS disk. 2) Backup /etc/ssh/sshd_config. 3) Find non-ASCII chars wit | 🔵 7.5 | AW |
| 8 | VMAccess extension fails with 'VMAccess Extension does not support Domain Controller' when attemptin | VMAccess does not support password reset on Domain Controller VMs | Use Domain Controller-specific password reset procedure. See wiki VM-Password-Re | 🔵 7.5 | AW |
| 9 | VMAccessForLinux extension fails to enable with 'ascii codec cannot decode byte 0xe2 in position N:  | Non-ASCII characters (e.g. smart quotes 0xe2) exist in /etc/ssh/sshd_config; VMA | 1) Snapshot the OS disk. 2) Backup /etc/ssh/sshd_config. 3) Find non-ASCII chars | 🔵 7.5 | AW |
| 10 | VMAccessForLinux extension fails with "'ascii' codec can't decode byte 0xe2 in position N: ordinal n | Non-ASCII characters (e.g. UTF-8 smart quotes 0xe2) exist in /etc/ssh/sshd_confi | 1) Take snapshot of OS disk. 2) Backup /etc/ssh/sshd_config. 3) Find non-ASCII c | 🔵 7.5 | AW |
| 11 | VMAccessForLinux fails on specialized VHD: /var/lib/waagent/ovf-env.xml No such file or directory. | VM from specialized VHD without provisioning. ovf-env.xml generated during initi | Recreate VM with proper provisioning, or copy ovf-env.xml from another VM, or up | 🔵 7 | ON |
| 12 | Reset password fails with 'The password does not meet the password policy requirements' error via En | The EnableVMAccess extension enforces OS-level password policies: Minimum passwo | Use a password with at least 14 characters (maximum configurable by Minimum pass | 🔵 6.5 | AW |
| 13 | Linux VM extension installation fails with 'ImportError: No module named xml.sax.saxutils' (commonly | The python-xml module is not installed on the system. It is not part of the pyth | Install the python-xml package for the distro: SUSE: 'sudo zypper install python | 🔵 6.5 | AW |
| 14 | Linux VM extension fails with ImportError: No module named xml.sax.saxutils when installing extensio | The python-xml module is not installed on the Linux VM. It is not part of the py | Install the python-xml package: SUSE: 'sudo zypper install python-xml', RHEL: 's | 🔵 6.5 | AW |
| 15 | VMAccess extension fails with 'CannotModifyExtensionsWhenVMNotRunning' - cannot modify extensions wh | VM is deallocated or stopped; extensions cannot be modified in this state. | Confirm VM is up and running in Azure portal or ASC before retrying extension op | 🔵 6.5 | AW |
| 16 | VMAccess Extension fails with 'VMAccess Extension does not support Domain Controller' when trying to | Microsoft does not support resetting passwords on Domain Controllers via VMAcces | Use Domain Controller password reset procedure instead. See: https://learn.micro | 🔵 6.5 | AW |
| 17 | VMAccess extension fails: 'The Admin User Account password cannot be null or empty if provided the u | Password field was left empty when attempting to reset or create user account vi | Provide a non-empty password for the account when using VMAccess extension. | 🔵 6.5 | AW |
| 18 | VMAccess extension fails: 'User account already exists but cannot be updated because it is not in th | Target user account exists but is not a member of the local Administrators group | Add the user to the Administrators group on the DC/VM, then retry the VMAccess o | 🔵 6.5 | AW |
| 19 | VMAccess extension fails with 'MultipleExtensionsPerHandlerNotAllowed' - multiple VMExtensions per h | Duplicate enablevmaccess extension entries exist for the same handler (Microsoft | Remove the duplicate extension: Remove-AzVMExtension -ResourceGroupName '<RG>' - | 🔵 6.5 | AW |
| 20 | VMAccessForLinux extension fails: 'Enable failed: No password or ssh_key is specified'. | Neither password nor SSH key was provided in the VMAccess extension settings for | Provide password or ssh_key information for the account in the VMAccess extensio | 🔵 6.5 | AW |
| 21 | VMAccess extension fails with 'The password does not meet the password policy requirements' (HRESULT | The password provided does not comply with the VM password complexity, length, o | Set a password that meets the VM password policy. Check minimum length, complexi | 🔵 6.5 | AW |
| 22 | VMAccess extension fails with 'User account already exists but cannot be updated because it is not i | The specified user account exists but is not a member of the local Administrator | Add the user to the Administrators group on the VM (or DC), then retry the VMAcc | 🔵 6.5 | AW |
| 23 | VMAccess fails with 'User account already exists but cannot be updated because it is not in the Admi | Target user account exists on the VM but is not a member of the local Administra | Add the user to the Administrators group on the Domain Controller, then retry th | 🔵 6.5 | AW |
| 24 | VMAccessAgent fails with 'Cannot update Remote Desktop Connection settings for Administrator account | Windows Firewall service (MpsSvc) is disabled on the VM, causing VMAccess to fai | Enable and start the Windows Firewall service (MpsSvc), then retry VMAccess. Win | 🔵 6.5 | AW |
| 25 | VMAccess extension operation fails with 'CannotModifyExtensionsWhenVMNotRunning' error | VM is in stopped/deallocated state; extensions cannot be modified when VM is not | Confirm VM is up and running in Azure portal or ASC before retrying the VMAccess | 🔵 6.5 | AW |
| 26 | VMAccess extension fails with error: CannotModifyExtensionsWhenVMNotRunning - 'Cannot modify extensi | VM is in deallocated or stopped state | Confirm VM is up and running in Azure portal or ASC before retrying extension op | 🔵 6.5 | AW |
| 27 | VMAccess extension fails with 'VMAccess Extension does not support Domain Controller' | Microsoft does not support resetting passwords on Domain Controllers via VMAcces | Follow DC password reset procedure instead of VMAccess. Public doc: https://lear | 🔵 6.5 | AW |
| 28 | VMAccess extension fails with 'The password does not meet the password policy requirements' (COMExce | New password does not meet the VM's local or domain password policy (length, com | Use a password that meets the VM's password policy requirements (minimum length, | 🔵 6.5 | AW |
| 29 | VMAccess extension fails with 'User account X already exists but cannot be updated because it is not | Target user account exists on the VM but is not in the local Administrators grou | Add the user to the Administrators group on the VM (especially on Domain Control | 🔵 6.5 | AW |
| 30 | VMAccess extension fails with 'MultipleExtensionsPerHandlerNotAllowed - Multiple VMExtensions per ha | Duplicate VMAccess extension entries exist on the VM (multiple extensions with s | Manually remove the duplicate extension: Remove-AzVMExtension -ResourceGroupName | 🔵 6.5 | AW |
| 31 | Built-in admin disabled per WinGuestAnalyzer Health Signal. | Admin disabled by GPO or manual action. | VMAccess or Portal Reset Password. Or EnableAdminAccount Run Command. | 🔵 6.5 | AW |
| 32 | VMAccess extension (enablevmAccess) fails with error: VMAccess Extension does not support Domain Con | The VMAccessAgent extension explicitly does not support VMs configured as domain | Do not use VMAccess extension on domain controllers. For password reset on DC, u | 🔵 5.5 | ML |
| 33 | VMAccess extension fails with error: The password does not meet the password policy requirements (0x | The specified password does not meet Windows password policy requirements (minim | Ensure the new password meets Windows password complexity requirements: minimum  | 🔵 5.5 | ML |
| 34 | Cannot reset Linux VM password via Azure portal; VMAccess extension password reset fails; all user p | /etc/shadow file has immutable attribute (+i) set via chattr, preventing any mod | Use Custom Script Extension to remove immutable attribute and reset password: cr | 🔵 5 | ON |

## 快速排查路径

1. **Cannot login to Azure VM, password incorrect, VMAccess extension not installed o**
   - 根因: VM created without Azure VM Extension (VMAccess) or extension is broken/corrupted.
   - 方案: Windows: reset password without agent via offline method. Linux: VMAccessForLinux TSG. Use rescue VM if agent unavailable.
   - `[🟢 8 | ON]`

2. **Ubuntu Linux VM cannot be accessed: SSH fails, VMAccess agent does not work, VM **
   - 根因: Ubuntu does not support password reset via serial console natively; when both VMAccess extension and SSH are broken and 
   - 方案: Use az vm repair to create a recovery VM with OS disk attached as data disk. Mount the root filesystem at /recovery, blank the password field in /etc/
   - `[🟢 8 | ON]`

3. **After using Reset Password (EnableVMAccess extension) on a Linux VM, ChallengeRe**
   - 根因: By design — the EnableVMAccess extension explicitly sets ChallengeResponseAuthentication to no in sshd_config as a secur
   - 方案: This is expected behavior. If the customer requires ChallengeResponseAuthentication=yes, they need to manually re-enable it in /etc/sshd_config after 
   - `[🔵 7.5 | AW]`

4. **After using Reset Password feature on a Linux VM, ChallengeResponseAuthenticatio**
   - 根因: The EnableVMAccess extension explicitly sets ChallengeResponseAuthentication to no in sshd_config as a security measure,
   - 方案: Inform customer this is by design - a security measure implemented by the VMAccess extension. If customer requires ChallengeResponseAuthentication=yes
   - `[🔵 7.5 | AW]`

5. **VM Access Extension fails to reset password; RDP and serial console unavailable.**
   - 根因: Local security policy (inherited from base image) enforces minimum password length. Short passwords fail VMAccess reset 
   - 方案: 1) Verify password policy with 'net accounts' command. 2) Temporarily lower minimum password length and disable complexity requirements. 3) Uninstall 
   - `[🔵 7.5 | AW]`

