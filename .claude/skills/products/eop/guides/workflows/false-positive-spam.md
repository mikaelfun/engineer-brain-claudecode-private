# EOP 合法邮件误判为垃圾邮件/钓鱼 (FP) — 排查工作流

**来源草稿**: ado-wiki-a-Troubleshooting-FP-FN.md, ado-wiki-a-Triage-FPFN-Diagnostics.md, ado-wiki-b-Advanced-Spam-Filtering.md, ado-wiki-a-Safety-Tips.md, ado-wiki-a-fnfp-pcms-reviews.md
**场景数**: 3
**生成日期**: 2026-04-07

---

## Scenario 1: 入站邮件 FP 排查
> 来源: ado-wiki-a-Troubleshooting-FP-FN.md | 适用: Mooncake ✅

### 排查步骤
1. 确认 Ticket 所有权
   - 发件人不使用 M365 → 不应由发件人提 ticket
   - 收件人租户使用 MDO/内置安全 → 收件人负责
2. 零星 FP: 通过 Submission portal 提交 + TABL 临时 allow
3. 大范围 FP: 收集 Network Message ID (NMID) 和 Submission ID
4. 检查 X-Forefront-Antispam-Report header:
   - `SFV` (Spam Filter Verdict) 和 `CAT` (Category)
5. 如果 `SFV:NSPM + CAT:None` 但到了 Junk:
   - 检查 X-Microsoft-Antispam-Mailbox-Delivery
   - `ucf:1` 或 `OFR:CustomRules` → Inbox rule 导致，非 FP
6. 检查 Authentication-Results 中 SPF/DKIM/DMARC 失败

### 何时升级
1. 运行 Assist 诊断:
   - "View Filtering Details (Spam Verdict Reason)"
   - "Review Details of a Submission"
2. 检查 Submission 结果
3. 如 filter 未更新 → 升级到 Analysts (FPFN)
   - 路径: Exchange Online/Analysts (FPFN)
   - 必须包含: SubmissionIds + NetworkMessageIds (每行1个，最多10个)

### 决策树
```
邮件到 Junk/Quarantine
├── 检查 X-Forefront-Antispam-Report
│   ├── CAT:SPOOF → 转 Spoofing 排查
│   ├── CAT:UIMP/DIMP/GIMP → 转 Impersonation 排查
│   ├── CAT:SPM/HSPM → Spam/High confidence spam
│   │   ├── 运行 FPFN 诊断 → 检查 Triage status
│   │   ├── 自动分类已修正 → 无需升级
│   │   └── 未修正 → 升级到 Analysts (FPFN)
│   └── SFV:NSPM + CAT:None → 检查 mailbox rules/junk email config
├── 检查 Authentication-Results
│   └── auth 失败 → 发件人需修复 SPF/DKIM/DMARC
└── 检查 overrides
    └── SCL=-1 但仍被拦截 → 检查 Secure by Default (HPHISH/Malware 不可绕过)
```

---

## Scenario 2: 出站邮件 FP
> 来源: ado-wiki-a-Troubleshooting-FP-FN.md | 适用: Mooncake ✅

### 排查步骤
1. 收集样本: 通过 Outbound spam BCC alerting 获取
   - 仅 default policy 支持 BCC alerting
2. 检查 X-Forefront-Antispam-Report header:
   - `DIR:OUT` (出站), `CAT:OSPM` (出站 spam), `SFP:1501` (出站池标记)
3. 提交为 FP
4. 如 "Threats found" 持续 → 升级

---

## Scenario 3: ASF (Advanced Spam Filtering) 导致 FP
> 来源: ado-wiki-b-Advanced-Spam-Filtering.md | 适用: Mooncake ✅

### 排查步骤
1. 检查 X-CustomSpam header → 确认哪个 ASF 规则触发
2. ASF 功能**不建议使用** — 常导致 FP
3. 特别是 SPF Hard Fail ASF 应禁用
   - 推荐使用 Spoof Intelligence 替代
4. 修复: 关闭触发 FP 的 ASF 选项
   - Portal: Anti-spam policy → Spam properties → ASF settings
