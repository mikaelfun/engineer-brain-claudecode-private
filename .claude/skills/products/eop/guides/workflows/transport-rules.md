# EOP 传输规则 (Mail Flow Rules) 问题 — 排查工作流

**来源草稿**: mslearn-mail-flow-rules-set-scl.md
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: Transport Rule SCL 设置问题
> 来源: mslearn-mail-flow-rules-set-scl.md | 适用: Mooncake ✅

### 排查步骤
1. 理解 SCL 值与行为:
   | SCL 值 | 含义 | 默认行为 |
   |--------|------|----------|
   | -1 | Bypass spam filtering | 投递到 Inbox |
   | 0-4 | 送入 spam filtering | 由 spam filtering 决定 |
   | 5-6 | 标记为 Spam | 移至 Junk 或 Quarantine |
   | 7-9 | High confidence spam | Quarantine |
2. **关键限制**:
   - SCL=-1 bypass **不能绕过** HPHISH 和 Malware (Secure by Default)
   - 例外: MX 不指向 M365 时，HPHISH 可被 bypass 到达 Inbox
3. 常见排查场景:
   - 合法邮件被误标 spam → 检查是否有 transport rule 不当设置 SCL 5+
   - 垃圾邮件绕过 → 检查是否有 SCL=-1 规则范围过宽
   - 第三方过滤 + EOP 双重扫描 → 应使用 Enhanced Filtering for Connectors

---

## Scenario 2: Transport Rule 最佳实践
> 来源: mslearn-mail-flow-rules-set-scl.md | 适用: Mooncake ✅

### 建议
1. 不要用 mail flow rules bypass SecOps 或 phishing simulation → 使用 Advanced Delivery Policy
2. Bypass 规则应使用多个条件 → 不要只匹配 sender address/domain
3. 第三方过滤服务场景 → 优先使用 Enhanced Filtering for Connectors
4. SCL=6 用于 on-prem hybrid → cloud spam verdict 传递到 on-prem

### 配置路径 (EAC)
1. EAC > Mail flow > Rules > Add a rule
2. Apply this rule if: 选择匹配条件
3. Do the following: Modify the message properties > Set the spam confidence level (SCL)
