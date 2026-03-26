---
name: teams-case-search
description: "write-teams.ps1 脚本参考。搜索逻辑见 .claude/skills/teams-search/SKILL.md。"
---

# Teams Case Search — 脚本参考

> **搜索逻辑已整合到 `.claude/skills/teams-search/SKILL.md`（KQL 并行搜索）。**
> 本目录仅保留 `write-teams.ps1` 脚本。

## write-teams.ps1

文件位置：`skills/teams-case-search/scripts/write-teams.ps1`

### 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `-OutputDir` | Yes | 输出目录（通常为 `{caseDir}/teams/`） |
| `-InputJson` | No | JSON 字符串。不传则从 stdin 读取 |
| `-InputFile` | No | JSON 文件路径。替代 InputJson/stdin |

### 功能
- HTML 标签剥离
- UTC → GMT+8 时间戳转换
- 增量追加（已有消息不重复写入）
- 系统消息自动过滤
- `_chat-index.json` 索引管理（含 `_lastFetchedAt`）
- `_search-log.md` 搜索历史

### 输出文件

```text
teams/
  _search-log.md        # 搜索历史记录
  _chat-index.json      # chatId → 文件名/时间 映射
  {sanitized-name}.md   # 每个聊天一个文件
```

### 会话文件格式

```markdown
# Teams Chat — Chandrasekar, Sushanth (S.)

> 最后更新：2026-03-16 00:10 GMT+8
> chatId: 19:64eacf1a-...@unq.gbl.spaces

## 2026-03-12

**Kun Fang** (15:55): May I know if you have chance to test the updated script?
**Chandrasekar, Sushanth (S.)** (15:56): Hi Fang
```

## 迁移历史

1. **v1** `fetch-teams.ps1`：使用 `mcporter call` 调用 MCP（Openclaw 环境）
2. **v2** Agent 模式：`SearchTeamsMessages` (Copilot) + `write-teams.ps1`
3. **v3** Skill 模式：`SearchTeamMessagesQueryParameters` (KQL 并行) + `write-teams.ps1`（当前）
