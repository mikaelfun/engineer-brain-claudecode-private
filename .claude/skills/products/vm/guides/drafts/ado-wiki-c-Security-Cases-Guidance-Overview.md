---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/Processes/Security Cases Guidance/An Overview Security Cases Guidance_Process"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FProcesses%2FSecurity%20Cases%20Guidance%2FAn%20Overview%20Security%20Cases%20Guidance_Process"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Process
- cw.Reviewed-01-2025
---

[[_TOC_]]

# Security Cases Guidance Overview

This wiki section contains a list of articles with workflow guidance and suggestions for VM POD support engineers on handling security incident cases and where to transfer them.

Different security cases should be handled by different teams. If a case is misrouted to the VM queue, engineers can follow the steps below:

- For Sev A — follow the process defined here: [Handling a misrouted case with 15 minutes SLA](https://supportability.visualstudio.com/AzureRapidResponse/_wiki/wikis/AzureRapidResponse.wiki/547571)
- For Sev B/C:
    1. If IR is approaching, meet the SLA, engage the correct team via a collaboration task, inform the customer, set expectations, and once an engineer is assigned, ownership can be swapped with mutual agreement or continue to work with collaboration owners until the issue is resolved, based on customer requirements.
    2. If there is enough time left for IR and the problem description clearly indicates it's outside of our scope, change the SAP and reroute to the right team. For any other scenarios, work via a collaboration task with the correct team.

# Common Topics and Transfer Queues

| Topics | Issue examples | SAP examples |
|--|--|--|
| Vulnerability detects | Kernel upgraded still vulnerabilities are reflecting in Defender; Office patches shown in vulnerability list; Qualys Extension Not Working | Azure/Microsoft Defender for Cloud/*/Vulnerability Assessment (VA) |
| Microsoft Defender for Cloud (previously called Security Center) | JIT issues; MDE Alerts with Defender for Cloud source; Defender for Cloud configuration; Security Alert; Secure Score; VM Security Extension | Azure/Microsoft Defender for Cloud/*/Security Alert Investigation |
| Microsoft Sentinel | All topics related to Sentinel except Log Analytics | Azure/Microsoft Sentinel |
| Key Vault | Key Vault secret recovery; Key Vault permission/configuration | Azure/Key Vault/Key Vault Administration\Key Vault Recovery (Soft Delete & Purge Protection) |
| Windows Defender / Microsoft Defender for Endpoint (MDE) | Malware submissions; Antimalware issues; MDE Portal; Threat and vulnerability management; Windows Defender Exploit Guard; DLP; Windows and MacOS Onboarding | Security/Microsoft Defender/Microsoft Defender for Endpoint |
| Compromised Devices | Investigation of compromised Windows-based systems from malware; Investigation of alerts from security products (AATP/ATA, ASC, Azure Sentinel, MCAS, MDATP); DHA compromises; AAD confirmed compromises | Azure/Security incident Response/Malicious Azure AD Activity Detected/; Windows/Malicious Activity Suspected or Detected/ |
| Security and Compliance | DLP topics; Policy setup; Alerts not reaching compliance portal; Compliance activity explorer | Security/Microsoft Purview Compliance/Data loss prevention (DLP) |

# Common MDE Misroutes

| Technology | Support Team |
|--|--|
| Code Integrity guard | Windows Devices and Deployment Premier |
| SCCM signature updates not applying | SCCM |
| Windows Defender Application Control / Credential Guard / Device Guard / Smart App Control | Windows Devices and Deployment Premier |
| Windows Defender Application Guard | Windows User Experience Premier |
| Applocker or software restriction policies | Windows User Experience Premier |
| Windows Defender Firewall | Windows Networking Team |
| Windows Firewall policies set in Intune do not apply | Enterprise Intune |
| Ransomware / Incident Response analysis / Investigation / root cause | Incident Response |
| Microsoft Endpoint Management (SCCM/Intune) | Enterprise Intune |
| Microsoft Security Baseline | Combination between AD/DS and Intune/SCCM |
| Safe Documents in Office 365 ATP | Defender for Office team |
| MDE Alerts with MDI source | Defender for Identity |
| Threat Monitoring tool | tmtextsupport@microsoft.com |
| Microsoft Defender Install/Uninstall through roles and Features or PS | Windows Devices and Deployment Premier |

# Other Security Scenarios

- [ARM Portal Security Issue](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496029/ARM-Portal-Security-Issue_Portal)
- Account stealing issue: Involve CDOC Cyber Defense Operations Center (CDOC) <cdoc@microsoft.com>
- Microsoft Online Services abuse / attacked by MS IP addresses:
    - Let the customer report abuse at: https://portal.msrc.microsoft.com/en-us/engage/cars
    - Send email to CERT and CDOC: <cdoc@microsoft.com>
