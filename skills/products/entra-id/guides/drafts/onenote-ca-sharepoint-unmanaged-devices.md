# Conditional Access with SharePoint Online Unmanaged Device Control

## Summary
SharePoint Admin Center's unmanaged device access control leverages AAD Conditional Access with "Use app enforced restrictions" session control, delegating the block/allow decision to SharePoint service side.

## How It Works
1. SharePoint Admin Center creates CA policies prefixed with `[SharePoint admin center]`
2. The CA policy effect is "Use app enforced restrictions" — AAD allows sign-in but passes device info to SharePoint
3. SharePoint decides to block or allow based on tenant-level or site-level unmanaged device settings

## Auto-Created CA Policies (when blocking non-browser access)
| Policy | Users | Apps | Conditions | Grant | Session |
|---|---|---|---|---|---|
| Block from apps on unmanaged devices | All users | SPO | Non-browser clients | Require Hybrid AAD Join or compliant device | - |
| Use app enforced restriction for browser | All users | SPO | Browser clients | - | Use app enforced restrictions |

## Design Pattern: Corporate Network + Managed Devices
For requiring corporate devices on corporate network:
1. Add corporate egress IPs to CA trusted locations
2. Policy A: Block all users accessing SPO from non-corporate IPs
3. Policy B: For corporate IPs, require Hybrid AAD Join (or use app-enforced restrictions for per-site control)

## Per-Site Device Control
If differentiation by SharePoint site is needed:
- Set Policy B grant to empty, session to "Use app enforced restrictions"
- Use SharePoint PowerShell to configure site-level access policies

## Caveats
- Test with a small user scope first to avoid locking out admins
- Use app enforced restrictions only works with SharePoint Online

## 21V Applicability
Applicable to Mooncake with equivalent CA and SPO configuration.
