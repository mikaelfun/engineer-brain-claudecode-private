# Email Authentication (SPF/DKIM/DMARC) 排查指南

> Source: mslearn | Status: draft | Date: 2026-04-05

## 概述

EOP 使用 SPF、DKIM、DMARC 三层邮件认证机制验证发件人身份，防止 spoofing。

## 认证检查流程

```
SPF: 验证发送 IP 是否在域的 SPF 记录中授权
  ↓
DKIM: 验证邮件签名完整性（使用 DNS 公钥）
  ↓
DMARC: 要求 SPF 或 DKIM 通过且与 From 域对齐
  ↓
Composite Authentication (compauth): M365 综合判断
```

## 常见失败场景速查

### DMARC Failed
| 原因 | 修复 |
|------|------|
| SPF/DKIM 未通过且未对齐 | 发件人修复 SPF/DKIM 配置 |
| 复杂路由导致认证失败 | 收件人配置 Enhanced Filtering for Connectors |
| 中间服务修改邮件 | 配置 trusted ARC sealers |

### SPF Failed
| 错误类型 | 原因 | 修复 |
|----------|------|------|
| spf=fail | 发送 IP 未授权 | 添加 IP 到 SPF 记录 |
| spf=permerror | 超过 10 次 DNS lookup | 简化 SPF 记录 |
| spf=temperror | DNS 解析临时故障 | 检查 DNS 服务器，增大 TTL |

### DKIM Failed
| 错误类型 | 原因 | 修复 |
|----------|------|------|
| no key for signature | 公钥未发布到 DNS | 发布 DKIM CNAME/TXT 记录 |
| signature didn't verify | 签名后 header 被修改 | 配置 ARC sealers，避免修改 |
| body hash did not verify | 邮件正文被修改 | 同上 |

## DMARC 渐进部署最佳实践

1. `p=none` + 监控报告 → 了解哪些邮件流通过/失败
2. `p=quarantine` + `pct=10→25→50→100` → 逐步升级
3. `p=reject` → 最终目标

## M365 特殊行为

- M365 不发送 DMARC Forensic 报告
- MX 指向 M365 时才发送 DMARC Aggregate 报告
- Honor DMARC policy 设置在 anti-phishing policy 中控制
- Spoof intelligence 可覆盖 DMARC 结果

## Enhanced Filtering for Connectors

复杂路由场景（MX → 第三方 → M365）必须配置：
1. Defender portal → Enhanced Filtering
2. 添加所有可信中间 IP
3. 移除 SCL=-1 的 transport rule
4. 先少量用户测试，再全组织推广

## 参考
- [Security Operations guide for email authentication](https://learn.microsoft.com/defender-office-365/email-auth-sec-ops-guide)
- [Set up DMARC](https://learn.microsoft.com/defender-office-365/email-authentication-dmarc-configure)
- [Enhanced Filtering for Connectors](https://learn.microsoft.com/exchange/mail-flow-best-practices/use-connectors-to-configure-mail-flow/enhanced-filtering-for-connectors)
