---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Drafts/Collaboration Guidelines: MDO & EXO Teams (Americas Region)"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=%2FDrafts%2FCollaboration%20Guidelines%3A%20MDO%20%26%20EXO%20Teams%20%28Americas%20Region%29"
importDate: "2026-04-05"
type: troubleshooting-guide
---

[[_TOC_]]

## Overview

The **Messaging Protection (MDO)** and **Exchange Online (EXO)** teams have established a clear agreement for routing support cases and collaboration requests:

- **MDO**: Handles authentication and protection-related issues (e.g., why/how a malicious email bypassed defenses).
- **EXO**: Handles functionality-related issues (e.g., configuring connectors, Direct Send feature).

***Both teams work in partnership, treating collaboration requests with the same priority as primary tickets to ensure seamless customer support.***

---

## Roles and Responsibilities

### MDO (Microsoft Defender for Office 365) — Authentication & Protection

- Owns cases related to **email security, filtering, and authentication**.
- Answers questions like "Why was this suspicious email delivered?" or "How did this message bypass our MX record or DMARC?"
- Investigates filtering outcomes and addresses Defender for O365 (EOP/MDO) policy concerns.
- Handles security-centric inquiries end-to-end unless a solution requires EXO intervention (e.g., implementing a new connector).
- Initiates collaboration with EXO when configuration changes are needed but remains engaged throughout.

### EXO (Exchange Online) — Mail Flow & Functionality

- Owns cases related to **mail flow configuration and Exchange Online features**.
- Handles requests like "Help us stop Direct Send from happening" or setting up connectors/transport rules.
- Drives resolution for Exchange service behavior or configuration issues.
- Involves MDO for security-related sub-questions as needed.

**Summary:**

- **MDO**: "Why did my protections let this through?"
- **EXO**: "How do we change the mail system to fix this?"

Both teams coordinate closely on third-party mail flow bypass ("direct injection") scenarios.

---

## Collaboration Details

- **Collaboration is preferred over handoff** to minimize case reassignments.
- **MDO-to-EXO**: MDO retains ownership, requests EXO expertise for configuration changes, and manages the overall ticket.
- **EXO-to-MDO**: EXO retains ownership, requests MDO expertise for security aspects, and manages the overall ticket.
- **Escalation/Transfer**: Only used if a case is clearly misrouted and does not require joint effort. Even after transfer, both teams remain available for follow-up questions.

---

## Eligible Entitlements & Queue Information

- Sev 1/A, Sev B/C
  - OED / MCS (Formerly known as SED)
  - ARR
  - SfMC
  - Unified/Premier
  - S500 Unified/Premier

> **Important:** Please work with your Technical Advisor (TA) before opening a collab to EXO or MDO to ensure that it is necessary and can be assigned out appropriately.

### MDO to EXO Transfers

Eligible cases and collaborations can be transferred directly to **MW Exchange Online Enterprise Strategic UR**. To help keep track of the transfers please update the internal title to **#MDO to EXO Collaboration**.

### EXO to MDO Transfers

Eligible cases and collaborations can be transferred directly to **SCIM Messaging Protection Strategic UR**. To help keep track of the transfers please update the internal title to **#EXO to MDO Collaboration**.

*Note: this process is subject to change as EXO adopts Presence Based Assignment (PBA) and MDO adopts Skills Based Routing (SBA)*

---

## Communication Expectations

- **Open and Equal Communication**: Provide clear summaries, context, and specific requests when collaborating.
- **Responsiveness**: The assisting team treats collaboration requests as first-class work, responding with urgency and regular updates.
- **No "Bounce-Back" Without Discussion**: If a case is believed to be outside the assisting team's domain, discuss next steps rather than rejecting the collaboration. Both teams collectively own the customer's issue.
