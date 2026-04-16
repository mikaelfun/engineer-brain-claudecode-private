# ARM Azure Policy 与 MDfC/安全中心集成 — 排查工作流

**来源草稿**: ado-wiki-b-policy-mdc-integration.md
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: MDfC 与 Policy 合规结果不一致
> 来源: ado-wiki-b-policy-mdc-integration.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **理解三种集成方式**:
   - MDfC 使用 Policy compliance 结果展示在 ASC UI → 计算可能不同 (expected)
   - Security Center 类别 built-in policy 使用 Microsoft.Security/assessments
   - MDC 可为 Manual policy 创建 attestation
2. **Support Scope 判断**:
   - ASC UI 显示不同合规 → MDfC 团队 (expected behavior)
   - Security Center 类别 policy 不符预期 → MDfC 团队 (检查 assessments)
   - MDfC initiative assignment 配置 → 共同负责
   - Policy API (attestation) → Azure Policy 团队
3. **识别 Security Center 类别 policy**: 通常是 AINE effect，details type 为 Microsoft.Security/assessments

---

## Scenario 2: MDfC Initiative Assignment 管理
> 来源: ado-wiki-b-policy-mdc-integration.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. MDfC 配置后会自动创建 initiative assignment
2. 客户可自定义这些 assignment
3. 若客户修改导致问题 → 检查客户配置
4. 若问题在于 MDfC 如何消费 Policy 数据 → 转给 MDfC 团队
