# az devops invoke 高级命令速查

当 `az devops` 原生命令不支持某个操作时，使用 `az devops invoke` 直接调用 Azure DevOps REST API。

## 通用语法

```powershell
$env:AZURE_CONFIG_DIR = "$env:USERPROFILE\.azure-profiles\{profile_name}"

# GET 请求
az devops invoke --area {area} --resource {resource} `
  --route-parameters {key}={value} `
  --query-parameters "{param}={value}" `
  --org https://dev.azure.com/{ado_org} --api-version 7.0-preview --only-show-errors -o json

# POST 请求（需要 --in-file）
$body = @{ key = "value" } | ConvertTo-Json
$body | Out-File -FilePath "$env:TEMP\request_body.json" -Encoding utf8
az devops invoke --area {area} --resource {resource} `
  --route-parameters {key}={value} `
  --http-method POST --in-file "$env:TEMP\request_body.json" `
  --org https://dev.azure.com/{ado_org} --api-version 7.0-preview --only-show-errors -o json
```

## 命令模板

### 1. Wiki 全文搜索

搜索 Wiki 页面的标题和正文内容。

```powershell
$env:AZURE_CONFIG_DIR = "$env:USERPROFILE\.azure-profiles\{profile_name}"

$body = @{
    searchText = "搜索关键词"
    '$top' = 10
    '$skip' = 0
} | ConvertTo-Json
$body | Out-File -FilePath "$env:TEMP\wiki_search.json" -Encoding utf8

az devops invoke --area search --resource wikiSearchResults `
  --route-parameters project={project} `
  --http-method POST --in-file "$env:TEMP\wiki_search.json" `
  --org https://dev.azure.com/{ado_org} `
  --api-version 7.0-preview --only-show-errors -o json `
  --query "results[].{fileName:fileName, path:path}"
```

**返回字段说明**：
- `fileName`：Wiki 页面文件名
- `path`：完整路径（可用于 `az devops wiki page show --path` 读取内容）
- `hits`：匹配的高亮片段

### 2. Identity 搜索（按显示名称）

```powershell
$env:AZURE_CONFIG_DIR = "$env:USERPROFILE\.azure-profiles\{profile_name}"

az devops invoke --area IMS --resource identities `
  --query-parameters "searchFilter=DisplayName" "filterValue={displayName}" `
  --org https://dev.azure.com/{ado_org} `
  --api-version 7.0-preview --only-show-errors -o json `
  --query "value[].{id:id, displayName:providerDisplayName}"
```

**可用的 searchFilter 类型**：
- `DisplayName`：按显示名称搜索
- `General`：按邮箱/通用标识搜索（注意：对 AAD 企业账号可能返回空）

### 3. 我的团队（$mine 过滤）

列出当前认证用户所在的团队。

```powershell
$env:AZURE_CONFIG_DIR = "$env:USERPROFILE\.azure-profiles\{profile_name}"

az devops invoke --area core --resource teams `
  --route-parameters project={project} `
  --query-parameters '$mine=true' `
  --org https://dev.azure.com/{ado_org} `
  --api-version 7.0-preview --only-show-errors -o json `
  --query "value[].{name:name, id:id}"
```

**注意**：
- 不带 `project` route-parameter 时，返回整个组织中你所在的所有团队
- 在 Windows 上使用 `--query` (JMESPath) 的 `contains()` 函数时，单引号可能被 CMD 解析出错；建议改在 PowerShell 中过滤：
  ```powershell
  $teams = az devops invoke ... -o json | ConvertFrom-Json
  $teams.value | Where-Object { $_.name -match "AzureDBPostgreSQL" }
  ```

### 4. Code 搜索

搜索代码仓库中的代码内容。

```powershell
$env:AZURE_CONFIG_DIR = "$env:USERPROFILE\.azure-profiles\{profile_name}"

$body = @{
    searchText = "搜索关键词"
    '$top' = 10
    '$skip' = 0
    filters = @{
        Project = @("{project}")
    }
} | ConvertTo-Json -Depth 3
$body | Out-File -FilePath "$env:TEMP\code_search.json" -Encoding utf8

az devops invoke --area search --resource codeSearchResults `
  --route-parameters project={project} `
  --http-method POST --in-file "$env:TEMP\code_search.json" `
  --org https://dev.azure.com/{ado_org} `
  --api-version 7.0-preview --only-show-errors -o json `
  --query "results[].{fileName:fileName, path:path, repository:repository.name}"
```

### 5. Work Item 搜索

搜索工作项的标题和描述。

```powershell
$env:AZURE_CONFIG_DIR = "$env:USERPROFILE\.azure-profiles\{profile_name}"

$body = @{
    searchText = "搜索关键词"
    '$top' = 10
    '$skip' = 0
    filters = @{
        "System.TeamProject" = @("{project}")
    }
} | ConvertTo-Json -Depth 3
$body | Out-File -FilePath "$env:TEMP\wi_search.json" -Encoding utf8

az devops invoke --area search --resource workItemSearchResults `
  --route-parameters project={project} `
  --http-method POST --in-file "$env:TEMP\wi_search.json" `
  --org https://dev.azure.com/{ado_org} `
  --api-version 7.0-preview --only-show-errors -o json `
  --query "results[].{id:fields.\"system.id\", title:fields.\"system.title\", state:fields.\"system.state\"}"
```

## 发现可用的 API Area 和 Resource

如果需要调用上面未列出的 API，先用以下命令发现可用资源：

```powershell
# 列出所有可用的 area 和 resource（需要等待较长时间）
az devops invoke --org {org} -o json --query "[?contains(area,'{keyword}')]"

# 示例：查找与 'wiki' 相关的 API
az devops invoke --org {org} -o json --query "[?contains(area,'wiki')]"
```

## 常见错误处理

| 错误 | 原因 | 解决 |
|------|------|------|
| `--area is not present in current organization` | area 名称错误 | 用上面的发现命令查找正确的 area |
| `The requested version "7.0" ... must supply -preview flag` | API 版本需要 preview | 改用 `--api-version 7.0-preview` |
| `TF400813: The user is not authorized` | 权限不足 | 检查 profile 是否正确、是否有项目访问权限 |
| `charmap codec can't encode character` | Windows 编码问题 | 加 `--only-show-errors`，或输出到文件后用 PowerShell 处理 |
