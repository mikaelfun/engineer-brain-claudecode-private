# Sample SSO Working Trace - Outlook Client (Mooncake)

## Summary
Reference trace of a successful SSO flow for Outlook client on AADJ device in Mooncake (21V). Shows the complete WAM token broker flow using AAD Analytic event logs.

## SSO Flow Steps (Event ID 1099)

### 1. GetTokenSilently Initiated
- Code: `0x4AA5001A` - Token broker operation started
- Operation: `GetTokenSilently`

### 2. Token Request Parameters
- Code: `0x4AA50119`
- Client: `d3590ed6-52b3-4102-aeff-aad2292ab01c` (Outlook)
- Authority: `https://login.partner.microsoftonline.cn/common/oauth2/authorize`
- Resource: `https://partner.outlook.cn`
- discoverHome: true

### 3. Load Client from Cache
- Code: `0x4AA5011A` - Loading client from cache using webaccount
- Maps webAccountId to PerUser accountId

### 4. Primary User Context Loaded
- Code: `0x4AA50017`

### 5. Read RT from Cache
- Code: `0x4AA50010` - Reading from file success
- Location: `%LocalAppData%\Packages\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy\LocalState\...`

### 6. WAM Sends Token Request
- Code: `0x4AA90010` - Sending web request to `login.partner.microsoftonline.cn/common/oauth2/token`

### 7. Renew RT by PRT
- Code: `0x4AA90055` - Renew token by primary refresh token success

### 8. Renewed RT Written to Cache
- Code: `0x4AA50013` - Writing to file succeeded

### 9. Operation Succeeded
- Code: `0x4AA5001B` - Token broker operation succeeded

## Key Takeaways
- Successful SSO uses cached RT → renews via PRT → writes new RT to cache
- Event log: `Microsoft-Windows-AAD/Analytic` (must enable Analytic logs)
- Mooncake authority: `login.partner.microsoftonline.cn`
- Mooncake Outlook resource: `partner.outlook.cn`

## Source
- sourceRef: `Mooncake POD Support Notebook/.../Sample SSO working trace - outlook client.md`
