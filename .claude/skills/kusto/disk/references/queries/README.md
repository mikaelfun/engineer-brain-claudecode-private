# 查询模板 (queries/)

本目录存放 KQL 查询模板文件，每个文件对应一个或一组相关查询。

## 查询索引

### Disk RP 查询

| 查询 | 用途 | 文件 |
|------|------|------|
| 磁盘元数据 | 查询磁盘配置和属性 | [disk-metadata.md](./disk-metadata.md) |
| 磁盘生命周期 | 创建、删除、附加等事件 | [disk-lifecycle.md](./disk-lifecycle.md) |
| API QoS 事件 | Disk RP API 调用追踪 | [disk-api-qos.md](./disk-api-qos.md) |

### IO 性能查询

| 查询 | 用途 | 文件 |
|------|------|------|
| IO 性能分析 | IOPS/MBPS/QD 性能指标 | [io-performance.md](./io-performance.md) |
| IO 限流检查 | 限流事件和原因分析 | [io-throttling.md](./io-throttling.md) |
| IO 延迟分析 | 延迟分布和高延迟检测 | [io-latency.md](./io-latency.md) |
| IO 错误详情 | VHD 错误和超时事件 | [io-errors.md](./io-errors.md) |
| xStore IO 指标 | RDMA/STCP 网络层指标 | [xdisk-counters.md](./xdisk-counters.md) |

### 配置和硬件查询

| 查询 | 用途 | 文件 |
|------|------|------|
| RDOS 磁盘配置 | 主机层磁盘配置信息 | [rdos-disk-config.md](./rdos-disk-config.md) |
| 主机磁盘库存 | 硬件磁盘序列号和固件 | [dcm-disk-inventory.md](./dcm-disk-inventory.md) |

### XStore 存储查询 (仅 Public 环境)

| 查询 | 用途 | 文件 |
|------|------|------|
| XStore 存储 | 存储集群容量、账户属性、计费 | [xstore-storage.md](./xstore-storage.md) |

> ⚠️ **注意**: XStore 查询仅适用于 Public 环境，Mooncake 无法访问这些集群。

---

## 文件命名规范

```
{场景}-{操作}.md
```

示例：
- `disk-metadata.md` - 磁盘元数据查询
- `io-performance.md` - IO 性能查询
- `io-throttling.md` - IO 限流查询

## 文件格式

每个查询模板文件使用以下格式：

```markdown
---
name: query-name
description: 查询描述
tables:
  - TableName1
  - TableName2
parameters:
  - name: subscription
    required: true
    description: 订阅 ID
  - name: diskArmId
    required: true
    description: 磁盘 ARM 资源 ID
  - name: startTime
    required: false
    default: ago(1d)
    description: 开始时间
---

# 查询标题

## 用途

描述此查询的用途和适用场景。

## 必要参数

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| {subscription} | 是 | 订阅 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {diskArmId} | 是 | 磁盘 ARM ID | /subscriptions/.../disks/mydisk |

## 查询语句

\```kql
cluster('https://disksmc.chinaeast2.kusto.chinacloudapi.cn').database('Disks').Disk
| where SubscriptionId has '{subscription}'
| where DiskArmId has '{diskArmId}'
| project PreciseTimeStamp, DiskArmId, BlobUrl, AccountType
| take 10
\```

## 结果字段说明

| 字段 | 说明 |
|------|------|
| PreciseTimeStamp | 精确时间戳 |
| DiskArmId | 磁盘 ARM 资源 ID |

## 变体查询

### 变体 1: 按 VM 名称查询

\```kql
// 筛选特定 VM 的磁盘
| where VMName has '{vmName}'
\```

## 关联查询

- [io-performance.md](./io-performance.md) - IO 性能分析
```

## 参数占位符规范

使用 `{paramName}` 格式定义参数占位符：

| 占位符 | 说明 |
|--------|------|
| `{subscription}` | 订阅 ID |
| `{diskName}` | 磁盘名称 |
| `{diskArmId}` | 磁盘 ARM 资源 ID |
| `{nodeId}` | 计算节点 ID |
| `{deviceId}` | 磁盘设备 ID |
| `{correlationId}` | 操作关联 ID |
| `{startTime}` | 开始时间 |
| `{endTime}` | 结束时间 |
| `{vmName}` | 虚拟机名称 |
| `{resourceGroup}` | 资源组名称 |

## 时间参数格式

- **绝对时间**: `datetime(2025-01-01T00:00:00.000Z)`
- **相对时间**: `ago(1d)`, `ago(24h)`, `ago(30m)`
- **时间范围**: `between (datetime(...)..datetime(...))`
