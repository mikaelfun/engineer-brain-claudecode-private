# ACR 私有链路与专用终结点 — 综合排查指南

**条目数**: 10 | **草稿融合数**: 2 | **Kusto 查询融合**: 0
**来源草稿**: [ado-wiki-acr-private-link.md], [ado-wiki-acr-private-link-troubleshooting-questions.md]
**Kusto 引用**: 无
**生成日期**: 2026-04-05

---

## 排查流程

### Phase 1: 信息收集与初步诊断
> 来源: ADO Wiki (ado-wiki-acr-private-link-troubleshooting-questions.md)

**客户环境确认清单**：

| # | 检查项 | 命令 | 注意事项 |
|---|--------|------|---------|
| 1 | Service Endpoint 是否启用？ | `az acr network-rule list -n <ACR> --query virtualNetworkRules` | Service Endpoint 和 Private Endpoint **不兼容**，必须禁用 |
| 2 | 防火墙规则是否启用？ | `az acr network-rule list -n <ACR> --query ipRules` | 可能阻断 PE 流量 |
| 3 | 公网访问是否禁用？ | `az acr show -n <ACR> --query publicNetworkAccess` | 禁用时 VNet 外客户端无法访问 |
| 4 | 受信任服务是否启用？ | `az acr show -n <ACR> --query networkRuleBypassOptions` | 应为 "AzureServices"，否则 Defender 等无法访问 |
| 5 | 地理复制 DNS 配置？ | 检查每个复制区域的 CNAME | 每个复制区域的 data endpoint 都需在 Private DNS Zone 中配置 |
| 6 | Private Endpoint 用量？ | `az acr show-usage -n <ACR>` | 默认上限 200（Premier SKU），2021.10 前创建的注册表上限 10 |
| 7 | 客户端类型？ | 询问客户 | VM / AKS / App Service / On-premises |
| 8 | 是否有代理/防火墙？ | 询问客户 | 代理可能剥离请求头导致授权失败 |
| 9 | 是否在 CorpNet（MSFTVPN）？ | 询问客户 | CorpNet 可能影响 Private Endpoint 功能 |

`[结论: 🟢 8.5/10 — ADO Wiki TSG 标准诊断清单]`

---

### Phase 2: DNS 解析诊断
> 来源: ADO Wiki (ado-wiki-acr-private-link.md) + MS Learn 交叉

**核心验证**：
```bash
nslookup <registryname>.azurecr.io
```

**判断逻辑**：
| 结果 | 含义 | 后续动作 |
|------|------|---------|
| 解析到私有 IP（10.x.x.x） | DNS 正常 | → Phase 3（网络连通性） |
| CNAME 含 `privatelink.azurecr.io` 但解析到公有 IP | DNS Zone 配置问题 | → Phase 2a |
| 无 `privatelink` CNAME | Private Endpoint 未正确配置 | 检查 PE 配置 |

#### Phase 2a: FQDN 解析到公有 IP

三种常见根因，按顺序排查：

**根因 1: Private DNS Zone 缺少 VNet Link**

设备所在 VNet 未链接到 `privatelink.azurecr.io` Private DNS Zone。

```bash
# 添加 VNet Link
az network private-dns link vnet create \
  --resource-group <dns-zone-rg> \
  --zone-name privatelink.azurecr.io \
  --name <link-name> \
  --virtual-network <vnet-id> \
  --registration-enabled false
```

`[结论: 🟢 8/10 — MS Learn + ADO Wiki 交叉验证]`

**根因 2: 自定义 DNS 未配置 Azure DNS 转发器**

自定义 DNS 服务器需要配置 server-level forwarder 到 Azure DNS（`168.63.129.16`），否则无法解析 `privatelink.azurecr.io` 的 A 记录。

配置步骤取决于 DNS 平台（Windows Server DNS / CoreDNS 等）。

`[结论: 🔵 5.5/10 — MS Learn 单源文档]`

**根因 3: 自定义 DNS 有转发器但 DNS 服务器 VNet 未链接**

即使自定义 DNS 配置了 Azure DNS 转发器，如果 DNS 服务器所在 VNet 未链接到 Private DNS Zone，Azure DNS 也找不到私有 A 记录。

**解决方案**：在 Private DNS Zone 中为 DNS 服务器所在 VNet 添加 VNet Link。

`[结论: 🔵 5.5/10 — MS Learn 单源文档]`

**DNS 缓存问题**：
- Linux: `sudo systemd-resolve --flush-caches`
- Windows: `ipconfig /flushdns`

