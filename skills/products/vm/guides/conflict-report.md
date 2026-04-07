# VM — 知识矛盾检测报告

**生成日期**: 2026-04-07
**扫描范围**: 24 个多源 topic（共 66 个 topic 中有跨源条目的）
**检测结果**: 3 个关键词级匹配，全部为误报

## 检测摘要

| # | Topic | 类型 | 来源A | 来源B | 判断 | 说明 |
|---|-------|------|-------|-------|------|------|
| 1 | vm-provisioning-h | solution | mslearn-260 | onenote-043 | ✅ 误报 | Linux Hyper-V驱动 vs Windows BCD修复，不同OS |
| 2 | vm-linux-os | solution | ado-wiki-e-r7-008 | mslearn-243 | ✅ 误报 | CIFS mount vs apt armhf repo，不同问题 |
| 3 | vm-extension-c | rootcause | mslearn-156 | onenote-147 | ✅ 误报 | OS支持矩阵 vs CSE publisher mismatch，不同场景 |

## 结论

所有检测到的候选冲突均为 **false_alarm**（关键词巧合匹配，实际描述不同场景）。
无需人工裁定，Phase 2 可全面执行，无阻断 topic。

## 方法说明

- 仅扫描多源 topic（同 topic 内有来自不同 source 的条目）
- 症状相似度阈值: 0.4（词重叠比率）
- 矛盾信号: 关键词对检测（enable/disable, install/remove, supported/not supported 等）
- 所有候选经人工审核后标记判断
