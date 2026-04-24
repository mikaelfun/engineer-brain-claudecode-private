---
name: humanizer
displayName: Humanizer
category: inline
stability: stable
description: "去除 AI 生成痕迹，使文本更自然。支持 --lang en/zh，mimic 子命令蒸馏个人邮件风格。"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Agent
  - AskUserQuestion
---

# /humanizer — 去除 AI 写作痕迹 + 个人风格蒸馏

## 子命令

### 1. 文本 Humanize（默认）

```
/humanizer [--lang en|zh] [--baseline] <text or file>
```

- `--lang en` / `--lang zh` — 指定语言
- `--baseline` — 强制使用原始通用规则（忽略工程师专属规则）
- 默认：自动检测语言

**规则选择逻辑**:
1. `--baseline` → `rules-en.md` / `rules-zh.md`
2. `rules-en-{name}.md` / `rules-zh-{name}.md` 存在 → 默认用工程师专属规则
3. 否则 → `rules-en.md` / `rules-zh.md`

### 2. Mimic — 邮件风格蒸馏（交互式）

```
/humanizer mimic
```

启动后先选择时间范围（3/6/自定义月 或 全量），然后全自动执行：采集 → 分片分析 → 汇总 → 生成工程师专属规则。

**全部数据存 `{dataRoot}/humanizer-mimic/`**（从 config.json 读 dataRoot）。

---

## Mimic 执行流程（主 agent 编排）

### Step 0: 选择时间范围

用 AskUserQuestion 让用户选择要分析的邮件时间范围：

- **近 3 个月** — 快速蒸馏，适合风格稳定的用户（~30 cases，~5min 采集）
- **近 6 个月** — 平衡覆盖面和速度（~60 cases，~10min 采集）
- **自定义** — 用户输入月数（1-24）
- **全量** — 不限时间，分析所有 case（最慢）

将用户选择转为 `MIMIC_MONTHS` 变量（3/6/N/0）。`0` 表示全量不过滤。

### Step 1: 初始化 + 采集邮件

主 agent 顺序执行以下 bash 命令：

```bash
# 1a. 读 config，建目录
DATA_ROOT=$(python -c "import json; print(json.load(open('config.json'))['dataRoot'])")
MIMIC_DIR="$DATA_ROOT/humanizer-mimic"
mkdir -p "$MIMIC_DIR"

# 1b. D365 case ID 缓存（按月份后缀区分）
# MIMIC_MONTHS 由 Step 0 的用户选择决定（3/6/N/0）
# 0 = 全量，文件名不带后缀；N = 近 N 个月，文件名带 -Nm 后缀
if [ "$MIMIC_MONTHS" = "0" ]; then
  CACHE_FILE="$MIMIC_DIR/d365-case-ids.txt"
  DATE_FILTER=""
else
  CACHE_FILE="$MIMIC_DIR/d365-case-ids-${MIMIC_MONTHS}m.txt"
  DATE_FILTER=$(python -c "
from datetime import datetime, timedelta
d = datetime.utcnow() - timedelta(days=int('$MIMIC_MONTHS')*30)
print(d.strftime('%Y-%m-%dT00:00:00Z'))
")
fi

if [ ! -f "$CACHE_FILE" ]; then
  if [ -z "$DATE_FILTER" ]; then
    # 全量查询（无日期过滤）
    pwsh -NoProfile -Command '
    . .claude/skills/d365-case-ops/scripts/_init.ps1
    $userId = $script:D365CurrentUserId
    $fetchAll = @"
<fetch top="500">
  <entity name="incident">
    <attribute name="ticketnumber"/>
    <filter type="and">
      <condition attribute="msdfm_assignedto" operator="eq" value="$userId"/>
    </filter>
  </entity>
</fetch>
"@
    $r = (Invoke-D365Api -Endpoint "/api/data/v9.0/incidents" -FetchXml $fetchAll).value
    ($r | ForEach-Object { $_.ticketnumber } | Sort-Object -Unique) -join "`n"
    ' 2>/dev/null > "$CACHE_FILE"
  else
    # 按日期过滤
    pwsh -NoProfile -Command "
    . .claude/skills/d365-case-ops/scripts/_init.ps1
    \$userId = \$script:D365CurrentUserId
    \$fetchAll = @`"
<fetch top=`\"500`\">
  <entity name=`\"incident`\">
    <attribute name=`\"ticketnumber`\"/>
    <filter type=`\"and`\">
      <condition attribute=`\"msdfm_assignedto`\" operator=`\"eq`\" value=`\"\$userId`\"/>
      <condition attribute=`\"createdon`\" operator=`\"on-or-after`\" value=`\"$DATE_FILTER`\"/>
    </filter>
  </entity>
</fetch>
`"@
    \$r = (Invoke-D365Api -Endpoint '/api/data/v9.0/incidents' -FetchXml \$fetchAll).value
    (\$r | ForEach-Object { \$_.ticketnumber } | Sort-Object -Unique) -join \"\`n\"
    " 2>/dev/null > "$CACHE_FILE"
  fi
fi

echo "CACHE: $(wc -l < "$CACHE_FILE") case IDs in $CACHE_FILE"

# 1c. 邮件采集
bash .claude/skills/humanizer/scripts/mimic-collect.sh \
  --output-dir "$MIMIC_DIR" \
  --case-ids-file "$CACHE_FILE" \
  --project-root .
```

检查最后一行 `MIMIC_OK|...` → 继续。`MIMIC_FAIL|...` → 停止报错。