**自助诊断**：
```bash
az acr check-health -n <ACR> --vnet <VNet Name or Resource ID>
```

---

### Phase 3: 网络连通性诊断
> 来源: ADO Wiki 多条目交叉

当 DNS 解析正确（返回私有 IP）但仍无法连接时：

#### 场景 1: No Route to Host（PE 连接断开）

Private Endpoint 连接状态为 **Disconnected**（被私有链路资源所有者移除）。

**排查步骤**：
1. 检查 NIC Effective Routes 中私有终结点 IP 的路由
2. Portal → ACR → Networking → Private endpoint connections 验证连接状态
3. 如果 Disconnected → **重建 Private Endpoint**
4. 路由问题持续 → 联系网络团队

`[结论: 🟢 8.5/10 — ADO Wiki 实证]`

#### 场景 2: Virtual WAN Hub 架构中 403/401

在 Virtual WAN Hub 架构中，Azure Firewall 作为代理拦截 HTTPS 流量，自行做 DNS 解析。由于 Private DNS Zone 无法链接到 Virtual Hub，Firewall 将 ACR FQDN 解析到公有 IP。

**解决方案**：在源 VM 所在 VNet 中直接创建 ACR 的新 Private Endpoint（绕过 Virtual Hub Azure Firewall），并更新 Private DNS Zone 指向新的 PE。

`[结论: 🟢 9/10 — ADO Wiki 实证，架构特定场景]`

#### 场景 3: AKS HTTP Proxy + Private Endpoint 冲突

AKS 配置 HTTP 代理时，代理拦截了 ACR 认证请求（OAuth2 Token 交换），即使 DNS 和网络连通正常，认证仍失败。

**解决方案**：将 ACR Private Endpoint FQDN 加入代理的 noProxy/bypass 列表：
1. `<registry>.azurecr.io`
2. `<registry>.<region>.data.azurecr.io`

验证: 在 AKS 节点内 `nslookup` 确认解析到私有 IP。

