# EOP DMARC/CompAuth 与 ARC 信任链 — 排查工作流

**来源草稿**: ado-wiki-a-email-authentication-spf-dkim-dmarc.md, ado-wiki-a-Spoofing-Impersonation.md
**场景数**: 3
**生成日期**: 2026-04-07

---

## Scenario 1: DMARC Fail 导致邮件被拦截
> 来源: ado-wiki-a-email-authentication-spf-dkim-dmarc.md | 适用: Mooncake ✅ (基础功能)

### 排查步骤
1. 检查 Authentication-Results header
   - `dmarc=fail action=quarantine/reject header.from=domain.com`
   - `compauth=fail reason=000`
2. 理解 DMARC 通过条件 (满足任一即可):
   - SPF pass + From 域与 MailFrom 域对齐
   - DKIM pass + DKIM 签名域 (d=) 与 From 域对齐
3. 检查对齐模式
   - Relaxed: 允许子域名 (contoso.com 对齐 sub.contoso.com)
   - Strict: 要求精确匹配
4. 常见失败原因:
   - 转发场景: 邮件经中间服务转发后 SPF 失败且 DKIM 签名被破坏
   - 修复: 配置 Enhanced Filtering for Connectors 或 trusted ARC sealers
5. EOP 处理 DMARC 结果:
   | DMARC 结果 | p= 策略 | EOP 动作 |
   |------------|---------|----------|
   | Fail | reject | 标记 spam, PCL 8 |
   | Fail | quarantine | 标记 spam |
   | Fail | none | 无动作 |
   | bestguesspass | - | 无动作 |

---

## Scenario 2: CompAuth 失败但 DMARC 无策略
> 来源: ado-wiki-a-email-authentication-spf-dkim-dmarc.md, ado-wiki-a-Spoofing-Impersonation.md | 适用: Mooncake ✅

### 排查步骤
1. 检查 compauth 结果和 reason code
   - `compauth=fail reason=000` -> 显式认证失败
   - `compauth=fail` 不直接导致阻止，EOP 使用整体评估
2. 如果 CAT:SPOOF 出现在 X-Forefront-Antispam-Report
   - 邮件被标记为 spoofing
   - 动作由 Anti-phishing policy 中的 spoof 设置决定
3. 合法场景（如内部应用发送通知）:
   - 在 Spoof Intelligence insight 中 Allow to spoof
   - 或在 TABL > Spoofed senders 手动添加
   - Portal 路径: Defender portal > Tenant Allow/Block Lists > Spoofed senders tab

---

## Scenario 3: DMARC 渐进部署
> 来源: ado-wiki-a-email-authentication-spf-dkim-dmarc.md | 适用: Mooncake ✅

### 部署步骤
1. 确保 SPF 记录配置正确 (使用 `-all`)
2. 配置 DKIM 签名
3. 发布 DMARC `p=none` 策略:
   `v=DMARC1;p=none;pct=100;rua=mailto:mailbox@contoso.com`
4. 创建 transport rule 报告失败 (BCC/incident report)
5. 等待约 1 周，审查误报，调整 SPF
6. 逐步升级: `p=quarantine` (pct=10->25->50->100) -> `p=reject`

### 关键注意事项
- 父域 DMARC 策略适用于所有子域（除非子域有自己的记录）
- 子域可在父记录中使用 `sp=none/reject/quarantine`
- onmicrosoft.com 域: SPF 自动配置，DKIM 自动签名
- M365 不发送 DMARC Forensic 报告
- MX 指向 M365 时才发送 DMARC Aggregate 报告
