# ENTRA-ID Application Proxy — Detailed Troubleshooting Guide

**Entries**: 56 | **Drafts fused**: 41 | **Kusto queries**: 1
**Draft sources**: ado-wiki-a-app-proxy-connector-event-logs.md, ado-wiki-a-app-proxy-connector-installation-tsg.md, ado-wiki-a-app-proxy-edge-mobile-redirection-tsg.md, ado-wiki-a-app-proxy-msgraph-apis.md, ado-wiki-a-app-proxy-saml-sso.md, ado-wiki-b-app-proxy-401-kcd-troubleshooting.md, ado-wiki-b-app-proxy-communication-flow-architecture.md, ado-wiki-b-app-proxy-connector-inactive.md, ado-wiki-b-app-proxy-cookies.md, ado-wiki-b-app-proxy-data-collection-action-plans.md
**Kusto references**: gateway-throttle.md
**Generated**: 2026-04-07

---

## Phase 1: App Proxy
> 38 related entries

### Customer unable to add advanced group transformation options or regex rules for Header Based SSO configured on Azure AD Application Proxy applications
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Engineering bug — group transformation rules for Header Based SSO in App Proxy are not supported through the standard Claims configuration blade; feature is on the engineering roadmap.

**Solution**: Workaround using the Claims (preview) private preview blade: navigate to https://aad.portal.azure.com/?feature.claimeditorpreview=true, go to the App Proxy application > Claims (Preview), add a new claim with conditions/group membership. Prefix the claim Name with 'appproxy_<ClaimName>' so App Proxy sends it as a header. Set expectations with customer about private preview status.

---

### Application published via Azure AD App Proxy overrides robots.txt configuration: internal robots.txt shows 'Allow: /' but external access via App P...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Design behavior - Azure AD App Proxy intentionally blocks web crawlers and bots to protect published applications. App Proxy is designed only for Line of Business apps for licensed users, not for publishing websites publicly on the internet.

**Solution**: This is an unsupported scenario with no workaround. Azure AD App Proxy is not a method to publish websites on the public internet. Every user accessing via App Proxy must have a license. Web crawler/SEO scenarios are explicitly blocked by design. Reference: https://learn.microsoft.com/en-us/azure/active-directory/app-proxy/application-proxy-security#remote-access-as-a-service

---

### Application published via Microsoft Entra App Proxy works with a single connector but fails intermittently or hangs after adding multiple connector...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Backend application requires session persistence (session affinity). With multiple connectors, each connector uses a different IP address, so requests within the same session may route to different backend servers, breaking session stickiness.

**Solution**: Confirm session persistence is the issue by testing with a single connector. Then configure load balancer for session persistence: (1) Use session cookie-based affinity via Azure Application Gateway or L7 LB (recommended), (2) Use X-Forwarded-For header affinity with L7 LB, or (3) Redesign backend app to not require session persistence. Ref: https://docs.microsoft.com/azure/active-directory/manage-apps/application-proxy-high-availability-load-balancing

---

### External client accessing an Application Proxy published application receives GatewayTimeout error (The Request Timed Out). Backend server does not...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Backend server does not respond in time to the request forwarded by the App Proxy connector. Default connector timeout is 85 seconds. Could be caused by network latency between connector and backend server, or backend application performance issues.

**Solution**: In Entra Portal App Proxy configuration, change Backend Application Timeout from Default (85s) to Long (180s). If timeout persists after changing to Long, investigate network path (capture netsh traces on both connector and backend server simultaneously) and backend application performance. If backend app inherently needs >180s response time, App Proxy is not a viable publishing solution.

---

### CORS error in browser after splitting single-server application into two separate Entra Application Proxy apps, resources now on different domains
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Previously resources were on the same origin (single server, single App Proxy app). After publishing as two separate apps, cross-origin requests trigger CORS violations since browser enforces same-origin policy across different App Proxy external URLs

