# EOP Safe Attachments (安全附件) 问题 — 排查工作流

**来源草稿**: ado-wiki-a-malware-tsg.md, mslearn-anti-malware-common-attachments.md
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: Common Attachment Filter 误阻 (Malware FP)
> 来源: ado-wiki-a-malware-tsg.md | 适用: Mooncake ✅ (Anti-malware policies 可用)

### 排查步骤
1. 查看完整扩展名列表 (避免 UI 截断):
   ```powershell
   (Get-MalwareFilterPolicy "PolicyName").FileTypes -join ", "
   ```
2. 检查通知设置:
   ```powershell
   Get-MalwareFilterPolicy "Default" | fl *AdminNotifications, EnableFileFilter, FileTypeAction
   ```
3. True-type detection 可能导致 FP:
   - 不同文件类型可能共享相同签名 (如 .docx/.zip/.adoc 都是 PK header)
   - 例: .COM FP — 嵌套邮件 subject 以 .COM 结尾触发阻止 (by design)
4. 提交 FP:
   - Submissions 页面提交 (推荐)
   - [Microsoft Security Intelligence](https://go.microsoft.com/fwlink/?linkid=2182835)
   - **不要代客户提交恶意 payload**

### 关键规则
- Default anti-malware policy: 出站 + 入站
- Custom policies: 仅入站
- 嵌套附件深度 >= 20 → NDR (policy violation)

---

## Scenario 2: Safe Attachments (Sandbox) 问题
> 来源: ado-wiki-a-malware-tsg.md | 适用: Mooncake ❌ (21V 无 Safe Attachments)

### 排查步骤
1. Safe Attachments 使用 sandbox (SONAR) 引爆文件
2. Dynamic Delivery 模式: 附件先占位，引爆后替换
3. SPO/ODB/Teams 的 Safe Attachments:
   - Defender portal > Safe Attachments > Global settings > Turn on for SharePoint, OneDrive, and Teams
4. 文件被隔离:
   - Quarantine 保留 30 天 (不可自定义)
   - Release 后 quarantine 中的副本状态变为 Released，原文件在 SPO/ODB 不受影响
