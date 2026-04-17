# Networking Azure Bastion — 综合排查指南

**条目数**: 32 | **草稿融合数**: 14 | **Kusto 查询融合**: 0
**来源草稿**: [ado-wiki-a-bastion-developer-sku.md], [ado-wiki-a-bastion-error-codes.md], [ado-wiki-a-bastion-internal-architecture.md], [ado-wiki-a-bastion-ip-login.md], [ado-wiki-a-bastion-log-sources.md], [ado-wiki-a-bastion-native-client.md], [ado-wiki-a-bastion-scoping-templates.md], [ado-wiki-a-bastion-vnet-peered-endpoints.md], [ado-wiki-b-bastion-aio-tshoot-dashboard.md], [ado-wiki-b-bastion-vnet-peering-troubleshooting.md]...
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: 网络与路由
> 来源: ado-wiki

1. **Customer gets black screen when trying to RDP or SSH to Azure VM via Bastion; ASC Diagnostics shows connectivity status **
   - 根因: User-defined routes (UDR) on VM subnet causing asymmetric routing — traffic is routed through an NVA instead of returning directly to Bastion
   - 方案: 1. Check UDRs on both VM subnet and Bastion subnet via ASC Diagnostics > Azure Bastion Connectivity Checker; 2. Add a more specific route to the Bastion subnet CIDR (e.g., 10.169.245.0/27) with next hop 'Virtual Network' instead of NVA; 3. Validate fix by re-running ASC connectivity check — status should change to 'Ok'
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FHow%20To%2FBastion%20Unable%20to%20RDP%20or%20SSH%20Results%20in%20Black%20Screen)`

2. **Bastion RDP/SSH results in black screen or error 'Target Machine taking too long' even after verifying network connectiv**
   - 根因: WebSockets traffic blocked by customer's firewall or web proxy; Bastion connection requires WebSocket upgrade (wss://) which may be dropped silently
   - 方案: 1. Gather browser HAR trace while customer attempts connection; 2. Open HAR in Fiddler or browser DevTools; 3. Look for WebSocket upgrade calls (wss:// URLs) — expected: client sends HTTP upgrade request, server responds HTTP 101 with 'Connection: upgrade'; 4. If no server response (HTTP 0 in Fiddler) or HTTP errors on WebSocket calls, ask customer security team to allow WebSockets traffic; Ref: https://learn.microsoft.com/en-us/azure/bastion/troubleshoot#blackscreen
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FHow%20To%2FBastion%20Unable%20to%20RDP%20or%20SSH%20Results%20in%20Black%20Screen)`

3. **启用 JIT Access 后 Azure Bastion 无法连接目标 VM，NSG 中 JIT Deny Rule（Priority 4096）阻断了 RDP/SSH 端口**
   - 根因: Microsoft Defender for Cloud JIT 策略在 VM NSG 上创建 Priority 4096 的 Deny Rule，当没有更高优先级 Allow Rule 允许 AzureBastionSubnet 流量时，Bastion 连接被拒绝
   - 方案: 在 VM NIC/Subnet 的 NSG 中为 AzureBastionSubnet CIDR 创建更高优先级的 Allow Rule（inbound 允许 3389/22），使其优先于 JIT Deny Rule 生效；即使 JIT Access 过期，高优先级规则仍保障 Bastion 连接。若需限制为 JIT 方式访问，可通过 MDC → JIT VM Access → Edit Port Configuration 将 AzureBastionSubnet CIDR 添加到允许范围
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FHow%20To%2FJIT%20access%20with%20Bastion)`

4. **Azure Bastion Session Recording 配置后连接报错：Cannot Connect to session without valid SAS URL. Disable session recording on th**
   - 根因: 1. SAS Token 已过期；2. Storage Account 防火墙配置为 Selected Virtual Networks 但未包含 AzureBastionSubnet，导致 Bastion 无法挂载存储（Tomcat 日志/HTTP 500 可见 mount is down）
   - 方案: 1. 重新生成 SAS Token 并更新 Bastion 配置；2. 检查 Storage Account 防火墙 → 将 AzureBastionSubnet 和 VM Subnet 加入 Selected Virtual Networks 允许列表；注意：Session Recording 不支持 Storage Account Private Endpoint
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FHow%20To%2FTroubleshoot%20Session%20Recording)`

