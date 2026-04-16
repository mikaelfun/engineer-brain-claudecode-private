# EOP 用户报告与杂项 NDR — 排查工作流

**来源草稿**: ado-wiki-a-User-Reporting-Submissions.md
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: 用户报告功能配置与排查
> 来源: ado-wiki-a-User-Reporting-Submissions.md | 适用: Mooncake ❌ (21V 后端不可用)

### 排查步骤
1. **Microsoft 工具报告**:
   - Report message add-in / Report phish add-in / Microsoft report button
   - 报告去向: 报告邮箱 / Microsoft / 两者 (由 User reported settings 控制)
   - MDO P2/E5: 报告钓鱼邮件触发 AIR
2. **第三方工具报告**:
   - 配置: User reported settings > Monitor reported messages > Use non-Microsoft add-in button
   - 第三方供应商需遵循消息提交格式指南
3. **诊断**: Assist 365 > Validate User Reported Settings

---

## Scenario 2: Submission 结果与 Allow 生成
> 来源: ado-wiki-a-User-Reporting-Submissions.md | 适用: Mooncake ✅ (部分)

### 结果生成流程
**Worldwide (WW)**:
1. 检查: 钓鱼模拟 > 认证 > 策略 > 重新扫描
2. 无策略命中 > 重新扫描获取最新 filter verdict
3. 人工分析师最终评级

**GCC/GCC High/ITAR/DoD**:
- 仅前 4 步 (无人工分析)
- 结果提示需联系支持进一步分析

### Allow 生成规则
- Admin submission 根据检测技术创建 allow
- 检查: impersonation, spoofing, file/URL technologies
- **Domain rollup**: 同域 >= 7 个 email allow entries → 自动合并为 domain entry
- 已有 Tenant-level block → 不创建 allow
- Allow 默认有效期: 45 days after last used date
