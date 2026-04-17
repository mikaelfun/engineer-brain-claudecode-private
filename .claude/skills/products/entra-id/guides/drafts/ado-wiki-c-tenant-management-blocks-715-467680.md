---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/M365 Identity/M365 Admin Portal/Handling Tenant Management Blocks 715-467680"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FM365%20Identity%2FM365%20Admin%20Portal%2FHandling%20Tenant%20Management%20Blocks%20715-467680"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Handling Tenant Management Blocks - Error 715-467680

## Overview

This article documents how to handle cases where customers receive 715-467680 errors when unable to add or edit tenant values. This is caused by the MAC/Azure integration with the **CFAR Real Time Detection Platform (RTFP)** to prevent bad actors from updating tenant information for phishing and fraud purposes.

**Error message:** "We are unable to complete your request at this time. Please contact us and reference message code: 715-467680 and event ID: {GUID} for further assistance."

## Critical Rules

- **IMPORTANT:** Do NOT provide any workarounds which will enable the customer to add or edit a tenant value!
- **IMPORTANT:** Never, under any circumstances, include the customer on any emails to CFAR FROG response. It is an internal-only team.

## First Customer Contact Procedure

1. Collect all required information:
   - Date & time error received (approximation is okay)
   - The event ID the customer saw in the message
   - Is customer the administrator for this organization?
   - Is customer sharing account credentials with other users? Yes/No
   - Microsoft account or tenant email or UPN
   - Values that customer is looking to change
   - Original values + Desired updated value
   - Entra/M365 Tenant ID and/or Object ID
   - Company name
   - Customer First & Last Name
   - Customer Country
   - If previously escalated, include previous ticket numbers

2. Create a task per normal procedures

3. Escalate to CFAR FROG:
   - **Option A:** DFM queue-to-queue transfer (CFAR Platform queue: **Ops PE OneVet MPN T3**)
   - **Option B:** Email to **sentesc@microsoft.com** with subject: "M365 - Message Code 715-467680"

## CFAR FROG Response Scenarios

### Scenario 1: Reversal of Status (Customer Unblocked)
Send to customer: "The issue that prevented you from completing your tenant updates has been resolved. Please try again."
Close as **Resolved**.

### Scenario 2: Customer Remains Blocked
Send the exact wording from CFAR FROG response to customer.
Close as **Resolved**.

### Scenario 3: Customer Still Blocked but May Self-Unblock
CFAR FROG may suggest VPN/browser settings changes. Forward exact wording to customer.
Close as **Resolved**.

## Re-Escalation Process

### 2nd Escalation - Error Reappears (Scenario 1)
- Ask customer to wait 24 hours and try again
- If persists, create new escalation referencing first ticket, add "repeat issue" in notes

### 2nd Escalation - Customer Rejects Answer (Scenario 2)
- Submit new escalation referencing first ticket as second escalation

### 2nd Escalation - Self-Help Failed (Scenario 3)
- Check: Using VPN/VM? Using privacy/obfuscation browser settings?
- Help customer try without VPN or with privacy settings off
- If still fails, submit new escalation

### 3rd Escalation - Customer Rejects Answer (Scenario 2)
- Provide final script: values do not meet Microsoft requirements, case will be closed
- Do NOT escalate further

### 3rd Escalation - Self-Help Not Working (Scenario 3)
- Offer **Verified Credentials (VC)** option (photographic evidence + ID matching)
- If customer accepts: re-escalation with "VC requested" in subject line
- If customer declines: treat as final escalation for Scenario 3

## SLA Reference

| Severity | Response | Resolution | Coverage |
|----------|----------|------------|----------|
| Sev 0/1 | 30 min | RTO | 24/7 |
| Sev 2/2.5 | 30 min | 4 hours | 24/7 |
| Sev 3 | 30 min | 72 biz hours | M-F + limited weekends |
| Sev 4 | 30 min | 72 biz hours | M-F + limited weekends |
| Re-escalation | 30 min | 5 biz days | M-F 0500-2100 PT |

## Important Guidelines
- CFAR FROG does not communicate directly with customers or close SRs
- **sentesc@microsoft.com** is internal only, never share with customers
- All communication to/from SentEsc must be in English
- If SLA missed or broad impact, email: **sasrequests@microsoft.com** (no formal SLA, retiring in 2026)