5. **Azure Bastion or native RDP connectivity fails; user cannot connect to VM via Bastion/RDP, but Azure serial console acce**
   - 根因: Windows Defender Firewall on the Azure VM is blocking port 3389 (RDP). The firewall may have been re-enabled by Windows Updates, Azure Policies, Group Policy, image defaults, VM Scale Set updates, or manual changes.
   - 方案: Use Azure Serial Console to: (1) run 'netstat -an | findstr 3389' to confirm port status; (2) check firewall with 'Get-NetFirewallProfile | Select-Object Name, Enabled'; (3) add inbound rule: New-NetFirewallRule -DisplayName 'Allow Bastion RDP' -Direction Inbound -Protocol TCP -LocalPort 3389 -Action Allow -Profile Any -RemoteAddress <BastionSubnetRange>. Run ASC diagnostic scan on port 3389 first to confirm the timeout.
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FHow%20To%2FWindows%20Firewall%20Blocking%20Bastion)`

6. **Intermittent/random Bastion connectivity issues when a default route (0.0.0.0/0) is published to the VNet from on-premis**
   - 根因: When a default route 0.0.0.0/0 is published to the VNet, the hidden UDR (User Defined Route) associated with the AzureBastionSubnet becomes dissociated. This hidden UDR is required for proper Bastion routing.
   - 方案: Contact a TA/PG to reassociate the hidden UDR to the Bastion subnet. This is a privileged action requiring PG involvement. Verify in NRP Subscription Details that the hidden UDR is not associated to the Bastion Subnet.
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FKnown%20Issues%20and%20Limitations)`

7. **Multiple symptoms when both IP-based connection and forced tunneling (or advertised default route via ExpressRoute) are **
   - 根因: Enabling IP-based connection removes the internal route table (which contains a default route to the Internet) from AzureBastionSubnet. When forced tunneling is also enabled, this creates an asymmetric routing issue: health probes (sent from external VIP) and VMSS provisioning traffic fail because the internet default route is missing from the Bastion subnet.
   - 方案: Do not combine IP-based connection with forced tunneling or advertised default routes via ExpressRoute. Disable one of the two configurations. If forced tunneling is required, do not enable IP-based connection on the Bastion resource.
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FKnown%20Issues%20and%20Limitations)`

8. **Bastion shows 'The network connection to Bastion Host appears unstable' followed by 'The connection has been closed beca**
   - 根因: JIT (Just-In-Time) VM access has not been granted yet or has expired. When JIT is initializing or has expired, it modifies/restores NSG deny rules for RDP/SSH, blocking the Bastion connection.
   - 方案: Ensure JIT access has been granted and is still active before connecting via Bastion. Wait a few minutes after enabling JIT for the NSG rules to take effect before attempting to connect.
   `[结论: 🔵 6.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FKnown%20Issues%20and%20Limitations)`

### Phase 2: 其他
> 来源: ado-wiki

1. **Bastion session recording connections fail after enabling Session Recording feature; sessions cannot be established or r**
   - 根因: No valid SAS URL provided after enabling session recording, or SAS URL has expired. Bastion requires a valid SAS URL pointing to a storage account container to store recordings.
   - 方案: Generate a new SAS token from the storage container: 1. Right-click container > Generate SAS; 2. Permissions: READ, ADD, CREATE, WRITE, LIST; 3. Set start time at least 15 minutes before current time (clock skew prevention); 4. Copy Blob SAS URL; 5. In Bastion > Session Recording blade > Add or update SAS URL. Note: use access policy without expiration OR track expiry manually.
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FFeatures%2FFeature%3A%20Bastion%20Session%20Recording)`

