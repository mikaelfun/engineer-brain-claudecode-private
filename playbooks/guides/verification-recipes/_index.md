# Verification Recipes Index

> 共享架构指南：[recipe-architecture.md](../recipe-architecture.md) — 三层标准模式（Recipe Index / LLM 推理层 / 反思演进）

conductor:verify 在推理验证方案时，**先读此文件**，判断是否有可复用的 recipe。

## 匹配规则（按优先级）

| 优先级 | 验收标准关键词 | Recipe 文件 |
|-------|--------------|------------|
| 1 | UI 页面、组件、布局、按钮、主题、响应式 | [web-ui-playwright.md](./web-ui-playwright.md) |
| 2 | CLI、脚本、shell、命令行输出、stdout | [cli-script-output.md](./cli-script-output.md) |
| 3 | API 端点、HTTP 响应、curl、endpoint | [api-endpoint.md](./api-endpoint.md) |
| 4 | 文件内容、行数、格式、JSON schema、Markdown | [file-content-check.md](./file-content-check.md) |
| 5 | 以上都不匹配 | LLM 从零推理 |

## 匹配指引

- 一条验收标准可能匹配多个 recipe（如 "API 返回正确数据 + UI 正确渲染"），按需组合
- 优先使用 recipe 中的**前置检查**和**常见坑**，即使具体验证脚本需要从零写
- recipe 是**经验参考**，不是死板模板 — LLM 应根据具体场景调整步骤

## 何时创建新 Recipe

当 verify 执行完毕后，LLM 自问：

| 触发条件 | 动作 |
|---------|------|
| 验证某条标准时重试 >= 2 次 | 提取为新 recipe |
| 遇到环境/工具坑（JWT、端口、浏览器） | 追加到现有 recipe 的"常见坑" |
| LLM 生成了 > 10 行验证脚本 | 考虑提取为 recipe |
| 现有 recipe 的步骤过时或有误 | 修正 recipe |
| 验证很顺利（1 次通过） | 不提取 |

## Recipe 演进日志

| 日期 | Recipe | 变更 | 原因 |
|------|--------|------|------|
| 2026-03-29 | 全部 | 初始创建 | ISS-148 verify redesign |
