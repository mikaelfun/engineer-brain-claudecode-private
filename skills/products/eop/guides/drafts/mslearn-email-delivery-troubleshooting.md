# M365 邮件投递问题排查指南

> Source: https://learn.microsoft.com/troubleshoot/exchange/email-delivery/email-delivery-issues
> Status: draft (pending SYNTHESIZE)

## 概述

用户报告未收到邮件时的系统化排查流程，从简单到深入逐步排查。

## 排查决策树

```
用户报告未收到邮件
├── 仅单个用户受影响
│   ├── Step 1: 检查 OWA (5min)
│   │   ├── OWA 能看到邮件 → 客户端问题（Outlook profile/rules）
│   │   └── OWA 也看不到 → 继续排查
│   ├── Step 2: 运行 SaRA (Support and Recovery Assistant) (10min)
│   │   └── 自动检测 licensing/profile/版本等常见问题
│   └── Step 3: 管理员工具排查
│       ├── 检查 M365 Service Health → Exchange Online 是否降级
│       ├── 运行 Email Delivery Troubleshooter（M365 Admin Center 自动诊断）
│       └── 使用 Message Trace (15min)
└── 多用户受影响
    └── 检查 M365 Service Health → 服务事件
```

## Message Trace 使用要点

### 基本操作
1. Exchange Admin Center → Mail flow → Message trace
2. 设置日期范围、发件人、收件人
3. 查看 STATUS 列：Delivered / Failed / Pending / Quarantined

### 常见问题解答
| 问题 | 答案 |
|------|------|
| 发送后多久能在 trace 中看到 | 10 分钟 ~ 1 小时 |
| 超过 7 天的数据 | 需要运行下载报告（CSV），最多 1 小时出结果 |
| Trace 超时 | 简化搜索条件（缩小时间范围/指定发件人） |
| 超过 7 天的 trace 报告 | 自动删除，无法手动删除 |

### 邮件延迟的可能原因
1. 目标服务器无响应（最常见）
2. 大附件处理耗时
3. 服务延迟
4. 被过滤服务阻止

### Message Trace 结果中的关键字段
- **custom_data (S:SFA=...)**: Spam filter agent 数据
  - SFV: Spam filtering verdict
  - SCL: Spam confidence level
  - BCL: Bulk complaint level
  - CIP: Client IP
  - CTRY: Source country
- **custom_data (S:AMA=...)**: Malware filter agent 数据

## 邮件未投递的常见原因

1. 被 spam filter 检测并隔离
2. 匹配 transport rule 被隔离
3. 被 connector 重定向
4. 被 malware filter 拒绝
5. 被 transport rule 拒绝（action=Reject / ForceTLS 失败）
6. 等待 moderation 审批
7. 投递失败（目标不可达 / 目标拒绝 / 超时）
8. 投递后被 inbox rule 删除

## 排查步骤建议

1. 运行 Message Trace → 定位邮件状态
2. 状态为 Failed → 查看详情中的错误代码
3. 状态为 Quarantined → 检查隔离原因（spam/malware/rule）
4. 状态为 Delivered → 检查收件人 inbox rules / Junk folder
5. 找不到邮件 → 确认发件人确实已发送（检查发件人 Sent Items）
