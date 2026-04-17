# Intune Security Copilot for Intune — 排查速查

**来源数**: 1 | **21V**: 不适用
**条目数**: 12 | **最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Change Review Agent 运行时报错 'Security Copilot doesn't currently support that type of request' | Azure RAI (Responsible AI) 内容过滤策略阻止了某些类型的上传内容，导致 Security Copilot 无法处理请求 | 这是 Azure RAI 内容过滤的已知限制，非 bug；告知客户某些内容类型会被 RAI 策略阻止；建议客户调整上传内容以避免触发过滤 | 🔵 7.5 | ADO Wiki |
| 2 | 客户询问 Device Offboarding Agent 弃用/不可用 | Device Offboarding Agent 于 2026-03-02 进入弃用状态(MC1242767)，2026-04-30 后无法新建，2026... | 使用 CELA 批准的话术回复：功能因客户反馈显示 offboarding 流程因组织而异而弃用；建议客户恢复之前的 offboarding 流程；现有用户可继续使用至 2026-06-01；推... | 🔵 7.5 | ADO Wiki |
| 3 | Policy Configuration Agent 运行失败，提示内容被有害内容过滤器拦截 | 用户提交的 prompt 或上传的知识源文档触发了 Security Copilot 后端的有害内容过滤器（harmful content filter） | 1. 检查用户 prompt 和上传文档是否包含敏感/触发词；2. 简化或重新措辞 prompt 后重试；3. 如果内容合理但仍被拦截，建议客户提交 Security Copilot 反馈 | 🔵 7.5 | ADO Wiki |
| 4 | Policy Configuration Agent 运行失败，原因为 SCU（Security Compute Unit）不足 | 租户配置的 Security Copilot SCU 容量不足以完成 agent prompt 处理 | 1. 检查租户 Security Copilot SCU 分配量（Microsoft 365 Admin Center → Copilot → Capacity）；2. 建议客户增加 SCU 分... | 🔵 7.5 | ADO Wiki |
| 5 | Policy Configuration Agent 页面持续显示横幅错误 'Agent run failed. The agent encountered an error and did n... | 该错误横幅在上次 agent 运行失败后保留，直到有一次新的成功运行才会消失（by design） | 1. 确认并解决导致上次运行失败的根因（content filter / SCU 不足等）；2. 重新发起一次 agent run；3. 成功运行后横幅将自动消失；4. 若持续失败，按 Secu... | 🔵 7.5 | ADO Wiki |
| 6 | Security Copilot 嵌入式体验中出现 JSON 错误，用户无法使用 Copilot 功能 | 用户虽然拥有 Intune Administrator 角色，但缺少 Security Copilot 所需的 RBAC 角色（最低需要 Security... | 1. 在 securitycopilot.microsoft.com 中将用户添加到 Security Contributors 组；2. 或在 Entra ID 中分配 Security Re... | 🔵 7.5 | ADO Wiki |
| 7 | Security Copilot 嵌入式体验错误提示 Copilot 'not set up'，但租户实际已配置 | 用户缺少 Security Copilot RBAC 角色，导致嵌入式体验误判为未配置 | 1. 确认用户在 securitycopilot.microsoft.com 拥有 Security Contributor 或 Security Reader 角色；2. 添加角色后重新访问 ... | 🔵 7.5 | ADO Wiki |
| 8 | Security Copilot 提示 'No skill matched' 或 Intune plugin 未被选中，无法回答 Intune 相关问题 | Security Copilot 编排器未匹配到 Intune skillset，可能因为 Intune 插件未启用或 prompt 未被识别为 Intu... | 1. 在 securitycopilot.microsoft.com 确认 Intune 插件已启用；2. 用 Kusto 查询 MedeinaApi 表检查 SessionId 对应的 ski... | 🔵 7.5 | ADO Wiki |
| 9 | Security Copilot 返回 'We are currently experiencing heavy load. Please try again later' 错误 | Security Copilot 后端服务负载过高（heavy load），可能影响多个租户 | 1. 等待后重试；2. 用 Kusto 查询 Global('EvaluationSkillInvocations') 检查该异常是否为广泛影响问题（按 distinct tenantid co... | 🔵 7.5 | ADO Wiki |
| 10 | Intune Policy Configuration Agent 运行失败，提示内容被 harmful content filter 拦截 | Agent 将 prompt 和配置传递给后端 Security Copilot，如果内容触发有害内容过滤器则运行失败 | 检查并修改 prompt 内容，移除可能触发内容过滤器的措辞后重试 | 🔵 7.5 | ADO Wiki |
| 11 | Intune Policy Configuration Agent 运行失败，原因是 SCU 不足 | Security Copilot Units (SCUs) 不足以完成 prompt 处理 | 在 Security Copilot 容量设置中增加 SCU 分配，确保有足够计算单元后重试 | 🔵 7.5 | ADO Wiki |
| 12 | Policy Configuration Agent 页面持续显示横幅错误 'Agent run failed. The agent encountered an error and did n... | 之前的 Agent 运行失败，错误横幅会一直保留直到有新的成功运行 | 重新运行 Agent，成功运行后横幅会自动消失 | 🔵 7.5 | ADO Wiki |

## 快速排查路径
1. 这是 Azure RAI 内容过滤的已知限制，非 bug；告知客户某些内容类型会被 RAI 策略阻止；建议客户调整上传内容以避免触发过滤 `[来源: ADO Wiki]`
2. 使用 CELA 批准的话术回复：功能因客户反馈显示 offboarding 流程因组织而异而弃用；建议客户恢复之前的 offboarding 流程；现有用户可继续使用至 2026-06-01；推荐其他 Agent（Policy Configuration、Change Review、Vulnerab `[来源: ADO Wiki]`
3. 1. 检查用户 prompt 和上传文档是否包含敏感/触发词；2. 简化或重新措辞 prompt 后重试；3. 如果内容合理但仍被拦截，建议客户提交 Security Copilot 反馈 `[来源: ADO Wiki]`
4. 1. 检查租户 Security Copilot SCU 分配量（Microsoft 365 Admin Center → Copilot → Capacity）；2. 建议客户增加 SCU 分配或减少并发 Copilot 使用；3. 等待使用低峰期重试 `[来源: ADO Wiki]`
5. 1. 确认并解决导致上次运行失败的根因（content filter / SCU 不足等）；2. 重新发起一次 agent run；3. 成功运行后横幅将自动消失；4. 若持续失败，按 Security Copilot troubleshooting 流程排查 `[来源: ADO Wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/copilot-intune.md#排查流程)
