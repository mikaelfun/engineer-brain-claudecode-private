# AVD AVD Web 客户端 - 杂项 - Comprehensive Troubleshooting Guide

**Entries**: 10 | **Drafts fused**: 3 | **Kusto queries fused**: 0
**Source drafts**: ado-wiki-b-unified-web-client.md, ado-wiki-b-unified-web-portal.md, ado-wiki-web-portal-connection-flow.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: KB, OneNote

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| AVD Remote Desktop client Subscribe button connects to Globa... | RD client Subscribe flow first checks registry DefaultFeedUr... | Set registry DefaultFeedUrl to Mooncake: reg.exe ADD HKLM\SO... |
| Users cannot connect using AVD client (freshly installed). W... | Client machine missing required TLS cipher suites (TLS_ECDHE... | Add all required cipher suites supported by Azure Front Door... |
| After subscribing in MSRDC or RDWEB client, users see: Unava... | No workspace created/assigned for application group, and/or ... | Create a workspace and register the application group to it.... |
| Upload feature in AVD Web Client is not working when browser... | Race condition in Web Client JavaScript: folder name strings... | Change browser primary language to English or use Legacy ver... |
| Users unable to connect intermittently with AVD Web Client. ... | Forcepoint WebSense proxy alters HTTP headers: Connection he... | Follow up with Forcepoint (WebSense vendor) to exclude AVD g... |
| Remote application's icon not displaying as expected on AVD ... | &nbsp;Incident-546858141 Details - IcM PG able to get a repr... | PG was able to patch the issue on the AVD Web client prod ri... |
| Users reported that while connected to an Azure Virtual Desk... | This behavior was determined to be by design and is associat... | As an alternate solution, you can transfer the files between... |
| WVD Classic: Users cannot subscribe to WVD feed in desktop c... | In WVD Classic, User assignment required was enabled on Wind... | In Azure AD Enterprise applications, set User assignment req... |

### Phase 2: Detailed Investigation

#### Unified Web Client (Nighthawk/Mobius)
> Source: [ado-wiki-b-unified-web-client.md](guides/drafts/ado-wiki-b-unified-web-client.md)

> ⚠️ **Deprecated**: See the [Windows App (Unified Client) documentation](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/1240862/Windows-App-(Unified-Clie

#### Unified Web Portal
> Source: [ado-wiki-b-unified-web-portal.md](guides/drafts/ado-wiki-b-unified-web-portal.md)

> ⚠️ **Deprecated**: See the [Windows App (Unified Client) documentation](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/1240862/Windows-App-(Unified-Clie

#### ado-wiki-web-portal-connection-flow.md
> Source: [ado-wiki-web-portal-connection-flow.md](guides/drafts/ado-wiki-web-portal-connection-flow.md)

**Connection Flow when End User uses Web Portal/Web Client**

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | AVD Remote Desktop client Subscribe button connects to Global Azure AVD endpoint... | RD client Subscribe flow first checks registry DefaultFeedUrl, then performs hom... | Set registry DefaultFeedUrl to Mooncake: reg.exe ADD HKLM\SOFTWARE\Microsoft\MSR... | 🟢 9.0 | OneNote |
| 2 | Users cannot connect using AVD client (freshly installed). Web client works fine... | Client machine missing required TLS cipher suites (TLS_ECDHE_RSA_WITH_AES_256_GC... | Add all required cipher suites supported by Azure Front Door on the client machi... | 🔵 7.5 | KB |
| 3 | After subscribing in MSRDC or RDWEB client, users see: Unavailable - There are c... | No workspace created/assigned for application group, and/or it was not registere... | Create a workspace and register the application group to it. After registration,... | 🔵 6.5 | KB |
| 4 | Upload feature in AVD Web Client is not working when browser language is set to ... | Race condition in Web Client JavaScript: folder name strings were not translated... | Change browser primary language to English or use Legacy version of Web Client a... | 🔵 6.5 | KB |
| 5 | Users unable to connect intermittently with AVD Web Client. Error appears withou... | Forcepoint WebSense proxy alters HTTP headers: Connection header shows Keep-Aliv... | Follow up with Forcepoint (WebSense vendor) to exclude AVD gateway URLs from pro... | 🔵 6.5 | KB |
| 6 | Remote application's icon not displaying as expected on AVD Web client.  The&nbs... | &nbsp;Incident-546858141 Details - IcM PG able to get a repro of the issue. It h... | PG was able to patch the issue on the AVD Web client prod ring R0 before impleme... | 🔵 6.5 | KB |
| 7 | Users reported that while connected to an Azure Virtual Desktop (AVD) session, t... | This behavior was determined to be by design and is associated with clipboard re... | As an alternate solution, you can transfer the files between local device to rem... | 🔵 6.5 | KB |
| 8 | WVD Classic: Users cannot subscribe to WVD feed in desktop client or login to we... | In WVD Classic, User assignment required was enabled on Windows Virtual Desktop ... | In Azure AD Enterprise applications, set User assignment required to No for both... | 🔵 6.5 | KB |
| 9 | Cannot access WVD via Remote Desktop client or RDWeb. Error Code: 0x80090016 on ... | Error 0x80090016 related to corrupted system files, certificate/key issues on cl... | Try connecting from different client to isolate. Collect WVD logs. Check for cor... | 🔵 6.5 | OneNote |
| 10 | Remote Desktop client cannot subscribe to 21v AVD. Sign-in fails with error: AAD... | Third-party security tool (Digital Guardian) performs SSL inspection/injection, ... | Disable SSL inspection in the third-party security tool (Digital Guardian or sim... | 🔵 6.5 | OneNote |
