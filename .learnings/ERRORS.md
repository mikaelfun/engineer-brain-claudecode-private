# Errors Log

记录遇到的错误和解决方案，避免重复踩坑。

## 格式
```
### YYYY-MM-DD — 错误描述
- 症状：...
- 原因：...
- 解决：...
- 预防：...
```

---

### 2026-03-30 — state-writer --merge 覆盖 fixQueue 数组
- 症状：`echo '{"fixQueue":[...1 item...]}' | state-writer --merge` 将原有 16 项 fixQueue 替换为 1 项
- 原因：`--merge` 是 shallow merge，数组字段会被完整替换（不像 phaseHistory 有特殊 append 逻辑）
- 解决：手动从 failed tests 重建 fixQueue（18 项），通过 --merge 写回
- 预防：注入单项到 fixQueue 时，必须先读取当前 fixQueue，prepend 新项后写整个数组；或创建专用 `queue-prepend.sh` helper

---

### 2026-03-15 — D365 Entitlement 数据全部返回 null

- 症状：fetch-case-snapshot.ps1 中 `_msdfm_entitlementredemptionid_value` 字段在所有 Case 上返回 null，导致 Entitlement 数据缺失
- 原因：不是 API 字段变更。playwright-cli 当前 tab 在 about:blank 而非 D365 页面，导致 fetch() 相对 URL 无法解析，所有 API 调用静默返回 null
- 解决：手动切到 D365 tab 后正常。在 `Invoke-D365Api` 或 `fetch-case-snapshot.ps1` 入口加 tab 预检（`Ensure-D365Tab`）
- 预防：D365 脚本入口统一加 tab 守卫，确保在 D365 tab 上再调 API
- 相关文件：`skills/d365-case-ops/scripts/fetch-case-snapshot.ps1` (line 94)

### 2026-03-16 — Teams ListChatMessages filter/orderby 不可用

- 症状：`ListChatMessages` 的 schema 看起来支持 `filter`/`orderby`/`top`，但实际调用报错
- 原因：后端不支持 `createdDateTime` 做 filter 或 orderby，错误信息明确指出 not supported/not allowed
- 解决：放弃用 `ListChatMessages(filter/orderby)` 做时间切片增量抓取；改用 `SearchTeamsMessages` 自然语言时间窗做增量入口，命中的 chat 再用 `ListChatMessages` 全量拉取
- 预防：工具 schema 不等于后端真实能力，增量方案必须以实测为准。已记入 Teams skill 文档
- 相关文件：`skills/teams-search/scripts/fetch-teams.ps1`（已废弃）

### 2026-03-16 — playwright-cli Chrome not found + Edge 切换

- 症状：`playwright-cli tab-list` 报 `Chromium distribution 'chrome' is not found at ...chrome.exe`
- 原因：本机没装 Chrome，playwright-cli 默认找 chrome
- 解决：在 cwd 下创建 `.playwright/cli.config.json`，配置 `{"browser":{"browserName":"chromium","launchOptions":{"channel":"msedge"}}}`
- 追加：需要用 `playwright-cli open --persistent --profile d365` 启动，才能复用 Edge 的 SSO 登录状态
- 注意：playwright-cli 的 session 是 per-workspace-dir 的，不同 cwd 需要各自启动 session
- 预防：项目根目录和 `.claude/` 目录都放一份 `.playwright/cli.config.json`

### 2026-03-16 — D365 脚本参数名是 -TicketNumber 不是 -CaseNumber

- 症状：`A parameter cannot be found that matches parameter name 'CaseNumber'`
- 原因：所有 D365 脚本用 `-TicketNumber` 参数名
- 解决：修正 subagent 定义中的参数名
- 追加：`-OutputDir` 的语义是父目录（`cases/active/`），脚本内部 `Join-Path $OutputDir $TicketNumber`，不要传带 case number 的完整路径
- 预防：已更新 data-refresh.md agent 文档

### 2026-03-17 — check-ir-status.ps1 FDR/FWR 返回 unknown

- 症状：IR SLA 正确返回 Succeeded，但 FDR 和 FWR 始终返回 unknown
- 原因：D365 UI 的 KPI "Expired" 状态有两种 DOM selector —— `ViolatedTimerLabelID`（计时器超时）和 `UnsucceededLabelId`（直接标记未成功）。脚本只检查了前者，FDR/FWR 用的是后者
- 解决：在两处 `parseKpi` 函数中都追加 `UnsucceededLabelId` 检查（行 ~68 和 ~100）
- 验证：修复后 FDR=Expired, FWR=Expired，符合 UI 显示
- 预防：D365 KPI 选择器不能假设只有一种 Expired 表示，通过 debug 脚本 dump 所有 `data-id` 元素来确认
- 相关文件：`skills/d365-case-ops/scripts/check-ir-status.ps1`

