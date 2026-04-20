# AVD AVD Web 客户端 - 杂项 - Quick Reference

**Entries**: 17 | **21V**: all applicable
**Keywords**: 0x80090016, aadsts1400002, aadsts50105, account-locked, authentication, azure-ad, break/fix, capi2, certificate, client-side, clock, connection-failure, connectivity, content idea request, contentidea-kb
**Last updated**: 2026-04-18


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | AVD Remote Desktop client Subscribe button connects to Global Azure AVD endpoint... | RD client Subscribe flow first checks registry DefaultFeedUrl, then performs hom... | Set registry DefaultFeedUrl to Mooncake: reg.exe ADD HKLM\SOFTWARE\Microsoft\MSR... | 🟢 8.5 | OneNote |
| 2 📋 | AVD Web Client: User cannot connect; 'TimeSkew' error — 'We couldn't connect to ... | Date/time difference (time skew) between user's device and the remote PC | Ensure the clock on the client device is set to the correct time (sync with time... | 🟢 8.0 | ADO Wiki |
| 3 📋 | AVD Web Client: User cannot connect; 'PasswordExpired' or 'PasswordMustChange' e... | User's account password has expired or must be changed before sign-in is allowed | User must change their password first, then retry connection | 🟢 8.0 | ADO Wiki |
| 4 📋 | AVD Web Client: 'SessionHostResourceNotAvailable' error — 'We couldn't connect b... | The session host VM failed to start during the connection attempt | Retry connection after waiting; if issue persists check session host VM health i... | 🟢 8.0 | ADO Wiki |
| 5 📋 | AVD Web Client: Session disconnected with 'IdleTimeout' error | Session timed out due to inactivity — idle timeout policy enforced by admin or n... | Reconnect; ask admin to review idle timeout policy settings if too aggressive | 🟢 8.0 | ADO Wiki |
| 6 📋 | AVD Web Client: 'NoLicenseAvailable' or 'NoLicenseServer' error — cannot connect... | No licenses available for the remote PC (or no license server available to provi... | Contact admin to check license availability and assignment; may need to procure ... | 🟢 8.0 | ADO Wiki |
| 7 📋 | AVD Web Client: 'AccountLockedOut' error — 'account has been locked due to too m... | User account locked out in Azure AD due to brute-force protection or too many fa... | Wait for lockout period to expire or have admin unlock the account; review sign-... | 🟢 8.0 | ADO Wiki |
| 8 📋 | Remote Desktop client cannot subscribe to 21v AVD. Sign-in fails with error: AAD... | Third-party security tool (Digital Guardian) performs SSL inspection/injection, ... | Disable SSL inspection in the third-party security tool (Digital Guardian or sim... | 🔵 7.0 | OneNote |
| 9 📋 | After subscribing in MSRDC or RDWEB client, users see: Unavailable - There are c... | No workspace created/assigned for application group, and/or it was not registere... | Create a workspace and register the application group to it. After registration,... | 🔵 6.5 | ContentIdea |
| 10 📋 | Users cannot connect using AVD client (freshly installed). Web client works fine... | Client machine missing required TLS cipher suites (TLS_ECDHE_RSA_WITH_AES_256_GC... | Add all required cipher suites supported by Azure Front Door on the client machi... | 🔵 6.5 | ContentIdea |
| 11 📋 | Upload feature in AVD Web Client is not working when browser language is set to ... | Race condition in Web Client JavaScript: folder name strings were not translated... | Change browser primary language to English or use Legacy version of Web Client a... | 🔵 6.5 | ContentIdea |
| 12 📋 | Users unable to connect intermittently with AVD Web Client. Error appears withou... | Forcepoint WebSense proxy alters HTTP headers: Connection header shows Keep-Aliv... | Follow up with Forcepoint (WebSense vendor) to exclude AVD gateway URLs from pro... | 🔵 6.5 | ContentIdea |
| 13 📋 | Remote application's icon not displaying as expected on AVD Web client.  The&nbs... | &nbsp;Incident-546858141 Details - IcM PG able to get a repro of the issue. It h... | PG was able to patch the issue on the AVD Web client prod ring R0 before impleme... | 🔵 6.5 | ContentIdea |
| 14 📋 | Users reported that while connected to an Azure Virtual Desktop (AVD) session, t... | This behavior was determined to be by design and is associated with clipboard re... | As an alternate solution, you can transfer the files between local device to rem... | 🔵 6.5 | ContentIdea |
| 15 📋 | WVD Classic: Users cannot subscribe to WVD feed in desktop client or login to we... | In WVD Classic, User assignment required was enabled on Windows Virtual Desktop ... | In Azure AD Enterprise applications, set User assignment required to No for both... | 🔵 6.5 | ContentIdea |
| 16 📋 | When accessing \\tsclient\Windows365 virtual drive\ in Cloud PC web client, netw... | Network discovery is not enabled on the Cloud PC by default when using web clien... | Click Turn on network discovery and file sharing in the yellow banner. Then acce... | 🔵 6.0 | ADO Wiki |
| 17 📋 | Cannot access WVD via Remote Desktop client or RDWeb. Error Code: 0x80090016 on ... | Error 0x80090016 related to corrupted system files, certificate/key issues on cl... | Try connecting from different client to isolate. Collect WVD logs. Check for cor... | 🟡 5.5 | OneNote |

## Quick Triage Path

1. Check: RD client Subscribe flow first checks registry DefaultFeedUr... `[Source: OneNote]`
2. Check: Date/time difference (time skew) between user's device and t... `[Source: ADO Wiki]`
3. Check: User's account password has expired or must be changed befor... `[Source: ADO Wiki]`
4. Check: The session host VM failed to start during the connection at... `[Source: ADO Wiki]`
5. Check: Session timed out due to inactivity — idle timeout policy en... `[Source: ADO Wiki]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/avd-web-client-misc.md#troubleshooting-flow)