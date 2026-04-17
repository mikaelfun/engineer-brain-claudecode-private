# EOP Spoof Intelligence 管理指南

> Source: https://learn.microsoft.com/defender-office-365/anti-spoofing-spoof-intelligence
> Status: draft (pending SYNTHESIZE)

## 概述

Spoof intelligence 是 EOP 内置的反钓鱼功能，自动检测伪造发件人地址的邮件。合法 spoof 场景（邮件列表、代发邮件、内部应用通知）需要手动允许。

## 合法 Spoof 场景

### 内部域名
- 非 Microsoft 服务使用组织域名发送 bulk 邮件（如公司调查）
- 外部公司代发广告/产品更新
- 助理代他人发邮件
- 内部应用发送通知

### 外部域名
- 邮件列表（discussion list）中继
- 外部公司代发（SaaS 自动报告）

## 排查决策树

```
邮件被标记为 spoof → 检查 message header
├── compauth=fail, DMARC p=reject/quarantine
│   → 由 "Honor DMARC policy" 设置处理，不在 spoof intelligence insight 中
│   → 调整 anti-phishing policy 中的 DMARC 相关设置
└── compauth=fail, 非 DMARC reject/quarantine
    → 出现在 spoof intelligence insight 中
    ├── 已知合法发件人
    │   → 在 Spoof intelligence insight 中 Allow to spoof
    │   → 或在 Tenant Allow/Block List → Spoofed senders 手动添加
    └── 未知发件人
        → 检查 WhoIs 数据和发送历史
        → 确认合法后再 Allow
```

## 操作步骤

### Portal 操作
1. Defender portal → Email & collaboration → Policies & rules → Threat policies → Tenant Allow/Block Lists
2. 选择 Spoofed senders tab
3. 查看 spoof intelligence insight（7 天数据）
4. 单击条目 → Allow to spoof 或 Block from spoofing

### PowerShell 操作
```powershell
# 查看 spoof intelligence 检测结果（30天数据）
Get-SpoofIntelligenceInsight

# 手动允许 spoofed sender
New-TenantAllowBlockListSpoofItems -SpoofedUser "domain.com" -SendingInfrastructure "mailserver.com" -SpoofType External -Action Allow

# 手动阻止 spoofed sender
New-TenantAllowBlockListSpoofItems -SpoofedUser "domain.com" -SendingInfrastructure "mailserver.com" -SpoofType External -Action Block
```

## 关键概念

- **允许规则粒度**：基于 spoofed domain + sending infrastructure 的组合（如 gmail.com + tms.mx.com）
- **Spoof type**: Internal（组织 accepted domain）vs External（外部域名）
- **Action**: Allow = 通过 composite auth 即使显式认证失败; Block = 按 anti-phishing policy 配置处理
- **数据时间窗口**: Portal 7 天, PowerShell 30 天

## 注意事项

- Standard/Strict preset security policies 默认启用 anti-spoofing
- MX 指向非 Microsoft 服务时，应启用 Enhanced Filtering for Connectors 而非关闭 anti-spoofing
- 覆盖 spoof intelligence 判定后，条目从 insight 移至 Tenant Allow/Block List
