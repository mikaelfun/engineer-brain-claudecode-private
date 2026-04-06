# ACR 网络防火墙与 MCR 代理 — 综合排查指南

**条目数**: 8 | **草稿融合数**: 1 | **Kusto 查询融合**: 0
**来源草稿**: [onenote-acr-proxy-troubleshooting.md]
**Kusto 引用**: 无
**生成日期**: 2026-04-05

---

## 排查流程

### Phase 1: 确认网络拓扑与失败模式
> 来源: ADO Wiki + OneNote 交叉

1. 确认客户场景：
   - **ACR 防火墙**：ACR 自身 vNET 防火墙 / IP 限制
   - **客户端防火墙**：客户侧企业防火墙 / 安全设备（Zscaler 等）
   - **MCR 拉取**：从 Microsoft Container Registry 拉取微软官方镜像
   - **Mooncake 代理**：Azure China 特有的 MCR 代理服务器问题

**判断逻辑**：
| 错误信息 | 含义 | 后续动作 |
|---------|------|---------|
| `client with IP x.x.x.x is not allowed access` (403 DENIED) | ACR IP 防火墙拦截 | → Phase 2a |
| `timeout` / `connection refused`（docker pull ACR） | 客户端防火墙阻断或 data proxy 未放通 | → Phase 2b |
| `timeout` / `blocked`（MCR pull） | MCR endpoint 被防火墙阻断 | → Phase 2c |
| 慢/失败（mcr.microsoft.com in Mooncake） | Mooncake MCR 代理问题 | → Phase 3 |
| AKS 403 + Service Endpoint 冲突 | Service Endpoint 导致 IP 路径变化 | → Phase 2d |
| 跨订阅 VNET 规则消失 | RP 未注册 | → Phase 2e |

`[结论: 🟢 8.5/10 — 多源交叉，覆盖全场景]`

---

### Phase 2a: ACR IP 防火墙阻断客户端 IP
> 来源: MS Learn + ADO Wiki 交叉

客户端 IP 不在 ACR 防火墙允许列表中。

**排查步骤**：
1. Portal → ACR → Networking → Public access tab 查看当前防火墙配置
2. 添加客户端 IP 到 ACR 防火墙规则

**特殊场景 — `az acr build` 被防火墙阻断**：

