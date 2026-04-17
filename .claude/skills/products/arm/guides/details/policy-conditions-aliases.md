# ARM Azure Policy 条件与别名 — 综合排查指南

**条目数**: 6 | **草稿融合数**: 31 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-a-azure-data-factory-policy-integration.md, ado-wiki-a-azure-load-testing-policy-integration.md, ado-wiki-a-debugging-a-policy.md, ado-wiki-a-policy-aliases.md, ado-wiki-a-policy-aware-portal-experience.md (+26 more)
**Kusto 引用**: —
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Azure Policy alias is missing for a child property but alias exists for the par…
> 来源: ado-wiki

**根因分析**: Alias may not be created because: property is new, parent is an open object, or property has onboarding limitations.

1. Request alias creation via SAP process.
2. Workaround: target parent alias using string conversion in the if section.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 2: Azure Policy condition evaluates incorrectly because a property has wrong type …
> 来源: ado-wiki

**根因分析**: Type mismatch in policy condition value: policy definition compares a boolean/integer field against a string literal (or vice versa). JSON types must match exactly.

1. Ensure policy condition values match the exact JSON type of the resource property: use true (boolean) not string, use 20 (integer) not string.
2. Check REST API reference for the property actual type.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 3: Azure Policy expression using split() or array indexing throws exception or ret…
> 来源: ado-wiki

**根因分析**: Policy expression accesses an array position that may be null - e.g., split(field('name'),'-')[1] fails when the resource name has no dashes, returning null and causing an exception

1. Wrap array access with a length check using if(greaterOrEquals(length(split(.
2. )),2), split(.
3. )[1], 'fallbackValue') to prevent null access exceptions.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 4: Azure Policy using `not { notEquals }` pattern on array aliases (e.g. `ipRules[…
> 来源: ado-wiki

**根因分析**: Array aliases evaluate all elements simultaneously. `not { notEquals }` checks if at least one element equals the value. When two independent conditions are checked across different array positions, they can each match different elements and both return true, producing a false positive that looks like one element satisfies all conditions.

1. Replace the `not { notEquals }` pattern with the `count` operator and a `where` clause: `{"count": {"field": "ipRules[*]", "where": {"allOf": [{"field": "ipRules[*].
2. address", "equals": "10.
3. 1"}, {"field": "ipRules[*].
4. action", "equals": "allow"}]}}, "greaterOrEquals": 1}`.
5. The `count` operator evaluates all conditions per element atomically, preventing cross-element false positives.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 5: Policy using allOf with multiple `not { field: 'array[*].propertyA', notEquals:…
> 来源: ado-wiki

**根因分析**: Array aliases evaluate each condition independently across all elements; the two conditions can be satisfied by two different elements of the same array, not necessarily the same element — a fundamental behavioral difference from non-array alias conditions

1. Use the `count` operator with a `where` clause containing an `allOf` block to enforce that all conditions are evaluated on the same array element: `{ "count": { "field": "array[*]", "where": { "allOf": [ { "field": "array[*].
2. propertyA", "equals": "val1" }, { "field": "array[*].
3. propertyB", "equals": "val2" } ] } }, "greater": 0 }`.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 6: Azure Policy 定义报错 Alias not found：策略定义中使用了不存在或错误的属性别名（alias）
> 来源: mslearn

**根因分析**: Policy 使用 alias 映射到 Azure Resource Manager 属性。如果 alias 拼写错误、已弃用、或该 ARM 属性根本没有对应的 alias，则策略定义验证失败或运行时无法匹配资源

1. 1) 使用 VS Code Azure Policy 扩展查看可用 alias；2) 用 Get-AzPolicyAlias 或 az provider show --expand policyAliases 查询 RP 的所有可用 alias；3) 如果 ARM 属性没有 alias，提交 Azure Support ticket 请求添加；4) 使用 resources.
2. com 验证目标属性路径是否正确.

`[结论: 🔵 6.0/10 — [mslearn]]`

## 判断逻辑

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| Azure Policy alias is missing for a child property but alia… | Alias may not be created because: property is new, parent i… | Request alias creation via SAP process. Workaround: target … |
| Azure Policy condition evaluates incorrectly because a prop… | Type mismatch in policy condition value: policy definition … | Ensure policy condition values match the exact JSON type of… |
| Azure Policy expression using split() or array indexing thr… | Policy expression accesses an array position that may be nu… | Wrap array access with a length check using if(greaterOrEqu… |
| Azure Policy using `not { notEquals }` pattern on array ali… | Array aliases evaluate all elements simultaneously. `not { … | Replace the `not { notEquals }` pattern with the `count` op… |
| Policy using allOf with multiple `not { field: 'array[*].pr… | Array aliases evaluate each condition independently across … | Use the `count` operator with a `where` clause containing a… |
| Azure Policy 定义报错 Alias not found：策略定义中使用了不存在或错误的属性别名（alias） | Policy 使用 alias 映射到 Azure Resource Manager 属性。如果 alias 拼写错误… | 1) 使用 VS Code Azure Policy 扩展查看可用 alias；2) 用 Get-AzPolicyAl… |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Azure Policy alias is missing for a child property but alias exists for the parent property | Alias may not be created because: property is new, parent is an open object, or property has onboar… | Request alias creation via SAP process. Workaround: target parent alias using string conversion in … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 | Azure Policy condition evaluates incorrectly because a property has wrong type - boolean true treat… | Type mismatch in policy condition value: policy definition compares a boolean/integer field against… | Ensure policy condition values match the exact JSON type of the resource property: use true (boolea… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 | Azure Policy expression using split() or array indexing throws exception or returns unexpected eval… | Policy expression accesses an array position that may be null - e.g., split(field('name'),'-')[1] f… | Wrap array access with a length check using if(greaterOrEquals(length(split(...)),2), split(...)[1]… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 | Azure Policy using `not { notEquals }` pattern on array aliases (e.g. `ipRules[*].address`) returns… | Array aliases evaluate all elements simultaneously. `not { notEquals }` checks if at least one elem… | Replace the `not { notEquals }` pattern with the `count` operator and a `where` clause: `{"count": … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 | Policy using allOf with multiple `not { field: 'array[*].propertyA', notEquals: 'val1' }` and `not … | Array aliases evaluate each condition independently across all elements; the two conditions can be … | Use the `count` operator with a `where` clause containing an `allOf` block to enforce that all cond… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 | Azure Policy 定义报错 Alias not found：策略定义中使用了不存在或错误的属性别名（alias） | Policy 使用 alias 映射到 Azure Resource Manager 属性。如果 alias 拼写错误、已弃用、或该 ARM 属性根本没有对应的 alias，则策略定义验证失败或运行… | 1) 使用 VS Code Azure Policy 扩展查看可用 alias；2) 用 Get-AzPolicyAlias 或 az provider show --expand policyAl… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
