# Patrol: 启动前清理残留进程

## 问题
ICM daemon 和 Teams queue agent 启动前不检查是否有上次 patrol 残留的进程/僵尸进程。
导致：
1. ICM warm 脚本覆盖 PID 文件但新 daemon 可能起不来（端口/锁冲突）
2. 旧 Teams queue agent 可能还在跑，与新 queue 竞争 MCP 调用

## 影响场景
- patrol 中断后重新执行
- 用户手动 Ctrl+C 后再次 /patrol

## 修复方案
`icm-discussion-warm.sh` 启动前增加：
```bash
# Kill stale ICM daemon
OLD_PID=$(cat "$CASES_ROOT/.patrol/icm-queue-pid" 2>/dev/null)
if [ -n "$OLD_PID" ] && kill -0 "$OLD_PID" 2>/dev/null; then
  echo "KILLING_STALE_ICM_DAEMON|pid=$OLD_PID"
  kill "$OLD_PID" 2>/dev/null
  sleep 2
  kill -9 "$OLD_PID" 2>/dev/null
fi
```

patrol SKILL.md 阶段 0.5 增加 Teams queue 残留检查：
```bash
# 检查 teams-queue-active 信号文件存在 → 说明上次 queue 未正常退出
if [ -f "$CASES_ROOT/.patrol/teams-queue-active" ]; then
  echo "STALE_TEAMS_QUEUE_DETECTED|cleaning up"
fi
```

## 优先级
Medium — 不影响正常流程，只在中断重启时触发
