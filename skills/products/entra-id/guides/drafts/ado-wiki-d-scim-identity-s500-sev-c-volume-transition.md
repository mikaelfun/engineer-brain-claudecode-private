---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/DP Processes Guidelines and others/SCIM Identity - S500 Severity C Volume Transition to DPs"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDP%20Processes%20Guidelines%20and%20others%2FSCIM%20Identity%20-%20S500%20Severity%20C%20Volume%20Transition%20to%20DPs"
importDate: "2026-04-05"
type: troubleshooting-guide
---

[[_TOC_]]


Introduction
--------------------------------------------------------------------------------------------------------------------------------------------------

Starting Nov 3rd, a selected Delivery Partner will take full ownership of the **S500 Severity C** volume from all PCYs in SCIM Identity, which is currently managed by the internal team (FTE).

**SLA**: S500 Sev C SLA is **4 hours** for Enterprise and **8 hours** for BC, in the customer's time zone.

|**Applies to**|
|-----------------------------------------------------------------------------------------------|
|Global English sev C cases only for APAC, EMEA, and AMER (excludes **only** Japanese, Chinese, Korean languages)|
|Weekdays only (24x5)|
|Strategic (S500) BC and Enterprise sev C cases and collaborations|


|**Does not apply to**|
|-----------------------------------------------------------------------------------------------|
|USNAT, PubSec, ARR, MCSfMSC, GCC-High, GSA (auth) and cases with language Japanese, Chinese, Korean|
|Strategic (S500) SEV B and SEV A|
| MIM/FIM related cases |


## DP S500 Queue Names

**For Identity Management Strategic volume:**

SCIM Entra Identity Mgmt Sync MT S500

**For Authentication Strategic volume:**

SCIM Entra Identity Auth MT S500

**For M365 Strategic volume:**

SCIM M365 Identity WiCloud

## Involving PTAs

When raising AskPTA requests for S500 cases, ensure that the **Service Offering** is explicitly set to **S500**. PTAs will then acknowledge the request within **1 hour**.

Follow AskPTA posting guidelines - [Posting Guidelines AskPTA - Overview](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1681624/Posting-Guidelines-AskPTA)

PTAs will handle requests according to the following prioritization sequence:

| Priority | Case Type |
|----------|-----------|
| 1 | Enterprise Sev A |
| 2 | S500 Sev C |
| 3 | Enterprise Sev B |
| 4 | Enterprise Sev C |
| 5 | BC (Exceptions) |

List of all PTAs: [SCIM Identity All PTAs - Overview](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1972813/SCIM-Identity-All-PTAs)

## Severity changes to S500 cases (from Severity C to B / B24x7 / A / 1)

### Important Notes

* Severity escalations should be **preventive, not reactive**.
* Early engagement of **TA/SME/PTA** is expected when risk indicators appear.
* Incomplete documentation or late engagement may negatively impact customer experience.

To minimize customer impact and avoid unnecessary escalations, **Delivery Partners (DPs), SMEs, and TAs are expected to proactively monitor engineers backlogs** for **S500 Severity C cases**, and take early action when risks are identified.

Proactive monitoring is critical to:
* Detect stalled or at-risk cases early
* Prevent avoidable Severity escalations
* Maintain a consistent and high-quality customer experience
* Involve further resources as soon as needed (PTAs, SDMs, Managers, CSAMs)

**If Severity change is required:**

The following steps **must** be completed before any transfer:

* **Case Documentation**
  * Case owner must ensure the case is fully updated with clear, current notes documenting:
    * Issue summary
    * Business impact
    * Troubleshooting performed
    * Reason for Severity change
* **TA / SME Engagement**
  * Case owner must engage their **TA/SME** to review the case and add a concise **technical summary** validating the Severity escalation.
