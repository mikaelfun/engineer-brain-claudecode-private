---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/Features and Functions/TSG: JSChallenge Action for Regional WAF Policies"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FTSG%3A%20JSChallenge%20Action%20for%20Regional%20WAF%20Policies"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# JSChallenge Action for Regional WAF Policies

## Overview

Application Gateway WAF offers JavaScript (JS) Challenge feature as part of the Advanced Bot Protection. It allows configuring a WAFv2 Policy's Custom Rule or Bot Manager 1.x rule with JS Challenge action. Any client request matching this rule will be responded with a Microsoft Interstitial page containing the JavaScript challenge that the browser engine needs to successfully solve to get validated as a Non-Bot client.

- Requests from clients that fail the JS Challenge will be blocked
- Clients that pass the JS Challenge will be assigned a cookie that whitelists it for future requests until cookie expires (configurable; default 30 minutes)
- This feature is only supported in WAFv2 running AzWAF

## Client Device Requirements

1. Must be an actual browser (curl, wget, etc will not pass)
2. Browser must be up-to-date (Edge, Chrome, Firefox, Safari — no IE support)
3. JavaScript and cookies must be enabled
4. Extensions blocking cookies/JavaScript/web requests may interfere (some Adblockers cause failures)

## Debug Potential Issues

### Client Request Matching JS Challenge Rule Is Blocked

- AJAX requests (API requests) matching JS Challenge rule will be blocked (known issue)
- Confirm client browser has JS engine and cookies enabled
- New client sending request with body > 128KB will be blocked if JSChallenge rule triggers. Whitelisted clients can send any body size
- Check ApplicationGatewayFirewallLog and dashboard metrics

**NOTE**: A request that passes JS challenge or has validation cookie will still be evaluated for remaining Custom and Managed rules.

### Client Request Matching JS Challenge Rule Is NOT Challenged

- Client HTTP/S request does not contain a Host header
- Incoming request has a valid cookie → not challenged
- Request does not match JS Challenge rule match conditions
- Request evaluation terminated by a higher priority rule

**NOTE**: A single client request will be JS Challenged only once (if no validation cookie) regardless of matching multiple JSChallenge rules.

## Troubleshooting Scenarios

### 1. Page content/resources don't load correctly when matching challenge rule
A challenge can only be passed when a browser renders the challenge response as HTML. Challenges on non-HTML resources don't work unless the page using them is also challenged. A blanket challenge rule for an entire domain works because the initial challenge is on an HTML page, and subsequent resource requests still have the `appgw_azwaf_jsclearance` clearance cookie.

### 2. API calls are being challenged
AJAX/API requests cannot pass JS Challenge. Exclude API paths from challenge rules.

### 3. Challenge page displays "An unexpected error occurred"
- Ensure client browser is supported
- Ensure no interfering browser extensions

### 4. Challenge page is blank and nothing happens
This is an error condition. Raise an ICM with the Application Gateway WAF team with debug information.

### 5. User challenged again before cookie expiration / stuck in challenge loop
- Cookie expired or domain mismatch
- User refreshed interstitial page before challenge completed
- Client IP changed (NAT, cell tower changes) — check access/WAF logs for `clientIP` changes
- CORS request from different domain: `appgw_azwaf_jsclearance` cookie uses `SameSite=strict`

### 6. Users blocked right after passing challenge
- Check why they were blocked — subsequent rules can block a request that passes challenge
- If logs show `JSChallengeBlock` repeatedly, create ICM with debug info

### 7. Requests to `/.azwaf/...` during challenge
- Internal Application Gateway route used by challenge to fetch required assets
- If blocked or returning non-200, challenge will likely fail
- If 404 responses to `challenge.<hash>.js`, create ICM with debug info

## Limitations

- AJAX requests are unsupported for JS Challenge
- JS Challenge is not supported for AppGW WAF "Ratelimit" type custom rules (Available in GA)

## Cookie Expiration

Configurable value from 5 to 1440 minutes (1 day).

## Observability

- Namespace: AppGWT
- Events: ApplicationGatewayTenant, ApplicationGatewayFirewallLog, ApplicationGatewayFirewallControlPathLog, ApplicationGatewayFirewallDataPathLog
- [JS Challenge Metrics Dashboard](https://portal.microsoftgeneva.com/dashboard/AppGWT/AzWaf/JavaScript%2520Challenge%2520Metrics)

## Mitigation

Disable the rules using JSChallenge Action if causing issues.
