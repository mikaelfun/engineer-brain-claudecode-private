---
name: agency-icm
description: "Use Agency-managed ICM MCP tools for incident lookups and summaries without relying on mcporter schema discovery. Use when: checking ICM incident summary/details/context/similar incidents, validating PG/ICM status for a case, gathering outage/incident impact information, looking up ICM teams/on-call/service metadata, or when `icm-mcp-prod` auth/schema issues make direct HTTP MCP usage unreliable. Prefer this skill whenever the workflow needs ICM data for case handling."
---

# Agency ICM Skill

通过 `agency mcp icm` 调用 ICM MCP，避免直接依赖 `mcporter` 对 ICM schema 的 discovery/解析。

## 何时使用

- caseworker 需要查询 ICM incident summary
- caseworker 需要查询 incident details / context / similar incidents
- 需要确认 PG / ICM 当前状态，用于对客同步
- 需要查询 team / on-call / service / impacted services 等 ICM 元数据
- `icm-mcp-prod` 直连 auth 或 schema discovery 不稳定时

## 当前设计原则

- **认证交给 Agency**：不依赖当前 `az login` 切换来处理 ICM OAuth
- **固定调用已知工具**：不依赖 `mcporter list --schema` 动态发现
- **先做常用能力**：先覆盖 caseworker 真正常用的 ICM 查询
- **原始 MCP JSON-RPC 调用**：脚本内部完成 initialize / tools/call

## 当前已封装工具

| ICM Tool | 用途 | 脚本 |
|---------|------|------|
| `get_ai_summary` | 获取 incident/outage AI 摘要 | `scripts/get-incident-summary.ps1` |
| `get_incident_details_by_id` | 获取 incident 详细信息 | `scripts/get-incident-details.ps1` |
| `get_incident_context` | 获取 incident 全量上下文 | `scripts/get-incident-context.ps1` |
| `get_similar_incidents` | 获取相似 incident | `scripts/get-similar-incidents.ps1` |
| `get_incident_location` | 获取 incident/outage 的位置/region/datacenter 信息 | `scripts/get-incident-location.ps1` |
| `get_incident_customer_impact` | 获取 incident/outage 的整体客户影响概览 | `scripts/get-incident-customer-impact.ps1` |
| `get_mitigation_hints` | 获取 incident 的缓解建议/mitigation hints | `scripts/get-mitigation-hints.ps1` |
| `get_support_requests_crisit` | 获取关联的 support requests / CritSit 信息 | `scripts/get-support-requests-critsit.ps1` |
| `is_specific_customer_impacted` | 判断特定客户是否在受影响名单中 | `scripts/is-specific-customer-impacted.ps1` |
| `get_team_by_id` | 根据 team id 获取 team 详细信息 | `scripts/get-team-by-id.ps1` |
| `get_teams_by_name` | 根据 team name 查询 team | `scripts/get-teams-by-name.ps1` |
| `get_teams_by_public_id` | 根据 team public id 查询 team | `scripts/get-teams-by-public-id.ps1` |
| `get_on_call_schedule_by_team_id` | 获取 team on-call 排班 | `scripts/get-on-call-schedule-by-team-id.ps1` |
| `get_services_by_names` | 根据服务名获取服务信息 | `scripts/get-services-by-names.ps1` |
| `get_impacted_services_regions_clouds` | 获取受影响的服务/区域/云 | `scripts/get-impacted-services-regions-clouds.ps1` |

## 调用方式

### 1. 获取 incident summary

```powershell
& "skills/agency-icm/scripts/get-incident-summary.ps1" `
  -IncidentId 626495494
```

### 2. 获取 incident details

```powershell
& "skills/agency-icm/scripts/get-incident-details.ps1" `
  -IncidentId 626495494
```

### 3. 获取 incident context

```powershell
& "skills/agency-icm/scripts/get-incident-context.ps1" `
  -IncidentId 626495494
```

### 4. 获取 similar incidents

```powershell
& "skills/agency-icm/scripts/get-similar-incidents.ps1" `
  -IncidentId 626495494
```

### 5. 获取 incident location

```powershell
& "skills/agency-icm/scripts/get-incident-location.ps1" `
  -IncidentId 626495494
```

### 6. 获取 customer impact

```powershell
& "skills/agency-icm/scripts/get-incident-customer-impact.ps1" `
  -IncidentId 626495494
```

### 7. 获取 mitigation hints

```powershell
& "skills/agency-icm/scripts/get-mitigation-hints.ps1" `
  -IncidentId 626495494
```

### 8. 获取 support requests / critsit

```powershell
& "skills/agency-icm/scripts/get-support-requests-critsit.ps1" `
  -IncidentId 626495494
```

### 9. 判断特定客户是否受影响

```powershell
& "skills/agency-icm/scripts/is-specific-customer-impacted.ps1" `
  -IncidentId 626495494 `
  -CustomerName "Contoso"
```

### 10. 根据 team id 获取 team

```powershell
& "skills/agency-icm/scripts/get-team-by-id.ps1" `
  -TeamId 86687
```

### 11. 根据 team name 查询 team

```powershell
& "skills/agency-icm/scripts/get-teams-by-name.ps1" `
  -TeamName "PGEscalation"
```

### 12. 根据 public id 查询 team

```powershell
& "skills/agency-icm/scripts/get-teams-by-public-id.ps1" `
  -PublicId "TenantName\\TeamName"
```

### 13. 获取 on-call schedule

```powershell
& "skills/agency-icm/scripts/get-on-call-schedule-by-team-id.ps1" `
  -TeamIds 86687
```

### 14. 根据服务名获取服务信息

```powershell
& "skills/agency-icm/scripts/get-services-by-names.ps1" `
  -Names "Azure Virtual Network","Azure Databricks"
```

### 15. 获取受影响的服务 / 区域 / 云

```powershell
& "skills/agency-icm/scripts/get-impacted-services-regions-clouds.ps1" `
  -IncidentId 626495494
```

## 输出约定

统一输出 JSON：

```json
{
  "ok": true,
  "tool": "get_ai_summary",
  "incidentId": "626495494",
  "data": { ... },
  "source": "agency-mcp-icm",
  "fetchedAt": "2026-03-16T13:50:00+08:00"
}
```

如果底层返回的是文本 JSON 字符串，脚本应尽量二次解析；解析失败时保留原始文本。

## 已知限制

- `agency mcp icm` 本身可 auth、可调用
- 但 `mcporter list --schema` 对其某些复杂 schema 存在 `$ref` 解析问题
- 因此本 skill **不依赖 schema discovery**，而是固定调用已验证工具名
- 当前通过本地 Agency MCP proxy + 原始 JSON-RPC 调用实现

## caseworker 集成建议

用于 caseworker 的 ICM 步骤时：

1. 从 case / note / team discussion 中拿到 incidentId
2. 优先调用：
   - summary
   - details
   - customer impact
   - support requests / critsit
3. 如需更深上下文，再调：
   - context
   - mitigation hints
   - similar incidents
4. 如需组织/责任人信息，再调：
   - team lookup
   - on-call schedule
5. 将结果写入：
   - `research/icm-summary.md`
   - `research/icm-details.md`
   - `research/icm-context.md`
   - `research/icm-impact.md`
6. 再把关键结论写回 inspection

## 后续演进

下一批可加：
- 更细粒度 impacted customers 查询（ACE / S500 / Priority0）
- service lookups 的批量封装增强
- 输出转 markdown 落盘模板
- caseworker 主流程接入
