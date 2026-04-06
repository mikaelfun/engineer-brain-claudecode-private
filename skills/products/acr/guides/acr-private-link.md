# ACR Private Link 与私有终结点 — 排查速查

**来源数**: 10 | **21V**: 全部适用
**最后更新**: 2026-04-05

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Private Link / Private Endpoint 配置指南：DNS 配置、跨 VNet、on-premises、自定义 DNS 场景 | （配置指南，非故障） | 见融合排查指南 — 完整 Private Link 配置与 DNS 方案 | 🔵 6 — ADO Wiki guide-draft | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Private%20Link) |
| 2 | ACR image pull 报错 `no route to host` — 私有终结点 IP 正确但不可达 | Private Endpoint 连接状态为 Disconnected（被资源方删除），路由表指向错误 | 1) 查 NIC Effective Routes 2) Portal → ACR → Networking → PE connections 检查状态 3) Disconnected → 重建 PE 4) 路由问题联系网络团队 | 🟢 8 — ADO Wiki+实证 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20FailedPullImage%20NoRouteToHost%20PE) |
| 3 | ACR 私有终结点数量达到 200 上限 | 默认限制 200 PE/registry（Premier SKU），设计限制 | 1) 沟通限制（增加后不能改 geo-replication；per region per sub <10 registries；Premier SKU） 2) Kusto 查 RegistryMasterData 3) ASC 提 Sev3 ICM 给 ACR PG 4) `az acr show-usage` 确认 | 🟢 8 — ADO Wiki | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Increase%20private%20endpoint%20limit) |
| 4 | Virtual WAN Hub 架构下 `az acr login` 报 403 CONNECTIVITY_REFRESH_TOKEN_ERROR — Firewall 将 ACR FQDN 解析为公网 IP | Virtual Hub Azure Firewall 作为 HTTPS proxy 拦截流量，Private DNS Zone 无法 link 到 Virtual Hub，导致 Firewall 解析到公网 IP | 在源 VM 所在 VNet 新建 ACR PE（绕过 Virtual Hub Firewall），更新 Private DNS Zone 指向新 PE | 🟢 8 — ADO Wiki+实证 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACR/TSG/ACR%20Unauthorized%20Access%20Errors%20with%20Virtual%20WAN%20Hub) |
| 5 📋 | ACR Private Link 综合诊断清单：service endpoint 冲突、firewall 规则、public network access、trusted services、geo-replication DNS、客户端配置 | （多种可能原因，综合诊断） | 见融合排查指南 — 完整 checklist | 🔵 6 — ADO Wiki guide-draft | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20private%20link%20troubleshooting%20questions) |
| 6 | AKS + HTTP Proxy 环境下 pull 私有 ACR 镜像报 403/401 — DNS 正确但认证失败 | HTTP Proxy 拦截 ACR OAuth2 token 交换请求，阻断或修改了认证流量 | 将 ACR PE FQDN 加入 proxy noProxy/bypass 列表：`<registry>.azurecr.io` + `<registry>.<region>.data.azurecr.io` | 🟢 8 — ADO Wiki | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure+Kubernetes+Service+Wiki%2FAKS%2FTSG%2FNetworking%2FOutbound+Connectivity%2FUnable+to+connect+to+private+ACR+via+proxy) |
| 7 | ACR FQDN 解析到公网 IP — 已配 Private Link 但 nslookup 返回公网 IP | PE NIC 所在 VNet 与查询设备所在 VNet 不同，Private DNS Zone 缺少对查询端 VNet 的 link | 在 ACR Private DNS Zone (`privatelink.azurecr.io`) 中为查询端 VNet 添加 virtual network link | 🔵 5.5 — MS Learn | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/cant-resolve-container-registry-fqdn-private-ip-address) |
| 8 | 自定义 DNS 服务器下 ACR FQDN 解析到公网 IP | 自定义 DNS 未配置 server-level forwarder 到 Azure DNS (168.63.129.16)，无法解析 privatelink A 记录 | 在自定义 DNS 服务器配置 server-level forwarder 到 `168.63.129.16`（步骤因 DNS 平台而异） | 🔵 5.5 — MS Learn | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/cant-resolve-container-registry-fqdn-private-ip-address) |
| 9 | 自定义 DNS 已配 forwarder 到 Azure DNS 但仍解析到公网 IP | 自定义 DNS 所在 VNet 未 link 到 ACR Private DNS Zone，Azure DNS 找不到私有 A 记录 | 在 ACR Private DNS Zone 中为自定义 DNS 服务器所在 VNet 添加 virtual network link | 🔵 5.5 — MS Learn | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/cant-resolve-container-registry-fqdn-private-ip-address) |
| 10 | 无法删除有 Private Endpoint 的 ACR | 存在关联 PE 连接时 ACR 删除被阻止 | 先删除所有 PE 连接：Portal 或 `az acr private-endpoint-connection delete`，再删 ACR | 🔵 5.5 — MS Learn | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/delete-operation-issues) |

## 快速排查路径

1. **DNS 解析验证** → `nslookup <registry>.azurecr.io` / `nslookup <registry>.azurecr.cn` — 是否解析到私有 IP？ `[来源: MS Learn + ADO Wiki]`
2. **Private DNS Zone 检查** → Zone 是否存在 + 是否 link 到正确 VNet `[来源: MS Learn]`
3. **自定义 DNS** → 是否配了 forwarder 到 `168.63.129.16` + forwarder VNet 是否 link 到 Zone `[来源: MS Learn]`
4. **PE 连接状态** → Portal → ACR → Networking → PE connections 检查 Approved/Disconnected `[来源: ADO Wiki]`
5. **Proxy 环境** → ACR FQDN 是否在 noProxy 列表中 `[来源: ADO Wiki]`
6. **Virtual WAN** → Firewall 是否拦截了 ACR 流量 → 需在源 VNet 独立建 PE `[来源: ADO Wiki]`
7. **Service Endpoint 冲突** → 同一子网不能同时有 Service Endpoint 和 PE `[来源: ADO Wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/acr-private-link.md#排查流程)