### 2026-03-17 — fetch-emails.ps1 cid 图片无后缀 + 签名图片未过滤

- 症状：images/ 目录下 `inlineimg_XXX` 文件没有扩展名，无法直接打开；同时充满了签名小图标
- 原因：cid 图片的 `att.filename` 可能不带扩展名，旧代码直接用 filename 做文件名；没有签名过滤逻辑
- 解决：新增 `Ensure-Extension` 从 MIME type 补后缀；新增 `Test-SignatureImage` 按文件名模式（logo/icon/linkedin/image00x.png）和大小（< 2KB）跳过
- 验证：单元测试 12/12 通过；端到端未验证（D365 session 过期）
- 预防：所有文件保存前确保有有效扩展名
- 相关文件：`skills/d365-case-ops/scripts/fetch-emails.ps1`

### 2026-03-17 — write-teams.ps1 时区偏移：UTC 时间显示为本地时间

- 症状：消息时间 `2026-03-12T09:11:44Z` 应显示 17:11 (GMT+8) 但显示了 09:11
- 原因：`ConvertFrom-Json` 把 `"...Z"` 结尾的 ISO 时间解析为 `System.DateTime(Kind=Utc)`；但 PowerShell `.ToString()` 输出不带 Z 后缀（如 `03/12/2026 09:11:44`）；`DateTimeOffset::Parse` 拿到没有时区标记的字符串后当成本地时间 (GMT+8)，`.ToOffset(+8)` 自然不变
- 解决：在 `To-Gmt8` 函数中检测输入类型，如果是 `DateTime` 则显式构造 `new DateTimeOffset(dt, TimeSpan.Zero)` 确保按 UTC 处理
- 预防：PowerShell 中处理 JSON 日期时永远检查 `ConvertFrom-Json` 的自动类型转换
- 相关文件：`.claude/skills/teams-search/scripts/write-teams.ps1`

### 2026-03-17 — playwright-cli --profile 相对路径把浏览器数据写入 cases/active/

- 症状：`cases/active/d365/` 出现一个包含 Edge 浏览器 profile 数据的目录（Default/、Crashpad/、Local State 等）
- 原因：`playwright-cli open --persistent --profile d365` 的 `--profile` 参数是相对路径，浏览器数据创建在了 cwd 下。当时 cwd 恰好在项目根目录，profile 落到了 `cases/active/d365/`
- 解决：用绝对路径 `--profile "$TEMP/playwright-d365-profile"`；删除误创建的目录（需先 `playwright-cli kill-all`）
- 预防：`--profile` 永远用绝对路径（`$TEMP` 或 `$HOME`），不用相对路径
- 相关文件：`.claude/agents/data-refresh.md`

### 2026-03-21 — taskkill /F /IM node.exe 误杀 Claude Code 进程

- 症状：重启 Dashboard 前后端时，执行 `taskkill /F /IM node.exe` 把 Claude Code 本身（也是 node 进程）一起杀掉了，导致会话中断
- 原因：`taskkill /IM node.exe` 按进程名匹配，会杀掉所有 node.exe 进程，包括 Claude Code CLI、MCP server 等
- 解决：用 `netstat -ano | findstr "LISTENING" | findstr ":5173 :3010"` 找到占用端口的具体 PID，然后 `powershell -Command "Stop-Process -Id {PID} -Force"` 精准杀掉
- 预防：**绝对不要用 `taskkill /F /IM node.exe`**。始终先查端口占用的 PID，只杀特定 PID。同理也不要 `killall node` 或 `pkill node`

### 2026-03-27 — Custom subagent_type 'data-refresh' not found

- 症状：`Agent(subagent_type: "data-refresh")` 返回 "Agent type 'data-refresh' not found"，回退为 general-purpose agent（加载全量 195 tools + 12 MCP）
- 原因：`.claude/agents/data-refresh.md` 的 YAML frontmatter 缺少 `name` 字段。`name` 和 `description` 都是**必填**字段，缺少任一则 agent 不会注册到可用类型列表
- 解决：在所有 3 个 agent.md（data-refresh, email-drafter, troubleshooter）中添加 `name` 字段
- 追加：`tools` 字段必须用逗号分隔字符串（`tools: Bash, Read, Write`），不能用 JSON 数组格式
- 追加：agent 定义在会话启动时加载，修改后需重启会话或 `/agents` 才能生效
- 预防：已在 CLAUDE.md 中新增 "Custom Subagent 注册" 章节，包含必填字段、格式规范、加载时机
- 相关文件：`.claude/agents/data-refresh.md`, `.claude/agents/email-drafter.md`, `.claude/agents/troubleshooter.md`

