---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra Global Secure Access (ZTNA)/Global Secure Access Changes to M365 Signaling"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20Global%20Secure%20Access%20(ZTNA)%2FGlobal%20Secure%20Access%20Changes%20to%20M365%20Signaling"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Global Secure Access - Changes to M365 Signaling

## Summary

GSA session settings (Universal Tenant Restrictions and Adaptive Access) currently apply to both authentication plane (Entra ID) and data plane (Microsoft 365). Authentication plane settings are in GA while data plane settings have been moved from public preview back to private preview.

**Key points:**
- No impact to customer users as a result of this change.
- Existing configurations will continue to function.
- No customer action is required. Microsoft will automatically keep customer tenants in the private preview for Office 365 Session Management.
- Customers can opt out using the Entra Portal URL (available from June 2025).

## What Is Changing

Moving from public preview to private preview:
- **Universal Tenant Restrictions for Office 365**: Blocking anonymous access to SharePoint/OneDrive and preventing anonymous Teams meeting join; preventing the use of imported tokens obtained in another tenant.
- **Adaptive Access for Office 365**: Preventing replay of SharePoint access tokens outside of the GSA boundary.

## What Remains Generally Available

- **Universal Tenant Restrictions for Entra ID**: Using GSA client or Remote Networks to apply tenant restrictions v2 policies to any Entra ID integrated app at authentication; blocking/limiting access to Microsoft Account at authentication.
- **Adaptive Access for Entra ID**: Restoring original egress Source IP to Entra ID logs; applying Compliant Network policies to any Entra ID integrated app at authentication.

## Customer Conversation Guidance

**Important:** The Q&A below is recommended as reactive guidance for customers who reach out. Do not proactively communicate this information.

### Handling Customer Conversations

1. Understand the customer concern:
   a. Impact to existing configuration/usage?
   b. Future roadmap interest?
   c. Reasons for this change?
2. Answer based on this document's Q&A without expanding beyond the identified concern.
3. Let the customer know Microsoft will reach out when the new solution is available.
4. If customer is escalating and wants to talk to PG, reach out to GSAOfficePreview@microsoft.com.

### Customer Self-Opt-Out

Coming June 2025, customers can self opt-out via: `https://entra.microsoft.com/?exp.GSAOfficePreview=true#view/Microsoft_Azure_Network_Access/Security.ReactView`

### Customer Wants Tenant Restrictions Without Preview

Consider applying tenant restriction policies on Windows using Windows GPO (public preview): [Enable Tenant Restrictions on Windows Managed devices](https://learn.microsoft.com/en-us/entra/external-id/tenant-restrictions-v2#option-3-enable-tenant-restrictions-on-windows-managed-devices-preview)

### Why Continue Using Internet Access for Microsoft Services

Internet Access for Microsoft Services is part of Entra ID P1 and provides:
- Compliant Network controls in Entra ID Conditional Access
- Source IP restoration for faster threat response and fewer false positives in Identity Protection
- Universal Tenant Restrictions at authentication to ensure users only sign in to authorized tenants

## ICM Escalations

| Area | IcM Path |
|------|----------|
| Data Path | Global Secure Access / GSA Datapath |
| Control Plane | Global Secure Access / GSA Control Plane |

## Public Documentation

- [Global Secure Access and Universal Tenant Restrictions](https://learn.microsoft.com/en-us/entra/global-secure-access/how-to-universal-tenant-restrictions#try-universal-tenant-restrictions)
