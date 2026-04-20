---
name: calendar-search
displayName: 日历搜索
category: inline
stability: stable
requiredInput: none
estimatedDuration: 10s
description: "通过 Agency Calendar HTTP proxy 查询个人日历事件。支持按时间范围、关键词搜索，可过滤外部参会人。可独立调用 /calendar-search，也可被 workiq/casework 引用。"
allowed-tools:
  - Bash
  - Read
---

# /calendar-search — Calendar 日历查询

通过 Agency Calendar HTTP proxy (Graph Calendar API) 查询个人日历事件，支持按时间范围和关键词搜索。

## 执行模式

### INLINE_HTTP 模式（唯一模式）

`fetch-calendar-events.sh` 通过 `agency.exe mcp calendar --transport http` 本地 HTTP proxy 调 Graph Calendar API。

```bash
bash .claude/skills/calendar-search/scripts/fetch-calendar-events.sh \
  [--start "2026-04-01"] \
  [--end "2026-04-20"] \
  [--days 14] \
  [--keyword "customer"] \
  [--external-only] \
  [--output /path/to/output.md] \
  [--json /path/to/output.json] \
  [--port 9850]
```

**性能**：5-10s（启动 proxy + 查询 + 解析）

## 参数

| 参数 | 默认 | 说明 |
|------|------|------|
| `--start` | 14天前 | 开始日期（ISO 或 YYYY-MM-DD） |
| `--end` | 今天 | 结束日期 |
| `--days N` | 14 | 从今天往前 N 天（优先级低于 --start/--end） |
| `--keyword` | 无 | 按 subject 过滤 |
| `--external-only` | 否 | 只显示有外部参会人的会议 |
| `--output` | stdout | 输出 markdown 文件路径 |
| `--json` | 无 | 同时输出 JSON 文件 |
| `--port` | 9850 | proxy 端口 |

## 手动调用

```bash
# 最近两周有外部客户的会议
bash .claude/skills/calendar-search/scripts/fetch-calendar-events.sh --days 14 --external-only

# 指定日期范围
bash .claude/skills/calendar-search/scripts/fetch-calendar-events.sh --start 2026-04-01 --end 2026-04-20

# 关键词过滤
bash .claude/skills/calendar-search/scripts/fetch-calendar-events.sh --days 30 --keyword "S500"

# 输出到文件
bash .claude/skills/calendar-search/scripts/fetch-calendar-events.sh --days 14 --external-only \
  --output ./calendar-external.md --json ./calendar-external.json
```

## 输出格式

```markdown
# Calendar Events — 2026-04-06 ~ 2026-04-20

> Generated: 2026-04-20 10:00 | Total: 72 events | External: 9 | Source: Agency Calendar HTTP

## External Meetings

| # | Date | Time | Duration | Subject | External Attendees |
|---|------|------|----------|---------|-------------------|
| 1 | 04/07 | 16:00 | 30min | Azure File 权限 | zuo.xiaojing@oe.21vianet.com |
| 2 | 04/09 | 10:00 | 60min | [S500] 删除用户 | isoftstone.yang@mercedes-benz.com |

## All Meetings (chronological)

| # | Date | Time | Duration | Subject | Attendees |
|---|------|------|----------|---------|-----------|
| 1 | 04/06 | 09:00 | 30min | POD Standup | (internal) |
| ... |
```

## 输出 (stdout 最后一行)

- `CAL_OK|total=N|external=M|elapsed=Xs` → 成功
- `CAL_FAIL|reason=...` → 失败

## Available Calendar API Tools

agency.exe mcp calendar 提供以下工具（供参考）：

| Tool | 说明 |
|------|------|
| `ListCalendarView` | 按时间范围查询（展开 recurring events） |
| `ListEvents` | 按条件查询 |
| `CreateEvent` | 创建日历事件 |
| `UpdateEvent` | 更新日历事件 |
| `DeleteEventById` | 删除日历事件 |
| `FindMeetingTimes` | 查找可用会议时间 |
| `AcceptEvent` | 接受邀请 |
| `DeclineEvent` | 拒绝邀请 |
| `GetUserDateAndTimeZoneSettings` | 获取时区设置 |
| `GetRooms` | 获取会议室列表 |
