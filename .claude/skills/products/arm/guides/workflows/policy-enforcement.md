# ARM Azure Policy 执行与阻断 — 排查工作流

**来源草稿**: ado-wiki-b-policy-enforcement-not-as-expected.md, ado-wiki-a-policy-how-control-plane-effects-work.md, ado-wiki-policy-greenfield-vs-brownfield.md, ado-wiki-policy-operation-blocked.md
**场景数**: 3
**生成日期**: 2026-04-07

---

## Scenario 1: Operation Blocked by Policy (RequestDisallowedByPolicy)
> 来源: ado-wiki-policy-operation-blocked.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **获取错误信息** — 典型错误结构:
   ```json
   {
     "error": {
       "code": "RequestDisallowedByPolicy",
       "message": "Resource 'xxx' was disallowed by policy...",
       "additionalInfo": [{
         "type": "PolicyViolation",
         "info": {
           "policyDefinitionDisplayName": "...",
           "evaluationDetails": { "evaluatedExpressions": [...] }
         }
       }]
     }
   }
   ```
2. **从错误中识别**:
   - 哪个 assignment 和 definition 阻止了操作
   - 哪些 properties 不符合预期（evaluationDetails）
   - allOf 场景：所有表达式为 true 时触发 deny effect
3. **权限注意**: 若用户无 Policy 权限，`evaluationDetails` 会被移除
4. **客户认为操作不应被阻止** → 转入 Scenario 2 排查

---

## Scenario 2: Greenfield 执行不符预期
> 来源: ado-wiki-b-policy-enforcement-not-as-expected.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **理解场景** — 确认客户期望 vs 实际行为:
   - Audit: 应生成 Activity Log 条目
   - Deny: 应返回 403
   - Append/Modify: 应修改 incoming payload
   - AINE/DINE: 10 分钟后（或 evaluationDelay 指定时间）触发
2. **获取客户配置**
3. **检查 Policy Mode** — Indexed vs All
4. **检查 Policy 逻辑** — 确认条件和值是否正确
5. **获取资源 payload 并验证条件**
6. **验证 correlationId** — Greenfield 场景下:
   - `EventServiceEntries` 表中有记录 → effect 已触发
   - 无记录 → 检查:
     - 资源是否在 assignment scope 内
     - 是否有 exemption
     - enforcementMode 是否为 `default`
     - type/name/kind 条件是否有拼写错误
7. **复现问题**

### Greenfield 执行流程
```
PUT/PATCH 请求 → ARM 接收
├── PATCH: ARM 调用 RP GET 获取当前 payload → 合并变更 → 评估
├── PUT: 直接评估 incoming payload
└── 评估顺序: Disabled → Append → Deny → Audit → AINE/DINE
    ├── Deny 命中 → 返回 403
    ├── Append/Modify 命中 → 修改 payload 后转发 RP
    ├── Audit 命中 → 记录 Activity Log → 转发 RP
    └── AINE/DINE 命中 → 10min 后再评估 details 部分
```

### 关键时序
- 新 assignment 后 Greenfield 生效: 最多 30 分钟（权限缓存刷新周期）
- 解决方法: 登出/登入强制刷新缓存

---

## Scenario 3: DINE/AINE 自动修复未触发
> 来源: ado-wiki-a-policy-how-control-plane-effects-work.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **理解 DINE/AINE 的 Greenfield 流程**:
   - if 条件匹配 → 10 分钟后（或 evaluationDelay）重新评估 details
   - AINE: 若 details 资源不满足条件 → 记录 Activity Log
   - DINE: 若 details 资源不满足条件 → 自动创建 deployment（名称以 `PolicyDeployment_` 开头）
2. **检查 details 部分的 GET 请求类型**:
   - 子资源: 以 if 资源为父级进行 GET
   - Extension 资源: 以 if 资源为前缀进行 GET
   - 其他: 使用 existenceScope（默认 resourceGroup）
3. **检查 managed identity** — DINE 部署使用 assignment 的 managed identity
4. **Brownfield 手动修复**: 客户可创建 remediation task

### 21V 注意事项
- DINE 自动部署在 Mooncake 中功能一致
- 注意: AINE 不是 "Audit if exists"，只能审计"不存在"的资源
