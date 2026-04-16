# EOP Safe Links (安全链接) 问题 — 排查工作流

**来源草稿**: ado-wiki-a-URL-Click-Alerts.md
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: "A potentially malicious URL click was detected" 误报调查
> 来源: ado-wiki-a-URL-Click-Alerts.md | 适用: Mooncake ❌ (21V 无 Safe Links)

### 排查步骤
1. 获取 URL click 数据:
   - Threat Explorer > URL Clicks
   - Advanced Hunting > UrlClickEvents table
   - Unified Audit Log: `Search-UnifiedAuditLog -Operations TIUrlClickData`
2. 检查点击 IP 是否来自 Microsoft:
   - 使用 [MicrosoftIPs](https://csstoolkit.azurewebsites.net/) 查询
3. 根据 IP 来源判断:
   - **EOP IP** → 升级到 Engineering
   - **Azure Public Cloud** → 升级到 Engineering (可能是 SONAR 扫描)
   - **其他 Microsoft 服务** → 客户自行调查
   - **非 Microsoft IP** → 客户自行调查

### 常见非 ATP URL Click 场景
- 用户确实点击了 URL
- 邮件线程中他人点击了 wrapped URL
- 第三方服务/add-on 访问了邮件中的 wrapped URL
- Wrapped URL 被分享到其他渠道 (Teams, OneDrive, etc.)
- Shared mailbox 的 URL click 归属到邮箱而非实际点击者

---

## Scenario 2: Safe Links 在 Teams 中的保护
> 来源: ado-wiki-a-mdo-protection-for-teams.md | 适用: Mooncake ❌

### 排查步骤
1. Teams 中 URL 不会被重写 — 保护是 time-of-click
2. 流程: 用户点击 URL > 是否已知恶意? > Yes: 阻止 > No: 允许 + 发送到 Sonar 引爆
3. 确认配置: Defender portal > Safe Links policy > Teams integration On
