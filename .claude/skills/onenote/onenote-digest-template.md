# onenote-digest.md 输出格式模板

assess / assess-ar / onenote-classifier 在分析 OneNote `_page-*.md` 后，必须将 `onenote-digest.md` 重写为以下格式。

## 模板

```markdown
# Personal OneNote Notes — Case {caseNumber}

> Searched: {原搜索时间} | Source: {notebook}
> Matched pages: {count}
> Classified by {classifier} at {ISO}

## 事实记录（Facts）

以下信息来自远程截图、客户确认、系统输出等可追溯来源，下游消费者可直接引用。

- [fact] {汇聚所有页面的 fact 1}
- [fact] {汇聚所有页面的 fact 2}

## 分析记录（Analysis）

以下信息来自 LLM 分析、排查假设等，可能不准确，下游消费者应验证后再引用。

- [analysis] {汇聚所有页面的 analysis 1}
- [analysis] {汇聚所有页面的 analysis 2}

## 详细页面

按 OneNote section 层级排序：root page 在前，subpage 紧跟其后。每个页面用 `<details>` HTML 标签包裹（默认折叠）。

格式示例：

```html
<details>
<summary>📄 Root Page Title — Section/Path (2026-04-01)</summary>

- **Key findings**:
  - [fact] 客户确认只有 Reader 权限
  - [analysis] 可能需要升级到 Contributor

</details>

<details>
<summary>&nbsp;&nbsp;📎 Subpage Title — subpage (2026-04-02)</summary>

- **Key findings**:
  - [fact] 截图显示 RBAC 配置

</details>
```

**层级规则**：
- 从 `_page-*.md` 的文件路径中 section depth 推断层级（路径 segments 越多越深）
- root page（section 直属）用 📄 前缀，无缩进
- subpage 用 📎 前缀，summary 前加 `&nbsp;&nbsp;` 缩进
- 按 section path 字母序 → 同 section 内按 modified date 排序

## Summary
{1-2 句话综合这些 OneNote 笔记对本 case 的诊断价值}
```

## 分类规则

| 内容模式 | 标签 | 例子 |
|---------|------|------|
| 命令输出 / 错误码 / 客户原话 / 时间戳 / 截图描述 | `[fact]` | `[fact] az vm start → ProvisioningState=Failed` |
| URL / 文档链接 / 系统配置值 | `[fact]` | `[fact] https://docs.microsoft.com/...` |
| 假设 / 推断 / "可能"/"应该"/"怀疑" / TODO | `[analysis]` | `[analysis] 可能是 NIC 配置冲突导致` |
| 判定不清 | `[fact]`（保守，不丢信息） | |

## 要点

- 顶部 `## 事实记录` 汇聚**所有页面**的 `[fact]`，是下游 assess/troubleshooter 的首选入口
- `## 分析记录` 汇聚**所有页面**的 `[analysis]`，下游可参考但不应盲目引用
- `## 详细页面` 保留每页完整上下文
- `## Summary` 必须写，1-2 句话，帮助 LLM 快速判断 OneNote 对本 case 有无价值
- 无匹配页面时写 `Matched pages: 0` + `No personal OneNote notes found for this case.`
