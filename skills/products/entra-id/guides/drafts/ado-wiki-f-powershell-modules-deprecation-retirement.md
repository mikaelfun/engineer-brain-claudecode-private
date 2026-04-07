---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/PowerShell Scenarios/PowerShell modules"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FPowerShell%20Scenarios%2FPowerShell%20modules"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# PowerShell Modules - Deprecation and Retirement Guide

## Retirement Timeline

| Module | End of Support | Retirement |
|-----|-----|-----|
| **MSOnline** | March 30, 2025 | Between early April 2025 to late May 2025 |
| **AzureAD** | March 30, 2025 | July 1, 2025 |

## Affected Modules

- Azure AD PowerShell (AzureAD)
- Azure AD PowerShell Preview (AzureADPreview)
- MS Online (MSOnline)

## Replacement

- [Microsoft Graph PowerShell SDK](https://learn.microsoft.com/en-us/powershell/microsoftgraph/overview?view=graph-powershell-1.0)
- [Microsoft Entra PowerShell](https://learn.microsoft.com/en-us/powershell/entra-powershell/installation?view=entra-powershell)

## Identify Usage

Sign-in logs: Both modules appear under Application Name **Azure Active Directory PowerShell**.

For AzureAD PowerShell, additional usage info in **Migrate Service Principals from the retiring Azure AD Graph APIs to Microsoft Graph** recommendation in [Microsoft Entra Recommendations](https://learn.microsoft.com/en-us/entra/identity/monitoring-health/recommendation-migrate-to-microsoft-graph-api).

## Temporary Outage Tests (Scream Tests)

- **Wave 1** (Jan 20 - Feb 10): Standard customers, 3-8 hour outages
- **Wave 2** (Feb 13 - Mar 8): S500 + non-S500, exception requests possible
- **Wave 3** (Mar 15-30): Final readiness test, no exclusions

During outages: MSOnline cmdlets fail with **403 error** + message "MSOnline PowerShell is disallowed".

No option to avoid/recover. If high-sev impact: file ICM + email aadgraphandlegacypsr@microsoft.com.

## ICM Escalation

- **Owning Service**: AAD Distributed Directory Services
- **Owning Team**: Programmability Infra
- Email: aadgraphandlegacypsr@microsoft.com

## MSOnline Version Requirements

- Versions before 1.1.166.0 (2017) may experience disruptions after June 30, 2024
- Minimum recommended: 1.1.183.81

Check version:
```powershell
Get-InstalledModule MSOnline
```

## General Setup Guidelines

1. Use `-Force` parameter if install/import commands don't work
2. If PowerShell ISE fails, use regular PowerShell for installation, then open ISE
3. If import fails with "Running script is disabled": `Set-ExecutionPolicy -ExecutionPolicy Unrestricted`
4. If command not recognized: update the module or reconnect

## MgGraph Module Quick Start

```powershell
Install-Module Microsoft.Graph
Import-Module Microsoft.Graph -Force
Connect-MgGraph -Scopes "User.ReadWrite.All"
```

## Migration Resources

- [Migrate from Azure AD PowerShell to Microsoft Graph PowerShell](https://learn.microsoft.com/en-us/powershell/microsoftgraph/migration-steps?view=graph-powershell-1.0)
- [Cmdlet map](https://learn.microsoft.com/en-us/powershell/microsoftgraph/azuread-msoline-cmdlet-map?view=graph-powershell-1.0)
- [Microsoft.Graph Compatibility Adapter](https://www.powershellgallery.com/packages/Microsoft.Graph.Compatibility.AzureAD/0.6.0-preview) - supports migration via response translation and cmdlet aliasing
