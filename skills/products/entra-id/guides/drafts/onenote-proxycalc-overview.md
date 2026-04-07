# ProxyCalc Overview — Attribute Flows on Server Side

> Source: OneNote — Mooncake POD Support Notebook / AAD Connect / Concept & Document / ProxyCalc
> Reference: https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/487780/ProxyCalc-Overview

## What is Azure AD Proxy Calculation?

ProxyCalc is service code executing in the cloud (Azure AD core service workflows) responsible for calculating 5 main properties of User/Group/Contact objects in Azure AD:

1. **MailNickName**
2. **UserPrincipalName**
3. **ProxyAddresses**
4. **SipProxyAddress**
5. **Mail**

## Code Paths

ProxyCalc has 3 different code paths depending on object type:

| Scenario | Complexity | Description |
|----------|-----------|-------------|
| Cloud-only objects | Simple | All attributes mastered in cloud; managed by respective workload (e.g., CloudMSExchRecipientDisplayType from EXO) |
| EXO mailbox migration | Specific | Special handling for Exchange Online migration |
| Synchronized users | Complex | Must consider both cloud properties and Shadow attributes |

## Shadow Attributes

For synchronized users, ProxyCalc considers **Shadow attributes** — attributes in Azure AD that store the original value synced from on-premises AD. These are an exact copy of the values exported by AADConnect client, and the actual attributes that the sync client reads from and writes to Azure AD.

Reference: [Shadow attributes documentation](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-syncservice-shadow-attributes)

## Related Known Issues

- `entra-id-onenote-307`: SMTP proxy address with unverified domain suffix not visible
- `entra-id-onenote-309`: SMTP proxy address synced to shadowProxyAddresses but not in final proxyAddresses
- `entra-id-onenote-310`: Mail attribute shows onmicrosoft.com value instead of on-prem value
