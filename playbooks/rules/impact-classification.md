# Impact Classification Rules

## Purpose
供 SCAN 阶段各 scanner 在发现 gap 时对其用户影响进行分级。

## 分级定义

| 等级 | 名称 | 定义 | 关键词信号 |
|------|------|------|-----------|
| **P0** | 流程断裂 | 核心用户流程完全跑不通 | casework 中断、dashboard 无法加载、patrol 失败、session crash、白屏 |
| **P1** | 功能故障 | 功能存在但执行时报错或产出错误结果 | 按钮无响应、API 报错、草稿生成失败、Todo 执行失败、数据丢失 |
| **P2** | 体验退化 | 功能可用但体验明显变差 | 耗时 >2x 基线、UI 错位、对比度不足、响应慢、交互卡顿 |
| **P3** | 代码质量 | 不影响用户可见行为 | 架构不合理、代码重复、类型不安全、命名不规范、注释缺失 |

## 分级规则

### 按 area 的默认倾向
- `casework` / `patrol` — 偏 P0-P1（核心业务流程）
- `dashboard` — UI 相关偏 P2，功能相关偏 P1
- `email-drafter` / `troubleshooter` — 偏 P1
- `arch` / `unit-test` — 偏 P3

### 按 scanner 类型
- `issue-scanner` — 按 issue 自身 priority 映射：critical→P0, high→P1, medium→P2, low→P3
- `design-fidelity` — 默认 P2（视觉问题），除非涉及"不可操作"则 P1
- `performance` — delta >100% 为 P1，>50% 为 P2，其他 P3
- `architecture` — 默认 P3，除非涉及安全/数据丢失风险则 P1
- `observability` — 默认 P2
- `ux-review` — 默认 P2

### 覆盖规则
- Scanner 可在 GAP 输出中显式指定 impact，覆盖默认值
- 如果 gap description 包含关键词信号，优先使用关键词对应的等级
