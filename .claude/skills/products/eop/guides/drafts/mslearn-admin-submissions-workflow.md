# EOP Admin Submissions & User Reported Messages 工作流指南

> Source: mslearn | Status: draft | Date: 2026-04-05

## 概述

Microsoft 365 组织中的管理员和用户可以通过多种方式向 Microsoft 提交可疑邮件进行分析。本指南梳理完整的 submission 工作流。

## 用户报告方式

| 方法 | 类型 | 说明 |
|------|------|------|
| Outlook 内置 Report 按钮 | User | 支持 Report as Phishing / Junk / Not Junk |
| Submissions 页面 | Admin | 提交 FP/FN 邮件、附件、URL |
| 隔离区释放时报告 | Admin/User | 释放时可选择 "Report message as having no threats" |

## Admin Submission 流程

1. **Defender Portal** → Actions & Submissions → Submissions
2. 选择 tab（Emails / URLs / Email Attachments）
3. 选择 "Submit to Microsoft for analysis"
4. 选择原因：
   - "It appears to be clean" (FP)
   - "I've confirmed it's clean" (FP + 可创建 allow entry)
   - "It appears suspicious" (FN)
   - "I've confirmed it's a threat" (FN + 可创建 block entry)
5. 可选：在 Tenant Allow/Block List 创建 allow/block entry

## User Reported Settings 配置

管理员配置 user reported messages 的去向：
- **Microsoft + Reporting Mailbox**（默认推荐）
- **仅 Reporting Mailbox**（需管理员手动转交 Microsoft）
- **仅 Microsoft**

路径：Settings → Email & Collaboration → User reported settings

## Submission 结果分析

Microsoft 对提交的项目执行以下检查：

1. **Email authentication check** — SPF/DKIM/DMARC/composite auth
2. **Policy hits** — 是否有 policy/override 影响过滤判定
3. **Payload reputation/detonation** — URL 和附件深度分析
4. **Grader analysis** — 人工审查确认是否恶意

> ⚠️ GCC/GCC High/DoD 环境仅执行 1 和 2，不执行 3 和 4。

## 常见结果及含义

| Result | 含义 | 处理建议 |
|--------|------|----------|
| No threats found | 邮件安全 | 等待 filter 学习，或手动添加 block entry |
| Threats found | 邮件恶意 | Filter 会更新，或手动添加 allow entry |
| Allowed due to org overrides | 组织设置覆盖了过滤 | 检查 IP Allow List / Transport Rules / TABL |
| Allowed due to user overrides | 用户设置覆盖了过滤 | 检查 Safe Senders / Junk Email Config |
| Authentication failed | 认证失败 | 检查 SPF/DKIM/DMARC 配置 |
| Spoofed message | 伪造发件人 | 检查 Spoof Intelligence 设置 |
| Bulk | 批量邮件 | 调整 BCL 阈值 |
| Verdict lost in transit | Hybrid 路由丢失判定 | 检查 hybrid 配置 |

## Admin Review Notification

管理员可在 User reported tab 审查后向用户发送结果通知：
- Mark as: No threats found / Phishing / Spam
- 可自定义通知邮件模板和品牌

## Tenant Allow/Block List 联动

通过 submission 创建的 allow entry：
- 默认有效期：45 days after last used date
- 可选：1天/7天/30天/指定日期
- Spoofed sender entries 永不过期
- 同一 domain 有 ≥7 个 email allow entries 时自动合并为 domain entry

## 关键 PowerShell

```powershell
# 查看 user reported settings
Get-ReportSubmissionPolicy
Get-ReportSubmissionRule

# 查看 submission 状态
Get-SubmissionResult -SubmissionId <id>
```
