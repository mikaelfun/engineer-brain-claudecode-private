# Specification: WebUI Restart 进程泄漏修复

**Track ID:** restart-proc-leak_20260322
**Type:** Bug
**Created:** 2026-03-22
**Status:** Draft
**Source:** ISS-089

## Summary

restart-service.ts 的重启实现存在 3 个 bug，导致每次 WebUI 点击 Restart 按钮都遗留 2-4 个孤儿进程，长时间运行后滚雪球累积大量僵尸进程。

## Problem Description

### Steps to Reproduce
1. 通过 `npm run dev` 启动 dashboard（产生 cmd.exe → npx → node.exe 进程链）
2. 在 WebUI 点击 "Restart All" 按钮
3. 用 `Get-CimInstance Win32_Process` 检查进程列表
4. 发现旧的 cmd.exe、npx node.exe 进程仍在运行（父进程已死成为孤儿）

### Root Cause
1. `killPid()` 使用 `taskkill /F /PID` 只杀单个进程，不杀进程树（缺少 `/T`）
2. `spawnFrontend/spawnBackend` 没有保存 `child.pid`，无法在下次 restart 时定位进程树根
3. `restartBackend()` 没有调用 `killPort(BACKEND_PORT)`，依赖 `process.exit(0)` 释放端口

### Expected vs Actual
- **Expected:** Restart 后旧进程全部退出，只有新进程在运行
- **Actual:** 每次 restart 遗留 2-4 个孤儿进程（cmd.exe + npx node.exe）

## Acceptance Criteria

- [ ] `killPid()` 使用 `taskkill /F /T /PID` 杀进程树
- [ ] spawn 的子进程 PID 被记录，restart 时先杀旧进程树
- [ ] `restartBackend()` 在 spawn 新进程前先 kill 旧端口进程
- [ ] 连续执行 3 次 restart 后，无孤儿 cmd/node/bash 进程产生

## Dependencies

- ISS-086 (session-cleanup) 已完成，本次修复 restart-service.ts 自身的进程管理

## Out of Scope

- 非 restart 路径的进程泄漏（已由 ISS-086 修复）
- Linux/macOS 兼容（当前仅 Windows）

## Technical Notes

- `shell: true` + `detached: true` 在 Windows 上产生 cmd.exe → node.exe 链路
- `taskkill /T` 可递归杀子进程树
- 可用模块级变量存储 `lastFrontendPid` / `lastBackendPid`
