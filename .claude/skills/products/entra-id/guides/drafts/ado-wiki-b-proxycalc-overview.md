---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Connect Sync/Object sync/ProxyCalc Overview"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FConnect%20Sync%2FObject%20sync%2FProxyCalc%20Overview"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Introduction to Azure AD Proxy Calculation

## What is Azure AD Proxy Calculation?

Azure AD Proxy Calculation or ProxyCalc is service code executing in the cloud (Azure AD core service workflows) responsible for calculating 5 main properties of User/Group/Contact objects in Azure AD:

- MailNickName
- UserPrincipalName
- ProxyAddresses
- SipProxyAddress
- Mail

For cloud-only users, calculations are simple (all attributes mastered in cloud). For synchronized users, ProxyCalc must consider both cloud properties and Shadow attributes (exact copies of values exported by AADConnect).

ProxyCalc has 3 different code paths:
- Cloud-only objects (mastered in cloud)
- EXO mailbox migration
- Synchronized users from on-premises AD (most complex)

## When does ProxyCalc run?

- User/group/contact created or updated
- Exchange Online license update
- Verified Domain change on tenant (triggers background task to re-run ProxyCalc for all objects)

## ProxyAddress Sanitization

ProxyCalc sanitizes (removes) ProxyAddresses with non-verified domain suffixes when ANY of these conditions apply:

1. User has non-deleted Exchange service plans (excluding MyAnalytics `33c4f319`, Bookings `199a5c09`, PremiumEncryption `617b097b`)
2. Object is an Exchange Shared Resource (CloudMsExchRecipientDisplayType = 0/2/7/8/10/15/16/17/18/1073741824/1073741840)
3. User has MSExchRemoteRecipientType set (not null)

### Troubleshooting ProxyAddress Sanitization

1. Create test on-prem AD user with Mail using non-verified domain suffix
2. Sync to Entra ID - user should keep Mail value
3. Apply one service plan, wait for license provisioning
4. Check if non-verified email gets sanitized
5. Repeat for other service plans to find offending plan

**Important**: Once sanitization occurs, it persists after removing the license. Force another sync from on-prem to restore the original non-verified proxy address.

### msExchRecipientDisplayType vs CloudMsExchRecipientDisplayType

- msExchRecipientDisplayType: on-premises Exchange display type
- CloudMsExchRecipientDisplayType: Exchange Online display type (set by EXO, back-synced to Entra ID)
- Check via: DSExplorer, EXO PowerShell, or ASC > User properties > Provisioning

Correlation examples:
- Mailbox on-prem: Cloud=-2147483642, OnPrem=1073741824
- Mailbox in EXO (no on-prem Exchange): Cloud=1073741824, OnPrem=N/A
- On-prem MailUser: Cloud=-2147482106, RecipientTypeDetails=128

## Client-side Attribute Flows

### UPN Transformation Rule
If on-prem AD object has no UPN, AADConnect crafts UPN = SamAccountName@userDomain

### MailNickname Transformation Rule
MailNickName in AD flows to Alias in AAD Connector Space, then mapped to MailNickname in Azure AD, then transformed to Alias in EXO.

## ProxyCalc Attribute Flow Charts

### MailNickname
1. ShadowMailNickname present -> use it (done)
2. Primary SMTP in ShadowProxyAddresses -> use SMTP prefix
3. UPN present -> use UPN prefix
4. Use on-prem CommonName (CN)

**Important**: Logic only occurs during initial provisioning. Once set, changing source properties does NOT update MailNickname. Must explicitly set MailNickname in on-prem AD.

### UserPrincipalName
1. ShadowUserPrincipalName suffix is verified domain -> use it
2. Suffix not verified -> replace with Initial Domain (.onmicrosoft.com)
3. No ShadowUPN -> try primary SMTP from ShadowProxyAddresses
4. No SMTP either -> generate from MailNickname + Initial Domain (add 4 random digits if duplicate)

### SipProxyAddress
1. SipProxyAddress in ShadowProxyAddresses -> use it
2. CloudSipProxyAddress present -> use it (set by SfBO workload)

### ProxyAddresses (most complex)
1. For each address in ShadowProxyAddresses:
   - If Exchange Licensed/Shared Resource: check SMTP suffix is verified domain (sanitize if not)
   - X500 addresses: add directly
2. Add additional addresses: MailNickName@InitialDomain, UPN, ShadowMail
3. Remove duplicates
4. Promote UPN as primary SMTP if no primary SMTP in ShadowProxyAddresses
5. Add legacyExchangeDN as X500

**Troubleshooting**: If on-prem ProxyAddress visible in ShadowProxyAddresses but not in final ProxyAddresses -> likely ProxyAddress conflict or invalid character.

### Mail
1. ShadowProxyAddresses has primary SMTP -> Mail = primary SMTP
2. ShadowProxyAddresses has at least one address but no primary SMTP -> Mail = MailNickname@InitialDomain
3. No ShadowProxyAddresses, ShadowMail present -> Mail = ShadowMail
4. Both null -> Mail not provisioned

**Note**: Once user gets Exchange license and ProxyCalc generates @InitialDomain ProxyAddress, this address cannot be removed even after license removal. It gets promoted to primary SMTP.

## Additional Resources

- [How the proxyAddresses attribute is populated in Azure AD](https://learn.microsoft.com/en-us/troubleshoot/azure/active-directory/proxyaddresses-attribute-populate)
- [Microsoft Entra Connect Sync service shadow attributes](https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/how-to-connect-syncservice-shadow-attributes)
