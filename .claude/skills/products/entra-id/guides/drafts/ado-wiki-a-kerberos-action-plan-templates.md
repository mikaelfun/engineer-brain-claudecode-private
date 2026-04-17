---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Kerberos/Azure AD Kerberos -  Action Plan Templates for Data Collection"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Kerberos%2FAzure%20AD%20Kerberos%20-%20%20Action%20Plan%20Templates%20for%20Data%20Collection"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure AD Kerberos - Action Plan Templates for Data Collection

## AzureADHybridAuthenticationManagement PS Module Trace

For cmdlets like `Set-AzureADKerberosServer`:

1. On the machine where the AzureADHybridAuthenticationManagement module was used, browse to `C:\ProgramData\AADConnect\` (hidden by default)
2. Open and view the most recent `trace-*.log` file
3. Upload the data to the DTM

## Collecting Auth Trace

See: [Collecting an Auth trace](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/776637/Collecting-an-Auth-trace)

## Contact

For feedback or assistance, contact the [PTA and Seamless SSO, Staged Rollout Teams channel](https://teams.microsoft.com/l/channel/19%3a33d2ca295e334b869b43ad3fc8c6eb04%40thread.skype/PTA%2520and%2520Seamless%2520SSO%252C%2520Staged%2520Rollout?groupId=0f0f4ddf-6429-4dfe-83d2-1a28cb88fadd&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47)
