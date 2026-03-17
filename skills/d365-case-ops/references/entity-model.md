# D365 实体模型

> 本文件供脚本开发和调试时参考。

## 实体关系图

```
incident (Case)
├── annotation (Notes) — objectid → incidentid
├── email (Emails) — regardingobjectid → incidentid
├── phonecall (Phone Calls) — regardingobjectid → incidentid
├── task (Tasks) — regardingobjectid → incidentid
├── appointment (Appointments) — regardingobjectid → incidentid
├── msdfm_labor (Labor) — msdfm_CaseId → incidentid  ⚠️ PascalCase binding
├── msdfm_caserestrictedattributes — navigation: msdfm_CaseRestrictedAttributesId
├── msdfm_icmdetail — msdfm_caseid → incidentid
├── msdfm_dtmattachmentmetadata — msdfm_caseid → incidentid
├── msdfm_customerprogram — msdfm_caseid → incidentid
├── connection (Contacts/Roles) — record1id → incidentid
├── queueitem — objectid → incidentid
├── postfollow — regardingobjectid → incidentid
└── activitypointer (Timeline) — regardingobjectid → incidentid
```

## Case Status (statuscode) 完整列表

### Active (statecode=0)

| 值 | 状态 | 说明 |
|----|------|------|
| `1` | In progress | 默认 |
| `2` | On hold | 暂停 |
| `3` | Waiting for details | 等待详情 |
| `4` | Researching | 研究中 |
| `847050000` | Initial contact pending | 等待初次联系 |
| `847050001` | Identifying the issue | 识别问题 |
| `847050002` | Troubleshooting | 排障中 |
| `847050003` | Pending customer response | 等客户回复 |
| `847050004` | Waiting for customer confirmation | 等客户确认 |
| `847050005` | Waiting for product team | 等产品组 |
| `847050013` | Audit | 审计 |
| `847050015` | Transferred to external | 转外部 |
| `847050016` | Transferred from external | 从外部转入 |
| `847050017` | Request to resolve by customer | 客户请求关闭 |
| `847050020` | Mitigated | 已缓解 |
| `847050021` | Pending closure | 待关闭 |

### Resolved (statecode=1)

| 值 | 状态 |
|----|------|
| `5` | Problem solved |
| `1000` | Information provided |
| `847050006` | Disconnect/Hang-up |
| `847050007` | Duplicate |
| `847050008` | Resolved |
| `847050009` | Resolved external |
| `847050010` | Resolved by customer |
| `847050011` | Un-resolved |
| `847050012` | Transferred to external |
| `847050014` | Created as tombstone |
| `847050019` | Contractual reasons |

### Cancelled (statecode=2)

| 值 | 状态 |
|----|------|
| `2000` | Merged |
| `6` | Cancelled |

## Labor Classification 选项值

| 值 | 标签 |
|----|------|
| `337818` | Troubleshooting |

> 完整列表可查询：
> `GET /api/data/v9.0/EntityDefinitions(LogicalName='msdfm_labor')/Attributes(LogicalName='msdfm_classification')/Microsoft.Dynamics.CRM.PicklistAttributeMetadata?$select=LogicalName&$expand=OptionSet`

## Email Status

| statecode | statuscode | 含义 |
|-----------|-----------|------|
| 0 (Open) | 1 | Draft |
| 1 (Completed) | 2 | Completed |
| 1 (Completed) | 4 | Sent |
| 2 (Canceled) | 5 | Canceled |

## OData Binding 命名约定

多态 Lookup 字段的 binding 格式：`{lookupfield}_{targetentity}_{owningentity}@odata.bind`

示例：
- Note → Case: `objectid_incident@odata.bind`
- Phone Call → Case: `regardingobjectid_incident_phonecall@odata.bind`（含 owning entity 后缀）
- Labor → Case: `msdfm_CaseId@odata.bind`（⚠️ PascalCase SchemaName）
