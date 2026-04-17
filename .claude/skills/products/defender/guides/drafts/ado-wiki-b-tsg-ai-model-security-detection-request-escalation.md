---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Defender for AI/[TSG] - AI Model Security/[TSG] - Detection Request Intake & Escalation Process"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FDefender%20for%20AI%2F%5BTSG%5D%20-%20AI%20Model%20Security%2F%5BTSG%5D%20-%20Detection%20Request%20Intake%20%26%20Escalation%20Process"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# [TSG] AI Model Security — Detection Request Intake & Escalation Process

For all **detection-related requests** (False Positives / False Negatives).

---

## Step 1: Raise an IcM

- Create an IcM with appropriate severity based on SLA and business urgency.
- **IcM Queue:** Microsoft Defender for Cloud / Protectors Model Scan Team
- **Assign to:** snatarajan@microsoft.com

## Step 2: Initial Triage & Analysis

- Research team reviews the request.
- Analyzes detection/scanner behavior and determines required action (rule update, scanner fix, tuning, etc.).

## Step 3: Release & Follow-through

- If changes are required, fix is tracked through the **Sonar release pipeline**.
- Standard release process followed until completion.

---

## Required Information Template

### Mandatory Fields

- **OrgID / AAD Tenant ID**
- **Submission ID** (or unique identifier)
- **Report Time (UTC)**
- **Detected Model File Name**
- **Detection Name** (or MDC detection name equivalent)
- **Classification:** FP / FN
- **Customer Feedback**
- **Impact**

> Complete and accurate information significantly reduces back-and-forth and accelerates resolution.
