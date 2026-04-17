# AVD Support Scope & Case Routing (Mooncake)

> Source: OneNote - Mooncake POD Support Notebook / AVD / Collaboration and Escalation process / AVD Support scope

## Case Ownership Matrix

| Problem Type (L1) | Category (L2) | Owner | Collaboration |
|---|---|---|---|
| Authentication issues with WVD | Smart card authentication | Mooncake | AD |
| Azure Monitor for WVD | Data interpretation / deployment / dashboard errors | Mooncake | Mooncake |
| Configuring WVD licensing | — | Mooncake | Mooncake |
| FSLogix | Profile/Office Container, Application Masking, Agent issues | Mooncake | Mooncake |
| Issues configuring application groups | — | Mooncake | Mooncake |
| Issues creating a host pool | — | Mooncake | Mooncake |
| Issues creating a workspace | — | Mooncake | Mooncake |
| MSIX app attach | Error messages, Setup (certificates, shares, permissions) | Mooncake | Mooncake |
| **Purely MSIX issue** (before attach to AVD) | MSIX package creation | **Windows** | — |
| Performance in WVD session | Slow connection | Mooncake | Windows → Azure NET |
| Performance in WVD session | Slow logon / slow apps / slow session | Mooncake | Windows |
| Remote Desktop Clients | — | Mooncake | Windows |
| Session connectivity | Black/blank screen, unavailable hosts, connection failures, disconnects | Mooncake | Mooncake/Windows |

## Additional Support Areas

| Topic | Owner | Collaboration |
|---|---|---|
| AD Domain Join | Mooncake | On-Prem AD |
| Group Policy related | Mooncake | On-Prem AD |
| Teams application in WVD | Mooncake | Office |
| Deployment failures (domain join, DSC extension, quota, portal) | Mooncake | On-Prem AD / Mooncake |

## Key Rules

1. If AVD issue is identified as purely Windows OS internal (e.g. Windows IME), sync with Windows Perf team (Yang Hong/Eric Li) to determine case ownership
2. If root cause is unclear at start, Mooncake owns case ownership; final ownership goes to team contributing most to resolution
3. MSIX issues before attaching to AVD → Windows Support scope (Support Topic: Windows\Application Technologies\MSI and MSIX)

## Swarming Channel

- Teams: Azure Virtual Desktop channel (Microsoft internal)
