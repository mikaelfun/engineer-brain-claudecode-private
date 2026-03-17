# 路径配置

所有 Case 相关路径的唯一定义。其他 playbook、agent 定义、脚本均引用本文件的约定。

Web UI 迁移时只需修改本文件 + 对应环境变量。

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `D365_CASES_ROOT` | Case 数据根目录 | `$USERPROFILE/.openclaw/workspace/cases` |

脚本优先读 `$env:D365_CASES_ROOT`，未设置时 fallback 到默认值。

## 目录结构

```text
${CASES_ROOT}/
  active/{case-id}/           # 所有活跃 Case（普通 + AR）
    case-info.md              # Case 快照（fetch-case-snapshot）
    emails.md                 # 完整邮件内容（fetch-emails）
    notes.md                  # Note 历史（fetch-notes）
    user-context.md           # 用户手动补充的上下文（电话/会议等）
    casehealth-meta.json      # 巡检元数据
    attachments/              # 客户附件（download-attachments）
    analysis/                 # 诊断报告
    drafts/                   # 邮件草稿
    research/                 # 调研结果
    kusto/                    # Kusto 查询结果
    logs/                     # 日志文件
    teams/                    # Teams 聊天记录
  archived/{case-id}/         # 已关单 Case（同 active 子结构）
  todo/YYYYMMDD.md            # 当天统一 Todo（由 Main 汇总生成）
  casehealth-state.json       # 全局巡检状态
```

> **统一约定：AR Case 也放在 `active/` 下。** 这是唯一有效约定；不要再使用 `AR/` 独立目录。

## 脚本 OutputDir 约定

所有 d365-case-ops 脚本的 `-OutputDir` 参数指向 **case 目录的父级**，脚本内部自动 `Join-Path $OutputDir $TicketNumber` 创建子目录。

```powershell
# 活跃 Case（普通 + AR）
-OutputDir "${CASES_ROOT}/active"

# 归档 Case
-OutputDir "${CASES_ROOT}/archived"
```

⚠️ **不要传 case 目录本身**，否则会嵌套。

## 引用方式

Playbook / Agent 中统一用 `${CASES_ROOT}` 占位符表示 case 数据根目录。
实际路径在运行时通过环境变量或 spawn task 参数注入。
