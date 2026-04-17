# D365 工单操作指南

从 dfmworker agent + d365-case-ops skill 提取的操作知识。caseworker 操作工单时读取本文件。

## 路径配置

路径从 `config.json` 的 `casesRoot` 读取。

### 目录结构

```text
${casesRoot}/
  active/{case-id}/           # 所有活跃 Case（普通 + AR）
  archived/{case-id}/         # 已关单 Case
  casehealth-state.json       # 全局巡检状态
```

> **统一约定：AR Case 也放在 `active/` 下。** 不要使用 `AR/` 独立目录。

### 脚本 OutputDir 约定

所有 d365-case-ops 脚本的 `-OutputDir` 参数指向 **case 目录的父级**，脚本内部自动 `Join-Path $OutputDir $TicketNumber` 创建子目录。

```powershell
# ✅ 正确
-OutputDir "{casesRoot}/active"

# ❌ 错误 — 会嵌套
-OutputDir "{casesRoot}/active/2603090040000814"
```

⚠️ **不要传 case 目录本身**，否则会嵌套。

## 能力清单

| # | 操作 | 方式 | 说明 |
|---|------|------|------|
| 1 | Case 查询 | OData API（fetch-case-snapshot） | 纯 API，不需要浏览器，10min 缓存 |
| 2 | 邮件操作 | Playwright UI | 发/回复/查看邮件 |
| 3 | Note 管理 | OData API / Playwright | 添加/查看 Note |
| 4 | Labor 记录 | OData API / Playwright | 记录工作时间 |
| 5 | SAP 修改 | Playwright UI | 修改产品分类 |
| 6 | 批量 Case 检查 | OData API | 批量获取 Case 状态 |
| 7 | 附件下载 | DTM API | token 缓存有效期 50 分钟 |
| 8 | IR 检查 | check-ir-status.ps1（API 优先，UI 降级） | API 查询 msdfm_caseperfattributes ~2s；批量用 check-ir-status-batch.ps1 |
| 9 | Note 历史归档 | fetch-notes.ps1 | 增量更新到 notes.md |

## fetch-case-snapshot

最常用的操作。纯 OData API 调用，返回：
- 基本信息（Case ID、标题、状态、优先级、产品等）
- 联系人信息
- Customer Statement
- Entitlement 信息
- Emails / Notes / Phone Calls / Labor / ICM / Attachments 列表

**缓存机制**：10 分钟内重复调用返回缓存数据。

## 数据输出位置

所有 d365-case-ops 脚本遵循同一目录约定：

```
${casesRoot}/active/        ← OutputDir
  {TicketNumber}/            ← 脚本自动创建
    case-info.md
    emails.md
    notes.md
    attachments/
```

**此规则适用于所有带目录参数的脚本**：
- `fetch-case-snapshot.ps1 -OutputDir`
- `fetch-emails.ps1 -OutputDir`
- `fetch-notes.ps1 -OutputDir`
- `download-attachments.ps1 -OutputDir`
- `check-ir-status.ps1 -MetaDir`（同样是 parent + TicketNumber）

## 关键约束

- **写操作需人类确认**：Note、Labor、邮件发送等
- **Cookie 过期**：会导致 Playwright 操作失败 → 需要 headed 模式重新登录
- **IR 判断**：通过 `msdfm_caseperfattributes` 实体 API 查询（API 优先），UI scraping 仅作降级
- **Meet IR 电话记录**：Phone Call 为空时必须填 "teams call"
- **邮件发送**：caseworker **不直接发送**，只生成草稿给用户审核

## 用户 ID

- D365 systemuser ID：`3841aa66-e0af-f011-bbd2-0022482589a6`
- D365 中有两个 systemuser ID，查活跃 Case 必须用上述 ID

## Skill 引用

所有 D365 操作通过 `.claude/skills/d365-case-ops/` 下的脚本执行。
脚本位置：`.claude/skills/d365-case-ops/scripts/`
