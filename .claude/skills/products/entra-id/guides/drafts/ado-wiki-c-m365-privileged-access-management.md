---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/M365 Identity/M365 Admin Portal/M365 - Privileged Access Management"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FM365%20Identity%2FM365%20Admin%20Portal%2FM365%20-%20Privileged%20Access%20Management"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# M365 Privileged Access Management (PAM)

**NOTE:** PAM in M365 is NOT the same as PAM in MIM (Microsoft Identity Manager). These are different products:
- MIM PAM: [Privileged Access Management for AD DS](https://learn.microsoft.com/en-us/microsoft-identity-manager/pam/privileged-identity-management-for-active-directory-domain-services)
- MIM PAM SAP coding: Security/Identity Manager 2016/Installation and Upgrade/Privileged Access Management (PAM)

## Feature Overview

Privileged Access Management (PAM) allows granular access control over privileged admin tasks in Office 365. It implements the **Zero Standing Privileged Access** principle:
- Users request just-in-time access through an approval workflow
- Access is highly scoped and time-bound
- No operational admin accounts have privileged access by default

## Support Boundaries

PAM in M365 Admin Center is supported by **M365 Identity Team**, but PAM requests/settings may be configured using Exchange Online PowerShell requiring collaboration with Exchange Online.

**Involve Exchange Online when:**
- Customer troubleshooting PAM configuration or requests for Exchange On-Premises
- Customer attempting Exchange Online PowerShell cmdlets that are failing

## Scoping

1. What are the exact repro steps?
2. Can you demonstrate via screen-sharing or provide screenshots/error messages?
3. How many users impacted? One/few/several?
4. Has this worked previously or is this initial setup?
5. Office 365 or on-premises environment?

## Data Collection

### PAM Request Issues (approval/denial not working)
- Collect PAM Request ID and Timestamp
- Path: M365 Admin Portal > Settings > Org Settings > Security & privacy > Privileged access > Create policies and manage requests > Select the PAM Request

### PAM Policy Creation Issues
- Capture HAR file and PSR while customer attempts to create the policy

## Troubleshooting

1. **Check PAM is enabled:**
```powershell
Get-OrganizationConfig | Select -ExpandProperty ElevatedAccessControl
```

2. **Check Access Policies exist:**
```powershell
Get-ElevatedAccessApprovalPolicy
```

3. **Verify requests/approvals** are done with Exchange Online MFA Module or Admin Portal

4. **Check Audit logs** for policy enablement, modifications, escalation requests and approvals

## Escalation

**Owning Service:** EOP
**Owning Team:** Role-Based Access Control
**ICM Template:** https://aka.ms/M365ID/PAM-ICM

Include in escalation:
- Data collected as attachments
- Analysis/conclusions from supporting files
- Troubleshooting steps taken
- Exact repro steps

## Public Documentation
- [PAM Overview](https://docs.microsoft.com/office365/securitycompliance/privileged-access-management-overview)
- [PAM Configuration](https://docs.microsoft.com/office365/securitycompliance/privileged-access-management-configuration)
