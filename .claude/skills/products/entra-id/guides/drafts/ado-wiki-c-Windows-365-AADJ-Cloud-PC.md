---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Device Registration/Window Devices/Windows 365 AADJ Cloud PC"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/Device%20Registration/Window%20Devices/Windows%20365%20AADJ%20Cloud%20PC"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Windows 365 AADJ Cloud PC — Support Guide

## Overview

Windows 365 Enterprise supports both **AADJ** and **HAADJ** Cloud PCs. AADJ Cloud PCs are provisioned via Microsoft Endpoint Manager (Intune) using a Provisioning Policy.

**Key facts**:
- AADJ process is modified for "zero touch" (similar to Autopilot but unique to W365)
- AADJ failures on W365 Cloud PCs → **Windows365 team** (not Intune)
- RDP sign-in errors mimic errors on Azure VMs with AadLoginForWindows VM Extension
- **Per-User MFA is NOT supported** → causes RDP sign-in to fail

## Identifying a Windows 365 Cloud PC

1. Device `displayName` always starts with **CPC-**
2. In Microsoft Endpoint Manager: `Device Model` starts with `Cloud PC Enterprise` (e.g., `Cloud PC Enterprise 2vCPU/8GB/256GB`)
3. Graph API: `"model"` field starts with `Cloud PC`

## Client Connectivity Requirements

| Client | Local device state required |
|--------|-----------------------------|
| Windows desktop client (msrdc.exe) | Must be AADJ, HAADJ, or Registered in **same tenant** as Cloud PC (for PKU2U) |
| Web client (https://client.wvd.microsoft.com) | None |
| Android | None |
| macOS | None |
| iOS | None |

> Customers deploying Security Baseline policies to Cloud PCs must re-enable PKU2U protocol in group policy.

## Support Boundaries

| Scenario | Owning Team | SAP |
|---------|-------------|-----|
| AADJ provisioning failures on W365 Cloud PCs | **Windows365** | Windows 365\Windows 365 Enterprise Edition\Provisioning\Provisioning Failure |
| RDP access failures to W365 Cloud PCs using AAD | **Windows365** | Windows 365\Windows 365 Enterprise Edition\Provisioning\Provisioning Failure |
| Policy deployment, compliance, etc. | **Intune** | Intune SAP |
| W365 Business issues | **Windows365** | Windows 365\Windows 365\Windows 365 Business Edition\Provisioning\Provisioning Failure |

> Incidents transferred regardless of Unified/Premier status → handled by Modern Work Unified/Premier Support delivery teams.

## Case Routing

Once identified as a Windows 365 Cloud PC, follow the [Windows 365 Support Model](https://supportability.visualstudio.com/M365%20Release%20Announcements/_wiki/wikis/M365-Product-Updates.wiki/504135/Introducing-Windows-365?anchor=support-model):

- **W365 Business** → CloudPC - SAP: `Windows 365\Windows 365\Windows 365 Business Edition\Provisioning\Provisioning Failure`
- **W365 Enterprise** → Enterprise CloudPC - SAP: `Windows 365\Windows 365\Windows 365 Enterprise Edition\Provisioning\Provisioning Failure`

## Known Limitations

- Per-User MFA causes RDP sign-in to fail
- Local device must be in same tenant for Windows desktop client (PKU2U)
- Security Baseline policies may disable PKU2U — must re-enable via GPO
