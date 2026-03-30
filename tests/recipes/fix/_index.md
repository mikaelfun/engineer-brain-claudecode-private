# Fix Recipes Index

> 共享架构指南：[recipe-architecture.md](../../../playbooks/guides/recipe-architecture.md) — 三层标准模式（Recipe Index / LLM 推理层 / 反思演进）

test-loop FIX 阶段处理失败测试时，**先读此文件**，根据 failure signature 匹配可复用的修复 recipe。

## 匹配规则（按优先级）

| 优先级 | Failure Signature | Recipe 文件 |
|-------|-------------------|------------|
| 1 | `ECONNREFUSED`, `connection refused`, curl 超时, 端口无响应, `localhost` 不可达, dashboard 未启动 | [env-service-down.md](./env-service-down.md) |
| 2 | `401 Unauthorized`, `JWT`, `token expired`, `invalid signature`, 页面显示登录页, API 返回 401 | [auth-token-expired.md](./auth-token-expired.md) |
| 3 | `browser not found`, `Chromium`, `msedge`, `snapshot`, `profile`, Playwright 启动失败, 浏览器崩溃 | [playwright-environment.md](./playwright-environment.md) |
| 4 | Windows 反斜杠路径错误, `No such file or directory` + POSIX 路径, `C:\` 在 Bash 中 | _待创建: path-format.md_ |
| 5 | 变量为空/丢失, pipe 截断, shell 变量静默丢弃 | _待创建: shell-variable-gotcha.md_ |
| 6 | `taskkill` 导致进程异常退出, `node.exe` 被意外终止 | [env-service-down.md](./env-service-down.md) §安全守则 |
| 7 | 以上都不匹配 | LLM 从零推理 |

## 匹配指引

- 一个 failure 可能匹配多个 recipe（如 "Playwright 找不到浏览器 + 端口超时"），按优先级组合执行
- 优先使用 recipe 中的**前置检查**和**常见坑**，即使具体修复步骤需要临场判断
- recipe 是**经验参考**，不是死板流程 — LLM 应根据错误日志细节调整
- 标记 _待创建_ 的条目暂无 recipe 文件，走从零推理路径，执行后考虑提取

## 何时创建新 Recipe

FIX 执行完毕后，LLM 自问：

| 触发条件 | 动作 |
|---------|------|
| 修复某个 failure 时重试 >= 2 次 | 提取为新 recipe |
| 遇到环境/工具/配置坑 | 追加到现有 recipe 的"常见坑"，同步更新 learnings.yaml |
| LLM 生成了 > 10 步修复方案 | 考虑提取为 recipe |
| 现有 recipe 的步骤过时或有误 | 修正 recipe |
| 1 次修复成功 | 不提取 |

## 数据溯源

初始 recipes 从以下 `tests/learnings.yaml` 条目提取：

| Recipe | 来源 learnings |
|--------|---------------|
| env-service-down.md | `dashboard-port-check`, `node-kill-safety` |
| auth-token-expired.md | `jwt-auth-token` |
| playwright-environment.md | `playwright-msedge-only`, `playwright-profile-path`, `browser-snapshot-ban`, `screenshot-accumulation` |

## 演进日志

| 日期 | Recipe | 变更 | 原因 |
|------|--------|------|------|
| 2026-03-30 | 全部 | 初始创建（3 个种子 recipe） | ISS-164 recipe-seed |

> 版本：v1.0 | 最后更新：2026-03-30
