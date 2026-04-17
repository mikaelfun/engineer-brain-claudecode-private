# ARM Azure Local 部署 — 综合排查指南

**条目数**: 10 | **草稿融合数**: 3 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-b-bicep.md, ado-wiki-b-sff-haas-deployment.md, mslearn-arm-bicep-what-if-guide.md
**Kusto 引用**: —
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Azure Local deployment fails during 'Azure Stack HCI Connectivity' validation w…
> 来源: ado-wiki

**根因分析**: DNS forwarding is not configured on the DNS server. The local DC/DNS cannot resolve external domain names (e.g., microsoft.com) because no forwarders are set.

1. Configure DNS forwarding on the DNS server (DC): Open DNS Manager -> right-click server -> Properties -> Forwarders tab -> add external DNS forwarders (e.
2. 8 or ISP DNS).
3. This allows the local DNS to resolve external names required for Azure connectivity checks.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 2: Azure Local deployment fails during 'Download content for deployment' step with…
> 来源: ado-wiki

**根因分析**: An incorrect deployment username was provided during deployment setup. The username does not match the pre-created deployment user in the Active Directory OU.

1. Update the deployment username to match the pre-created AD user.
2. Use New-HciAdObjectsPreCreation to pre-create: $credential = New-Object PSCredential('<deployuser>', (ConvertTo-SecureString '<pwd>' -AsPlainText -Force)); New-HciAdObjectsPreCreation -AzureStackLCMUserCredential $credential -AsHciOUName 'OU=<HCIOU>,DC=<domain>,DC=local'.
3. Ref: https://learn.
4. com/en-us/azure/azure-local/deploy/deployment-prep-active-directory.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 3: Azure Local deployment fails during 'Join servers to a domain' with error: Type…
> 来源: ado-wiki

**根因分析**: The primary DNS server configured on the node cannot resolve the AD domain. A non-DC DNS IP is listed first, and the system does not fallback to secondary DNS for domain resolution.

1. Set the DC/DNS IP address as the first (primary) DNS entry on all cluster nodes.
2. For example, if DC IP is 192.
3. 2, ensure it is the first DNS server in the NIC configuration.
4. Then resume the deployment.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 4: Azure Local deployment fails during 'Azure Stack HCI Network' validation: Type …
> 来源: ado-wiki

**根因分析**: Storage VLANs (e.g., 711, 712) are not properly configured on TOR switch ports. Switch ports may be in Access mode instead of Trunk mode, or VLAN IDs are not in the allowed list on both ports.

1. 1) On TOR switches: configure storage switch ports as Trunk mode with VLANs in allowed list on BOTH ports.
2. 2) For lab: Set-VMNetworkAdapterVlan -VMName <node> -Trunk -AllowedVlanIdList '711,712' -NativeVlanId 0.
3. 3) Re-run: Invoke-AzStackHciNetworkValidation -DeployAnswerFile <path> -PSSession $sessions -ProxyEnabled $false.
4. 4) Resume deployment.
5. Ref: https://learn.
6. com/en-us/azure/azure-local/manage/use-environment-checker.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 5: Azure Local 部署失败，报 'Azure Stack HCI Connectivity' 错误: DNS resolution failed，Que…
> 来源: ado-wiki

**根因分析**: DNS 服务器未配置 DNS 转发 (DNS Forwarder)，导致无法解析外部域名

1. 在 DC/DNS 服务器上配置 DNS 转发 (DNS Forwarder)，添加正确的上游 DNS 服务器地址，使 DNS 服务器能转发无法本地解析的查询.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 6: Azure Local 部署失败，步骤 'Download content for deployment' 报错 'Either the target nam…
> 来源: ado-wiki

**根因分析**: 部署时提供了错误的 deployment username（如用户名与 AD 中预创建的用户不匹配）

1. 更新 deployment username 为正确值（通过 New-HciAdObjectsPreCreation 预创建的部署用户）。示例命令: New-HciAdObjectsPreCreation -AzureStackLCMUserCredential $credential -AsHciOUName 'OU=.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 7: Azure Local 部署失败，'Join servers to a domain' 步骤报错 'Type AddAsZHostToDomain of Ro…
> 来源: ado-wiki

