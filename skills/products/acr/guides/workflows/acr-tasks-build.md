# ACR Tasks 与构建 — 排查工作流

**来源草稿**: ado-wiki-acr-buildkit-secrets.md
**Kusto 引用**: acr-task.md
**场景数**: 4
**生成日期**: 2026-04-07

---

## Scenario 1: ACR Task 构建失败排查
> 来源: acr-task.md | 适用: Mooncake ✅

### 排查步骤

1. **按注册表查询构建日志**
   ```kql
   cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').BuildHostTrace
   | where env_time > ago(3d)
   | where Tag contains "{registry}.azurecr.cn"
   | order by env_time
   | project env_time, Message, Tag, DataJson, SourceNamespace
   ```

2. **按 RUN_ID 查询详细日志**
   ```kql
   cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').BuildHostTrace
   | where env_time > ago(1d)
   | where Tag contains "{registry}.azurecr.cn_{runId}"
   | order by env_time
   | project env_time, Level, Component, Message, Exception, DataJson
   ```
   > Tag 格式: `{registry}.azurecr.cn_{runId}` (例: `myacr.azurecr.cn_cc1`)

3. **查询构建错误**
   ```kql
   cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').BuildHostTrace
   | where env_time > ago(7d)
   | where Tag contains "{registry}.azurecr.cn"
   | where isnotempty(Exception) or Level >= 3
   | project env_time, Tag, Level, Component, Message, Exception
   | order by env_time desc
   ```

4. **分析 Exception 字段** 确定根因

---

## Scenario 2: 查看最近失败的构建
> 来源: acr-task.md | 适用: Mooncake ✅

### 排查步骤

1. **列出最近 20 个失败构建**
   ```kql
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

2. **构建任务统计（成功/失败/耗时）**
   ```kql
   cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').BuildHostTrace
   | where env_time > ago(7d)
   | where Tag contains ".azurecr.cn"
   | extend Registry = extract(@"^([^_]+)", 1, Tag)
   | extend RunId = extract(@"_(.+)$", 1, Tag)
   | summarize 
       FirstLog = min(env_time),
       LastLog = max(env_time),
       LogCount = count(),
       HasError = countif(isnotempty(Exception)) > 0
     by Registry, RunId
   | extend Duration = LastLog - FirstLog
   | order by FirstLog desc
   ```

---

## Scenario 3: BuildKit Secrets 使用
> 来源: ado-wiki-acr-buildkit-secrets.md | 适用: Mooncake ✅

### 从文件传递 Secret

1. **task.yaml 配置**
   ```yaml
   version: v1.1.0
   steps:
    - build: -t $Registry/hello-world:{{.Run.ID}} --secret id=mysecret,src=mysecret.txt .
      env: ["DOCKER_BUILDKIT=1"]
    - push:
        - $Registry/hello-world:{{.Run.ID}}
   ```

2. **运行**
   ```bash
   az acr run --registry <acrname> -f task.yaml .
   ```

### 从 Key Vault 传递 Secret

1. **task.yaml 配置**
   ```yaml
   version: v1.1.0
   secrets:
     - id: sampleSecret
       keyvault: https://<keyvault-name>.vault.azure.net/secrets/SampleSecret
   volumes:
     - name: mysecrets
       secret:
         mysecret1: {{.Secrets.sampleSecret | b64enc}}
   steps:
     - build: ... --secret id=mysecret1,src=/run/test/mysecret1 ...
       env: ["DOCKER_BUILDKIT=1"]
       volumeMounts:
         - name: mysecrets
           mountPath: /run/test
   ```

2. **授予 Managed Identity Key Vault 访问权限**
   ```bash
   az keyvault set-policy --name mykeyvault \
     --resource-group myResourceGroup \
     --object-id $ManagedIdentity-ObjectID \
     --secret-permissions get
   ```

---

## Scenario 4: 构建任务详细时间线分析
> 来源: acr-task.md | 适用: Mooncake ✅

### 排查步骤

1. **查询构建各步骤耗时**
   ```kql
   cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').BuildHostTrace
   | where env_time > ago(1d)
   | where Tag == "{registry}.azurecr.cn_{runId}"
   | extend DataParsed = parse_json(DataJson)
   | project env_time, Level, Component, Message, 
            Step = tostring(DataParsed.step),
            Status = tostring(DataParsed.status),
            Duration = tostring(DataParsed.duration)
   | order by env_time asc
   ```

2. **识别瓶颈步骤**
   - 某步骤 Duration 特别长 → 优化该步骤
   - 网络相关步骤慢 → 检查 network bypass 配置
