# EOP 恶意邮件绕过过滤 (FN) 与投递覆盖 — 排查工作流

**来源草稿**: ado-wiki-a-Troubleshooting-FP-FN.md, mslearn-eop-recommended-settings.md
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: 恶意邮件未被拦截 (False Negative)
> 来源: ado-wiki-a-Troubleshooting-FP-FN.md | 适用: Mooncake ✅

### 排查步骤
1. 对于 spoofing 场景: 分析 Authentication-Results header
2. 检查 X-Forefront-Antispam-Report:
   - `SFV` (Spam Filter Verdict) 和 `SCL` 值
3. 运行诊断 "View Filtering Details (Spam Verdict Reason)" + NMID
4. 检查 Submission 结果:
   - rescan 已重新分类 (good->bad) → filter 已更新，无需升级
   - `SCL:-1` override → **非 FN**，是配置问题
5. 查找覆盖来源:
   - Transport rule 设置 SCL=-1
   - Connection Filter IP Allow List
   - Safe Senders list / allowed domain list
6. 如确认为真正 FN → 升级到 Analysts (FPFN)
   - 提供: NMID + Submission IDs

### 决策树
```
恶意邮件到达 Inbox
├── 检查 SCL 值
│   ├── SCL=-1 → 有覆盖，非 FN
│   │   ├── Transport Rule bypass → 修改/移除规则
│   │   ├── IP Allow List → 移除不当 IP
│   │   └── Safe Senders → 移除不当发件人
│   └── SCL >= 1 → 可能是真 FN
│       ├── 提交到 Submissions → 检查 rescan 结果
│       ├── 已重新分类 → 无需升级
│       └── 未重新分类 → 升级到 Analysts (FPFN)
└── 检查 Authentication 结果
    └── 认证通过但仍是恶意 → 真 FN，需升级
```

---

## Scenario 2: 投递覆盖导致恶意邮件通过
> 来源: mslearn-eop-recommended-settings.md | 适用: Mooncake ✅

### 排查步骤
1. 识别常见不安全覆盖:
   - 过宽的 allowed sender/domain 列表
   - Transport rule 设置 SCL=-1 范围过大
   - Safe Senders list 包含不当地址
   - IP Allow List 包含不可信 IP
2. Header 标记识别:
   | Header 值 | 覆盖来源 |
   |-----------|----------|
   | SFV:SFE | Safe Sender bypass |
   | SFV:SKN | Transport rule bypass (SCL=-1) |
   | IPV:CAL | IP Allow List bypass |
3. 修复建议:
   - 使用 Config Analyzer 对齐 Microsoft 推荐配置
   - 考虑启用 Standard/Strict Preset Security Policies
   - 使用 TABL 和 Submissions 替代不安全的 allow 方式
