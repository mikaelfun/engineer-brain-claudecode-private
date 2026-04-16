# Intune 许可证与租户 — 排查工作流

**来源草稿**: (无)
**Kusto 引用**: license-status.md
**场景数**: 0
**生成日期**: 2026-04-07

---

## Kusto 查询参考

### 查询 1: Intune 许可证事件

```kql
IntuneEvent
| where env_time between(datetime({startTime})..datetime({endTime}))
| where env_cloud_name == 'CNPASU01'
| where ComponentName == 'UserProvider'
| where UserId =~ '{userId}'
| where ActivityId has '{deviceId}'  
| project env_time, EventUniqueName, ColMetadata, Col1, Col2, Col3
```
`[来源: license-status.md]`

### 查询 2: MSODS 许可证操作历史

```kql
// ⚠️ 需要切换到 msods 集群，数据库名称为 MSODS (大写)
IfxAuditLoggingCommon
| where env_time between(datetime({startTime})..datetime({endTime}))
| where targetObjectId == '{userId}'
| where operationName has 'license'
| project env_time, env_seqNum, operationName, operationType, resultType, 
    internalOperationType, internalCorrelationId, contextId, 
    targetObjectId, targetObjectName
```
`[来源: license-status.md]`
