# T1 Spike Notes

**执行时间**: 2026-04-17
**执行人**: Claude (Sonnet) via PUA 🟠 alibaba
**状态**: Task 0 完成，等待 review

## Compliance Hash Fields (TODO-1 resolution)

Sample cases examined (from `../data/cases/active/`):

- 2601290030000748 — Volkswagen Group - Global Unified (China Cloud)
- 2602130040001034 — Ford China - ARR (China Cloud)
- 2603300030003153001 — 华晨宝马 Unified Enterprise (China Cloud)

### ⚠️ 字段格式与 HANDOFF 模板不符

HANDOFF.md 示例里假设字段是 `**Entitlement: xxx**` 这种 bold 前缀格式，但实际 case-info.md 用的是 **markdown 表格**。提取逻辑需要调整。

### 实际格式

**SAP** 字段在"基本信息"表中：

```
| SAP | Azure/21Vianet Mooncake/China 21Vianet Microsoft Entra |
| SAP | Azure/Mooncake Support Escalation/Mooncake - VM PoD/Azure Container Registry |
| SAP | Azure/21Vianet Mooncake/21Vianet China Azure Alert |
```

**Entitlement** 块是独立 `## Entitlement` 段下的表格：

```
## Entitlement

| 字段 | 值 |
|------|-----|
| Service Level | Premier |
| Service Name  | Unfd AddOn \| ProSv Ente - China Cld |
| Schedule      | 大众中国-2025-26–Unified Enterprise-China Cloud (192228075) |
| Contract Country | China |
```

无独立 "Support Plan" 字段 — Service Level（Premier/Professional/...）+ Service Name 的组合即等价于"Support Plan"语义。

### 推荐的 compliance hash 输入

```
serviceLevel | serviceName | schedule | sapCode
```

示例（case 2601290030000748）：

```
Premier|Unfd AddOn | ProSv Ente - China Cld|大众中国-2025-26–Unified Enterprise-China Cloud (192228075)|Azure/21Vianet Mooncake/China 21Vianet Microsoft Entra
```

sha256 前 8 位作为 `compliance.sourceHash`（Task 8 assess/SKILL.md 使用）。

### 提取伪代码（供 Task 8）

```python
import re, hashlib
text = open(f"{case_dir}/case-info.md").read()

def tbl(field):
    m = re.search(rf"^\|\s*{re.escape(field)}\s*\|\s*(.+?)\s*\|", text, re.M)
    return m.group(1).strip() if m else ""

service_level = tbl("Service Level")      # "Premier"
service_name  = tbl("Service Name")       # "Unfd AddOn | ProSv Ente - China Cld"
schedule      = tbl("Schedule")           # "...China Cloud (192228075)"
sap_code      = tbl("SAP")                # "Azure/21Vianet Mooncake/..."

h = hashlib.sha256(f"{service_level}|{service_name}|{schedule}|{sap_code}".encode()).hexdigest()[:8]
```

> 注意：`Service Name` 值本身含 `|`（Unfd AddOn | ProSv Ente），markdown 表格里是转义过的 `\|`。用 regex 提取时要处理转义或直接用首尾 `|` 分隔符匹配 — 上面的正则已覆盖（非贪婪 + `$` 锚定）。

## Atomic Write Validation (TODO-3 resolution)

### 测试脚本（已跑通）

```bash
TESTDIR="./tmp-event-test"
rm -rf "$TESTDIR" && mkdir -p "$TESTDIR"
for i in $(seq 1 100); do
  (TMP="$TESTDIR/e.json.tmp.$BASHPID.$i"
   echo "{\"n\": $i}" > "$TMP" && mv "$TMP" "$TESTDIR/e.json") &
done
wait
python3 -c "import json; d=json.load(open('$TESTDIR/e.json')); print('n=', d['n'])"
```

### 结果

- **Concurrent 100-writer test**: PASS
- **Final file JSON parseable**: PASS (output `PASS: parseable, final n= 97`)
- **No tmp residual**: PASS (只剩 e.json 一个最终文件)

### 关键踩坑（写给 Task 2 write-event.sh）

