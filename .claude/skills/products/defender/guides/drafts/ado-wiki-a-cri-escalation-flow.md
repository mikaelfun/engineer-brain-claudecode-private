---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/MDC Escalations and procedures/MDC CRI handling playbook for EG/MDC CRIs: Escalation flow"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/MDC%20Escalations%20and%20procedures/MDC%20CRI%20handling%20playbook%20for%20EG/MDC%20CRIs%3A%20Escalation%20flow"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

CRI flow 
==============================

**AI-assisted content.** This article was partially created with the help of AI. An author reviewed and revised the content as needed. [Learn more](https://learn.microsoft.com/en-us/principles-for-ai-generated-content).

Overview
--------

This article outlines the Critical Response Item (CRI) flow within Microsoft Defender for Cloud, detailing the step-by-step process followed by Customer Support Services (CSS) and engineering teams. It also includes guidance on how to handle scenarios requiring additional information and provides a flowchart for better visualization.

Benefits
--------

Adopting this CRI flow ensures:
*   A streamlined process for managing escalations from the Azure Support Center (ASC).
*   Efficient triaging and assignment of CRIs to the appropriate engineers.
*   Consistent communication and resolution timelines, reducing delays in addressing customer issues.
*   Clear escalation and resolution procedures for known issues or bugs.

Implementation steps
--------------------

1.  **CRI creation by CSS**
    *   CRIs are created by CSS using the escalation button in the Azure Support Center (ASC).
    *   CSS teams must adhere to the [MDC CRI Escalations procedure for CSS](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud/2697/MDC-CRI-Escalations-procedure-for-CSS).
    *   Upon escalation, ASC provides the CRI template based on the case's support topic.
2.  **Initial triage**
    *   The EEE (Engineering Escalation and Engagement) team triages CRIs and tags them with `MDC-Triaged`.
3.  **Assignment to engineers**
    *   The Operations Center (OC) monitors the team's ICM (Incident Management) queue and assigns the CRI to the appropriate engineer.
4.  **Periodic queue checks**
    *   The EEE team periodically reviews all queues for unacknowledged CRIs and processes them as needed.
5.  **Engineer acknowledgment and investigation**
    *   The assigned engineer acknowledges the CRI and begins the investigation, assuming the role of the Designated Responsible Individual (DRI).
6.  **Requesting additional information**
    *   If more details or customer contact are needed, the DRI should @mention the CSS creator within the ICM discussion to request the required information.
    *   To mention the CSS representative, type `@` in the ICM discussion, then enter their name. This action triggers an ICM email notification to the mentioned individual.
7.  **Handling delays in response**
    *   If CSS does not respond within 48 hours during working days, the **CRI can be Mitigated** with CRI Escalation Quality = Insufficient Collaboration:  
![image.png](/.attachments/image-74db3573-da93-4844-b262-664f7b940596.png)  
*Custom fields -> Owning service category: Azure*
8.  **Addressing known issues or new bugs**
    *   If the CRI corresponds to a known issue or a new bug, a Work Item (WI) should be linked to the CRI, after which it can be marked as **Mitigated**.
9.  **CRI triage discussions**
    *   CRI triage processes are not standardized and may vary. Each team's Rhythm of Business (RoB) can allocate time to discuss CRIs with the EEE team.

Resources
---------

### CRI flowchart

Below is a visual representation of the Defender for Cloud CRI handling procedure for engineering:
![Defender for Cloud CRI handling procedure for engineering.png](/.attachments/Defender%20for%20Cloud%20CRI%20handling%20procedure%20for%20engineering-eb3e1c35-0b2b-4ddd-a474-f0f3b31a274f.png =x1278)

### Related links

*   [MDC CRI Escalations procedure for CSS](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud/2697/MDC-CRI-Escalations-procedure-for-CSS)

Date
----

Last updated: October 2023

---

:::template /.templates/Wiki-Feedback.md 
:::

---

:::template /.templates/Ava-GetHelp.md 
:::
