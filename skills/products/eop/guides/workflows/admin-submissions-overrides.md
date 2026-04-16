# EOP 管理员提交与第三方网关覆盖 — 排查工作流

**来源草稿**: mslearn-admin-submissions-workflow.md
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: Admin Submission 工作流
> 来源: mslearn-admin-submissions-workflow.md | 适用: Mooncake ✅ (部分)

### 操作步骤
1. Portal 路径: Defender Portal > Actions & Submissions > Submissions
2. 选择 tab: Emails / URLs / Email Attachments
3. 选择提交原因:
   - "It appears to be clean" (FP)
   - "I've confirmed it's clean" (FP + 创建 allow entry)
   - "It appears suspicious" (FN)
   - "I've confirmed it's a threat" (FN + 创建 block entry)
4. 可选: 同时在 TABL 创建 allow/block entry

### Submission 结果分析
Microsoft 执行以下检查:
1. Email authentication check (SPF/DKIM/DMARC)
2. Policy hits (是否有 override 影响判定)
3. Payload reputation/detonation (URL 和附件深度分析) — GCC 不可用
4. Grader analysis (人工审查) — GCC 不可用

### 常见结果处理
| 结果 | 含义 | 处理 |
|------|------|------|
| No threats found | 邮件安全 | 等待 filter 学习 或 手动 block |
| Threats found | 邮件恶意 | Filter 会更新 或 手动 allow |
| Allowed due to org overrides | 组织覆盖 | 检查 IP Allow/Transport Rules/TABL |
| Allowed due to user overrides | 用户覆盖 | 检查 Safe Senders/Junk config |
| Authentication failed | 认证失败 | 检查 SPF/DKIM/DMARC |

---

## Scenario 2: User Reported Settings 配置
> 来源: mslearn-admin-submissions-workflow.md | 适用: Mooncake ❌ (21V 后端不可用)

### 配置路径
Settings > Email & Collaboration > User reported settings

### 选项
- **Microsoft + Reporting Mailbox** (默认推荐)
- **仅 Reporting Mailbox** (需管理员手动转交)
- **仅 Microsoft**

### PowerShell 检查
```powershell
Get-ReportSubmissionPolicy
Get-ReportSubmissionRule
```