1. **❌ 不要用 `$$` 作 tmp 后缀** — 后台 subshell 继承父 PID，100 个并发共享同一个 `e.json.tmp.$$`，导致多个 mv 竞争同一个 tmp 文件，报 `No such file or directory` 并破坏最终文件。
2. **✅ 用 `$BASHPID` + 调用序号** — 每个 subshell 的 `$BASHPID` 真正唯一。
3. **⚠️ Git Bash `/tmp` ≠ Windows python3 `/tmp`** — bash 的 `/tmp` 映射到 `C:\Users\fangkun\AppData\Local\Temp\`，但 Windows python3 的 `open('/tmp/...')` 会把 `/tmp` 当字面路径。`write-event.sh` 测试必须用**相对路径**或 **Windows 格式** (`C:/...`)，严禁 `/tmp/`。符合 CLAUDE.md `platform-gotchas.md` 已知陷阱。

### write-event.sh 应采用的唯一 tmp 模式

```bash
TMP="${FILE}.tmp.$BASHPID.$RANDOM"
echo "$CONTENT" > "$TMP"
mv "$TMP" "$FILE"
```

## casework-meta.json reference count (Task 1 preview)

Found **66 files** referencing `casehealth-meta` across the codebase（通过 Grep tool 扫描 .sh/.ps1/.py/.md/.ts/.js）。

### 按类型分布

| Extension | Count | 示例 |
|-----------|-------|------|
| .md | ~44 | SKILL.md（9 个）、PRD/spec/plan 文档、playbooks |
| .ts | 8 | dashboard 后端（file-watcher, meta-reader, todo-writer, ...） |
| .sh | 7 | casework scripts（gather/extract-delta/generate-todo/...） |
| .ps1 | 6 | d365-case-ops（fetch-all-data, check-ir-status, check-meta, ...） |
| .js | 1 | tests/fixtures/synthetic/generator.js |
| .py | 0 | — |

### 高风险引用点（Task 1.3 批量替换需重点 smoke）

- **Dashboard TypeScript 层（8 个文件）** — 运行时直接读取 meta 文件，改名后必须重启 dashboard 后端验证。
- **`dashboard/src/watcher/file-watcher.ts`** — 文件名通常 hard-coded，需确认匹配逻辑是字符串 contains 还是 equals。
- **PRD/spec 文档（docs/, conductor/tracks/_archived/）** — 历史快照，建议**不改**（保留历史记录），只改"活引用"。用白名单 `--include="*.sh" --include="*.ps1" --include="*.ts" --include="*.js"` + 当前活跃 SKILL.md，排除 `_archived/` + `docs/REQUIREMENTS*`。

### Task 1.3 建议调整

原 plan 的 `cat /tmp/casehealth-refs.txt | xargs sed -i 's/.../.../g'` 直接全替换过于激进。建议：

1. 先分类：活引用（代码 + 当前 skill） vs 文档历史（archived spec）。
2. 只对活引用 sed 替换，文档类人工决定是否 freeze 为 v1 快照。

## Task 0 完成，等待 review

- [x] Step 0.1: 样本 case 的 compliance 字段已提取（字段名、格式、空值情况）
- [x] Step 0.2: spike-notes.md 已写
- [x] Step 0.3: 原子写并发 100 测试 PASS
- [ ] Step 0.4: commit（等本文件 review 后）

### Open Questions for Reviewer

1. **Compliance hash 是否采纳"无 Support Plan 字段"的决定？** 如果一定要有"Support Plan"语义，需要定一个 derive 规则（比如 `"{service_level} - {service_name split by '|' first segment}"`）。
2. **Task 1.3 的 sed 批量替换要不要缩窄范围？** 建议**只替换代码 + 活 SKILL**，不动 `conductor/tracks/_archived/` 和 `docs/PRD.md` 历史文档。
3. **HANDOFF.md 的字段名假设需要修正** — 要不要更新 HANDOFF.md 同步修正内容？（建议在 T1 Plan Task 8 assess/SKILL.md 里直接用本文件的 regex 提取逻辑。）
