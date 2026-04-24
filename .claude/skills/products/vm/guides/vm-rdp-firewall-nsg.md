# VM RDP 防火墙与 NSG 阻断 — 排查速查

**来源数**: 3 (AW, ML, ON) | **条目**: 25 | **21V**: 全部
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | VM deployment shows ProvisioningTimeout error, but VM is accessible via RDP/SSH and usable. VM shows | A specialized VHD (production OS instance) was deployed using generalized method | Recreate the VM with specialized deployment method (Attach instead of FromImage) | 🟢 8 | ON |
| 2 | Cannot RDP to Windows VM. VM screenshot shows OS at login screen. No inbound/outbound network traffi | Guest OS firewall RDP rule (Remote Desktop TCP-In) is disabled or not configured | Online: Enable the RDP firewall rule via Serial Console: netsh advfirewall firew | 🔵 7.5 | AW |
| 3 | Cannot RDP to Windows VM. All inbound connections blocked. VM screenshot shows OS at login. No conne | One or more Guest OS firewall profiles (Domain/Private/Public) configured with B | Online via Serial Console: netsh advfirewall set allprofiles state off (temporar | 🔵 7.5 | AW |
| 4 | Cannot RDP to VM migrated from on-premises (via VHD upload or ASR). No NIC in ipconfig, only loopbac | The migrated VM was a Hyper-V host. The Hyper-V virtual switch (VMSMP) conflicts | Do not migrate Hyper-V hosts directly to Azure. Create a new VM with nested virt | 🔵 7.5 | AW |
| 5 | Cannot SSH to Linux VM. No connectivity on VIP/DIP. Console serial log shows different DIP IP than A | Static IP hardcoded in Linux network configuration file does not match Azure DHC | Change network config to DHCP. RHEL/CentOS: edit /etc/sysconfig/network-scripts/ | 🔵 7.5 | AW |
| 6 | Cannot RDP to Windows VM. VM screenshot shows OS at login screen. No connections in Guest OS logs. W | Restrictive IPSec policy configured on the Guest OS blocking all inbound traffic | Online (2008/2008R2): netsh nap client set enforcement ID=79619 ADMIN=DISABLE. O | 🔵 7.5 | AW |
| 7 | Cannot RDP/SSH to Azure VM. VM may be stuck booting or have no connectivity. MSConfig was used to di | Customer used MSConfig to customize system services startup, disabling critical  | Restore to Normal Startup: ONLINE via Serial Console/RunCommands - re-enable dis | 🔵 7.5 | AW |
| 8 | Cannot RDP to Azure VM after configuring multiple IPs per NIC feature. Guest OS NIC set to static IP | The primary IP for the primary NIC has a mismatched IP address between the Azure | Re-enable DHCP on the primary NIC in the Guest OS. Azure VMs require DHCP mode f | 🔵 7.5 | AW |
| 9 | Cannot RDP to Azure VM. NIC is disabled in Guest OS. Event ID 6 shows Miniport NIC is halting. WaApp | The network interface card (NIC) was manually disabled in the Guest OS, removing | ONLINE via Serial Console: 1) netsh interface show interface (verify NIC is Disa | 🔵 7.5 | AW |
| 10 | Azure VM enters reboot loop or goes to Stopped state after installing Windows cumulative updates (e. | When VM is shutdown from Azure portal, Windows Updates get applied during shutdo | Offline troubleshooting required: attach OS disk to repair VM, uninstall the pro | 🔵 7.5 | AW |
| 11 | RDP to Windows Server 2016 Nano VM fails with 'machine is offline' error - screenshot shows Nano Ser | Windows Server 2016 Nano is a stripped-down version with no GUI, no RDP support, | Use PowerShell remoting instead of RDP. Ensure NSG/ACL allows ports 5985 and 598 | 🔵 7.5 | AW |
| 12 | RDP via site-to-site VPN/VNET from on-premises shows black screen after authentication, disconnects  | MTU size is set incorrectly on the on-premises firewall, causing packets larger  | Update MTU size on on-premises firewall. Or change locally on VM: netsh interfac | 🔵 7.5 | AW |
| 13 | RDP fails with three-reasons error on VM with Citrix XenApp 6.x/7.x installed or recently uninstalle | Citrix XenApp 6.x/7.x RDS VDA modifies RDP listener LoadableProtocol_Object regi | Restore LoadableProtocol_Object registry to original GUID: for Server 2008 R2 us | 🔵 7.5 | AW |
| 14 | RDP to Azure Windows VM fails after May 2018 update: "An authentication error has occurred. The func | May 2018 cumulative update (CVE-2018-0886 fix) changed Group Policy Encryption O | 3 options: (1) Use unpatched client / Console / Bastion to access VM, install Ma | 🔵 7 | ON |
| 15 | VM 可能遭受 RDP 暴力破解攻击（VM potentially under attack via internet-exposed RDP） | NSG 规则开放了 RDP 端口（3389），且 Source IP 为通配符（*），任意互联网 IP 均可连接，攻击者可暴力破解后横向移动 | 将 NSG 规则的 RDP 来源 IP 限制为本地公网 IP（非 *）；或启用 Just-In-Time (JIT) VM Access 替代开放 RDP 端口 | 🔵 6.5 | AW |
| 16 | Cannot RDP to Azure VM because the Network Security Group (NSG) is missing the default RDP inbound a | Creating a new NSG from portal or PowerShell does not automatically create the d | Use PowerShell (Add-AzureRmNetworkSecurityRuleConfig) to recreate the default RD | 🔵 6.5 | AW |
| 17 | Cannot RDP to Azure VM because NSG is missing default RDP inbound rule (port 3389). Creating a new N | NSG was recreated or newly created without the default RDP (port 3389) inbound a | Use PowerShell to add the RDP rule: Get-AzureRmNetworkSecurityGroup then Add-Azu | 🔵 6.5 | AW |
| 18 | After installing a non-English language pack (e.g. English UK) on Windows 10 AVD image and restartin | Bug triggered by language pack installation on specific Windows 10 AVD images (w | 1) Disable Firewall via Serial Console: netsh advfirewall set allprofiles state  | 🔵 6.5 | AW |
| 19 | Azure VM crashes with bugcheck 0x0000000A (IRQL_NOT_LESS_OR_EQUAL). VM has more than 64 vCPUs config | The Guest OS does not support the number of vCPUs configured on the VM. More tha | Mitigation 1: Resize the VM to fewer than 64 vCPUs and start the VM. Mitigation  | 🔵 6.5 | AW |
| 20 | RDP shows black screen then disconnects; VM is under brute force RDP attack causing performance degr | Brute force RDP attack over the internet causing CPU/memory performance spike, e | Enable Azure NSG rules to restrict RDP access to known IP ranges; enable JIT VM  | 🔵 6.5 | AW |
| 21 | Azure VM screenshot shows Windows setup error: The computer restarted unexpectedly or encountered an | First boot of a generalized (sysprepped) image fails to process the unattended a | Change support topic to: Product=Azure Virtual Machine Windows, Topic=Cannot cre | 🔵 6.5 | AW |
| 22 | RDP fails with CredSSP encryption oracle remediation error: The function requested is not supported. | CredSSP update CVE-2018-0886 installed on one side but not the other. Encryption | Install CredSSP update on both sides. Workaround: REG ADD AllowEncryptionOracle= | 🔵 6.5 | ML |
| 23 | Cannot RDP to Azure VM; massive Event 4625 failed logons every second. Session ends unexpectedly. Wo | Brute force attack on RDP port 3389 consuming service resources. | Enable JIT access. Use Azure Bastion or VPN Gateway. Restrict NSG to specific IP | 🔵 6.5 | ML |
| 24 | RDP times out or refused due to NSG misconfiguration. Works from one IP but not another. | NSG blocking port 3389: no allow rule, priority conflict, subnet/NIC conflict, s | Use Network Watcher IP Flow Verify. Check effective security rules. Add Allow fo | 🔵 6.5 | ML |
| 25 | RDP connection error: You must change your password before logging on the first time. Cannot log in  | The user account has the 'User must change password at next logon' flag set. RDP | If VM agent is running: use Run Command to reset password via 'net user <USERNAM | 🔵 5.5 | ML |

## 快速排查路径

1. **VM deployment shows ProvisioningTimeout error, but VM is accessible via RDP/SSH **
   - 根因: A specialized VHD (production OS instance) was deployed using generalized method (FromImage). The provisioning agent tri
   - 方案: Recreate the VM with specialized deployment method (Attach instead of FromImage). Check ASC → VM → CreateOption to diagnose. Auto RCAs via Execution G
   - `[🟢 8 | ON]`

2. **Cannot RDP to Windows VM. VM screenshot shows OS at login screen. No inbound/out**
   - 根因: Guest OS firewall RDP rule (Remote Desktop TCP-In) is disabled or not configured to allow RDP traffic. Common after migr
   - 方案: Online: Enable the RDP firewall rule via Serial Console: netsh advfirewall firewall set rule name="Remote Desktop - User Mode (TCP-In)" new enable=yes
   - `[🔵 7.5 | AW]`

3. **Cannot RDP to Windows VM. All inbound connections blocked. VM screenshot shows O**
   - 根因: One or more Guest OS firewall profiles (Domain/Private/Public) configured with BlockAllInboundConnections=True, overridi
   - 方案: Online via Serial Console: netsh advfirewall set allprofiles state off (temporary, re-enable after fixing rules). Or reset: netsh advfirewall set allp
   - `[🔵 7.5 | AW]`

4. **Cannot RDP to VM migrated from on-premises (via VHD upload or ASR). No NIC in ip**
   - 根因: The migrated VM was a Hyper-V host. The Hyper-V virtual switch (VMSMP) conflicts with Azure networking - needs a virtual
   - 方案: Do not migrate Hyper-V hosts directly to Azure. Create a new VM with nested virtualization support (supported sizes/regions, Windows Server 2016+ or W
   - `[🔵 7.5 | AW]`

5. **Cannot SSH to Linux VM. No connectivity on VIP/DIP. Console serial log shows dif**
   - 根因: Static IP hardcoded in Linux network configuration file does not match Azure DHCP-assigned IP. All NIC settings should b
   - 方案: Change network config to DHCP. RHEL/CentOS: edit /etc/sysconfig/network-scripts/ifcfg-eth0, set BOOTPROTO=dhcp. Ubuntu <18.04: edit /etc/network/inter
   - `[🔵 7.5 | AW]`

