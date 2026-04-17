# ENTRA-ID Sign-in Logs & AADSTS Errors — Detailed Troubleshooting Guide

**Entries**: 121 | **Drafts fused**: 2 | **Kusto queries**: 2
**Draft sources**: ado-wiki-c-websignin-log-analysis.md, ado-wiki-d-ca-sign-in-logs.md
**Kusto references**: diagnostic-traces.md, signin-logs.md
**Generated**: 2026-04-07

---

## Phase 1: Sign In Logs
> 27 related entries

### Sign-in logs show Join Type as digit instead of text in Entra Portal
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Display bug - Join Type not mapping numeric value to string

**Solution**: Resolved Nov 4 2025 (ICM 701609121)

---

### Sign-in logs show Service Principal ID as 00000000-0000-0000-0000-000000000000 for certain app sign-ins
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: SP-Less clients don't have a Service Principal in the tenant, so the SP ID shows as all-zeros placeholder. This is expected for legacy-allowed resource apps (e.g., MS Graph). The SP-Less token lacks oid, role, and group claims — it only proves AuthN (correct secret), not AuthZ. This is a visibility change, not a behavior change.

**Solution**: No security or functionality issue. To improve visibility and log consistency: (1) Create Service Principals for approved client apps in the tenant; (2) Review sign-in logs to monitor SP-Less scenarios; (3) For untrusted apps: create SP for resource app, enable assignment required, and only allow explicitly approved client apps. Reference: IcM 494632598.

---

### [Resolved] Sign-in logs in Entra Portal show Join Type as a digit (number) instead of text string (Microsoft Entra Joined / Hybrid Joined / Registe...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Engineering bug in Sign-in logs rendering of Join Type field

**Solution**: [Resolved] Engineering fix released November 4, 2025. Reference: IcM 701609121, Feature 3412709.

---

### Sign-in logs in customer Log Analytics workspace show timestamps with >2 hour delay from original event time, but IdxIngestion shows normal latency...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The ingestion pipeline (UDI) processed logs normally; the delay occurs at the Azure Monitor consumption side when routing to Log Analytics/Sentinel

**Solution**: Query IdxIngestion table (idsharedwus cluster) with correlation ID. If Latency is <2h and LogReceived is within minutes of original event, ingestion is healthy. Cut collab/IcM to Azure Monitor team for consumption-side investigation

---

### Sign-in/audit logs show >2 hour processing latency in IdxIngestion table (Latency column shows thousands of seconds)
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: UDI log processing delay at the Reporting and Audit Insights pipeline level; data took abnormally long between arrival and availability for consumption

**Solution**: Query IdxIngestion (idsharedwus cluster) to confirm ProcessingDuration/Latency is excessive. Raise ICM to IDX/Reporting and Audit Insights team if customer needs RCA. Check for re-ingestion events (large env_time gaps between entries for same UniqueId)

---

### Sign-in or audit log event cannot be found in IdxIngestion table when queried by correlation ID and tenant ID
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The log event was never received or processed by the UDI pipeline; possible upstream partner service issue (ESTS, MFA, MSODS)

**Solution**: Confirm correlation ID, tenant ID, and timestamps are correct and in UTC. If still no results, escalate via ICM to IDX/Reporting and Audit Insights team per the CRI escalation process

---

### Admin cannot see sign-ins for Password-based SSO application in Entra ID sign-in logs
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Password-based SSO apps use IAMUX (Microsoft App Access Panel) as the client application for ESTS CA policy evaluation; the 3rd party app appears as the resource, not the client

**Solution**: Check sign-ins for "Microsoft App Access Panel" application, then add filter by resource (Password-based SSO app display name or app ID). Check both interactive and non-interactive user sign-ins tabs

---

### Part of the IP address shows as .XXX (redacted) in Entra ID sign-in logs
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Azure AD redacts part of IP addresses for privacy in cross-tenant sign-ins or when user identity confidence is low

**Solution**: This is expected behavior. IP redaction occurs in cross-tenant scenarios (e.g., CSP technician signing into managed tenant). No workaround available

---

### Identity Protection Risky Detections shows a different IP address than what appears in the sign-in log for the same event
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: MFA sign-ins aggregate multiple sub-events (browser + phone MFA challenge) with different IPs. Risk detected on one IP, sign-in log shows another (most recent) IP

**Solution**: Expected behavior. MFA spans multiple clients (PC browser + phone) which may use different IPs. Risk detection IP and sign-in log IP may legitimately differ. No config change needed

---

### Sign-ins from a user who does not belong to the tenant appear in the tenant sign-in logs
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The user is a pass-through user (UserIsPassthru=1) who signed into a resource in the tenant without being a direct member

**Solution**: Check sign-in log in ASC > click Troubleshoot this sign-in > Expert View PerRequestLogs > check if UserIsPassthru=1. Refer to MS docs on auditing troubleshooting scenarios for investigating successful logins by external users

---

## Phase 2: Aadsts
> 19 related entries

### AADSTS160021: Application requested a user session which does not exist. Sign-in fails with AppSessionSelectionInvalidSessionNotExist when app enfo...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The caller application includes a sid (Session ID) parameter in the authorize request that references a non-existent or expired session in eSTS. This is not an eSTS issue but a client-side misconfiguration.

**Solution**: The caller app should either: A) stop enforcing a specific SID by removing the sid parameter from the authorize call, or B) validate where the SID originates and ensure it uses a valid, active session ID.

