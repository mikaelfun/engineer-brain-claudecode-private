# WAM SSO Working Trace Sample - Outlook Client (Mooncake)

## Overview
Reference trace showing a successful PRT-based silent token acquisition flow for Outlook client on an Azure AD joined device in Mooncake (21Vianet).

## Flow Summary
1. **GetTokenSilently** - Token broker operation starts (Event 1099, Code 0x4AA5001A)
2. **Token Request** - Outlook requests token for `https://partner.outlook.cn` via WAM
   - Client: `d3590ed6-52b3-4102-aeff-aad2292ab01c` (Microsoft Office)
   - Authority: `https://login.partner.microsoftonline.cn/common/oauth2/authorize`
3. **Load from Cache** - WAM loads client context from cache using webaccount
4. **Read RT** - Reads Refresh Token from local BrokerPlugin cache
   - Path: `%LocalAppData%\Packages\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy\LocalState\...`
5. **Send Token Request** - WAM sends request to `https://login.partner.microsoftonline.cn/common/oauth2/token`
6. **PRT Renewal** - Renews token via Primary Refresh Token (Code 0x4AA90055)
7. **Write to Cache** - Updated RT written back to local cache
8. **Success** - GetTokenSilently completes successfully (Code 0x4AA5001B)

## Key Event Codes
| Code | Meaning |
|---|---|
| 0x4AA5001A | Token broker operation started |
| 0x4AA50119 | Request parameters logged |
| 0x4AA5011A | Loading client from cache |
| 0x4AA50010 | File read success (RT cache) |
| 0x4AA90010 | Sending web request |
| 0x4AA90055 | PRT renewal success |
| 0x4AA50013 | File write success (cache update) |
| 0x4AA5001B | Operation succeeded |

## Mooncake-Specific Endpoints
- Authority: `login.partner.microsoftonline.cn`
- Resource: `partner.outlook.cn`
- BrokerPlugin redirect: `ms-appx-web://Microsoft.AAD.BrokerPlugin/<clientId>`

## Log Location
- Event Log: `Microsoft-Windows-AAD/Analytic`
- Task Category: `AadTokenBrokerPlugin Operation`

## Source
- OneNote: Mooncake POD Support Notebook > Troubleshooting Tools > Device Reg & Join > Auth Log > Sample SSO working trace - outlook client
