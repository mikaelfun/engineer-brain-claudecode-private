# ACR Kusto 查询模板

本目录包含 ACR 相关的 Kusto 查询模板。

## 查询列表

| 查询文件 | 说明 | 主要用途 |
|----------|------|----------|
| [registry-info.md](./registry-info.md) | 注册表信息 | 查询注册表配置和状态 |
| [activity-errors.md](./activity-errors.md) | 活动错误 | 查询活动日志中的错误 |
| [push-performance.md](./push-performance.md) | Push 性能 | 分析 Docker Push 性能 |
| [pull-performance.md](./pull-performance.md) | Pull 性能 | 分析 Docker Pull 性能 |
| [authentication-errors.md](./authentication-errors.md) | 认证错误 | 排查 401/403 认证问题 |
| [throttling-analysis.md](./throttling-analysis.md) | 限流分析 | 分析 429 限流请求 |
| [storage-layer-performance.md](./storage-layer-performance.md) | 存储层性能 | 分析存储操作性能 |
| [acr-task.md](./acr-task.md) | ACR Task | 诊断 ACR Task 构建 |
| [manifest-statistics.md](./manifest-statistics.md) | Manifest 统计 | 统计镜像和 Tag |
| [rp-activity.md](./rp-activity.md) | RP 活动 | 查询 RP 层日志 |

## 查询模板格式

每个查询模板包含以下部分：
- **YAML 头信息**: 名称、描述、使用的表、参数
- **用途说明**: 查询的目的
- **查询语句**: 完整的 KQL 代码
- **参数说明**: 需要替换的参数
- **结果字段说明**: 输出字段的含义
- **关联查询**: 相关的其他查询

## 参数替换

查询中的参数使用 `{paramName}` 格式，执行前需要替换：

| 参数 | 说明 | 示例 |
|------|------|------|
| {registry} | 注册表名称（不含 .azurecr.cn） | myacr |
| {correlationId} | 请求关联 ID | abc123-def456 |
| {starttime} | 开始时间 (ISO 8601) | 2025-01-01T00:00:00Z |
| {endtime} | 结束时间 (ISO 8601) | 2025-01-02T00:00:00Z |
| {runId} | ACR Task RUN_ID | cc1 |
| {subscriptionId} | 订阅 ID | 12345678-... |

## 常用排查场景

### 场景 1: Docker Pull/Push 失败
1. 使用 [activity-errors.md](./activity-errors.md) 查找错误
2. 使用 [authentication-errors.md](./authentication-errors.md) 检查认证问题
3. 使用 correlationId 追踪完整请求链

### 场景 2: 性能问题
1. 使用 [push-performance.md](./push-performance.md) 或 [pull-performance.md](./pull-performance.md) 分析
2. 使用 [storage-layer-performance.md](./storage-layer-performance.md) 检查存储层

### 场景 3: 限流问题
1. 使用 [throttling-analysis.md](./throttling-analysis.md) 分析限流位置和频率
2. 评估 SKU 限制并优化请求模式

### 场景 4: ACR Task 构建失败
1. 使用 [acr-task.md](./acr-task.md) 查询构建日志
2. 根据 RUN_ID 追踪构建过程

## 使用建议

1. **从错误查询开始** - 先确定问题类型
2. **使用 correlationId 追踪** - 获取完整请求链路
3. **注意时间范围** - 避免查询过大范围
4. **组合多个查询** - 从不同角度分析问题