* **AskPTA Engagement**
  * Delivery Partner must **promptly open an AskPTA request** to engage PTAs.
  * When opening the AskPTA request, **always** select Request Type: **S500 Severity Change**, Urgency: **High**, Service Offering: **S500**
  * This ensures timely review and enables transition to the **Internal FTE team** following the defined handover process.
* **PTA Review and Approval**
  * PTAs review the request, validate readiness for escalation, and **approve the transfer** to the Internal FTE team.
* **DP Responsibility for Case Transfer**
  * Once the PTA approves the AskPTA request, the **DP engineer remains responsible for executing the case transfer**.
  * Autorouting is expected to select the appropriate Internal FTE queue when the Severity is increased to **Sev B, Sev B 24x7, or Sev A / 1**.
* **SDM Communication**
  * Case owners **Manager** must send an email to the **SDM distribution list**, communicating:
    * Incoming case transfer
    * Reason for Severity change
    * Current status and next-step expectations
    * Request for next owner assignment

Entra ID Handover Process: [Delivery Partners handover process](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/2133102/Delivery-Partners-hando)

M365 Handover Process: [M365 IDO Crits Handover Process for Premier Cases](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/2188478/M365-IDO-Crits-Handover-Process-for-Premier-Cases) | [M365 IDO Guidance on CritSit Handling](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/2189205/M365-IDO-Guidance-on-CritSit-Handling)

## Escalate Now SDM POCs

| SDM POC per PCY/region | APAC | EMEA | Americas |
|------------------------|------|------|----------|
| Auth | Venkat Duggineni, Prabodh BP | Razan Alshare | Anupam Shukla, Pragya Khanna, Nancy Zamora |
| IDM | Venkat Duggineni, Prabodh BP | Pedro Covaneiro | Anupam Shukla, Nancy Zamora |
| M365 | Kavitha Bhagavan, Prabodh BP | Razan Alshare, Pedro Covaneiro | Anupam Shukla, Nancy Zamora |

## Processes to be aware of

- Handling Sev C cases: [Severity B or C - Overview](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1670222/Severity-B-or-C)
- How to handle unresponsive customers: [Procedure: Unresponsive Customer](https://internal.evergreen.microsoft.com/en-us/topic/96fac429-4ec2-47d7-deff-7bf3e35ffffe)
- Case Closure Process: [Procedure: Case Closure](https://internal.evergreen.microsoft.com/en-us/topic/e44eb87d-c12d-4705-5d56-1efec22cffea) and [Procedure: Case Closure Last Quality Response (LQR)](https://internal.evergreen.microsoft.com/en-us/topic/91cd643b-038a-ebec-a066-0167a588f737)
- Case Transfer Reason: [Procedure: Transfer of Case Ownership](https://internal.evergreen.microsoft.com/en-us/topic/ff17fb66-0beb-2953-04d4-3db6bc6f49e2#bkmk_check_transfer_reason) & [Business Rule: Transfer Ownership](https://internal.evergreen.microsoft.com/en-us/topic/33e78c57-d24f-1364-936a-e970bd2925ab)
- DDX: [Informational: Delivery Design and Execution (DDX) Overview](https://internal.evergreen.microsoft.com/en-us/topic/6efd7476-2ad3-6080-2688-83e2b8be3ce4)

In case of any questions, please reach out to PTAs.

## FAQs

**What happens when an S500 Sev C case severity is raised?**
- Severity raised from Sev C to **B** goes to the Internal FTE team.
- Severity raised from Sev C to **B 24/7** goes to the Internal FTE team.
- Severity raised from C/B to **A** goes to the Internal FTE team.

**What happens when an S500 Sev A | B | B24x7 case severity is reduced?**
Internal team is expected to keep the case unless the cx requests support in a different timezone.

**What happens to a Sev C case raised as a part of planned activity over the weekend?**
Since Sev C will not be handled over the weekend, ask the customer to raise a Sev A or Sev B 24/7 case over the weekend. Case to be transferred to Internal FTE Team.
