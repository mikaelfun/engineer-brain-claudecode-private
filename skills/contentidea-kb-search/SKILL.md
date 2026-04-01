---
name: contentidea-kb-search
description: "搜索 ContentIdea 内部 KB 文章。触发词：ContentIdea KB、内部KB搜索、internal KB、搜索KB文章"
---

# ContentIdea KB 搜索

> **已整合到 az-devops skill。** 请调用 `/az-devops` 并参考工作流 [contentidea-kb-search.md](../../.claude/skills/az-devops/workflows/contentidea-kb-search.md)。

本 skill 的完整工作流已迁移至 `az-devops` skill 的 `workflows/contentidea-kb-search.md`，使用 `az devops` CLI 替代了旧的 MCP 工具调用。

## 快速参考

- **Org**: `ContentIdea` (`https://dev.azure.com/ContentIdea`)
- **Project**: `ContentIdea`
- **Profile**: `microsoft-fangkun`
- **搜索**: `az devops invoke --area search --resource workItemSearchResults`
- **获取详情**: `az boards work-item show --id <id> --org https://dev.azure.com/ContentIdea`
- **KB 判断**: `ECO.CI.KBArticleNumbers` + `ECO.CI.O.ContentLink` 都有值 = 已发布
