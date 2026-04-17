# AVD Web 客户端 - 杂项 — 排查工作流

**来源草稿**: ado-wiki-b-unified-web-client.md, ado-wiki-b-unified-web-portal.md, ado-wiki-web-portal-connection-flow.md
**Kusto 引用**: (无)
**场景数**: 10
**生成日期**: 2026-04-07

---

## Scenario 1: Overview
> 来源: ado-wiki-b-unified-web-client.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Nighthawk (W365 web client) extended to support all AVD resources (VMs and remote applications) via unified web experience.

## Scenario 2: Key Technical Notes
> 来源: ado-wiki-b-unified-web-client.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - **Feed discovery and connection** happen at different URLs and on different web apps
   - Users can bookmark connection URL to skip feed discovery in future
   - **Nighthawk** = application running in user's browser that loads RD Core Web
   - **RD Core Web** = component managing session and connection
   - **Mobius client** = allows users to connect directly to a resource without going through feed discovery
   - User Agent: `CPC.Web`
   - **Broadcast Channel**: communication between Mobius portal and client for launching remote apps in correct browser tab
   - Telemetry: ARIA (from Nighthawk itself, scrubbed of EUPI); RD Core emits telemetry uniformly to Event Hub
   - **ECS** = flighting system for feature exposure control
   - **ADFS SSO**: not supported during public preview (falls back to password); **Azure AD SSO**: supported for public preview

## Scenario 3: Connection Flow
> 来源: ado-wiki-b-unified-web-client.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Request token from Azure AD by calling RD Web API
2. Receive token from Azure AD
3. Get RDP file URL from RDWeb using direct launch URL
4. Construct direct launch URL using tenant ID and resource ID from URL → send to RDWeb
5. Get back the URL for the RDP file
6. Get RDP file contents
7. Hand off to RD Core Web → start orchestration
**For RemoteApps**: portal maintains a Broadcast Channel with web client. Opening additional apps communicated over broadcast channel. Client verifies same host → opens new app; different host → opens new client tab.

## Scenario 4: Error Codes Reference
> 来源: ado-wiki-b-unified-web-client.md | 适用: \u901a\u7528 \u2705

### 排查步骤
| Error Code | Symptom / User Message | Root Cause / Notes |
|-----------|----------------------|-------------------|
| AccountDisabled | Can't connect — account disabled | User account disabled in directory |
| AccountExpired | Can't connect — account expired | User account expired |
| AccountLockedOut | Can't connect — account locked | Too many sign-in or password change attempts |
| AccountRestricted | Can't connect — account restricted | User account restriction preventing sign-in |
| AutoReconnectFailed | Couldn't auto-reconnect | Auto-reconnect mechanism failed |
| CertExpired | Session ended — certificate expired or invalid | Server auth certificate expired or invalid |
| CertMismatch | Session ended — unexpected certificate | Unexpected server authentication certificate received |
| ConnectionBroken | Connection to remote PC lost | Network connection problem |
| ConnectionTimeout | Couldn't establish session in time | Session setup timed out |
| CredSSPRequired | Session ended — CredSSP required by server | CredSSP must be enabled; contact administrator |
| FreshCredsRequired | Working on refreshing token, try again shortly | Token refresh in progress |
| GatewayAuthFailure | Couldn't connect to gateway | Gateway authentication error |
| GenericLicenseError | Can't connect — licensing error | Licensing issue; contact admin |
| IdleTimeout | Session timed out due to inactivity | Inactivity timeout; try reconnecting |
| InvalidLogonHours | Session ended — outside allowed sign-in hours | Admin restricted allowed sign-in hours |
| InvalidWorkStation | Can't connect — device not allowed | Admin restricted which devices can sign in |
| LogonFailed | Sign in failed | Incorrect username or password |
| LogonTimeout | Session ended — session time limit exceeded | Admin or network policy time limit |
| LoopbackUnsupported | Can't connect — device and remote PC are same | Loopback connection not supported |
| NoLicenseAvailable | Can't connect — no licenses available | No licenses available for this PC; contact admin |
| NoLicenseServer | Can't connect — no license server available | No license server available |
| NoRemoteConnectionLicense | Session ended — PC not licensed for remote connections | PC not licensed for remote connections |
| NoSuchUser | Can't connect — username doesn't exist | Username not found; verify username |
| OrchestrationResourceNotAvailableError | Can't connect — no available resources | No session hosts currently available; try later |
| OutOfMemory | Web client out of memory | Reduce browser window size or disconnect existing sessions |
| PasswordExpired | Can't connect — password expired | User password expired; change password |
| PasswordMustChange | Can't connect — must change password | Password change required before sign-in |
| RemotingDisabled | Can't connect | Remote access not enabled on PC |
| ReplacedByOtherConnection | Disconnected — another connection made | Another session replaced this connection |
| SSLHandshakeFailed | Can't connect | Possible expired password; SSL handshake failed |
| ServerNameLookupFailed | Can't connect — PC can't be found | DNS resolution failure for server name |
| SessionHostResourceNotAvailable | Can't connect — VM failed to start | Session host VM failed to start; try again or contact support |
| TimeSkew | Can't connect — TimeSkew | Date/time difference between client and remote PC; sync clock |
| VersionMismatch | Session ended — protocol version mismatch | Local and server RDP versions don't match; update client |
| WebWorkerError | Can't start connection due to webworker error | Click Reconnect to start new session without webworkers |
| ScreenCaptureProtectNotSupported | Can't connect — screen capture protection | Enable screen capture protection; contact admin if persists |

