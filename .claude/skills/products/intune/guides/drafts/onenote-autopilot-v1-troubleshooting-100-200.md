# Autopilot V1 Troubleshooting Walkthrough (Level 100/200)

> Source: OneNote — Mooncake POD Support Notebook / Intune / ## Windows TSG / Autopilot V2 TSG / Troubleshooting Windows AutoPilot (level 100/200)
> Original: https://learn.microsoft.com/en-us/archive/blogs/mniehaus/troubleshooting-windows-autopilot-level-100200

## OOBE Flow — Step-by-Step Troubleshooting

### 1. Language/Region/Keyboard Selection
- If standard OOBE screens don't appear → bad OS image, unexpected unattend.xml, or OOBE was partially completed
- Fix: Start from scratch or reset OS from Settings app
- Tip: Shift-F10 during OOBE to open command prompt for hardware hash capture

### 2. Network Connection
| Issue | Cause |
|---|---|
| No network adapters detected | OOBE short-circuits → creates local account |
| Proxy issues | Non-auto-discoverable (no WPAD) or user-auth required |
| Cert-based WiFi fails | No certificates available yet during OOBE |
| Firewall blocks | Windows thinks no internet path |

- Shift-F10 → IPCONFIG, NSLOOKUP, PING for basic network troubleshooting

### 3. Azure AD Authentication / Custom Branding
If device not showing custom branding:
- Device not registered with AutoPilot → re-capture hardware hash and upload
- Hardware changes (e.g., motherboard swap) can change hardware hash
- Azure AD Premium license required for branding (doesn't need to be assigned to user for this step)
- Company branding not configured in Azure AD

### 4. Azure AD Join
| Error | Cause |
|---|---|
| 801C0003 "Something went wrong" | User not allowed to join devices to Azure AD |
| 801C0003 | User reached maximum device join limit |

- Configure at: Azure AD > Device settings > Users may join devices to Azure AD

### 5. Automatic MDM Enrollment
| Error | Cause |
|---|---|
| No error, but not managed | Auto MDM enrollment not enabled in Azure AD |
| No error, but not managed | User not in MDM auto-enrollment group |
| 80180018 "Something went wrong" | User lacks Azure AD Premium license |
| 80180018 | User lacks Intune license |
| Enrollment limit reached | Check enrollment restrictions (1-15 devices) |

### 6. Automatic Logon
- Usually works since credentials already validated
- After logon: pulsing status screen → app installation → MDM progress → desktop

## Verification
Settings > Accounts > Access work or school > "Connected to {tenant}" > Info
- Shows MDM enrollment details, server URLs, applied policies
- Can generate HTML diagnostics report or manually sync

## Error Code Lookup
See: https://learn.microsoft.com/en-us/windows/client-management/mdm/azure-active-directory-integration-with-mdm
