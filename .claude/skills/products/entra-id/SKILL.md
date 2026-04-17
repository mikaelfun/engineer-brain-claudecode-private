# Entra ID 产品排查 Skill

> 覆盖 Microsoft Entra ID（原 Azure AD）：登录、条件访问、MFA、AAD Connect、应用注册。

## 1. 诊断层级

```
Layer 1: ESTS (Enterprise STS)
  ├─ 关键表: PerRequestTableIfx, DiagnosticTracesIfx
  └─ 用途: 登录请求追踪、token 颁发

Layer 2: MSODS (目录服务)
  ├─ 关键表: IfxAuditLoggingCommon, IfxBECAuthorizationManager, IfxUlsEvents
  └─ 用途: 审计日志、授权决策

Layer 3: AAD Gateway
  ├─ 关键表: RequestSummaryEventCore
  └─ 用途: 网关层请求汇总、限流检测

Layer 4: SAS (Security & Authentication)
  ├─ 关键表: SASRequestEvent, SASCommonEvent, CappWebSvcRequest
  └─ 用途: MFA、SSPR、FIDO2
```

## 2. 决策树

### 登录失败
```
用户无法登录
  ├─→ ESTS 查 PerRequestTableIfx by correlationId → 请求追踪
  │     ├─ AADSTS50076 → MFA 要求 → 检查条件访问策略
  │     ├─ AADSTS50105 → 用户未分配到应用
  │     ├─ AADSTS700016 → 应用不存在/不在租户中
  │     ├─ AADSTS53003 → 条件访问阻止
  │     └─ 其他 AADSTS → 解码错误码
  ├─→ 需要条件访问详情 → 查 DiagnosticTracesIfx
  └─→ msft-learn: "AADSTS {errorCode}"
```

### MFA 问题
```
MFA 异常
  ├─→ SAS 查 SASRequestEvent → MFA 请求详情
  ├─→ 分析 MFA 方式（Push/SMS/TOTP/FIDO2）
  └─→ 如果是 NPS Extension → 检查 NPS 配置
```

## 3. 可用工具链

- **Kusto**: `.claude/skills/kusto/entra-id/` (4 DB: ESTS, MSODS, AADGatewayProd, idmfacne)
- **ADO Wiki**: "AADSTS", "Conditional Access", "MFA"
- **msft-learn**: Entra ID 错误码文档

## 4. 已知问题库

| 错误码 | 含义 | 解决方案 |
|--------|------|---------|
| AADSTS50076 | 需要 MFA | 完成 MFA 挑战 |
| AADSTS50105 | 用户未分配 | 在企业应用中分配用户 |
| AADSTS53003 | 条件访问阻止 | 检查 CA 策略 |
| AADSTS700016 | 应用 ID 不存在 | 确认 client_id 和 tenant_id |
| AADSTS90072 | 租户不存在 | 确认 tenant_id |

---

## Knowledge Base Assets

> Auto-enriched from 5 sources: ADO Wiki, MS Learn, OneNote, ContentIdea KB, 21V Gap Analysis.
> Last synthesized: 2026-04-07

### Directory Structure

```
.claude/skills/products/entra-id/
  known-issues.jsonl          3688 entries (structured break/fix triples)
  guides/
    _index.md                 Topic index (37 topics)
    {topic-slug}.md           37 speed-reference tables (symptom/cause/solution + scores)
    details/{topic-slug}.md   36 fusion troubleshooting guides (full KQL + decision trees)
    drafts/*.md               1346 raw extraction drafts (source material, do not delete)
    conflict-report.md        Cross-source contradiction report
  .enrich/                    Enrichment state (progress, scanned records, evolution log)
```

### How to Use

**Troubleshooter Integration (Step 1.5)**:
1. Read `guides/_index.md` to find matching topic by symptom keywords
2. Read the speed-reference `guides/{topic}.md` for quick symptom-cause-solution lookup
3. If the topic has a fusion guide, read `guides/details/{topic}.md` for full KQL queries and decision trees
4. Fallback to `known-issues.jsonl` keyword search if no topic matches
5. Final fallback: RAG / MS Learn search

**Score Legend** (in speed-reference tables):
| Score | Icon | Meaning |
|-------|------|---------|
| 8-10  | Green circle  | Directly trustworthy |
| 5-7.9 | Blue circle  | Reference, verify key steps |
| 3-4.9 | Yellow circle  | Directional only |
| 0-2.9 | White circle  | Possibly outdated |

**Source Priority**: OneNote(5) > ADO Wiki(4) > ContentIdea KB(3) > MS Learn(2) > Case(1)

### Maintenance

- New knowledge: `/product-learn add entra-id` or auto-enriched via `/product-learn auto-enrich`
- Re-synthesize after significant new entries: `/product-learn synthesize entra-id`
- Promote high-confidence entries to this SKILL.md: `/product-learn promote entra-id`