---

### AADSTS50000: There was an error issuing a token or an issue with our sign-in service. Occurs in On-Behalf-Of (OBO) flow when calling Microsoft Graph.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The API app uses an incorrect client_id in the OBO flow token request. The client_id must match the API app own Application ID, not some other identifier.

**Solution**: Ensure the client_id field in the OBO token request specifies the API App own Application ID (not Object ID or any other identifier). When using the correct Application ID, the OBO flow works correctly.

---

### AADSTS5000225: This tenant has been blocked due to inactivity. Authentication to Entra tenant fails because commerce lifecycle policy has deauthent...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The tenant was deauthenticated by commerce lifecycle policy due to prolonged inactivity. See https://aka.ms/tenantlifecycle for tenant lifecycle policies.

**Solution**: Reference the Lifecycle based authentication blocks TSG for steps to identify, respond to, and re-activate the tenant. TSG: AzureAD wiki /1345264/Lifecycle-Based-Authentication-Blocks

---

### AADSTS50013: Assertion failed signature validation (wrong audience). In OBO flow, the access token aud claim is for a different resource (e.g. Micr...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The application attempts to validate/consume an access token whose audience (aud claim) is for a different API (e.g. graph.microsoft.com). Access tokens are meant for their target audience only.

**Solution**: Solution 1: First get an access token for your own app, then acquire another token for the target API via OBO. Solution 2: If you only need user info (display name, groups), use the id_token instead of the access token.

---

### AADSTS50013: Assertion failed signature validation (certificate chain order). Client assertion fails when chained certificate file has wrong certif...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: When using a chained certificate (PEM/CER) for client assertion, the certificate with the matching public key is not at the top of the chain file. The wrong certificate is used for signature verification.

**Solution**: 1) openssl rsa -noout -modulus -in private.key | openssl md5 to get private key modulus. 2) Separate each cert in chain to own file. 3) Run openssl x509 -noout -modulus -in server.pem | openssl md5 on each until finding matching modulus. 4) Move matching cert to top of chain file. If no modulus matches, wrong public cert uploaded or wrong private key used.

---

### AADSTS500131: Assertion audience does not match the Client app presenting the assertion. HTTP 400 error during On-Behalf-Of (OBO) flow when the acc...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The access token used in the OBO assertion was issued for a different application/resource (e.g., Azure AD Graph 00000002-0000-0000-c000-000000000000) instead of the calling Web API. The audience claim in the token does not match the client ID making the assertion request.

**Solution**: Ensure the client ID in the sign-in request matches the audience claim in the access token used as the assertion. Verify the resource/scope in the initial token acquisition targets the correct Web API application ID, not a different resource.

---

### AADSTS50059: No tenant-identifying information found in either the request or implied by any provided credentials. Silent sign-in fails without Azu...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Silent request (prompt=none) uses a multi-tenant endpoint (common or organizations) without tenant-identifying info. The estsauth cookie is missing or expired. Azure AD cannot determine the tenant and does not redirect the error back to the app.

**Solution**: Option 1: Use tenant-specific endpoint URL (login.microsoftonline.com/{tenant-id}/oauth2/authorize). Option 2: Configure app as multi-tenant. Then implement detection logic to catch the error and prompt for interactive sign-in (see MSAL error handling docs).

---

### AADSTS50196: The server terminated an operation because it encountered a client request loop. User stuck in MFA loop between mysignins.microsoft.co...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Mismatch between authentication methods policy (UCP policy) configured by admin and the strong auth methods registered on user account. User default MFA method (e.g., NotificationOverAuthenticatorApp) is not in PolicyEnabledCredentials list, causing infinite MFA prompt loop.

**Solution**: Align tenant authentication methods policy (UCP) with user registered/default MFA method. Either add user default method to PolicyEnabledCredentials, or change user default MFA to an allowed method. Diagnose via ASC auth troubleshooter: compare AllRegisteredMethods vs PolicyAllowedOrderedSAMs vs PolicyEnabledCredentials.

---

### AADSTS50076: Due to a configuration change made by your administrator, or because you moved to a new location, you must use multi-factor authentica...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Conditional Access policy requires MFA but the application is using a non-interactive flow (Windows Integrated Authentication or Resource Owner Password Credential) that cannot satisfy MFA interactively.

**Solution**: 1) Use an interactive flow instead. 2) Ensure openid is in scopes during interactive sign-in (needed for auth code exchange). 3) Add client app to CA policy exception list. 4) Add user to CA policy exception. 5) Last resort: disable per-user MFA if not using CA policies.

---

### AADSTS7000215: Invalid client secret is provided when acquiring token via authorization code, client credentials, or refresh token grant.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Client secret is expired, belongs to a different app registration, is not URL-encoded, or a different client_id/secret pair was used than the one that acquired the original refresh token.

**Solution**: Verify client secret is not expired, matches the app registration client_id, is properly URL-encoded. For refresh token flows, ensure the same client_id and client_secret that acquired the original refresh token are used.

---

## Phase 3: Fic
> 8 related entries

### AADSTS700211 when using az login --federated-token for cross-tenant managed identity. PowerShell works but Azure CLI fails.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Azure CLI federated-token expects MSI OIDC token, not access token. Different from PowerShell AccessToken param.

**Solution**: Pass MSI token to az login --federated-token, not the access token from target tenant.

