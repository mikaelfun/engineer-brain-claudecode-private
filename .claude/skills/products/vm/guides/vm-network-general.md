# VM 网络通用问题 — 排查速查

**来源数**: 4 (AW, KB, ML, ON) | **条目**: 17 | **21V**: 16/17
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Azure VM loses internet outbound connectivity; new VMs created without explicit outbound method have | Azure retired default outbound access for VMs on Sept 30 2025. VMs in virtual ne | Configure explicit outbound connectivity: Azure NAT Gateway, Azure Load Balancer | 🔵 7.5 | AW |
| 2 | Azure VM in reboot loop after OS change (KB update, application install, or new policy); or due to f | OS changes (KB/application installation or policy change) or file system corrupt | Disable autoreboot to see error. OFFLINE: check Event Logs, CBS.log, WindowsUpda | 🔵 7.5 | AW |
| 3 | ACSS registration fails with FailedToResolveIpAddressFromSapHostname. SAP VM OS is unable to resolve | The ASCS instance cannot connect to the hostname mentioned in the error. Root ca | Check network connectivity by pinging the hostname from the ASCS VM. Verify DNS  | 🔵 7.5 | AW |
| 4 | Azure VM screenshot shows VMWare image customization is in progress message on every boot, delaying  | VMware Image Customization Initialization module is enabled on the VM (similar t | OFFLINE approach: attach OS disk to rescue VM. Disable VMware Customization modu | 🔵 7.5 | AW |
| 5 | Cannot delete Azure VM: error Resource Microsoft.Network/networkInterfaces not found during VM delet | The VM model in CRP contains a reference to a network interface already deleted  | Create a new network interface matching the exact name in VM network profile, th | 🔵 7 | ON |
| 6 | Linux VM loses network connectivity. Static IP in guest OS instead of DHCP causes network issues aft | ifcfg-eth0 has BOOTPROTO set to static instead of dhcp. | Attach OS disk to rescue VM, edit /recoverymnt/etc/sysconfig/network-scripts/ifc | 🔵 6.5 | AW |
| 7 | VMs lose outbound internet connectivity; new VMs created without explicit outbound method have no in | Azure retired default outbound access for VMs. VMs in a virtual network without  | Transition to an explicit outbound connectivity method: (1) Azure NAT Gateway, ( | 🔵 6.5 | AW |
| 8 | Linux VM has network connectivity issues because the guest OS is not configured to use DHCP for IP a | The network interface config file (ifcfg-eth0) has BOOTPROTO set to static inste | Attach OS disk to recovery VM, mount, edit /etc/sysconfig/network-scripts/ifcfg- | 🔵 6.5 | AW |
| 9 | Multiple ghost Mellanox/Hyper-V network adapters appear after Azure VM deallocation (stop/start). Ca | By design with Accelerated Networking: VM moves to new physical host with differ | Detect via RunCommand script. Clean up via Device Manager (View > Show hidden de | 🔵 6.5 | ML |
| 10 | General guidance: Customer Reported Incidents (CRIs) should only be filed for requests where a backe | Lack of clarity on the process to file escalations to Cloud Identity through Vie |  | 🔵 6 | KB |
| 11 | Azure VM deployed in Extended Zone has no internet outbound connectivity - all outbound internet con | VMs in Azure Extended Zones do not have default outbound access unlike standard  | Configure explicit outbound connectivity methods (e.g., NAT Gateway, Load Balanc | 🔵 6.0 | AW |
| 12 | Multiple VMs experience network jitter/connectivity loss simultaneously; two VMs become completely u | Host node became unhealthy - Azure Fabric was unable to reach the node, causing  | Use Kusto LogContainerSnapshot to find containerId+nodeId by subscriptionId+role | 🔵 6 | ON |
| 13 | When trying to connect the VM network to VM in VMM 2012 R2 UR14 it fails with below error Error (127 | Not sure what has the cause but looks WMI got corrupted. Tried uninstalling the  | Put the host in to maintenance mode in VMM Login to hyper v host From an admin c | 🔵 6 | KB |
| 14 | Ubuntu VM apt update/install fails with connection timeout to azure.archive.ubuntu.com when VM is be | Internal standard load balancer does not provide default outbound connectivity. | Add public IP, use external LB, configure NAT gateway, or add SNAT outbound rule | 🔵 5.5 | ML |
| 15 | Cannot connect to Azure Linux VM after disabling the default NIC or manually setting a static IP for | The default network interface (eth0) is disabled or has incorrect static IP conf | Reset the NIC using Azure portal (change IP to static, assign new available IP,  | 🔵 5.5 | ML |
| 16 | Linux VM fails to boot after migration to Azure or after disabling Hyper-V drivers. VM stuck at drac | Hyper-V/LIS drivers not installed, disabled in /etc/modprobe.d, or missing from  | Fix1(disabled): chroot repair VM, grep -nr hv_ /etc/modprobe.d/, remove blacklis | 🔵 5.5 | ML |
| 17 | VM creation in Azure Public MEC Edge Zone fails with public IP-related error or VM creation error re | Azure Public MEC only supports Standard SKU for public IP addresses; Basic SKU p | Specify Standard SKU for Public IP: in CLI use --public-ip-sku Standard; in ARM  | 🔵 5.5 | AW |

## 快速排查路径

1. **Azure VM loses internet outbound connectivity; new VMs created without explicit **
   - 根因: Azure retired default outbound access for VMs on Sept 30 2025. VMs in virtual networks without explicit outbound connect
   - 方案: Configure explicit outbound connectivity: Azure NAT Gateway, Azure Load Balancer outbound rules, or directly attached Azure public IP. Existing VMs us
   - `[🔵 7.5 | AW]`

2. **Azure VM in reboot loop after OS change (KB update, application install, or new **
   - 根因: OS changes (KB/application installation or policy change) or file system corruption causing boot failure loop. Corruptio
   - 方案: Disable autoreboot to see error. OFFLINE: check Event Logs, CBS.log, WindowsUpdate.log for changes. Uninstall problematic KB update if identified. Res
   - `[🔵 7.5 | AW]`

3. **ACSS registration fails with FailedToResolveIpAddressFromSapHostname. SAP VM OS **
   - 根因: The ASCS instance cannot connect to the hostname mentioned in the error. Root causes include VNet issues, incorrect host
   - 方案: Check network connectivity by pinging the hostname from the ASCS VM. Verify DNS configuration and hosts file entries on the VMs. Ensure network prereq
   - `[🔵 7.5 | AW]`

4. **Azure VM screenshot shows VMWare image customization is in progress message on e**
   - 根因: VMware Image Customization Initialization module is enabled on the VM (similar to Azure provisioning agent but for VMwar
   - 方案: OFFLINE approach: attach OS disk to rescue VM. Disable VMware Customization module following VMware KB 1018378. If customer wants deeper RCA, they nee
   - `[🔵 7.5 | AW]`

5. **Cannot delete Azure VM: error Resource Microsoft.Network/networkInterfaces not f**
   - 根因: The VM model in CRP contains a reference to a network interface already deleted from NRP. CRP tries to resolve the NIC d
   - 方案: Create a new network interface matching the exact name in VM network profile, then retry deletion. Use CRP Kusto ApiQosEvent_nonGet and ContextActivit
   - `[🔵 7 | ON]`

