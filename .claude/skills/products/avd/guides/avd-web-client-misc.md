# AVD AVD Web 客户端 - 杂项 - Quick Reference

**Entries**: 10 | **21V**: all applicable
**Keywords**: 0x80090016, aadsts1400002, aadsts50105, capi2, certificate, client-side, connection-failure, defaultfeedurl
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | AVD Remote Desktop client Subscribe button connects to Global Azure AVD endpoint... | RD client Subscribe flow first checks registry DefaultFeedUrl, then performs hom... | Set registry DefaultFeedUrl to Mooncake: reg.exe ADD HKLM\SOFTWARE\Microsoft\MSR... | 🟢 9.0 | OneNote |
| 2 📋 | Users cannot connect using AVD client (freshly installed). Web client works fine... | Client machine missing required TLS cipher suites (TLS_ECDHE_RSA_WITH_AES_256_GC... | Add all required cipher suites supported by Azure Front Door on the client machi... | 🔵 7.5 | KB |
| 3 📋 | After subscribing in MSRDC or RDWEB client, users see: Unavailable - There are c... | No workspace created/assigned for application group, and/or it was not registere... | Create a workspace and register the application group to it. After registration,... | 🔵 6.5 | KB |
| 4 📋 | Upload feature in AVD Web Client is not working when browser language is set to ... | Race condition in Web Client JavaScript: folder name strings were not translated... | Change browser primary language to English or use Legacy version of Web Client a... | 🔵 6.5 | KB |
| 5 📋 | Users unable to connect intermittently with AVD Web Client. Error appears withou... | Forcepoint WebSense proxy alters HTTP headers: Connection header shows Keep-Aliv... | Follow up with Forcepoint (WebSense vendor) to exclude AVD gateway URLs from pro... | 🔵 6.5 | KB |
| 6 📋 | Remote application's icon not displaying as expected on AVD Web client.  The&nbs... | &nbsp;Incident-546858141 Details - IcM PG able to get a repro of the issue. It h... | PG was able to patch the issue on the AVD Web client prod ring R0 before impleme... | 🔵 6.5 | KB |
| 7 📋 | Users reported that while connected to an Azure Virtual Desktop (AVD) session, t... | This behavior was determined to be by design and is associated with clipboard re... | As an alternate solution, you can transfer the files between local device to rem... | 🔵 6.5 | KB |
| 8 📋 | WVD Classic: Users cannot subscribe to WVD feed in desktop client or login to we... | In WVD Classic, User assignment required was enabled on Windows Virtual Desktop ... | In Azure AD Enterprise applications, set User assignment required to No for both... | 🔵 6.5 | KB |
| 9 📋 | Cannot access WVD via Remote Desktop client or RDWeb. Error Code: 0x80090016 on ... | Error 0x80090016 related to corrupted system files, certificate/key issues on cl... | Try connecting from different client to isolate. Collect WVD logs. Check for cor... | 🔵 6.5 | OneNote |
| 10 📋 | Remote Desktop client cannot subscribe to 21v AVD. Sign-in fails with error: AAD... | Third-party security tool (Digital Guardian) performs SSL inspection/injection, ... | Disable SSL inspection in the third-party security tool (Digital Guardian or sim... | 🔵 6.5 | OneNote |

## Quick Triage Path

1. Check: RD client Subscribe flow first checks registry Def `[Source: OneNote]`
2. Check: Client machine missing required TLS cipher suites `[Source: KB]`
3. Check: No workspace created/assigned for application grou `[Source: KB]`
4. Check: Race condition in Web Client JavaScript: folder na `[Source: KB]`
5. Check: Forcepoint WebSense proxy alters HTTP headers: Con `[Source: KB]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/avd-web-client-misc.md#troubleshooting-flow)
