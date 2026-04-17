---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for Servers/Vulnerability Assessment/Built-in solution/MDVM - TVM/[outdated] [Product Knowledge] - Vulnerability Assement with Microsoft Defender Vulnerability Management (MDVM)"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/Workload%20Protections/Defender%20for%20Servers/Vulnerability%20Assessment/Built-in%20solution/MDVM%20-%20TVM/%5Boutdated%5D%20%5BProduct%20Knowledge%5D%20-%20Vulnerability%20Assement%20with%20Microsoft%20Defender%20Vulnerability%20Management%20(MDVM)"
importDate: "2026-04-07"
type: troubleshooting-guide
---

**Microsoft Defender Vulnerability Assessment (MDVA) - Threat and Vulnerability Management (TVM)**

[[_TOC_]]

# Vulnerability Assessment (VA) with Microsoft Defender Vulnerability Assessment (MDVA) and Software Inventory

## Preface
Microsoft Defender Vulnerability Assessment (MDVA) with Threat and Vulnerability Management (TVM) was first introduced to Microsoft Defender for Cloud (MDC) in October 2021 as a public preview.  
- Public Documentation for Threat and Vulnerability Management (TVM): [Threat and vulnerability management](https://learn.microsoft.com/en-us/microsoft-365/security/defender-vulnerability-management/defender-vulnerability-management?view=o365-worldwide)
- Training session: 
   - Recording: [IS Customer Service and Support (CSS) Expert weekly-20211007_Security Center TVM Overview](https://microsoft-my.sharepoint-df.com/:v:/p/elsagie/EaYgrW7xVH5EvVjZe_pLftEB0UYZsPXHGIrSVPgY--3j5g)

## Overview

### What is Threat and Vulnerability Management (TVM)?
- Threat and Vulnerability Management (TVM) is a built-in capability in Microsoft Defender for Endpoint (MDE).
- It uses a risk-based approach to discover, prioritize, and remediate endpoint vulnerabilities and misconfigurations.

### Current Microsoft Defender for Endpoint (MDE) + Microsoft Defender for Cloud (MDC) Alerts Integration
- Sense (Microsoft Defender for Endpoint (MDE) agent) is installed on all Microsoft Defender for Cloud (MDC) machines onboarded to Microsoft Defender for Endpoint (MDE).
- Sense adds to all events Microsoft Defender for Cloud (MDC) data  Azure Resource Identifier (ID), Workspace Identifier (ID), etc.
- The alerts that belong to Microsoft Defender for Cloud (MDC) devices are pushed to Microsoft Defender for Cloud (MDC) and presented in the portal.

### How does it work?
- Threat and Vulnerability Management (TVM) generates blobs for each export type (Software Inventory per Virtual Machine (VM), Recommendations per Virtual Machine (VM), organization-agnostic Vulnerabilities).
- Vulnerability Assessment (VA) samples the Threat and Vulnerability Management (TVM) endpoints, ingests the export blobs to Kusto.
- Querying Kusto for onboarded subscriptions data, which in turn is then written to Azure Resource Graph (ARG).
- Refresh rate is approximately 4 hours.

### Which Operating Systems (OS) are supported?
- [Microsoft Defender Vulnerability Management (MDVM) - Supported operating systems, platforms, and capabilities](https://learn.microsoft.com/en-us/defender-vulnerability-management/tvm-supported-os)

### [Top 10 reasons why TVM is worth the switch](https://microsoft.sharepoint.com/teams/windef/atp/SitePages/Qualys.aspx)

## Find Virtual Machine (VM) Microsoft Defender for Endpoint (MDE) Device Tags

- Run the following query to determine which datacenter the Virtual Machine (VM) is mapped to from the main Kusto cluster:
 
  `https://wcdprod.kusto.windows.net/Geneva`<br>
**TelemetryLog**<br>
| where env_time > ago(1d)<br>
| where MachineId == "{MDE Device ID}"<br>
| distinct DataCenter<br>

   <br> 

  | DataCenter |
  |--|
  | WestEurope |
  | NorthEurope |

 <br>


- Query it and search for the data:

  **MachineInfoEvents**<br>
  | where ReportArrivalTimeUtc > ago(1d)<br>
  | where MachineId == "{MDE Device ID}"<br>
  | project OrgId, MachineId, WcdMachineId, SenseMachineGuid, ReportTime, ReportArrivalTimeUtc, ComputerDnsName, ReportIndex, IsTestOrg, OsPlatform, DeviceCategory, 
  DeviceFamily, OsVersion, AdditionalFields, FullOsVersion, TenantId, OnboardingStatus, DeviceTagsAsJson<br>
  | distinct DeviceTagsAsJson
 
  <br>

  | DeviceTagsAsJson |
  |--|
  | [{"Name":"securityworkspaceid","Value":"StrPII_56415e882422acb6d922aebcb0093499858e54d9"},{"Name":"azureresourceid","Value":"StrPII_2b1c3929cf01b5dc5f3babf7e9a699238b01044a"}] |

**Note:** The tags shown above are SHA-1 hashed hence why the values are not of any use for telemetry filtering. Find more information on how to de-hash them here: [Technical Knowledge - Get the Microsoft Defender for Endpoint (MDE) Machine ID from the Azure Resource ID](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud/2465/-Technical-Knowledge-Get-the-MDE-MachineID-from-the-Azure-Resource-ID)

---
