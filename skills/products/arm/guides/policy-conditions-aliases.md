# ARM Azure Policy 条件与别名 — 排查速查

**来源数**: 6 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Azure Policy alias is missing for a child property but alias exists for the parent property | Alias may not be created because: property is new, parent is an open object, or property has onboar… | Request alias creation via SAP process. Workaround: target parent alias using string conversion in … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 📋 | Azure Policy condition evaluates incorrectly because a property has wrong type - boolean true treat… | Type mismatch in policy condition value: policy definition compares a boolean/integer field against… | Ensure policy condition values match the exact JSON type of the resource property: use true (boolea… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 📋 | Azure Policy expression using split() or array indexing throws exception or returns unexpected eval… | Policy expression accesses an array position that may be null - e.g., split(field('name'),'-')[1] f… | Wrap array access with a length check using if(greaterOrEquals(length(split(...)),2), split(...)[1]… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 📋 | Azure Policy using `not { notEquals }` pattern on array aliases (e.g. `ipRules[*].address`) returns… | Array aliases evaluate all elements simultaneously. `not { notEquals }` checks if at least one elem… | Replace the `not { notEquals }` pattern with the `count` operator and a `where` clause: `{"count": … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 📋 | Policy using allOf with multiple `not { field: 'array[*].propertyA', notEquals: 'val1' }` and `not … | Array aliases evaluate each condition independently across all elements; the two conditions can be … | Use the `count` operator with a `where` clause containing an `allOf` block to enforce that all cond… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 📋 | Azure Policy 定义报错 Alias not found：策略定义中使用了不存在或错误的属性别名（alias） | Policy 使用 alias 映射到 Azure Resource Manager 属性。如果 alias 拼写错误、已弃用、或该 ARM 属性根本没有对应的 alias，则策略定义验证失败或运行… | 1) 使用 VS Code Azure Policy 扩展查看可用 alias；2) 用 Get-AzPolicyAlias 或 az provider show --expand policyAl… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |

## 快速排查路径
1. Request alias creation via SAP process. Workaround: target parent alias using s… `[来源: ado-wiki]`
2. Ensure policy condition values match the exact JSON type of the resource proper… `[来源: ado-wiki]`
3. Wrap array access with a length check using if(greaterOrEquals(length(split(...… `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/policy-conditions-aliases.md#排查流程)
