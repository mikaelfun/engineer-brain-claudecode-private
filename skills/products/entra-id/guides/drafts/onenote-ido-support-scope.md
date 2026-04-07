# IDO (M365 Identity) Support Scope

## Overview
M365 Identity (IDO) 团队的支持范围定义，明确各类问题归属。

## Support Scope Matrix

| Topic | Scope | Notes |
|-------|-------|-------|
| Integrated apps (M365 Portal) | AAD Auth 只处理通过 AAD Gallery/Non-Gallery 发布的、使用 SAML/Password SSO 的第三方应用。第一方应用显示/集成问题由对应团队处理。 | |
| Sign-in issues with Office apps | Office app team 主导 case，AAD auth 在问题缩窄到 AAD auth 或 ADAL/MSAL/WAM 后介入。 | 客户端 Outlook/Teams 登录失败 → function team main case，IDO task；CA policy → IDO main case |
| ADFS | Federation trust 涉及第一方应用如 SharePoint 时需同时 engage 对应团队 | |
| WAM | 部分 WAM case 需要与 DS/Perf/Office 365 协作 | AAD WAM plugin → AAD/IDO；WAM core → Windows；Cloud AP plugin → AAD/Windows；Office client → Office Client |
| Azure/Office 365 PowerShell | AAD Auth 只处理 auth 相关命令/问题 | IDO 只看 PowerShell 登录问题 |
| User Management | Teams setup Status 归 Teams | |
| Group Management | Meet/Teams policy → EXO/Teams；Shared mailbox → EXO | |
| License Management | O365 identity 包括直接 license assignment。License 未绑定 tenant → Commerce；有 license 但服务未 provisioned → 各服务；购买 license → Commerce | License assign 成功但客户端识别不到 → function team |
| Role Management | Exchange role group → EXO | |
| Domain Management | Domain connect to M365 | |
| AAD Audit/Sign-in reports | 特定 sign-in entry 解释 → Auth team；特定 audit log entry → 各 workload | |
| Setup (M365 Portal) | 仅 Sign-in and security 部分 | 历史遗留，M365 portal 在 IDO 下 support |
| ForwardSync/DualWrite (ProxyCalc) | Code owned by EXO Provisioning | IDO 不 cover，需 EXO engineer 升级给 PG |

## SAP Product
`Microsoft 365\China 21Vianet Microsoft 365 Identity`

## Reference
- [M365 Admin Center Support Boundaries](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1270330/%E2%9A%99%EF%B8%8FM365-Admin-Center-Support-Boundaries)
