# Test Supervisor — 薄路由器

测试循环的监督、诊断、指令入口。高频操作（run）走 Agent 隔离；低频操作按需加载 mode 文件。

## 用法

```
/test-supervisor run                      # ⭐ spawn agent 执行测试循环（context 隔离）
/test-supervisor db                       # 一屏总览 dashboard
/test-supervisor health                   # 深度诊断
/test-supervisor trends                   # 多周期趋势图
/test-supervisor review [cycle|testId]    # 详细审查
/test-supervisor directive <type> [args]  # 下达指令
/test-supervisor directives               # 查看指令队列
/test-supervisor discoveries              # 测试为项目发现的 bug
/test-supervisor evolution                # 框架自我进化时间线
/test-supervisor auto-heal                # 手动触发框架自愈
```

## 参数解析

```
args = 用户输入去掉 "/test-supervisor " 前缀
如果 args 为空 → mode = "db"
否则：
  第一个词 → mode
  剩余部分 → subargs
```

## 路由

### `run` → Agent spawn（不注入逻辑，context 隔离）

使用 Agent 工具 spawn `test-supervisor-runner` subagent（**前台等待完成**）：

```
Agent(
  subagent_type: "test-supervisor-runner",
  description: "Execute supervised test-loop cycle",
  prompt: "执行一轮监督式测试循环。读取 .claude/agents/test-supervisor-runner.md 获取步骤。"
)
```

输出 agent 返回的摘要（~500 bytes）。结束。

### `db` / `dashboard` / 空 → 按需读取

```
Read(".claude/skills/test-supervisor/modes/dashboard.md")
```
按读到的内容执行。

### 其他 mode → 按需读取

| mode | 文件 |
|------|------|
| `health` | `modes/health.md` |
| `trends` | `modes/trends.md` |
| `review` | `modes/review.md` |
| `directive` / `directives` | `modes/directive.md` |
| `discoveries` | `modes/discoveries.md` |
| `evolution` | `modes/evolution.md` |
| `auto-heal` | `modes/auto-heal.md` |

用 Read 工具读取对应文件，按内容执行。subargs 传递给 mode 逻辑。

## 注意事项

- 所有 bash 路径用 POSIX 格式（`/c/Users/...`）
- `run` 模式通过 Agent 实现 context 隔离，每 tick 仅 ~1KB 注入主 session
- 其他 mode 按需加载（~2-4KB/次），一次性调用不累积
- State 文件（pipeline.json/queues.json/stats.json/supervisor.json）修改**必须**通过 `state-writer.sh --target`
