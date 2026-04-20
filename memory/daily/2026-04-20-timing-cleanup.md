# Session 任务：计时系统统一化清理

## 背景
上个 session 做了 `update-state.py` 核心升级：step/action 的 `--status completed` 现在会自动从 `startedAt` 计算 `durationMs`，不再需要调用者手动传 `--duration-ms`。

## 待清理项

### 1. 主 casework SKILL.md — 删除 inline 计时代码
文件：`.claude/skills/casework/SKILL.md`

删除以下模式（assess/act/summarize 三处，约 L85-97, L108-121, L128-141）：
```bash
# 删掉这些：
ASSESS_START_NS=$(date +%s%N)
ASSESS_DUR=$(( ($(date +%s%N) - ASSESS_START_NS) / 1000000 ))
update-state.py ... --duration-ms $ASSESS_DUR
# 改成只保留：
update-state.py ... --status completed   # auto-compute durationMs
```
同理 `ACT_START_NS/ACT_DUR` 和 `SUM_START_NS/SUM_DUR`。`--status active` 的调用保留（它记 `startedAt`）。

### 2. challenge SKILL.md — 删除 `.t_*` 文件打点
文件：`.claude/skills/casework/challenge/SKILL.md`（约 L54-55）
```bash
# 删掉：
date +%s > "{caseDir}/.casework/logs/.t_challenge_start"
date +%s > "{caseDir}/.casework/logs/.t_challenge_end"
# 替换为：
update-state.py --case-dir "$CASE_DIR" --step act --action challenger --status active
update-state.py --case-dir "$CASE_DIR" --step act --action challenger --status completed
```

### 3. teams-search SKILL.md — 删除 `.t_*` 文件打点
文件：`.claude/skills/casework/teams-search/SKILL.md`（约 L172, L194）
```bash
# 删掉：
date +%s > "$CASE_DIR/logs/.t_teamsSearch_end"
# teams-search 不是 act action，它是 data-refresh 的 subtask 或 assess 的 enrichment
# 如果需要计时，用 subtask 模式：
# update-state.py --case-dir "$CASE_DIR" --step data-refresh --subtask teams --status completed
# （这个已经在 data-refresh.sh 里做了，teams-search 的 .t_ 文件是多余的）
```

### 4. note-gap SKILL.md — 加 action 计时
文件：`.claude/skills/casework/note-gap/SKILL.md`
在执行逻辑前后加：
```bash
update-state.py --case-dir "$CASE_DIR" --step act --action note-gap --status active
# ... 执行 note-gap 逻辑 ...
update-state.py --case-dir "$CASE_DIR" --step act --action note-gap --status completed
```

### 5. labor-estimate SKILL.md — 加 action 计时
文件：`.claude/skills/casework/labor-estimate/SKILL.md`
同 note-gap：
```bash
update-state.py --case-dir "$CASE_DIR" --step act --action labor-estimate --status active
# ... 执行 ...
update-state.py --case-dir "$CASE_DIR" --step act --action labor-estimate --status completed
```

### 6. data-refresh.sh — 统一用 update-state.py
文件：`.claude/skills/casework/scripts/data-refresh.sh`
当前 data-refresh.sh 自己直接写 state.json（绕过 update-state.py）。检查是否需要改成调用 update-state.py。
如果改动风险太大（data-refresh.sh 是纯脚本，已经稳定），可以保留现状——它已经正确写入 startedAt/completedAt/durationMs/subtasks。

## 验证
- `python3 .claude/skills/casework/assess/tests/test_write_execution_plan.py` 通过
- grep 确认没有残留的 `date +%s >.*\.t_` 模式
- grep 确认没有残留的 `--duration-ms` 在主 SKILL.md 中（data-refresh.sh 的保留 OK）
- 跑一次 patrol 验证 Dashboard 时间显示正确

## 关联
- ISS-235 delta-empty-expiry（已实现）
- update-state.py 自动计时（已实现）
- patrol update-phase.py 统一脚本（已实现）
