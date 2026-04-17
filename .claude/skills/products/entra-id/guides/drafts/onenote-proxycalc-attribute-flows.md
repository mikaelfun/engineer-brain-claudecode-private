# ProxyCalc — Attribute Flows on Server Side

> Source: OneNote — Mooncake POD Support Notebook / Sync / AAD Connect / Concept & Document / ProxyCalc
> Ref: https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/487780/ProxyCalc-Overview

## What is ProxyCalc?

Azure AD Proxy Calculation (ProxyCalc) is a set of workflows running under the Azure AD core service. These workflows calculate 5 main properties of User/Group/Contact objects:

1. **MailNickName**
2. **UserPrincipalName**
3. **ProxyAddresses**
4. **SipProxyAddress**
5. **Mail**

## Code Paths

ProxyCalc has 3 different code paths depending on object type:

| Scenario | Complexity | Description |
|----------|------------|-------------|
| **Cloud-only objects** | Simple | All attributes mastered in cloud. Properties managed by respective workloads (e.g., CloudMSExchRecipientDisplayType from EXO, CloudSipProxyAddress from SfB Online) |
| **EXO mailbox migration** | Medium | Specific code path for Exchange Online mailbox migration |
| **Synced from on-prem AD** | Complex | Must consider both cloud properties and Shadow attributes |

## Shadow Attributes

Shadow attributes are Azure AD attributes that store the original value synced from on-premises AD:
- Exact copy of values exported by AADConnect client
- The actual attributes that the sync client reads from and writes to Azure AD
- ProxyCalc considers both cloud properties and shadow attributes for synced users

Reference: [Shadow attributes documentation](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-syncservice-shadow-attributes)
