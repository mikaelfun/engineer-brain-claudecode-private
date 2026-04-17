# T5 — Patrol V2 Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 patrol SKILL.md 从 v1 架构（casework-light + teams-queue + icm-daemon）迁移到 v2 四步模型（data-refresh.sh + assess + act routing + summarize），保留 streaming pipeline 核心框架，替换内部组件。

**Architecture:**
- 保留：互斥锁、case 列表获取、归档检测、预热、streaming pipeline 轮询循环、汇总输出
- 替换：casework-light → `casework(mode=patrol)` subagent（跑 data-refresh.sh + assess SKILL.md）
- 删除：teams-search-queue（data-refresh.sh 内联 teams-search-inline.sh）、icm-discussion-daemon（data-refresh.sh 内联 icm-discussion-ab.js）、MCP 预检
- 新增：`read-plan.sh` 解析 execution-plan.json、`update-pipeline-state.py` 跟踪、summarize 替换 inspection-writer

**关键约束**：
- patrol 主 agent 是 depth=0，spawn 的 casework(mode=patrol) 是 depth=1
- depth=1 的 casework 不能再 spawn → Step 1+2 全脚本化（data-refresh.sh + assess 内 LLM inline）
- Step 3 action spawn 和 Step 4 summarize spawn 由 patrol 主 agent 执行

**PRD 对应节**：§2.6（Patrol 集成）、§2.3（Teams 优化 — 取消 queue）、§2.4（ICM 内联）

---

## File Structure

| 文件 | 职责 | 行为 |
|------|------|------|
| `.claude/skills/patrol/SKILL.md` | 主 skill 文档 — 重写阶段 0.5→7 段 | **大幅修改** |
| `.claude/agents/casework-light.md` | v1 casework-light agent — 标记废弃 | **修改（加废弃说明）** |

---

## Task 1: patrol SKILL.md — 删除 teams-queue + icm-daemon 阶段

**Files:**
- Modify: `.claude/skills/patrol/SKILL.md`

删除阶段 0.5（teams-search-queue spawn + ICM daemon）和阶段 2.5（queue drain + daemon stop）。这两个组件在 v2 中被 data-refresh.sh 的内联脚本替代。

- [ ] **Step 1: 读取当前 SKILL.md，定位要删除的段落**

阶段 0.5（约 L167-219）：`teams-search-queue` spawn + MCP 预检 + ICM daemon
阶段 2.5（约 L346-404）：queue drain + stop signal + orphan cleanup + ICM daemon stop

- [ ] **Step 2: 删除阶段 0.5 — 替换为简化的 ICM token 预热**

将 L167-219 的 teams-queue + ICM daemon 段替换为：

```markdown
5. **阶段 0.5：ICM Token 预热（可选）**

   V2 架构中 Teams 搜索和 ICM Discussion 由各 case 的 `data-refresh.sh` 内联执行（每 case 独立 agency proxy / REST API），不再需要全局 queue/daemon。

   ICM token 预热（170 分钟缓存，跨 case 共享）：
   ```bash
   node .claude/skills/icm-discussion/scripts/icm-discussion-ab.js --token-only 2>/dev/null || true
   # 输出: TOKEN_OK|{length} 或 TOKEN_FAIL（非致命，各 case fallback 自行获取）
   ```
```

- [ ] **Step 3: 删除阶段 2.5 — 替换为简化版**

将 L346-404 的 queue drain + daemon stop 段替换为：

```markdown
8. **阶段 2.5：清理**

   V2 不需要 queue drain 或 daemon stop（各 case 的 data-refresh.sh 已自行清理 agency proxy）。

   清理 orphan agency 进程（防御性）：
   ```bash
   tasklist 2>/dev/null | grep -c -i agency.exe && echo "⚠️ orphan agency processes detected" || true
   ```
```

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/patrol/SKILL.md
git commit -m "refactor(patrol): remove teams-queue + icm-daemon stages (T5.1)

V2 data-refresh.sh runs teams-search-inline.sh and icm-discussion-ab.js
per-case inline. No global queue/daemon needed.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: patrol SKILL.md — casework-light → casework(mode=patrol)

**Files:**
- Modify: `.claude/skills/patrol/SKILL.md`

替换阶段 7a 的 spawn 模板：casework-light → casework subagent 跑 data-refresh + assess。

- [ ] **Step 1: 替换 7a spawn 模板**

找到 L229-251 的 casework-light spawn 段，替换为：

```markdown
7. **Streaming Pipeline：启动 casework(mode=patrol) + 统一轮询推进**

   **7a. 全量并行启动 casework(mode=patrol)**

   对每个待处理的 case spawn casework subagent，执行 Step 1 (data-refresh) + Step 2 (assess)：

   ```
   Agent({
     subagent_type: "casework",
     prompt: "Patrol mode casework for Case {caseNumber}。
       caseDir: {casesRoot}/active/{caseNumber}/
       projectRoot: .
       casesRoot: {casesRoot}
       mode: patrol

       执行 Step 1 + Step 2：
       1. 读取 .claude/skills/casework/data-refresh/SKILL.md，执行 data-refresh.sh
       2. 读取 .claude/skills/casework/assess/SKILL.md，执行 assess 流程
       3. 产出 .casework/execution-plan.json 后退出

       ⚠️ patrol mode：不执行 Step 3 (act) 和 Step 4 (summarize)，由 patrol 主 agent 处理。",
     run_in_background: true
   })
   → 记录返回的 task_id
   ```

   - **一次性启动所有 Agent（全量并行）**—— 各 case 独立 agency proxy + 独立 REST API，无资源竞争
   - 初始化每个 case 的状态追踪：`phase: "gathering"`
```

