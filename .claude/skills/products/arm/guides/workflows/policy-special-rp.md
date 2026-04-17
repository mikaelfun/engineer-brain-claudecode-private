# ARM Azure Policy 特定资源提供程序 — 排查工作流

**来源草稿**: ado-wiki-b-policy-special-rp-considerations.md
**场景数**: 4
**生成日期**: 2026-04-07

---

## Scenario 1: Microsoft.Compute 特殊行为
> 来源: ado-wiki-b-policy-special-rp-considerations.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **diagnosticSettings extension** — 只能通过 PowerShell/CLI 启用，Portal 不支持
2. **instanceView 不受 Policy 支持** — 任何 instanceView 下的属性都无法被 Policy 访问
3. **osType 仅在 GET 时可用** — Greenfield 场景下检查 osType 的 policy 可能遗漏资源

---

## Scenario 2: Microsoft.Web/sites 特殊行为
> 来源: ado-wiki-b-policy-special-rp-considerations.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **PUT as PATCH** — Web RP 部分操作使用 PUT 发送部分 payload，缺失属性为 null
   - 缓解: 使用 append + deny 组合模式
2. **siteConfig Brownfield 限制** — GET 时返回 null，合规检查应使用 AINE policy 针对 sites/config
3. **sites/config 的 kind 属性不可用** — 无法区分 Function App 和 App Service
4. **sites/config 只支持 web.config** — Collection GET 只返回 name=web 的资源

---

## Scenario 3: Microsoft.Sql master DB 不被扫描
> 来源: ado-wiki-b-policy-special-rp-considerations.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. SQL master DB 不被 Policy 扫描是 **by design**
2. Diagnostic Settings UI 仅显示 9 个日志，但 API 支持 11 个

---

## Scenario 4: Microsoft.PowerPlatform 逻辑区域
> 来源: ado-wiki-b-policy-special-rp-considerations.md | 适用: Mooncake ❌ / Global ✅

### 排查步骤
1. PowerPlatform RP 使用逻辑区域（如 unitedstates, unitedkingdom）
2. Policy strongType 的 locations 参数默认隐藏逻辑区域
3. 解决: 通过 CLI/PowerShell 直接添加逻辑区域到参数值