---

### AADSTS7000226: No federated identity credential policy found on application ({appid}). The client_assertion used to authenticate the request does n...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The application ID in the cross-tenant CMK request does not have a federated credentials policy configured, or the client_assertion does not match the configured FIC subject/application.

**Solution**: Ensure the application has a Federated Identity Credential (FIC) policy applied. Verify: 1) The application ID in the request is correct, 2) The FIC is properly configured with correct issuer/subject/audience, 3) The correct client_assertion is being provided. Check the multi-tenant app registration's Certificates & Secrets blade for FIC configuration.

---

### AADSTS7002131: No matching federated identity record found for presented assertion subject '{subject}' or no federated identity credential expressi...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The claimsMatchingExpression defined on the Flexible FIC does not match the claims presented by the external identity provider. Common causes: subject claim does not match the wildcard/pattern, job_workflow_ref claim does not satisfy the expression (e.g., workflow is not reusable), or expression syntax is incorrect.

**Solution**: 1) Use ASC Authentication Diagnostics to view the actual subject claim presented (Expert view > Diagnostic logs > search AADSTS). 2) Compare with the claimsMatchingExpression on the FIC (use Graph API: GET /applications/{id}/federatedIdentityCredentials). 3) Verify job_workflow_ref matches if using reusable workflows. 4) Ensure the subject follows the expected format for the issuer (GitHub: repo:{org}/{repo}:{entity}, GitLab: project_path:{org}/{proj}:ref_type:{type}:ref:{name}).

---

### AADSTS7002241: Issuer '{issuer}' may not use credentials matching via expression (FederatedIdentityFflBlockedIssuer).
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The identity provider issuer used in the FIC is not in the supported list for Flexible FIC. Only specific issuers for GitHub, GitLab, and Terraform Cloud are supported for expression-based matching.

**Solution**: Verify the issuer is one of the supported issuers: GitHub (https://token.actions.githubusercontent.com), GitLab (https://gitlab.com, https://gitlab.{example}.com, https://gitlab.{example}.ca), Terraform Cloud (https://app.terraform.io, https://app.eu.terraform.io). For unsupported issuers, use standard FIC with explicit subject matching instead of Flexible FIC expressions.

---

### AADSTS700235: The federated identity credentials flow does not support credentials matching via expression at this time (FederatedIdentityFlexibleF...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Flexible FIC is being used on a resource type that does not yet support it. Initially, Flexible FIC is only supported for FICs configured on Application objects (App Registrations), not on Managed Identities.

**Solution**: Use Flexible FIC only on Application objects (App Registrations). For Managed Identities, use standard FIC with explicit subject matching. Flexible FIC support for Managed Identities is planned for CY25Q1.

---

### AADSTS700237: Federated Identity Credential expression not allowed (FederatedIdentityCredentialExpressionNotAllowed). Detailed error provided in me...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The expression used in the Flexible FIC contains unsupported operators or claims for the given issuer. Each issuer has specific claim/operator restrictions: GitHub supports eq/startswith/matches on 'sub' and eq/matches on 'job_workflow_ref'; GitLab supports startswith/matches on 'sub'; Terraform Cloud supports startswith/matches on 'sub'.

**Solution**: Review the supported operators per issuer and adjust the expression. Ensure only supported claims and operators are used for the specific issuer. The 'and' operator is universally supported. Refer to the Flexible FIC documentation for the full operator/issuer compatibility matrix.

---

### AADSTS700233: Federated Identity Credential expression parsing failed (FederatedIdentityCredentialInvalidExpression). Detailed error provided in me...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The claimsMatchingExpression syntax is invalid and cannot be parsed. Common issues: missing/incorrect single quotes, wrong claim lookup format, unsupported operator name, or malformed boolean expression.

**Solution**: Verify expression follows the pattern: claims['claimName'] operator 'comparand'. Supported operators: eq, startswith, matches, in, has, and. Ensure single quotes around string values. For wildcards use '*' (multi-char) and '?' (single-char) with 'matches' operator. Use 'and' to combine multiple conditions. Set languageVersion to 1.

---

### AADSTS700234: Federated Identity Credential expression evaluation failed (FederatedIdentityCredentialExpressionEvaluationException). Detailed error...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The claimsMatchingExpression parsed successfully but failed during runtime evaluation, typically due to type mismatch between the claim value in the incoming token and the comparand in the expression.

**Solution**: Verify that claim types match the expected types for the operator being used. Check that the external IdP is sending claims in the expected format. Supported types: Boolean, Integer, String, Arrays of string/integer. Type checking happens at runtime since claim value types are unknown until a token is presented.

---

## Phase 4: Ests
> 6 related entries

### AADSTS50196 LoopDetected error during sign-in. User sees error page with StsErrorCode LoopDetected. For token endpoint requests, Invalid Grant resp...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Client enters authentication request loop. eSTS detects via Leaky Bucket algorithm using cookie-based fingerprint (hash of TenantId, AppId, ResourceId, UserId, GrantId). Common causes: lack of token caching, app cannot handle errors, misconfigured reply URL (http vs https).

**Solution**: LoopDetected is a secondary failure. Use LogsMiner to load previous requests from same session. Find the first non-LoopDetected request and troubleshoot from there. Check app-side: reply URL config, token caching, error handling. Kusto: query PerRequestTableIfx by FingerprintCookieId.

---

### Windows 11 Operating Systems showing up as Windows 10 in Microsoft Entra Sign-in Logs.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: eSTS not correctly parsing UserAgent string. UserAgent with OS version >= 10.0.22000 should be identified as Windows 11 but reported as Windows 10.

**Solution**: Known issue being resolved by ESTS team (Work Item 1587325). Status: Resolving.

---

### Non-interactive sign-in IP in Entra sign-in logs does not match the app server IP for confidential client apps using refresh token grant
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: By design: ESTS uses OriginalIPAddressClaim (ClientIPSource=4) for refresh token grant of confidential client apps, showing IP from original token issuance instead of current app server IP

**Solution**: Expected behavior. To find actual app server IP, search XFwdIp in ASC PerRequestLogs column. The displayed Client IP comes from the incoming Refresh Token

---

### In device code flow, client IP in sign-in logs reflects the remote device that initiated device code request, not the device where user performed i...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: By design: ESTS uses DeviceFlowUserCode (ClientIPSource=6) to reflect remote device IP since final tokens are returned to original/remote device; CA IP policies evaluated for that device

**Solution**: Expected behavior. Confirm by checking ClientIPSource in ASC sign-in diagnostic logs (should show DeviceFlowUserCode/6). CA IP-based policies are correctly evaluated against the original/remote device IP

---

### Azure VM sign-in logs show IPv6 client IP instead of expected IPv4; CA policies based on IPv4 VNet named location fail to apply
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: Due to SFI effort, Azure Network added AzureActiveDirectory service endpoint tag to 1st party subscriptions, routing requests through VNet Service Tunnel using IPv6 converted from IPv4

**Solution**: Check if tenant/VNet is in VnetIdsThatCanOverrideClientIp list in ESTS. If listed, ESTS overrides client IP with IPv4 from Gateway x-ms-vnet-client-ip header (ClientIPSource=VnetClientIp). If not listed, escalate to ESTS to add exception

---

### Authentication request returns HTTP 403 or 500 error without standard AADSTS error codes; STS-specific headers (x-ms-request-id, x-ms-ests-server) ...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: Request was routed to AAD Gateway backup authentication system (CCS) instead of primary STS endpoints; happens during preventive testing or outage resilience routing. Header x-ms-gateway-slice=CCS confirms this

**Solution**: 1) Check response headers for x-ms-gateway-slice=CCS and X-FEServer; 2) Query addgwwst Kusto cluster AllRequestSummaryEvents to verify TargetService=CSS; 3) Check application-side logs; 4) Missing STS headers confirms request did not reach STS

