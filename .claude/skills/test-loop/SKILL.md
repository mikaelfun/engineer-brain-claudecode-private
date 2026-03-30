# Test Loop — 自动化测试框架

持续自我迭代的测试→发现→修复→验证闭环。
每轮从文件读状态，不依赖 session memory。

## 触发
```
/test-supervisor run              # ⭐ 推荐：通过 supervisor 监督式执行
/loop 5m /test-supervisor run     # ⭐ 推荐：持续监督式循环
/test-loop                        # 直接执行（手动或被 supervisor spawn）
/test-loop --phase SCAN           # 强制指定阶段
/test-loop --max-rounds 10        # 覆盖 maxRounds
```

## 🔴 安全红线（每轮必读）
先读 `tests/safety.yaml`。操作前查表：
- **SAFE** → 自动执行
- **BLOCKED** → 跳过并记录 reason（绝不执行）
- 不确定 → 标记 warning，跳过

## 🔴 state.json 写入规则（必须遵守）

**所有 state.json 写入必须通过 `state-writer.sh --merge`**。禁止直接写。
详见 `phases/common.md`。

## Phase Files — 按阶段读取

执行步骤：
1. 读 `phases/common.md`（通用规则 — 每次都读）
2. 读 `phases/{PHASE}.md`（当前阶段指令）
3. 执行当前阶段
4. 读 `phases/state-update.md`（状态更新 + 续跑判断）
5. 如果续跑：回到步骤 2 读下一个 phase 文件
6. 返回简要摘要

### Phase File Index

| Phase | File | ~Lines | Purpose |
|-------|------|--------|---------|
| (shared) | `phases/common.md` | ~60 | Writer rules, safety, directives |
| SCAN | `phases/SCAN.md` | ~100 | Discover gaps, recycle old issues |
| GENERATE | `phases/GENERATE.md` | ~40 | Create test definitions from gaps |
| TEST | `phases/TEST.md` | ~50 | Execute tests in batch |
| FIX | `phases/FIX.md` | ~70 | Analyze and fix failures |
| VERIFY | `phases/VERIFY.md` | ~60 | Verify fixes, self-heal |
| (shared) | `phases/state-update.md` | ~80 | State update + retrospective + continuation |

## 状态机转换图

```
                    ┌─────────────────────────┐
                    │                         │
                    ▼                         │
    ┌──────┐    有 gap    ┌──────────┐        │
    │ SCAN │───────────→│ GENERATE │        │
    │      │             └─────┬────┘        │
    │      │                   │              │
    │      │   无 gap          ▼              │
    │      │─────────→┌──────┐               │
    └──────┘          │ TEST │               │
       ▲              └──┬───┘               │
       │                 │                    │
       │    全通过        │ 有失败            │
       │                 ▼                    │
       │              ┌─────┐                │
       │              │ FIX │                │
       │              └──┬──┘                │
       │                 │                    │
       │                 ▼                    │
       │            ┌────────┐               │
       │            │ VERIFY │───PASS───────┘
       │            └───┬────┘
       │                │ FAIL
       │                ▼
       │             回到 FIX
       │
       └── round++ 后回到 SCAN
```

## 输出文件

| 文件 | 用途 |
|------|------|
| `tests/state.json` | 状态机当前状态（每轮更新） |
| `tests/manifest.json` | 功能覆盖映射（SCAN 更新） |
| `tests/registry/{category}/{id}.yaml` | 测试定义（GENERATE 创建） |
| `tests/results/{round}-{id}.json` | 测试结果（TEST/VERIFY 写入） |
| `tests/results/fixes/{id}-fix.md` | 修复详情（FIX 写入） |
| `tests/results/round-{N}-summary.json` | 每轮统计（round 结束时） |
| `tests/learnings.yaml` | 踩坑经验（FIX 追加） |
| `tests/baselines.yaml` | 性能基线（VERIFY 阶段 baseline-updater 更新） |

## 注意事项

- **state.json 写入必须用 `bash tests/executors/state-writer.sh --merge`** — 见 `phases/common.md`
- **Step 2.2 Phase Retrospective**：每个 phase 完成后回顾执行结果，检测框架逻辑 bug 并升级到 fixQueue（见 `phases/state-update.md` Step 2.2）；每轮每阶段最多创建 1 个 retro fix item（防刷屏）
- **FIX 阶段精准修复**：fixQueue 中带有 `retroContext`（含 targetFile/targetLine）的 framework fix 项，直接定位到具体文件行进行精准修复（见 `phases/FIX.md` Framework Fix Path）
- **续跑判断**：每个 phase 完成后按 `phases/state-update.md` Step 2.1 判断是否继续
- 每轮遍历当前 phase 的所有 queue items，用 subagent 隔离每个 item
- 每个 agent 完成后立即更新 state.json
- Agent 做具体工作，主 session 只编排
- 所有状态通过文件传递，不依赖 session memory
- UI 测试 spawn haiku agent（Playwright MCP 隔离）
- 截图绝不传回主 session（保存到文件）
- 遵循 env.yaml 的环境配置
- 遵循 learnings.yaml 的踩坑经验
- **自主进化**：test-loop 自行管理测试逻辑，supervisor 不介入
- **Phase Retrospective**：每个 phase 完成后回顾执行结果（见 `phases/state-update.md`）

## Reference

完整原始 SKILL 文件保留为 `SKILL-reference.md`（仅供人类参考）。
