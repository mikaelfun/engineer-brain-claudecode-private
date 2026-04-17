---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Process Documentation/Global Processes/[DRAFT] Temporarily lowered critical cases procedure"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=%2FProcess%20Documentation%2FGlobal%20Processes%2F%5BDRAFT%5D%20Temporarily%20lowered%20critical%20cases%20procedure"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Temporarily Lowered Critical Cases Procedure

## Purpose

This document outlines the process for handling temporarily lowered critical cases when the customer becomes unresponsive or no longer meets critical case criteria and you expect they may reach out past the ending of your shift. Prioritize customer experience.

---

## When to Lower an Unresponsive Critical Case

A Sev A / Sev 1 can typically be lowered when:
* Something is pending on the customer (not Microsoft), **AND**:
  * Customer is no longer responsive within expected window (several follow ups over 120-180 minutes and TA guidance)
  * Customer is not available 24x7 (mandatory Sev A / Sev 1 requirement)
  * TA/Manager advises lowering following review

References:
- [Procedure: Unresponsive Customer](https://internal.evergreen.microsoft.com/en-us/topic/96fac429-4ec2-47d7-deff-7bf3e35ffffe)
- [Informational: CritSit Severity Definition](https://internal.evergreen.microsoft.com/en-us/topic/c2c0ffa1-2a0d-0a8d-3714-0c15e8bddcec)

## Before Lowering

1. Verify expected response window has passed, make multiple outreach attempts (Phone, Email and Teams)
2. Confirm with TA/Manager if unsure
3. Inform customer they can re-raise severity (use template below)
4. Inform and discuss with the account team, CritSit manager

## Required Case Notes

Include clear and concise case notes:
- **Scope**: Brief summary of the issue
- **Actions Taken**: Troubleshooting performed and PG interactions
- **Business Status**: Who is waiting on what (Customer / Engineer / PG)
- **Next Action**: What comes next and when

If samples/data are missing, document explicitly.

## Regional Points of Contact for Transfers

1. File a lowered severity handover only if appropriate (e.g. customer was unresponsive before HO)
   - **Do not just blindly assign the case back to the previous owner**
   - **There needs to be a clear rationale**

2. Notify the appropriate individuals:

**To:** `SCIMDM@microsoft.com`

**CC:** `Your Manager`; `your TA`; `leadership DL for the corresponding region`; `CSAM`; `IM`; `CritSit Manager`

| Region | DL |
|--------|----|
| APAC | MDOapacleads@microsoft.com |
| ATZ | MDOatzleads@microsoft.com |
| EMEA | MDOemealeads@microsoft.com |

## Email Templates

### 1. Notification to the Next Region

**Subject:** _[CaseNumber]_: Temporarily Lowered Sev A / Sev 1, [_reason for lowering_]

```
Hi team,

We have the case [CaseNumber], which we took on in [Region].

The customer has become unresponsive despite multiple contact attempts. Following Sev A / Sev 1 guidelines, we have temporarily lowered the case severity to Sev B.

The customer has been informed that they may request the case to be raised back to Sev A / Sev 1 at any time.

Case Summary:
- Scope: [brief description]
- Actions Taken: [what has been done]
- Current Status: Waiting on customer
- Next Action: [next steps]

Please let us know if you have any questions.

Thank you,
[Your Name]
```

### 2. Notify Your Customer

```
Hello [Customer Name],

I hope you're doing well. I wanted to check in and share an update on your support case [Case ID].

We've made several attempts to reach you over the past 90-120 minutes so we can continue working together in real time, however we haven't been able to connect just yet. Since Severity A cases require continuous 24x7 engagement and active troubleshooting, we'll be temporarily adjusting the case severity to Severity B at this point.

Please be assured that your case remains active, and we will continue to make progress under Severity B. Nothing is closing or being paused.

As soon as you're available again for real-time collaboration and able to support 24x7 engagement, you're absolutely welcome to request re-raising the case back to Severity A, and we will assist you right away.

I have proactively notified the next region's management that you may become available and wish to continue troubleshooting. They are aware of this case. As a reminder, you can always call [1-800-936-7358] to get help with a case.

Thank you for your continued partnership.

Warm regards,
```
