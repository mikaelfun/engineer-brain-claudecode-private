# EOP ZAP 与投递后邮件移动 — 排查工作流

**来源草稿**: ado-wiki-a-Messages-Moved-Post-Delivery.md
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: 邮件投递后被移出 Inbox
> 来源: ado-wiki-a-Messages-Moved-Post-Delivery.md | 适用: Mooncake ✅

### 排查步骤
1. 确认 ZAP 是否移动了邮件
   - 方法1: 客户按 [官方步骤](https://learn.microsoft.com/defender-office-365/zero-hour-auto-purge#how-to-see-if-zap-moved-your-message) 验证
   - 方法2: 使用 "Defender for Office 365 Message Explorer" 诊断
   - ZAP 只移动到 threat policies 配置的文件夹:
     - 如果邮件到了 Deleted Items 且所有策略都是 Quarantine → 排除 ZAP
2. 如非 ZAP → 使用诊断 "Get message details from an M365 mailbox"
   - 需要: 受影响用户 + Internet Message ID
   - 获取 Document ID 用于追踪
3. 运行诊断 "Get Store Mailbox Events"
   - 场景: "Items Moved Or Deleted Unexpectedly"
   - 提供: 用户 + Document ID + 时间
   - 结果显示: 协议 (MoMT=Outlook桌面, AirSync=移动端等) 和用户信息
4. 如需更多信息 → 启用 mailbox audit "Move" 操作:
   ```powershell
   Set-Mailbox user -AuditOwner @{add="Move"}
   ```
5. 重现后收集审计日志:
   ```powershell
   $audit = Search-UnifiedAuditLog -StartDate <date> -EndDate <date> -Operations Move -FreeText "<MESSAGE_ID>"
   $audit.AuditData | ConvertFrom-Json | Export-Csv audit.csv -NTI
   ```

### 关键审计字段
- `ClientInfoString`: 客户端信息
- `ClientIPAddress`: 客户端 IP
- `ClientProcessName`: 进程名
- `AppId`: 应用 ID (第一方应用 ID 查询)
- **Move** → 从 Inbox 到其他文件夹
- **MoveToDeletedItems** → 到 Deleted Items
- **SoftDelete** → 到 Recoverable Items
- **HardDelete** → 到 Purges

---

## Scenario 2: ZAP 行为确认与配置
> 来源: ado-wiki-a-Messages-Moved-Post-Delivery.md | 适用: Mooncake ❌ (21V 无 ZAP)

### 排查步骤
1. ZAP 默认开启 (phishing ZAP + spam ZAP)
2. ZAP 动作跟随 threat policy 配置
3. Store events 中确认 ZAP:
   - 启用 "Include internal access events" 查询
   - Client 字段会显示 ZAP
4. 如客户不希望 ZAP 移动特定邮件:
   - 不建议全局关闭 ZAP
   - 可通过 TABL URL allow 排除特定 URL (ZAP 尊重 TABL URL allow)
   - 注意: ZAP 不尊重 TABL sender allow for high confidence phish
