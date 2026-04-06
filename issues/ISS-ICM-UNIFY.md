# ISS-ICM-UNIFY: ICM 信息获取统一化

## 背景
ICM MCP 能力有限（无 AI summary/discussion/manage access），Playwright 拦截一次可拿全部。
当前 data-refresh 和 status-judge 重复调用 ICM MCP，需统一。

## 已完成
- [x] ICM Discussion skill 创建（`.claude/skills/icm-discussion/SKILL.md`）
- [x] Playwright 技术验证：`GetIncidentDetails`(meta+authored summary+manage access) + `getdescriptionentries`(discussions)
- [x] 输出到 `icm/icm-discussions.md`

## 待做
- [ ] **data-refresh SKILL.md**: ICM 步骤从 MCP 改为 Playwright 拦截，输出 `icm/icm-summary.md` + `icm/icm-discussions.md`
- [ ] **status-judge SKILL.md**: 去掉 ICM MCP 调用，改读 `icm/icm-summary.md`
- [ ] **icm-discussion SKILL.md**: 增加 manage access 解析 + CSS Mooncake team 检查
- [ ] **inspection-writer SKILL.md**: 增加 ICM manage access Todo 规则（缺少 CSS team → 🔴 提示）
- [ ] **casework SKILL.md**: `mcpServers` 去掉 `icm`（不再需要）
- [ ] **case-directory.md**: `icm/` 目录结构更新（`icm-summary.md` 替代旧的多文件）

## 技术方案
见 `.claude/plans/temporal-coalescing-kay.md`

## 关键约束
- Playwright 天然串行（MCP server 单实例），patrol 并行时自动排队
- data-refresh subagent 中直接用 Playwright MCP 工具
- manage access 检查条件：AccessRestrictedToClaims 中需有 CSS Mooncake org 的 team 且 Role 为 Owners/Contributors
