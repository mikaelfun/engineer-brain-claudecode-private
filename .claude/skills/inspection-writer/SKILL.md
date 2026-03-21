---
description: "汇总写 inspection 报告 + todo。可独立调用 /inspection-writer {caseNumber}，也被 casework 内联执行。"
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
  - Grep
---

# /inspection-writer — Inspection 汇总

汇总 Case 的所有产出，生成 inspection 报告和 todo。

## 参数
- `$ARGUMENTS` — Case 编号（如 `2603100030005863`）
- 可选上下文变量（由 casework 传入）：
  - `teamsSearchTimedOut`：teams-search 是否超时

## 配置读取
```
读取 config.json 获取 casesRoot
设置 caseDir = {casesRoot}/active/{caseNumber}/（使用绝对路径）
```

## 执行步骤

### 1. 读取所有产出
读取 case 目录下所有可用文件：
- `case-info.md`、`emails.md`、`notes.md`
- `casehealth-meta.json`
- `teams/*.md`（聊天记录）
- `analysis/*.md`、`drafts/*.md`（如有）
- `timing.json`（可能尚未生成）

### 2. 写 Inspection 报告

**文件名必须含日期**，用 Bash 写：
```bash
TODAY=$(date '+%Y%m%d')
cat > "{caseDir}/inspection-${TODAY}.md" << 'EOF'
# Case Inspection — {caseNumber}
...
EOF
```

❌ 禁止写 `inspection.md`（无日期）。

报告内容：
- 基本信息表（Case Number / Title / Severity / Status / Customer / Case Age）
- 联系人信息（Contact Name / Email / Phone / Preferred Method）— 从 case-info.md 的 contact 字段读取
- 合规状态（IR / FDR / FWR / Entitlement / 21v）
- 最新动态（最后几封邮件摘要）
- 风险提示
- 本次未完成部分（如有超时/跳过的步骤，见下方说明）
- 执行统计（如 timing.json 已存在）

#### 「本次未完成部分」section
当 casework 流程中有步骤超时或跳过时（如 teams-search 3 分钟超时），在 inspection 中添加：

```markdown
## 本次未完成部分
- ⏳ Teams 搜索超时（3min），使用本地缓存 / 无缓存已跳过
```

- casework 会通过上下文变量（如 `teamsSearchTimedOut`）传递超时信息
- 没有未完成步骤时 **不写此 section**
- 此 section 位于「风险提示」之后、「执行统计」之前

### 3. 生成 Todo

```bash
TODONAME=$(date '+%y%m%d-%H%M')
mkdir -p "{caseDir}/todo"
cat > "{caseDir}/todo/${TODONAME}.md" << 'EOF'
# Todo — {caseNumber} — {YYYY-MM-DD HH:MM}

## 🔴 需人工决策
- [ ] ...

## 🟡 待确认执行
- [ ] ...

## ✅ 仅通知
- [x] ...
EOF
```

Todo 分级：
- 🔴 需人工决策：需用户判断的事项
- 🟡 待确认执行：D365 写操作（Note/Labor/SAP）
- ✅ 仅通知：已完成的步骤

### 4. 更新 Meta
Upsert `{caseDir}/casehealth-meta.json` 的 `lastInspected` 字段。

### 5. 写日志
```bash
echo "[$(date '+%Y-%m-%d %H:%M:%S')] inspection-writer OK | inspection-{TODAY}.md + todo/{TODONAME}.md" >> "{caseDir}/logs/inspection-writer.log"
```
