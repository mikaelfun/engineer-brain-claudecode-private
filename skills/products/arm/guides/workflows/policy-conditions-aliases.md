# ARM Azure Policy 条件与别名 — 排查工作流

**来源草稿**: ado-wiki-a-policy-aliases.md, ado-wiki-policy-array-aliases-evaluation.md, ado-wiki-a-debugging-a-policy.md
**场景数**: 3
**生成日期**: 2026-04-07

---

## Scenario 1: Policy 条件调试（手动 Debugger）
> 来源: ado-wiki-a-debugging-a-policy.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **理解客户需求** — 哪些场景应 compliant vs non-compliant
2. **获取客户配置** — definition + assignment + initiative
3. **获取目标资源 payload** — REST API GET
4. **检查 known issues** — GitHub Azure Policy known issues
5. **手动调试 policy**:
   - 识别 definition 中使用的 aliases 和 top level properties
   - 在资源 payload 中查找这些属性的实际值
   - 从 if 部分开始逐层深入 allOf/anyOf/not
   - 对每个 condition 判断 true/false
   - 向上汇总逻辑运算符结果
   - if 结果决定 compliance 或 AINE/DINE applicability

### Top Level Properties（不需要 alias）
- name, fullname, id, kind, location, identity.type, tags

---

## Scenario 2: Array Alias 评估逻辑
> 来源: ado-wiki-policy-array-aliases-evaluation.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **识别 alias 类型**:
   - `securityRules[*].access` → 迭代每个数组元素
   - `securityRules[*]` → 迭代完整元素
   - `securityRules` → 整个数组（不迭代）
2. **数组评估逻辑**:
   - `equals` → 所有元素都满足才为 true
   - `notEquals` → 所有元素都不等才为 true
   - `not + notEquals` → 至少一个元素等于目标值
3. **跨属性条件的局限性** → 独立条件无法关联同一元素的多个属性
4. **使用 count 操作符解决** → 迭代数组元素并按 where 条件计数

---

## Scenario 3: Alias 查找与验证
> 来源: ado-wiki-a-policy-aliases.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **从 alias 确定资源类型** — 路径最后一个 / 之前是 resource type
2. **Alias 未找到** — 检查 RP Swagger 是否有该属性
3. **验证 alias 与 type 条件匹配** — 必须一致
4. **查找 alias** — 使用 Get-AzPolicyAlias 或 REST API
