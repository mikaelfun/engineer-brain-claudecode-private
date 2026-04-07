# Dual-Federation Support Scenarios

## Overview
When a custom domain is registered in both public Azure and Mooncake (21Vianet), this creates a "dual-federation" environment. Not all Microsoft services and clients support this configuration.

## Supported Scenarios
| Scenario | Status | Notes |
|----------|--------|-------|
| Browser access to Microsoft online services | Supported | Each service has its own URL, trusts AAD in corresponding cloud |
| Multiple services within same cloud instance | Supported | By nature |
| Azure portal | Supported | Mooncake and public portal have different links |
| Power BI portal | Supported | Different links per cloud |
| Power BI mobile app | Supported | App provides environment selector |
| Dynamics website | Supported | Different links per cloud |
| Dynamics mobile app | Supported | App provides server URL for China users |
| AVD | Supported | Users authenticated in local ADDS/AADDS per cloud |

## Unsupported/Limited Scenarios
| Scenario | Status | Notes |
|----------|--------|-------|
| Mobile apps with UPN discovery | Not supported | Discovery service is unified, cannot distinguish same UPN in different clouds |
| Cross-cloud service integration (same AAD context) | Not supported | Online service only trusts AAD in its own cloud |
| Power Automate built-in connectors cross-cloud | Not supported | Can only work within own cloud instance |
| Power Automate general connectors cross-cloud | Supported | HTTP/SMTP connectors allow cross-cloud URLs |
| Intune MAM (same UPN on same device) | Not supported (since 2022-05) | iOS SDK rejects duplicate UPN |
| Office portal external accounts | Not supported | |
| Power Apps mobile (OneAuth enabled) | Broken | OneAuth bug, use "legacy sign-in" |
| Device registration in Mooncake | Won't fix | DRS discovery returns public Azure info |

## Key Principle
Each Microsoft online service trusts Azure AD only in its corresponding cloud instance. Cross-cloud token sharing is not supported.

## Source
- Mooncake POD Support Notebook / Dual-Federation / Technical details
