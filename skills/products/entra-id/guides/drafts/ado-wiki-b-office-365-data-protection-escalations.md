---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD Roles and Administrators/Office 365 Data Protection Escalations"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20Roles%20and%20Administrators%2FOffice%20365%20Data%20Protection%20Escalations"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Office 365 Data Protection Escalations

## Summary

Process for support cases where a customer has **lost Global Admin access** to a commercial Azure AD tenant, or needs to take ownership of a domain name verified on another tenant they don't have access to.

> **IMPORTANT**: This process is **only for Azure Commercial cloud**. For Azure Government (Fairfax/Arlington), use [TSG Password Reset Requests for Azure Government Tenants](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/467803/TSG-Password-Reset-Requests-for-Azure-Government-Tenants). The Data Protection team **cannot assist** with Azure Government tenants.

## Supported Processes
- **User to Admin Elevation**
- **Domain Removals and Verification**
- **Global Admin Password Reset / MFA Reset**

## Transferring Case to O365 Data Protection

**IMPORTANT**: Do NOT transfer Azure Government (Fairfax/Arlington) cases to Data Protection — follow the Government-specific process instead.

1. Update DFM case **Support Topic** to one of the following:

| SAP Path | SAP ID |
|--|--|
| Microsoft 365/Customer Protection/Admin Password Reset | 90afdb32-176e-5fda-532e-0e9f3ba3ca18 |
| Microsoft 365/Customer Protection/Domain Removal | d1040214-0a6c-ca7a-9319-e1a574557385 |
| Microsoft 365/Customer Protection/EXT | ad5e3e32-f373-ac9a-19e3-02c8f9c27680 |
| Microsoft 365/Customer Protection/Federation | 8b62c77c-0b5e-f29a-d60d-b97878f5cfa6 |
| Microsoft 365/Customer Protection/GD Removal | 25ab197c-dfbf-a164-0180-a74a15b5e2df |
| Microsoft 365/Customer Protection/IW Elevation | 24fb640e-0632-bb78-baae-283d536fbb2b |
| Microsoft 365/Customer Protection/MFA | ca94b327-14d1-07da-0813-71c4e3ad147b |
| Microsoft 365/Customer Protection/Tenant Lockout | 74e6d1e5-9e08-a92a-0de0-89186d38b9ee |
| Microsoft 365/Customer Protection/Viral | 0e62760f-46db-5cee-fc26-7f54d295d49b |

2. Choose **Transfer** case button
3. Verify queue is populated with **DataProtection**
4. Transfer entire DFM case to O365 Data Protection
5. For high priority/critical requests: review [Data Protection High Priority Escalations procedure](https://supportability.visualstudio.com/ModernStack/_wiki/wikis/ModernKB/333024/Engage-the-Data-Protection-Team?anchor=notify-the-dp-team-and-request-urgent-action)

## Engaging Data Protection for US Government Customers

Submit a VSO to Data Protection team:
- [How to request VSO access](https://supportability.visualstudio.com/ModernStack/_wiki/wikis/ModernKB/370608/VSO-Access-Requests-Walkthrough)
- [How to submit a VSO](https://supportability.visualstudio.com/ModernStack/_wiki/wikis/ModernKB/370606/VSO-Ticket-Submission-Instructions)
- Use the **Government Tenant Support** template (General section)
- If no VSO access yet, engage your Technical Advisor
