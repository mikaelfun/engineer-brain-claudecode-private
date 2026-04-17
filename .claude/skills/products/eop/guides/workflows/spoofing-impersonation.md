# EOP 仿冒与用户/域名冒充检测 — 排查工作流

**来源草稿**: ado-wiki-a-Spoofing-Impersonation.md, mslearn-spoof-intelligence-management.md
**场景数**: 4
**生成日期**: 2026-04-07

---

## Scenario 1: 邮件被标记为 Spoofing (CAT:SPOOF)
> 来源: ado-wiki-a-Spoofing-Impersonation.md | 适用: Mooncake ❌ (21V 无 Spoof Intelligence)

### 排查步骤
1. 检查 X-Forefront-Antispam-Report header
   - 确认 `CAT:SPOOF` 存在
2. 检查 Authentication-Results header
   - 确认 SPF/DKIM/DMARC 结果和 compauth
3. 如果是合法发件人被误标:
   - 方法1: Spoof Intelligence insight 页面 Allow to spoof
     - Portal: https://security.microsoft.com/spoofintelligence
   - 方法2: Tenant Allow/Block Lists > Spoofed senders tab 手动添加
     - Portal: https://security.microsoft.com/tenantAllowBlockList?viewid=SpoofItem

### 决策树
```
CAT:SPOOF 出现
├── compauth=fail + DMARC p=reject/quarantine
│   → 由 Anti-phishing policy 的 Honor DMARC 设置处理
│   → 不在 Spoof Intelligence insight 中显示
├── compauth=fail + 非 DMARC reject/quarantine
│   → 出现在 Spoof Intelligence insight (7天数据)
│   ├── 已知合法发件人 → Allow to spoof
│   └── 未知发件人 → 检查 WhoIs 数据和发送历史
└── 合法应用/第三方代发
    → 添加到 Spoof Intelligence allow 或 TABL spoofed senders
```

---

## Scenario 2: User Impersonation (CAT:UIMP)
> 来源: ado-wiki-a-Spoofing-Impersonation.md | 适用: Mooncake ❌ (需 MDO P1/P2)

### 排查步骤
1. 确认 `CAT:UIMP` 在 X-Forefront-Antispam-Report header
2. 检查 Anti-phishing policy 中的 Protected users 列表
   - Portal: https://security.microsoft.com/antiphishing
3. 如果 CEO 从个人邮箱发邮件触发 UIMP:
   - 将个人邮箱地址添加到 Safe Senders list
4. 配置建议:
   - 添加高管和高风险用户到 Protected users (最多 350 人)
   - 启用 Mailbox Intelligence 利用发送历史关系
   - CAT:GIMP = Graph Impersonation (通过 mailbox intelligence 检测)

---

## Scenario 3: Domain Impersonation (CAT:DIMP)
> 来源: ado-wiki-a-Spoofing-Impersonation.md | 适用: Mooncake ❌ (需 MDO P1/P2)

### 排查步骤
1. 确认 `CAT:DIMP` 在 X-Forefront-Antispam-Report header
2. 检查 Anti-phishing policy 中的 Protected domains 列表
   - 包括: Include domains I own + Include custom domains
3. 域名冒充检测示例:
   - 合法域: contoso.com
   - 冒充域: ntoso.com, ontoso.com

---

## Scenario 4: Spoof Intelligence 管理 (PowerShell)
> 来源: mslearn-spoof-intelligence-management.md | 适用: Mooncake ❌

### 操作步骤
1. 查看检测结果 (30天数据):
   ```powershell
   Get-SpoofIntelligenceInsight
   ```
2. 手动允许:
   ```powershell
   New-TenantAllowBlockListSpoofItems -SpoofedUser "domain.com" -SendingInfrastructure "mailserver.com" -SpoofType External -Action Allow
   ```
3. 手动阻止:
   ```powershell
   New-TenantAllowBlockListSpoofItems -SpoofedUser "domain.com" -SendingInfrastructure "mailserver.com" -SpoofType External -Action Block
   ```
4. 关键概念:
   - 允许规则粒度: spoofed domain + sending infrastructure 组合
   - SpoofType: Internal (accepted domain) vs External
   - Portal 数据: 7天; PowerShell 数据: 30天
