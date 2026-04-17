# ACR Private Endpoint 与 DNS 解析 — 排查工作流

**来源草稿**: ado-wiki-a-acr-private-link-troubleshooting-questions.md, ado-wiki-acr-private-link.md, onenote-acr-proxy-troubleshooting.md
**Kusto 引用**: registry-info.md
**场景数**: 5
**生成日期**: 2026-04-07

---

## Scenario 1: Private Endpoint DNS 解析失败
> 来源: ado-wiki-a-acr-private-link-troubleshooting-questions.md | 适用: Mooncake ✅

### 排查步骤

1. **运行 health-check 验证 DNS**
   ```bash
   az acr check-health -n <Registry Name> --vnet <VNet Name or Resource ID>
   ```

2. **验证 DNS 解析到 Private IP**
   ```bash
   nslookup <registryname>.azurecr.io
   # 或 Mooncake:
   nslookup <registryname>.azurecr.cn
   ```
   - 如果解析到公网 IP → DNS 配置问题
   - 如果解析到私有 IP → Private Endpoint 工作正常

3. **刷新 DNS 缓存**
   - Linux: `sudo systemd-resolve --flush-caches`
   - Windows: `ipconfig /flushdns`

4. **检查 Private DNS Zone 配置**
   - 确认 `privatelink.azurecr.io`（或 `privatelink.azurecr.cn`）Private DNS Zone 存在
   - 确认 VNet Link 已关联到客户端所在 VNet
   - 确认 A 记录指向正确的 Private IP

5. **Kusto 检查注册表网络配置**
   ```kql
   cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryMasterData
   | where env_time > ago(1d)
   | where LoginServerName == "{registry}.azurecr.cn"
   | project RegistryName, PublicNetworkAccessDisabled, PrivateLinkEndpointEnabled, 
            DataEndpointEnabled, FirewallRulesEnabled, PrivateLinksVersion
   | take 1
   ```

---

## Scenario 2: Private Endpoint 前置检查清单
> 来源: ado-wiki-a-acr-private-link-troubleshooting-questions.md | 适用: Mooncake ✅

### 排查步骤（向客户收集信息）

1. **Service Endpoint 与 Private Endpoint 冲突检查**
   ```bash
   az acr network-rule list -n <Registry Name> --query virtualNetworkRules
   ```
   > Service Endpoint 和 Private Endpoint 不兼容，必须禁用 Service Endpoint

2. **防火墙规则检查**
   ```bash
   az acr network-rule list -n <Registry Name> --query ipRules
   ```
   > 客户端防火墙可能导致 Private Endpoint 场景下 pull 失败

3. **公网访问状态检查**
   ```bash
   az acr show -n <Registry Name> --query publicNetworkAccess
   ```
   > 如果 Disabled，客户端必须在 Private Link VNet 内

4. **Trusted Services 检查**
   ```bash
   az acr show -n <Registry Name> --query networkRuleBypassOptions
   ```
   > 应为 "AzureServices"，否则 Azure Security Center 等服务无法访问

5. **Geo-Replication DNS 检查**
   > 每个 geo-replication endpoint 都需要在 Private DNS Zone 中添加 CNAME

6. **Private Endpoint 数量限制检查**
   ```bash
   az acr show-usage -n <Registry Name>
   ```
   > 2021.10 后新建注册表上限 200；旧注册表上限 10（需 TA 迁移到 V2）

---

## Scenario 3: 客户端配置问题导致 Private Endpoint 失败
> 来源: ado-wiki-a-acr-private-link-troubleshooting-questions.md | 适用: Mooncake ✅

### 排查步骤

1. **确认客户端类型**（VM / AKS / App Service 等）

2. **客户端防火墙/代理检查**
   - 代理可能剥离请求头 → 导致授权失败
   - 需要在代理中配置 Private Endpoint 路由

3. **Azure Firewall 检查**
   - 需要配置规则允许 Private Endpoint 路由

4. **CorpNet/VPN 干扰**
   - 微软 CorpNet 可能影响 Private Endpoint 功能（即使公网访问未禁用）

5. **交叉验证**
   - 从同 VNet 内另一台 VM 测试访问
   - 使用 `curl -v https://<registry>.azurecr.io/v2/` 查看连接详情

---

## Scenario 4: Private Link 设置步骤
> 来源: ado-wiki-acr-private-link.md | 适用: Mooncake ✅

### 设置步骤

1. 禁用子网上的 `private-endpoint-network-policy`
2. 创建 Private DNS Zone: `privatelink.azurecr.io`（Mooncake: `privatelink.azurecr.cn`）
3. 将 Private DNS Zone 关联到客户端所在 VNet
4. 创建 Private Endpoint（会从子网分配 2 个 Private IP 给 NIC）
5. 在 DNS Zone 中创建 A 记录指向 Private IP

### 验证
```bash
nslookup <registryname>.azurecr.io
# 应解析到 Private IP
```

---

## Scenario 5: Mooncake Proxy Server 问题 (非 Private Endpoint)
> 来源: onenote-acr-proxy-troubleshooting.md | 适用: Mooncake ✅ / Global-only ❌

### 架构
```
Public Registries → WUS2 Proxies → Mooncake Proxies (per region) → AKS Cluster
```

### 排查步骤

1. **确认是否首次 Pull**
   - 首次 Pull 需要回源到 Global proxy → 速度较慢
   - 后续 Pull 会使用缓存

2. **检查 Proxy 高流量**
   - Zabbix 告警: "too many active nginx connections"
   - Network Out > 1GB → 流量过高

3. **检查 Mooncake Proxy CPU**
   - CPU > 50% → 性能瓶颈
   - 使用 Jarvis Dashboard 查看对应 Region 的 proxy

4. **检查 Global Proxy CPU**
   - WUS2 proxy server CPU 利用率

5. **升级**
   - 如果持续失败 → 提交 Sev.2 ICM 到 PG
   - 包含 CPU / 流量数据

### Proxy 服务器清单

| Region | Proxy VMs |
|--------|-----------|
| China East 2 | east2mirror, east2mirror2~5 |
| China North 2 | north2mirror, north2mirror2~3 |
| West US 2 (Global) | chinamirror, chinamirror-secondary, chinamirror3 |
