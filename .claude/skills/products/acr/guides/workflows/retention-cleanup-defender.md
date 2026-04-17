# ACR 保留策略、清理与 Defender 扫描 — 排查工作流

**来源草稿**: mslearn-acr-vulnerability-scanning.md
**Kusto 引用**: manifest-statistics.md
**场景数**: 3
**生成日期**: 2026-04-07

---

## Scenario 1: Defender 漏洞扫描配置与排查
> 来源: mslearn-acr-vulnerability-scanning.md | 适用: Mooncake ✅

### 前置条件
- Microsoft Defender for Cloud + Defender CSPM / Defender for Containers / Defender for Container Registries

### 排查步骤

1. **检查 Agentless 扩展状态**
   - Portal → Defender for Cloud → Environment Settings → 选择订阅
   - 确认 Agentless container vulnerability assessment 为 On

2. **查看漏洞评估结果**
   - Portal → Defender for Cloud → Recommendations
   - 搜索: Azure registry container images should have vulnerabilities resolved

3. **修复建议**: 使用最新 base image 重新构建 → Push → 等待扫描

4. **检测差异说明**: 第三方工具结果可能与 Defender 不同（不同检测标准）

---

## Scenario 2: 存储使用分析与 Manifest 统计
> 来源: manifest-statistics.md | 适用: Mooncake ✅

### 排查步骤

1. **存储使用趋势分析**
   ```kql
   cluster("https://acrmc2.chinaeast2.kusto.chinacloudapi.cn").database("acrprodmc").WorkerServiceActivity
   | where env_time > ago(7d)
   | where RegistryLoginUri == "{registry}.azurecr.cn"
   | where isnotempty(BlobSize) and BlobSize > 0
   | summarize TotalSizeGB = round(sum(BlobSize) / 1024 / 1024 / 1024, 2),
       UniqueBlobs = dcount(Digest), RepositoryCount = dcount(Repository)
     by bin(env_time, 1d)
   | order by env_time desc
   ```

2. **镜像类型分布**
   ```kql
   cluster("https://acrmc2.chinaeast2.kusto.chinacloudapi.cn").database("acrprodmc").WorkerServiceActivity
   | where env_time > ago(7d)
   | where RegistryLoginUri == "{registry}.azurecr.cn"
   | where isnotempty(ImageType)
   | summarize Count = count(), TotalSize = sum(BlobSize) by ImageType, MediaType
   | order by Count desc
   ```

3. **最近活跃仓库 Top 50**
   ```kql
   cluster("https://acrmc2.chinaeast2.kusto.chinacloudapi.cn").database("acrprodmc").WorkerServiceActivity
   | where env_time > ago(1d)
   | where RegistryLoginUri == "{registry}.azurecr.cn"
   | where isnotempty(Repository)
   | summarize ActivityCount = count(), LastActivity = max(env_time),
       Operations = make_set(OperationName, 5)
     by Repository
   | order by LastActivity desc
   | take 50
   ```

---

## Scenario 3: Retention Policy 排查
> 来源: ado-wiki-acr-investigate-bulk-image-tag-deletions.md | 适用: Global ✅

### 排查步骤

1. **检查 Retention Policy 是否触发删除**
   ```kql
   cluster("ACR").database("acrprod").RegistryActivity
   | where TIMESTAMP between (ago(7d) .. now())
   | where service == "eventserver"
   | where message startswith "queued_purge_message"
   | where message has "{registry}.azurecr.io"
   ```

2. **可视化 Retention 删除模式**
   ```kql
   cluster("ACR").database("acrprod").RPActivity
   | where env_time between (ago(30d) .. now())
   | where Message startswith "Queuing new delete manifest metadata message"
   | where Message has "{registry}.azurecr.io"
   | parse kind=regex Message with * "policyName : " parsedPolicyName:string
   | summarize DeletionCount=count() by parsedPolicyName, bin(env_time, 1d)
   | render timechart
   ```

3. **决策**: 意外删除 → 检查 Retention 配置，建议关键镜像启用 Image Lock
