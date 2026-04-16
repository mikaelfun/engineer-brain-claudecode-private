# ARM Azure Lighthouse 委托管理 — 排查工作流

**来源草稿**: ado-wiki-b-lighthouse-architecture.md, ado-wiki-b-lighthouse-start-here.md, ado-wiki-a-lighthouse-get-configuration.md, ado-wiki-a-lighthouse-get-logs.md
**场景数**: 3
**生成日期**: 2026-04-07

---

## Scenario 1: Lighthouse 委托管理架构与排查
> 来源: ado-wiki-b-lighthouse-architecture.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **理解资源架构**:
   - **Registration Definition**: 委托配置蓝图（tenant、角色、security principals）
   - **Registration Assignment**: 将 definition 应用到 scope（实际授权）
2. **On-boarding 幕后操作**:
   - 订阅添加 managedByTenantIds 属性
   - 为 definition 中声明的 security principals 创建 RBAC role assignments
   - 若有 eligible authorizations → 配置 PIM
3. **Off-boarding** → 回滚以上操作
4. **当前限制**: 仅支持 subscription 和 resource group 级别的委托

---

## Scenario 2: 获取 Lighthouse 配置
> 来源: ado-wiki-a-lighthouse-get-configuration.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **内部工具**:
   - ASC → Resource Explorer → Subscription → Azure Lighthouse tab
   - ASC → Resource Explorer → Subscription → Resource Graph tab → managedservicesresources 表
   - Jarvis: Get resources from provider → Microsoft.ManagedServices
2. **客户侧**:
   - Portal → Azure Lighthouse → Delegations blade
   - Azure Resource Graph: managedservicesresources 表
   - REST API: Registration Assignments / Registration Definitions List API

---

## Scenario 3: 获取 Lighthouse 操作日志
> 来源: ado-wiki-a-lighthouse-get-logs.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **委托 CRUD 操作日志**: RP 层当前无日志，使用 ARM 层 Kusto 追踪
2. **授权操作日志**: 通过 ARM 的 HTTP trace 收集
3. **IcM 路径**: Azure Resource Graph/Azure Lighthouse
