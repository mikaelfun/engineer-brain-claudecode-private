# ARM Azure Local 部署 — 排查速查

**来源数**: 10 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Azure Local deployment fails during 'Azure Stack HCI Connectivity' validation with error: 'DNS reso… | DNS forwarding is not configured on the DNS server. The local DC/DNS cannot resolve external domain… | Configure DNS forwarding on the DNS server (DC): Open DNS Manager -> right-click server -> Properti… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 📋 | Azure Local deployment fails during 'Download content for deployment' step with error: 'Fail to ini… | An incorrect deployment username was provided during deployment setup. The username does not match … | Update the deployment username to match the pre-created AD user. Use New-HciAdObjectsPreCreation to… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 📋 | Azure Local deployment fails during 'Join servers to a domain' with error: Type 'AddAsZHostToDomain… | The primary DNS server configured on the node cannot resolve the AD domain. A non-DC DNS IP is list… | Set the DC/DNS IP address as the first (primary) DNS entry on all cluster nodes. For example, if DC… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 📋 | Azure Local deployment fails during 'Azure Stack HCI Network' validation: Type 'ValidateNetwork' of… | Storage VLANs (e.g., 711, 712) are not properly configured on TOR switch ports. Switch ports may be… | 1) On TOR switches: configure storage switch ports as Trunk mode with VLANs in allowed list on BOTH… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 📋 | Azure Local 部署失败，报 'Azure Stack HCI Connectivity' 错误: DNS resolution failed，Queried dns server for … | DNS 服务器未配置 DNS 转发 (DNS Forwarder)，导致无法解析外部域名 | 在 DC/DNS 服务器上配置 DNS 转发 (DNS Forwarder)，添加正确的上游 DNS 服务器地址，使 DNS 服务器能转发无法本地解析的查询 | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 📋 | Azure Local 部署失败，步骤 'Download content for deployment' 报错 'Either the target name is incorrect or th… | 部署时提供了错误的 deployment username（如用户名与 AD 中预创建的用户不匹配） | 更新 deployment username 为正确值（通过 New-HciAdObjectsPreCreation 预创建的部署用户）。示例命令: New-HciAdObjectsPreCreat… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 📋 | Azure Local 部署失败，'Join servers to a domain' 步骤报错 'Type AddAsZHostToDomain of Role BareMetal raised … | 主 DNS 服务器 IP 配置错误，指向了非 DC/DNS 的 IP 地址（如外部 DNS），导致无法解析 AD 域名。且系统在首选 DNS 失败后不会尝试备用 DNS | 将 DC/DNS 服务器 IP 设置为第一个 DNS 条目（首选 DNS），然后 Resume 部署即可修复 | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 8 📋 | Azure Local 部署失败，'Azure Stack HCI Network' 验证报错 'Type ValidateNetwork of Role EnvironmentValidator … | 存储网络适配器之间无法通信，VLAN 配置问题导致 Storage1/Storage2 适配器 ping mesh 失败。适配器显示 APIPA 地址 (169.254.x.x) 表明未正确获得 V… | 1) 检查 C:\MASLogs 下的 answer file 获取网络配置; 2) 运行 Invoke-AzStackHciNetworkValidation -DeployAnswerFile … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 9 📋 | Resource providers not registered in Winfield subscription, causing failures when performing operat… | Required resource providers (RPs) are in 'NotRegistered' state in the Winfield subscription | List all providers and register unregistered ones: $providers = az provider list --query "[].{Provi… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 10 📋 | Resource providers not registered in Winfield subscription, causing issues with portal functionalit… | Required Azure resource providers are not registered in the subscription used by Winfield, preventi… | 1) Open Azure portal → Subscription → Settings → Resource providers to check registration status. 2… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |

## 快速排查路径
1. Configure DNS forwarding on the DNS server (DC): Open DNS Manager -> right-clic… `[来源: ado-wiki]`
2. Update the deployment username to match the pre-created AD user. Use New-HciAdO… `[来源: ado-wiki]`
3. Set the DC/DNS IP address as the first (primary) DNS entry on all cluster nodes… `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/azure-local-deployment.md#排查流程)
