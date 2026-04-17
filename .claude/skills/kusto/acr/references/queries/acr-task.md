---
name: acr-task
description: ACR Task 构建日志查询
tables:
  - BuildHostTrace
parameters:
  - name: registry
    required: true
    description: ACR 登录服务器名称（不含 .azurecr.cn）
---

# ACR Task 构建日志查询

## 用途

查询和诊断 ACR Task 构建任务，包括构建日志、错误、性能等。

## 查询 1: 按注册表查询构建日志

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {registry} | 是 | 注册表名称（不含 .azurecr.cn） |

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').BuildHostTrace
| where env_time > ago(3d)
| where Tag contains "{registry}.azurecr.cn"
| order by env_time
| project env_time, Message, Tag, DataJson, SourceNamespace
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| Tag | 标签 (包含注册表和 RUN_ID) |
| Message | 构建日志消息 |
| DataJson | JSON 格式附加数据 |

---

## 查询 2: 按 RUN_ID 查询构建日志

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {registry} | 是 | 注册表名称 |
| {runId} | 是 | 构建任务 RUN_ID |

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').BuildHostTrace
| where env_time > ago(1d)
| where Tag contains "{registry}.azurecr.cn_{runId}"
| order by env_time
| project env_time, Level, Component, Message, Exception, DataJson
```

---

## 查询 3: 构建错误查询

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').BuildHostTrace
| where env_time > ago(7d)
| where Tag contains "{registry}.azurecr.cn"
| where isnotempty(Exception) or Level >= 3
| project env_time, Tag, Level, Component, Message, Exception
| order by env_time desc
```

---

## 查询 4: 构建任务统计

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').BuildHostTrace
| where env_time > ago(7d)
| where Tag contains ".azurecr.cn"
| extend Registry = extract(@"^([^_]+)", 1, Tag)
| extend RunId = extract(@"_(.+)$", 1, Tag)
| summarize 
    FirstLog = min(env_time),
    LastLog = max(env_time),
    LogCount = count(),
    HasError = countif(isnotempty(Exception)) > 0
  by Registry, RunId
| extend Duration = LastLog - FirstLog
| order by FirstLog desc
```

---

## 查询 5: 构建任务详细时间线

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').BuildHostTrace
| where env_time > ago(1d)
| where Tag == "{registry}.azurecr.cn_{runId}"
| extend DataParsed = parse_json(DataJson)
| project env_time, Level, Component, Message, 
         Step = tostring(DataParsed.step),
         Status = tostring(DataParsed.status),
         Duration = tostring(DataParsed.duration)
| order by env_time asc
```

---

## 查询 6: 最近失败的构建

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').BuildHostTrace
| where env_time > ago(7d)
| where Tag contains "{registry}.azurecr.cn"
| where isnotempty(Exception)
| extend RunId = extract(@"_(.+)$", 1, Tag)
| summarize 
    ErrorTime = max(env_time),
    ErrorMessage = take_any(Message),
    ExceptionSummary = take_any(substring(Exception, 0, 200))
  by RunId
| order by ErrorTime desc
| take 20
```

## Tag 格式说明

Tag 字段格式: `{registry}.azurecr.cn_{runId}`
- 示例: `myacr.azurecr.cn_cc1`
- 可用于筛选特定注册表或 RUN_ID

## 关联查询

- [registry-info.md](./registry-info.md) - 注册表信息
- [activity-errors.md](./activity-errors.md) - 活动错误查询
