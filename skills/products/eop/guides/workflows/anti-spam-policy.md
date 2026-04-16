# EOP 反垃圾邮件策略配置与优先级 — 排查工作流

**来源草稿**: mslearn-eop-anti-spam-filtering-guide.md, mslearn-eop-recommended-settings.md, ado-wiki-b-Bulk-Confidence-Level.md, ado-wiki-a-Spam-Confidence-Level.md
**场景数**: 3
**生成日期**: 2026-04-07

---

## Scenario 1: Anti-Spam Policy 优先级与 Preset Security Policy
> 来源: mslearn-eop-recommended-settings.md | 适用: Mooncake ✅

### 排查步骤
1. 确认策略优先级 (从高到低):
   1. Custom policies
   2. Standard preset security policy
   3. Strict preset security policy
   4. Built-in protection
   5. Default policy
2. 用户被多个策略覆盖时，最高优先级策略生效
3. 常见问题:
   - Preset policy 不生效 → 检查是否被 custom policy 覆盖
   - 确认 rule state 为 Enabled
   - 验证用户在 policy 的 recipient 范围内
4. PowerShell 检查:
   ```powershell
   Get-EOPProtectionPolicyRule -Identity "Standard Preset Security Policy" | FL Name, State
   ```

---

## Scenario 2: BCL (Bulk Confidence Level) 阈值调优
> 来源: ado-wiki-b-Bulk-Confidence-Level.md | 适用: Mooncake ✅

### 排查步骤
1. BCL 值含义:
   | BCL 值 | 说明 |
   |--------|------|
   | 0 | 非批量发件人 |
   | 1-3 | 少量投诉 |
   | 4-7 | 混合投诉 |
   | 8-9 | 高投诉量 |
2. 默认阈值: 7 (BCL >= 7 触发 spam 动作)
   - Standard 推荐: 6, Strict 推荐: 5
3. `MarkAsSpamBulkMail` 设置 (PowerShell-only):
   - On (默认): BCL >= 阈值 → SCL 6 → 执行 Bulk verdict action
   - Off: BCL 仅标记，不执行动作
4. 调优方法:
   - MDO P2: Advanced Hunting 查询识别 wanted/unwanted bulk senders
   - EOP: 使用 Threat protection status report
5. Portal: Anti-spam policy > Edit spam threshold > Bulk email threshold slider
   - **higher 值 = 更宽松 (更多 bulk 邮件通过)**

---

## Scenario 3: SCL (Spam Confidence Level) 解读
> 来源: ado-wiki-a-Spam-Confidence-Level.md | 适用: Mooncake ✅

### 速查表
| SCL | 解释 | 默认动作 |
|-----|------|----------|
| -1 | Safe sender/IP/Transport rule bypass | 跳过 spam filtering |
| 0,1 | Clean | 投递到 Inbox (O365 仅分配 SCL 1) |
| 5,6 | Spam | Anti-spam policy 配置的动作 |
| 7,8,9 | High Confidence Spam | Anti-spam policy 配置的动作 |

**注意**: SCL 2,3,4,7,8 不由 O365 设置
- SCL 6 通常出现在收件人 Blocked Senders list 场景
- SCL 9 可能来自 ASF 规则 → 检查 X-CustomSpam header