**Solution**: Consolidate back to a single App Proxy app publishing (one domain = no CORS). Alternatively, use wildcard publishing to keep resources under same domain. Reference: https://docs.microsoft.com/azure/active-directory/manage-apps/application-proxy-understand-cors-issues

---

### CORS error when App Proxy app calls another App Proxy app with Entra ID pre-authentication - OPTIONS preflight request gets HTTP 302 redirect or HT...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Browser OPTIONS preflight requests do not include credentials (cookies). App Proxy with Entra ID pre-authentication redirects unauthenticated requests to login.microsoftonline.com. The preflight fails because ESTS does not support CORS OPTIONS requests

**Solution**: Set the API app to passthrough pre-authentication to avoid 302 redirect on OPTIONS calls. If pre-auth is required, use the Complex App Support feature (private preview CORS feature is deprecated). Ensure CORS headers reference external URL, not internal URL

---

### JavaScript/HTML requests hang or fail to load when accessing App Proxy app with pre-authentication - client code cannot handle redirects to login.m...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: JS/HTML code making requests to App Proxy app does not have AzureAppProxyAccessCookie for the target app. App Proxy issues 302 redirect to login.microsoftonline.com but JS code cannot follow authentication redirects

**Solution**: Pre-authenticate to the target app before the JS call by embedding a fake image/link or using wildcard publishing to set the authentication cookie. Note: this workaround does NOT work if user authenticates via Primary Refresh Token (Entra Joined/Hybrid Joined/Registered devices)

---

### CORS error occurs after approximately 50 minutes of using App Proxy application - browser shows CORS errors on periodic refresh/AJAX calls, Fiddler...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: AzureAppProxyAccessCookie expires after ~50 minutes. On next request, App Proxy issues 302 redirect to login.microsoftonline.com. If the request is a complex JS call with custom headers, browser sends OPTIONS preflight to login.microsoftonline.com which is not allowed (ESTS does not support CORS)

**Solution**: Follow the article on Entra Application Proxy CORS exception after the authentication cookie expires. Consider implementing silent token refresh or extending session lifetime. Common with long-running apps like Outlook Web Access

---

### CORS error when a non-App-Proxy web app (caller) makes requests to an App Proxy published app (callee) with Entra ID pre-authentication enabled
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The callee app is published with Entra ID pre-authentication. When the non-App-Proxy caller invokes the callee, App Proxy redirects to login.microsoftonline.com, triggering CORS exception because the caller origin is not allowed by ESTS

**Solution**: Change the callee App Proxy app to use passthrough pre-authentication type instead of Entra ID pre-authentication. This eliminates the redirect to login.microsoftonline.com that triggers CORS

---

### Forbidden - Authorization failed error accessing App Proxy app with Entra pre-authentication (IsStateSessionEnabled=true), browser shows 'Make sure...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: CSRF protection (IsStateSessionEnabled) validates PreauthSessionCookie against State parameter in the authorization code callback. Fails when browser cannot present PreauthSessionCookie (cookies disabled, app does not handle cookies properly, or cookie lost during redirects)

**Solution**: Check if PreauthSessionCookie is present in the request with authorization code. If cookies are being blocked, fix browser cookie settings. If app cannot handle cookies, disable the feature by setting IsStateSessionEnabled=false via MS Graph OnpremisesPublishing API. Note: this reduces CSRF protection

---

## Phase 2: Application Proxy
> 16 related entries

### Microsoft Entra Application Proxy returns BadGateway 'An error occurred' with HRESULT 80004005 (E_FAIL). Connector log shows 'Processing OnBEHeader...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The backend server sends malformed Set-Cookie response headers that the App Proxy connector cannot parse. Common patterns: missing cookie value (e.g., 'Set-Cookie: ASPSESSIONID; path=/' instead of 'Set-Cookie: ASPSESSIONID=value; path=/'), or Apache-style malformed cookies ('Set-Cookie: HttpOnly;Secure;SameSite=Strict' without name=value pair).

