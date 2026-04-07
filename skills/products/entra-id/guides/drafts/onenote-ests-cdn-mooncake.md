# ESTS CDN Infrastructure (Mooncake)

## Overview
ESTS CDN delivers static resources (login page assets) for Azure AD authentication in China. Domain ownership is 21Vianet but managed by Microsoft.

## CDN Providers

| Domain | CDN Provider | Support Contact |
|---|---|---|
| aadcdn.msftauthimages.cn, aadcdn.msftauth.cn | EdgeNext | Website: www.edgenext.com, 24x7: support@edgenext.com, msft@edgenext.com; Tianyu Wu <tianyu.wu@edgenext.com> |
| aadcdn.msauthimages.cn, aadcdn.msauth.cn | 网宿 (CDNetworks) | Andy Nam <andy.nam@cdnetworks.com>; fallback: 网宿客服 400-881-1898 or cdnsupport@wangsu.com |

## Escalation Contacts

| Team | Role |
|---|---|
| O365_Auth@oe.21vianet.com | 21V O365 group, found EdgeNext support |
| domainsdns@microsoft.com | Responsible for MS-owned domain names |
| DMAAADSRE@microsoft.com | ESTS Domain Name; manages CNAME records |

## Reference Links
- [URLs and IP ranges for M365 operated by 21Vianet](https://learn.microsoft.com/en-us/microsoft-365/enterprise/urls-and-ip-address-ranges-21vianet?view=o365-worldwide)
- [Azure portal safelist URLs (China Cloud)](https://docs.azure.cn/en-us/azure-portal/azure-portal-safelist-urls?tabs=azure-china-cloud)

## IP Ranges
See source page for full IP ranges of both CDN providers (EdgeNext and CDNetworks).

## Source
OneNote: Mooncake POD Support Notebook > Troubleshooting Tools > General Tools > ESTS CDN
