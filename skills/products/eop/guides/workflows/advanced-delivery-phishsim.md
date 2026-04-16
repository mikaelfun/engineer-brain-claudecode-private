# EOP Advanced Delivery 与钓鱼模拟 — 排查工作流

**来源草稿**: mslearn-advanced-delivery-policy.md, ado-wiki-b-Attack-Simulation-Training-FAQ.md
**场景数**: 3
**生成日期**: 2026-04-07

---

## Scenario 1: SecOps Mailbox 配置
> 来源: mslearn-advanced-delivery-policy.md | 适用: Mooncake ❌ (21V 无 Advanced Delivery)

### 配置步骤
1. Portal: Security Portal > Email & collaboration > Policies & rules > Threat policies > Advanced delivery > SecOps mailbox tab
2. 效果: 所有 filter 不对 SecOps 邮箱采取行动
   - 包括: malware filtering, ZAP, Safe Links, Safe Attachments
3. PowerShell:
   ```powershell
   New-SecOpsOverridePolicy -Name SecOpsOverridePolicy -SentTo secops@contoso.com
   New-ExoSecOpsOverrideRule -Name SecOpsOverrideRule -Policy SecOpsOverridePolicy
   ```

---

## Scenario 2: 第三方钓鱼模拟配置
> 来源: mslearn-advanced-delivery-policy.md | 适用: Mooncake ❌

### 配置步骤
1. 必须提供:
   - 至少一个 Domain (MAIL FROM 域或 DKIM 域)
   - 至少一个 Sending IP (IPv4)
   - 可选: Simulation URLs
2. 注意事项:
   - MX 不指向 M365 → 确保 Authentication-results header 中 IP 匹配，可能需要 EFC
   - 不支持同组织内部钓鱼模拟 (DIR:INT)
   - IPv6 仅 PowerShell 支持
3. 排查要点:
   - 确认 override 在 Threat Explorer 的 System override source 显示
   - 检查 EmailEvents 中 OrgLevelPolicy 是否包含 PhishSimulation/SecOps

---

## Scenario 3: Attack Simulation Training (AST) 问题
> 来源: ado-wiki-b-Attack-Simulation-Training-FAQ.md | 适用: Mooncake ❌

### 排查步骤
1. 区分: Microsoft AST vs 第三方模拟工具
   - 第三方工具问题应导向 Advanced Delivery 配置
2. AST 邮件未收到:
   - 收集: TenantId + simulationId/simulationName + affected user emails
3. AST FP (模拟邮件被拦截):
   - 检查是否有第三方系统也在扫描邮件
4. 升级所需最小日志: TenantId + simulationId + affected users + 相关截图
