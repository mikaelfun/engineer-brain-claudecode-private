# EOP 连接筛选与 IPv6 入站限制 — 排查工作流

**来源草稿**: ado-wiki-a-Connection-Filter-Spamhaus.md
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: Connection Filter IP Allow/Block List 配置问题
> 来源: ado-wiki-a-Connection-Filter-Spamhaus.md | 适用: Mooncake ✅

### 排查步骤
1. 确认基本规则:
   - IP Allow List: 跳过 spam filtering，但仍检查 malware 和 HPHISH
   - IP Block List: 在边缘拒绝，不出现在 message trace
   - **IPv6 不支持** Connection Filter → 使用 TABL 管理 IPv6
   - CIDR 仅支持 /24 到 /32
   - Allow 和 Block 同时存在 → **Allow 优先**
   - 最多 1273 条目
2. Enhanced Filtering for Connectors (EFC) 对 IP Allow 的影响:
   - EFC 启用后，connecting IP (CIP) 不再与 IP Allow/Block List 匹配
   - 但 skip-listed IP 仍会被匹配 → 可能导致 IPV:CAL + SCL=-1
   - **不建议在 EFC 场景下使用 IP Allow List**
3. Internal emails (DIR:INT) 不受 Connection Filter 影响

---

## Scenario 2: IPv6 入站邮件管理
> 来源: ado-wiki-a-Connection-Filter-Spamhaus.md | 适用: Mooncake ❌ (21V 无 TABL)

### 排查步骤
1. Connection Filter 不支持 IPv6
2. 使用 TABL 管理 IPv6 地址:
   - [Allow or block IPv6 addresses](https://learn.microsoft.com/defender-office-365/tenant-allow-block-list-ip-addresses-configure)
3. 21V 环境: 目前没有原生方式管理 IPv6 Allow/Block
   - 可考虑使用 mail flow rules 作为替代
