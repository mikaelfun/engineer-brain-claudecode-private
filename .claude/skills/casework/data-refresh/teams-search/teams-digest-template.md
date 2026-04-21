# teams-digest.md 输出格式模板

assess / assess-ar / teams-digest-writer 在分析 Teams chat 文件后，必须将 `teams-digest.md` 写为以下格式。

## 模板

```markdown
# Teams Digest — Case {caseNumber}

> Generated: {ISO}
> High-relevance chats: {N} / {Total}

## Key Facts

以下事实来自 Teams 对话，按时间顺序排列。每条标注来源身份。

- {YYYY-MM-DD}: {displayName} {一句话中文 fact，人名/技术术语/命令保留英文}
- {YYYY-MM-DD}: {displayName} {一句话中文 fact}
- {YYYY-MM-DD}: {displayName} {一句话中文 fact}

## Timeline (high-relevance only)

- {date} — {chat displayName} — {一句话中文摘要}

## Low-Relevance (skipped)

- {chat displayName}: {reason for low relevance}
```

## Relevance 判定规则

| 信号 | 判定 |
|-----|------|
| 消息出现 caseNumber / contactEmail / subscriptionId / resourceName | **high** |
| PG 邮件链路中出现的产品关键词（与 case-info.md SAP 相关） | **high** |
| 纯闲聊 / 其它 case 串号 / 自动化通知无关 | **low** |
| 无法判定（消息 <3 条且无线索） | **low**（保守） |

## 身份标注规则

| 身份 | 标签 | 判断依据 |
|------|------|---------|
| 客户 | `[customer]` | 非 @microsoft.com 邮箱 |
| PG 工程师 | `[pg]` | @microsoft.com 但不是 case owner / assigned engineer |
| Case 工程师 | `[engineer]` | fangkun@microsoft.com 或 case-info.md 中的 Assigned To |
| 其他内部 | `[internal]` | @microsoft.com 但非以上两者 |

## 要点

- `## Key Facts` 只包含 high-relevance chat 的事实，不做推断
- **Key Facts 和 Timeline 必须用中文撰写**（人名、技术术语、CLI 命令、错误码保留英文原文）
- 每条 fact 需标注来源身份（`[customer]`/`[pg]`/`[engineer]`/`[internal]`）
- `## Timeline` 按时间顺序列出 high-relevance 交互摘要
- `## Low-Relevance` 列出被跳过的 chat 及原因（透明度）
- 空 digest（无 high-relevance chat）时写 `High-relevance chats: 0 / {Total}` + `No high-relevance Teams conversations found.`

## 同时写 _relevance.json

```json
{
  "generatedAt": "{ISO}",
  "chats": {
    "{chatFileName}": { "score": "high|low", "reason": "{判定原因}" }
  }
}
```
