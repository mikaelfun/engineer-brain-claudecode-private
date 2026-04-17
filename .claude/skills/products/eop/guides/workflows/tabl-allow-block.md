# EOP 租户允许/阻止列表 (TABL) 管理 — 排查工作流

**来源草稿**: ado-wiki-tabl-faq.md, mslearn-sender-allow-block-management.md
**场景数**: 3
**生成日期**: 2026-04-07

---

## Scenario 1: TABL 条目不生效
> 来源: ado-wiki-tabl-faq.md | 适用: Mooncake ❌ (21V 无 TABL)

### 排查步骤
1. 检查 TABL 条目是否正确配置
   - Portal: https://security.microsoft.com/tenantAllowBlockList
   - PowerShell: `Get-TenantAllowBlockListItems -ListType [Sender,URL,FileHash,IP]`
2. 常见问题:
   - **TABL sender allow/block 不适用于 IntraOrg 邮件** (by design)
   - **ZAP 不尊重 TABL sender allow for high confidence phish** (已知问题 6044388)
   - **ZAP 尊重 TABL URL allow**
   - **Allow entry 无"永不过期"选项** (by design，防止列表膨胀)
   - **IPv4 不受支持** → 使用 Connection Filter Policy; TABL 仅支持 IPv6
3. URL 条目检查:
   - 确认 URL 语法正确，特别是通配符使用
4. Spoofed sender 条目不保存:
   - 原因: 多个 HostedConnectionFilterPolicy
   - 修复: 设置第一个 policy 的 isDefault=true → 删除第二个 → 重新添加

---

## Scenario 2: 允许/阻止列表最佳实践
> 来源: mslearn-sender-allow-block-management.md | 适用: Mooncake ✅ (部分方法)

### Allow 方法 (推荐度从高到低)
1. **TABL** — 域和邮箱地址 (含 spoofed senders) [21V ❌]
2. **Exchange mail flow rules** — 需同时检查 auth 结果 ✅
3. **Outlook Safe Senders** — 仅影响单个邮箱 ✅
4. **IP Allow List** — Connection Filter Policy ✅
5. **Anti-spam policy allowed lists** — 最不推荐 ✅

### Block 方法 (推荐度从高到低)
1. **TABL** — block entry 标记为 High Confidence Spam (SCL=9) [21V ❌]
2. **Outlook Blocked Senders** — header: SFV:BLK ✅
3. **Anti-spam policy blocked lists** ✅
4. **Exchange mail flow rules** — 设置 SCL=9 ✅
5. **IP Block List** — Connection Filter Policy ✅

### 安全警告
- Malware 和 High Confidence Phishing 始终隔离 (Secure by Default)
- 切勿将 popular domains (microsoft.com) 加入 allowed domain list
- 仅用 sender domain 作为 transport rule 条件极度危险

---

## Scenario 3: TABL 管理员无法添加条目
> 来源: ado-wiki-tabl-faq.md | 适用: Mooncake ❌

### 排查步骤
1. 检查 RBAC/URBAC 权限
   - Exchange Online Permissions 必须已启用
2. 检查条目限制:
   - 条目数量限制取决于客户 license
3. 升级前检查清单:
   - [ ] 确认非已知问题或 by-design 行为
   - [ ] 在测试租户中复现
   - [ ] 收集: Network Message IDs, URLs, Spoofed sender/user, 诊断结果, Tenant ID