---

## Phase 5: Passwordless
> 4 related entries

### User completes number match for PSI but gets error 130500: 'Your company policy requires that you use a different method to sign in. Disable phone ...
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: User is not in scope of the Microsoft Authenticator passwordless sign-in policy (Default User Credential Policy).

**Solution**: In the Microsoft Authenticator passwordless sign-in policy, verify the user or a group containing the user is included. If 'Select users' targets a group, verify user membership. User can also remove credential from Authenticator app via 'Disable phone sign-in' or delete from aka.ms/mysecurityinfo.

---

### Passwordless sign-in notifications not appearing on user device when sign-in originates from unfamiliar location. Failed MFA sign-in event recorded...
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: By design — Entra ID smart lockout blocks PSI notifications from unfamiliar locations to prevent MFA fatigue attacks. Location becomes 'familiar' after 14 days or 10 logins. Determined by D Protection ESTS Risk Assessment Module (RAM).

**Solution**: If user initiated the sign-in from an unfamiliar location, open Authenticator app and swipe down to see the prompt and enter number matching code manually. Location familiarity builds over 14 days / 10 logins. Check ESTS Kusto: AllPerRequestTable | where RamAdhocDebuggingInfo contains 'PSIBLK' to confirm risk-based blocking.

---

### User completes number match for PSI but gets error 130500: Company policy requires different sign-in method. Sign-in log shows PhoneSignInBlockedBy...
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: User not in scope of Microsoft Authenticator passwordless sign-in policy.

**Solution**: Verify user or group included in PSI policy. User can disable phone sign-in from Authenticator or aka.ms/mysecurityinfo.

---

### PSI notifications not appearing when sign-in from unfamiliar location. Failed MFA in sign-in logs. ESTS shows PSIBLK flag.
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: Smart lockout blocks PSI notifications from unfamiliar locations. Location familiar after 14 days or 10 logins (ESTS RAM).

**Solution**: Open Authenticator and swipe down for manual prompt. Check ESTS Kusto AllPerRequestTable for PSIBLK flag.

---

## Phase 6: Usgov
> 4 related entries

### US Government user receives AADSTS900439 (USGClientNotSupportedOnPublicEndpoint) when signing into application using public cloud endpoints (login....
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Azure AD enforces US Gov users to sign in using .us endpoints only. Applications still using .com/.net endpoints are blocked.

**Solution**: Update the application to use the US Government endpoint https://login.microsoftonline.us. For Microsoft-owned apps failing: file ICM against the application product team. For 3rd party apps: direct customer to https://devblogs.microsoft.com/azuregov/azure-government-aad-authority-endpoint-update and national cloud docs.

---

### Public cloud user receives AADSTS900440 (PublicTenantNotSupportedOnUSGovEndpoint) when accessing app hosted in US Government tenant via login.micro...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Azure AD blocks public cloud users from authenticating via USGov endpoints. The app must route public cloud users to the correct login endpoint.