- [ ] **Step 2: 更新 7b 轮询循环 — 用 read-plan.sh 解析 plan**

找到 L253-322 的轮询循环段，更新 `gathering → plan-ready` 检测逻辑：

在 `gathering` 分支中，将直接 JSON 解析改为调用 `read-plan.sh`：

```
         case "gathering":
           if .casework/execution-plan.json 存在:
             eval $(bash .claude/skills/casework/act/scripts/read-plan.sh \
               "{casesRoot}/active/{caseNumber}/.casework/execution-plan.json")
             if ACTION_COUNT == 0:
               → case.phase = "inspecting"
               → 立即 spawn summarize（后台）
             else:
               → case.phase = "executing"
               → 立即 spawn 第一个 action（troubleshooter/email-drafter）
```

- [ ] **Step 3: 更新 inspection spawn → summarize spawn**

找到 L331-340 的 inspection spawn 模板，替换为：

```markdown
   **Summarize spawn 模板**（替代旧 inspection-writer）：
   ```
   Agent({
     subagent_type: "casework",
     prompt: "仅执行 summarize for Case {caseNumber}。caseDir: {casesRoot}/active/{caseNumber}/。
       请读取 .claude/skills/casework/summarize/SKILL.md 获取完整执行步骤。
       只做 summary + todo 生成 + meta 更新，不做其他步骤。",
     run_in_background: true
   })
   ```
```

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/patrol/SKILL.md
git commit -m "refactor(patrol): casework-light → casework(mode=patrol) + read-plan + summarize (T5.2)

Patrol now spawns casework subagent for Step 1+2 (data-refresh + assess),
uses read-plan.sh for action parsing, and summarize SKILL.md for Step 4.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: patrol SKILL.md — 更新串行/并行表 + 注意事项

**Files:**
- Modify: `.claude/skills/patrol/SKILL.md`
- Modify: `.claude/agents/casework-light.md` (加废弃说明)

- [ ] **Step 1: 更新串行/并行边界总结表**

找到 L460-474 的表，替换为 v2 版本：

```markdown
## 串行/并行边界总结
| 操作 | 执行位置 | 必须串行？ |
|------|---------|-----------|
| DTM token 获取 | 阶段 0 预热 | ❌ 全局缓存 |
| IR/FDR/FWR check | 阶段 0 预热 | ❌ 批量 API |
| ICM token 预热 | 阶段 0.5 | ❌ 170min 缓存 |
| data-refresh (D365 + Teams + ICM + OneNote) | casework(mode=patrol) 内联 | ❌ 各 case 并行 |
| assess (compliance + LLM) | casework(mode=patrol) 内联 | ❌ 各 case 并行 |
| troubleshooter (Kusto/docs) | streaming pipeline spawn | ❌ 各 case 并行 |
| challenger | streaming pipeline spawn | ❌ 前台等待 |
| email-drafter | streaming pipeline spawn | ❌ 各 case 并行 |
| summarize (summary + todo) | streaming pipeline spawn | ❌ 各 case 独立并行 |
```

- [ ] **Step 2: 更新"与 /casework 的关系"段**

```markdown
## 与 /casework 的关系
- `/casework {caseNumber}`（单 case 手动）→ 主 session depth=0，跑 Step 1→2→3→4 全流程（自己 spawn agent）
- `/patrol`（批量巡检）→ spawn casework(mode=patrol) depth=1 跑 Step 1→2，patrol 主 agent 跑 Step 3→4 spawn
- 两者共用相同的 sub-skill（data-refresh/assess/act/summarize），通过 mode 参数区分行为
```

- [ ] **Step 3: casework-light.md 加废弃说明**

在 `.claude/agents/casework-light.md` 头部加一行：

```markdown
> ⚠️ **DEPRECATED (casework-v2)**: 本 agent 已被 `casework(mode=patrol)` 替代。Patrol 现在 spawn casework subagent 执行 data-refresh.sh + assess，不再使用 casework-light。保留此文件仅供回退参考。
```

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/patrol/SKILL.md .claude/agents/casework-light.md
git commit -m "docs(patrol): update tables + deprecate casework-light (T5.3)

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Verification Checklist

| 验证项 | 方法 | 期望 |
|--------|------|------|
| SKILL.md 无语法错误 | 人工阅读 | 流程连贯 |
| teams-search-queue 引用清除 | `grep -r "teams-search-queue" .claude/skills/patrol/` | 无结果 |
| icm-discussion-daemon 引用清除 | `grep -r "icm-discussion-daemon\|icm-discussion-warm\|icm-queue" .claude/skills/patrol/` | 无结果 |
| casework-light spawn 替换 | `grep "casework-light" .claude/skills/patrol/SKILL.md` | 无结果 |
| read-plan.sh 引用存在 | `grep "read-plan.sh" .claude/skills/patrol/SKILL.md` | 有结果 |
| summarize 引用存在 | `grep "summarize" .claude/skills/patrol/SKILL.md` | 有结果 |
