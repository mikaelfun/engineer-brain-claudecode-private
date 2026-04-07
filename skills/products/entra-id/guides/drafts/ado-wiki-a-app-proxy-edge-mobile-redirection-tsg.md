---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra application proxy/Troubleshooting guidance for Azure AD Application Proxy redirection in Edge mobile browser"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20application%20proxy%2FTroubleshooting%20guidance%20for%20Azure%20AD%20Application%20Proxy%20redirection%20in%20Edge%20mobile%20browser"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Troubleshooting Azure AD Application Proxy Redirection in Edge Mobile Browser

## Background

To offload "link translation" from Microsoft Entra Application Proxy, you can use the redirection feature in Edge mobile on Android/iOS devices.

All internal URLs published with Application Proxy will be recognized by Edge and redirected to the corresponding external URL. This ensures that all hard-coded internal URLs work, even if the user is not connected to the corporate network.

Reference: [Redirect hard-coded links for apps published with Microsoft Entra Application Proxy](https://docs.microsoft.com/azure/active-directory/manage-apps/application-proxy-configure-hard-coded-link-translation)

**Important:**
- This works **only for Edge mobile**. Other browsers and native mobile apps require different solutions (e.g., link translation in the response body).
- The App Proxy Product Group does not own mobile phone components. The redirection feature is implemented in the Edge mobile browser, configured via Intune.
- The redirection works for **all users** - it cannot be selectively enabled/disabled in App Proxy configuration.

## Troubleshooting Steps

### 1. Understand the Issue

Gather:
- Did this work before? If yes, since when?
- All users or specific users? Collect UPNs and mobile OS info for affected/unaffected users
- All App Proxy apps or specific ones? Collect Application IDs
- Which mobile OS? (iOS, Android)
- Edge version? Latest version? Did it work with an older version? (May indicate an Edge-side issue)
- Request screenshot: user signs into Edge mobile and tries accessing internal URL, then external URL
- Collect Fiddler trace or browser trace to verify the browser is attempting the internal URL instead of the external URL

### 2. Kusto Query

**Disclaimer:** The `applicationMapping` column content is **obfuscated since December 2021** for data privacy. Only PG can help with this.

Based on timeframe and user object ID:

```kql
UserQueriesAllApplicationsOperationEvent
| where env_time > datetime("YYYY-MM-DDThh:mm:ss") and env_time < datetime("YYYY-MM-DDThh:mm:ss")
    and subscriptionId contains "REPLACE_WITH_TENANT_ID"
    and userObjectId == "REPLACE_WITH_USEROBJECT_ID"
| project env_time, applicationMapping, assignedApplicationCount, applicationCount, dbApplicationCount
```

Key fields:
- `applicationMapping` - List of internal/external URL mappings. Verify affected app's URLs are included.
- `assignedApplicationCount` - Apps assigned to the user
- `applicationCount` - All apps in tenant
- `dbApplicationCount` - Total App Proxy apps in tenant

### 3. Collaboration

- **Intune Team** - Configuring/verifying app protection policies
- **Browser Team** - All Edge mobile browser issues
