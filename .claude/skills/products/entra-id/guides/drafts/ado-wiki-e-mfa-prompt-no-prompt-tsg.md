---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD MFA/Azure AD troubleshooting guide  Azure MFA prompt_no prompt behavior"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20MFA%2FAzure%20AD%20troubleshooting%20guide%20%20Azure%20MFA%20prompt_no%20prompt%20behavior"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure MFA Prompt / No Prompt Troubleshooting Guide

Decision tree for diagnosing why Azure MFA is or is not prompting as expected.

## Step 1: Scope Verification - Is it Azure MFA?

| Question | If Yes | If No |
|----------|--------|-------|
| Using Azure MFA? | Go to Step 2 | Check below |
| MFA Server (on-prem)? | Change topic to MFA > Deployment and Setup, use MFA Server TSG | Check next |
| NPS Extension? | Change topic to MFA > Deploying or Configuring NPS or Radius | Check next |
| ADFS Adapter? | Determine enforcement method (MFA Server / 3rd party / Azure MFA) | Check next |
| 3rd Party MFA (Duo/RSA)? | Change topic to Conditional Access > Configuring policy settings | - |

### ADFS Adapter Sub-decisions:
- **Pointing to on-prem MFA Server** -> Use MFA Server TSG
- **Using 3rd party MFA via ADFS** -> Change topic to ADFS > Claim rule configuration
- **Using Azure MFA via ADFS** -> Verify ADFS rules/policies for MFA, continue to Step 2

## Step 2: Identify Source of MFA Requirement

Always verify the customer's setup - trust but verify.

### Customer did NOT provide sign-in examples:
- Look for clues: UPN(s), user names, affected scope (all users or some), timeframe
- Search Sign-in logs in Azure Support Center (ASC) to find example sign-ins

### Customer provided sign-in examples:
- Review sign-ins in ASC diagnostics
- Check Authentication Details tab for MFA source
- Check Conditional Access tab for applied policies

## Step 3: Is MFA Requirement Already Met?

- Check if MFA claim already exists in the token
- If met and user expects MFA prompt -> explain why requirement was already satisfied
- Review MFA token lifetime if needed

## Step 4: MFA Verification Method Issue?

- If error indicates verification method failure -> change topic to the specific verification method failure
- Use MFA Auth Method TSG/wiki
- May need to check with customer about user-experienced behavior

## Step 5: Per-User MFA State

Check user state and registered methods:
- **Disabled** -> No MFA enforcement via per-user MFA
- **Enabled** -> MFA required only after user registers methods
- **Enforced** -> MFA required, user must complete proof-up
- Common misconfiguration: admins confuse Enabled vs Enforced states

## Step 6: Conditional Access Policy Analysis

- Identify which policy/policies required MFA
- Check if MFA was required because another condition was not met
- MFA is the last challenge tried - if other challenges required, those may have failed
- May need to troubleshoot CA policy or device registration issues

## Step 7: Request-Level Analysis

- Look at Azure Support Center for request and app details
- Check Logminer for MFA requirement location in the request

## Step 8: Risk-Based Policy

- Check user risk level and sign-in risk level
- If ErrorCode = ProofUpBlocked -> MFA required but CA risk-based policy or high sign-in risk blocked proof-up
- **Resolution**: Clear risk-based events and/or temporarily clear risk-based settings to allow registration, then user can perform MFA

## Step 9: Service Principal

- Typically caused by Device Registration requiring MFA
- Update support topic to Device Registration and use Device Registration TSG

## Step 10: Using Logminer for Troubleshooting

When ASC is insufficient, use Logminer to check:
- Source of MFA requirement
- MFA met status
- Authentication method details
- CA policy evaluation

## Step 11: MFA Proof-Up Issues

- Error codes typically reference that proof-up needs to be completed
- If blocked due to risk-based policies (Step 8) -> handle risk first
- Otherwise -> use MFA Registration/Proof-up TSG

## Step 12: Escalation

Ask question in Teams channel using aztabot for help from SMEs, TAs, and PG members.