2. **通过 Azure Bastion 连接时身份验证失败，启用 MCAS/Conditional Access 策略的外部用户无法登录 Bastion**
   - 根因: Bastion 内置安全机制仅允许来自 portal.azure.com 域的访问；启用 MCAS 或 Conditional Access 后访问域被重定向到其他 URL（如 cas.ms/mcas.ms），导致 Bastion 域验证失败
   - 方案: 当前 MCAS（Microsoft Defender for Cloud Apps）Conditional Access 不被 Bastion 支持（Feature Request Task 10883555 已提交 PG）。短期缓解：禁用对 Bastion 访问的 Conditional Access 策略，或排除 portal.azure.com 的 Bastion 访问路径不受 MCAS 拦截；长期需等待 PG 实现该功能
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FHow%20To%2FMCAS%20is%20Not%20Supported%20on%20Bastion)`

3. **通过 Azure Bastion 连接 VM 需要多次尝试才能成功，第一次连接经常超时或失败**
   - 根因: 客户端浏览器或代理阻断了 WebSocket（wss://）连接；Bastion 优先使用 WebSocket，失败后回落到 HTTP Tunnel（效率低，延迟高），HAR 日志中可见 WebSocket 连接失败后切换到 HTTP tunnel
   - 方案: 1. 浏览器 Console 执行 window.WebSocket 确认支持；2. 访问 https://groklearning.com/debug/blocked/ 检测 WebSocket 是否被阻断；3. 检查 Windows 代理设置（UI 或 CMD）；4. 在代理白名单中添加 Bastion DNS（Portal Overview 或 ASC 可见）；或配置 Bastion 流量绕过代理
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FHow%20To%2FTroubleshoot%20Multiple%20Attempts%20To%20Connect%20vm%20via%20Bastion%20issue)`

4. **通过 Azure Bastion Native Client 无法复制粘贴文本到目标 VM（粘贴按钮置灰或无效）**
   - 根因: 本地或 Active Directory Group Policy 启用了 'Do not allow clipboard redirection'，阻止 RDP 会话中的剪贴板重定向
   - 方案: 在目标 VM 执行：gpedit.msc → Computer Configuration > Administrative Templates > Windows Components > Remote Desktop Services > Remote Desktop Session Hosts > Device and Resource Redirection > Do not allow clipboard redirection → Disable；执行 gpupdate /force 后完全注销并重新登录生效（仅断开 RDP 不够）。前提：Bastion Standard SKU + Portal 中已启用 Copy and paste 及 Native client support
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FHow%20To%2FUnable%20to%20Copy%20Paste%20Text%20or%20File)`

5. **通过 Azure Bastion Native Client 无法传输文件（File Transfer 失败，驱动器无法访问）**
   - 根因: 本地或 Active Directory Group Policy 启用了 'Do not allow drive redirection'，阻止 RDP 会话中的驱动器重定向（文件传输依赖此功能）
   - 方案: 在目标 VM 执行：gpedit.msc → Computer Configuration > Administrative Templates > Windows Components > Remote Desktop Services > Remote Desktop Session Hosts > Device and Resource Redirection > Do not allow drive redirection → Disable；执行 gpupdate /force 后完全注销并重新登录生效。注意：修改 Domain Controller 的 Group Policy 影响范围广，需谨慎
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FHow%20To%2FUnable%20to%20Copy%20Paste%20Text%20or%20File)`

6. **Azure Bastion 部署失败，错误：Public IP Allocation failed. Please increase Public IP quota and try again. (Code: GatewayAllocati**
   - 根因: 订阅的 Public IP 配额耗尽，涉及多种配额类型：maxPublicIpsPerSubscription、maxStaticPublicIpsPerSubscription、maxStandardSkuPublicIpsPerSubscription 之一超限
   - 方案: 通过 Jarvis → NRP Quota Operation → Get NRP Subscription Quota Details 检查订阅当前各类 Public IP 配额用量；确认超限的配额类型后，开 Collaboration 给 Subscription Team 申请提升对应配额
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FHow%20To%2FDeployment%20Issues)`

7. **Azure Bastion + Entra ID login fails with 'An internal error has occurred within the Bastion Host, and the connection ha**
   - 根因: The AADLoginForWindows extension fails with error code 0x801c0083: 'The hostname is already used by another device in this tenant, please change the VM name to redeploy the extension.' Another device in the Entra ID tenant already has the same hostname registered. Common cause: VMs deployed with scripts/templates using static/reused hostnames. The extension failure only appears in AADLoginForWindows extension logs.
   - 方案: (1) Check AADLoginForWindows extension logs in IaaS disk inspection (WindowsAzure\Logs\Plugins\Microsoft.Azure.ActiveDirectory.AADLoginForWindows\). (2) Confirm duplicate device registration via ASC. (3) Rename VM to a unique hostname. (4) Reinstall the AADLoginForWindows extension to register the new hostname in Entra ID.
   `[结论: 🔵 6.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FKnown%20Issues%20and%20Limitations)`

### Phase 3: 权限与认证
> 来源: ado-wiki

1. **Microsoft Entra ID login option not displayed as an authentication option in Azure Bastion for Linux VMs**
   - 根因: AADSSHLogin/AADSSHLoginForLinux extension not installed on VM, or required RBAC role (Virtual Machine Administrator Login / Virtual Machine User Login) not assigned, or system-assigned managed identity not enabled on VM
   - 方案: 1. Verify AADSSHLogin or AADSSHLoginForLinux extension is listed under VM > Extensions + Applications; 2. Assign 'Virtual Machine Administrator Login' or 'Virtual Machine User Login' role to user on VM; 3. Ensure system-assigned managed identity is enabled on VM; 4. If all correct, check portal telemetry via Kusto: cluster('azportalpartner').database('AzurePortal').ExtEvents filtering on extension='Microsoft_Azure_HybridNetworking' and area='BastionHost.getVmExtensionsForVmId' or 'BastionHostAjax.getRoleAssignmentsForVmAssignedToPrincipal'
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FFeatures%2FFeature%3A%20Bastion%20SSH%20%2B%20EntraID%20authentication%20through%20Portal)`

