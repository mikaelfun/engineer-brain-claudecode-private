# ACR 注册表恢复与还原 — 排查工作流

**来源草稿**: ado-wiki-a-jarvis-actions.md, ado-wiki-a-technical-advisors-actions.md
**Kusto 引用**: registry-info.md
**场景数**: 4
**生成日期**: 2026-04-07

---

## Scenario 1: 恢复已删除的镜像/仓库 (TA 操作)
> 来源: ado-wiki-a-technical-advisors-actions.md | 适用: Global ✅

### 前置条件
- TA 权限 (TM-Krater-CSS-TA-JITAccess)
- Scope: ACRSupportElevated

### 排查步骤

1. **收集信息**: Subscription, Registry Login Server, Repository, Tag/Digest, Image Type
2. **查询 Tag (如客户不知道)**
   ```kql
   cluster("ACR").database("acrprod").WorkerServiceActivity
   | where env_time > ago(1d)
   | where Repository == "aks-helloworld" 
   | where RegistryLoginUri == "hannocreg.azurecr.io"
   | distinct Repository, Tag, Digest
   ```
   > 仅在仓库创建 30 天内可查到
3. **确认镜像不存在** → Jarvis: Get Registry Contents
4. **执行恢复** → Jarvis: Restore a Deleted Image (Scope: ACRSupportElevated)
5. **批量恢复格式**: subscription,registrylogin,reponame,tag,,docker,false

---

## Scenario 2: 恢复已删除的整个注册表 (TA 操作)
> 来源: ado-wiki-a-technical-advisors-actions.md | 适用: Global ✅

### 步骤

1. **客户创建同名注册表** (同 RG/Region/Subscription/SKU, 关闭 Geo-rep, 关闭 CMK)
2. **确认新注册表为空** → Jarvis: Get Repositories Count
3. **查询已删除注册表信息**
   ```kql
   cluster("ACR").database("acrprod").RegistryMasterData
   | where env_time >= ago(7d)
   | where LoginServerName == "<registryName>.azurecr.io"
   | project env_time, LoginServerName, ParentRegistryId, SkuId, SubscriptionId, ResourceGroup, RegistryLocation, ByokEnabled
   ```
4. **查询旧 RegistryId**
   ```kql
   cluster("ACR").database("acrprod").WorkerServiceActivity
   | where env_time > ago(10d)
   | where RegistryLoginUri == "<registryName>.azurecr.io"
   | summarize count() by RegistryId, SourceMoniker
   ```
5. **执行恢复** → Jarvis: Restore Deleted Registry (先 Dry Run)
6. **注意**: PE/Webhook 需客户重建; Tombstone 保留 90 天; CMK 注册表无法恢复

---

## Scenario 3: CMK 身份恢复
> 来源: ado-wiki-a-technical-advisors-actions.md | 适用: Global ✅

### User Assigned Identity 被删除
1. 客户创建新 Identity 并授权 Key Vault (get, wrapKey, unwrapKey)
2. TA 使用 Jarvis Action 更新 CMK 属性中的 Identity
3. 客户关联新 Identity 到注册表

### System Assigned Identity 被删除
1. 尝试启用 (会失败但创建后端 Identity)
2. 授予 Key Vault 权限
3. 再次启用 (应成功)

---

## Scenario 4: Jarvis 查看 Private Endpoint 和防火墙
> 来源: ado-wiki-a-jarvis-actions.md | 适用: Global ✅

### Private Endpoint
- Jarvis: Get Registry Private Endpoints → NRP PE ID → ASC 查找关联 VNet
- JIT: Scope=ACRSupport, AccessLevel=PlatformServiceOperator

### 防火墙规则
- Jarvis: Get Registry Master Entity → 查看 IP rules 和 FirewallRulesEnabled

### 注册表大小重新计算
- Jarvis: Recalculate registry size → Confirm=false 先查看不更新