## Scenario 5: Client Authentication
> 来源: ado-wiki-b-unified-web-portal.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Handled using **msal-browser** library. Tokens obtained for:
   - **O365 Header** — onboard O365 Suite Header
   - **AVD** — feed discovery
   - **OCPS** — survey and feedback features

## Scenario 6: First Party Application (FPA)
> 来源: ado-wiki-b-unified-web-portal.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Portal web client: **Windows 365 Client - Web FPA** (same as Consumer Portal; allows MSA and AAD)
   - Portal UX Service: **Windows 365 End User API FPA** (same as Window 365 End User API)

## Scenario 7: Unified Web Portal Structure
> 来源: ado-wiki-b-unified-web-portal.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Frontend web app served via unified URL
   - Backend UX service using Windows 365 End User API FPA
   - Client authentication via msal-browser (client-side)
   - Service authentication via MISE+SAL (server-side)

## Scenario 8: Device List Flow
> 来源: ado-wiki-b-unified-web-portal.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Two flows for getting devices list (including AVD & Cloud PCs):
1. **Without Unified Feed Discovery** — direct device enumeration
2. **With Unified Feed Discovery** — feed discovery then device list

## Scenario 9: Key URLs (Deprecated/Historical)
> 来源: ado-wiki-b-unified-web-portal.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - These URLs are no longer in use; current production URL is managed by the unified portal team

## Scenario 10: **Connection Flow when End User uses Web Portal/Web Client**
> 来源: ado-wiki-web-portal-connection-flow.md | 适用: \u901a\u7528 \u2705

### 排查步骤
**Connection Flow**
1. End User launches browser and authenticates against AAD using OneAuth.
2. Once Auth is successful, we get the Graph token. Then we reach to Graph APi for getting information related to RDP file, CPC List, WorkspaceID, DirectLaunchUrl.
3. Customers click on "Connect", when customer click on connect, the rdp file(downloaded in step2) is used and reads the contents of the AVD resources and connects to CPC by orchestrating the connection within AVD Infra.
AVD Infra : RD Gateway, RD Connection Broker, RD Web
**How the Web Portal client talks with workspace (Nighthawk) and get the end consumer the required resource when they select CloudPC or AVD?**
We redirect users to Nighthawk by specified URL, which contains the ID of workspace will be launched. Nighthawk will use this ID to query required information.
**What kind of failures/error message a user will get when they select the workspace but are not shows the required W365 CPCs?**
Nighthawk shows "We couldn't connect to the remote PC. This might be because of a network problem. If this keeps happening, ask your admin or tech support for help." to users if there are any issues on required information fetching.
**What kind of error message an end consumer will get when perform a remote action like "Restart" or "Restore" and it fails to perform those actions? What kind of logs can we collect in these scenarios?**
Any Cloud PC failed actions would notify users with a generic error dialog.
**How does pinned device works? Failure for pinning a Cloud PC results in what error? What logs can be collected?**
In current version, pinning device will not trigger any requests to server but store the pinned information on browser local storage.
**Log collection for above scenarios: "Capture Logs"** inside "**Collect User Logs**" and get **activity Id** from "**Connection Details**." section.
https://learn.microsoft.com/en-us/windows-365/end-user-access-cloud-pc#collect-user-logs
Once we get the **activity Id** from the above logs, we can use the AVD Kusto Queries for further troubleshooting.
