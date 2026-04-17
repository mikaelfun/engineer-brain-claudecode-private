# Change AAD Connect Connector / Service Accounts

> Source: OneNote — Change connector/service accounts

## ADSync Service Account

| Operation | Supported | Method |
|-----------|-----------|--------|
| Change password | Yes | [Change ADSync service account password](https://learn.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-sync-change-serviceacct-pass) |
| Change account | No | Requires reinstallation of AAD Connect |

## Azure AD Connector Account

| Operation | Supported | Method |
|-----------|-----------|--------|
| Change password | Yes | [Change Azure AD Connector account password](https://learn.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-azureadaccount) |
| Change account | Yes | Configure in AAD Connector properties UI |

## AD DS Connector Account

| Operation | Supported | Method |
|-----------|-----------|--------|
| Change password | Yes | [Change AD DS account password](https://learn.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-sync-change-addsacct-pass) |
| Change account | Yes | Configure in AD DS Connector properties + grant permissions per [Configure AD DS Connector Account Permissions](https://learn.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-configure-ad-ds-connector-account), or use AAD Connect troubleshooting tool option 4 |