**Solution**: Application must send public cloud users to https://login.microsoftonline.com. May need to create a new app registration in public cloud (portal.azure.com) and host two versions of the site (e.g., portal.azure.us and portal.azure.com). See: https://docs.microsoft.com/azure/active-directory/develop/authentication-national-cloud

---

### USGov application users get AADSTS900439 (USGClientNotSupportedOnPublicEndpoint) when signing in via public cloud endpoints (login.microsoftonline....
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Azure AD enforces that US Government users must sign in using the .us endpoint (login.microsoftonline.us) instead of public cloud endpoints. Apps still using old endpoints are blocked.

**Solution**: 1) Customer-owned app: update to use login.microsoftonline.us authority per national cloud docs. 2) Microsoft 1st party app: file ICM against that app team. 3) Need temporary allowance: file ICM to Azure AD ESTS/Incident Triage for allow-list. Use root cause 'National Cloud issues' in Service Desk.

---

### Public cloud users get AADSTS900440 (PublicTenantNotSupportedOnUSGovEndpoint) when signing into apps hosted in US Government tenants via login.micr...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Azure AD blocks public cloud users from signing into apps hosted in US Government tenants. The app must host two versions pointing to the correct login endpoint for each cloud.

**Solution**: Application must send users to the correct login endpoint. Host two versions (e.g., portal.azure.us and portal.azure.com). Update app to support public cloud users per national cloud onboarding guidance: https://docs.microsoft.com/azure/active-directory/develop/authentication-national-cloud

---

## Phase 7: Authentication
> 4 related entries

### Users get AADSTS5000229 error: "We are sorry, this resource is not available" when authenticating. All authentication methods and paths to the tena...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: Tenant identified as a Microsoft-owned ephemeral tenant created outside supported processes. The tenant has been blocked by Microsoft posture management. Through end of 2025, AADSTS5000224 may also be used for expired ephemeral tenants.

**Solution**: For Microsoft employees: follow aka.ms/TenantMgmt to create a new ephemeral tenant; can request one-time 90-day extension via aka.ms/TenantExtension with EVP approval (max 90+90 days). For external customers: create IcM via aka.ms/TenantReAuth template (enter "Customer Tenant" in approver field); PG will verify and perform re-auth. Root Cause coding: CID Sign In and MFA > Tenant DeAuth > AADSTS5000229 - Ephemeral Tenant Block.

---

### Users get AADSTS5000224 error: "We are sorry, this resource is not available" when authenticating. All authentication blocked including all resourc...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: Tenant blocked by Identity Security Investigation team (FROG team) due to fraud or security violation. The block is applied via TenantAuthBlockReasonFraud (DirectoryFeature 66) on the tenant object.

**Solution**: For MS employees: use aka.ms/TenantMgmt. For external customers: create IcM via aka.ms/TenantReAuth. If PG confirms re-auth issue, unblock and close case. If PG detects fraud: (1) get TA confirmation, (2) send CELA-mandated message with tenant name, (3) if customer appeals, TA creates IcM to FROG team (Service: Fraud Response Operations Group, Team: Triage) using IcM template W13H15. Contact sasrequests@microsoft.com. Root Cause: fraud false positive -> AADSTS5000224 - Fraud FALSE Positive; conf

---

### AADSTS500531 error: "The sign-in was blocked because it came from an IP blocked for legal reasons". Browser and application flows both blocked. All...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: Authentication originates from an IP address in a country under US trade embargo (currently North Korea/KP). Azure AD blocks all authentication and API access from embargoed country IPs per US Global Trade Law compliance.

**Solution**: Get TA confirmation. Send CELA-mandated response about non-compliant authentication activity. Do NOT unblock. If customer claims NGO status: escalate to expcomp@microsoft.com (CC Hank.Corscadden@microsoft.com). General trade queries: tradehlp@microsoft.com. If customer claims IP geolocation incorrect: escalate to Protections and Signals Intelligence > OnCall team.

---

### AADSTS5000224 error on tenant with @microsoft.com accounts and customer domains. Customer received action-required email about authentication block...
**Score**: 🟡 3.5 | **Source**: ADO Wiki

**Root Cause**: Multi-domain satellite tenant containing @microsoft.com accounts in privileged roles (Global Admin, Auth Admin, etc.), technical/security contacts, or billing contacts. Microsoft posture management blocks these tenants to prevent unauthorized co-tenancy of Microsoft corporate accounts with external domains.

**Solution**: Before de-auth: remove all @microsoft.com accounts from (1) admin roles (Global Admin, Auth Admin, Privileged Role Admin, User Admin), (2) Technical Contacts in tenant properties, (3) Billing contacts in M365 Admin Center. After de-auth: create IcM via aka.ms/TenantReAuth to unblock, then walk through remediation. MS employees: aka.ms/TenantMgmt. IcM escalation: Service=Identity Reputation Management and Abuse Prevention, Team=Triage, template=aka.ms/reauth.

---

## Phase 8: Conditional Access
> 3 related entries

### Sign-in logs show CA status Failure but Session status Success for blocked EAS legacy auth
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: For EAS, Azure AD relies on Exchange to enforce CA. Azure AD sends block signal but still issues token. By design.

**Solution**: By design. Exchange enforces block. Plans to update session field (Epic 1071328) but no ETA.

