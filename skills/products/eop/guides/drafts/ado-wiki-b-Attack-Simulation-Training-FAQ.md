---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Troubleshooting Guides/Attack Simulation Training FAQ"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=/Troubleshooting%20Guides/Attack%20Simulation%20Training%20FAQ"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Attack Simulation Training (AST) — FAQ & Escalation Guide

---

## Minimum Log Requirements for AST Escalation

| Support Scenario | Minimum Logs Required |
|------------------|-----------------------|
| AST Email Reminders not received | TenantId, simulationId/simulationName, email addresses of affected users |
| Backend - AS email not received | TenantId, simulationId/simulationName, email addresses of affected users |
| Backend - AS Not started | TenantId, simulationId/simulationName |
| Backend - Completed Training Inconsistencies | TenantId, trainingId/trainingName, email addresses of affected users |
| Backend - Notification Message not received | TenantId, simulationId/simulationName, email addresses of affected users |
| FP (False Positive) | TenantId, simulationId/simulationName, email addresses of affected users, 3P System also scanning emails? |
| Payload - HTML Tag Removed | TenantId, screenshots of addition and removal |
| Payload - Image rendering | TenantId, simulationId/simulationName, screenshot of the repro, network capture |
| Payload - Phishing link | TenantId, simulationId/simulationName, URL value |
| Payload - Prohibited Wording | TenantId, simulationId/simulationName, screenshot of the repro, network capture |
| Payload - URL blocked | TenantId, simulationId/simulationName, URL value |
| Predicted Compromise Rate Inconsistencies | TenantId, network capture |
| QR Codes Delay or Failure | TenantId, simulationId/simulationName, network capture |
| RBAC | TenantId, simulationId/simulationName, email addresses of affected users, Entra/Azure Portal configurations |
| Report Data | TenantId, simulationId/simulationName, email addresses of affected users |
| UAX - Edit AS | TenantId, simulationId/simulationName, network capture |
| UAX - Landing Page | TenantId, simulationId/simulationName, screenshot of the repro, network capture |
| UAX - Retention Data | TenantId, network capture |

---

## FAQ

**Q. I am having issues with delivery of simulation messages. I am using a 3rd party simulation tool.**

Please confirm if you are using Microsoft's Attack Simulation and Training under MDO or a 3rd party simulation tool. Any issues originating from 3rd party simulations are **not** under the purview of the Attack Simulation and Training team, and should likely be directed to [Advanced Delivery - Phish Simulation Troubleshooting](https://dev.azure.com/Supportability/Modern%20Workplace/_wiki/wikis/Modern%20Workplace/514125/Advanced-Delivery?anchor=advanced-delivery---phish-simulation-troubleshooting).

---

**Q. Can you share more about the different fields logged in reporting? Why can't I see these columns in the exported CSV?**

Admins can export many details including browser/IP/device info. You must select the optional columns **before** exporting the result set.

| Field Name | Description |
|------------|-------------|
| UserName | User name of the user who performed the activity |
| UserMail | Email of the user who performed the activity |
| Compromised | Indicates if the user was compromised (Yes/No) |
| AttachmentOpened_TimeStamp | Timestamp when the attachment was opened |
| AttachmentOpened_Browser | Browser used when attachment was opened (from UserAgent) |
| AttachmentOpened_IP | IP from which attachment was opened (from UserAgent) |
| AttachmentOpened_Device | Device from which attachment was opened (from UserAgent) |
| AttachmentLinkClicked_TimeStamp | Timestamp when the attachment link was clicked |

> For additional field descriptions, refer to the full AST reporting documentation in the wiki.

---

**Q. What does "Predicted Compromise Rate" mean, and why is it inconsistent?**

The Predicted Compromise Rate is an ML-based estimate. If the customer sees inconsistencies, collect a network capture along with TenantId for escalation.

---

**Q. Customer reports QR code simulation emails are delayed or not received.**

Collect: TenantId + simulationId/simulationName + network capture. Escalate to AST product team with these logs.

---

**Q. Customer reports RBAC issues — can't access or edit Attack Simulation Training.**

Collect: TenantId + simulationId/simulationName + email addresses of affected users + Entra/Azure Portal configuration screenshots. Escalate with full RBAC context.

---

## Additional Resources

- [Attack Simulation Training in Microsoft Defender for Office 365](https://learn.microsoft.com/microsoft-365/security/office-365-security/attack-simulation-training-get-started)
- [Advanced Delivery Policy](https://learn.microsoft.com/microsoft-365/security/office-365-security/skip-filtering-phishing-simulations-sec-ops-mailboxes)
