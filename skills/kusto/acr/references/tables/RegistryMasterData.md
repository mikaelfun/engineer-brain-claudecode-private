---
name: RegistryMasterData
database: acrprodmc
cluster: https://acrmc2.chinaeast2.kusto.chinacloudapi.cn
description: ACR 注册表元数据和配置信息
status: active
---

# RegistryMasterData

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://acrmc2.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | acrprodmc |
| 状态 | ✅ 可用 |

## 用途

记录 ACR 注册表的元数据、配置和状态信息。用于获取注册表配置、SKU、网络设置、安全特性等。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| env_time | datetime | 记录时间 |
| SubscriptionId | string | 订阅 ID |
| ResourceGroup | string | 资源组 |
| RegistryName | string | 注册表名称 |
| LoginServerName | string | 登录服务器地址 (xxx.azurecr.cn) |
| RegistryId | string | 注册表 ID |
| RegistryLocation | string | 区域 |
| SkuId | string | SKU (Basic/Standard/Premium) |
| RegistryStatus | string | 注册表状态 |
| CreatedTime | string | 创建时间 |
| AdminUserEnabled | string | 是否启用 Admin 用户 |
| PublicNetworkAccessDisabled | string | 是否禁用公网访问 |
| PrivateLinkEndpointEnabled | string | 是否启用私有链接 |
| DataEndpointEnabled | string | 是否启用数据端点 |
| HasAssignedIdentity | string | 是否有托管标识 |
| ByokEnabled | string | 是否启用 CMK 加密 |
| ZoneRedundancyEnabled | string | 是否启用区域冗余 |
| SoftDeleteEnabled | string | 是否启用软删除 |
| TenantId | string | 租户 ID |
| FirewallRulesEnabled | string | 是否启用防火墙规则 |
| ReplicationRegions | string | 复制区域 |
| HasCacheRules | string | 是否有缓存规则 |
| ProvisioningState | string | 预配状态 |

## 常用筛选字段

- `LoginServerName` - 按登录服务器筛选
- `RegistryName` - 按注册表名称筛选
- `SubscriptionId` - 按订阅筛选
- `env_time` - 按时间筛选

## 典型应用场景

1. **获取注册表配置** - 查看当前配置状态
2. **检查网络设置** - PublicNetworkAccessDisabled, PrivateLinkEndpointEnabled
3. **验证安全特性** - ByokEnabled, HasAssignedIdentity
4. **检查 SKU 和区域** - SkuId, RegistryLocation

## 示例查询

### 获取注册表基础信息
```kql
RegistryMasterData
| where env_time >= ago(3d)
| where LoginServerName contains "{registry}.azurecr.cn"
| sort by env_time desc
| project env_time, CreatedTime, SubscriptionId, ResourceGroup, RegistryName, LoginServerName, 
         RegistryId, RegistryLocation, SkuId, AdminUserEnabled, PublicNetworkAccessDisabled, 
         PrivateLinkEndpointEnabled, DataEndpointEnabled, HasAssignedIdentity, ByokEnabled
| take 1
```

### 检查 CMK 配置
```kql
RegistryMasterData
| where env_time > ago(1d)
| where tolower(RegistryName) == "{registryName}"
| project ByokEnabled
```

### 检查网络配置
```kql
RegistryMasterData
| where env_time > ago(1d)
| where LoginServerName == "{registry}.azurecr.cn"
| project RegistryName, PublicNetworkAccessDisabled, PrivateLinkEndpointEnabled, 
         DataEndpointEnabled, FirewallRulesEnabled
| take 1
```

## 关联表

- [RegistryActivity.md](./RegistryActivity.md) - 注册表活动日志
- [RPActivity.md](./RPActivity.md) - RP 活动日志

## 注意事项

- 使用 `env_time` 作为时间筛选字段
- `LoginServerName` 包含完整的登录 URL (如 myacr.azurecr.cn)
- 大部分配置字段为 string 类型，需要注意布尔值比较
