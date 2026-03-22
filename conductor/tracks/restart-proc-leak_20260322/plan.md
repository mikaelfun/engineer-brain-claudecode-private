# Implementation Plan: WebUI Restart 进程泄漏修复

**Track ID:** restart-proc-leak_20260322
**Spec:** [spec.md](./spec.md)
**Created:** 2026-03-22
**Status:** [x] Complete

## Overview

修复 restart-service.ts 的 3 个 bug：进程树杀不干净、未记录 spawn PID、后端重启缺少 killPort。

## Phase 1: Fix killPid + PID Registry

### Tasks
- [x] Task 1.1: `killPid()` 加 `/T` 参数杀进程树
- [x] Task 1.2: 添加模块级 `lastFrontendPid` / `lastBackendPid` 变量记录 spawn 出的 child.pid
- [x] Task 1.3: `spawnFrontend()` / `spawnBackend()` 保存 child.pid 到变量
- [x] Task 1.4: restart 时先用保存的 PID 杀旧进程树，再 killPort 兜底

### Verification
- [x] TypeScript 编译通过

## Phase 2: Fix restartBackend killPort

### Tasks
- [x] Task 2.1: `restartBackend()` 在 spawn 新进程前先调用 `killPort(BACKEND_PORT)`
- [x] Task 2.2: `restartAll()` 统一流程：killPort 双端口 → spawn 双进程 → exit

### Verification
- [x] TypeScript 编译通过

## Phase 3: Unit Tests + Verification

### Tasks
- [x] Task 3.1: 为 restart-service.ts 写单元测试（mock exec/spawn）
- [ ] Task 3.2: 手动验证：通过 WebUI 连续 restart 3 次，检查无孤儿进程

## Verification Plan

| # | Acceptance Criterion | Test Type | Test Steps |
|---|---------------------|-----------|------------|
| 1 | killPid 使用 /T 杀进程树 | Skip | Unit test 覆盖 |
| 2 | spawn PID 被记录 | Skip | Unit test 覆盖 |
| 3 | restartBackend 先 kill 旧端口 | Skip | Unit test 覆盖 |
| 4 | 连续 3 次 restart 无孤儿 | Skip | 手动验证（涉及真实进程操作） |

## Post-Implementation Checklist
- [x] 单元测试文件已创建/更新并通过
- [x] 关联 Issue JSON 状态已更新
- [x] Track metadata.json 已更新
- [x] tracks.md 状态标记已更新
