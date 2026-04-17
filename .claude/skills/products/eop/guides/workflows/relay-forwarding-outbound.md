# EOP 中继/转发/外发路由与 HRDP — 排查工作流

**来源草稿**: ado-wiki-a-Relay-Pools.md, mslearn-email-forwarding-alert-investigation.md, mslearn-email-delivery-troubleshooting.md
**场景数**: 3
**生成日期**: 2026-04-07

---

## Scenario 1: 邮件通过 Relay Pool 发送导致投递问题
> 来源: ado-wiki-a-Relay-Pools.md | 适用: Mooncake ✅

### 排查步骤
1. 确认邮件是否通过 Relay Pool 发送:
   - 检查出站 IP 是否在 40.95.0.0/16 范围
   - Header: `X-MS-Exchange-AntiSpam-Relay: 1` (内部方法)
   - Message trace CustomData: OutboundIpPool = 1022 (Normal Relay) 或 1023 (HighRisk Relay)
2. 理解 Relay Pool 规则 — 邮件进入 Relay Pool 的条件:
   - 发送域非 Accepted Domain
   - SPF 未通过
   - DKIM 未通过
   - **满足任一条件即可跳过 Relay Pool**
3. 修复方案:
   - 添加发送域为 Accepted Domain
   - 配置 SPF 记录使入站 SPF 通过
   - 配置 DKIM 签名
   - 子域场景: 选择 "Accept Mail from All Subdomains" 或添加子域
   - MX 指向第三方: 启用 Enhanced Filtering for Connectors

### IP 池类型速查
| IP Partition | 用途 |
|-------------|------|
| 1101/1102 | Enterprise Normal Pool |
| 1501 | Enterprise HighRisk Pool |
| 1022 | Normal Relay Pool |
| 1023 | HighRisk Relay Pool |
| 1701 | LowRisk Pool |

---

## Scenario 2: 外部转发被阻止 (5.7.520)
> 来源: ado-wiki-a-Relay-Pools.md | 适用: Mooncake ✅

### 排查步骤
1. 错误: `550 5.7.520 Access denied, Your organization does not allow external forwarding`
2. 转发设置位置:
   - Portal: Microsoft 365 Defender > Email & collaboration > Policies & rules > Threat policies > Anti-spam > Outbound spam policy
3. 设置含义:
   - **Automatic - System-controlled** (默认): 等同于 Off (2021年起)
   - **On**: 允许自动外部转发
   - **Off**: 禁止所有自动外部转发
4. 推荐做法:
   - Default policy 保持 Off (防数据泄露)
   - 仅对特定用户/组/域在 custom outbound policy 中设 On
5. 查看自动转发报告:
   - https://admin.exchange.microsoft.com/#/reports/autoforwardedmessages

---

## Scenario 3: 可疑邮件转发调查
> 来源: mslearn-email-forwarding-alert-investigation.md | 适用: Mooncake ✅ (部分)

### 排查步骤
1. 确认转发类型:
   | 类型 | 方法 | 检测位置 |
   |------|------|----------|
   | ETR | Exchange Transport Rules | EAC > Mail flow > Rules |
   | SMTP | Set-Mailbox 转发 | EAC > Mailbox > Email forwarding |
   | InboxRule | Outlook Inbox rules | `Get-InboxRule -Mailbox <UPN> -IncludeHidden` |
2. 判断账户是否被入侵:
   - 检查 sign-in logs 异常 IP/位置/时间
   - 使用 Threat Explorer 检查发送的邮件
3. 判断转发是否恶意:
   - 检查转发收件人
   - 查找基于关键词的规则 (invoice, phish, do not reply)
4. 如确认入侵:
   - [Responding to a Compromised Email Account](https://learn.microsoft.com/defender-office-365/responding-to-a-compromised-email-account)
