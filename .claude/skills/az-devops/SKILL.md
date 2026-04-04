---
name: az-devops
description: 通过 az devops CLI 操作 Azure DevOps。支持 Wiki 搜索/浏览/编辑、工作项管理、管道触发、代码仓库和 PR 管理。当用户需要查看 ADO Wiki、搜索 TSG/SOP、创建或查询工作项、触发管道、管理 PR 时使用。触发词：ADO、Azure DevOps、Wiki、工作项、Work Item、Pipeline、管道、TSG、SOP、DevOps 搜索。
compatibility: Requires Azure CLI with azure-devops extension, PowerShell. Windows and macOS/Linux supported.
metadata:
  author: jinlh
  version: "1.1"
---

# Azure DevOps CLI 操作技能

通过 `az devops` CLI 及其扩展命令（`az boards`、`az pipelines`、`az repos`）操作 Azure DevOps Services。

## 前置条件

1. **扩展安装**：`az extension add --name azure-devops`（已安装则跳过）
2. **认证 profile**：通过 `az-profile-switch` skill 管理，详见下方「认证与 Profile 选择」

**关键：每次 Shell 调用的第一行必须设置 `AZURE_CONFIG_DIR`**，因为环境变量不跨调用持久化。

## 跨平台适配

本 skill 中的示例以 PowerShell 语法编写。`az devops` 命令本身跨平台通用，仅 Shell 层面的操作需要适配：

| 操作 | Windows PowerShell | Linux/macOS Bash |
|------|-------------------|------------------|
| 设置认证 | `$env:AZURE_CONFIG_DIR = "$env:USERPROFILE\.azure-profiles\{name}"` | `export AZURE_CONFIG_DIR=~/.azure-profiles/{name}` |
| 临时文件路径 | `$env:TEMP\file.json` | `/tmp/file.json` |
| 写入临时文件 | `$body \| Out-File -FilePath "$env:TEMP\file.json" -Encoding utf8` | `echo "$body" > /tmp/file.json` |
| 行续接符 | `` ` ``（反引号） | `\`（反斜杠） |
| JSON 解析 | `ConvertFrom-Json` | `jq` |

**规则**：根据用户当前运行环境自动选择语法。如果无法判断，询问用户使用的是 PowerShell 还是 Bash。

## 认证与 Profile 选择

不同的 ADO 组织可能需要不同的 az cli profile 认证（如 corp 账号访问 Supportability 组织，mooncake 账号访问中国区组织）。

**操作前的认证判断流程**：

1. 确定目标组织（从 CSV 或用户指定）
2. 判断当前会话是否已经切换到了能访问该组织的 profile：
   - 如果用户本次会话已通过 `az-profile-switch` 切换过 profile，优先使用该 profile
   - 如果用户未指定 profile，先尝试用当前 profile 执行命令
   - 如果返回权限错误（TF400813 Unauthorized），提示用户需要切换到正确的 profile
3. 每次调用的第一行设置认证：
   ```powershell
   # PowerShell
   $env:AZURE_CONFIG_DIR = "$env:USERPROFILE\.azure-profiles\{profile_name}"
   # Bash
   # export AZURE_CONFIG_DIR=~/.azure-profiles/{profile_name}
   ```

**示例场景**：用户说"查一下 Supportability 里 AzureDBPostgreSQL 的 Wiki"
→ 使用 corp profile → `$env:AZURE_CONFIG_DIR = "$env:USERPROFILE\.azure-profiles\corp"`

## 组织与项目映射

### 映射文件

产品到 ADO 组织/项目的映射关系存储在 [assets/ado_projects.csv](assets/ado_projects.csv)，格式为：

```csv
product_name,ado_org,ado_project
Azure Database for PostgreSQL,Supportability,AzureDBPostgreSQL
```

使用时根据用户提到的产品名，查找 CSV 中的 `ado_org` 和 `ado_project`，构造命令参数：
```powershell
--org https://dev.azure.com/{ado_org} --project {ado_project}
```

### 初始化引导（映射文件不存在时）

如果 `assets/ado_projects.csv` 不存在，引导用户创建：

1. 询问用户需要操作的 ADO 组织名称（如 `Supportability`）
2. 确认用户当前使用的 az cli profile 能访问该组织
3. 运行 `az devops project list --org https://dev.azure.com/{org}` 列出该组织下的项目
4. 询问用户选择要映射的产品和项目
5. 将映射关系写入 `~/.copilot/skills/az-devops/assets/ado_projects.csv`
6. 后续添加新组织/项目，只需在 CSV 中追加行即可

## 命令速查表

### 1. Core 管理

```powershell
# 列出项目
az devops project list --org {org} --top {n} -o table

# 列出团队
az devops team list --project {project} --org {org} -o table
```

### 2. Wiki 操作

