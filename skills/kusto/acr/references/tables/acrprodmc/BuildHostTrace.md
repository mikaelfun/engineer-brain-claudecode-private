---
name: BuildHostTrace
database: acrprodmc
cluster: https://acrmc2.chinaeast2.kusto.chinacloudapi.cn
description: ACR Task 构建日志
status: active
---

# BuildHostTrace

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://acrmc2.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | acrprodmc |
| 状态 | ✅ 可用 |

## 用途

记录 ACR Task 构建过程的日志，用于诊断 ACR Task 构建失败、性能问题等。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| env_time | datetime | 环境时间 |
| Level | long | 日志级别 |
| RequestId | string | 请求 ID |
| CorrelationRequestId | string | 关联请求 ID |
| Component | string | 组件名称 |
| Message | string | 日志消息 |
| Exception | string | 异常信息 |
| Tag | string | 标签 (包含注册表和 RUN_ID) |
| DataJson | string | JSON 格式的附加数据 |
| SourceNamespace | string | 源命名空间 |
| SourceMoniker | string | 源标识 |
| SourceVersion | string | 源版本 |

## 常用筛选字段

- `Tag` - 按注册表或 RUN_ID 筛选
- `env_time` - 按时间筛选
- `Level` - 按日志级别筛选
- `Component` - 按组件筛选

## Tag 格式

Tag 字段通常包含注册表和 RUN_ID 信息：
- 格式: `{registry}.azurecr.cn_{runId}`
- 示例: `myacr.azurecr.cn_cc1`

## 典型应用场景

1. **查询构建日志** - 获取特定 RUN_ID 的完整日志
2. **诊断构建失败** - 查找错误消息和异常
3. **性能分析** - 分析构建各阶段耗时

## 示例查询

### 按注册表查询构建日志
```kql
BuildHostTrace
| where env_time > ago(3d)
| where Tag contains "{registry}.azurecr.cn"
| order by env_time
| project env_time, Message, Tag, DataJson, SourceNamespace
```

### 按 RUN_ID 查询构建日志
```kql
BuildHostTrace
| where env_time > ago(1d)
| where Tag contains "{registry}.azurecr.cn_{runId}"
| order by env_time
| project env_time, Level, Component, Message, Exception, DataJson
```

### 查询构建错误
```kql
BuildHostTrace
| where env_time > ago(7d)
| where Tag contains "{registry}.azurecr.cn"
| where isnotempty(Exception) or Level >= 3
| project env_time, Tag, Level, Component, Message, Exception
| order by env_time desc
```

### 统计构建任务
```kql
BuildHostTrace
| where env_time > ago(7d)
| where Tag contains ".azurecr.cn"
| extend Registry = extract(@"^([^_]+)", 1, Tag)
| extend RunId = extract(@"_(.+)$", 1, Tag)
| summarize 
    FirstLog = min(env_time),
    LastLog = max(env_time),
    LogCount = count()
  by Registry, RunId
| order by FirstLog desc
```

## 关联表

- [RegistryActivity.md](./RegistryActivity.md) - 注册表活动日志
- [RPActivity.md](./RPActivity.md) - RP 活动日志

## 注意事项

- 使用 `Tag` 字段筛选特定注册表或 RUN_ID
- `DataJson` 包含 JSON 格式的附加信息，可使用 `parse_json()` 解析
- 构建日志可能较多，建议限制时间范围
