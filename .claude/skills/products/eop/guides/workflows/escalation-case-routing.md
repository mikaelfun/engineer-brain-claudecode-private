# EOP 升级流程与案例路由 — 排查工作流

**来源草稿**: ado-wiki-a-collaboration-guidelines-mdo-exo.md, ado-wiki-a-when-to-collab-and-when-to-transfer.md, ado-wiki-a-handling-dcr-and-code-fixes.md, ado-wiki-a-migration-to-icm.md, ado-wiki-a-icm-remediation-details.md, ado-wiki-b-SEV-B-24x7-Engagement-Escalation-Guidelines.md, ado-wiki-b-MDO-Escalations-Prerequisites-Checklist.md, 等
**场景数**: 3
**生成日期**: 2026-04-07

---

## Scenario 1: MDO vs EXO 协作与路由
> 来源: ado-wiki-a-collaboration-guidelines-mdo-exo.md | 适用: Mooncake ✅

### 判断规则
- **MDO 拥有**: 认证和保护相关问题
  - "为什么恶意邮件绕过了防护?"
  - SPF/DKIM/DMARC, filtering, Defender policy
- **EXO 拥有**: 功能和配置相关问题
  - "如何阻止 Direct Send?"
  - Connectors, transport rules, mail flow configuration

### 协作原则
- **优先协作而非转移** → 减少 case 重新分配
- MDO 发起 → 保留 ownership → 请求 EXO 配置支持
- EXO 发起 → 保留 ownership → 请求 MDO 安全分析

---

## Scenario 2: MDO Engineering 升级
> 来源: ado-wiki-b-MDO-Escalations-Prerequisites-Checklist.md | 适用: Mooncake ✅

### 升级路径
| 路径 | 严重级别 |
|------|----------|
| Exchange Online/MDO Escalations [CFL/PSI/CRITSIT ONLY] | Sev 2 IcM |
| Exchange Online/MDO Escalations [ISSUE/RFC/DCR] | Sev 3 IcM |

### 升级前检查
1. 排除配置问题 (运行诊断, 检查 policy 设置)
2. 收集必要数据:
   - Network Message IDs
   - Submission IDs
   - Tenant ID
   - 诊断输出
3. SAP 保持最新
4. 日志在 30 天后过期 — 及时升级

---

## Scenario 3: Case 范围判定 (Misroute 检测)
> 来源: ado-wiki-a-Exchange-Online-Determining-Scope.md 等 | 适用: Mooncake ✅

### 常见 Misroute 场景
| 场景 | 正确路由 |
|------|----------|
| Exchange On-Premise 问题 | EXO on-prem team |
| Outlook Desktop 问题 | Outlook team |
| SharePoint/OneDrive 问题 | SPO team |
| Azure Permissions 问题 | Entra ID team |
| SIEM Connectors 问题 | Sentinel/SIEM team |
| Defender for Cloud Apps | MDA team |
| Defender for Identity | MDI team |

### 判断依据
- 检查 SAP 是否与实际问题范围匹配
- 如不匹配 → 调整 SAP 或转移到正确团队
