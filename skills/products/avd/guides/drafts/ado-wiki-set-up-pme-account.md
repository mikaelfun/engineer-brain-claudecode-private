---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Windows 365 Government/Setup Guide/Set up PME account"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FFeatures%2FWindows%20365%20Government%2FSetup%20Guide%2FSet%20up%20PME%20account"
importDate: "2026-04-05"
type: troubleshooting-guide
---

## Request PME Account

1. Access your SAW using your CORP credentials
2. Go to https://oneidentity.core.windows.net/User
3. Validate if the account exists or initiate a password reset if needed.

**NOTE**: If you still do not have access to the SAW yet, you can ask a manager or colleague that does have a SAW to create the account for you. You can also create support ticket with CloudMFA team to manage PME account (Create, Delete, Enable, Disable, Password Reset): https://cloudmfa-support.azurewebsites.net/IdentityAccess/UserAccount

## Load PME certificate in Security Key using OneYubi

Information: https://aka.ms/CSSIdentityIsolationDocs

When you receive notification that you are provisioned for PME, and have a security key (YubiKey), load your ME certificates onto your security key by following the steps at http://aka.ms/SecurityKeySetup, choosing "Azure USB Device (YubiKey)".

OneYubi steps: https://microsoft.sharepoint.com/teams/CDOCIDM/SitePages/SecurityKeySetupGuide.aspx