**Solution**: Fix the Set-Cookie header syntax on the backend web application to follow RFC 6265 format: Set-Cookie: <name>=<value>; <attributes>. Collect Fiddler on connector server comparing working (direct access) vs non-working (through proxy) scenarios to identify the specific malformed header. If error code is 0x80072F00, follow the HTTP/2.0 known issue article instead.

---

### Microsoft Entra Application Proxy returns BadGateway 'Failed to get the backend application's response' with HRESULT 80072F78 (ERROR_HTTP_INVALID_S...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The WinHTTP API used by the App Proxy connector rejects the backend server's HTTP response as invalid. Common causes: (1) response body length is 0, (2) missing response headers, (3) duplicate header field names, (4) invalid characters in header field names (spaces or underscores, e.g., 'content type' or 'content_type'), (5) Content-Length value less than 0. Browsers use more lenient APIs so the issue doesn't reproduce with direct access.

**Solution**: Fix the backend web application's HTTP response headers. Collect Fiddler on connector server comparing working (direct) vs non-working (through proxy) scenarios. Check for: duplicate headers, spaces/underscores in header names, proper Content-Length values. For deeper investigation, analyze the AppProxyLog.bin with Network Monitor 3.4 using filter 'WEBIO_MicrosoftWindowsWebIO.HttpInvokeParserComplete.Error.WinErrorValue == 0x3a'.

---

### Microsoft Entra Application Proxy returns BadGateway error 'The service detected a possible loop. Make sure that the internal URL does not point to...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: DNS on the connector server resolves the internal hostname (from the App Proxy internal URL) to the external/public IP address, causing the HTTP request to loop back to the App Proxy cloud service instead of reaching the backend server. The cloud service detects the loop via the X-MS-Proxy header it adds to forwarded requests. Causes: (1) DNS server returns public IP for internal hostname, (2) Azure DNS 168.63.129.16 resolving incorrectly, (3) wrong entry in hosts file, (4) multiple DNS servers 

**Solution**: 1) Add correct internal IP + hostname to hosts file on all connector servers, flush DNS (ipconfig /flushdns), verify with ping. 2) Check all DNS servers (ipconfig /all) with nslookup (append dot to hostname). 3) If Azure DNS 168.63.129.16 is the culprit and not needed, block its ports 53/udp and 53/tcp in Windows Firewall. 4) If using web proxy, verify connector's proxy configuration per MS docs. 5) For intermittent issues: check all connectors in the connector group and collect network traces w

---

### Microsoft Entra Application Proxy published app freezes or shows errors approximately 50 minutes after sign-in. Browser developer console shows COR...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The default access token lifetime (~1 hour) expires during the user's session. Once the AzureAppProxyAccessCookie expires, the App Proxy cloud service redirects unauthenticated requests to login.microsoftonline.com. For background/AJAX requests (scripts), this redirect triggers a CORS violation because the script cannot follow the cross-origin redirect to the IdP.

**Solution**: Create and assign a Token Lifetime Policy to extend the access token lifetime. Use MS Graph PowerShell: 1) Connect-MgGraph with Policy.ReadWrite.ApplicationConfiguration scope. 2) New-MgPolicyTokenLifetimePolicy with longer AccessTokenLifetime (e.g., '2:00:00' for 2 hours, max 1 day). 3) Assign policy to the MEAP app registration via New-MgApplicationTokenLifetimePolicyByRef using the app's ObjectId. Verify in ASC under Application > Linked Policy.

---

### Creating Microsoft Entra Application Proxy app with custom domain fails with error 'External Url entered is already in use for an application on an...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The custom domain URL was previously used in another tenant and the Application Proxy app was not deleted correctly, leaving an orphaned configuration in the App Proxy database

