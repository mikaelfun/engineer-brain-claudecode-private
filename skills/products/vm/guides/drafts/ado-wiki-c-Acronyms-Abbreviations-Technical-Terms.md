---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/How It Works/Acronyms, Abbreviations, Technical Terms, Frequently Used Links_How It Works"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FHow%20It%20Works%2FAcronyms%2C%20Abbreviations%2C%20Technical%20Terms%2C%20Frequently%20Used%20Links_How%20It%20Works"
importDate: "2026-04-06"
type: troubleshooting-guide
tags: [acronyms, reference, glossary, azure-iaas-vm]
---

# [How It Works] Azure IaaS VM — Acronyms, Abbreviations & Technical Terms

> Full table (34KB) available at wiki URL above. Key entries extracted below.

## IPs & Special Addresses

| Item | Description |
|------|-------------|
| `169.254.169.254` | IMDS (Instance Metadata Service) endpoint |
| `168.63.129.16` | Wireserver (Azure platform agent communication) |
| `23.102.135.246` | KMS server `kms.core.windows.net` for Windows Activation |
| `8.8.8.8` / `8.8.4.4` | Google Public DNS (used for network troubleshooting) |

## Key Acronyms (A–Z, selected)

| Acronym | Full Name | Description |
|---------|-----------|-------------|
| ABC | Azure Blob Cache | Middle-layer component of IaaS Disk; implemented as driver `blobcache.sys` |
| ACIS | Azure Customer Information Service | Retired web tool; now implemented as Jarvis (Geneva) Actions |
| AIR | Availability Interruption Rate | Indicator for unexpected availability events; AIR-R (reboots), AIR-BP (blips/pauses) |
| AKS | Azure Kubernetes Service | |
| Antares | Azure Web Apps | Codename |
| Allocator | (Fabric Controller component) | Service handling VM allocation requests in fabric controller |
| APTS | Azure Platform Technical Support | Legacy first support team for Azure IaaS (no longer exists) |
| ARM | Azure Resource Manager | Resource management service |
| ARM Sync | ARM Sync operation | Sync between ARM and resource providers; ARM team performs this |
| ARR | Azure Rapid Response | Support team for ARR-contracted customers |
| ASC | Azure Support Center | Tool to view customer resources and investigate issues |
| ASI | Azure Service Insight | Tool for analyzed Kusto/metrics data |
| ASM | Azure Service Management | Legacy resource manager = RDFE |
| AzSM | Azure Zonal SM (Service Manager) | Enables VM allocation beyond fabric clusters; manages zonal-level resources |
| AzSM Cluster | Azure Zonal SM Cluster | Manages resources at zonal level; e.g., `uswest-prod-a` |
| AzureRT | Azure Runtime (team) | Legacy name for Compute Platform (CPlat); still used in IcM team names |
| Blackforest | German Cloud | Codename |
| Blade | Blade Server / NodeId | In Kusto, `BladeId` = `NodeId` |
| Blobcache | → ABC | |
| Brooklyn | Azure Virtual Network and VPN | Codename |
| BSOD | Blue Screen Of Death | Windows kernel crash; error code = BugCheck code |
| Canary Regions | → EUAP | Early Update Access Program regions |
| CEN | Classification, Escalation and Notification | Criteria list for ICM escalation severities; see https://aka.ms/cen |
| CHIE | Cloud Hardware Infrastructure Engineering | Microsoft BU building cloud hardware |
| CLI | Command Line Interface | Azure CLI tool |
| Cloudnet | Azure PG organization | In charge of network-related components |
| Cluster | Fabric Cluster | In Azure context, usually means a Fabric Cluster |
| CM | Compute Manager | Also "Compute Manager team" |
| CRP | Compute Resource Provider | |
| EEE | Engineering Escalation Expert | Internal escalation experts in Azure support |
| FC | Fabric Controller | Component in Compute Manager managing tenant/container allocation on host nodes |
| GAPA | Guest Agent / Provisioning Agent | |
| IMDS | Instance Metadata Service | Available at 169.254.169.254 |
| IcM | Incident Management | Microsoft internal incident management system |
| ICM | → IcM | |
| NRP | Network Resource Provider | |
| NSM | Network State Manager | Network-related state component in Fabric Controller |
| PIR | Platform Image Repository | |
| RDFE | Red Dog Front End | Legacy Azure Service Management (ASM) endpoint |
| RDOS | Raw Device OS / Host OS | The underlying host operating system; now "Host Node" team |
| SRP | Storage Resource Provider | |
| TA | Technical Advisor | Senior internal Azure support engineer |
| TenantName | Deployment ID (GUID) | Used by Compute Manager to represent a VM/VMSS deployment |
| VIP | Virtual IP | IP address allocated to a VM/VMSS tenant by the network stack |
| VMSS | Virtual Machine Scale Set | |
| Wireserver | Platform agent endpoint | Available at 168.63.129.16; used by VM agents for host communication |

> For the complete 300+ entry table including tools (ASC, Jarvis, Geneva Actions, etc.), regions, and team names, see the full wiki page at the URL above.
