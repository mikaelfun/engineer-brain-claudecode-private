---
name: HelmControllerEvents
database: AKSprod
cluster: https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn
description: CCP Helm Controller 事件，用于 Addon 管理和 Helm Release 部署
status: active
---

# HelmControllerEvents

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | AKSprod |
| 状态 | ✅ 可用 |

## 用途

记录 CCP Helm Controller 的事件，用于排查 Addon 启用失败、Helm Release 部署问题。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| PreciseTimeStamp | datetime | 时间戳 |
| namespace | string | CCP 命名空间 |
| level | string | 日志级别 |
| error | string | 错误信息 |
| msg | string | 消息内容 |

## 常用筛选字段

- `namespace` - 按 CCP 命名空间筛选
- `level` - 按日志级别筛选
- `error` - 按错误信息搜索

## 典型应用场景

1. **排查 Addon 启用失败** - 查看 Helm Release 部署错误
2. **监控 Helm 部署** - 追踪 Addon 部署状态
3. **诊断配置问题** - 分析 Helm values 相关错误

## 示例查询

### 查询 Helm Controller 错误
```kql
HelmControllerEvents
| where PreciseTimeStamp > ago(10d)
| where namespace == "{ccpNamespace}"
| where level != 'info'
| project PreciseTimeStamp, level, error, msg
```

### 查询特定时间范围的事件
```kql
HelmControllerEvents
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where namespace == "{ccpNamespace}"
| project PreciseTimeStamp, level, error, msg
| sort by PreciseTimeStamp desc
```

## 关联表

- [AddonConfigReconcilerEvents.md](./AddonConfigReconcilerEvents.md) - Addon 配置协调器事件

## 注意事项

- 此表主要用于诊断 Addon 相关问题
- `error` 字段包含详细错误信息
- 过滤 level != 'info' 可快速定位问题
