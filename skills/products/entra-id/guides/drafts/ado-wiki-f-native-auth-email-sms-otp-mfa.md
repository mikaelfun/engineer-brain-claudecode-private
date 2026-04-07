---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Microsoft Entra External ID (CIAM)/External ID Native Auth Email SMS OTP MFA and Conditional Access"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FMicrosoft%20Entra%20External%20ID%20(CIAM)%2FExternal%20ID%20Native%20Auth%20Email%20SMS%20OTP%20MFA%20and%20Conditional%20Access"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# External ID - Native Auth Email SMS OTP MFA and Conditional Access

## Overview

Email and SMS one-time passcode (OTP) as second-factor MFA for Native Authentication in Entra External ID. Enables step-up security in native sign-in and sign-up flows while keeping users fully inside their applications.

## Key Points

- MFA is **second factor only**, evaluated after first-factor authentication completes
- Enforced through **Microsoft Entra Conditional Access**
- ID and access tokens issued only after MFA succeeds (no client-side enforcement logic)

## Supported Authentication Stages

| Stage | Supported Methods |
|---|---|
| First factor | Email OTP; Email + password (with SSPR) |
| Second factor (GA) | Email OTP; SMS OTP |

## Use Cases

- High-risk sign-ins requiring higher assurance
- Sensitive user actions or regulated scenarios
- Maintaining native UX while enforcing server-side security policies

## ICM Escalation

Queue: CPIM/CIAM-CRI-Triage (via ASC, reviewed by TAs/PTAs first)
