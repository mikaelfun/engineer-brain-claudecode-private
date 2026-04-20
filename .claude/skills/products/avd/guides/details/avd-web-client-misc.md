# AVD AVD Web 客户端 - 杂项 - Comprehensive Troubleshooting Guide

**Entries**: 17 | **Generated**: 2026-04-18

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: ADO Wiki, ContentIdea, OneNote

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| AVD Remote Desktop client Subscribe button connects to Global Azure AV... | RD client Subscribe flow first checks registry DefaultFeedUrl, then pe... | Set registry DefaultFeedUrl to Mooncake: reg.exe ADD HKLM\SOFTWARE\Mic... |
| AVD Web Client: User cannot connect; 'TimeSkew' error — 'We couldn't c... | Date/time difference (time skew) between user's device and the remote ... | Ensure the clock on the client device is set to the correct time (sync... |
| AVD Web Client: User cannot connect; 'PasswordExpired' or 'PasswordMus... | User's account password has expired or must be changed before sign-in ... | User must change their password first, then retry connection |
| AVD Web Client: 'SessionHostResourceNotAvailable' error — 'We couldn't... | The session host VM failed to start during the connection attempt | Retry connection after waiting; if issue persists check session host V... |
| AVD Web Client: Session disconnected with 'IdleTimeout' error | Session timed out due to inactivity — idle timeout policy enforced by ... | Reconnect; ask admin to review idle timeout policy settings if too agg... |
| AVD Web Client: 'NoLicenseAvailable' or 'NoLicenseServer' error — cann... | No licenses available for the remote PC (or no license server availabl... | Contact admin to check license availability and assignment; may need t... |
| AVD Web Client: 'AccountLockedOut' error — 'account has been locked du... | User account locked out in Azure AD due to brute-force protection or t... | Wait for lockout period to expire or have admin unlock the account; re... |
| Remote Desktop client cannot subscribe to 21v AVD. Sign-in fails with ... | Third-party security tool (Digital Guardian) performs SSL inspection/i... | Disable SSL inspection in the third-party security tool (Digital Guard... |
| After subscribing in MSRDC or RDWEB client, users see: Unavailable - T... | No workspace created/assigned for application group, and/or it was not... | Create a workspace and register the application group to it. After reg... |
| Users cannot connect using AVD client (freshly installed). Web client ... | Client machine missing required TLS cipher suites (TLS_ECDHE_RSA_WITH_... | Add all required cipher suites supported by Azure Front Door on the cl... |
| Upload feature in AVD Web Client is not working when browser language ... | Race condition in Web Client JavaScript: folder name strings were not ... | Change browser primary language to English or use Legacy version of We... |
| Users unable to connect intermittently with AVD Web Client. Error appe... | Forcepoint WebSense proxy alters HTTP headers: Connection header shows... | Follow up with Forcepoint (WebSense vendor) to exclude AVD gateway URL... |
| Remote application's icon not displaying as expected on AVD Web client... | &nbsp;Incident-546858141 Details - IcM PG able to get a repro of the i... | PG was able to patch the issue on the AVD Web client prod ring R0 befo... |
| Users reported that while connected to an Azure Virtual Desktop (AVD) ... | This behavior was determined to be by design and is associated with cl... | As an alternate solution, you can transfer the files between local dev... |
| WVD Classic: Users cannot subscribe to WVD feed in desktop client or l... | In WVD Classic, User assignment required was enabled on Windows Virtua... | In Azure AD Enterprise applications, set User assignment required to N... |
| When accessing \\tsclient\Windows365 virtual drive\ in Cloud PC web cl... | Network discovery is not enabled on the Cloud PC by default when using... | Click Turn on network discovery and file sharing in the yellow banner.... |
| Cannot access WVD via Remote Desktop client or RDWeb. Error Code: 0x80... | Error 0x80090016 related to corrupted system files, certificate/key is... | Try connecting from different client to isolate. Collect WVD logs. Che... |

### Phase 2: Detailed Investigation

#### Entry 1: AVD Remote Desktop client Subscribe button connects to Globa...
> Source: OneNote | ID: avd-onenote-027 | Score: 8.5

**Symptom**: AVD Remote Desktop client Subscribe button connects to Global Azure AVD endpoint instead of Mooncake (21v) endpoint. Domain user on domain-joined PC subscribing with own account hits Global

**Root Cause**: RD client Subscribe flow first checks registry DefaultFeedUrl, then performs home cloud discovery via token request. For domain-joined PCs with hybrid identity, home cloud discovery returns Global Azure authority, causing client to subscribe to wrong endpoint

**Solution**: Set registry DefaultFeedUrl to Mooncake: reg.exe ADD HKLM\SOFTWARE\Microsoft\MSRDC\Policies /v DefaultFeedUrl /t REG_SZ /d https://rdweb.wvd.azure.cn/api/arm/feeddiscovery. Deploy via Group Policy for domain-joined clients

> 21V Mooncake: Applicable

#### Entry 2: AVD Web Client: User cannot connect; 'TimeSkew' error — 'We ...
> Source: ADO Wiki | ID: avd-ado-wiki-0780 | Score: 8.0

**Symptom**: AVD Web Client: User cannot connect; 'TimeSkew' error — 'We couldn't connect to the remote PC because there's a date or time difference between your device and the remote PC'

**Root Cause**: Date/time difference (time skew) between user's device and the remote PC

**Solution**: Ensure the clock on the client device is set to the correct time (sync with time server). Then retry the connection

> 21V Mooncake: Applicable

#### Entry 3: AVD Web Client: User cannot connect; 'PasswordExpired' or 'P...
> Source: ADO Wiki | ID: avd-ado-wiki-0781 | Score: 8.0

**Symptom**: AVD Web Client: User cannot connect; 'PasswordExpired' or 'PasswordMustChange' error

**Root Cause**: User's account password has expired or must be changed before sign-in is allowed

**Solution**: User must change their password first, then retry connection

> 21V Mooncake: Applicable

#### Entry 4: AVD Web Client: 'SessionHostResourceNotAvailable' error — 'W...
> Source: ADO Wiki | ID: avd-ado-wiki-0782 | Score: 8.0

**Symptom**: AVD Web Client: 'SessionHostResourceNotAvailable' error — 'We couldn't connect because your VM failed to start'

**Root Cause**: The session host VM failed to start during the connection attempt

**Solution**: Retry connection after waiting; if issue persists check session host VM health in the portal and contact support

> 21V Mooncake: Applicable

#### Entry 5: AVD Web Client: Session disconnected with 'IdleTimeout' erro...
> Source: ADO Wiki | ID: avd-ado-wiki-0783 | Score: 8.0

**Symptom**: AVD Web Client: Session disconnected with 'IdleTimeout' error

**Root Cause**: Session timed out due to inactivity — idle timeout policy enforced by admin or network policy

**Solution**: Reconnect; ask admin to review idle timeout policy settings if too aggressive

> 21V Mooncake: Applicable

#### Entry 6: AVD Web Client: 'NoLicenseAvailable' or 'NoLicenseServer' er...
> Source: ADO Wiki | ID: avd-ado-wiki-0784 | Score: 8.0

**Symptom**: AVD Web Client: 'NoLicenseAvailable' or 'NoLicenseServer' error — cannot connect to remote PC

**Root Cause**: No licenses available for the remote PC (or no license server available to provide a license)

**Solution**: Contact admin to check license availability and assignment; may need to procure additional licenses

> 21V Mooncake: Applicable

#### Entry 7: AVD Web Client: 'AccountLockedOut' error — 'account has been...
> Source: ADO Wiki | ID: avd-ado-wiki-0785 | Score: 8.0

**Symptom**: AVD Web Client: 'AccountLockedOut' error — 'account has been locked due to too many sign in or password change attempts'

**Root Cause**: User account locked out in Azure AD due to brute-force protection or too many failed attempts

**Solution**: Wait for lockout period to expire or have admin unlock the account; review sign-in attempts for suspicious activity

> 21V Mooncake: Applicable

#### Entry 8: Remote Desktop client cannot subscribe to 21v AVD. Sign-in f...
> Source: OneNote | ID: avd-onenote-086 | Score: 7.0

**Symptom**: Remote Desktop client cannot subscribe to 21v AVD. Sign-in fails with error: AADSTS1400002 Request nonce is malformed. ETL trace shows TLS/SSL error: The remote certificate is invalid according to the validation procedure when connecting to rdweb.wvd.azure.cn. CAPI2 event logs show WVD certificate re-signed by 3rd party issuer (Digital Guardian).

**Root Cause**: Third-party security tool (Digital Guardian) performs SSL inspection/injection, re-signing the WVD service certificates with its own CA. Remote Desktop client does not support SSL injection and rejects the modified certificate as invalid.

**Solution**: Disable SSL inspection in the third-party security tool (Digital Guardian or similar) for AVD-related endpoints. Key diagnostic steps: 1. Collect ETL trace (cd $env:TEMP\DiagOutputDir\RdClientAutoTrace, tracerpt to csv). 2. Check CAPI2 event logs for certificate chain - if cert issuer is not Microsoft, SSL injection is occurring. 3. Compare certificate fingerprint with expected Microsoft certificate. 4. Whitelist AVD endpoints (rdweb.wvd.azure.cn, login.partner.microsoftonline.cn) from SSL inspection.

> 21V Mooncake: Applicable

#### Entry 9: After subscribing in MSRDC or RDWEB client, users see: Unava...
> Source: ContentIdea | ID: avd-contentidea-kb-018 | Score: 6.5

**Symptom**: After subscribing in MSRDC or RDWEB client, users see: Unavailable - There are currently no resource assigned to you at rdweb.wvd.microsoft.com feed discovery endpoint.

**Root Cause**: No workspace created/assigned for application group, and/or it was not registered.

**Solution**: Create a workspace and register the application group to it. After registration, the resource will appear in WVD client.

> 21V Mooncake: Applicable

#### Entry 10: Users cannot connect using AVD client (freshly installed). W...
> Source: ContentIdea | ID: avd-contentidea-kb-042 | Score: 6.5

**Symptom**: Users cannot connect using AVD client (freshly installed). Web client works fine. Subscribe fails with error code 0x80004005. RDClient trace shows Authentication failed because the remote party has closed the transport stream.

**Root Cause**: Client machine missing required TLS cipher suites (TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384, etc). AVD gateway and RDWeb are behind AFD.

**Solution**: Add all required cipher suites supported by Azure Front Door on the client machine.

> 21V Mooncake: Applicable

#### Entry 11: Upload feature in AVD Web Client is not working when browser...
> Source: ContentIdea | ID: avd-contentidea-kb-077 | Score: 6.5

**Symptom**: Upload feature in AVD Web Client is not working when browser language is set to non-English. Upload prompt shows success but file never appears in Uploads folder.

**Root Cause**: Race condition in Web Client JavaScript: folder name strings were not translated before virtual drive creation, causing mismatch between local and protocol-side folder names. Bug 48638042 fixed this.

**Solution**: Change browser primary language to English or use Legacy version of Web Client as workaround. The issue has been fixed in a subsequent product update via setTranslations gallery function.

> 21V Mooncake: Applicable

#### Entry 12: Users unable to connect intermittently with AVD Web Client. ...
> Source: ContentIdea | ID: avd-contentidea-kb-078 | Score: 6.5

**Symptom**: Users unable to connect intermittently with AVD Web Client. Error appears without credential prompt. Kusto shows ConnectionInitiationSequenceTimeout. WebSocket closed with code 1006.

**Root Cause**: Forcepoint WebSense proxy alters HTTP headers: Connection header shows Keep-Alive instead of Upgrade and no Upgrade header for WebSocket. This prevents WebSocket connection to AVD gateway.

**Solution**: Follow up with Forcepoint (WebSense vendor) to exclude AVD gateway URLs from proxy inspection. Ensure WebSocket upgrade headers are not modified by network proxies.

> 21V Mooncake: Applicable

#### Entry 13: Remote application's icon not displaying as expected on AVD ...
> Source: ContentIdea | ID: avd-contentidea-kb-095 | Score: 6.5

**Symptom**: Remote application's icon not displaying as expected on AVD Web client.  The&nbsp;symptom&nbsp;described involves the remote application's icon not appearing automatically, requiring multiple retries for it to show up. Impact: When the end users see these symptoms, they raise issue that no remote app available for work.   Work around&nbsp;is to either do browser refresh (multiple times) or click twice on the Down arrow (highlighted) on each Workspace.  The issue persists across multiple browsers, including
Safari, Edge, Firefox, and Chrome, indicating it is not browser-specific. Issue not reproduceable in the Lab.  Environment: Browsers: Edge, Google Chrome, Mozilla Firefox, Safari. (all
latest) Apps Published using the File path as Application source. Web client version: 2.0.46.1  Log collection Log collected .har (networking logs)  As the Issue is happening when the Web client displays the
remote Apps. So, When I Start recording&gt;reproduce issue (refresh web
client), it triggers a reset for the recording and instead of Stop Recording,
shows Start recording again. &nbsp;  &nbsp; Working Scenario&nbsp;Web client Display. &nbsp;  &nbsp; Rest all the below screenshots are for&nbsp;Non working
scenarios&nbsp;for&nbsp;Web client for the same user on the same session,
various symptoms were reproduced on every refresh. &nbsp; Rest all the below screenshots are for&nbsp;Non working
scenarios&nbsp;for&nbsp;Web client for the same user on the same session,
various symptoms were reproduced on every refresh. &nbsp;    Tested with both Tile view and List view, issue present on
both the view.  &nbsp; Issue&nbsp;present with both Native Display resolution
Enabled and Disabled.

**Root Cause**: &nbsp;Incident-546858141
Details - IcM PG able to get a repro of the issue. It happens on a very
specific situation. &nbsp;From the RCA in the
IcM: Very specifically happening on feeds with small workspaces
and little resources within them. A few events were set to happen simultaneously during feed
discovery and depending on what was finished first, the UI was lacking a final
update, so a few icons and statuses were lacking an update. Issue detected on the web client and code changes made to
fix.

**Solution**: PG was able to patch the issue on the AVD Web client prod
ring R0 before implementing in the normal prod ring. Cx confirmed
the issue is resolved. &nbsp;Related IcM: Incident-546858141
Details - IcM

> 21V Mooncake: Applicable

#### Entry 14: Users reported that while connected to an Azure Virtual Desk...
> Source: ContentIdea | ID: avd-contentidea-kb-107 | Score: 6.5

**Symptom**: Users reported that while connected to an Azure Virtual Desktop (AVD)
session, they were able to copy and paste text content, but were unable to copy
and paste entire files or folders from their local device to the remote
session. This limitation affected file-based operations such as: 
 Drag-and-drop of files/folders from
     the local machine to the AVD session. 
 Using standard copy-paste shortcuts
     or context menu options for files.

**Root Cause**: This behavior was determined to be by design and is associated with
clipboard redirection restrictions within AVD environments. Key findings include: 
 Clipboard redirection applies to
     content within files (e.g., text or images) but not to the files
     themselves. 
 Attempts to copy an entire file
     (e.g., a .txt or image file) fail because the clipboard channel does not
     support file-level redirection. 
 This limitation is implemented
     intentionally to prevent security bypass attempts, such as renaming
     executable files to .txt to exploit redirection.

**Solution**: As an
alternate solution, you can transfer the files between local device to remote
session using RD webclient: Files can be successfully transferred between the local device and
remote AVD session using the Remote Desktop Web Client by following
these steps: 
 Sign in to the Remote
     Desktop Web Client and launch a remote session. 
 When prompted to access local resources,
     ensure that File transfer is enabled by checking the corresponding
     box and selecting Allow. 
 Once the session has started, open File
     Explorer and navigate to This PC. 
 Locate the Remote Desktop Virtual
     Drive on RDWebClient, which includes: 
 
  Uploads � for files
      uploaded from the local system. 
  Downloads � where
      files can be moved from the AVD session for download. 
 
 To download files from AVD to
     your local device, paste them into the Downloads folder. A
     prompt will appear asking for confirmation to download the files. Select Confirm
     to proceed. 
 To upload files, click the Upload
     new file (upward arrow icon) on the RD WebClient taskbar, and select
     the required files from the local system.  Notes: Ensure that &quot;Drive Redirection&quot; is not disabled, as it is
required for the Remote Desktop Virtual Drive to appear and function properly
within the session.

> 21V Mooncake: Applicable

#### Entry 15: WVD Classic: Users cannot subscribe to WVD feed in desktop c...
> Source: ContentIdea | ID: avd-contentidea-kb-024 | Score: 6.5

**Symptom**: WVD Classic: Users cannot subscribe to WVD feed in desktop client or login to web client. Error AADSTS50105: The signed in user is not assigned to a role for the application (Windows Virtual Desktop Client or Windows Virtual Desktop AME). Error code CAA20004.

**Root Cause**: In WVD Classic, User assignment required was enabled on Windows Virtual Desktop AME or Windows Virtual Desktop Client enterprise app in Azure AD, blocking users without explicit role assignment.

**Solution**: In Azure AD Enterprise applications, set User assignment required to No for both Windows Virtual Desktop AME and Windows Virtual Desktop Client (default setting). Adding all users with TenantCreator or Default Access role is not recommended.

> 21V Mooncake: Applicable

#### Entry 16: When accessing \\tsclient\Windows365 virtual drive\ in Cloud...
> Source: ADO Wiki | ID: avd-ado-wiki-a-r16-001 | Score: 6.0

**Symptom**: When accessing \\tsclient\Windows365 virtual drive\ in Cloud PC web client, network discovery error: Network discovery is turned off

**Root Cause**: Network discovery is not enabled on the Cloud PC by default when using web client file transfer

**Solution**: Click Turn on network discovery and file sharing in the yellow banner. Then access \\tsclient\Windows365 virtual drive\ to find Uploads and Downloads folders.

> 21V Mooncake: Not verified

#### Entry 17: Cannot access WVD via Remote Desktop client or RDWeb. Error ...
> Source: OneNote | ID: avd-onenote-035 | Score: 5.5

**Symptom**: Cannot access WVD via Remote Desktop client or RDWeb. Error Code: 0x80090016 on Windows 10 client.

**Root Cause**: Error 0x80090016 related to corrupted system files, certificate/key issues on client. Can occur with PIN login.

**Solution**: Try connecting from different client to isolate. Collect WVD logs. Check for corrupted system files. Reset PIN/credential store.

> 21V Mooncake: Applicable

### Phase 3: Kusto Diagnostics

> Refer to Kusto skill references for relevant queries.
