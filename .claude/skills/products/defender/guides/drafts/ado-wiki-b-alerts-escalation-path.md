---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/MDC Escalations and procedures/MDC CRI Escalations procedure for CSS/[Procedure] - Security Alerts and Container Security Escalation Process for CSS/[Procedure] - Microsoft Defender for Cloud Alerts Escalation Path"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/MDC%20Escalations%20and%20procedures/MDC%20CRI%20Escalations%20procedure%20for%20CSS/%5BProcedure%5D%20-%20Security%20Alerts%20and%20Container%20Security%20Escalation%20Process%20for%20CSS/%5BProcedure%5D%20-%20Microsoft%20Defender%20for%20Cloud%20Alerts%20Escalation%20Path"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# MDC Security Alerts Escalation Path

## Case Boundaries
- **False Positive** (alert on normal activity): Describe why customer argues it is a false positive
- **False Negative** (missed suspicious activity): Full details of when alert was expected and why suspicious
- **Wrong Alert Content** (texts, entities, extended properties): Mention what field and context is wrong/missing
- **Alert is unclear to customer**: Describe what is unclear

> If alert is true-positive or resource is compromised, **engage Incident Response (IR) team ASAP!**

## Escalation Flow

1. **Investigate** using [Security Alerts Initial Investigation TSG](https://dev.azure.com/asim-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud/10143/-Troubleshooting-Guide-Security-Alerts-initial-investigation)
2. **Check alert provider** using Kusto queries or [AME-MDC Kusto Dashboard](https://dataexplorer.azure.com/dashboards/5b62cb94-4ed6-4ad1-b1f7-4715d2dc5998)
3. **Find provider contact** in [Alert Providers Table](https://msazure.visualstudio.com/One/_wiki/wikis/Rome%20Detection/37941/List-Of-Registered-Providers)
4. **If provider is 'Detection'** -> Escalate to RomeDetection IcM team using template P353J2
5. **For any other provider** -> Escalate per provider's 'IcM Group' or 'CSS tickets Distribution List'. CC: RomeDetectionLive@microsoft.com if email escalation only option
6. **When resolved** -> Follow [Root Cause Classification procedure](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud/...) when closing case

## IR SAP Paths
Windows Servers paths:
- Malicious activity suspected or detected\Account, Machine, or Domain compromise
- Malicious activity suspected or detected\Other indicators of attack or compromise
- Malicious activity suspected or detected\Other malware
- Malicious activity suspected or detected\Ransomware

Linux: [IR Escalation Team Queue](https://msaas.support.microsoft.com/queue/0c5b8646-a621-e411-9b58-002dd802026c)

External actor from another Azure customer: Submit to [Microsoft Security Response Center (CERT)](https://portal.msrc.microsoft.com/en-us/engage/cars)