**Solution**: Customer must delete the orphaned app following the documented steps for incomplete App Proxy app deletion. If customer cannot self-remediate, engage the product group via Teams channel with the old tenant ID and external URL to remove the orphaned configuration from the App Proxy database.

---

### Creating Microsoft Entra Application Proxy app fails with error 'Internal url entered is already being used by another application' (appProxyErrorI...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The exact same internal URL is already configured in another Application Proxy app or a Hybrid Agent (Exchange) application

**Solution**: Use ASC Tenant Explorer > Application Proxy to locate the app with the duplicate internal URL. Customer can run the PowerShell script 'Get all Application Proxy apps and list extended information' to find it. If the Hybrid Agent configuration causes the issue, involve Exchange support.

---

### Customer needs to restrict access to Entra Application Proxy published application based on client IP address, but backend server IP filtering bloc...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Application Proxy connector forwards requests using its own IP address, not the original client IP. The client's public IP is only available in the X-Forwarded-For HTTP header added by the App Proxy Cloud service.

**Solution**: Implement IP-based filtering using X-Forwarded-For header: (1) Place a firewall/WAF in front of App Proxy endpoint (e.g. Azure Front Door), (2) Place a firewall/proxy between connector and backend to filter on X-Forwarded-For, or (3) Configure backend server (e.g. IIS Dynamic IP Restrictions) to act on X-Forwarded-For header. Note: App Proxy support is not responsible for implementing these solutions; engage appropriate support team if first-party products are involved.

---

### User accessing application published via Microsoft Entra Application Proxy with # (hash/fragment identifier) in the URL gets redirected to a trunca...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Browsers truncate the URL at the # character (fragment identifier) per RFC 1738 and do not preserve the URL fragment across HTTP redirects. When the first unauthenticated request contains #, the Entra ID login endpoint redirects back to the truncated URL without the fragment

**Solution**: Ensure the first access URL does not include the # character. Workarounds: (1) Set up a server-side redirect from a clean URL to the hash-containing URL so the first request has no #, (2) Remove # from URL if not needed, (3) Configure passthrough pre-authentication (not recommended). For SharePoint with Minimal Download Strategy (which uses #), disable that feature when published via App Proxy

---

### Users accessing application published via Microsoft Entra App Proxy receive Bad Request Invalid URL (HTTP Error 400. The request URL is invalid), c...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The request URL exceeds the default 260-character path length limit in HTTP.sys on the App Proxy Service Instance

**Solution**: Collect Fiddler trace to confirm the error is related to URL path length exceeding the limit. Submit an ICM to the Microsoft Entra App Proxy team to move the tenant to a Service Instance that supports paths over 260 characters. Note: DNS change takes 10-15 minutes to replicate, during which some users may fail to connect

---

### Microsoft Entra Application Proxy Connector installation fails with Time out has expired and the operation has not been completed error message
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: .NET Framework version older than 4.7.1 installed on the connector server. Starting from connector version 1.5.3437.0, .NET 4.7.1 or greater (4.x line) is required for successful installation.

**Solution**: Install .NET Framework 4.7.1 or later on the connector server. This is commonly needed on older OS like Windows Server 2012 R2 and 2016 where .NET 4.7.1 may not be installed by default.

---

## Phase 3: Tls Deprecation
> 1 related entries

### Customer requests exception/rollback for legacy TLS deprecation block on Azure AD services (eSTS, ADRS, App Proxy, PTA/HIS, MSGraph, CPIM).
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: Azure AD enforces TLS 1.2 minimum at application and gateway level. Legacy TLS blocked with HTTP 426 or AADSTS1002016.

**Solution**: Exceptions only for S500/IsStrategic with validated high impact. Steps: verify S500, CSAM validates, collect TenantID/AppID, file ICM + loop Gateway team, email AADTLSDeprecationSup@microsoft.com. No guarantee.

---

## Phase 4: Cae
> 1 related entries

