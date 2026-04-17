---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure DNS/Azure (Public) DNS zones/Unblocking internal dangling domains"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20%28Public%29%20DNS%20zones%2FUnblocking%20internal%20dangling%20domains"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

Otherwise known as domain take-over, hanging DNS record, domain hijack, sniped domain, etc.

# About Hanging Domains
Hanging domains are orphaned CNAME records that point to de-provisioned resources. Internal and external Azure customers are potentially vulnerable to this configuration mistake and is publicly documented here:
https://docs.microsoft.com/en-us/azure/security/fundamentals/subdomain-takeover

# How to diagnose a sniped DNS name for internal customers
**Note:** the Azure security team only snipes (takes over) DNS names for internal Azure customers. If your case is for an external customer, the customer will have to choose a new DNS name.

If you do a `nslookup` for the domain the customer is attempting to use and get a response of 255.255.255.255 back, it is possible the domain is sniped. Example for test-name.westus2.cloudapp.azure.com:
```
> test-name.westus2.cloudapp.azure.com
Server:  one.one.one.one
Address:  1.1.1.1

Non-authoritative answer:
Name:    test-name.westus2.cloudapp.azure.com
Address:  255.255.255.255
```

If nslookup reports "Non-existent domain", this isn't a hanging domain issue. If nslookup returns another IP than 255.255.255.255 then the customer needs to choose another DNS name as it is in use.

## Check Escalation Path/Template

The Cloud and AI and Entertainment and Devices division each have their own teams to snip dangling domains. To determine which escalation template you should follow, run the following query in Kusto (be sure to replace SAMPLE-NAME.westus2.cloudapp.azure.com with the relevant hostname the customer is attempting to use):

[Kusto query](https://dataexplorer.azure.com/clusters/datastudiostreaming/databases/Shared?query=H4sIAAAAAAAAA6WU32%2FaMBDH3%2FdXWHkJSORHEyhlEpsqQB2a1oele5jWCTn2AS6J7dkOtNW0v31n1gKtNLUbT0nubH%2B%2F9%2FFdWNVYB6YVcuqodQ0XyjoDtBZyEa8wp%2BKNkFxtbCzBhe3YryuphVZYLKkBjqExhort1lkBZi0YXBmA2fl9Y6BoSsuM0E4oOSsk1Xap3JufZLMEA%2BRh%2BZQTIUkr7KeDFPIeiwb5AKJuL%2BtFg4zlUZ8O8rJfZgzKk7BDwrKXnpaDLkQZ7WVRt39GI5pmEPEz1uuXg173NE3DNqpoo26AOWIPXEz5sHjy2dm5wB03Cp2wRyjULDaNzaTRSkK8AQRksxewbMv%2BDFY1hsGFoXqJ6cdvS5R85mYHw4kaBWityTtCF6qV8%2FY%2Bd6eBDIckqAUzyqq587obZVaJbspKMKEp5wasBRvgrnodwa2mEsFqhKDBOAF2uH%2BNubQFOIfXbA9A7VB0DvfF8x9c7rwcZmY%2BQ4a%2FSMCUdGhsB4lVquFU65h6HjFTdUCSpNEICstZCq8Ktw7Q4rfwwqhGh9%2FJkIj5vLXvCl%2Fxay476JBgcoueBEgP2Rc%2BBn%2BI9amR97INnk%2BD9qHweTEiV1Dryru6pDUcaeKLLCvFVsTAjwZBkLky2NrYS5JW1R2xUmjghKuaYptF5O%2BehXhu4TXD8R8WDtmQwifNn1NWUm12C7DZyGQyCdpP6E1Hn8jEMor0sJURJK2PvkS2pHIB5PqafIR1Rc1RLEYKJ9fg3Y635dro4Tm%2BLLzCGKUqnICH6L6UfyLw2D9Hlr50Ttu3SYKGHa3i3aALVvvpSUStk3WeCMkEB%2BlswvA37eC9Q%2FXhaZbm9ydHsTpK%2F2v%2BYTrNXsLm6ArISfob4x9UInQGAAA%3D)

Based on the result of the above query, use ASC to escalate to the right team based on the ASC Template Name. Note: the CRI templates are provided in the query only if the support topic the customer opened the SR under does not have the proper mapping. Ping dgoddard with the SR number so that the mappings can be added there too. Always Use ASC to generate the ICM when possible.

Note: if you do not have permission to AzureResourceGraph, request access to the Kusto cluster by joining: https://coreidentity.microsoft.com/manage/Entitlement/entitlement/argnetworkin-tv1j

**IMPORTANT**: If you don't get any result in above Kusto table, it's because the Public IP DNS name has been taken over by another subscription (even external subscription). You can use this query to confirm which sub ID owns it now:

`cluster('argwus2nrpone.westus2.kusto.windows.net').database('AzureResourceGraph').Resources 
| where properties contains "SAMPLE-NAME.westeurope.cloudapp.azure.com"`

You can then use this query to confirm if it's internal subscription or external one:

https://portal-east.microsoftgeneva.com/7C2931AD 

If the Public IP domain has been taken over external customer, please follow the process explained in https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/342858/Dangling-Domains-Domain-Takeovers