### Step 2: 分片分析（subagent 并行）

**为什么分片**：83 个 case 的 `analysis-input.md` 可能 10MB+，远超单次 context window。

**分片策略**：读取 `collection-stats.json` 获取邮件总数，按邮件数分片（每片 ~15-20 封），spawn subagent 并行分析。

#### 2a. 主 agent 准备分片

```bash
# 用 python 按 "---" 分隔符将 analysis-input.md 切成 N 个分片文件
python -c "
import os, json
mimic_dir = os.environ.get('MIMIC_DIR', '../data-dev/humanizer-mimic')
with open(os.path.join(mimic_dir, 'analysis-input.md'), encoding='utf-8') as f:
    content = f.read()

# 按 '## Email #' 分割为单封邮件
emails = content.split('## Email #')
header = emails[0]  # 文件头
emails = emails[1:]  # 每封邮件

# 每片 ~20 封邮件
CHUNK_SIZE = 20
chunks_dir = os.path.join(mimic_dir, 'chunks')
os.makedirs(chunks_dir, exist_ok=True)
chunk_count = 0
for i in range(0, len(emails), CHUNK_SIZE):
    chunk = emails[i:i+CHUNK_SIZE]
    chunk_file = os.path.join(chunks_dir, f'chunk-{chunk_count}.md')
    with open(chunk_file, 'w', encoding='utf-8') as f:
        f.write(header)
        for e in chunk:
            f.write('## Email #' + e)
    chunk_count += 1
print(f'CHUNKS_OK|total_emails={len(emails)}|chunks={chunk_count}')
"
```

#### 2b. 并行 spawn subagent 分析每个分片

对每个 `chunk-N.md` 文件，spawn 一个 **background subagent**（model: opus），prompt 如下：

```
你是邮件风格分析师。读取以下文件中的工程师发送邮件，提取写作风格特征。

读取: {mimic_dir}/chunks/chunk-{N}.md
参考分析维度: .claude/skills/humanizer/mimic-analyze-prompt.md

输出一份 JSON 到 {mimic_dir}/chunks/chunk-{N}-result.json，格式：
{
  "emailCount": 数量,
  "greetings": ["Hi Chris,", "你好，", ...],
  "signoffs": ["Best regards,\nKun", ...],
  "replyStructure": "描述...",
  "troubleshootingFormat": "描述 + 示例片段",
  "meetingSummaryFormat": "描述 或 INSUFFICIENT_DATA",
  "irFormat": "描述 或 INSUFFICIENT_DATA",
  "closureFormat": "描述 + 示例片段",
  "toneCharacteristics": "描述...",
  "vocabularyPatterns": {"frequentWords": [...], "enZhMixing": "描述"},
  "sentenceStyle": "描述...",
  "realExamples": {"en": ["片段1", "片段2"], "zh": ["片段1", "片段2"]}
}
不要返回文本描述，只输出 JSON 文件。
```

**并行数**：所有 chunk subagent 在同一条消息中 spawn（`run_in_background: true`），自动并行。

#### 2c. 等待所有 subagent 完成，汇总结果

所有 subagent 完成后，主 agent 读取所有 `chunk-*-result.json`，合并为统一的风格分析。

### Step 3: 生成 Custom Rules

主 agent 基于汇总结果 + baseline rules，生成两个文件：

1. 读取 `rules-en.md`（baseline EN）
2. 读取 `rules-zh.md`（baseline ZH）
3. 读取 `mimic-analyze-prompt.md`（输出格式规范）
4. 结合所有 chunk 分析结果
5. Write 生成 `.claude/skills/humanizer/rules-en-{name}.md`（name 从工程师邮箱提取，如 `kunfang`）
6. Write 生成 `.claude/skills/humanizer/rules-zh-{name}.md`

### Step 4: 报告

输出蒸馏统计：
- 分析了多少封邮件（EN / ZH）
- 每个维度提取的关键特征摘要
- 数据不足的维度
- 工程师专属规则文件路径

---

## 规则文件

| 文件 | 用途 |
|------|------|
| `rules-en.md` | 英文通用 AI 去除规则（baseline） |
| `rules-zh.md` | 中文通用 AI 去除规则（baseline） |
| `rules-en-{name}.md` | 英文定制规则（mimic 生成，存在时默认使用） |
| `rules-zh-{name}.md` | 中文定制规则（mimic 生成，存在时默认使用） |
| `mimic-analyze-prompt.md` | 蒸馏分析的维度定义和输出格式 |

## 数据目录

`{dataRoot}/humanizer-mimic/`（config.json → dataRoot）

| 文件 | 说明 |
|------|------|
| `d365-case-ids.txt` | D365 全量 case ID 缓存（删除即刷新） |
| `d365-case-ids-{N}m.txt` | D365 近 N 个月 case ID 缓存 |
| `{caseid}-email.md` | 每个 case 的邮件 |
| `misc-sent-emails.md` | 非 case 发送邮件 |
| `analysis-input.md` | 汇总（LLM 分析输入） |
| `collection-stats.json` | 采集统计 |
| `chunks/chunk-N.md` | 分片文件 |
| `chunks/chunk-N-result.json` | 分片分析结果 |

## 用法

```bash
# 蒸馏（交互式选择时间范围）
/humanizer mimic

# 使用蒸馏后的规则 humanize 文本
/humanizer <text>

# 强制用原始规则
/humanizer --baseline <text>
```