**根因分析**: 主 DNS 服务器 IP 配置错误，指向了非 DC/DNS 的 IP 地址（如外部 DNS），导致无法解析 AD 域名。且系统在首选 DNS 失败后不会尝试备用 DNS

1. 将 DC/DNS 服务器 IP 设置为第一个 DNS 条目（首选 DNS），然后 Resume 部署即可修复.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 8: Azure Local 部署失败，'Azure Stack HCI Network' 验证报错 'Type ValidateNetwork of Role E…
> 来源: ado-wiki

**根因分析**: 存储网络适配器之间无法通信，VLAN 配置问题导致 Storage1/Storage2 适配器 ping mesh 失败。适配器显示 APIPA 地址 (169.254.x.x) 表明未正确获得 VLAN 内的 IP

1. 1) 检查 C:\MASLogs 下的 answer file 获取网络配置; 2) 运行 Invoke-AzStackHciNetworkValidation -DeployAnswerFile $answerFilePath -PSSession $allServerSessions 进行网络验证; 3) 检查存储适配器 VLAN ID 配置是否正确（如 Storage1=711, Storage2=712）; 4) 确保物理网络交换机端口正确配置了对应 VLAN.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 9: Resource providers not registered in Winfield subscription, causing failures wh…
> 来源: ado-wiki

**根因分析**: Required resource providers (RPs) are in 'NotRegistered' state in the Winfield subscription

1. List all providers and register unregistered ones: $providers = az provider list --query "[].
2. {Provider:namespace, RegistrationState:registrationState}" -o json | ConvertFrom-Json; foreach ($provider in $providers) { if ($provider.
3. RegistrationState -ne 'Registered') { az provider register --namespace $provider.
4. Provider } }.
5. Verify in Azure portal → Subscription → Settings → Resource providers.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 10: Resource providers not registered in Winfield subscription, causing issues with…
> 来源: ado-wiki

**根因分析**: Required Azure resource providers are not registered in the subscription used by Winfield, preventing resource operations from succeeding.

1. 1) Open Azure portal → Subscription → Settings → Resource providers to check registration status.
2. 2) Register all unregistered providers via CLI: az provider list --query "[].
3. {Provider:namespace, RegistrationState:registrationState}" -o json, then loop and register each with az provider register --namespace <provider>.
4. 3) Verify all providers show 'Registered' status in the portal.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

