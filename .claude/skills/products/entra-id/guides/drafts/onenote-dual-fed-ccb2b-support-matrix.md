# Dual-Federation & Cross-Cloud B2B Support Matrix

## Client Support Matrix

| Client | Dual-Fed Support | CC B2B Support |
|--------|-----------------|----------------|
| Azure portal | Yes (different links) | Yes (redirects to home cloud AAD) |
| Office portal | Yes (different links) | No (no external account support) |
| Office client | TBD | TBD |
| SharePoint Online | - | Yes |
| SharePoint mobile app | - | TBD |
| Power BI portal | Yes (different links) | TBD |
| Power BI mobile app | Yes (environment selector) | Not supported (as of 2024/02) |
| Power Apps website | Yes (different links) | TBD |
| Power Apps mobile app | Only for public account (OneAuth issue) | TBD |
| Dynamics website | Yes (different links) | TBD |
| Dynamics mobile app | Yes (server URL selector) | TBD |
| AVD | Yes (local ADDS/AADDS) | Likely unsupported (no B2B user support) |
| AADR | TBD | - |
| AADJ | TBD | - |
| HAADJ | - | - |
| Intune MAM | Not supported (same UPN) | - |

## Notes
- Dual-fed is generally supported for web-based services with distinct URLs per cloud
- Mobile apps that rely on UPN discovery are problematic
- CC B2B support varies by service; Azure portal has known issues for guest login in 21v

## Source
- Mooncake POD Support Notebook / Dual-Federation / Technical details / Support matrix (including CC B2B)
