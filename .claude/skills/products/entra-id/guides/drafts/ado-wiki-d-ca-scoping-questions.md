---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Conditional Access Policy/Azure AD Conditional Access Scoping Questions"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Authentication/Azure%20AD%20Conditional%20Access%20Policy/Azure%20AD%20Conditional%20Access%20Scoping%20Questions"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Azure AD CA Specific Scoping Questions

This set of scoping questions is specific to AAD Conditional Access. It is built off the General Scoping Template. The recommendation is to go through the Generic Scoping Template first and then move on to the CA specific scoping guide.

The intended use is to gather as much pertinent information as possible about the issue/customer ASK. Geared towards break/fix rather than Advisory.

## Who
- Who is this issue specific to:
  - User(s) (native tenant accounts)
  - Guest users
  - Service Principals
  - Other Identities (e.g. managed identities)?
- Are these users scoped individually, by group, or by role in the CA Policy(s)?
- Can you provide Correlation ID's and Timestamps for impacted users?
  - If not, can you provide UPN's and timestamps for when the issue occurred?
- Are 1st party applications impacted?
- Are 3rd party applications impacted?

## What
- What specific part of CA evaluation are you troubleshooting?
  - Named Locations
  - Terms of Use
  - Custom Controls
  - Continuous Access Evaluation
  - Device State
  - MFA
  - VPN
  - Risk scenarios
  - Security info registration
  - Device registration
  - Approved apps
  - App Protection
  - Sign-In Frequency
  - Limited Experience (for ExO and SpO)
  - Report Only mode
- What is the intent of the CA Policy(s)?
  - E.g. we want to block all users from ExO unless they are on a managed device
- What was the expected outcome of the CA Policy(s) for the provided correlation ID's?
- What authentication is being used:
  - Modern Authentication
  - EAS
  - Legacy Auth
- Are you troubleshooting CA Policy(s) related to Exchange Active Sync?
- Are you troubleshooting CA Policy(s) related to Legacy Authentication?
- Is the CA Policy(s) blocking all cloud apps?
  - If so are there any exclusions listed?
- What changes were made to the CA Policy(s) recently?
- Are Security Defaults enabled?
- What application types are impacted?
  - Web clients / Native clients / Legacy clients / TrueMAM / MAM Capable
- What browser is being used?
  - Edge - Is the logged on user signed into Edge?
  - Chrome - Is the chrome extension installed?

## When
- Are users constantly failing or failing intermittently?
- When did the issue first start to occur?
- Are only some of the expected CA Policy(s) applying to the request?
- If scoped by groups, was the user(s) validated to be in or out of the group?

## Where
- Is the issue geographically connected?
  - Unexpected country origin reported
  - Unexpected IP address reported
- Is this occurring for users on corpnet, external, both?
- Is this occurring on a registered device?
  - When executing "dsregcmd /status" as the user, does the machine have an AAD PRT?
- Are you being blocked from accessing a resource outside of your tenant?
