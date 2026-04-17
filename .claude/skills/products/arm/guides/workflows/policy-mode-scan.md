# ARM Azure Policy 模式与合规扫描 — 排查工作流

**来源草稿**: ado-wiki-a-policy-how-control-plane-effects-work.md, ado-wiki-b-policy-compliance-state-not-as-expected.md, ado-wiki-policy-greenfield-vs-brownfield.md, ado-wiki-a-policy-glossary.md, ado-wiki-a-policy-start-here.md
**场景数**: 3
**生成日期**: 2026-04-07

---

## Scenario 1: 资源合规状态不符预期（Non-compliant 误报/漏报）
> 来源: ado-wiki-b-policy-compliance-state-not-as-expected.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **理解场景** — 明确哪些资源被标记为 non-compliant 但不应该，或反之
2. **获取客户配置** — 收集 policy definition、assignment、initiative 信息
3. **检查 Policy Mode**
   - `Indexed` mode: 仅扫描支持 tags 和 location 的资源（tracked resources）
   - `All` mode: 扫描所有资源类型
   - 若模式错误会导致资源被遗漏或误扫
4. **检查 Policy 逻辑** — 确认 conditions 和 values 是否匹配预期
   - 若使用 array aliases `[*]`，需特别注意数组语法
5. **获取资源 payload 并验证条件**
   - 通过 REST API GET 获取目标资源的完整 payload
   - 逐条对比 policy definition 中的 field/operator/value
6. **检查 assignment scope / notScopes / exemptions**
   - 确认资源在 assignment scope 内
   - 确认没有被 notScopes 排除
   - 确认没有 exemption 覆盖
7. **尝试复现** — 使用相同的 definition 和 assignment 配置复现问题

### 决策树
```
资源合规状态不符预期？
├── 资源不该 non-compliant → 检查 policy 逻辑 + payload 匹配
├── 资源不该 compliant → 检查 mode + alias 是否正确
├── 资源未被扫描 → 检查 mode (Indexed vs All) + scope
└── 多余资源被扫描 → 检查 type/name/kind 条件
```

---

## Scenario 2: Brownfield 扫描机制与时序
> 来源: ado-wiki-policy-greenfield-vs-brownfield.md, ado-wiki-a-policy-how-control-plane-effects-work.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **确认扫描类型** — Brownfield（异步合规扫描）vs Greenfield（同步执行）
2. **Brownfield 触发条件**:
   - 资源变更后自动触发
   - Assignment/Initiative/Definition 变更后触发
   - 每日自动全量扫描
   - 手动按需触发 (on-demand evaluation scan)
3. **等待时间**:
   - 新 assignment 创建后: 最多 30 分钟才能在 Portal 看到结果
   - 日常扫描: 每 24 小时至少一次
4. **各 Effect 在 Brownfield 下的行为**:
   - `Audit` / `Deny`: GET 资源 → 符合条件 → 标记 non-compliant
   - `AINE`: GET 资源 → 符合 if 条件 → GET details 资源 → 不存在 → non-compliant
   - `DINE`: 同 AINE，客户可手动创建 remediation task
   - `Manual`: 只确定 applicability，合规由 attestation 决定
   - `DenyAction`: GET 资源 → 符合条件 → 标记 Protected

### Portal 路径
- Azure Portal → Policy → Compliance → 选择 assignment → 查看资源合规详情
- 手动触发扫描: `POST /subscriptions/{id}/providers/Microsoft.PolicyInsights/policyStates/latest/triggerEvaluation`

---

## Scenario 3: Policy Mode 选择与非标签资源扫描
> 来源: ado-wiki-a-policy-glossary.md, ado-wiki-a-policy-start-here.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **确定资源类型的 routing type**:
   - `default` (tracked resources): 支持 tags → Indexed mode 可扫描
   - `proxy` resources: 不支持 tags → 仅 All mode 可扫描
2. **常见场景**:
   - Non-taggable resources 在 Indexed mode 下被扫描 → 已知行为，参考 known scenarios
   - SQL master DB 不被扫描 → by design (特殊处理)
3. **建议**: 自定义 policy 若需覆盖所有资源类型，应使用 `All` mode

### 21V 注意事项
- Mooncake 的 Policy 功能与 Global 基本一致
- IcM 路径: Azure Policy/Azure Policy Triage On-Call
