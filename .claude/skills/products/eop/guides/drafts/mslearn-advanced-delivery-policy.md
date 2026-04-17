# Advanced Delivery Policy — SecOps Mailbox & Phishing Simulation Bypass

> Source: https://learn.microsoft.com/defender-office-365/advanced-delivery-policy-configure
> ID: eop-mslearn-046 | Quality: guide-draft

## 概述

Advanced delivery policy 用于配置两类 filtering bypass 场景：
1. **SecOps Mailbox** — 安全运营团队专用邮箱，接收未过滤邮件（包括恶意邮件）用于分析
2. **Non-Microsoft Phishing Simulation** — 第三方钓鱼模拟邮件，需绕过 EOP/MDO 过滤

## SecOps Mailbox 配置

### 效果
- 所有 filter 不对这些邮箱采取行动（包括 malware filtering 也被 bypass）
- ZAP 不移除邮件
- Safe Links 不阻止 URL
- Safe Attachments 不引爆附件
- 系统警报不触发

### 配置方式
- **Portal**: Security Portal → Email & collaboration → Policies & rules → Threat policies → Advanced delivery → SecOps mailbox tab
- **PowerShell**:
  ```powershell
  New-SecOpsOverridePolicy -Name SecOpsOverridePolicy -SentTo secops@contoso.com
  New-ExoSecOpsOverrideRule -Name SecOpsOverrideRule -Policy SecOpsOverridePolicy
  ```

## Phishing Simulation 配置

### 必须提供
- 至少一个 **Domain**（MAIL FROM 域或 DKIM 域）
- 至少一个 **Sending IP**（IPv4）
- 可选：Simulation URLs（用于非邮件钓鱼模拟如 Teams/Office 文档）

### 注意事项
- MX 不指向 M365 时，需确保 Authentication-results header 中的 IP 与 advanced delivery 配置匹配，可能需要 Enhanced Filtering for Connectors
- 不支持同组织内部钓鱼模拟（DIR:INT），需要专用 receive connector 或绕过 Exchange Server
- IPv6 仅 PowerShell 支持

## 其他 Filtering Bypass 场景

1. **Non-Microsoft filters (MX 不指向 M365)**: 使用 Enhanced Filtering for Connectors 或 mail flow rule bypass spam filtering
2. **False positives under review**: 通过 admin submission 临时允许，建议仅临时使用

## 排查要点
- 确认 override 正确显示在 Threat Explorer 的 System override source
- 检查 EmailEvents 中的 OrgLevelPolicy 是否包含 PhishSimulation/SecOps
- 确认 DKIM domain 与 MAIL FROM domain 的配置与实际邮件 header 一致

## 21V 适用性
✅ 适用（SecOps mailbox 和 phishing simulation 功能在 21V 可用）