2. **Entra ID login option displayed in Bastion but authentication fails; or option appears but login does not work for certa**
   - 根因: Linux distribution or version does not support Entra ID (AAD) login. Some unsupported OS versions allow extension installation post-deployment but the OS itself cannot authenticate via AAD.
   - 方案: Verify Linux distro is in supported list: Common Base Linux Mariner, CentOS, Debian, openSUSE, RHEL, SLES, Ubuntu Server. Unsupported distros cannot authenticate even with extension installed. Ref: https://learn.microsoft.com/en-us/azure/active-directory/devices/howto-vm-sign-in-azure-ad-linux
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FFeatures%2FFeature%3A%20Bastion%20SSH%20%2B%20EntraID%20authentication%20through%20Portal)`

3. **Azure Bastion login fails when Microsoft security compliance baselines (Security Compliance Toolkit) are applied to the **
   - 根因: Group Policy 'Encryption Oracle Remediation' is set to 'Force Updated Clients' under Computer Configuration > Administrative Templates > System > Credentials Delegation. Registry: HKLM\Software\Microsoft\Windows\CurrentVersion\Policies\System\CredSSP\Parameters. This setting prevents unpatched CredSSP clients (Bastion) from connecting.
   - 方案: Change the 'Encryption Oracle Remediation' policy from 'Force Updated Clients' to 'Mitigated'. 'Mitigated' allows services using CredSSP to accept unpatched clients, while 'Force Updated Clients' blocks them. See: https://support.microsoft.com/en-us/help/4093492
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FKnown%20Issues%20and%20Limitations)`

4. **Error 'unable to query Bastion data' appears when trying to generate a Bastion session for an Azure VM**
   - 根因: Permission/RBAC issue: one or more ARM calls required to prepare the Bastion session are returning 403 (Forbidden) errors. The user lacks required RBAC roles on one or more resources.
   - 方案: Collect a browser HAR trace (https://docs.microsoft.com/en-us/azure/azure-portal/capture-browser-trace) while reproducing the error. Open the .har file and identify calls with 403 errors. Add the missing RBAC roles as documented in Bastion FAQ (Reader on VM, NIC, Bastion resource, VNet).
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FKnown%20Issues%20and%20Limitations)`

5. **Members of the Protected Users security group cannot log into a Domain Controller when using Azure Bastion IP Connect fe**
   - 根因: When using IP Connect, Bastion authentication downgrades to NTLM (Windows will not attempt Kerberos when hostname is an IP address). Domain Controllers restrict Protected Users Group members from authenticating with NTLM per Protected Users Security Group policy.
   - 方案: Unsupported combination. Use a VM resource as the target (not IP Connect) to allow Kerberos authentication. Do not use IP Connect for Protected Users Group accounts on Domain Controllers.
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FKnown%20Issues%20and%20Limitations)`

6. **AADSTS293004: 'The target-device identifier was not found in the tenant' error when connecting via Azure Bastion with En**
   - 根因: Windows hostnames are limited to 15 characters; long VM resource names are automatically truncated. Bastion uses the full resource name when generating the RDP connection, while Entra ID expects the truncated hostname. This name mismatch causes authentication failure. Multiple VMs sharing the same prefix may create duplicate device names in Entra.
   - 方案: Rename the VM resource to a unique hostname of 15 characters or fewer, then reinstall the AADLoginForWindows extension to sync the new name to Entra ID. Alternatively: edit the generated .rdp file to replace the full resource name with the hostname, or use a Bastion tunnel and map the hostname via the local hosts file.
   `[结论: 🔵 6.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FKnown%20Issues%20and%20Limitations)`

