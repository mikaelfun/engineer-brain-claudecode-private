# 平台踩坑与规则

## Git Bash 路径格式

本机 Bash 工具运行在 **Git Bash (MSYS2)** 环境下。所有 Bash 命令中的路径**必须**使用 POSIX 格式：
- ✅ `/c/Users/fangkun/Documents/Projects/EngineerBrain/cases/...`
- ❌ `C:\Users\fangkun\...`（反斜杠被转义）
- ❌ `C:/Users/fangkun/...`（`>` 重定向会失败）

**转换规则**：`C:\a\b` → `/c/a/b`，即盘符小写 + 去冒号 + 正斜杠。
适用于所有 skill / agent 中的 Bash 调用。

### 变量赋值 + pipe 陷阱

当命令中**任何位置**出现 `|`（pipe）时，同一行用 `;` 设置的 shell 变量会被**静默丢弃**。变量赋值必须用换行独占一行：

```bash
# ✅ 正确：变量赋值独占一行
CASE_DIR="/c/Users/.../cases/active/123"
pwsh ... 2>&1 | tail -1

# ❌ 错误：; 赋值 + pipe → 变量为空
CASE_DIR="/c/..." ; pwsh ... 2>&1 | tail -1
```

## Playwright 浏览器

- **必须使用 Edge（msedge）**，本机未安装 Chrome
- `.mcp.json` 已配置 `--browser msedge` + `--output-dir .playwright-output`
- ❌ 不要尝试用 Chrome / Chromium，会报错找不到
- ❌ **禁止使用 `browser_snapshot`**：snapshot 输出巨大（数百行 YAML），一次就能撑爆会话 context，导致后续交互被 compact 丢失关键上下文
- ✅ 需要网页信息时，优先用 `gh` CLI、`WebFetch`、或 `Bash` + `curl` 获取结构化数据
- ✅ 如确需浏览器操作，用 `browser_evaluate` 提取关键数据，不要 snapshot 整页
- ✅ MCP 日志输出到 `.playwright-output/`（gitignored），不污染项目根目录

### 截图验证必须走 subagent

任何需要截图分析的场景（Playwright `browser_take_screenshot`、Read 图片文件），**禁止在主 session 直接读取/分析截图**。图片内容会瞬间撑爆 context window，导致 compact 丢失关键上下文甚至会话崩溃。

正确做法：spawn 一个轻量 subagent（haiku），让它读取截图、分析内容、返回文字结论（~200 bytes），主 session 只接收文字结果。

## 进程管理

- **禁止盲目 `pkill -f node`** — Claude Code CLI 自身就是 node 进程，杀掉会中断当前会话
- 重启 dashboard dev server 时，用 `netstat -ano | grep ':3010'` 找到 PID，再用 `taskkill //F //PID <pid>` 精确杀进程
- 或者直接 `TaskStop` 停掉后台任务，然后重新启动
- ❌ `pkill -f "dashboard.*dev"` — 可能误杀其他进程
- ✅ `taskkill //F //PID <精确PID>` — 安全

## 临时文件与截图规范

- **Playwright MCP 输出** → `.playwright-output/`（通过 `--output-dir` 配置，gitignored）
- **脚本测试截图** → `scripts/screenshots/`（gitignored，可重新生成）
- **自动化测试截图** → `tests/results/screenshots/`（gitignored，测试框架自动管理）
- **Conductor visual verify** → 临时 `screenshot.jpeg`（用完即删，不提交）
- ❌ 不要在项目根目录或脚本目录直接生成截图文件
- ❌ 不要硬编码绝对路径，用 `__dirname` + `join` 构建相对路径
