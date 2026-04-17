# 表结构定义 (tables/)

本目录存放 ACR 相关的 Kusto 表结构定义文件，每个文件对应一个表。

## 表索引

### acrprodmc 数据库 (ACR 主要日志)

> 集群: `acrmc2.chinaeast2.kusto.chinacloudapi.cn`

| 表名 | 用途 | 文件 |
|------|------|------|
| RegistryMasterData | 注册表元数据，查询配置、网络、安全设置 | [RegistryMasterData.md](./RegistryMasterData.md) |
| RegistryActivity | 注册表活动日志，Push/Pull/认证问题诊断 | [RegistryActivity.md](./RegistryActivity.md) |
| RPActivity | RP 活动日志，登录活动、管理操作 | [RPActivity.md](./RPActivity.md) |
| StorageAccountLogs | 存储账户日志，层下载/上传性能分析 | [StorageAccountLogs.md](./StorageAccountLogs.md) |
| BuildHostTrace | ACR Task 日志，构建任务诊断 | [BuildHostTrace.md](./BuildHostTrace.md) |
| WorkerServiceActivity | Worker 服务日志，Manifest 统计、后台操作 | [WorkerServiceActivity.md](./WorkerServiceActivity.md) |

### acrprodmc 数据库 - 其他可用表（未建立详细文档）

| 表名 | 用途 |
|------|------|
| BuildServiceTrace | Build Service 日志 |
| BuildServiceHttpIncomingRequest | Build Service HTTP 入站请求 |
| BuildServiceHttpOutgoingRequest | Build Service HTTP 出站请求 |
| BuildHostIncomingEvent | Build Host 入站事件 |
| BuildHostOutgoingEvent | Build Host 出站事件 |
| RegistryManifestEvent | Registry Manifest 事件 |
| StorageAccountMetrics | 存储账户指标 |
| StorageManagementAccountLogs | 存储管理日志 |
| KubernetesContainers | Kubernetes 容器日志 |
| IdentifiableRegistrySecrets | 可识别密钥 |

---

## 表字段命名约定

- `env_time` / `PreciseTimeStamp` / `activitytimestamp` - 时间字段
- `correlationid` / `CorrelationId` - 关联 ID
- `http_request_*` - HTTP 请求相关字段
- `http_response_*` - HTTP 响应相关字段
- `err_*` / `be_err_*` - 错误相关字段
- `auth_*` - 认证相关字段

## 使用建议

1. **从 RegistryActivity 开始** - 大多数问题可以从这里找到线索
2. **使用 correlationid 追踪** - 追踪单个请求的完整链路
3. **结合 StorageAccountLogs** - 分析存储层性能问题
4. **查看 RegistryMasterData** - 了解注册表配置

## 文件命名规范

```
{TableName}.md
```

## 文件格式

每个表定义文件使用以下格式：

```markdown
---
name: TableName
database: acrprodmc
cluster: https://acrmc2.chinaeast2.kusto.chinacloudapi.cn
description: 表描述
status: active|deprecated
---

# TableName

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://acrmc2.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | acrprodmc |
| 状态 | ✅ 可用 / ⚠️ 已弃用 |

## 用途 / 关键字段 / 常用筛选字段 / 典型应用场景 / 示例查询 / 关联表 / 注意事项
```

## 字段类型

| 类型 | KQL 类型 | 说明 |
|------|----------|------|
| datetime | datetime | 日期时间 |
| string | string | 字符串 |
| int | int | 整数 |
| long | long | 长整数 |
| bool | bool | 布尔值 |
| dynamic | dynamic | JSON 对象 |
| guid | guid | GUID |

## 状态标记

| 状态 | 标记 | 说明 |
|------|------|------|
| 可用 | ✅ | 表正常可用 |
| 已弃用 | ⚠️ | 表已弃用，不建议使用 |
| 实验性 | 🧪 | 实验性表，可能变更 |