### 2026-03-27 — SKILL 注入 agent prompt 反而更慢

- 症状：将 SKILL.md 完整内容注入 agent spawn prompt（Agent B），比让 agent 自己读 SKILL.md（Agent C）慢 15 秒（99s vs 84s）
- 原因：注入大段文本增大了 agent 每一轮的 context 处理开销（prompt 在所有 turn 中都要处理），远超省下的 1 次 Read 调用（~2s）
- 解决：回滚 5 个文件的 SKILL 注入改动（casework/patrol/troubleshoot/draft-email SKILL.md + case-session-manager.ts）
- 预防：agent prompt 保持精简，只包含参数和 "请先读取 xxx 获取完整执行步骤" 的指令。大段内容让 agent 运行时自己读取

### 2026-03-27 — Git Bash `;` 变量赋值被 pipe 吞掉

- 症状：`CASE_DIR="/c/..." ; date +%s > "$CASE_DIR/logs/.t_xxx" ; pwsh ... 2>&1 | tail -1` 中 `$CASE_DIR` 为空，输出 `/logs/.t_xxx: No such file or directory`
- 原因：Git Bash (MSYS2) 环境下，当命令行中**任何位置**出现 `|`（pipe）时，同一行用 `;` 设置的所有 shell 变量赋值会被静默丢弃。这是 Bash 工具对 `;` 单行命令的解析行为导致的
- 复现：`X=hello ; echo "$X" ; echo a | cat ; echo "$X"` → `X` 全程为空。去掉 `| cat` 则正常
- 解决：**变量赋值必须用换行（`\n`），不能用 `;` 放在同一行**。即使 `export` 也不能规避
- 正确写法：
  ```bash
  CASE_DIR="/c/Users/.../cases/active/123"
  date +%s > "$CASE_DIR/logs/.t_xxx" ; pwsh ... 2>&1 | tail -1
  ```
- 预防：更新 casework SKILL.md 的 Bash 健壮性规则，变量赋值行独占一行
- 相关文件：`.claude/skills/casework/SKILL.md`（Bash 健壮性规则）

### 2026-03-28 — E2E Playwright 截图累积撑爆 Claude Code session context

- 症状：verify 流程运行到后期 session 容量耗尽，无法继续
- 原因：每步操作都截 PNG 全页图 + 用 Read tool 把截图传回会话，累积图片 token 撑爆 context（不是单张太大，而是张数太多）
- 解决（三层）：
  1. 减少截图次数：只在关键验证点截图，不要每步都截
  2. JPEG 代替 PNG：`type: 'jpeg', quality: 70`，单张体积减小 70-80%
  3. 按测试类型隔离图片 context：
     - E2E / API / Interaction 类：靠代码断言验证，截图只保存文件不传回会话
     - Visual 类：委托 subagent 查看截图返回纯文本 PASS/FAIL，subagent 结束后图片 context 自动释放
- 核心原则：**主会话永远不直接 Read 截图文件**
- 预防：规则写入 `conductor/workflow.md`（📸截图优化规则 + UI Screenshot Verification）和 `.claude/commands/conductor/verify.md`
- 追加：`openviking add-memory` 提取 0 条，需用 `session new → add-message → commit` 手动流程才能写入记忆

## 2026-04-02 | CC Finder 用 python3 在 Git Bash 中不可用
- **问题**：compliance-check 的 CC Finder 步骤用 `python3` 命令解析 mooncake-cc.json，但 Git Bash (Windows) 只有 `python`
- **影响**：CC Finder 静默失败（被 `2>/dev/null` 吞掉错误），返回 NO_MATCH
- **修复**：改用 `python` 或 `python -c` 代替 `python3 -c`
- **根因**：Windows Python 安装默认只注册 `python.exe`，不创建 `python3` 别名

## 2026-04-02 | onenote-case-search 被错误跳过
- **问题**：casework B2 中，当 teams-search 缓存有效时，错误地把整个 B2 跳过，包括 onenote-case-search
- **事实**：onenote-case-search **没有缓存机制**，每次 casework 都应该 spawn 执行
- **修正**：B2 中 teams-search 有缓存预检（teamsSearchCacheHours），onenote-case-search 无缓存，两者独立判断
- **正确行为**：即使 teams 缓存有效跳过 teams-search，仍必须 spawn onenote-case-search
