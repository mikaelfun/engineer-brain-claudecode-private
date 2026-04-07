---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Microsoft Entra portal (Microsoft_AAD_IAM)/Escalation to Management Admin UX team"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Account%20Management/Microsoft%20Entra%20portal%20(Microsoft_AAD_IAM)/Escalation%20to%20Management%20Admin%20UX%20team"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Escalation to Management Admin UX Team

When you have issues in Azure Portal or Entra portal, use this guide for escalation routing.

**Not all portal issues belong to this team.** Before escalating to **Entra - Management Admin UX / Triage**, read [Finding the Azure Portal Blade Owner](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/806115/Finding-the-Azure-Portal-Blade-Owner).

## Step 1: Isolate UX vs Backend API Issue

UX makes Graph API calls to backend services. Determine if the issue is in UX rendering or backend data:

1. Take a Fiddler trace or HAR file when navigating to the problematic page.
2. Find the Graph API call (e.g., `https://graph.microsoft.com/beta/groups/{id}/members?$select=...`).
3. Examine the response body:
   - **Graph returns unexpected data** → engage the backend service team (e.g., IAM services / Groups Graph API).
   - **Graph returns correct data but display is wrong** → transfer IcM to **Entra - Management Admin UX / Triage**.

## Step 2: Escalate with Required Information

If it is a UX issue, include in the IcM:

1. **Blade name** — ensure it is owned by Entra - Management Admin UX team.
2. **Fiddler trace or HAR file** containing the **session ID**.
3. **Screenshot or repro steps**.

## Common Misroutes

| Issue Type | Correct Team |
|---|---|
| Users blade issue | IAM services / User Management UX |
| Conditional Access UX | Conditional Access UX / Triage |
| User SigninActivity / lastSigninDateTime | IDX / Reporting and Audit Insights |
| Devices UX | ADRS / Portal |
| Authentication Methods blade | Credential Enforcement and Provisioning |
| MyAccount, MyStaff portal | IAM Services / AAD End User Experience |

**Anything not under `Microsoft_AAD_IAM` blade does not belong to this team.**
