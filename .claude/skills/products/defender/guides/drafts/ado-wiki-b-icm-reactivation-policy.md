---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/MDC Escalations and procedures/MDC CRI Escalations procedure for CSS/Microsoft Defender for Cloud (MDC) - ICM Re-activation policy restriction"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/MDC%20Escalations%20and%20procedures/MDC%20CRI%20Escalations%20procedure%20for%20CSS/Microsoft%20Defender%20for%20Cloud%20(MDC)%20-%20ICM%20Re-activation%20policy%20restriction"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# ICM Re-activation Policy Restriction

## Background
Time to Mitigate (TTM) is a vital metric for evaluating incident response speed. A new automation restricts re-activation of CRIs under specific conditions to improve TTM accuracy and data integrity.

## Automation Behavior
Re-activation is blocked when:
- Incident has been in **Resolved** status for **more than 7 days**
- Incident has been in **Mitigated** status for **more than 14 days**

CSS engineers will receive an automated email notification when restriction is triggered.

## CSS Expectations

### 1. If automation blocked re-activation and issue persists
- **Do not re-activate the existing ICM**
- **Create a new ICM** and:
  - Reference the original ICM link in the summary
  - Include relevant investigation history or context

### 2. If the issue is associated with a repair item (bug)
- **Do not re-activate the ICM**
- Follow up with the team responsible for the repair item
- If **no response within 48 hours**, escalate by emailing **mdcescal@microsoft.com**

### Additional Best Practices
- Do not allow DRIs to resolve/mitigate your ICM using a repair item unless a **specific target date** for the fix is documented
- If you are a vendor engineer and cannot view repair item status, request your **Partner Technical Advisor** to follow up on your behalf
