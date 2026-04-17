---
name: AppGroup
database: WVD
cluster: https://rdskmc.chinaeast2.kusto.chinacloudapi.cn
description: AVD 应用组信息表
status: active
---

# AppGroup

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://rdskmc.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | WVD |
| 状态 | ✅ 可用 |

## 用途

记录 AVD 应用组信息，包括已发布应用数量、用户数量、类型等。Id 字段可与其他表的 AppGroup 字段关联。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| TIMESTAMP | datetime | 时间戳 |
| PreciseTimeStamp | datetime | 精确时间戳 |
| env_time | datetime | 环境时间 |
| Name | string | 应用组名称 |
| Id | string | 应用组 ID |
| PubAppsCount | long | 已发布应用数量 |
| UsersCount | long | 用户数量 |
| Type | string | 类型 (Desktop, RemoteApp) |
| HostPoolId | string | 关联的主机池 ID |
| TenantId | string | 租户 ID |
| AADTenantId | string | Azure AD 租户 ID |
| SubscriptionId | string | 订阅 ID |
| ResourceGroup | string | 资源组 |
| WorkspaceId | string | 工作区 ID |
| Location | string | 位置 |
| ArmPath | string | ARM 资源路径 |
| IsCPC | bool | 是否为 Cloud PC |
| IsHidden | bool | 是否隐藏 |
| MigrationState | string | 迁移状态 |

## 常用筛选字段

- `HostPoolId` - 按主机池 ID 筛选
- `Name` - 按应用组名称筛选
- `TenantId` - 按租户筛选
- `Type` - 按类型筛选 (Desktop, RemoteApp)

## 典型应用场景

1. **应用组配置查询** - 获取应用组的配置信息
2. **用户授权审计** - 检查应用组的用户数量
3. **发布应用统计** - 统计已发布的远程应用数量
4. **主机池关联查询** - 查找主机池下的所有应用组

## 示例查询

### 按主机池 ID 获取应用组

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').AppGroup
| where HostPoolId == "{HostPoolId}"
| where env_time >= ago(1d)
| summarize arg_max(env_time, *) by Id
| project Name, Id, UsersCount, PubAppsCount, Type, Location, WorkspaceId
```

### 按订阅获取所有应用组

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').AppGroup
| where SubscriptionId == "{SubscriptionId}"
| where env_time >= ago(1d)
| summarize arg_max(env_time, *) by Id
| project Name, Id, Type, HostPoolId, UsersCount, PubAppsCount
| order by Name asc
```

### 查询 Desktop 类型应用组

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').AppGroup
| where AADTenantId == "{AADTenantId}"
| where Type == "Desktop"
| where env_time >= ago(1d)
| summarize arg_max(env_time, *) by Id
| project Name, Id, HostPoolId, UsersCount, Location
```

### 统计各主机池的应用组数量

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').AppGroup
| where env_time >= ago(1d)
| where AADTenantId == "{AADTenantId}"
| summarize arg_max(env_time, *) by Id
| summarize 
    DesktopCount = countif(Type == "Desktop"),
    RemoteAppCount = countif(Type == "RemoteApp"),
    TotalUsers = sum(UsersCount),
    TotalApps = sum(PubAppsCount)
    by HostPoolId
```

## 关联表

- [HostPool.md](./HostPool.md) - 通过 HostPoolId = Id 关联
- [RDTenant.md](./RDTenant.md) - 通过 TenantId 关联

## 注意事项

- 推荐查询模式：使用 `macro-expand isfuzzy=true AVD_MC as T ( T.AppGroup | <query> )` 进行跨表查询
- 使用 `summarize arg_max()` 获取最新配置快照
- Type 字段值："Desktop" 为完整桌面，"RemoteApp" 为远程应用
