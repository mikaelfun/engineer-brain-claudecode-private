---
name: acr
description: ACR Kusto 查询专家 - 诊断 Azure Container Registry 镜像推拉、认证、性能和 Task 构建问题。当用户需要排查 ACR 问题时触发此 skill。
author: fangkun
last_modified: 2026-01-14
---

# ACR Kusto 查询 Skill

## 概述

本 Skill 用于查询 ACR (Azure Container Registry) 相关的 Kusto 日志，诊断镜像推拉、认证、性能、限流和 ACR Task 构建等问题。

## 触发关键词

- ACR、Container Registry、容器注册表
- Docker Push、Docker Pull、镜像推拉
- 401、403、认证失败、Token 过期
- 429、限流、Throttling
- ACR Task、Build、构建
- Manifest、Blob、Layer
- 私有链接、Private Endpoint

## 集群信息

| 集群名称 | URI | 数据库 | 用途 |
|----------|-----|--------|------|
| ACR MC | https://acrmc2.chinaeast2.kusto.chinacloudapi.cn | acrprodmc | ACR 主要日志 |

详细集群信息见: [kusto_clusters.csv](./references/kusto_clusters.csv)

## 主要表

### acrprodmc 数据库

| 表名 | 用途 | 文档 |
|------|------|------|
| RegistryMasterData | ACR 注册表元数据和配置 | [📄](./references/tables/RegistryMasterData.md) |
| RegistryActivity | 注册表活动日志 (Push/Pull/Auth) | [📄](./references/tables/RegistryActivity.md) |
| RPActivity | ACR RP 活动日志 | [📄](./references/tables/RPActivity.md) |
| StorageAccountLogs | 存储账户日志（层下载性能） | [📄](./references/tables/StorageAccountLogs.md) |
| BuildHostTrace | ACR Task 构建日志 | [📄](./references/tables/BuildHostTrace.md) |
| WorkerServiceActivity | Worker 服务活动（Manifest 统计） | [📄](./references/tables/WorkerServiceActivity.md) |

详细表定义见: [tables/](./references/tables/)

## 工作流程

### 步骤 1: 获取注册表基础信息

首先获取 ACR 注册表配置和状态：

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryMasterData
| where env_time >= ago(3d)
| where LoginServerName contains "{registry}.azurecr.cn"
| sort by env_time desc
| project env_time, CreatedTime, SubscriptionId, ResourceGroup, RegistryName, LoginServerName, 
         RegistryId, RegistryLocation, SkuId, AdminUserEnabled, PublicNetworkAccessDisabled, 
         PrivateLinkEndpointEnabled, DataEndpointEnabled, HasAssignedIdentity, ByokEnabled
| take 1
```

### 步骤 2: 查询操作日志

根据问题类型选择查询：

#### 2.1 查询所有活动和错误
```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where activitytimestamp > ago(7d)
| where http_request_host == "{registry}.azurecr.cn"
| where level == "error"
| where http_request_method != "HEAD"
| project PreciseTimeStamp, vars_name, message, err_message, err_detail, http_request_method, 
         http_response_status, http_request_uri, http_request_remoteaddr, http_request_useragent, 
         correlationid, level
| order by PreciseTimeStamp asc
```

#### 2.2 根据 correlationId 追踪
```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where correlationid == "{correlationId}"
| project activitytimestamp, message, auth_token_access, correlationid, err_code, err_detail, 
         err_message, http_request_host, http_request_id, http_request_method, http_request_uri, 
         http_response_status, level, service
| order by activitytimestamp asc
```

### 步骤 3: 分析特定场景

根据问题类型选择对应的查询模板：

- **Push 性能分析**: 使用 [push-performance.md](./references/queries/push-performance.md)
- **Pull 性能分析**: 使用 [pull-performance.md](./references/queries/pull-performance.md)
- **认证问题**: 使用 [authentication-errors.md](./references/queries/authentication-errors.md)
- **限流分析**: 使用 [throttling-analysis.md](./references/queries/throttling-analysis.md)
- **ACR Task**: 使用 [acr-task.md](./references/queries/acr-task.md)

## 常见诊断场景

### 场景 1: Docker Pull 失败

**排查步骤**:
1. 获取失败时间和镜像名称
2. 查询 RegistryActivity 获取错误详情
3. 检查 http_response_status 和 err_detail
4. 如果是 401/403，检查认证配置
5. 如果是 500，检查后端服务状态

### 场景 2: Push 性能问题

**排查步骤**:
1. 使用 Push 分析查询获取上传速度
2. 检查层大小和上传时间
3. 使用 StorageAccountLogs 分析存储层性能
4. 检查网络连接质量

### 场景 3: 认证失败 (401/403)

**排查步骤**:
1. 查询认证错误日志
2. 检查 Token 是否过期 (auth_token_expiresin, auth_token_issued)
3. 检查 err_detail 中的具体错误原因
4. 验证服务主体/托管标识权限

### 场景 4: ACR Task 构建失败

**排查步骤**:
1. 获取 RUN_ID
2. 查询 BuildHostTrace 获取构建日志
3. 检查错误消息和步骤

### 场景 5: 429 限流

**排查步骤**:
1. 使用限流分析查询确认限流位置 (FE/TS/nginx)
2. 检查请求频率和模式
3. 评估 SKU 限制
4. 建议优化策略

## 预定义查询

详细查询模板见: [queries/](./references/queries/)

| 查询 | 用途 |
|------|------|
| [registry-info.md](./references/queries/registry-info.md) | 注册表信息查询 |
| [activity-errors.md](./references/queries/activity-errors.md) | 活动错误查询 |
| [push-performance.md](./references/queries/push-performance.md) | Push 性能分析 |
| [pull-performance.md](./references/queries/pull-performance.md) | Pull 性能分析 |
| [authentication-errors.md](./references/queries/authentication-errors.md) | 认证错误分析 |
| [throttling-analysis.md](./references/queries/throttling-analysis.md) | 限流分析 |
| [storage-layer-performance.md](./references/queries/storage-layer-performance.md) | 存储层性能 |
| [acr-task.md](./references/queries/acr-task.md) | ACR Task 构建 |
| [manifest-statistics.md](./references/queries/manifest-statistics.md) | Manifest 统计 |
| [rp-activity.md](./references/queries/rp-activity.md) | RP 活动日志 |

## 常用参数说明

| 参数 | 说明 | 获取方式 |
|------|------|----------|
| LoginServerName | ACR 登录服务器名称 | 例如: myacr.azurecr.cn |
| RegistryName | ACR 注册表名称 | 例如: myacr |
| correlationid | 请求关联 ID | 从错误响应或日志获取 |
| vars_name | 镜像仓库名称 | 例如: myapp/frontend |
| vars_digest | 镜像层摘要 | 例如: sha256:abc123... |

## 参考链接

- [ACR Kusto Queries Wiki](https://supportability.visualstudio.com/AzureContainers/_wiki/wikis/Containers%20Wiki/907358/ACR-Kusto-Queries)
- [ACR 故障排查](https://learn.microsoft.com/azure/container-registry/container-registry-troubleshoot-access)
- [ACR 网络问题排查](https://learn.microsoft.com/azure/container-registry/container-registry-troubleshoot-network)
- [父 Skill](../SKILL.md)
