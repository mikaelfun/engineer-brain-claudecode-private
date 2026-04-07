---
source: onenote
sourceRef: "MCVKB/VM+SCIM/======23.M365 Identity (IDO)======/23.1 Office product, service plan and licensing.md"
sourceUrl: null
importDate: "2026-04-04"
type: reference-guide
---

# Office Product, Service Plan and Licensing — 查询指南

支持 M365 Identity 时查找 Product SKU、Service Plan、Offer 的方法汇总。

> **注意**：Product/Service Plan ID 为内部信息，不可分享给客户。
> 自 2024/09/09 起，新 license 分配只能通过 M365 admin center 或 API 完成。

## Product SKU

Products 是 Service Plans 的组合。

### 查询方式

| 方式 | 端点/工具 |
|------|-----------|
| Office Portal | 管理中心 → 订阅 |
| MS Graph API | `GET /users/{id}/licenseDetails` ([docs](https://learn.microsoft.com/en-us/graph/api/user-list-licensedetails)) |
| MS Graph API | `GET /subscribedSkus` ([docs](https://learn.microsoft.com/en-us/graph/api/subscribedsku-list)) |
| Office Portal API | `GET https://portal.partner.microsoftonline.cn/admin/api/users/<userObjectId>/assignedproducts` |
| Azure/Entra Portal API | `GET https://main.iam.ad.ext.azure.cn/api/AccountSkus?backfillTenants=true` |

## Service Plans

Service Plans 是每个 ProductSku 下的实际功能。

同样可通过上述 API 查看，在 Graph API 的 `licenseDetails` 响应中以 `servicePlans` 数组返回。

## Offers (Licenses)

Offers 是产品的许可证，不在 API 中列出。可用 offer 主要取决于客户的 channel/type。

## 查找未知 ID 的方法

使用 [M365 Ingestion Analytics - Power BI](https://msit.powerbi.com/groups/me/apps/eab2aacd-3a82-4d0a-8306-89ff0b7d3d48) 门户（Internal Only）：
- 选择 `Catalog Account = "Office 365 Sanya"` 查看 21V/Gallatin 相关信息
- Products tab → 选择产品 → 查看关联的 Service Plans 和 Offers
