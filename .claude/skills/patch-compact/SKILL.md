---
name: patch-compact
displayName: Patch Compact
category: inline
stability: dev
description: "Patch Claude Code CLI to disable blocking compact prompt. Run after npm update."
---

# patch-compact

Patch Claude Code CLI 禁用阻塞式 compact 提示，让 auto-compact 静默处理。

## 执行

```bash
bash ~/.claude/scripts/patch-autocompact.sh
```

## 补丁内容

仅修改 **MANUAL_COMPACT_BUFFER_TOKENS**（3000 → 999999），禁用阻塞限制。

警告/错误阈值**不动**（影响百分比显示会坏掉）。Auto-compact 正常工作。

## 版本兼容

脚本通过 `\w+=3000,kDK=3` 模式匹配，不硬编码 minified 变量名，跨版本兼容。

如果新版本改了模式，fallback：`CLAUDE_CODE_BLOCKING_LIMIT_OVERRIDE=999999`
