---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Engineer Reference/Processes/Case Title Taxonomy"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FEngineer%20Reference%2FProcesses%2FCase%20Title%20Taxonomy"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Intune Case Title Taxonomy

## Format

```
{Region} | {SME Area} | {Qualifier (optional)} | {Issue Title}
```

**Position order:** Region → SME Area → Qualifier → Title. Do not change this order.

## Reference Tables

### Regions
- ATZ
- EMEA
- APAC

### SME Areas

| SME Area | Description |
|---|---|
| 3Party | Cases related to 3rd-party integrations: Mobile Threat Defense partners (Symantec, Lookout, Sophos), Windows Defender ATP, JAMF, etc. |
| App-Deploy | Application deployment issues on all platforms, including VPP. Also includes PowerShell scripts and Data Warehouse (deployment portion). |
| App-SDK | Application development, Intune SDK LOB wrapping. Also includes scripts failures, Graph API calls or any other coding scenario. |
| AutoPilot | All Autopilot scenarios. |
| Certs-Resource | Certificate deployment (SCEP, PFX, PFX import) and all Resource policies (VPN, Email, WiFi) including Microsoft Tunnel Gateway (MTG). |
| MEMCM | AKA Co-Management — All Co-Management scenarios (MEMCM), including enrollment. |
| Cond-Access | All Conditional Access cases. |
| Dev-Action | Remote tasks issued on-demand by an Intune administrator (e.g., Retire, Wipe, Reset Passcode). |
| Dev-Compliance | Compliance policies — rules and settings that users and devices must meet to be compliant. |
| Dev-Config | All device Configuration policies (except certificate/Resource area) for iOS, Android and Mac platform. (Windows → Win MDM). |
| Enroll | All enrollment issues, except Autopilot or Co-Management enrollment. May include MDM authority reset scenarios. |
| MAM-App config | Mobile Application policies: App protection policies, App configuration policies, etc. |
| Security | Endpoint Security, Security Baselines, Security Tasks, MDE, Security Policy (Antivirus, disk encryption, firewall, EDR, ASR, account protection), Firewall rule migration, Tenant attach (Intune side), Encrypt disks (BitLocker, FireVault). |
| Updates-Roles | Windows update rings, Intune RBAC roles, PC management. |
| Win MDM | All Windows MDM processes, including PM management and 3rd-party MDM using Windows enrollment. |
| Endpoint Analytics | Endpoint Analytics, Tenant attach. |

### Qualifiers (optional, position 3)

| Qualifier | Meaning |
|---|---|
| BC | Broad Commercial customer |
| Prem | Premier customer |
| GCC-H | Fairfax (US government) customer |
| BlackForest | Germany government cloud |
| SAW | Secure Access Workstations |
| DCR | DCR process involved |
| Strategic | Strategic customer |
| EDU | Education customer |
| ICM # | When an IcM has been filed (include IcM number) |

## Examples

```
APAC | Enroll | Strategic | Cannot enroll DEP devices.
ATZ | MAM-App config | GCC-H | App protection policies are not working on iOS devices.
EMEA | Dev-Action | ICM 12345678 | Wipe report.
ATZ | Certs-Resource | Wifi SCEP is not deploying.
EMEA | App-Deploy | PowerShell script is not working.
```

## Important Rules

- **Format must be precise** — Spaces and format are important.
- **Exact wording of the SME area.**
- Qualifiers are **optional**.
- "GUI-Reports" category has been deprecated — any reporting concern falls under the SME area within which the report resides.

## Tool

Use **Rave Helper** to facilitate the taxonomy:
https://internal.evergreen.microsoft.com/en-us/topic/1f34f6bd-43c7-3f2c-cdc6-1f6b6884ab0f