---

### Sign-in logs show 'Success' status for non-CAE clients when CAE strict enforcement blocks access; actual access is denied but initial interactive s...
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: During the first leg to /Authorize endpoint, CAE strict enforcement doesn't block because the only token is an Authorization Code (not subject to strict enforcement). The block occurs at token endpoint redemption (non-interactive request), but the interactive sign-in event is recorded as Success.

**Solution**: Check both interactive and non-interactive sign-in logs. Look for the 'SLEv2' value in the CaAdhoc field in PerRequestIfx (via Logsminer) to confirm strict location enforcement blocked the sign-in. The non-interactive request will show as Failed.

---

### Sign-in event for blocked EAS legacy authentication shows Conditional Access status as Failure but Session status as Success in Azure AD sign-in lo...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: For Exchange ActiveSync CA policies, Azure AD relies on Exchange to enforce CA. Azure AD sends a signal in the response for Exchange to block the request on their end. Because ESTS issued a token and did not block on CA, the session field shows Success instead of Failed

**Solution**: This is by design in current implementation. Azure AD does not enforce CA directly for EAS - it delegates enforcement to Exchange. The session status will be corrected to show Failed in a future update (tracked via Epic 1071328). Explain to customer that the actual enforcement happens at Exchange side and the sign-in log status is a logging discrepancy, not a security gap

---

## Phase 9: Federated Identity Credential
> 2 related entries

### AADSTS700213 error for Federated Identity Credential (FIC) authentication. The subject claim in the token does not match the FIC subject configured...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Federated Identity Credential subject matching is case-sensitive. The subject in the incoming token has different casing than the subject configured in the FIC on the application registration. ESTS performs exact case-sensitive comparison.

**Solution**: Use the FIC-Finder PowerShell script to enumerate all applications and their FIC subjects: Get-MgApplicationFederatedIdentityCredential for each app, export to file, then search for the {subject} from the AADSTS700213 error. Fix the casing mismatch in either the FIC configuration or the token issuer.

---

### AADSTS700213 for Federated Identity Credential (FIC): subject claim mismatch despite visually identical values.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: FIC subject matching is case-sensitive. Token subject has different casing than FIC configuration.

**Solution**: Use FIC-Finder script to enumerate all apps and FIC subjects, search case-insensitively for the subject from the error. Fix casing in FIC config or token issuer.

---

## Phase 10: Aadsts50012
> 2 related entries

### AADSTS50012 error and authentication loop in Edge when accessing applications; tenant has AlternateID enabled
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Bug in login flow when AlternateIdLogin is enabled and multiple user credentials present in request (Bug 2914950)

**Solution**: Try different browser or clear Edge cookies/sessions. PG tracking the fix.

---

### AADSTS50012 error and auth loop in Edge with AlternateID enabled
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Bug when AlternateIdLogin enabled and multiple credentials present (Bug 2914950)

**Solution**: Use different browser or clear Edge cookies. PG tracking fix.

---

## Phase 11: Workload Identity
> 2 related entries

### AADSTS53003 for workload identity blocked by CA
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: CA policy blocks SP sign-in from untrusted location.

**Solution**: Identify CA policy from capolids claim. Add SP IP to excluded Named Location.

---

### Authentication fails with AADSTS700231: Token obtained using another federated identity credential may not be used as federated identity credential
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: Customer code uses chained FIC flow (FIC1 -> FIC2 -> Access Token) which is not supported; an app with FIC obtains a token that is then used as another FIC input

**Solution**: Modify code to use FIC directly to get access token for target Azure resource without chaining. Use DefaultAzureCredential with ManagedIdentityClientId. Chained FIC is not a supported scenario; code correction is not AAD team scope

---

## Phase 12: Aadsts900439
> 2 related entries

### AADSTS900439 USGClientNotSupportedOnPublicEndpoint: US Government users receive error when signing into apps using public cloud endpoint (login.mic...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Azure AD enforces requirement that US Gov users sign in using .us endpoint (login.microsoftonline.us) instead of .com endpoint. Apps using public cloud endpoints for USGov tenants are blocked.

**Solution**: 1) If app owned by Microsoft: file ICM against that product team. 2) If 3rd party app: direct user to Azure Government AAD Authority Endpoint Update blog post and national cloud documentation. 3) If app needs temporary allowance: file ICM against Azure AD ESTS/Incident Triage to add app to allow-list. Root cause in Service Desk: National Cloud issues.

---

### AADSTS900439 (USGClientNotSupportedOnPublicEndpoint) error when signing in to Azure Government app using public cloud endpoint
**Score**: 🟡 4.5 | **Source**: MS Learn

**Root Cause**: Microsoft Entra authority for Azure Government updated from https://login-us.microsoftonline.com to https://login.microsoftonline.us; public endpoint no longer accepts Government cloud app sign-ins

**Solution**: Use correct Azure Government endpoints: portal https://portal.azure.us, Graph https://graph.microsoft.us, AD authority https://login.microsoftonline.us. Update app configuration to reference national cloud endpoints.

---

## Phase 13: Aadsts Error
> 2 related entries

### AADSTS50058 error during silent sign-in: 'A silent sign-in request was sent but no user is signed in. The cookies used to represent the user sessio...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: Silent sign-in request (prompt=none) is sent to Entra ID but the estsauth cookie is missing from the request headers. This happens when the cookie is blocked by browser security zones (IE/Edge zones mismatch between app and login.microsoftonline.com), the session has expired, or browser configuration prevents cookies from being passed.

