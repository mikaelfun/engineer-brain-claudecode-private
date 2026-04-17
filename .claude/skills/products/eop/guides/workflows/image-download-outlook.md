# EOP Outlook 图片自动下载 — 排查工作流

**来源草稿**: ado-wiki-automatic-image-download-in-outlook.md
**场景数**: 1
**生成日期**: 2026-04-07

---

## Scenario 1: 第三方/批量邮件图片不自动下载
> 来源: ado-wiki-automatic-image-download-in-outlook.md | 适用: Mooncake ✅

### 排查步骤
1. 确认 P2 发送域是否为组织 Accepted Domain

2. **P2 域非 Accepted Domain**:
   - 唯一方法: 将发件人地址添加到 [mailbox Safe Sender list](https://learn.microsoft.com/defender-office-365/create-safe-sender-lists-in-office-365#use-outlook-safe-senders)

3. **P2 域是 Accepted Domain**:
   - **OWA/New Outlook**: 如果 DMARC 通过 → 自动下载图片
   - **Classic Outlook**: 最严格 — 需要同时满足:
     - 邮件认证为 Internal (`X-MS-Exchange-Organization-AuthAs: Internal`)
     - P2 发件人地址能解析为组织内对象 (`Get-Recipient <address>`)

4. Safe Sender List 注意事项:
   - 如果发件人地址存在于组织中 → 无法通过 PowerShell/OWA 添加 → 只能用 Outlook 桌面端或 GPO
   - 避免将 accepted domain 地址加入 Safe Senders (可能允许 spoofed 邮件到达 Inbox)

5. 替代方案 — Trusted Sites Zone:
   - 如图片从特定 URL 加载 → 将该 URL 添加到 Trusted Sites
   - GPO: User Configuration > Policies > Admin Templates > Windows Components > IE > Security Page
   - Site to Zone Assignment List → 值 2 (Trusted Sites Zone)
