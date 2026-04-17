# T6 — Casework-AR Independent Sub-Skill

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 创建独立的 `casework-ar/` sub-skill 体系（PRD §2.7），从 v1 casework SKILL.md 的 AR PATH + status-judge AR Mode 提取规则，落地为 3 个 SKILL.md。

**Architecture:**
- `casework-ar/SKILL.md` — AR 专用四步编排入口（检测 isAR → 调 data-refresh(AR mode) → assess-ar → act-ar → summarize）
- `casework-ar/assess-ar/SKILL.md` — AR scope 提取 + communicationMode 检测 + 双模式 status 判断
- `casework-ar/act-ar/SKILL.md` — AR 路由表（internal/customer-facing 双模式 spawn）

---

## Task 1: assess-ar/SKILL.md

核心 — 从 status-judge AR Mode L85-165 + casework AR-B4a/B4b/B4c 提取。

## Task 2: act-ar/SKILL.md

从 casework AR-B5 L563-602 提取 AR 路由表。

## Task 3: casework-ar/SKILL.md

AR 入口编排 + patrol 集成引用。
