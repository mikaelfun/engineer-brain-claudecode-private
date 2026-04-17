---
name: registry-info
description: ACR 注册表信息查询
tables:
  - RegistryMasterData
parameters:
  - name: registry
    required: true
    description: ACR 登录服务器名称（不含 .azurecr.cn）
---

# 注册表信息查询

## 用途

获取 ACR 注册表的配置、状态和元数据信息。

## 查询 1: 获取注册表基础信息

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {registry} | 是 | 注册表名称（不含 .azurecr.cn） |

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryMasterData
| where env_time >= ago(3d)
| where LoginServerName contains "{registry}.azurecr.cn"
| sort by env_time desc
| project env_time, CreatedTime, SubscriptionId, ResourceGroup, RegistryName, LoginServerName, 
         RegistryId, RegistryLocation, SkuId, AdminUserEnabled, PublicNetworkAccessDisabled, 
         PrivateLinkEndpointEnabled, DataEndpointEnabled, HasAssignedIdentity, ByokEnabled,
         PrivateLinksVersion
| take 1
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| LoginServerName | 登录服务器地址 |
| SkuId | SKU 类型 (Basic/Standard/Premium) |
| AdminUserEnabled | 是否启用 Admin 用户 |
| PublicNetworkAccessDisabled | 是否禁用公网访问 |
| PrivateLinkEndpointEnabled | 是否启用私有链接 |
| HasAssignedIdentity | 是否有托管标识 |
| ByokEnabled | 是否启用 CMK 加密 |

---

## 查询 2: 检查网络配置

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryMasterData
| where env_time > ago(1d)
| where LoginServerName == "{registry}.azurecr.cn"
| project RegistryName, PublicNetworkAccessDisabled, PrivateLinkEndpointEnabled, 
         DataEndpointEnabled, FirewallRulesEnabled, PublicNetworkAccessSecuredByPerimeter
| take 1
```

---

## 查询 3: 检查安全特性

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryMasterData
| where env_time > ago(1d)
| where LoginServerName == "{registry}.azurecr.cn"
| project RegistryName, ByokEnabled, HasAssignedIdentity, SoftDeleteEnabled, 
         ContentTrustEnabled, QuarantineEnabled, RetentionEnabled
| take 1
```

---

## 查询 4: 检查 CMK 配置

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryMasterData
| where env_time > ago(1d)
| where tolower(RegistryName) == "{registryName}"
| project ByokEnabled
```

## 关联查询

- [activity-errors.md](./activity-errors.md) - 活动错误查询
- [rp-activity.md](./rp-activity.md) - RP 活动日志