### Phase 4: 配置问题
> 来源: ado-wiki

1. **Customer wants to change existing regular Azure Bastion deployment to private-only deployment, or cannot configure priva**
   - 根因: Private-only Bastion must be configured at initial deployment time and requires Premium SKU. There is no in-place conversion from regular deployment to private-only.
   - 方案: 1) Delete the existing Bastion deployment from the VNet. 2) Redeploy Bastion with Premium SKU and enable the Private IP address (private-only) option during deployment. The AzureBastionSubnet does not need to be deleted and recreated. Note: Private-only Bastion does not allow public IP access — users must connect via ExpressRoute private-peering to access the bastion private IP.
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FFeatures%2FFeature%3A%20Bastion%20Private-Only%20Deployment)`

2. **Bastion session recording fails; Bastion unable to push recordings to storage account even with valid SAS URL**
   - 根因: CORS policy not correctly configured on storage account, preventing Bastion from writing to the storage container
   - 方案: Go to Storage Account > Resource Sharing (CORS) > Blob service. Add/update CORS policy: set Allowed Origins to either '*' or Bastion DNS 'https://bst-<armguid>.bastion.azure.com'; set Allowed Methods to at least DELETE, GET. Note: updating storage account or container while connections are active will cause connection failures.
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FFeatures%2FFeature%3A%20Bastion%20Session%20Recording)`

3. **无法通过 Azure Bastion 连接 VM（Portal 报 'target machine unreachable or credentials incorrect'），Daemon 日志显示 'license connection**
   - 根因: VM 上安装了 Remote Desktop Session Host (RDSH) Role 但 RDS Grace Period 已过期或未配置 RD Licensing Server（Windows Event ID 50280: RD Licensing grace period expired；Event ID 1068: Licensing mode not configured）
   - 方案: 无 RDS Farm 需求：通过 Server Manager → Remove Roles → Remote Desktop Session Host 卸载角色；或通过 Serial Console 执行 powershell: Uninstall-WindowsFeature -Name RDS-RD-Server -Restart。有 RDS Farm：需配置有效 RD Licensing Server 并购买 CAL 许可证。可用 ASC Inspect IaaS Disk / WinGuest Analyzer 确认 RDP Event 日志；注意移除 RDS 后最多允许 2 个并发连接
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FHow%20To%2FUnable%20to%20use%20Bastion%20to%20connect%20to%20a%20VM%20due%20to%20RDS%20licensing%20issue)`

4. **Azure Bastion Kerberos setting cannot be configured via native client; Kerberos authentication unavailable or misconfigu**
   - 根因: The Kerberos setting for Azure Bastion can only be configured through the Azure portal; native client configuration is not supported.
   - 方案: Configure Kerberos settings exclusively through the Azure portal. Additionally: Domain Controller must be an Azure-hosted VM within the same VNet as Bastion; VMs migrated from on-premises are not supported; cross-realm authentication is not supported; Bastion only recognizes the first DC if multiple DCs are added.
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FHow%20To%2FVerify%20Bastion%20is%20using%20Kerberos)`

5. **'You have been disconnected' error when connecting to a migrated (on-premises to Azure) VM through Bastion using sharabl**
   - 根因: The target VM has Remote Desktop Licensing and Remote Desktop Session Host server roles installed, making it an RDS session host. Azure Bastion does not support connecting to VMs configured as RDS session hosts (per https://learn.microsoft.com/en-us/azure/bastion/bastion-faq#rdscal-compatibility).
   - 方案: Bastion is unsupported for RDS session hosts. Use native RDP to connect to these VMs instead. Ensure customer removes or does not use Bastion for VMs with Remote Desktop Session Host role installed.
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FKnown%20Issues%20and%20Limitations)`

### Phase 5: 证书与密钥
> 来源: ado-wiki

1. **Customer reports security vulnerabilities on Azure Bastion public IP: HTTP OPTIONS method enabled, TLS static key cipher**
   - 根因: These configurations are by design: (1) HTTP OPTIONS is required for Bastion to work with Azure Portal. (2) TLS 1.2 cipher list follows Microsoft security compliance policy. (3) Certificates are managed and rotated every 90 days. (4) No problematic ciphers per RFC 9113. (5) AngularJS EOL — PG is migrating to a different framework (no ETA).
   - 方案: Inform customer: (1) HTTP OPTIONS cannot be disabled — required for portal functionality. (2) Cipher list is not customer-configurable; maintained per Microsoft security policy. (3) Certificates auto-rotate every 90 days. (4) AngularJS vulnerability: PG is actively working on migration to new framework; no current active vulnerability exploitable. For other unreported vulnerabilities, escalate via TA/AVA to PG and document in the wiki.
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FBastion%20Vulnerabilities)`

