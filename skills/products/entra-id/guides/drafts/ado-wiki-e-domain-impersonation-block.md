---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/M365 Identity/M365 Admin Portal/Domains and DNS/Domain Impersonation Block"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FM365%20Identity%2FM365%20Admin%20Portal%2FDomains%20and%20DNS%2FDomain%20Impersonation%20Block"
importDate: "2026-04-07"
type: troubleshooting-guide
---

## Feature Overview

Domain impersonation blocking feature in M365 Admin Center (launched July 24, 2025). When a customer attempts to add a new domain, an impersonation check runs. If detected as potential impersonation/phishing, the addition is blocked.

**Error indicators:**
- Error code: **715-456280**
- Message: "Our systems are detecting a problem and we are unable to complete this action at this time."
- Alt message: "We are unable to complete your request at this time. Please contact us and reference message code: 715-456280 and event ID: {GUID}"

**IMPORTANT:** Do NOT provide any workarounds to enable domain addition/editing.

## Support Process

Supported by **M365 Identity** community.

### Step 1: Collect Required Information

- Date & time error received
- Is customer the administrator?
- Is customer sharing credentials with others? Y/N
- Event ID from error message
- Microsoft account or tenant email/UPN
- Entra/M365 Tenant ID
- Domains already associated with account
- Domain(s) customer is trying to add/edit
- Company name
- Customer Microsoft account ID or work account
- Customer First & Last Name
- Customer Country
- Has customer previously escalated? Y/N (include previous ticket numbers)

### Step 2: Create DfM Collaboration

- Assign to **Ops PE OneVet MPN T3** queue (manual queue override required - it is NOT a SAP)
- Internal Title: **M365 - Message Code 715-456280**
- SLA: **72 business hours** (limited US weekend support, no US holiday support)

### Step 3: Forward CFAR FROG Response

Forward exact wording from CFAR FROG to customer. **NEVER include customer on emails to CFAR FROG.**

## CFAR Platform Response Scenarios

### Scenario 1: Customer Unblocked
FROG message: "The issue that prevented you from completing your domain updates has been resolved. Please try again."
- Send to customer, close as **Resolved**

### Scenario 2: Customer Remains Blocked
FROG message: "Microsoft runs on trust... we are unable to allow you to complete this activity at this time."
- Send to customer, close as **Resolved**

### Scenario 3: Customer Can Self-Unblock
FROG message about VPN/browser settings preventing identity verification.
- Send to customer, close as **Resolved**

## Re-escalation Process

### Error Reappears After Unblock (Scenario 1 re-escalation)
1. Ask customer to wait 24 hours and retry
2. If persists, create new escalation referencing first ticket
3. Add 'repeat issue' in notes
4. Provide all template information again

### Customer Disputes Block Decision (Scenario 2/3 re-escalation)
- Escalation path available for disputed decisions
- Include all previous ticket numbers
