---
name: humanizer
displayName: Humanizer
category: inline
stability: stable
description: "去除 AI 生成痕迹，使文本更自然。支持 --lang en（英文）和 --lang zh（中文），默认自动检测语言。"
allowed-tools:
  - Read
  - Write
  - Edit
  - AskUserQuestion
---

# /humanizer — 去除 AI 写作痕迹

合并 humanizer + humanizer-zh，支持中英文模式。

## 参数

- `` — 待处理的文本或文件路径
- `--lang en` — 英文模式（规则见 `rules-en.md`）
- `--lang zh` — 中文模式（规则见 `rules-zh.md`）
- 默认：自动检测文本语言

## 用法

- `/humanizer --lang en` → 按 rules-en.md 处理
- `/humanizer --lang zh` → 按 rules-zh.md 处理
- `/humanizer` → 自动检测

## 规则文件

- `rules-en.md` — 英文 AI 写作特征检测 + 修复（基于 Wikipedia AI Cleanup 指南）
- `rules-zh.md` — 中文版