**Solution**: 1) Application must handle this error gracefully and prompt the user for interactive sign-in. 2) Ensure browser is properly configured: add both login.microsoftonline.com and the application endpoint to trusted sites in IE/Edge security zone settings.

---

### AADSTS50197 error: 'Sorry, we could not find the user, please sign-in again.' User encounters this error during authentication flow.
**Score**: 🟡 3.5 | **Source**: ADO Wiki

**Root Cause**: Conflict due to the presence of different user sessions within the Flow Token (tracked under Bug 1989295). Multiple user sessions create a conflict that prevents proper user identification during the authentication flow.

**Solution**: Temporary workarounds: 1) Use InPrivate/Incognito browsing window to avoid session conflicts. 2) Workplace Join the device using the conflicting account (https://learn.microsoft.com/en-us/azure/active-directory/devices/concept-device-registration). 3) Temporarily disable Phone/Passwordless sign-in (PSI) on the conflicting account.

---

## Phase 14: Tenant Restrictions
> 2 related entries

### Token renewal fails with AADSTS5000211 error: A tenant restrictions policy added to this request by a device or network administrator does not allo...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: TRv2 policy on the device injects sec-Restrict-Tenant-Access-Policy header with tenantID:policyID. ESTS enforces the cross-tenant access policy (XTAP) and blocks access if the resource tenant is not allowed.

**Solution**: Check if the tenant admin needs to allow the resource tenant in the XTAP policy. If the blocked user belongs to the home tenant itself, verify the policy configuration. Use Kusto query against scenario table filtering by aadStsErr containing AADSTS5000211 to identify impacted resources and tenants.

---

### Sign-in logs show PII removed - Tenant Restrictions as userDisplayName and userId 00000000-0000-0000-0000-000000000000 from unknown external tenant...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Expected behavior when Tenant Restrictions is configured on corporate network. Restrict-Access-Context header signals Entra ID to forward masked copies of external tenant sign-in logs. PII is removed because user belongs to an external tenant.

**Solution**: Verify TR via ASC > Sign-ins > Troubleshoot > Expert View > PerRequestLogs. Check SpecialFlow=TenantRestrictions and RestrictedTenantProxySetter. Review TRv1 policy in Diagnostics Logs to see permitted tenant list. Explain to customer this is by-design TR logging behavior.

---

## Phase 15: Rds Aad Auth
> 1 related entries

### AADSTS293004: The target-device identifier in the request was not found in the tenant - when using mstsc RDP to AADJ device
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Computer name entered in mstsc does not match AAD device hostnames attribute. E.g. using FQDN device_1.contoso.com when AAD device name is short name device_1.

**Solution**: 1. Use exact AAD device name (short name) in mstsc. 2. Or add Primary DNS Suffix on target machine (Advanced System Settings > Computer Name > Change > More) to register FQDN in AAD hostnames. 3. Or add A record in client HOSTS file pointing to correct device name. 4. Check if DNS Client PrimaryDnsSuffix GPO/MDM is set incorrectly - it takes precedence.

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | App-to-app authentication (OAuth 2.0 Client Credentials flow) fails cross-ten... | Entra ID SP-Less auth block rolled out in two phases: Ste... | (1) App developers: request tenant admin to install app a... | 🟢 9.5 | ADO Wiki |
| 2 | Sign-in logs show Join Type as digit instead of text in Entra Portal | Display bug - Join Type not mapping numeric value to string | Resolved Nov 4 2025 (ICM 701609121) | 🟢 8.5 | ADO Wiki |
| 3 | AADSTS293004: The target-device identifier in the request was not found in th... | Computer name entered in mstsc does not match AAD device ... | 1. Use exact AAD device name (short name) in mstsc. 2. Or... | 🟢 8.5 | ADO Wiki |
| 4 | AADSTS700213 error for Federated Identity Credential (FIC) authentication. Th... | Federated Identity Credential subject matching is case-se... | Use the FIC-Finder PowerShell script to enumerate all app... | 🟢 8.5 | ADO Wiki |
| 5 | AADSTS700213 for Federated Identity Credential (FIC): subject claim mismatch ... | FIC subject matching is case-sensitive. Token subject has... | Use FIC-Finder script to enumerate all apps and FIC subje... | 🟢 8.5 | ADO Wiki |
| 6 | Sign-in logs show Service Principal ID as 00000000-0000-0000-0000-00000000000... | SP-Less clients don't have a Service Principal in the ten... | No security or functionality issue. To improve visibility... | 🟢 8.5 | ADO Wiki |
| 7 | AADSTS700211 when using az login --federated-token for cross-tenant managed i... | Azure CLI federated-token expects MSI OIDC token, not acc... | Pass MSI token to az login --federated-token, not the acc... | 🟢 8.5 | ADO Wiki |
| 8 | AADSTS50012 error and authentication loop in Edge when accessing applications... | Bug in login flow when AlternateIdLogin is enabled and mu... | Try different browser or clear Edge cookies/sessions. PG ... | 🟢 8.5 | ADO Wiki |
| 9 | AADSTS53003 for workload identity blocked by CA | CA policy blocks SP sign-in from untrusted location. | Identify CA policy from capolids claim. Add SP IP to excl... | 🟢 8.5 | ADO Wiki |
| 10 | AADSTS50012 error and auth loop in Edge with AlternateID enabled | Bug when AlternateIdLogin enabled and multiple credential... | Use different browser or clear Edge cookies. PG tracking ... | 🟢 8.5 | ADO Wiki |
| 11 | [Resolved] Sign-in logs in Entra Portal show Join Type as a digit (number) in... | Engineering bug in Sign-in logs rendering of Join Type field | [Resolved] Engineering fix released November 4, 2025. Ref... | 🟢 8.5 | ADO Wiki |
| 12 | SSO sign-in fails with AADSTS50105: User is not assigned to a role for the ap... | The 'Assignment required' setting is enabled on the Enter... | 1. Assign the user or group via Enterprise Apps > Users a... | 🟢 8.5 | ADO Wiki |
| 13 | AADSTS7000226: No federated identity credential policy found on application (... | The application ID in the cross-tenant CMK request does n... | Ensure the application has a Federated Identity Credentia... | 🟢 8.5 | ADO Wiki |
| 14 | AADSTS7002131: No matching federated identity record found for presented asse... | The claimsMatchingExpression defined on the Flexible FIC ... | 1) Use ASC Authentication Diagnostics to view the actual ... | 🟢 8.5 | ADO Wiki |
| 15 | AADSTS7002241: Issuer '{issuer}' may not use credentials matching via express... | The identity provider issuer used in the FIC is not in th... | Verify the issuer is one of the supported issuers: GitHub... | 🟢 8.5 | ADO Wiki |
| 16 | AADSTS700235: The federated identity credentials flow does not support creden... | Flexible FIC is being used on a resource type that does n... | Use Flexible FIC only on Application objects (App Registr... | 🟢 8.5 | ADO Wiki |
| 17 | AADSTS700237: Federated Identity Credential expression not allowed (Federated... | The expression used in the Flexible FIC contains unsuppor... | Review the supported operators per issuer and adjust the ... | 🟢 8.5 | ADO Wiki |
| 18 | AADSTS700233: Federated Identity Credential expression parsing failed (Federa... | The claimsMatchingExpression syntax is invalid and cannot... | Verify expression follows the pattern: claims['claimName'... | 🟢 8.5 | ADO Wiki |
| 19 | AADSTS700234: Federated Identity Credential expression evaluation failed (Fed... | The claimsMatchingExpression parsed successfully but fail... | Verify that claim types match the expected types for the ... | 🟢 8.5 | ADO Wiki |
| 20 | AADSTS1100001 or AADSTS1100000 error during sign-in to an application with cu... | Custom claims provider API endpoint error or misconfigura... | Check sign-in logs > Authentication events tab. If 100300... | 🟢 8.5 | ADO Wiki |
| 21 | AADSTS1100001 or AADSTS1100000 error during sign-in when custom claims provid... | The custom claims provider API endpoint is returning erro... | 1) Check Sign-in logs > 'Authentication events' tab for t... | 🟢 8.5 | ADO Wiki |
| 22 | ASP.NET/ASP.NET Core web app generates HTTP redirect_uri instead of HTTPS whe... | Web server generates redirect_uri from incoming request s... | ASP.NET Core: app.UseHsts() + app.UseForwardedHeaders(XFo... | 🟢 8.5 | ADO Wiki |
| 23 | User gets "You do not have permission to view this directory or page" when au... | Misconfigured Azure AD settings in EasyAuth: invalid or e... | Check EasyAuth authsettings at resources.azure.com: navig... | 🟢 8.5 | ADO Wiki |
| 24 | AADSTS50058 during silent sign-in: "A silent sign-in request was sent but no ... | No active user session in browser for Azure AD. Session c... | Catch InteractionRequiredAuthError and fallback to acquir... | 🟢 8.5 | ADO Wiki |
| 25 | US Government user receives AADSTS900439 (USGClientNotSupportedOnPublicEndpoi... | Azure AD enforces US Gov users to sign in using .us endpo... | Update the application to use the US Government endpoint ... | 🟢 8.5 | ADO Wiki |
| 26 | Public cloud user receives AADSTS900440 (PublicTenantNotSupportedOnUSGovEndpo... | Azure AD blocks public cloud users from authenticating vi... | Application must send public cloud users to https://login... | 🟢 8.5 | ADO Wiki |
| 27 | AADSTS900439 USGClientNotSupportedOnPublicEndpoint: US Government users recei... | Azure AD enforces requirement that US Gov users sign in u... | 1) If app owned by Microsoft: file ICM against that produ... | 🟢 8.5 | ADO Wiki |
| 28 | AADSTS900440 PublicTenantNotSupportedOnUSGovEndpoint: Public cloud users rece... | Azure AD blocks public cloud users from signing into apps... | Application must be updated to support public cloud users... | 🟢 8.5 | ADO Wiki |
| 29 | USGov application users get AADSTS900439 (USGClientNotSupportedOnPublicEndpoi... | Azure AD enforces that US Government users must sign in u... | 1) Customer-owned app: update to use login.microsoftonlin... | 🟢 8.5 | ADO Wiki |
| 30 | Public cloud users get AADSTS900440 (PublicTenantNotSupportedOnUSGovEndpoint)... | Azure AD blocks public cloud users from signing into apps... | Application must send users to the correct login endpoint... | 🟢 8.5 | ADO Wiki |
