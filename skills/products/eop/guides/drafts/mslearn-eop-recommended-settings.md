# EOP 推荐安全策略设置参考指南（Standard vs Strict）

> Source: mslearn | Status: draft | Date: 2026-04-05

## 概述

Microsoft 提供 Standard 和 Strict 两个安全级别的 Preset Security Policies，以及详细的推荐设置参考。本指南汇总关键差异和排查要点。

## Preset Security Policy 层级

| 层级 | 说明 | 适用场景 |
|------|------|----------|
| Built-in protection | 基础 Safe Links + Safe Attachments（MDO） | 所有未被其他策略覆盖的用户 |
| Standard | 平衡过滤 | 大多数用户 |
| Strict | 严格过滤 | 高价值/高风险用户（VIP、财务等） |

## 策略优先级（从高到低）

1. **Custom policies**（用户自定义策略）
2. **Standard preset security policy**
3. **Strict preset security policy**
4. **Built-in protection preset security policy**
5. **Default policy**（最低优先级）

> ⚠️ 用户被多个策略覆盖时，**最高优先级策略**生效。Custom policy 总是优先于 preset policy。

## 关键设置差异（Anti-Spam）

| 设置 | Default | Standard | Strict |
|------|---------|----------|--------|
| Spam action | Move to Junk Email | Move to Junk Email | Quarantine |
| High confidence spam | Move to Junk Email | Quarantine | Quarantine |
| Phishing | Quarantine | Quarantine | Quarantine |
| High confidence phishing | Quarantine | Quarantine | Quarantine |
| Bulk (BCL threshold) | 7 | 6 | 5 |
| Bulk action | Move to Junk Email | Move to Junk Email | Quarantine |

## 前置条件：Email Authentication

在调整 threat policies 前，必须先确保 email authentication 正确配置：

1. **SPF** — 授权合法发送源
2. **DKIM** — 签名验证
3. **DMARC** — 策略执行

> 如果 SPF/DKIM/DMARC 缺失或配置错误，即使使用推荐设置，合法邮件仍可能被误判。

## 启用 Preset Security Policy

### Portal 方式
Defender Portal → Email & Collaboration → Policies & Rules → Threat Policies → Preset Security Policies

### PowerShell 方式

```powershell
# 查看当前状态
Get-EOPProtectionPolicyRule -Identity "Standard Preset Security Policy" | FL Name, State
Get-EOPProtectionPolicyRule -Identity "Strict Preset Security Policy" | FL Name, State

# 启用 Standard (EOP only)
Enable-EOPProtectionPolicyRule -Identity "Standard Preset Security Policy"

# 启用 Standard (EOP + MDO)
Enable-EOPProtectionPolicyRule -Identity "Standard Preset Security Policy"
Enable-ATPProtectionPolicyRule -Identity "Standard Preset Security Policy"

# 配置 exceptions
Set-EOPProtectionPolicyRule -Identity "Standard Preset Security Policy" -ExceptIfSentToMemberOf "Executives"
```

## 常见排查场景

### 1. Preset policy 不生效
- 检查用户是否被 custom policy 覆盖（优先级更高）
- 确认 rule 状态为 Enabled
- 验证用户在 policy 的 recipient 范围内

### 2. Standard 和 Strict 冲突
- 用户应只在一个 preset policy 中
- 使用 exceptions 排除不适用的用户

### 3. Built-in protection 不生效
- 确认用户未被 Standard/Strict/custom Safe Links/Safe Attachments 覆盖
- Built-in protection 优先级最低

## 验证方法

| 验证目标 | 方法 |
|----------|------|
| Standard 生效 | Spam 邮件 → Junk Email folder |
| Strict 生效 | Spam 邮件 → Quarantine |
| Standard BCL | BCL ≥ 6 → Junk Email |
| Strict BCL | BCL ≥ 5 → Quarantine |
