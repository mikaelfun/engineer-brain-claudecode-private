# 工作流：管道触发与监控

## 场景
用户需要查看、触发 Azure DevOps 管道，并监控构建状态。

## 步骤

### Step 1：查找管道

```powershell
$env:AZURE_CONFIG_DIR = "$env:USERPROFILE\.azure-profiles\{profile_name}"

# 列出项目下所有管道
az pipelines list --project {project} `
  --org https://dev.azure.com/{ado_org} --only-show-errors -o table

# 查看管道详情
az pipelines show --id {pipelineId} --project {project} `
  --org https://dev.azure.com/{ado_org} --only-show-errors -o json
```

### Step 2：触发管道运行

```powershell
$env:AZURE_CONFIG_DIR = "$env:USERPROFILE\.azure-profiles\{profile_name}"

# 基本触发
az pipelines run --id {pipelineId} --project {project} `
  --org https://dev.azure.com/{ado_org} --only-show-errors -o json

# 指定分支触发
az pipelines run --id {pipelineId} --project {project} `
  --branch refs/heads/{branchName} `
  --org https://dev.azure.com/{ado_org} --only-show-errors -o json

# 带变量触发
az pipelines run --id {pipelineId} --project {project} `
  --variables "env=staging" "debug=true" `
  --org https://dev.azure.com/{ado_org} --only-show-errors -o json
```

### Step 3：查看构建状态

```powershell
$env:AZURE_CONFIG_DIR = "$env:USERPROFILE\.azure-profiles\{profile_name}"

# 列出最近构建
az pipelines build list --project {project} --top 10 `
  --org https://dev.azure.com/{ado_org} --only-show-errors -o table

# 查看构建详情
az pipelines build show --id {buildId} --project {project} `
  --org https://dev.azure.com/{ado_org} --only-show-errors -o json

# 按管道过滤最近构建
az pipelines build list --project {project} --definition-ids {pipelineId} --top 5 `
  --org https://dev.azure.com/{ado_org} --only-show-errors -o table
```

### Step 4：查看构建日志（高级）

```powershell
$env:AZURE_CONFIG_DIR = "$env:USERPROFILE\.azure-profiles\{profile_name}"

# 列出构建的日志
az devops invoke --area build --resource builds `
  --route-parameters project={project} buildId={buildId} `
  --resource logs `
  --org https://dev.azure.com/{ado_org} `
  --api-version 7.0-preview --only-show-errors -o json
```

### Step 5：查看管道运行记录

```powershell
$env:AZURE_CONFIG_DIR = "$env:USERPROFILE\.azure-profiles\{profile_name}"

# 列出管道的运行记录
az pipelines runs list --pipeline-ids {pipelineId} --project {project} `
  --org https://dev.azure.com/{ado_org} --only-show-errors -o table
```

## 常用构建状态

| 状态 | 含义 |
|------|------|
| `notStarted` | 排队中 |
| `inProgress` | 运行中 |
| `completed` | 已完成 |

## 常用构建结果

| 结果 | 含义 |
|------|------|
| `succeeded` | 成功 |
| `failed` | 失败 |
| `canceled` | 已取消 |
| `partiallySucceeded` | 部分成功 |

## 注意事项

- 触发管道需要相应权限（Queue builds 权限）
- `--branch` 参数需要完整引用格式 `refs/heads/{branchName}`
- 管道变量通过 `--variables` 传入，格式为 `"key=value"`
