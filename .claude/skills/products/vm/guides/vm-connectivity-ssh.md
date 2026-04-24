# VM SSH 连接问题 — 排查速查

**来源数**: 4 (AW, KB, ML, ON) | **条目**: 16 | **21V**: 全部
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | After using Reset Password on Linux VM, ChallengeResponseAuthentication is changed to 'no' in sshd_c | This is by-design behavior. The EnableVMAccess extension intentionally sets Chal | This behavior is by design. If customer requires ChallengeResponseAuthentication | 🔵 7.5 | AW |
| 2 | After using Reset Password on a Linux VM, sshd_config is modified: ChallengeResponseAuthentication i | By design behavior. The EnableVMAccess (VMAccessForLinux) extension explicitly s | This is expected behavior by design. Inform the customer that the EnableVMAccess | 🔵 7.5 | AW |
| 3 | Cannot SSH into Azure Linux VM, connection times out. No connectivity on VIP or DIP verified with VM | UFW (Uncomplicated Firewall) is the guest OS firewall on the Linux VM and does n | Connect via Serial Console or Run Command. Allow SSH: 'sudo ufw allow 22/tcp' or | 🔵 7.5 | AW |
| 4 | Linux VM shows GRUB minimal BASH prompt "Minimal BASH-like line editing is supported", cannot SSH to | GRUB unable to start: (1) grub.cfg missing, (2) incorrect GRUB config, or (3) /b | Method 1: Rescue VM + chroot. RHEL/CentOS Gen1: grub2-mkconfig -o /boot/grub2/gr | 🔵 7.5 | AW |
| 5 | Linux VM cannot be reached via SSH; serial console shows only Enter username: prompt due to GRUB sup | GRUB superuser password protection is enabled (set before VHD upload to Azure or | Attach OS disk to a rescue Linux VM. Mount at /rescue. Edit /rescue/boot/grub/gr | 🔵 7.5 | AW |
| 6 | AIB build with customer VNET fails after ~30 minutes with WinRM/SSH connection timeout via proxy VM. | Traffic to proxy VM comes from two sources: AzureLoadBalancer and private endpoi | Add two NSG inbound rules before DenyAll: (1) TCP 60000-60001 from AzureLoadBala | 🔵 6.5 | AW |
| 7 | AIB build with custom VNET fails after ~30 minutes with connection timeout. Windows: WinRM proxyconn | AIB proxy VM receives traffic from two sources on ports 60000-60001: Azure Load  | Add two NSG inbound rules before the DenyAll rule: (1) TCP 60000-60001 from Azur | 🔵 6.5 | AW |
| 8 | RDP to Windows 2008 R2 VM returns 'Access is denied' during authentication, but administrative sessi | Lack of permissions for users to read the certificate registry entries on termin | Grant READ access to 'Remote Desktop Users' group on registry key HKLM:\SOFTWARE | 🔵 6.5 | AW |
| 9 | RDP shows black screen then disconnects; VM is under brute force RDP attack causing performance degr | Brute force RDP attack over the internet causing CPU/memory performance spike, e | Enable Azure NSG rules to restrict RDP access to known IP ranges; enable JIT VM  | 🔵 6.5 | AW |
| 10 | SSH connection to Linux VM fails with: /var/empty/sshd (RHEL) or /var/lib/empty (SUSE) or /var/run/s | The sshd privilege separation directory does not exist, is not owned by root, or | Create directory if missing, set permissions to 755, set ownership to root:root. | 🔵 6.5 | ML |
| 11 | SSH connection to Azure Linux VM fails, serial console shows 'Failed to load SELinux policy' and OS  | SELinux misconfiguration in /etc/selinux/config, commonly SELINUXTYPE set to 'di | (1) Restart VM, interrupt at GRUB menu, add selinux=0 to kernel line to boot wit | 🔵 6.5 | ML |
| 12 | Enable the debug logs by following this article https://supportability.visualstudio.com/AzureAD/_wik | This issue is caused because the metadata sends the location name as IndiaCentra | This issue is fixed in the Plugin release 1.0.011360001 to install this plugin p | 🔵 6 | KB |
| 13 | Cloud-init intermittently writes SSH Host keys to console as ec2 instead of Azure, causing confusion | Cloud-init SSH module calls write-ssh-key-fingerprints helper which uses legacy  | Ignore ec2 logs during troubleshooting; this is cosmetic only and does not affec | 🔵 5.5 | ML |
| 14 | Linux VM SSH fails, networking down. hv_netvsc disabled in /etc/modprobe.d/. Interface not found for | Hyper-V network driver (hv_netvsc) disabled via blacklist in /etc/modprobe.d/. | grep -nr hv_netvsc /etc/modprobe.d/, remove disable entries, dracut -f -v or mki | 🔵 5.5 | ML |
| 15 | yum/dnf duplicate packages after interrupted update. Protected multilib errors. | Update interrupted (SSH drop, Ctrl+C, restart) leaving old+new versions. | RHEL7: yum-complete-transaction --cleanup-only. RHEL8/9: yum remove --duplicates | 🔵 5.5 | ML |
| 16 | Linux VM SSH authentication succeeds but session immediately disconnects; /var/log/secure shows pam_ | nofile hard limit in /etc/security/limits.conf set higher than /proc/sys/fs/nr_o | 1) Attach OS disk as data disk to rescue VM; 2) Either: change UsePAM yes to Use | 🔵 5 | ON |