```powershell
# 列出 Wiki
az devops wiki list --project {project} --org {org} -o table

# 查看 Wiki 详情
az devops wiki show --wiki {wiki} --org {org} -o json

# 查看页面（含子页面树）
az devops wiki page show --path "/" --wiki {wiki} --project {project} `
  --recursion-level full --org {org} -o json

# 查看页面正文内容
az devops wiki page show --path "{pagePath}" --wiki {wiki} --project {project} `
  --include-content --org {org} -o json --query "page.content"

# 创建页面
az devops wiki page create --path "{pagePath}" --wiki {wiki} --project {project} `
  --content "页面内容" --org {org}

# 编辑页面（需要 ETag 版本号）
az devops wiki page update --path "{pagePath}" --wiki {wiki} --project {project} `
  --content "更新内容" --version {eTag} --org {org}

# 删除页面
az devops wiki page delete --path "{pagePath}" --wiki {wiki} --project {project} `
  --version {eTag} --org {org}
```

### 3. Boards 工作项

```powershell
# 查看工作项
az boards work-item show --id {id} --org {org} -o json

# 创建工作项
az boards work-item create --type "Bug" --title "标题" `
  --project {project} --org {org} `
  --fields "System.Description=描述内容" "Microsoft.VSTS.Common.Priority=2"

# 更新工作项
az boards work-item update --id {id} --state "Active" --org {org}

# WIQL 查询工作项
az boards query --wiql "SELECT [System.Id], [System.Title], [System.State] `
  FROM workitems WHERE [System.TeamProject] = '{project}' `
  AND [System.WorkItemType] = 'Bug' AND [System.State] = 'Active'" `
  --org {org} -o table
```

### 4. Pipelines 管道

```powershell
# 列出管道
az pipelines list --project {project} --org {org} -o table

# 查看管道详情
az pipelines show --id {id} --project {project} --org {org} -o json

# 触发管道运行
az pipelines run --id {id} --project {project} --org {org} `
  --branch {branch} -o json

# 查看构建列表
az pipelines build list --project {project} --org {org} --top {n} -o table

# 查看构建详情
az pipelines build show --id {buildId} --project {project} --org {org} -o json
```

### 5. Repos 代码仓库

```powershell
# 列出仓库
az repos list --project {project} --org {org} -o table

# 查看仓库详情
az repos show --repository {repoName} --project {project} --org {org} -o json

# 列出 PR
az repos pr list --project {project} --org {org} --status active -o table

# 查看 PR 详情
az repos pr show --id {prId} --org {org} -o json

# 创建 PR
az repos pr create --repository {repoName} --source-branch {source} `
  --target-branch {target} --title "PR 标题" --project {project} --org {org}
```

### 6. 高级操作（az devops invoke）

当原生命令不支持某个操作时，使用 `az devops invoke` 直接调用 REST API。

**基本语法**：
```powershell
az devops invoke --area {area} --resource {resource} `
  --route-parameters {key}={value} `
  --query-parameters "{param}={value}" `
  --http-method {GET|POST} `
  --api-version {version} `
  --org {org} -o json
```

**POST 请求需要 --in-file**：将 JSON body 写入临时文件再传入。

详细的 invoke 命令模板见 [invoke-recipes.md](references/invoke-recipes.md)。

## 工作流参考

根据任务类型，参考对应的多步骤工作流指南：

- [搜索 Wiki 并读取内容](workflows/wiki-search-and-read.md)
- [工作项管理](workflows/work-item-management.md)
- [管道触发与监控](workflows/pipeline-trigger.md)

## 输出与解析规范

- 结构化数据用 `-o json`，可读展示用 `-o table`
- 使用 `--query` (JMESPath) 在命令层面过滤字段，减少输出量
- 复杂过滤（如 Wiki 页面树搜索关键词）：PowerShell 用 `ConvertFrom-Json` + `Where-Object`，Bash 用 `jq`
- 始终加 `--only-show-errors` 抑制警告信息

## 注意事项

1. **环境变量不跨调用持久化**：每次调用第一行必须设置 `AZURE_CONFIG_DIR`（PowerShell: `$env:AZURE_CONFIG_DIR`，Bash: `export AZURE_CONFIG_DIR`）
2. **仅支持 Azure DevOps Services（云版本）**：不支持 Azure DevOps Server（本地部署）
3. **编码问题**：Windows 终端可能出现 `cp1252` 编码错误，加 `--only-show-errors` 可避免大部分警告（Linux/macOS 无此问题）
4. **Wiki 页面路径中的特殊字符**：空格和特殊字符在路径中保持原样（CLI 会自动处理 URL 编码）
5. **invoke 的 API 版本**：大部分资源需要 `7.0-preview` 而非 `7.0`，否则会报版本错误
