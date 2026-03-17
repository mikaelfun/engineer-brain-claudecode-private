---
name: RDTenant
database: WVD
cluster: https://rdskmc.chinaeast2.kusto.chinacloudapi.cn
description: AVD 租户信息表
status: active
---

# RDTenant

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://rdskmc.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | WVD |
| 状态 | ✅ 可用 |

## 用途

记录 AVD 租户信息，用于获取租户与 Azure AD 的关联关系，以及租户组信息。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| TIMESTAMP | datetime | 时间戳 |
| PreciseTimeStamp | datetime | 精确时间戳 |
| env_time | datetime | 环境时间 |
| Name | string | 租户名称 |
| Id | string | 租户 ID |
| AzureADId | string | Azure AD 租户 ID |
| ADFSId | string | ADFS ID |
| CreationDate | string | 创建日期 |
| TenantGroupId | string | 租户组 ID |
| Env | string | 环境 |
| Region | string | 区域 |
| Ring | string | 部署环 |

## 常用筛选字段

- `TenantGroupId` - 按租户组筛选
- `AzureADId` - 按 Azure AD 租户筛选
- `Name` - 按租户名称筛选

## 典型应用场景

1. **获取租户信息** - 查找租户的 Azure AD 关联
2. **租户组管理** - 了解租户组织结构
3. **部署信息查询** - 获取 Resource Group ID

## 示例查询

### 按租户组 ID 获取租户信息

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDTenant
| where TenantGroupId == "{TenantGroupId}"
| where env_time >= ago(1d)
| project env_time, Name, Id, CreationDate, TenantGroupId, AzureADId
| summarize arg_max(env_time, *) by Id
```

### 按 Azure AD 租户 ID 查询

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDTenant
| where AzureADId == "{AzureADId}"
| where env_time >= ago(1d)
| project env_time, Name, Id, CreationDate, TenantGroupId
```

## 关联表

- [HostPool.md](./HostPool.md) - 通过 TenantId 关联
- [AppGroup.md](./AppGroup.md) - 通过 TenantId 关联

## 注意事项

- 此表主要用于传统 WVD 部署模式
- ARM 部署模式下，租户信息通常通过 ARM 资源路径获取
