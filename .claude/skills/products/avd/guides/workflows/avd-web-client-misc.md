# AVD Web 客户端 - 杂项 — Troubleshooting Workflow

**Scenario Count**: 17
**Generated**: 2026-04-18

---

## Scenario 1: AVD Remote Desktop client Subscribe button connects to Globa...
> Source: OneNote | Applicable: ✅

### Troubleshooting Steps
- Set registry DefaultFeedUrl to Mooncake: reg.exe ADD HKLM\SOFTWARE\Microsoft\MSRDC\Policies /v DefaultFeedUrl /t REG_SZ /d https://rdweb.wvd.azure.cn/api/arm/feeddiscovery. Deploy via Group Policy for domain-joined clients

**Root Cause**: RD client Subscribe flow first checks registry DefaultFeedUrl, then performs home cloud discovery via token request. For domain-joined PCs with hybrid identity, home cloud discovery returns Global Azure authority, causing client to subscribe to wrong endpoint

## Scenario 2: AVD Web Client: User cannot connect; 'TimeSkew' error — 'We ...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Ensure the clock on the client device is set to the correct time (sync with time server). Then retry the connection

**Root Cause**: Date/time difference (time skew) between user's device and the remote PC

## Scenario 3: AVD Web Client: User cannot connect; 'PasswordExpired' or 'P...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- User must change their password first, then retry connection

**Root Cause**: User's account password has expired or must be changed before sign-in is allowed

## Scenario 4: AVD Web Client: 'SessionHostResourceNotAvailable' error — 'W...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Retry connection after waiting; if issue persists check session host VM health in the portal and contact support

**Root Cause**: The session host VM failed to start during the connection attempt

## Scenario 5: AVD Web Client: Session disconnected with 'IdleTimeout' erro...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Reconnect; ask admin to review idle timeout policy settings if too aggressive

**Root Cause**: Session timed out due to inactivity — idle timeout policy enforced by admin or network policy

## Scenario 6: AVD Web Client: 'NoLicenseAvailable' or 'NoLicenseServer' er...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Contact admin to check license availability and assignment; may need to procure additional licenses

**Root Cause**: No licenses available for the remote PC (or no license server available to provide a license)

## Scenario 7: AVD Web Client: 'AccountLockedOut' error — 'account has been...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Wait for lockout period to expire or have admin unlock the account; review sign-in attempts for suspicious activity

**Root Cause**: User account locked out in Azure AD due to brute-force protection or too many failed attempts

## Scenario 8: Remote Desktop client cannot subscribe to 21v AVD. Sign-in f...
> Source: OneNote | Applicable: ✅

### Troubleshooting Steps
- Disable SSL inspection in the third-party security tool (Digital Guardian or similar) for AVD-related endpoints. Key diagnostic steps: 1. Collect ETL trace (cd $env:TEMP\DiagOutputDir\RdClientAutoTrace, tracerpt to csv). 2. Check CAPI2 event logs for certificate chain - if cert issuer is not Microsoft, SSL injection is occurring. 3. Compare certificate fingerprint with expected Microsoft certificate. 4. Whitelist AVD endpoints (rdweb.wvd.azure.cn, login.partner.microsoftonline.cn) from SSL inspection.

**Root Cause**: Third-party security tool (Digital Guardian) performs SSL inspection/injection, re-signing the WVD service certificates with its own CA. Remote Desktop client does not support SSL injection and rejects the modified certificate as invalid.

## Scenario 9: After subscribing in MSRDC or RDWEB client, users see: Unava...
> Source: ContentIdea | Applicable: ✅

### Troubleshooting Steps
- Create a workspace and register the application group to it. After registration, the resource will appear in WVD client.

**Root Cause**: No workspace created/assigned for application group, and/or it was not registered.

## Scenario 10: Users cannot connect using AVD client (freshly installed). W...
> Source: ContentIdea | Applicable: ✅

### Troubleshooting Steps
- Add all required cipher suites supported by Azure Front Door on the client machine.

**Root Cause**: Client machine missing required TLS cipher suites (TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384, etc). AVD gateway and RDWeb are behind AFD.

## Scenario 11: Upload feature in AVD Web Client is not working when browser...
> Source: ContentIdea | Applicable: ✅

### Troubleshooting Steps
- Change browser primary language to English or use Legacy version of Web Client as workaround. The issue has been fixed in a subsequent product update via setTranslations gallery function.

**Root Cause**: Race condition in Web Client JavaScript: folder name strings were not translated before virtual drive creation, causing mismatch between local and protocol-side folder names. Bug 48638042 fixed this.

## Scenario 12: Users unable to connect intermittently with AVD Web Client. ...
> Source: ContentIdea | Applicable: ✅

### Troubleshooting Steps
- Follow up with Forcepoint (WebSense vendor) to exclude AVD gateway URLs from proxy inspection. Ensure WebSocket upgrade headers are not modified by network proxies.

**Root Cause**: Forcepoint WebSense proxy alters HTTP headers: Connection header shows Keep-Alive instead of Upgrade and no Upgrade header for WebSocket. This prevents WebSocket connection to AVD gateway.

## Scenario 13: Remote application's icon not displaying as expected on AVD ...
> Source: ContentIdea | Applicable: ✅

### Troubleshooting Steps
- PG was able to patch the issue on the AVD Web client prod
ring R0 before implementing in the normal prod ring. Cx confirmed
the issue is resolved. &nbsp;Related IcM: Incident-546858141
Details - IcM

**Root Cause**: &nbsp;Incident-546858141
Details - IcM PG able to get a repro of the issue. It happens on a very
specific situation. &nbsp;From the RCA in the
IcM: Very specifically happening on feeds with small workspaces
and little resources within them. A few events were set to happen simultaneously during feed
discovery and depending on what was finished first, the UI was lacking a final
update, so a few icons and statuses were lacking an update. Issue detected on the web client and code changes made to
fix.

## Scenario 14: Users reported that while connected to an Azure Virtual Desk...
> Source: ContentIdea | Applicable: ✅

### Troubleshooting Steps
- As an
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

## Scenario 15: WVD Classic: Users cannot subscribe to WVD feed in desktop c...
> Source: ContentIdea | Applicable: ✅

### Troubleshooting Steps
- In Azure AD Enterprise applications, set User assignment required to No for both Windows Virtual Desktop AME and Windows Virtual Desktop Client (default setting). Adding all users with TenantCreator or Default Access role is not recommended.

**Root Cause**: In WVD Classic, User assignment required was enabled on Windows Virtual Desktop AME or Windows Virtual Desktop Client enterprise app in Azure AD, blocking users without explicit role assignment.

## Scenario 16: When accessing \\tsclient\Windows365 virtual drive\ in Cloud...
> Source: ADO Wiki | Applicable: ❓

### Troubleshooting Steps
- Click Turn on network discovery and file sharing in the yellow banner. Then access \\tsclient\Windows365 virtual drive\ to find Uploads and Downloads folders.

**Root Cause**: Network discovery is not enabled on the Cloud PC by default when using web client file transfer

## Scenario 17: Cannot access WVD via Remote Desktop client or RDWeb. Error ...
> Source: OneNote | Applicable: ✅

### Troubleshooting Steps
- Try connecting from different client to isolate. Collect WVD logs. Check for corrupted system files. Reset PIN/credential store.

**Root Cause**: Error 0x80090016 related to corrupted system files, certificate/key issues on client. Can occur with PIN login.