ACR build 服务使用 `AzureContainerRegistry` service tag 的 IP 范围，这些 IP 需要加入 ACR 防火墙允许列表。已知问题: [GitHub #627](https://github.com/Azure/acr/issues/627)

```powershell
# 获取区域 service tag IP 范围
$serviceTags = Get-AzNetworkServiceTag -Location $region
($serviceTags.Values | Where-Object {$_.Name -eq "AzureContainerRegistry.$region"}).properties.AddressPrefixes
```

将获取到的 IP 范围添加到 ACR 防火墙允许列表。

`[结论: 🟢 8.5/10 — OneNote(Mooncake 验证) + MS Learn 交叉]`

---

### Phase 2b: 客户端防火墙阻断 ACR 数据通道
> 来源: ADO Wiki (多条目交叉)

当 ACR 启用 vNET 防火墙时，docker pull 流量经过区域数据代理（data proxy），需放通以下端点：

| 端点 | 用途 | 必须 |
|------|------|------|
| `<registry>.azurecr.io` | REST endpoint（认证+元数据） | ✅ |
| `<registry>.<region>.data.azurecr.io` | 专用数据端点（镜像层下载） | ✅ 推荐 |
| `<region>-acr-dp.azurecr.io` | 数据代理（备选） | 可选 |
| `*.blob.core.windows.net` | Blob 存储（如不用专用数据端点） | 视场景 |

**地理复制注意**：每个复制区域都有独立的 data proxy/data endpoint，**所有**复制区域的端点都必须放通。

**AKS + attach-acr 场景**：即使 `az aks update --attach-acr` 配置了集成，kubelet 节点仍需要直接网络访问 ACR 端点。

参考: [ACR 防火墙访问规则](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-firewall-access-rules)

`[结论: 🟢 9/10 — ADO Wiki 多条目(acr-020, acr-073)交叉验证]`

---

### Phase 2c: MCR 端点防火墙配置
> 来源: ADO Wiki

从 Microsoft Container Registry 拉取 microsoft/* 镜像需放通：

| 端点 | 用途 |
|------|------|
| `mcr.microsoft.com` | REST endpoint（内容发现） |
| `*.data.mcr.microsoft.com` | Data endpoint（内容分发，替代 2020.3 前的 *.cdn.mscr.io） |

⚠️ 移除旧版 `*.cdn.mscr.io` 规则。

参考: [MCR Client Firewall Rules](https://github.com/microsoft/containerregistry/blob/master/client-firewall-rules.md)

`[结论: 🟢 8.5/10 — ADO Wiki 实证]`

---

### Phase 2d: Service Endpoint 与 IP 防火墙冲突
> 来源: ADO Wiki

AKS subnet 上的 `Microsoft.ContainerRegistry` Service Endpoint 会强制 ACR 流量走 Azure backbone（使用 AKS 节点私有 IP），而 ACR selected-networks 防火墙只允许公有 LB IP。

**症状**：
- AKS LB IP 已加入 ACR 防火墙允许列表
- AcrPull 角色已分配
- 但 Kusto 日志显示 ACR 收到的请求来自 AKS 私有 IP（非公有 LB IP）

**解决方案**：从 AKS subnet 移除 `Microsoft.ContainerRegistry` Service Endpoint。

`[结论: 🟢 9/10 — ADO Wiki 实证，根因明确]`

---

### Phase 2e: 跨订阅 VNET 规则失效
> 来源: ADO Wiki

添加其他订阅的 VNET/Subnet 到 ACR 防火墙后，规则在页面刷新后消失（无错误提示）。

**根因**：第二个订阅未注册 `Microsoft.ContainerRegistry` Resource Provider。

**解决方案**：
```bash
az login
az account set -s <second-subscription-id>
az provider register --namespace Microsoft.ContainerRegistry
```

注册完成后重新添加 VNET/Subnet 规则。

`[结论: 🟢 8.5/10 — ADO Wiki 实证]`

---

### Phase 3: Mooncake MCR 代理服务器问题
> 来源: OneNote (MCVKB — onenote-acr-proxy-troubleshooting.md)

⚠️ **21V Mooncake 特有场景**

#### 架构

```
Public Registries → WUS2 Global Proxies → Mooncake Proxies (per region) → AKS Cluster
```

- 代理服务器**按区域**部署（China East 2, China North 2）
- 负载均衡，但会话缓存意味着同一 AKS 集群连接同一代理
- **IP 限制**：仅 Azure China IP 可访问代理

#### 代理服务器清单

| 区域 | 代理 VM |
|------|---------|
| China East 2 | east2mirror, east2mirror2, east2mirror3, east2mirror4, east2mirror5 |
| China North 2 | north2mirror, north2mirror2, north2mirror3 |
| West US 2 (Global) | chinamirror, chinamirror-secondary, chinamirror3 |

资源组: `aks-mirror` (Mooncake), `chinamirror` (Global)

#### 排查步骤

**Step 1: 检查高流量**
- 查看 Zabbix 告警："too many active nginx connections"
  - PROBLEM 邮件 = 触发，OK 邮件 = 恢复
  - 命名映射: `east2cr` = east2mirror, `east2cr2` = east2mirror2
- 检查代理 VM 的 Network Out 是否持续超过 **1GB**（使用 Jarvis dashboard）

**Step 2: 检查 Mooncake 代理 CPU**
- CPU 利用率是否持续超过 **50%**
- 使用 Jarvis dashboard 检查 AKS worker node 所在区域的代理

**Step 3: 检查 Global 代理 CPU**
- 如果 Step 1 & 2 无发现，检查 West US 2 代理 CPU
- 使用 Global ASC 链接监控

#### 升级路径

排查无果且客户需要紧急解决：
- 提交 **Sev.2 ICM** 给 PG
- ICM 中包含调查发现（CPU 指标、流量数据）

`[结论: 🟢 9/10 — OneNote 团队知识，Mooncake 专属，实战验证]`

---

### Phase 4: MCR IP 白名单
> 来源: OneNote

AKS 节点因安全设备（如 Zscaler）失去 MCR 代理访问。

**解决方案**：
1. 获取客户的出站 IP 范围
2. 联系 AKS PG（Andy Zhang）将客户 IP 加入 MCR 代理白名单
3. 流程简单——发邮件附 IP 范围即可

联系: akscn@microsoft.com
参考: https://mirror.azure.cn/help/en/docker-registry-proxy-cache.html

`[结论: 🟢 9/10 — OneNote 团队知识，Mooncake 专属，含联系方式]`

---

### Phase 5: Web App 出站 IP 被 ACR 防火墙阻断
> 来源: MS Learn

Web App 拉取 ACR 镜像被防火墙拒绝。

**解决方案**：
- **方案 1**：添加 Web App 所有出站 IP 到 ACR 防火墙（Web App Overview → Outbound IP addresses → Show More）
- **方案 2**：配置 Web App VNet 集成 + ACR Private Endpoint
  - 启用 Deployment Center 的 "Pull image over VNet"
  - VNet 配置中启用 "Container image pull"
  - ⚠️ 公网禁用时 Portal ACR Tags 下拉可能显示 Failed to load — 手动输入镜像和标签

`[结论: 🔵 5.5/10 — MS Learn 单源文档]`

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | `az acr build` 被防火墙阻断（IP not allowed） | ACR build 服务 IP 不在允许列表 | 获取 AzureContainerRegistry service tag IP 加入防火墙 | 🟢 9 — OneNote 实证 Mooncake | [MCVKB/.../ACR/[ACR] Az acr build request blocked.md](../../) |
| 2 📋 | Mooncake 代理拉取失败或性能差 | 代理 VM 高 CPU/高流量/首次拉取 | 见排查流程 Phase 3 | 🟢 9 — OneNote 团队知识 | [MCVKB/.../AKS/troubleshooting guide for container reg.md](../../) |
| 3 | AKS 安全设备（Zscaler）阻断 MCR 代理 | 出站 IP 未加入 MCR 代理白名单 | 联系 AKS PG 白名单客户 IP | 🟢 9 — OneNote Mooncake | [MCVKB/.../AKS/How to whitelist IP ranges on MCR proxy.md](../../) |
| 4 | docker pull ACR 超时（vNET 防火墙启用） | data proxy/data endpoint 未放通 | 放通 ACR REST + data endpoint + 地理复制端点 | 🟢 9 — ADO Wiki 多源交叉 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Behind%20Firewall) |
| 5 | MCR 拉取超时（mcr.microsoft.com） | 客户防火墙未放通 MCR 端点 | 放通 mcr.microsoft.com + *.data.mcr.microsoft.com | 🟢 8.5 — ADO Wiki 实证 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FMicrosoft%20Container%20Registry%20(MCR)%20Client%20Firewall%20Rules%20Configuration) |
| 6 | 跨订阅 VNET 规则添加后消失 | 目标订阅未注册 Microsoft.ContainerRegistry RP | 注册 RP: `az provider register --namespace Microsoft.ContainerRegistry` | 🟢 8.5 — ADO Wiki 实证 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACR/TSG/ACR%20Virtual%20Network%20%26%20Firewall%20Configuration%20Cross%20Subscription) |
| 7 | AKS 403 + Service Endpoint 冲突 | Service Endpoint 导致流量走私有 IP 而非公有 LB IP | 移除 AKS subnet 的 Microsoft.ContainerRegistry Service Endpoint | 🟢 9 — ADO Wiki 实证 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20imagepull%20forbidden%20serviceendpoint) |
| 8 | ACR 403 DENIED（客户端 IP 不在允许列表） | ACR 防火墙 IP 限制 | 添加客户端 IP 或使用 Private Link | 🔵 7 — MS Learn + ADO Wiki 交叉 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/acr-authentication-errors) |
