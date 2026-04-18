# onenote-digest.md 输出格式模板（v2 四段式）

generate-digest.py 在分析 OneNote `_page-*.md` 后，输出 `onenote-digest.md` 为以下四段式格式。

## 模板

```markdown
# Personal OneNote Notes — Case {caseNumber}

> Generated: {ISO timestamp}
> High-relevance pages: {highCount} / {totalCount}
> Synthesis: Layer 2 (cross-page LLM integration)

## 1. 关键信息（Key Information）

**问题描述**: {跨页面整合的客户问题描述}

**事实信息**:
- {去重后的事实1（命令输出/错误码/客户确认/配置值）}
- {去重后的事实2}

**截图诊断**:
- {截图描述} ![alt](./assets/xxx.png)

## 2. 分析推断（Analysis & Reasoning）

- [engineer] {工程师在 OneNote 中写的推断}
- [llm-generated] {LLM 从上下文推断的分析}

## 3. 行动计划（Action Plan）

- [verified] {已确认完成的步骤}
- [unverified] {建议但未验证的步骤}

## 4. 低价值信息（Low-Relevance）

- {页面名}: {原因}
```

## 两层架构

| Layer | 函数 | 作用 |
|-------|------|------|
| Layer 1 | `classify_single_page()` | 每页独立 LLM → 结构化 JSON |
| Layer 2 | `synthesize_onenote_digest()` | 跨页面语义整合 → 四段式 markdown |

### Layer 1 输出结构（per-page JSON）

```json
{
  "relevance": "high",
  "reason": "one-line Chinese reason",
  "problem_description": "客户问题描述",
  "facts": ["事实1", "事实2"],
  "screenshots": [{"description": "截图内容", "image_ref": "![alt](./assets/xxx.png)"}],
  "analyses": [
    {"source": "engineer", "text": "工程师推断"},
    {"source": "llm-generated", "text": "LLM 推断"}
  ],
  "action_items": [{"step": "步骤描述", "verified": false}],
  "summary": "1-2 句总结"
}
```

### Layer 2 整合规则

- **去重**: 多页面出现的相同事实只保留一条
- **合并**: 问题描述从所有页面整合为一段
- **排序**: 事实按重要性/时间排序
- **保留**: 截图 image_ref 原样保留（前端会替换为 API URL）
- **标注**: 分析区分 [engineer] / [llm-generated] 来源

## 分类规则

| 内容模式 | 归属段落 | 例子 |
|---------|----------|------|
| 命令输出 / 错误码 / 客户原话 / 时间戳 | § 1 facts | `az vm start → ProvisioningState=Failed` |
| URL / 文档链接 / 系统配置值 | § 1 facts | `https://docs.microsoft.com/...` |
| 截图中的诊断信息 | § 1 screenshots | RBAC 配置截图显示 Reader 权限 |
| 工程师写的假设 / "可能"/"怀疑" | § 2 [engineer] | 可能是 NIC 配置冲突导致 |
| LLM 从上下文推断 | § 2 [llm-generated] | 根据错误码推断可能需要... |
| 排查步骤（已做） | § 3 [verified] | 已确认 NSG 规则正确 |
| 排查步骤（未做） | § 3 [unverified] | 建议检查 DNS 解析 |
| 空页/无关页 | § 4 | 页面仅包含标题 |

## 前端渲染

| 段落 | 边框颜色 | 图标 |
|------|----------|------|
| § 1 关键信息 | amber (--accent-amber) | 🔑 |
| § 2 分析推断 | blue (--accent-blue) | 💡 |
| § 3 行动计划 | green (--accent-green) | 📋 |
| § 4 低价值信息 | gray (--border-subtle) | 📦 |

## 向后兼容

- `_page-relevance.json` 新增 `_format: "v2"` 字段
- 后端同时解析 v1（`## Key Facts`）和 v2（`## 1.`）格式
- 前端通过 `scoring.format === 'v2'` 判断渲染路径
- v1 缓存文件（无 `facts` 字段）会触发重新分类
