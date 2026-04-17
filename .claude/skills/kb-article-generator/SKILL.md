---
name: kb-article-generator
description: Generate KB articles from troubleshooting results. Use this when asked to create knowledge base articles or document troubleshooting findings.
---

# KB Article Generator Skill

## 技能名称 (Skill Name)
KB 文章生成器 (KB Article Generator)

## 技能描述 (Description)
根据故障排查结果，自动生成符合标准格式的知识库文章。

## 触发条件 (Trigger Conditions)
- 用户明确要求生成 KB 文章
- 完成案例分析后需要归档知识
- 发现可复用的故障排查模式

## 输入参数 (Input Parameters)
| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| service | string | ✅ | Azure 服务名称 (如: VM, AKS, Storage) |
| shortTitle | string | ✅ | 问题简短标题 (英文，用于文件名) |
| description | string | ✅ | 问题描述 |
| affectedScope | string | ✅ | 影响范围 |
| symptoms | array | ✅ | 症状列表 |
| rootCause | string | ✅ | 根因分析 |
| diagnosticQueries | array | ❌ | KQL 诊断查询列表 |
| workaround | string | ❌ | 临时解决方案 |
| recommendation | string | ❌ | 长期建议 |
| relatedCases | array | ❌ | 相关案例 ID |
| references | array | ❌ | 参考文档链接 |

## 输出文件 (Output)
- **路径**: `%USERPROFILE%\OneDrive - Microsoft\SCIMVM Copilot Shared Knowledge Base\KB\`
- **文件名格式**: `KB-{Service}-{ShortTitle}.md`
- **示例**: `KB-Storage-AzCopy-MD5-HEX-Format-Error.md`
- **作者**: `%USERPROFILE%` (从环境变量中提取用户名作为作者)

## KB 文章模板 (Template)

```markdown
# KB-[Service]-[ShortTitle]

**问题描述**: [简要描述]  
**影响范围**: [Services/Components]  
**首次发现**: [Date]  
**作者**: [Author]

## 症状 (Symptoms)
- [Symptom 1]
- [Symptom 2]

## 根因分析 (Root Cause)
[详细技术分析]

## 诊断查询 (Diagnostic Queries)
### 查询 1: [Purpose]
```kql
[Complete KQL Query]
```

## 解决方案 (Solution)
### 临时方案 (Workaround)
[步骤]

### 长期建议 (Long-term Recommendation)
[最佳实践]

## 相关案例 (Related Cases)
- [Case IDs]

## 参考文档 (References)
- [Links]
```

## 执行步骤 (Execution Steps)

1. **验证输入** - 检查必需参数是否完整
2. **生成文件名** - 根据 service 和 shortTitle 生成标准文件名
3. **填充模板** - 将参数填入模板各字段
4. **设置日期** - 自动填入当前日期作为首次发现时间
5. **设置作者** - 从 %USERPROFILE% 环境变量提取用户名作为作者
6. **预览确认 (必须)** - 向用户展示以下内容，**必须等待用户明确确认后才能创建文件**：
   - 📄 **完整的 KB 文章内容预览**
   - 📁 **创建路径**: 显示完整的文件创建路径
   - ❓ 询问用户: "请确认以上KB内容和创建路径是否正确？确认后我将创建文件。"
7. **等待用户确认** - 用户可能要求修改内容或更改路径，需根据反馈调整
8. **创建文件** - 用户明确确认后，在指定路径下创建 markdown 文件
9. **验证输出** - 确认文件创建成功并返回完整路径

## 使用示例 (Usage Example)

### 用户请求
```
帮我根据刚才的分析结果生成一篇 KB 文章，服务是 Storage，问题是 AzCopy MD5 格式错误
```

### Agent 执行
```
1. 收集分析结果中的关键信息
2. 调用 kb-article-generator skill
3. 生成 KB 内容预览并展示给用户
4. 显示计划创建的文件完整路径
5. 等待用户确认 (用户可要求修改内容或更改路径)
6. 用户明确确认后生成文件: KB-Storage-AzCopy-MD5-Format-Error.md
7. 返回确认信息和文件路径
```

## 质量检查清单 (Quality Checklist)
- [ ] 问题描述清晰准确
- [ ] 症状列表完整
- [ ] 根因分析有数据支撑
- [ ] KQL 查询语句完整可执行
- [ ] 解决方案可操作
- [ ] 引用官方文档链接

## 注意事项 (Notes)
- 文件名使用英文，避免特殊字符
- ShortTitle 使用 PascalCase 或 kebab-case
- 日期格式: YYYY-MM-DD
- KQL 查询需要完整可执行，包含所有必要的 cluster/database 信息
