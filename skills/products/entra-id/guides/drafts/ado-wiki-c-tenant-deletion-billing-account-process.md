---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD Tenant and Domain Management/Azure AD Directory Deletion/Tenant Deletion - Billing Account Deletion Process"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20Tenant%20and%20Domain%20Management%2FAzure%20AD%20Directory%20Deletion%2FTenant%20Deletion%20-%20Billing%20Account%20Deletion%20Process"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Tenant Deletion - Billing Account Deletion Process

> **IMPORTANT**: Follow this process ONLY after following "Tenant Deletion Instructions for Azure Identity SEs" and hitting the **"company account is present in modern"** CMAT blocker.
> This process should ONLY be used for completing a customer-authorized tenant deletion request. Any other billing account deletion request should go to Azure or M365 commerce teams.

## Prerequisite

Requires **SAW workstation** and **AME.GBL account** for CMAT/CST Validate+Delete and Subscription Management functionality (as of 2024-03).

---

## Support Engineer Steps

### Step 1: Pre-requisite Validations at https://cst.azure.com

Search by **Tenant ID** → validate each billing account via these tabs:

#### Billing Accounts (LE) tab
- Account Status = **active**, Account Type = **Organization Type C FL**
- If **Individual Type B CL (IW account type)**: cannot perform SE-side deletion → customer must:
  1. Create temp GA, delete original GA + all users (hard delete)
  2. Attempt tenant deletion again via portal
  3. If still blocked and only blocker is "present in modern" → proceed to Step 3 (skipmoderncheck tag)

#### Partner + Customer Relationships tab
- If CSP relationship exists → customer must contact reseller to delete all CSP subscriptions and break relationship before proceeding

#### Access Control (IAM) tab
- All end-users should be removed except one Account Owner (non-blocking but best practice)

#### Billing Profile tab
- Only **1:1 relationship** (billing account : billing profile) is allowed
- If multiple billing profiles: customer self-deletes extra ones; or engage MCAPI-Accounts via ICM

#### Invoice Sections tab
- Only **1 invoice section** allowed at time of deletion
- Customer must move all subscriptions into 1 section and delete the rest

#### Products + Subscriptions tab
- All non-rating assets must be in **Deleted** or **Abandoned** state
- Rating assets (Plans + Others) status can be ignored if other assets are deleted
- To cancel active assets: get customer authorization email → open asset → Manage Subscription → CustomerImmediateCancellation
- **Note (2025-02)**: Modern/NCE Office subscriptions have mandatory **90-day deprovision lifecycle** after cancellation

#### Quotes tab
- All quotes must be Completed or Expired

#### Invoices tab
- No unpaid invoices (customer must clear, or create collab task with ASMS)

#### Payment Methods + Credits tab
- If Azure Credits exist: customer confirms they can be lost → proceed; otherwise customer uses credits first

### Step 2: Customer Authorization
- Obtain written consent email from **Global Administrator/Account Owner** confirming tenant + billing account deletion
- Attach email to the Service Request before proceeding

### Step 3: CST Billing Account Deletion Workflow
1. In CST portal, Billing Accounts (LE) tab → click **Delete Billing Account**
2. Fill out Approver Details:
   - **Approver Business Group**: `CST_Azure_Identity_CSS`
   - **Final Approvers**: `CST_Azure_Identity_CSS_TA_Approvers`
   - Attach customer approval email as evidence
   - Add ICM/SR number in Comments
3. Click **Next** to submit
4. Notify TA/PTA manually with: Tenant ID, ICM #, SR #

---

## Technical Advisor Approval Steps

### Permissions Required
- `CST_ReadWrite_NoTransactionalData` role
- Member of `CST_Azure_Identity_CSS_TA_Approvers` group on CST portal

### Step 1: Review and Approve
1. Receive notification from SE with Tenant ID
2. CST portal → My Approvals → review request
3. Confirm customer approval email is attached
4. Perform same prerequisite validations as SE
5. Approve if all prerequisites met

### Step 2: Verify Deletion Status
1. CST portal → Auditing → Activities → Workflow Activities → find tracking ID
2. Check `ProcessRequestCompleted` Status Code:
   - **200**: Success
   - **500**: Retry once; if still 500, submit ICM to CST Portal team

### Step 3: Adding CMAT skipmoderncheck Tag
After successful billing account deletion:
1. CMAT → search Tenant ID → Account tab → TAGS section → Manage
2. Add tag:
   - **Namespace**: `commerce.microsoft.com`
   - **Tag Name**: `skipmoderncheck`
   - **Tag Value**: `true`
   - **Comments**: ICM/SR number
3. Run CMAT Validate+Delete again — "company account is present in modern" blocker should be gone

---

## Troubleshooting: Billing Account Deletion Error Codes

| Error | Cause | Resolution |
|---|---|---|
| One or more assets found | Non-rating assets not in Deleted state | Delete all non-rating assets; engage Assets team via ICM if needed |
| One or more billing groups found | More than 1 billing profile | Customer deletes extra billing profiles; engage MCAPI-Accounts via ICM if blocked |
| One or more non-rating assets found for CSP relationships | Non-deleted partner subscription assets | Remove partner + customer reseller assets; confirm partner relationship deleted |
| Organization found in recipient fulfillment identity | Partner (reseller) account tied to BA | ICM to Accounts team |
| Account does not have a PurchaseMotion of customer_commerce | Account belongs to a Partner/Reseller | Out of scope |
| One or more projects found | Multiple invoice sections | Customer deletes all but last invoice section; ICM to Assets team if persists |

---

## Escalation Paths

- **CSP relationship issues**: ICM → `Partner Center Customer Orchestration Service/DRI`
- **Assets not deletable**: ICM → Assets team
- **NCE Office subscription fast deprovision**: ICM → Recurrence team
- **Billing account API error 500**: ICM → CST Portal team
- **Owning Service (general)**: Azure Commercial Experiences, Signup and Provisioning / MCAPI Commerce Root Service