## 判断逻辑

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| Azure Local deployment fails during 'Azure Stack HCI Connec… | DNS forwarding is not configured on the DNS server. The loc… | Configure DNS forwarding on the DNS server (DC): Open DNS M… |
| Azure Local deployment fails during 'Download content for d… | An incorrect deployment username was provided during deploy… | Update the deployment username to match the pre-created AD … |
| Azure Local deployment fails during 'Join servers to a doma… | The primary DNS server configured on the node cannot resolv… | Set the DC/DNS IP address as the first (primary) DNS entry … |
| Azure Local deployment fails during 'Azure Stack HCI Networ… | Storage VLANs (e.g., 711, 712) are not properly configured … | 1) On TOR switches: configure storage switch ports as Trunk… |
| Azure Local 部署失败，报 'Azure Stack HCI Connectivity' 错误: DNS r… | DNS 服务器未配置 DNS 转发 (DNS Forwarder)，导致无法解析外部域名 | 在 DC/DNS 服务器上配置 DNS 转发 (DNS Forwarder)，添加正确的上游 DNS 服务器地址，使 … |
| Azure Local 部署失败，步骤 'Download content for deployment' 报错 'E… | 部署时提供了错误的 deployment username（如用户名与 AD 中预创建的用户不匹配） | 更新 deployment username 为正确值（通过 New-HciAdObjectsPreCreation … |
| Azure Local 部署失败，'Join servers to a domain' 步骤报错 'Type AddA… | 主 DNS 服务器 IP 配置错误，指向了非 DC/DNS 的 IP 地址（如外部 DNS），导致无法解析 AD 域名… | 将 DC/DNS 服务器 IP 设置为第一个 DNS 条目（首选 DNS），然后 Resume 部署即可修复 |
| Azure Local 部署失败，'Azure Stack HCI Network' 验证报错 'Type Valid… | 存储网络适配器之间无法通信，VLAN 配置问题导致 Storage1/Storage2 适配器 ping mesh 失… | 1) 检查 C:\MASLogs 下的 answer file 获取网络配置; 2) 运行 Invoke-AzStac… |
| Resource providers not registered in Winfield subscription,… | Required resource providers (RPs) are in 'NotRegistered' st… | List all providers and register unregistered ones: $provide… |
| Resource providers not registered in Winfield subscription,… | Required Azure resource providers are not registered in the… | 1) Open Azure portal → Subscription → Settings → Resource p… |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Azure Local deployment fails during 'Azure Stack HCI Connectivity' validation with error: 'DNS reso… | DNS forwarding is not configured on the DNS server. The local DC/DNS cannot resolve external domain… | Configure DNS forwarding on the DNS server (DC): Open DNS Manager -> right-click server -> Properti… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 | Azure Local deployment fails during 'Download content for deployment' step with error: 'Fail to ini… | An incorrect deployment username was provided during deployment setup. The username does not match … | Update the deployment username to match the pre-created AD user. Use New-HciAdObjectsPreCreation to… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 | Azure Local deployment fails during 'Join servers to a domain' with error: Type 'AddAsZHostToDomain… | The primary DNS server configured on the node cannot resolve the AD domain. A non-DC DNS IP is list… | Set the DC/DNS IP address as the first (primary) DNS entry on all cluster nodes. For example, if DC… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 | Azure Local deployment fails during 'Azure Stack HCI Network' validation: Type 'ValidateNetwork' of… | Storage VLANs (e.g., 711, 712) are not properly configured on TOR switch ports. Switch ports may be… | 1) On TOR switches: configure storage switch ports as Trunk mode with VLANs in allowed list on BOTH… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 | Azure Local 部署失败，报 'Azure Stack HCI Connectivity' 错误: DNS resolution failed，Queried dns server for … | DNS 服务器未配置 DNS 转发 (DNS Forwarder)，导致无法解析外部域名 | 在 DC/DNS 服务器上配置 DNS 转发 (DNS Forwarder)，添加正确的上游 DNS 服务器地址，使 DNS 服务器能转发无法本地解析的查询 | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 | Azure Local 部署失败，步骤 'Download content for deployment' 报错 'Either the target name is incorrect or th… | 部署时提供了错误的 deployment username（如用户名与 AD 中预创建的用户不匹配） | 更新 deployment username 为正确值（通过 New-HciAdObjectsPreCreation 预创建的部署用户）。示例命令: New-HciAdObjectsPreCreat… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 | Azure Local 部署失败，'Join servers to a domain' 步骤报错 'Type AddAsZHostToDomain of Role BareMetal raised … | 主 DNS 服务器 IP 配置错误，指向了非 DC/DNS 的 IP 地址（如外部 DNS），导致无法解析 AD 域名。且系统在首选 DNS 失败后不会尝试备用 DNS | 将 DC/DNS 服务器 IP 设置为第一个 DNS 条目（首选 DNS），然后 Resume 部署即可修复 | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 8 | Azure Local 部署失败，'Azure Stack HCI Network' 验证报错 'Type ValidateNetwork of Role EnvironmentValidator … | 存储网络适配器之间无法通信，VLAN 配置问题导致 Storage1/Storage2 适配器 ping mesh 失败。适配器显示 APIPA 地址 (169.254.x.x) 表明未正确获得 V… | 1) 检查 C:\MASLogs 下的 answer file 获取网络配置; 2) 运行 Invoke-AzStackHciNetworkValidation -DeployAnswerFile … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 9 | Resource providers not registered in Winfield subscription, causing failures when performing operat… | Required resource providers (RPs) are in 'NotRegistered' state in the Winfield subscription | List all providers and register unregistered ones: $providers = az provider list --query "[].{Provi… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 10 | Resource providers not registered in Winfield subscription, causing issues with portal functionalit… | Required Azure resource providers are not registered in the subscription used by Winfield, preventi… | 1) Open Azure portal → Subscription → Settings → Resource providers to check registration status. 2… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