### User accessing App Proxy application is blocked by CAE with cae_checks_reject_ip error - IP enforcement blocking access after CAE rollout to App Proxy
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: CAE extended to App Proxy performs real-time IP checks. When location-based CA policy with Block access grant is configured, CAE rejects token immediately if IP changes or is outside allowed range.

**Solution**: 1) Check AadTokenValidationOperationEvent in idsharedweu/AADAP: verify TokenType=CaeToken and CaeValidationEnabled=true. 2) Check CaeEvents for cae_checks_reject_ip. 3) Non-strict: check downgraded token (CapolidsLatebind). 4) Auth loop: escalate to eSTS. 5) Disable per-app: PATCH Graph /applications/{id}/onPremisesPublishing with isContinuousAccessEvaluationEnabled=false.

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Customer unable to add advanced group transformation options or regex rules f... | Engineering bug — group transformation rules for Header B... | Workaround using the Claims (preview) private preview bla... | 🟢 8.5 | ADO Wiki |
| 2 | Application published via Azure AD App Proxy overrides robots.txt configurati... | Design behavior - Azure AD App Proxy intentionally blocks... | This is an unsupported scenario with no workaround. Azure... | 🟢 8.5 | ADO Wiki |
| 3 | Application published via Microsoft Entra App Proxy works with a single conne... | Backend application requires session persistence (session... | Confirm session persistence is the issue by testing with ... | 🟢 8.5 | ADO Wiki |
| 4 | External client accessing an Application Proxy published application receives... | Backend server does not respond in time to the request fo... | In Entra Portal App Proxy configuration, change Backend A... | 🟢 8.5 | ADO Wiki |
| 5 | Microsoft Entra Application Proxy returns BadGateway 'An error occurred' with... | The backend server sends malformed Set-Cookie response he... | Fix the Set-Cookie header syntax on the backend web appli... | 🟢 8.5 | ADO Wiki |
| 6 | Microsoft Entra Application Proxy returns BadGateway 'Failed to get the backe... | The WinHTTP API used by the App Proxy connector rejects t... | Fix the backend web application's HTTP response headers. ... | 🟢 8.5 | ADO Wiki |
| 7 | Microsoft Entra Application Proxy returns BadGateway error 'The service detec... | DNS on the connector server resolves the internal hostnam... | 1) Add correct internal IP + hostname to hosts file on al... | 🟢 8.5 | ADO Wiki |
| 8 | Microsoft Entra Application Proxy published app freezes or shows errors appro... | The default access token lifetime (~1 hour) expires durin... | Create and assign a Token Lifetime Policy to extend the a... | 🟢 8.5 | ADO Wiki |
| 9 | CORS error in browser after splitting single-server application into two sepa... | Previously resources were on the same origin (single serv... | Consolidate back to a single App Proxy app publishing (on... | 🟢 8.5 | ADO Wiki |
| 10 | CORS error when App Proxy app calls another App Proxy app with Entra ID pre-a... | Browser OPTIONS preflight requests do not include credent... | Set the API app to passthrough pre-authentication to avoi... | 🟢 8.5 | ADO Wiki |
| 11 | JavaScript/HTML requests hang or fail to load when accessing App Proxy app wi... | JS/HTML code making requests to App Proxy app does not ha... | Pre-authenticate to the target app before the JS call by ... | 🟢 8.5 | ADO Wiki |
| 12 | CORS error occurs after approximately 50 minutes of using App Proxy applicati... | AzureAppProxyAccessCookie expires after ~50 minutes. On n... | Follow the article on Entra Application Proxy CORS except... | 🟢 8.5 | ADO Wiki |
| 13 | CORS error when a non-App-Proxy web app (caller) makes requests to an App Pro... | The callee app is published with Entra ID pre-authenticat... | Change the callee App Proxy app to use passthrough pre-au... | 🟢 8.5 | ADO Wiki |
| 14 | Forbidden - Authorization failed error accessing App Proxy app with Entra pre... | CSRF protection (IsStateSessionEnabled) validates Preauth... | Check if PreauthSessionCookie is present in the request w... | 🟢 8.5 | ADO Wiki |
| 15 | Creating Microsoft Entra Application Proxy app with custom domain fails with ... | The custom domain URL was previously used in another tena... | Customer must delete the orphaned app following the docum... | 🟢 8.5 | ADO Wiki |
| 16 | Creating Microsoft Entra Application Proxy app fails with error 'Internal url... | The exact same internal URL is already configured in anot... | Use ASC Tenant Explorer > Application Proxy to locate the... | 🟢 8.5 | ADO Wiki |
| 17 | Application Proxy configuration panel in enterprise app shows 'Unable to comp... | Application Service Principal contains 'WindowsAzureActiv... | Remove the tag via PowerShell: Connect-MgGraph, Get-MgSer... | 🟢 8.5 | ADO Wiki |
| 18 | Published application via Entra Application Proxy loads but page is missing e... | Page contains embedded links to internal URLs (e.g. image... | Three options: 1) Use Custom Domains so internal/external... | 🟢 8.5 | ADO Wiki |
| 19 | Customer needs to restrict access to Entra Application Proxy published applic... | Application Proxy connector forwards requests using its o... | Implement IP-based filtering using X-Forwarded-For header... | 🟢 8.5 | ADO Wiki |
| 20 | User accessing application published via Microsoft Entra Application Proxy wi... | Browsers truncate the URL at the # character (fragment id... | Ensure the first access URL does not include the # charac... | 🟢 8.5 | ADO Wiki |
| 21 | Users accessing application published via Microsoft Entra App Proxy receive B... | The request URL exceeds the default 260-character path le... | Collect Fiddler trace to confirm the error is related to ... | 🟢 8.5 | ADO Wiki |
| 22 | Microsoft Entra Application Proxy Connector installation fails with Time out ... | .NET Framework version older than 4.7.1 installed on the ... | Install .NET Framework 4.7.1 or later on the connector se... | 🟢 8.5 | ADO Wiki |
| 23 | App Proxy Connector registration fails - no registration record found in Kust... | Network issue preventing connector from reaching registra... | Verify: (1) Account is not guest and has Global/App Admin... | 🟢 8.5 | ADO Wiki |
| 24 | After moving an Application Proxy connector to a different connector group vi... | Connector retrieves its group configuration from the clou... | Restart the Microsoft Entra private network connector ser... | 🟢 8.5 | ADO Wiki |
| 25 | Application Proxy pre-authentication fails with AADSTS700020 when FIC (Federa... | When a reserved URI is used as the app identifier URI, FI... | Change the application identifier URI to a non-reserved U... | 🟢 8.5 | ADO Wiki |
| 26 | Application Proxy pre-authentication fails with AADSTS70052 when FIC (Federat... | FIC-based authentication in Application Proxy does not su... | Ensure the application is configured as single-tenant, or... | 🟢 8.5 | ADO Wiki |
| 27 | Application Proxy pre-authentication suddenly fails after the Appproxy-FIC Fe... | The Appproxy-FIC credential is automatically added by the... | Delete the corrupted FIC credential if present, then disa... | 🟢 8.5 | ADO Wiki |
| 28 | Browser shows ERR_CONTENT_DECODING_FAILED error when accessing an application... | The backend web application uses Brotli (br) compression.... | Change the backend web server compression to use deflate ... | 🟢 8.5 | ADO Wiki |
| 29 | WebSocket connection through App Proxy fails with BadGateway error: The Conne... | Backend server HTTP 101 Switching Protocols response incl... | Configure backend web server to return exactly Connection... | 🟢 8.5 | ADO Wiki |
| 30 | WebSocket connection through App Proxy fails with BadGateway: Could not estab... | SSL certificate of backend application is not trusted by ... | Install Root CA and Intermediate CA certificates in conne... | 🟢 8.5 | ADO Wiki |
