# EOP SPF 认证失败与配置 — 排查工作流

**来源草稿**: ado-wiki-a-email-authentication-spf-dkim-dmarc.md, ado-wiki-a-quantifying-auth-results-advanced-hunting.md
**场景数**: 4
**生成日期**: 2026-04-07

---

## Scenario 1: SPF Fail/SoftFail 导致邮件被拦截
> 来源: ado-wiki-a-email-authentication-spf-dkim-dmarc.md | 适用: Mooncake ✅

### 排查步骤
1. 检查 Authentication-Results header 中的 SPF 结果
   - `spf=fail` / `spf=softfail` / `spf=none`
2. 确认 SPF 检查的域名（5321.MailFrom 域）
   - SPF 验证 connecting IP vs MailFrom 域的 DNS TXT 记录
3. 查询 SPF 记录
   - `Resolve-DnsName -Name contoso.com -Type TXT`
   - 工具: [DMARCIAN SPF Survey](https://dmarcian.com/spf-survey/), [MX Toolbox](https://mxtoolbox.com/spf.aspx)
4. 常见原因与修复
   - 发送 IP 未在 SPF 记录中 -> 添加 IP 或 include 语句
   - MX 不指向 O365 -> SPF 检查使用中间服务器 IP，非原始发送者 IP
   - 需要 Enhanced Filtering for Connectors
5. **注意**: 不建议使用 SPF Hard Fail ASF 功能（会同时标记 Fail 和 SoftFail 为 SCL 9）

### 决策树
```
SPF 失败
├── spf=fail -> IP 不在 SPF 记录中
│   ├── 发送 IP 已知 -> 添加到 SPF 记录
│   └── MX 指向第三方 -> 配置 Enhanced Filtering for Connectors
├── spf=permerror -> SPF 记录语法错误或超过 10 次 DNS lookup
│   └── 简化 SPF 记录（减少 include/redirect）
├── spf=temperror -> DNS 解析临时故障
│   └── 检查发件方 DNS 服务器，增大 TTL
└── spf=none -> 无 SPF 记录
    └── 指导发件人发布 SPF 记录
```

---

## Scenario 2: SPF PermError (超过 10 次 DNS Lookup)
> 来源: ado-wiki-a-email-authentication-spf-dkim-dmarc.md | 适用: Mooncake ✅

### 排查步骤
1. 使用 [SPF Policy Tester](https://vamsoft.com/support/tools/spf-policy-tester) 验证
2. 计算 DNS lookup 次数（include, a, mx, redirect 各算一次）
3. RFC 7208 限制: 最多 10 次 DNS lookup
4. 修复方案:
   - 减少 include 嵌套层数
   - 将不常变化的 IP 直接写入 SPF 记录
   - 使用 SPF flattening 工具

---

## Scenario 3: SPF Macros 解析问题
> 来源: ado-wiki-a-email-authentication-spf-dkim-dmarc.md | 适用: Mooncake ✅

### 排查步骤
1. 识别 SPF 记录中的宏语法（RFC 7208 Section 7.2）
   - `%{i}` = 发送 IP, `%{d}` = 域名, `%{s}` = 发件人, `%{l}` = local-part
2. 使用 [Vamsoft SPF Policy Tester](https://vamsoft.com/support/tools/spf-policy-tester) 进行宏展开测试
3. 示例: `v=spf1 exists:%{i}._i.%{d}._d.espf.agari.com` -> 替换 IP 和域名后解析

---

## Scenario 4: 量化 SPF 失败频率 (Advanced Hunting)
> 来源: ado-wiki-a-quantifying-auth-results-advanced-hunting.md | 适用: Mooncake ❌ (需要 MDO P2)

### 排查步骤
1. 客户声称 SPF "总是失败" -> 用数据量化
2. 运行 Auth Stats Query (修改域名和天数)
3. 运行 SPF IP Analysis Query 找到失败最多的 IP
4. 结果分析:
   - temperror <1% -> 正常的间歇性 DNS 超时
   - fail 比例高 -> 使用 IP 脚本找出哪些 IP 在失败
   - SPF=fail 但 DKIM=pass -> 检查 DMARC 是否通过 DKIM 对齐
