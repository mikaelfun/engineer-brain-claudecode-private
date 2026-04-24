# VM 网络防火墙与 NSG — 排查速查

**来源数**: 3 (AW, ML, ON) | **条目**: 21 | **21V**: 20/21
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | SAP on Azure VM customer cannot download Health history report from Azure portal in China region | Network connectivity issue between customer network and Azure portal | Customer resolved by checking and fixing network connectivity. No CSS assistance | 🟢 8 | ON |
| 2 | Azure Performance Diagnostics (PerfInsights) fails with 'Failed to upload result to storage account' | NSG rule or NVA/firewall blocks HTTP (port 80) traffic to Certificate Authority  | 1) Check for SSL packet inspection tools on VM. 2) Allow outbound HTTP (port 80) | 🔵 7.5 | AW |
| 3 | ACSS does not natively support Private Endpoint. Customer needs private connectivity between ACSS an | Private Endpoint is not officially supported in ACSS. Only Service Endpoint is n | Workaround (unsupported, at customer risk): 1) Enable Microsoft.Storage Service  | 🔵 7.5 | AW |
| 4 | ACSS Install deployment fails with AnsibleTaskExecutionFailed during OS package update (RHEL) or zyp | Inability to reach the OS repositories (RHEL RHUI or SUSE repos) due to network  | Review firewall rules to ensure appropriate endpoints for SUSE/RHEL are permitte | 🔵 7.5 | AW |
| 5 | VM Application version creation fails with InvalidParameter: The SAS is not valid for source uri whe | Storage account firewall blocks the Azure Compute Gallery service from downloadi | Temporarily disable the storage account firewall during VM Application version c | 🔵 7.5 | AW |
| 6 | VM Application version replication shows provision failed status with no visible error in portal not | Storage account firewall blocks the ACG service from accessing the source blob f | Disable storage account firewall temporarily to allow replication to complete. D | 🔵 7.5 | AW |
| 7 | AIB build fails with WinRM timeout error (Timeout waiting for WinRM) when using CIS-hardened Windows | CIS hardening disrupts WinRM connectivity. AIB/Packer relies on WinRM to communi | Known limitation as of June 2025 - no direct automated solution within AIB. No f | 🔵 7.5 | AW |
| 8 | AIB build fails with runState failed when using CIS-hardened Windows Server image as source. Customi | CIS hardening modifies firewall rules, service configurations, and security poli | Known limitation with no automated fix. Gather AIB template and customization.lo | 🔵 7.5 | AW |
| 9 | ASR V2A with proxy configured: initial replication stuck at 0% with error 90078 or 90079; portal sho | cbengine.exe runs as SYSTEM account and uses SYSTEM account IE proxy settings; t | 1. Download PsExec (Sysinternals). 2. Run elevated: psexec -i -s "c:\Program Fil | 🔵 7.5 | ON |
| 10 | AIB build fails with InternalOperationError. Kusto AsyncContextActivity/PackerizerContextActivity lo | Customer had Azure Policy adding NSG rules to the subnet used by AIB container i | Remove the restrictive policy or add an exception for Azure Image Builder resour | 🔵 6.5 | AW |
| 11 | AIB build fails with InternalOperationError. Kusto AsyncContextActivity and PackerizerContextActivit | Customer had an Azure Policy that added NSG rules to the NSG attached to the AIB | Remove the restrictive policy or add an exception for Azure Image Builder resour | 🔵 6.5 | AW |
| 12 | Container/VM loses network connectivity on Gen 8 host nodes with SwitchPortNotEnabled errors - NM pr | Expired SoC machinefunction certificate (APPKI CA) causes host-to-SoC control pl | File ICM to EEE Cloudnet team for triage and mitigation; verify by checking NMAG | 🔵 6.5 | AW |
| 13 | VM unexpectedly loses network connectivity with SwitchPortNotEnabled errors during network component | Network component update on host node triggers VFP layer programming failure (VF | Redeploy the VM or deallocate and restart the VM to restore network connectivity | 🔵 6.5 | AW |
| 14 | Azure VM screenshot shows Windows setup error: The computer restarted unexpectedly or encountered an | First boot of a generalized (sysprepped) image fails to process the unattended a | Change support topic to: Product=Azure Virtual Machine Windows, Topic=Cannot cre | 🔵 6.5 | AW |
| 15 | Windows activation stops working on Azure VM. Error 0xC004F074: No KMS could be contacted. Previousl | Azure KMS IP addresses changed in July 2022. azkms.core.windows.net now points t | 1) Test-NetConnection azkms.core.windows.net -Port 1688, also test 20.118.99.224 | 🔵 6.5 | ML |
| 16 | Azure Windows VM activation fails with error 0x800705B4 (timeout). Security-SPP Event ID 8196 logged | Network connectivity or DNS resolution problems prevent VM from reaching Azure K | Set KMS server: slmgr.vbs /skms azkms.core.windows.net:1688. Verify connectivity | 🔵 6.5 | ML |
| 17 | RHEL yum fails. Firewall/NVA/NSG blocking RHUI. SSL inspection altering RHUI cert. | Firewall/NVA or NSG blocking RHUI IPs. SSL inspection altering certificate. | Allow RHUI 4 IPs in firewall. Add to NSG outbound allow. Whitelist RHUI URLs in  | 🔵 6.5 | ML |
| 18 | Azure VM cannot connect to IMDS endpoint (169.254.169.254) due to expired or missing intermediate ce | Intermediate certificates for IMDS attested data TLS expired or missing from loc | 1. For WS2022 install KB5036909. 2. Configure firewall/proxy to allow cert downl | 🔵 5.5 | ML |
| 19 | apt update fails with 470 status code or The repository is no longer signed error on Ubuntu VM | Firewall, virtual appliance, or NSG blocking outbound traffic to Ubuntu repo URL | Allow azure.archive.ubuntu.com and packages.microsoft.com through firewall. Add  | 🔵 5.5 | ML |
| 20 | RHEL yum timeout. VM behind internal standard load balancer, no outbound connectivity to RHUI. | Internal standard LB does not provide outbound connectivity. | Add public IP, use external LB, add NAT gateway, or configure SNAT rules. | 🔵 5.5 | ML |
| 21 | Windows device registration (Azure AD Join) fails; WinHTTP callback error 0x80072efd (ERROR_WINHTTP_ | Customer blocked the endpoint enterpriseregistration.windows.net at network/fire | Unblock the endpoint enterpriseregistration.windows.net on the network/firewall; | 🔵 5 | ON |

## 快速排查路径

1. **SAP on Azure VM customer cannot download Health history report from Azure portal**
   - 根因: Network connectivity issue between customer network and Azure portal
   - 方案: Customer resolved by checking and fixing network connectivity. No CSS assistance required.
   - `[🟢 8 | ON]`

2. **Azure Performance Diagnostics (PerfInsights) fails with 'Failed to upload result**
   - 根因: NSG rule or NVA/firewall blocks HTTP (port 80) traffic to Certificate Authority CRL/OCSP endpoints, or SSL packet inspec
   - 方案: 1) Check for SSL packet inspection tools on VM. 2) Allow outbound HTTP (port 80) to CRL/OCSP endpoints: crl3.digicert.com, crl4.digicert.com, ocsp.dig
   - `[🔵 7.5 | AW]`

3. **ACSS does not natively support Private Endpoint. Customer needs private connecti**
   - 根因: Private Endpoint is not officially supported in ACSS. Only Service Endpoint is natively supported for restricting networ
   - 方案: Workaround (unsupported, at customer risk): 1) Enable Microsoft.Storage Service Endpoint on SAP system VNET subnet. 2) Register SAP system with ACSS w
   - `[🔵 7.5 | AW]`

4. **ACSS Install deployment fails with AnsibleTaskExecutionFailed during OS package **
   - 根因: Inability to reach the OS repositories (RHEL RHUI or SUSE repos) due to network restrictions, firewall rules, or other n
   - 方案: Review firewall rules to ensure appropriate endpoints for SUSE/RHEL are permitted per https://learn.microsoft.com/en-us/azure/center-sap-solutions/pre
   - `[🔵 7.5 | AW]`

5. **VM Application version creation fails with InvalidParameter: The SAS is not vali**
   - 根因: Storage account firewall blocks the Azure Compute Gallery service from downloading the application binary during the VM 
   - 方案: Temporarily disable the storage account firewall during VM Application version creation and replication. After the version is properly created and rep
   - `[🔵 7.5 | AW]`

