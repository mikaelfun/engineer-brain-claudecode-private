# EOP IP 限流与信誉阻止 — 排查工作流

**来源草稿**: ado-wiki-a-Connection-Filter-Spamhaus.md, ado-wiki-a-delist-microsoft-ips.md, ado-wiki-a-ip-throttle-override-gcc.md
**场景数**: 4
**生成日期**: 2026-04-07

---

## Scenario 1: 入站 IP 被限流 (4.7.500 Server Busy / Gray-listing)
> 来源: ado-wiki-a-Connection-Filter-Spamhaus.md, ado-wiki-a-Blocked-Senders.md | 适用: Mooncake ✅

### 排查步骤
1. 确认错误信息为 4.7.500 Server busy
   - 检查发件方 SMTP 日志获取完整错误响应
2. 确认发送 IP 是否为新发件人或近期发送量激增
   - 新发件人发送大量邮件会触发 gray-listing（试用期机制）
3. 检查是否已配置 Inbound Connector
   - 如果从 on-premises 中继出站邮件经 M365，需配置 Inbound EOP Connector
   - Portal 路径: Exchange Admin Center → Mail flow → Connectors
4. 使用 Assist 365 诊断释放
   - Diag: **Release Tenant IP Server Busy**
   - 释放后 IP 获得 14 天排除期来建立信誉
5. 监控释放后邮件流是否恢复正常
   - Connector 配置是基础要求，诊断释放只是辅助措施

### 决策树


---

## Scenario 2: 入站 IP 被 Spamhaus 阻止
> 来源: ado-wiki-a-Connection-Filter-Spamhaus.md | 适用: Mooncake ✅

### 排查步骤
1. 确认阻止来源是 Spamhaus
   - 检查 SMTP 日志中的 NDR 错误响应
2. **重要**: IP Allow List 和 Transport Rule 均无法覆盖 Spamhaus 阻止
   - 这是一个常见误解，需明确告知客户
3. 指导客户直接向 Spamhaus 请求 delist
   - 访问 [Spamhaus](https://www.spamhaus.org/) 网站
4. 紧急情况（大客户受影响）的临时处理
   - 仅限战略/大座席企业客户
   - 可考虑使用 Manual List 临时覆盖
   - 参考 ICM 案例: 628014267
5. 升级路径
   - Assist 365: Exchange Online\MDO Escalations

### 决策树


---

## Scenario 3: Microsoft 出站 IP 被第三方 DNSBL 阻止
> 来源: ado-wiki-a-delist-microsoft-ips.md | 适用: Mooncake ✅

### 排查步骤
1. 确认阻止基于 Microsoft IP 地址
   - 检查实际 SMTP 响应（不要依赖 MXToolbox）
2. 确认 DNSBL 类别
   - Supported — partners: 有直接关系可 delist
   - Supported — best effort: 可尝试
   - Unsupported: 无法处理
3. 检查 IP 是否在 High-Risk Delivery Pool (HRDP)
   - 即使在 HRDP 也应尝试 delist
4. 检查 IP 是否仍在 DNSBL 中
   - Abusix: https://app.abusix.com/lookup (Support 可 delist)
   - SpamCop: https://www.spamcop.net/bl.shtml (不可 delist)
   - 0Spam: https://0spam.org/check (不可 delist)
5. 执行 delist
   - 可 delist → 转给有权限的 FTE
   - 不可 delist → 升级到 Engineering

---

## Scenario 4: GCC/H IP 限流覆盖
> 来源: ado-wiki-a-ip-throttle-override-gcc.md | 适用: Mooncake ❌ (GCC-only)

### 排查步骤
1. GCC/H 客户无法通过 Assist 诊断检查 IP Health
2. 检查 IP 是否在预覆盖列表中
   - Proofpoint 相关 IP 段已永久覆盖:
     - 66.159.224.0/19, 66.159.224.0/21
     - 148.163.128.0/19, 205.220.160.0/19
3. 如不在列表中，需走标准限流处理流程
