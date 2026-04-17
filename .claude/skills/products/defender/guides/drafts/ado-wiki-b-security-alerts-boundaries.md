---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Security Alerts/[Boundaries] - Microsoft Defender for Cloud alerts"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FSecurity%20Alerts%2F%5BBoundaries%5D%20-%20Microsoft%20Defender%20for%20Cloud%20alerts"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# [Boundaries] Microsoft Defender for Cloud Alerts

## Alert Management Boundaries

When handling cases related to alerts, categorize them under the following scenarios:

- **False Positive (FP) Alerts:** Alerts triggered by normal activities. Provide a detailed explanation of why the customer considers this a false positive.

- **False Negative (FN) Alerts:** Missed alerts on suspicious activities. Include comprehensive details about when the alert was expected and why the activity is deemed suspicious.

- **Wrong Alert Content:** Issues with alert texts, entities, or extended properties. Specify which field is incorrect or missing and provide the relevant context.

- **Unclear Alerts:** Alerts that are not clear to the customer. Include mitigation steps and describe what aspect of the alert is unclear.

> **Important:** If the alert is determined to be a true positive, or if any resource is confirmed to be compromised, **engage the Incident Response (IR) team immediately.**

---

## Appendix

### Incident Response (IR) SAP Paths

For Windows Servers (including Windows Server 2012 R2 and Windows Server 2012 R2 Datacenter), follow these escalation paths:

**Malicious Activity Suspected or Detected:**
- Account, Machine, or Domain compromise
- Other indicators of attack or compromise
- Other malware
- Ransomware

For Linux-related incidents, escalate to the [Linux IR Escalation Team](https://msaas.support.microsoft.com/queue/0c5b8646-a621-e411-9b58-002dd802026c).

If the malicious actor is identified as being from a different customer in Azure, the customer should open a ticket with the Microsoft Security Response Team (CERT). Alternatively, facilitate this process through: [Microsoft Security Response Center](https://portal.msrc.microsoft.com/en-us/engage/cars).
