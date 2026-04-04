# 工作流：搜索 Wiki 并读取内容

## 场景
用户想要在某个 ADO 项目的 Wiki 中搜索关键词，找到相关页面后读取具体内容。

## 步骤

### Step 1：确定组织、项目和 Wiki 名称

```powershell
$env:AZURE_CONFIG_DIR = "$env:USERPROFILE\.azure-profiles\{profile_name}"

# 列出项目下的 Wiki
az devops wiki list --project {project} --org https://dev.azure.com/{ado_org} `
  --only-show-errors -o table
```

### Step 2：搜索 Wiki 内容（两种方式）

#### 方式 A：全文搜索（推荐，搜索标题+正文）

```powershell
$env:AZURE_CONFIG_DIR = "$env:USERPROFILE\.azure-profiles\{profile_name}"

$body = @{ searchText = "关键词"; '$top' = 10 } | ConvertTo-Json
$body | Out-File -FilePath "$env:TEMP\wiki_search.json" -Encoding utf8

az devops invoke --area search --resource wikiSearchResults `
  --route-parameters project={project} `
  --http-method POST --in-file "$env:TEMP\wiki_search.json" `
  --org https://dev.azure.com/{ado_org} `
  --api-version 7.0-preview --only-show-errors -o json `
  --query "results[].{fileName:fileName, path:path}"
```

#### 方式 B：页面树过滤（按标题路径匹配）

当全文搜索权限不足或需要浏览目录结构时：

```powershell
$env:AZURE_CONFIG_DIR = "$env:USERPROFILE\.azure-profiles\{profile_name}"

# 获取完整页面树
az devops wiki page show --path "/" --wiki {wiki} --project {project} `
  --recursion-level full --org https://dev.azure.com/{ado_org} `
  --only-show-errors -o json --query "page" > "$env:TEMP\wiki_tree.json"

# 解析并过滤
$json = Get-Content "$env:TEMP\wiki_tree.json" -Raw
$jsonStart = $json.IndexOf("{")
$json = $json.Substring($jsonStart) | ConvertFrom-Json

function Get-AllPages($page) {
    if ($page.path) { $page.path }
    if ($page.subPages) { foreach ($sub in $page.subPages) { Get-AllPages $sub } }
}

$allPages = @(Get-AllPages $json)
$allPages | Where-Object { $_ -match "(?i)关键词" }
```

### Step 3：读取匹配页面的内容

从 Step 2 的搜索结果中取出路径，注意路径转换：
- 全文搜索返回的 `path` 是 git 文件路径，需要转换为 Wiki 页面路径，转换规则：
  1. 去掉 `.md` 后缀
  2. 将路径中的连字符 `-` 替换为空格 ` `（Code Wiki 的 git 存储会把空格编码为连字符）
  3. 如果路径以 WikiName 开头，去掉该前缀
- 示例：git 路径 `/Azure-DB-for-MySQL-Flexible/Troubleshooting-Guides/Major-database-version-upgrade.md`
  → Wiki 页面路径 `/Azure DB for MySQL Flexible/Troubleshooting Guides/Major database version upgrade`

```powershell
$env:AZURE_CONFIG_DIR = "$env:USERPROFILE\.azure-profiles\{profile_name}"

az devops wiki page show --path "{pagePath}" --wiki {wiki} --project {project} `
  --include-content --org https://dev.azure.com/{ado_org} `
  --only-show-errors -o json --query "page.content"
```

### Step 4：总结内容

将读取到的 Markdown 内容进行总结，提取关键信息回复给用户。

## 注意事项

- 全文搜索的 `path` 是 git 路径格式，读取内容时需要使用 Wiki 页面路径格式（去 `.md`、连字符 `-` 替换为空格）
- 页面树获取对大型 Wiki（如 1000+ 页面）可能较慢，建议先用全文搜索
- 如果需要搜索多个关键词，可在 `searchText` 中用空格分隔