参考: [AKS HTTP Proxy 配置](https://learn.microsoft.com/en-us/azure/aks/http-proxy)

`[结论: 🟢 9/10 — ADO Wiki 实证，AKS+ACR 交叉场景]`

---

### Phase 4: Private Endpoint 限额与生命周期
> 来源: ADO Wiki

#### 超过 200 PE 限额

默认 Private Endpoint 上限为 200（Premier SKU）。

**限额提升流程**：
1. 确认限制条件：
   - 提升后不可变更 geo-replication 配置
   - 每个 region 每个 subscription 注册表数 < 10
   - 必须 Premier SKU
   - 新上限范围: 201-1000
2. 验证当前用量: `az acr show-usage --name <registry>`
3. 通过 Kusto `RegistryMasterData` 验证注册表数量
4. 通过 ASC 创建 Sev3 ICM 给 ACR PG

`[结论: 🟢 8.5/10 — ADO Wiki 实证，含完整流程]`

#### 删除含 PE 的 ACR

ACR 删除前必须先移除所有 Private Endpoint 连接：
```bash
az acr private-endpoint-connection delete -r <registry> -n <pe-connection-name>
```

`[结论: 🔵 5.5/10 — MS Learn 单源]`

---

### Phase 5: Service Endpoint 冲突
> 来源: ADO Wiki (ado-wiki-acr-private-link-troubleshooting-questions.md)

⚠️ **Service Endpoint 和 Private Endpoint 不兼容**。

如果 AKS subnet 上同时存在 `Microsoft.ContainerRegistry` Service Endpoint 和 ACR Private Endpoint，Service Endpoint 会强制流量走 Azure backbone（使用私有 IP），这与 ACR selected-networks 防火墙（仅允许公有 LB IP）冲突。

**排查方法**：Kusto 日志中看到 ACR 被 AKS 私有 IP 而非公有 LB IP 访问。

**解决方案**：从 AKS subnet 移除 `Microsoft.ContainerRegistry` Service Endpoint。

`[结论: 🟢 9/10 — ADO Wiki 实证，多条目(acr-066, ado-wiki-troubleshooting-questions)交叉验证]`

---

## Private Link 配置参考
> 来源: ADO Wiki (ado-wiki-acr-private-link.md)

### 配置步骤

1. 禁用 subnet 上的 `private-endpoint-network-policy`
2. 创建 Private DNS Zone: `privatelink.azurecr.io`
3. 创建 DNS Zone 与客户端 VNet 的关联（VNet Link）
4. 创建 Private Registry Endpoint（在 subnet 上分配 2 个 IP 给 NIC）
5. 更新 DNS Zone 的 A 记录指向私有 IP

### DNS 场景参考

| 场景 | 参考文档 |
|------|---------|
| VNet 内 Private DNS 解析 | [GitHub - DNS Integration](https://github.com/dmauser/PrivateLink/tree/master/DNS-Integration-Scenarios#31) |
| VNet 间 Private DNS 解析 | [GitHub - DNS Integration](https://github.com/dmauser/PrivateLink/tree/master/DNS-Integration-Scenarios#32) |
| VNet 内自定义 DNS | [GitHub - DNS Integration](https://github.com/dmauser/PrivateLink/tree/master/DNS-Integration-Scenarios#33) |
| On-Premises DNS 集成 | [GitHub - DNS Integration](https://github.com/dmauser/PrivateLink/tree/master/DNS-Integration-Scenarios#4) |

### 参考文档

- [ACR Private Link 配置](https://docs.microsoft.com/en-us/azure/container-registry/container-registry-private-link)
- [Azure Private Endpoint DNS 配置](https://docs.microsoft.com/en-us/azure/private-link/private-endpoint-dns)
- [Private Link FAQ](https://docs.microsoft.com/en-us/azure/private-link/private-link-faq)

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Private Link 配置/DNS 故障排查 | 多种配置问题 | 见排查流程 Phase 1-5 | 🟢 8.5 — ADO Wiki TSG | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Private%20Link) |
| 2 | 镜像拉取 no route to host（PE 启用） | PE 连接 Disconnected | 检查 NIC Effective Routes + PE 状态，重建 PE | 🟢 8.5 — ADO Wiki 实证 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20FailedPullImage%20NoRouteToHost%20PE) |
| 3 | PE 数量超过 200 需提升限额 | 默认上限 200（Premier SKU） | 通过 ASC 创建 Sev3 ICM 给 ACR PG | 🟢 8.5 — ADO Wiki 实证 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Increase%20private%20endpoint%20limit) |
| 4 | Virtual WAN Hub 中 403 CONNECTIVITY_REFRESH_TOKEN_ERROR | Azure Firewall 代理 DNS 解析到公有 IP | 在源 VM VNet 新建 PE 绕过 Virtual Hub Firewall | 🟢 9 — ADO Wiki 实证 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACR/TSG/ACR%20Unauthorized%20Access%20Errors%20with%20Virtual%20WAN%20Hub) |
| 5 📋 | Private Link 诊断清单（Service Endpoint/防火墙/公网/信任服务/DNS/客户端） | 多种配置问题 | 见排查流程 Phase 1 信息收集清单 | 🟢 8.5 — ADO Wiki TSG | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20private%20link%20troubleshooting%20questions) |
| 6 | AKS HTTP Proxy + Private ACR 认证失败 403/401 | 代理拦截 OAuth2 Token 交换 | ACR FQDN 加入 noProxy 列表 | 🟢 9 — ADO Wiki 实证 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure+Kubernetes+Service+Wiki%2FAKS%2FTSG%2FNetworking%2FOutbound+Connectivity%2FUnable+to+connect+to+private+ACR+via+proxy) |
| 7 | FQDN 解析到公有 IP（VNet 未链接 DNS Zone） | Private DNS Zone 缺少目标 VNet 的 VNet Link | 添加 VNet Link | 🔵 7 — MS Learn + ADO Wiki 交叉 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/cant-resolve-container-registry-fqdn-private-ip-address) |
| 8 | FQDN 解析到公有 IP（自定义 DNS 无转发器） | 自定义 DNS 未配置 168.63.129.16 转发器 | 配置 Azure DNS 转发器 | 🔵 5.5 — MS Learn 单源 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/cant-resolve-container-registry-fqdn-private-ip-address) |
| 9 | FQDN 解析到公有 IP（DNS 服务器 VNet 未链接） | DNS 服务器 VNet 未链接 Private DNS Zone | 为 DNS 服务器 VNet 添加 VNet Link | 🔵 5.5 — MS Learn 单源 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/cant-resolve-container-registry-fqdn-private-ip-address) |
| 10 | 无法删除含 PE 的 ACR | PE 连接存在时阻止删除 | 先删除所有 PE 连接再删 ACR | 🔵 5.5 — MS Learn 单源 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/delete-operation-issues) |
