---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Drafts/DRAFT - SEV B 24x7 Engagement & Escalation Guidelines"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=/Drafts/DRAFT%20-%20SEV%20B%2024x7%20Engagement%20%26%20Escalation%20Guidelines"
importDate: "2026-04-05"
type: troubleshooting-guide
---

[[_TOC_]]
* * *
**SEV B 24x7 Engagement & Escalation Guidelines**
================================================

* * *

## Overview

**Unified CX** can open any severity case, including SEV B 24x7.  
_Note: 24x7 is a CSS designation only._

* * *

## A. Escalation Criteria

SEV B may require escalation, but not always. Base escalation decisions on **business impact**:

### A.1 Important Impact (Not an Outage)

- Inform the customer:  
  _Case will be prioritized during business hours. Next update after Monday triage._
- If acceptable, file **SEV 3 IcM**.

### A.2 Business Outage

- Inform the customer:  
  _Current severity does not allow weekend engineering engagement._
- Confirm with CX/CSAM if severity should be raised.
- **If escalation is justified, it must be raised to SEV A with documented Business Impact (BI).**
- **Only the Account Team or the Customer can raise the severity and control the BI.**
- The Support Engineer (SE) must:
  - Reach out to the **TA**, **Account Team**, and **Customer** to set correct expectations.
  - Validate that the business impact truly warrants SEV A before advising.

* * *

## B. Do NOT Routinely Advise Raising Severity

- Only recommend raising severity if the impact is severe enough to require:
  - **CFL**
  - **Engineering engagement**
- If possible, discuss with the customer keeping the case as **SEV B / SEV 3** for proper business-hours investigation.

* * *

## C. Manage Expectations Throughout the Case Lifecycle

- Never overpromise weekend engineering engagement if escalation raised is a sev 3 IcM. Engineering will only work severity 3 escalations on normal working hours.
- **On Sev B 24x7 cases ALWAYS follow the handover rules [Global 24x5 & 24x7 Handover Process](https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki/7145/Global-24x5-24x7-Handover-Process)**
