---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/AdminUI"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FAdminUI"
importDate: "2026-04-04"
type: troubleshooting-guide
---

# Intune Admin Center UI — 综合排查指南

## 关于 Admin UI

AdminUI SME 领域涵盖 Intune Admin Center（https://intune.microsoft.com）GUI 中的所有功能，以及 Web Company Portal（https://portal.manage.microsoft.com）。

Admin Center 是一个 **Single-Page Application (SPA)**，所有操作均通过 Microsoft Graph REST API 调用实现。每次管理员在门户中执行操作，都会向 Intune 服务发出 Graph API 调用。

## Scoping Questions

1. Intune 门户中显示的完整错误描述是什么？
2. 出现问题的页面完整 URL 是什么？
3. 使用的管理员 UPN 是什么？
4. 该管理员是 GA/Intune Service Admin 还是使用自定义角色/权限集？
5. 在 Microsoft Edge 以外的浏览器中是否也出现此问题？
6. 此功能以前是否正常工作过？
7. 这是预览功能吗？

## Support Boundaries

Admin UI 支持范围仅限于 Intune 门户（intune.microsoft.com）内的功能。门户外部的任何其他门户均超出支持范围。

## 通用排查流程

1. 收集上述 scoping questions 的详细信息
2. 从客户收集重现步骤
3. 验证受影响管理员的权限/角色
4. 让客户在 Intune 门户中进行新鲜复现，同时收集 HAR trace，并记录 policyID、appID 或出问题的 blade 详情
5. 使用 client-request-id 在 Kusto 中关联后端 telemetry

## Kusto 查询入口

参见 [Browser DevTools HAR 排查指南](ado-wiki-Browser-DevTools-Troubleshooting.md) 了解使用 client-request-id 查询 CMService 和 HttpsSubsystem 的完整 Kusto 模板。

## 常见问题分类

Admin UI 问题通常归结为以下几类：
- **误配置（Misconfiguration）** — 策略或分配设置错误
- **角色/权限问题（RBAC）** — 管理员权限不足
- **报告延迟（Reporting）** — 状态未及时更新
- **服务端问题（Service-side）** — 后端异常或服务事件

## 培训资料

- Troubleshooting Pane update and Mobile App logs in MEM admin center (Feb 2023 recording available on SharePoint)

## 获取帮助

- 联系 AdminUI SME：https://aka.ms/IntuneSMEs
- 如需额外协助，通过 TA/Lead 提交 IET 请求