2. **Portal shows error 'There was an error in fetching ssh cert token for Entra ID authentication. Please try again.' when c**
   - 根因: Problem communicating with Bastion for keys or fetching token from portal side; may involve failures in cert token fetch or RSA key retrieval
   - 方案: Check portal telemetry using Kusto: cluster('azportalpartner').database('AzurePortal').ExtEvents filtering on extension='Microsoft_Azure_HybridNetworking', area='BastionLoginWindowV2._fetchSshCertTokenAndConnect' or 'BastionLoginWindowV2._getRsaKeys' to identify specific failure
   `[结论: 🟢 7.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FFeatures%2FFeature%3A%20Bastion%20SSH%20%2B%20EntraID%20authentication%20through%20Portal)`

### Phase 6: DNS 解析
> 来源: ado-wiki

1. **Azure Bastion Kerberos authentication fails after DNS server changes on the VNet; users cannot authenticate using Kerber**
   - 根因: Changes to DNS server are not supported for Kerberos authentication in Azure Bastion. The Bastion service does not pick up DNS changes dynamically.
   - 方案: Delete and re-create the Azure Bastion resource after making any DNS server changes to the VNet.
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FHow%20To%2FVerify%20Bastion%20is%20using%20Kerberos)`

2. **Azure Bastion expected to use Kerberos authentication but silently falls back to NTLM; Tomcat log shows 'fallback to non**
   - 根因: Kerberos authentication setup incomplete: Bastion environment missing required Active Directory Domain Services (must include Kerberos, LDAP, DNS, and time services), or Kerberos not enabled in Bastion Configuration blade
   - 方案: 1. Enable Kerberos authentication in Bastion Configuration blade; 2. Verify Bastion environment has its own ADDS providing Kerberos+LDAP+DNS+time services; 3. Validate via Tomcat logs: success = 'Resolving ... with Kerberos enabled', failure = 'fallback to non-Kerberos IpResolver {}'; 4. ASC will show 'Kerberos Enabled: true/false' under Bastion Properties post-GA; 5. Use Vulcan for portal validation
   `[结论: 🟢 7.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FFeatures%2FFeature%3A%20Kerberos%20Support%20for%20Azure%20Bastion)`

### Phase 7: 已知问题与限制
> 来源: ado-wiki

1. **'Reset Password' option not visible when connecting via Azure Bastion Shareable Link, even when VM local account has 'Us**
   - 根因: By design: Bastion Shareable Link is intended for external/third-party users. Exposing password reset to third parties would be a security risk. Reset Password is only available from Azure Portal Bastion blade, not via Shareable Link.
   - 方案: Inform customer this is expected behavior by design. To reset password, use the Azure Portal Bastion blade directly (not the Shareable Link flow). Standard SKU required for Shareable Link.
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FFeatures%2FFeature%3A%20Bastion%20Shareable%20Link)`

### Phase 8: 限制与容量
> 来源: ado-wiki

