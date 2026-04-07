---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Conditional Access Policy/Azure AD Conditional Access"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Conditional%20Access%20Policy%2FAzure%20AD%20Conditional%20Access"
importDate: "2026-04-05"
type: troubleshooting-guide
contentNote: "Original wiki page is 97K chars. Key sections preserved below."
---

# Azure AD Conditional Access TSG

## Summary

Azure AD Conditional Access allows IT administrators to specify Conditions that users must satisfy for policy to apply. Requires Azure AD Premium 1 and Modern Authentication only.

- V1 policies: Location Based and MFA via AUX portal (deprecated Nov 30, 2017)
- V2 policies: Azure Portal (Ibiza), greater flexibility, recommended

## Key Concepts

### MFA/Location Based Access Rules
- V1 relies on Azure MFA Trusted IP Ranges or InsideCorpNet Claim (federated)
- If first 3 octets of IP change, client is re-evaluated
- Device write-back must be enabled in AAD Connect for location-based device CA

### Named Location Access Rules (V2)
- Greater flexibility than Trusted IPs (limited to 50)
- Multiple Named Locations with 1-500 trusted IPv4 ranges each
- See Named Locations guide for details

### Device Based Access Rules
- Domain registration state (Hybrid Azure AD Joined) and/or Compliance state (Intune)
- InPrivate browsing prevents browser flows from passing device info → device CA fails
- DeviceTrustType values: 0=Workplace Joined, 1=Entra ID Joined, 2=Domain Joined
- Use `dsregcmd /status` or `Get-MgDevice` to check device state

### 3rd Party Browser SSO Support
- Chrome: Requires Windows 10 Accounts extension
- Firefox v91+: Native SSO via WAM APIs, enable under Privacy & Security → "Allow Windows single sign-on"
- Can be managed via Group Policy/Intune

### Device Platform ESTS Values
| Platform | Value |
|----------|-------|
| Android | 1 |
| iOS | 2 |
| Windows | 3 |
| MacOS | 5 |

### Resource Dependencies
- CA protects token issuance per audience
- MS Graph protects SPO/EXO → blocking SPO/EXO may block Teams/Streams
- If no resource specified (authz code only), only "All cloud apps" policies apply
- Public client id_token requests: CA not applied (no cloud resource access)

## Token Audiences and CA Evaluation
- CA evaluates per token audience, not per app
- "All cloud apps" with no exclusions → always applied regardless of resource

## MSODS Objects
- V1: PolicyType=1 (AuthPolicy), linked to single AppPrincipalID
- V2: PolicyType=18 (MultiConditionalAccessPolicy), multiple apps in JSON

## Troubleshooting Tools
- ASC: Conditional Access node, Sign-ins, Auth Diagnostics
- Kusto: PerRequestTableIfx, DiagnosticTracesIfx
- Key fields: MultiCAEvaluationLog, ConditionalAccessVerboseData, CaAdhoc (SLEv2)
- Sign-in log: "Conditional Access" column, "IP address (seen by Resource)" for CAE

## Case Handling
- Begin with Resource Provider (RP) or client application
- RP evaluates token and redirects to Azure AD for re-evaluation
- IDSP engaged if CAE was rejected but user logged in successfully

## Overview Dashboard (post April 2023)
- Policy Snapshot: Count by state (Enabled, Report-only, Off)
- Users: Users with no CA applied
- Devices: % sign-ins from unmanaged/non-compliant
- Applications: Top apps not protected by CA
- Security Alerts: 7-day sign-ins without CA or MFA
