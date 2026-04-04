# 工作流：工作项管理

## 场景
用户需要在 Azure DevOps 中创建、查询、更新工作项（Bug、Task、User Story 等）。

## 步骤

### Step 1：查询现有工作项

#### 按 ID 查看单个工作项
```powershell
$env:AZURE_CONFIG_DIR = "$env:USERPROFILE\.azure-profiles\{profile_name}"

az boards work-item show --id {workItemId} `
  --org https://dev.azure.com/{ado_org} --only-show-errors -o json
```

#### 使用 WIQL 查询多个工作项
```powershell
$env:AZURE_CONFIG_DIR = "$env:USERPROFILE\.azure-profiles\{profile_name}"

az boards query --wiql "SELECT [System.Id], [System.Title], [System.State], [System.AssignedTo] `
  FROM workitems `
  WHERE [System.TeamProject] = '{project}' `
  AND [System.WorkItemType] = 'Bug' `
  AND [System.State] = 'Active' `
  ORDER BY [System.CreatedDate] DESC" `
  --org https://dev.azure.com/{ado_org} --only-show-errors -o table
```

**常用 WIQL 过滤条件**：
- `[System.WorkItemType] = 'Bug'` / `'Task'` / `'User Story'`
- `[System.State] = 'New'` / `'Active'` / `'Resolved'` / `'Closed'`
- `[System.AssignedTo] = @Me`（当前用户）
- `[System.CreatedDate] >= @Today - 7`（最近 7 天）
- `[System.Tags] CONTAINS 'P1'`

### Step 2：创建工作项

```powershell
$env:AZURE_CONFIG_DIR = "$env:USERPROFILE\.azure-profiles\{profile_name}"

az boards work-item create --type "Bug" --title "工作项标题" `
  --project {project} --org https://dev.azure.com/{ado_org} `
  --description "详细描述" `
  --fields "Microsoft.VSTS.Common.Priority=2" `
           "System.Tags=P2; Upgrade" `
  --only-show-errors -o json
```

**常用字段名**：
| 字段 | 引用名 |
|------|--------|
| 标题 | `System.Title` |
| 描述 | `System.Description` |
| 状态 | `System.State` |
| 指派给 | `System.AssignedTo` |
| 优先级 | `Microsoft.VSTS.Common.Priority` |
| 标签 | `System.Tags` |
| 区域路径 | `System.AreaPath` |
| 迭代路径 | `System.IterationPath` |

### Step 3：更新工作项

```powershell
$env:AZURE_CONFIG_DIR = "$env:USERPROFILE\.azure-profiles\{profile_name}"

# 更新状态
az boards work-item update --id {workItemId} --state "Resolved" `
  --org https://dev.azure.com/{ado_org} --only-show-errors -o json

# 更新多个字段
az boards work-item update --id {workItemId} `
  --fields "System.AssignedTo=user@microsoft.com" `
           "Microsoft.VSTS.Common.Priority=1" `
  --org https://dev.azure.com/{ado_org} --only-show-errors -o json
```

### Step 4：搜索工作项（高级）

使用 `az devops invoke` 调用 Work Item Search API：

```powershell
$env:AZURE_CONFIG_DIR = "$env:USERPROFILE\.azure-profiles\{profile_name}"

$body = @{
    searchText = "搜索关键词"
    '$top' = 10
    filters = @{ "System.TeamProject" = @("{project}") }
} | ConvertTo-Json -Depth 3
$body | Out-File -FilePath "$env:TEMP\wi_search.json" -Encoding utf8

az devops invoke --area search --resource workItemSearchResults `
  --route-parameters project={project} `
  --http-method POST --in-file "$env:TEMP\wi_search.json" `
  --org https://dev.azure.com/{ado_org} `
  --api-version 7.0-preview --only-show-errors -o json
```

## 注意事项

- WIQL 查询中字符串值用单引号
- `--fields` 参数每个字段用 `"key=value"` 格式，多个字段空格分隔
- 创建工作项时 `--type` 的值取决于项目的流程模板（Agile、Scrum、CMMI 等）
