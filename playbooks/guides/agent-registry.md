# Agent 注册表与规范

## Custom Subagent 注册规则

`.claude/agents/*.md` 定义的 agent 会注册为 `Agent()` 工具的 `subagent_type`，但有严格要求：

### 必填 frontmatter 字段
- `name` — **必须有**，否则 agent 不会注册，spawn 时回退为 `general-purpose`
- `description` — **必须有**，用于 agent 列表展示

### 格式规范
- `tools` — 逗号分隔字符串（如 `tools: Bash, Read, Write`），不要用 JSON 数组
- `mcpServers` — YAML 列表，仅项目级 agent 支持（plugin agent 不支持）
- `model` — 可选，`sonnet` / `opus` / `haiku`
- `maxTurns` — 可选，限制 agent 最大交互轮次

### 最小可用示例
```yaml
---
name: my-agent
description: "做某件事"
tools: Bash, Read, Write
---
```

### 加载时机
- Agent 定义在**会话启动时**加载
- 新增或修改 agent.md 后需要**重启会话**或执行 `/agents` 才能生效
- 不重启会导致 `Agent type 'xxx' not found` 错误

## 当前已注册 Agent

| name | model | tools | mcpServers |
|------|-------|-------|------------|
| `casework` | opus | Bash, Read, Write, Edit, Glob, Grep, Agent | icm |
| `teams-search` | sonnet | Bash, Read, Write | teams |
| `email-drafter` | opus | Read, Write, Bash | — |
| `troubleshooter` | opus | Bash, Read, Write, Glob, Grep, WebSearch | kusto, msft-learn, icm, local-rag |
| `challenger` | opus | Bash, Read, Write, Glob, Grep, WebSearch | msft-learn, local-rag |
| `stage-worker` | opus | Bash, Read, Write, Glob, Grep, Agent | — |
| `onenote-case-search` | sonnet | Bash, Read, Write, Glob, Grep | — |
| `knowledge-enricher` | sonnet | Bash, Read, Write, Glob, Grep | — |
| `note-gap-checker` | sonnet | Bash, Read, Write | — |
| `onenote-classifier` | sonnet | Read, Write, Edit | — |
| `teams-digest-writer` | sonnet | Bash, Read, Write, Glob, Grep | — |
| `test-supervisor-runner` | opus | Bash, Read, Write, Edit, Glob, Grep, Agent | — |

## 性能注意

不要在 spawn prompt 中注入大段 SKILL 内容。实测注入 vs 让 agent 自己读 SKILL.md，注入反而慢 15s（增大了每轮 context 处理开销）。正确做法是 prompt 中写 `请先读取 .claude/agents/xxx.md 获取完整执行步骤`。