1. **Azure Bastion VNet peering connectivity fails when using Virtual WAN topology - Bastion host cannot reach VMs in peered **
   - 根因: Azure Bastion VNet peering feature is not supported with Virtual WAN. This is a platform limitation.
   - 方案: Deploy Azure Bastion directly in each VNet that requires Bastion access. Do not rely on VNet peering through Virtual WAN for Bastion connectivity. Standard VNet peering (non-vWAN) is supported.
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Bastion/Features/Feature%3A%20VNET%20Peering%20support)`

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Customer reports security vulnerabilities on Azure Bastio... | These configurations are by design: (1) HTTP OP... | Inform customer: (1) HTTP OPTIONS cannot be dis... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FBastion%20Vulnerabilities) |
| 2 | Customer wants to change existing regular Azure Bastion d... | Private-only Bastion must be configured at init... | 1) Delete the existing Bastion deployment from ... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FFeatures%2FFeature%3A%20Bastion%20Private-Only%20Deployment) |
| 3 | Microsoft Entra ID login option not displayed as an authe... | AADSSHLogin/AADSSHLoginForLinux extension not i... | 1. Verify AADSSHLogin or AADSSHLoginForLinux ex... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FFeatures%2FFeature%3A%20Bastion%20SSH%20%2B%20EntraID%20authentication%20through%20Portal) |
| 4 | Entra ID login option displayed in Bastion but authentica... | Linux distribution or version does not support ... | Verify Linux distro is in supported list: Commo... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FFeatures%2FFeature%3A%20Bastion%20SSH%20%2B%20EntraID%20authentication%20through%20Portal) |
| 5 | Bastion session recording connections fail after enabling... | No valid SAS URL provided after enabling sessio... | Generate a new SAS token from the storage conta... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FFeatures%2FFeature%3A%20Bastion%20Session%20Recording) |
| 6 | Bastion session recording fails; Bastion unable to push r... | CORS policy not correctly configured on storage... | Go to Storage Account > Resource Sharing (CORS)... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FFeatures%2FFeature%3A%20Bastion%20Session%20Recording) |
| 7 | 'Reset Password' option not visible when connecting via A... | By design: Bastion Shareable Link is intended f... | Inform customer this is expected behavior by de... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FFeatures%2FFeature%3A%20Bastion%20Shareable%20Link) |
| 8 | Customer gets black screen when trying to RDP or SSH to A... | User-defined routes (UDR) on VM subnet causing ... | 1. Check UDRs on both VM subnet and Bastion sub... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FHow%20To%2FBastion%20Unable%20to%20RDP%20or%20SSH%20Results%20in%20Black%20Screen) |
| 9 | Bastion RDP/SSH results in black screen or error 'Target ... | WebSockets traffic blocked by customer's firewa... | 1. Gather browser HAR trace while customer atte... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FHow%20To%2FBastion%20Unable%20to%20RDP%20or%20SSH%20Results%20in%20Black%20Screen) |
| 10 | 启用 JIT Access 后 Azure Bastion 无法连接目标 VM，NSG 中 JIT Deny Ru... | Microsoft Defender for Cloud JIT 策略在 VM NSG 上创建... | 在 VM NIC/Subnet 的 NSG 中为 AzureBastionSubnet CID... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FHow%20To%2FJIT%20access%20with%20Bastion) |
| 11 | 通过 Azure Bastion 连接时身份验证失败，启用 MCAS/Conditional Access 策略的... | Bastion 内置安全机制仅允许来自 portal.azure.com 域的访问；启用 MC... | 当前 MCAS（Microsoft Defender for Cloud Apps）Condi... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FHow%20To%2FMCAS%20is%20Not%20Supported%20on%20Bastion) |
| 12 | 通过 Azure Bastion 连接 VM 需要多次尝试才能成功，第一次连接经常超时或失败 | 客户端浏览器或代理阻断了 WebSocket（wss://）连接；Bastion 优先使用 W... | 1. 浏览器 Console 执行 window.WebSocket 确认支持；2. 访问 h... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FHow%20To%2FTroubleshoot%20Multiple%20Attempts%20To%20Connect%20vm%20via%20Bastion%20issue) |
| 13 | Azure Bastion Session Recording 配置后连接报错：Cannot Connect to... | 1. SAS Token 已过期；2. Storage Account 防火墙配置为 Sele... | 1. 重新生成 SAS Token 并更新 Bastion 配置；2. 检查 Storage ... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FHow%20To%2FTroubleshoot%20Session%20Recording) |
| 14 | 通过 Azure Bastion Native Client 无法复制粘贴文本到目标 VM（粘贴按钮置灰或无效） | 本地或 Active Directory Group Policy 启用了 'Do not a... | 在目标 VM 执行：gpedit.msc → Computer Configuration >... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FHow%20To%2FUnable%20to%20Copy%20Paste%20Text%20or%20File) |
| 15 | 通过 Azure Bastion Native Client 无法传输文件（File Transfer 失败，驱动... | 本地或 Active Directory Group Policy 启用了 'Do not a... | 在目标 VM 执行：gpedit.msc → Computer Configuration >... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FHow%20To%2FUnable%20to%20Copy%20Paste%20Text%20or%20File) |
| 16 | 无法通过 Azure Bastion 连接 VM（Portal 报 'target machine unreach... | VM 上安装了 Remote Desktop Session Host (RDSH) Role... | 无 RDS Farm 需求：通过 Server Manager → Remove Roles ... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FHow%20To%2FUnable%20to%20use%20Bastion%20to%20connect%20to%20a%20VM%20due%20to%20RDS%20licensing%20issue) |
| 17 | Azure Bastion 部署失败，错误：Public IP Allocation failed. Please... | 订阅的 Public IP 配额耗尽，涉及多种配额类型：maxPublicIpsPerSubs... | 通过 Jarvis → NRP Quota Operation → Get NRP Subsc... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FHow%20To%2FDeployment%20Issues) |
| 18 | Azure Bastion Kerberos authentication fails after DNS ser... | Changes to DNS server are not supported for Ker... | Delete and re-create the Azure Bastion resource... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FHow%20To%2FVerify%20Bastion%20is%20using%20Kerberos) |
| 19 | Azure Bastion Kerberos setting cannot be configured via n... | The Kerberos setting for Azure Bastion can only... | Configure Kerberos settings exclusively through... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FHow%20To%2FVerify%20Bastion%20is%20using%20Kerberos) |
| 20 | Azure Bastion or native RDP connectivity fails; user cann... | Windows Defender Firewall on the Azure VM is bl... | Use Azure Serial Console to: (1) run 'netstat -... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FHow%20To%2FWindows%20Firewall%20Blocking%20Bastion) |
| 21 | Azure Bastion login fails when Microsoft security complia... | Group Policy 'Encryption Oracle Remediation' is... | Change the 'Encryption Oracle Remediation' poli... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FKnown%20Issues%20and%20Limitations) |
| 22 | Error 'unable to query Bastion data' appears when trying ... | Permission/RBAC issue: one or more ARM calls re... | Collect a browser HAR trace (https://docs.micro... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FKnown%20Issues%20and%20Limitations) |
| 23 | Intermittent/random Bastion connectivity issues when a de... | When a default route 0.0.0.0/0 is published to ... | Contact a TA/PG to reassociate the hidden UDR t... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FKnown%20Issues%20and%20Limitations) |
| 24 | 'You have been disconnected' error when connecting to a m... | The target VM has Remote Desktop Licensing and ... | Bastion is unsupported for RDS session hosts. U... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FKnown%20Issues%20and%20Limitations) |
| 25 | Members of the Protected Users security group cannot log ... | When using IP Connect, Bastion authentication d... | Unsupported combination. Use a VM resource as t... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FKnown%20Issues%20and%20Limitations) |
| 26 | Multiple symptoms when both IP-based connection and force... | Enabling IP-based connection removes the intern... | Do not combine IP-based connection with forced ... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FKnown%20Issues%20and%20Limitations) |
| 27 | Azure Bastion VNet peering connectivity fails when using ... | Azure Bastion VNet peering feature is not suppo... | Deploy Azure Bastion directly in each VNet that... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Bastion/Features/Feature%3A%20VNET%20Peering%20support) |
| 28 | Portal shows error 'There was an error in fetching ssh ce... | Problem communicating with Bastion for keys or ... | Check portal telemetry using Kusto: cluster('az... | 🟢 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FFeatures%2FFeature%3A%20Bastion%20SSH%20%2B%20EntraID%20authentication%20through%20Portal) |
| 29 | Azure Bastion expected to use Kerberos authentication but... | Kerberos authentication setup incomplete: Basti... | 1. Enable Kerberos authentication in Bastion Co... | 🟢 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FFeatures%2FFeature%3A%20Kerberos%20Support%20for%20Azure%20Bastion) |
| 30 | Bastion shows 'The network connection to Bastion Host app... | JIT (Just-In-Time) VM access has not been grant... | Ensure JIT access has been granted and is still... | 🔵 6.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FKnown%20Issues%20and%20Limitations) |
| 31 | AADSTS293004: 'The target-device identifier was not found... | Windows hostnames are limited to 15 characters;... | Rename the VM resource to a unique hostname of ... | 🔵 6.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FKnown%20Issues%20and%20Limitations) |
| 32 | Azure Bastion + Entra ID login fails with 'An internal er... | The AADLoginForWindows extension fails with err... | (1) Check AADLoginForWindows extension logs in ... | 🔵 6.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FKnown%20Issues%20and%20Limitations) |
