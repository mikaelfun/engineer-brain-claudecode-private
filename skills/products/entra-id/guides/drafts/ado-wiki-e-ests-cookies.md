---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD ESTS/ESTS Cookies"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20ESTS%2FESTS%20Cookies"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# ESTS Cookies Reference

Cookies described here are related to the ESTS authentication process (*login.microsoftonline.com domain). Other endpoints/services use different cookies.

**Key notes:**
- Not all cookies are present on all requests. Some are common, others only under specific conditions.
- Not all common cookies are required to complete authentication.
- Cookie definitions are subject to change.
- Persistent session tokens = persistent cookies; Non-persistent = session cookies (destroyed when browser closes).
- Client-side cookies (set by JavaScript) are marked with HttpOnly=false.

## Common Cookies

| Cookie Name | Comments |
|--|--|
| ESTSAUTH | User session info for SSO. Transient. |
| ESTSAUTHPERSISTENT | User session info for SSO. Persistent. |
| ESTSAUTHLIGHT | Session GUID info. Lite session state for client-side JS, facilitates sign-out per OpenId connect session management spec. |
| SignInStateCookie | List of services accessed for sign-out. No user info. |
| CCState | Session info state between AAD and Azure AD Backup Auth Service (CCS). |
| buid | Browser info tracking. Service telemetry and protection. |
| fpc | Browser info tracking. Request tracking and throttling. |
| esctx | Session context for CSRF protection. Binds request to browser instance. No user info. |
| ch | ProofOfPossessionCookie. Stores PoP cookie hash to user agent. |
| ESTSSC | Legacy (OrgId) session count. |
| ESTSSSOTILES | Tracks session sign-out. When present with value "1", interrupts SSO (TBAuth model) and presents tile selection. |
| AADSSOTILES | Similar to ESTSSSOTILES but for URLMon browser SSO model. |
| ESTSUSERLIST | Browser SSO user list tracking. |
| SSOCOOKIEPULLED | Prevents looping on Edge/IE scenarios. No user info. |
| cltm | Telemetry: AppVersion, ClientFlight, Network type. |
| brcap | Client-side. Validates browser touch capabilities. |
| clrc | Client-side. Controls local cached sessions. |
| CkTst | Client-side. Can be ignored/deleted. No active purpose. |
| wlidperf | Client-side. Tracks local time for performance. |
| x-ms-gateway-slice | AAD Gateway load balance. |
| stsservicecookie | AAD Gateway tracking. |

## Specific Cookies

| Cookie Name | Comments |
|--|--|
| csrfspeedbump | Suppresses Domain Confirmation Dialog after initial completion. Persisted 90 days. |
| x-ms-refreshtokencredential | Available when Primary Refresh Token is used. |
| estsStateTransient | New session model: pointer to sessions in Session Store. Transient. |
| estsStatePersistent | Same as estsStateTransient but persistent. |
| ESTSNCLOGIN | National Cloud Login related. |
| UsGovTraffic | US Gov Cloud Traffic. |
| ESTSWCTXFLOWTOKEN | Saves flowToken when redirecting to ADFS. |
| CcsNtv | Controls AAD Gateway requests to CCS. Native flows. |
| CcsWeb | Controls AAD Gateway requests to CCS. Web flows. |
| Ccs* | Prefix variants apply when Azure AD Backup Auth Service (CCS) is used (ccs.login.microsoftonline.com). |
| threxp | Throttling control. |
| rrc | Identifies recent B2B invitation redemption. |
| debug | Tracks if browser session enabled for DebugMode. |
| MSFPC | Microsoft-wide. Identifies unique browsers. Used for advertising, analytics, operations. |
