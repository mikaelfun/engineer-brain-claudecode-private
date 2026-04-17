# EOP 外部 IP 黑名单 (Spamhaus/DNSBL) 与 Delist — 排查工作流

**来源草稿**: ado-wiki-a-Connection-Filter-Spamhaus.md, ado-wiki-a-Reverse-DNS.md, ado-wiki-a-delist-microsoft-ips.md
**场景数**: 3
**生成日期**: 2026-04-07

---

## Scenario 1: 入站邮件被 Spamhaus/DNSBL 阻止
> 来源: ado-wiki-a-Connection-Filter-Spamhaus.md | 适用: Mooncake ✅

### 排查步骤
1. 确认阻止来源
   - 检查发件方 MTA 的 SMTP 日志，获取完整 NDR 响应
   - 区分 Spamhaus 阻止 vs M365 自身 IP Block List
2. **关键**: IP Allow List 和 Transport Rule 无法覆盖 Spamhaus 阻止
   - Q11 明确说明两者都不能绕过 Spamhaus 列入
3. 指导客户直接向 Spamhaus 请求 delist
   - 网站: https://www.spamhaus.org/
4. 战略大客户紧急场景
   - 可考虑 Manual List 临时覆盖（需审慎使用）
   - 仅限大座席企业客户
5. 升级路径: Assist 365 > Exchange Online\MDO Escalations

---

## Scenario 2: M365 出站 IP 被外部 DNSBL 列入
> 来源: ado-wiki-a-delist-microsoft-ips.md | 适用: Mooncake ✅

### 排查步骤
1. 确认阻止基于 Microsoft IP（检查实际 SMTP 响应，非 MXToolbox）
2. 确认 DNSBL 是否为支持的列表
   - Supported partners: 有直接 delist 关系
   - Supported best effort: 可尝试
   - Unsupported: 无法处理
3. 检查 IP 是否在 HRDP（即使在 HRDP 也应尝试 delist）
4. 查询 IP 当前状态
   - Abusix: https://app.abusix.com/lookup (可 delist)
   - SpamCop: https://www.spamcop.net/bl.shtml (不可 delist)
5. 执行 delist 或升级到 Engineering

---

## Scenario 3: Reverse DNS (PTR) 配置问题导致投递失败
> 来源: ado-wiki-a-Reverse-DNS.md | 适用: Mooncake ✅

### 排查步骤
1. 理解 FCrDNS（Forward Confirmed Reverse DNS）验证流程
   - IP -> PTR 记录 -> 主机名 -> A 记录 -> 应匹配原始 IP
2. 检查发送 IP 的 PTR 记录
   - `Resolve-DnsName -Name <IP-reversed>.in-addr.arpa -Type PTR`
3. 验证 PTR 返回的主机名的 A 记录是否指回原 IP
4. 如 PTR 缺失或不匹配
   - 指导客户联系 IP 所有者/ISP 配置正确的 PTR 记录
