# ACR Tasks 构建与自动化 — 综合排查指南

**条目数**: 9 | **草稿融合数**: 1 | **Kusto 查询融合**: 1
**来源草稿**: [ado-wiki-acr-buildkit-secrets.md](../drafts/ado-wiki-acr-buildkit-secrets.md)
**Kusto 引用**: [acr-task.md](../../../../kusto/acr/references/queries/acr-task.md)
**生成日期**: 2026-04-05

---

## 排查流程

### Phase 1: 确认 ACR Task 运行状态与日志
> 来源: [ADO Wiki — Check ACR tasks and outputs](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FCheck%20ACR%20tasks%20and%20outputs) + [MCVKB/ACR/##Task.md](../../known-issues.jsonl)

1. 查询 BuildHostTrace 获取构建日志，确认 Task 是否触发、运行到哪一步
   ```kusto
   cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').BuildHostTrace
   | where env_time > ago(3d)
   | where Tag contains "{registry}.azurecr.cn"
   | order by env_time
   | project env_time, Message, Tag, DataJson, SourceNamespace
   ```
   `[工具: Kusto skill — acr-task.md]`

2. 按 RUN_ID 精确查询特定构建任务日志
   ```kusto
   cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').BuildHostTrace
   | where env_time > ago(1d)
   | where Tag contains "{registry}.azurecr.cn_{runId}"
   | order by env_time
   | project env_time, Level, Component, Message, Exception, DataJson
   ```
   `[工具: Kusto skill — acr-task.md]`

3. 查看构建错误，筛选有异常或高级别日志的条目
   ```kusto
   cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').BuildHostTrace
   | where env_time > ago(7d)
   | where Tag contains "{registry}.azurecr.cn"
   | where isnotempty(Exception) or Level >= 3
   | project env_time, Tag, Level, Component, Message, Exception
   | order by env_time desc
   ```
   `[工具: Kusto skill — acr-task.md]`

4. 查看最近失败的构建任务汇总
   ```kusto
   cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').BuildHostTrace
   | where env_time > ago(7d)
   | where Tag contains "{registry}.azurecr.cn"
   | where isnotempty(Exception)
   | extend RunId = extract(@"_(.+)$", 1, Tag)
   | summarize 
       ErrorTime = max(env_time),
       ErrorMessage = take_any(Message),
       ExceptionSummary = take_any(substring(Exception, 0, 200))
     by RunId
   | order by ErrorTime desc
   | take 20
   ```
   `[工具: Kusto skill — acr-task.md]`

**判断逻辑**：
| 条件 | 含义 | 后续动作 |
|------|------|---------|
| 构建未触发 | 触发器配置问题或暂停限制 | → Phase 2a |
| 403 Forbidden 错误 | 网络绕过策略变更 | → Phase 2b |
| 网络受限 ACR (Private Endpoint) | 需特殊配置 | → Phase 2c |
| BuildKit / Secrets 相关错误 | 构建配置问题 | → Phase 3 |
| CSSC 持续修补失败 | 缓存规则或 Copa 镜像问题 | → Phase 4 |
| "free credit payment plan" 错误 | 免费订阅限制 | → Phase 2d |

`[结论: 🟢 8.5/10 — ADO Wiki(2.5) + Kusto 工具验证 + Mooncake 适用(2) + 时效<6月(2)]`

### Phase 2a: ACR Task 免费订阅限制
> 来源: [ADO Wiki — ACR Tasks Temporary Pause](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Tasks%20Temporary%20Pause)

**症状**：ACR Tasks 失败，错误信息含 `ACR Tasks requests for the registry {registryName} are not supported since the subscription {subscriptionId} is using the free Azure credit payment plan`

**解决方案**：
1. 确认客户订阅是否使用 Azure 试用/免费额度（$200 USD、Azure for Students 等）
2. 建议客户升级到付费订阅
3. 如客户需保留免费额度使用 Task：收集信息（工作负载类型、预期用量）→ 提交 ICM 给 ACR PG 请求访问授权
4. PG 审批后确认访问权限，关闭 Case

> **21V 适用**: 适用

`[结论: 🟢 8/10 — ADO Wiki(2.5) + 时效<6月(2) + 单源+实证(2) + 通用(1.5)]`

### Phase 2b: ACR Task 网络绕过策略变更 (403 Forbidden)
> 来源: [ADO Wiki — ACR Tasks Network Bypass Policy](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Tasks%20Network%20Bypass%20Policy)

**症状**：2025 年 6 月后 ACR Tasks 返回 403 Forbidden，之前正常工作的网络绕过功能被阻断

**根因**：ACR 默认行为变更——`networkRuleBypassAllowedForTasks` 标志默认值从允许改为拒绝（Phase 2 安全修复 ICM#561798833）

**解决方案**：
1. 显式启用新标志：
   ```bash
   az acr update --name <registry-name> --set networkRuleBypassAllowedForTasks=true
   ```
2. 使用 ACR Agent Pool（**21V/Mooncake 不可用**）：
   ```bash
   az acr agentpool create --name <pool> --registry <reg> --vnet <vnet>
   ```
3. 或从自托管环境（有 ACR 直连权限的）构建/推送镜像，绕过 ACR Tasks
4. 如需 DRI opt-in，通过 Teams 或 IcM 模板联系 ACR PG

> **21V 注意**: Agent Pool 在 Mooncake 不可用。方案 1 和 3 可用。

`[结论: 🟢 8.5/10 — ADO Wiki(2.5) + 时效<6月(2) + 单源+实证(2) + 明确 Mooncake(2)]`

### Phase 2c: 网络受限 ACR 中的 Task 配置
> 来源: [MCVKB/ACR/##Task.md](../../known-issues.jsonl)

**症状**：ACR 禁用公网访问后 Task 运行失败

**根因**：ACR Task 在网络受限注册表中需要 system-assigned managed identity 和受信任服务配置

**解决方案**：
1. 启用 "Allow trusted Microsoft services to access this container registry"
2. 创建 Task 时使用 `--assign-identity`（system-assigned MI）：
   ```bash
   az acr task create --name <task> --registry <acr> \
     --assign-identity --image <image>:{{.Run.ID}} \
     --context <repo-url> --file Dockerfile
   ```
3. 为 system MI 分配 `acrpush` 角色：
   ```bash
   az role assignment create --assignee <system-mi-principal-id> \
     --role acrpush --scope <acr-resource-id>
   ```
4. 添加 Task 凭据使用 system identity：
   ```bash
   az acr task credential add --name <task> --registry <acr> \
     --login-server <acr>.azurecr.cn --use-identity [system]
   ```

> **跨 ACR 场景**：base registry 也必须允许受信任服务，Task 必须使用 system MI 进行跨注册表认证

`[结论: 🟢 9/10 — OneNote(3) + 时效<6月(2) + 单源+实证(2) + 明确 Mooncake(2)]`

### Phase 2d: ACR Task Agent Pool 不可用 (Mooncake)
> 来源: [MCVKB/ACR/##Task.md](../../known-issues.jsonl)

**症状**：客户希望在 Mooncake 使用 ACR Task 专用 Agent Pool

**结论**：Feature gap — ACR Task Agent Pool 尚未部署到 Mooncake Cloud。告知客户这是已知限制。跟踪: ICM-570372647。

> **21V 限制**: 无可用替代方案

`[结论: 🟢 9/10 — OneNote(3) + 时效<6月(2) + 单源+实证(2) + 明确 Mooncake(2)]`

### Phase 3: BuildKit / Secrets / git-lfs 配置
> 来源: [ADO Wiki — Build an ACR image with Docker BuildKit](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FBuild%20an%20ACR%20image%20with%20Docker%20BuildKit%20and%20pass%20a%20secret)

#### 3a. 从文件传递 Secret

**task.yaml 示例**：
```yaml
version: v1.1.0
steps:
 - build: -t $Registry/hello-world:{{.Run.ID}} --secret id=mysecret,src=mysecret.txt --secret id=mysecret2,src=mysecret2.txt .
   env: ["DOCKER_BUILDKIT=1"]
 - push:
     - $Registry/hello-world:{{.Run.ID}}
```

**Dockerfile 示例**：
```dockerfile
FROM ubuntu
RUN --mount=type=secret,id=mysecret,uid=1001
RUN --mount=type=secret,id=mysecret2,uid=1001
```

运行命令：
```bash
az acr run --registry <acrname> -f task.yaml .
```

#### 3b. 从 Azure Key Vault 传递 Secret

**task.yaml 示例**（Key Vault 集成）：
```yaml
version: v1.1.0
secrets:
  - id: sampleSecret
    keyvault: https://<keyvault-name>.vault.azure.net/secrets/SampleSecret
  - id: mysecret
    keyvault: https://<keyvault-name>.vault.azure.net/secrets/mysecret

volumes:
  - name: mysecrets
    secret:
      mysecret1: {{.Secrets.sampleSecret | b64enc}}
      mysecret2: {{.Secrets.mysecret | b64enc}}

steps:
  - build: -t $Registry/hello-world:{{.Run.ID}} --secret id=mysecret1,src=/run/test/mysecret1 --secret id=mysecret2,src=/run/test/mysecret2 -f Dockerfile .
    env: ["DOCKER_BUILDKIT=1"]
    volumeMounts:
      - name: mysecrets
        mountPath: /run/test
  - push:
     - $Registry/hello-world:{{.Run.ID}}
```

**前提**：为 Managed Identity 授予 Key Vault `get` 权限：
```bash
az keyvault set-policy --name mykeyvault \
  --resource-group myResourceGroup \
  --object-id $ManagedIdentity-Object-ID \
  --secret-permissions get
```

#### 3c. 启用 git-lfs

在 build 步骤前添加 git-lfs 拉取：
```yaml
steps:
  - cmd: acb -c "git lfs install && git lfs pull"
    entryPoint: /bin/sh
  - build: ...
```

#### 3d. Azure DevOps Pipeline 中启用 BuildKit

```yaml
variables:
  DOCKER_BUILDKIT: 1
steps:
- task: Docker@2
  inputs:
    repository: $(imageName)
    command: build
    Dockerfile: app/Dockerfile
    arguments: '--secret id=CONAN_API_TOKEN,src=conan-api-token.txt'
```

`[结论: 🟢 8/10 — ADO Wiki(2.5) + 时效<6月(2) + 单源文档(1) + 明确 Mooncake(2) + Kusto 工具验证+1]`

### Phase 4: CSSC 持续修补 (Continuous Patching) 故障
> 来源: [ADO Wiki — Continuous Patching](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure+Kubernetes+Service+Wiki%2FACR%2FTSG%2FContinuous+Patching)

#### 4a. PTC 缓存规则冲突

**症状**：`cssc-patch-image` Task 在 push-image 步骤失败，缓存规则错误

**根因**：CSSC 工作流不支持包含 PTC (pull-through cache) 规则的仓库

**解决方案**：
- 切换到 Artifact sync 缓存规则
- 或在不包含 PTC 规则的其他仓库上运行 CSSC 工作流

#### 4b. Copa 工具镜像缺失

**症状**：`cssc-patch-image` Task 失败，'image not found in MCR'

**根因**：Copa 修补所需的工具镜像未在 MCR 中发布

**解决方案**：
- 联系上游团队 `azcu-publishing@microsoft.com`
- 或在 GitHub 提交 PR（microsoft/mcr repo，参考 PR#3914）发布缺失的工具镜像

`[结论: 🔵 7/10 — ADO Wiki(2.5) + 时效<6月(2) + 单源文档(1) + 通用(1.5)]`

### Phase 5: 从 Blob Storage 导入镜像到 ACR
> 来源: [MCVKB/ACR/import container image from storage](../../known-issues.jsonl)

**症状**：需要将 Blob Storage 中的 tar 包导入 ACR

**解决方案** — 使用 ACR Task 多步骤 YAML：

**方案 A：SAS Token**
```yaml
version: v1.1.0
steps:
  - cmd: curl -o image.tar "<blob-sas-url>"
  - cmd: docker load -i image.tar
  - cmd: docker tag <source-image> $Registry/<repo>:<tag>
  - push:
    - $Registry/<repo>:<tag>
```

**方案 B：Managed Identity**
- 创建 Task 时使用 `--assign-identity [system]`
- 为 system MI 授予 Storage Blob Data Reader 角色
- 在运行时通过 `169.254.169.254/metadata/identity/oauth2/token` 获取 Token

> **注意**：在 Linux 环境编辑 task.yaml（Windows 换行符会导致问题）

`[结论: 🟢 9/10 — OneNote(3) + 时效<6月(2) + 单源+实证(2) + 明确 Mooncake(2)]`

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | 网络受限 ACR 中 Task 运行失败 | 需 system MI + trusted services 配置 | 启用 trusted services + system MI + acrpush 角色 | 🟢 9 | [MCVKB/ACR/##Task](../../known-issues.jsonl) |
| 2 | Mooncake 不支持 Agent Pool | Feature gap | 已知限制，ICM-570372647 | 🟢 9 | [MCVKB/ACR/##Task](../../known-issues.jsonl) |
| 3 | 从 Blob Storage 导入镜像 | 需多步骤 Task | SAS/MI + curl + docker load + push | 🟢 9 | [MCVKB/ACR/import](../../known-issues.jsonl) |
| 4 📋 | BuildKit + Secrets + git-lfs 配置 | — | 见 Phase 3 完整指南 | 🟢 8 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FBuild%20an%20ACR%20image%20with%20Docker%20BuildKit%20and%20pass%20a%20secret) |
| 5 | Task 运行日志/错误诊断 | 需 Kusto 查询 BuildHostTrace | RunnerLogs + RunResult 分析 | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FCheck%20ACR%20tasks%20and%20outputs) |
| 6 | 2025/06 后 Task 403 Forbidden | networkRuleBypassAllowedForTasks 默认 deny | 显式 enable 或自建环境 | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Tasks%20Network%20Bypass%20Policy) |
| 7 | Task 报 free credit payment plan 错误 | ACR 暂停免费订阅的 Task | 升级付费或 ICM 申请 | 🟢 8 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Tasks%20Temporary%20Pause) |
| 8 | CSSC patch 在 PTC 仓库失败 | PTC 缓存规则不兼容 | 切换 Artifact sync 或换仓库 | 🔵 7 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure+Kubernetes+Service+Wiki%2FACR%2FTSG%2FContinuous+Patching) |
| 9 | CSSC patch 报 Copa 镜像缺失 | Copa 工具镜像未发布到 MCR | 联系上游或提 PR | 🔵 7 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure+Kubernetes+Service+Wiki%2FACR%2FTSG%2FContinuous+Patching) |
