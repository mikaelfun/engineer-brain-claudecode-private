# timing.json Schema

执行时间统计文件。

**文件位置**：`{caseDir}/timing.json`
**写入者**：casework (Main Agent)
**写入时机**：casework 流程 Step 5.5，所有步骤完成后、展示结果前

## Schema

```jsonc
{
  "$schema": "timing-v1",
  "caseworkStartedAt": "2026-03-17T14:30:00+08:00",
  "caseworkCompletedAt": "2026-03-17T14:33:00+08:00",
  "totalSeconds": 180,

  "steps": {
    "dataRefresh": {
      "startedAt": "2026-03-17T14:30:05+08:00",
      "completedAt": "2026-03-17T14:31:05+08:00",
      "seconds": 60
    },
    "teamsSearch": {
      "startedAt": "2026-03-17T14:30:05+08:00",
      "completedAt": "2026-03-17T14:30:50+08:00",
      "seconds": 45
    },
    "complianceCheck": {
      "startedAt": "2026-03-17T14:31:05+08:00",
      "completedAt": "2026-03-17T14:31:35+08:00",
      "seconds": 30
    },
    "statusJudge": {
      "startedAt": "2026-03-17T14:31:35+08:00",
      "completedAt": "2026-03-17T14:31:45+08:00",
      "seconds": 10
    },
    "troubleshooter": {
      "startedAt": "2026-03-17T14:31:45+08:00",
      "completedAt": "2026-03-17T14:32:25+08:00",
      "seconds": 40
    },
    "emailDrafter": {
      "startedAt": "2026-03-17T14:32:25+08:00",
      "completedAt": "2026-03-17T14:32:50+08:00",
      "seconds": 25
    },
    "inspectionWriter": {
      "startedAt": "2026-03-17T14:32:50+08:00",
      "completedAt": "2026-03-17T14:33:00+08:00",
      "seconds": 10
    }
  },

  "skippedSteps": [],
  "errors": []
}
```

## 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `$schema` | string | 固定 `"timing-v1"` |
| `caseworkStartedAt` | ISO 8601 | casework 流程开始时间 |
| `caseworkCompletedAt` | ISO 8601 | casework 流程结束时间 |
| `totalSeconds` | number | 总耗时秒数（取整） |
| `steps` | object | 各步骤耗时明细 |
| `steps.{name}` | object | 单个步骤：`startedAt`/`completedAt` (ISO 8601) + `seconds` (number) |
| `skippedSteps` | string[] | 未执行的步骤名称列表 |
| `errors` | string[] | 错误/异常摘要列表 |

## 步骤名称枚举

| steps key | 对应步骤 |
|-----------|---------|
| `dataRefresh` | data-refresh skill |
| `teamsSearch` | teams-search agent |
| `complianceCheck` | compliance-check skill |
| `statusJudge` | status-judge skill |
| `troubleshooter` | troubleshooter agent |
| `emailDrafter` | email-drafter agent |
| `inspectionWriter` | inspection-writer skill |

## 规则

- Main Agent 通过 `pwsh -c "(Get-Date).ToString('o')"` 在各步骤边界获取时间戳
- 耗时秒数通过 `pwsh -c "([datetime]'{end}' - [datetime]'{start}').TotalSeconds"` 计算并取整
- 并行步骤（dataRefresh + teamsSearch）使用各自的实际开始/结束时间
- `skippedSteps` 和 `steps` 互斥
- `errors` 记录执行中的异常摘要，不含敏感信息
- 此文件仅用于性能分析，不影响 `casework-meta.json` 中的合规数据
