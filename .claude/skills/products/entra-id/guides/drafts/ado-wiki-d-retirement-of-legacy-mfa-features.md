---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Authentication General/Retirement of Legacy MFA Features"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Authentication%20General%2FRetirement%20of%20Legacy%20MFA%20Features"
importDate: "2026-04-07"
type: troubleshooting-guide
---

## Update July 16, 2024: Retirement for Public Cloud

The retirements mentioned below are now being announced for the public cloud. An announcement will be sent to customers toward the end of July. The planned retirement date is March 1st, 2025. You can use the documentation below to help customers implement replacement functionality.

## Feature overview

As part of Microsoft's Secure Future Initiative, specific legacy multi-factor authentication (MFA) settings/features are being retired in Entra ID:

- [MFA Fraud Alert](https://learn.microsoft.com/entra/identity/authentication/howto-mfa-mfasettings#fraud-alert)
- [Block/unblock users](https://learn.microsoft.com/entra/identity/authentication/howto-mfa-mfasettings#block-and-unblock-users)

### Timeline
- **US Gov tenants (Fairfax/Arlington)**: Retired week of May 20, 2024
- **Public Cloud**: Planned retirement March 1, 2025

## Case handling

This feature is supported by the **Identity Security and Protection** community.

## Functionality replacement steps

### Enabling Report Suspicious Activity

**Note:** MFA Fraud Alert was only available to tenants with a premium (P1 or P2) license. If their licensing status changed (to free) after enabling MFA Fraud Alert they may need to repurchase licenses to enable Report Suspicious Activity.

To enable [Report Suspicious Activity](https://learn.microsoft.com/en-us/entra/identity/authentication/howto-mfa-mfasettings#report-suspicious-activity):
1. Navigate to [Authentication Methods Policy > Settings blade](https://entra.microsoft.com/#view/Microsoft_AAD_IAM/AuthenticationMethodsMenuBlade/~/AuthMethodsSettings/fromNav/) in the Entra Portal
2. Update the setting state to "Enabled"
3. Enable either all users or a subset via include/exclude targeting

Users who report an MFA prompt as suspicious are set to **High User Risk**.

### Remediating risk for P1 licensed tenants

3 places in Entra Portal to view/investigate suspicious activity events:

- **Risk detections report:** Protection > Identity Protection > Risk detection. Detection type "User Reported Suspicious Activity", risk level "High", Source "End user reported".
- **Sign-ins report:** Identity > Monitoring & health > Sign-in logs > Authentication Details. Result detail: "MFA denied, fraud code entered".
- **Audit logs:** Identity > Monitoring & health > Audit logs. Activity type "Fraud reported".

Query via MS Graph:
- [riskDetection](https://learn.microsoft.com/en-us/graph/api/resources/riskdetection?view=graph-rest-1.0) — riskEventType: "userReportedSuspiciousActivity"
- [List riskyUsers](https://learn.microsoft.com/en-us/graph/api/riskyuser-list?view=graph-rest-1.0&tabs=http) — riskLevel = "high"

Manual remediation: Ask users to reset password (via SSPR) or do so on their behalf.
Automated remediation: Use MS Graph APIs or PowerShell to change password / force SSPR / revoke sign-in sessions / disable user account.

More: [Remediate risks and unblock users](https://learn.microsoft.com/en-us/entra/id-protection/howto-identity-protection-remediate-unblock)

### Remediating risk for P2 licensed tenants

P2 tenants can leverage risk-based conditional access (RBCA) policies to automatically remediate user risk:
- Configure CA policy with Conditions > User risk (risk = high)
- Action: Block sign-in or require password reset

Documentation: [Identity Protection risk-based access policies](https://learn.microsoft.com/en-us/entra/id-protection/concept-identity-protection-policies#sign-in-risk-based-conditional-access-policy)

## ICM escalations

Support Topic: **Azure > Azure Active Directory Sign-In and Multi-Factor Authentication > Multi-Factor Authentication (MFA) > Authentication methods - Other**

ICM Path:
- **Owning Service**: ISP Credentials Management Service
- **Owning Team**: Credentials Management

## Related internal documentation

- [Azure AD Report Suspicious Activity (MFA Fraud Report)](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageid=889923)
- [Azure AD Conditional Access User Risk Condition and Password change Control](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageid=333878)
