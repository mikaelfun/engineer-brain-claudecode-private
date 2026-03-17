---
name: contentidea-kb-search
description: "搜索 ContentIdea 内部 KB 文章。通过 ADO ContentIdea Work Items 检索已发布的内部知识库文章，返回 KB 编号、标题、Internal Evergreen 链接及文章关键内容。触发词：ContentIdea KB、内部KB搜索、internal KB、搜索KB文章"
---

# ContentIdea KB 搜索 Skill

## 技能描述 (Description)
通过 ADO ContentIdea 项目的 Work Items 检索已发布的内部知识库 (KB) 文章。完整工作流包括：搜索匹配的 Content Idea Request → 提取 KB 编号和 Internal Evergreen 链接 → 汇总关键内容（症状、根因、解决方案）。

## 触发条件 (Trigger Conditions)
- 用户要求搜索内部 KB 文章
- 故障排查过程中需要检索 ContentIdea 已有的知识库
- 知识查找决策树中"ADO-ContentIdea 搜索"步骤

## 工作流程 (Workflow)

### 第一步：搜索 Work Items
使用 `ADO-ContentIdea-search_workitem` 搜索 Content Idea Request：

```
工具: ADO-ContentIdea-search_workitem
参数:
  searchText: <用户关键词>（使用英文关键词效果更好）
  top: 10
  workItemType: ["Content Idea Request"]  (可选，缩小范围)
```

**搜索技巧：**
- 使用多个关键词组合搜索，如 "WDAC block app policy"
- 如果首次搜索结果不理想，尝试同义词或更宽泛的关键词
- 可并行执行多组不同关键词的搜索以提高覆盖率

### 第二步：筛选有效结果
从搜索结果中筛选出有效的 Work Items：
- 优先选择 `System.State` 为 `Active` 或 `Closed` 的条目
- 检查搜索结果的 `highlights` 确认相关性
- 记录匹配的 Work Item IDs

### 第三步：提取 KB 信息
对每个匹配的 Work Item，使用 `ADO-ContentIdea-wit_get_work_item` 获取详细信息：

```
工具: ADO-ContentIdea-wit_get_work_item
参数:
  id: <work_item_id>
  project: "ContentIdea"
  expand: "relations"  (可选，获取关联信息)
```

**关键字段提取：**

| 字段路径 | 内容 | 说明 |
|----------|------|------|
| `ECO.CI.KBArticleNumbers` | KB 编号 | 如 "5081100" |
| `ECO.CI.O.ContentLink` | Internal Evergreen 链接 | 如 `https://internal.evergreen.microsoft.com/topic/...` |
| `ECO.CI.CI.SubStatus` | 发布状态 | "Published" 表示已发布 |
| `ECO.CI.PublishedDate` | 发布日期 | ISO 8601 格式 |
| `System.Title` | 文章标题 | Work Item 标题即 KB 标题 |
| `ECO.CI.CI.HelpArticleSummarySymptom` | 症状摘要 | HTML 格式 |
| `ECO.CI.CI.HelpArticleCause` | 根因 | HTML 格式 |
| `ECO.CI.CI.HelpArticleResolution` | 解决方案 | HTML 格式 |
| `ECO.CI.CI.HelpArticleMoreInfo` | 更多信息 | HTML 格式，含详细技术细节 |
| `ECO.CI.CI.AppliesToProducts` | 适用产品 | 产品名称列表 |
| `ECO.CI.CI.SupportTopics` | 支持主题 | 支持分类 |

**⚠️ 重要：** 只有 `ECO.CI.KBArticleNumbers` 和 `ECO.CI.O.ContentLink` 字段都有值的 Work Item 才是已发布的 KB 文章。缺少这两个字段的条目尚未发布，应标注为"未发布"。

### 第四步：并行批量获取
为提高效率，对多个 Work Item 的详情请求应 **并行执行**：

```
# 并行调用示例 - 同时获取多个 Work Item 详情
ADO-ContentIdea-wit_get_work_item(id=208611, project="ContentIdea")
ADO-ContentIdea-wit_get_work_item(id=187185, project="ContentIdea")
ADO-ContentIdea-wit_get_work_item(id=207263, project="ContentIdea")
...
```

也可以使用批量接口：
```
工具: ADO-ContentIdea-wit_get_work_items_batch_by_ids
参数:
  ids: [208611, 187185, 207263]
  project: "ContentIdea"
  fields: ["System.Title", "System.State", "ECO.CI.KBArticleNumbers", "ECO.CI.O.ContentLink", "ECO.CI.CI.SubStatus", "ECO.CI.PublishedDate", "ECO.CI.CI.HelpArticleSummarySymptom", "ECO.CI.CI.HelpArticleCause", "ECO.CI.CI.HelpArticleResolution", "ECO.CI.CI.AppliesToProducts"]
```

### 第五步：输出格式化结果

输出标准表格：

```markdown
### ContentIdea Internal KB 搜索结果

| # | KB 编号 | 标题 | 状态 | Internal KB 链接 |
|---|---------|------|------|-----------------|
| 1 | KB{number} | {title} | {Published/未发布} | [🔗 链接]({url}) |
| ... | ... | ... | ... | ... |

#### KB{number}: {title}
- **适用产品**: {products}
- **症状**: {summary}
- **根因**: {cause}
- **解决方案**: {resolution}
```

## 输出字段说明 (Output Fields)

| 输出字段 | 来源 | 示例 |
|----------|------|------|
| KB 编号 | `ECO.CI.KBArticleNumbers` | KB5081100 |
| 标题 | `System.Title` | Intune: Create WDAC Policy to Block Built-in Apps |
| 状态 | `ECO.CI.CI.SubStatus` | Published |
| Internal KB 链接 | `ECO.CI.O.ContentLink` | https://internal.evergreen.microsoft.com/topic/... |
| 症状摘要 | `ECO.CI.CI.HelpArticleSummarySymptom` | (HTML → 纯文本摘要) |
| 根因 | `ECO.CI.CI.HelpArticleCause` | (HTML → 纯文本摘要) |
| 解决方案 | `ECO.CI.CI.HelpArticleResolution` | (HTML → 纯文本摘要) |

## 注意事项 (Notes)
- ContentIdea 的 Wiki 通常无内容，KB 信息主要存储在 **Work Items** 中
- Work Item 类型为 `Content Idea Request`
- HTML 字段内容可能很长，输出时提取关键摘要即可
- 如果 Work Item 输出过大被截断到临时文件，使用 PowerShell 解析 JSON 提取关键字段
- 搜索关键词建议使用英文，与 KB 标题语言一致
