# Azure RMS Mooncake Operational Tooling Reference

## Azure Subscriptions (Mooncake)
| Subscription | ID | Purpose |
|--------------|----|---------|
| AADRM.PROD.MC.A | 8298715c-1e15-4a2a-87c3-e048ed1991cb | Key Vaults, Traffic Management |
| AADRM.PROD.MC.B | 6f2d2d65-e111-47de-b2d9-4c995c7e9567 | |
| AADRM.PROD.MC.Monitoring | 18729c3b-368b-4f35-93e1-e614807b9f92 | |

## ICM Templates
| Scenario | Link | Team |
|----------|------|------|
| App pre-authorization | [AzRMS-AppPreAuthz](https://aka.ms/AzRMS-AppPreAuthz) | Azure Rights Management/First Party App Pre-Authorization |
| Customer reported issues (CRI) | [AzRMS-NewCRI](https://aka.ms/AzRMS-NewCRI) | Azure Rights Management/Triage |

## First-Party App List
| Name | Application ID |
|------|---------------|
| Microsoft Rights Management Services | 00000012-0000-0000-c000-000000000000 |
| RMS Protection Tool | 4186465f-9980-40eb-98ca-35fea66b63e4 |
| RMS Sharing App | 6b069eef-9dde-4a29-b402-8ce866edc897 |
| Azure RMS Tracking Portal | 8ad4564c-ab19-478e-bdb4-662bbecaec2e |
| Aadrm Admin Powershell | 90f610bf-206d-4950-b61d-37fa6fd1b224 |
| Microsoft Information Protection API | 40775b29-2688-46b6-a3b5-b256bd04df9f |
| Azure Rights Management connector | 3fb71990-163e-4975-a0b1-a84d2e3149ef |

## Pre-Authorized Apps
| App ID | Display Name | Roles |
|--------|-------------|-------|
| 00000009-... | Power BI Service | Content.Writer |
| 00000003-0000-0ff1-ce00-... | Office 365 SharePoint Online | Content.Writer, DelegatedReader, DelegatedWriter |
| 3090ab82-... | Microsoft Cloud App Security (MCAS) | Content.Writer |

## Geneva Logs (Jarvis)
- **Endpoint**: CA Mooncake
- **Namespace**: RmsMds / RmsPinger
- **Env**: PROD
- **Region**: MC
- **ScaleUnit**: rmsoprodmc-a / rmsoprodmc-b
- **DataCenter**: CE2 / CN2
- **Hot Path Account**: AzRMS_MC

## Kusto
- **Cluster**: [https://azrmsmc.kusto.chinacloudapi.cn](https://azrmsmc.kusto.chinacloudapi.cn)
- **Security Group**: RmsMooncakeKustoUser (join via IDWEB)
- **Tables**: RequestLog, IISLog, reports

## Escort / JIT Access
- **Mooncake JIT**: https://jitaccess.security.core.chinacloudapi.cn/
- Use SAW + AME Account
- Tip: Use ICM incident number for auto-approval; if AME can't resolve ICM, use "OTHER"
- After requesting JIT, wait ~30 min for Teams ping with instructions

## Client Side Logging
- Reference: [IRM Troubleshooting FAQ - OWiki](https://www.owiki.ms/index.php?title=IRM/Microsoft/Documentation/IRM_Troubleshooting_FAQ)
- Involve Office team for verification

## Source
- OneNote: Mooncake POD Support Notebook > AIP > Troubleshooting tools > Azure RMS ICM, Jarvis, Kusto