## 快速排查路径

1. **After using Reset Password on Linux VM, ChallengeResponseAuthentication is chang**
   - 根因: This is by-design behavior. The EnableVMAccess extension intentionally sets ChallengeResponseAuthentication=no in sshd_c
   - 方案: This behavior is by design. If customer requires ChallengeResponseAuthentication=yes, they must manually re-enable it in /etc/ssh/sshd_config after th
   - `[🔵 7.5 | AW]`

2. **After using Reset Password on a Linux VM, sshd_config is modified: ChallengeResp**
   - 根因: By design behavior. The EnableVMAccess (VMAccessForLinux) extension explicitly sets ChallengeResponseAuthentication to n
   - 方案: This is expected behavior by design. Inform the customer that the EnableVMAccess extension intentionally modifies ChallengeResponseAuthentication. Log
   - `[🔵 7.5 | AW]`

3. **Cannot SSH into Azure Linux VM, connection times out. No connectivity on VIP or **
   - 根因: UFW (Uncomplicated Firewall) is the guest OS firewall on the Linux VM and does not have rules configured to allow SSH tr
   - 方案: Connect via Serial Console or Run Command. Allow SSH: 'sudo ufw allow 22/tcp' or 'sudo ufw allow OpenSSH'. Alternatively, temporarily disable UFW: 'su
   - `[🔵 7.5 | AW]`

4. **Linux VM shows GRUB minimal BASH prompt "Minimal BASH-like line editing is suppo**
   - 根因: GRUB unable to start: (1) grub.cfg missing, (2) incorrect GRUB config, or (3) /boot partition or contents missing
   - 方案: Method 1: Rescue VM + chroot. RHEL/CentOS Gen1: grub2-mkconfig -o /boot/grub2/grub.cfg. Gen2: yum reinstall grub2-efi-x64 shim-x64 then grub2-mkconfig
   - `[🔵 7.5 | AW]`

5. **Linux VM cannot be reached via SSH; serial console shows only Enter username: pr**
   - 根因: GRUB superuser password protection is enabled (set before VHD upload to Azure or configured from Azure VM). Superuser re
   - 方案: Attach OS disk to a rescue Linux VM. Mount at /rescue. Edit /rescue/boot/grub/grub.cfg - comment out 'set superusers' and 'password_pbkdf2' lines at b
   - `[🔵 7.5 | AW]`

