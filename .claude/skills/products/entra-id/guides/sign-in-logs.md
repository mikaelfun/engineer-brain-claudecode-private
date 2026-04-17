# ENTRA-ID Sign-in Logs & AADSTS Errors — Quick Reference

**Entries**: 121 | **21V**: Partial (111/121)
**Last updated**: 2026-04-07
**Keywords**: sign-in-logs, aadsts, fic, conditional-access, national-cloud, ests

> This topic has a fusion guide with detailed troubleshooting flow
> → [Full troubleshooting flow](details/sign-in-logs.md)

## Issue Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | App-to-app authentication (OAuth 2.0 Client Credentials flow) fails cross-tenant. Error includes ... | Entra ID SP-Less auth block rolled out in two phases: Step 1 (Feb 23) blocked... | (1) App developers: request tenant admin to install app as Enterprise App or ... | 🟢 9.5 | ADO Wiki |
| 2 📋 | Sign-in logs show Join Type as digit instead of text in Entra Portal | Display bug - Join Type not mapping numeric value to string | Resolved Nov 4 2025 (ICM 701609121) | 🟢 8.5 | ADO Wiki |
| 3 📋 | AADSTS293004: The target-device identifier in the request was not found in the tenant - when usin... | Computer name entered in mstsc does not match AAD device hostnames attribute.... | 1. Use exact AAD device name (short name) in mstsc. 2. Or add Primary DNS Suf... | 🟢 8.5 | ADO Wiki |
| 4 📋 | AADSTS700213 error for Federated Identity Credential (FIC) authentication. The subject claim in t... | Federated Identity Credential subject matching is case-sensitive. The subject... | Use the FIC-Finder PowerShell script to enumerate all applications and their ... | 🟢 8.5 | ADO Wiki |
| 5 📋 | AADSTS700213 for Federated Identity Credential (FIC): subject claim mismatch despite visually ide... | FIC subject matching is case-sensitive. Token subject has different casing th... | Use FIC-Finder script to enumerate all apps and FIC subjects, search case-ins... | 🟢 8.5 | ADO Wiki |
| 6 📋 | Sign-in logs show Service Principal ID as 00000000-0000-0000-0000-000000000000 for certain app si... | SP-Less clients don't have a Service Principal in the tenant, so the SP ID sh... | No security or functionality issue. To improve visibility and log consistency... | 🟢 8.5 | ADO Wiki |
| 7 📋 | AADSTS700211 when using az login --federated-token for cross-tenant managed identity. PowerShell ... | Azure CLI federated-token expects MSI OIDC token, not access token. Different... | Pass MSI token to az login --federated-token, not the access token from targe... | 🟢 8.5 | ADO Wiki |
| 8 📋 | AADSTS50012 error and authentication loop in Edge when accessing applications; tenant has Alterna... | Bug in login flow when AlternateIdLogin is enabled and multiple user credenti... | Try different browser or clear Edge cookies/sessions. PG tracking the fix. | 🟢 8.5 | ADO Wiki |
| 9 📋 | AADSTS53003 for workload identity blocked by CA | CA policy blocks SP sign-in from untrusted location. | Identify CA policy from capolids claim. Add SP IP to excluded Named Location. | 🟢 8.5 | ADO Wiki |
| 10 📋 | AADSTS50012 error and auth loop in Edge with AlternateID enabled | Bug when AlternateIdLogin enabled and multiple credentials present (Bug 2914950) | Use different browser or clear Edge cookies. PG tracking fix. | 🟢 8.5 | ADO Wiki |
| 11 📋 | [Resolved] Sign-in logs in Entra Portal show Join Type as a digit (number) instead of text string... | Engineering bug in Sign-in logs rendering of Join Type field | [Resolved] Engineering fix released November 4, 2025. Reference: IcM 70160912... | 🟢 8.5 | ADO Wiki |
| 12 📋 | SSO sign-in fails with AADSTS50105: User is not assigned to a role for the application; 'Assignme... | The 'Assignment required' setting is enabled on the Enterprise Application bu... | 1. Assign the user or group via Enterprise Apps > Users and Groups > Assign u... | 🟢 8.5 | ADO Wiki |
| 13 📋 | AADSTS7000226: No federated identity credential policy found on application ({appid}). The client... | The application ID in the cross-tenant CMK request does not have a federated ... | Ensure the application has a Federated Identity Credential (FIC) policy appli... | 🟢 8.5 | ADO Wiki |
| 14 📋 | AADSTS7002131: No matching federated identity record found for presented assertion subject '{subj... | The claimsMatchingExpression defined on the Flexible FIC does not match the c... | 1) Use ASC Authentication Diagnostics to view the actual subject claim presen... | 🟢 8.5 | ADO Wiki |
| 15 📋 | AADSTS7002241: Issuer '{issuer}' may not use credentials matching via expression (FederatedIdenti... | The identity provider issuer used in the FIC is not in the supported list for... | Verify the issuer is one of the supported issuers: GitHub (https://token.acti... | 🟢 8.5 | ADO Wiki |
| 16 📋 | AADSTS700235: The federated identity credentials flow does not support credentials matching via e... | Flexible FIC is being used on a resource type that does not yet support it. I... | Use Flexible FIC only on Application objects (App Registrations). For Managed... | 🟢 8.5 | ADO Wiki |
| 17 📋 | AADSTS700237: Federated Identity Credential expression not allowed (FederatedIdentityCredentialEx... | The expression used in the Flexible FIC contains unsupported operators or cla... | Review the supported operators per issuer and adjust the expression. Ensure o... | 🟢 8.5 | ADO Wiki |
| 18 📋 | AADSTS700233: Federated Identity Credential expression parsing failed (FederatedIdentityCredentia... | The claimsMatchingExpression syntax is invalid and cannot be parsed. Common i... | Verify expression follows the pattern: claims['claimName'] operator 'comparan... | 🟢 8.5 | ADO Wiki |
| 19 📋 | AADSTS700234: Federated Identity Credential expression evaluation failed (FederatedIdentityCreden... | The claimsMatchingExpression parsed successfully but failed during runtime ev... | Verify that claim types match the expected types for the operator being used.... | 🟢 8.5 | ADO Wiki |
| 20 📋 | AADSTS1100001 or AADSTS1100000 error during sign-in to an application with custom claims provider... | Custom claims provider API endpoint error or misconfiguration. Error codes 10... | Check sign-in logs > Authentication events tab. If 1003001/1003000: file CRI ... | 🟢 8.5 | ADO Wiki |
| 21 📋 | AADSTS1100001 or AADSTS1100000 error during sign-in when custom claims provider (custom authentic... | The custom claims provider API endpoint is returning errors, timing out, or r... | 1) Check Sign-in logs > 'Authentication events' tab for the client applicatio... | 🟢 8.5 | ADO Wiki |
| 22 📋 | ASP.NET/ASP.NET Core web app generates HTTP redirect_uri instead of HTTPS when authenticating wit... | Web server generates redirect_uri from incoming request scheme which is HTTP ... | ASP.NET Core: app.UseHsts() + app.UseForwardedHeaders(XForwardedFor/XForwarde... | 🟢 8.5 | ADO Wiki |
| 23 📋 | User gets "You do not have permission to view this directory or page" when authenticating to Azur... | Misconfigured Azure AD settings in EasyAuth: invalid or expired client secret... | Check EasyAuth authsettings at resources.azure.com: navigate to Config/authse... | 🟢 8.5 | ADO Wiki |
| 24 📋 | AADSTS50058 during silent sign-in: "A silent sign-in request was sent but no user is signed in." ... | No active user session in browser for Azure AD. Session cookies blocked by IT... | Catch InteractionRequiredAuthError and fallback to acquireTokenPopup. Ensure ... | 🟢 8.5 | ADO Wiki |
| 25 📋 | US Government user receives AADSTS900439 (USGClientNotSupportedOnPublicEndpoint) when signing int... | Azure AD enforces US Gov users to sign in using .us endpoints only. Applicati... | Update the application to use the US Government endpoint https://login.micros... | 🟢 8.5 | ADO Wiki |
| 26 📋 | Public cloud user receives AADSTS900440 (PublicTenantNotSupportedOnUSGovEndpoint) when accessing ... | Azure AD blocks public cloud users from authenticating via USGov endpoints. T... | Application must send public cloud users to https://login.microsoftonline.com... | 🟢 8.5 | ADO Wiki |
| 27 📋 | AADSTS900439 USGClientNotSupportedOnPublicEndpoint: US Government users receive error when signin... | Azure AD enforces requirement that US Gov users sign in using .us endpoint (l... | 1) If app owned by Microsoft: file ICM against that product team. 2) If 3rd p... | 🟢 8.5 | ADO Wiki |
| 28 📋 | AADSTS900440 PublicTenantNotSupportedOnUSGovEndpoint: Public cloud users receive error when signi... | Azure AD blocks public cloud users from signing into apps hosted in US Govern... | Application must be updated to support public cloud users explicitly by hosti... | 🟢 8.5 | ADO Wiki |
| 29 📋 | USGov application users get AADSTS900439 (USGClientNotSupportedOnPublicEndpoint) when signing in ... | Azure AD enforces that US Government users must sign in using the .us endpoin... | 1) Customer-owned app: update to use login.microsoftonline.us authority per n... | 🟢 8.5 | ADO Wiki |
| 30 📋 | Public cloud users get AADSTS900440 (PublicTenantNotSupportedOnUSGovEndpoint) when signing into a... | Azure AD blocks public cloud users from signing into apps hosted in US Govern... | Application must send users to the correct login endpoint. Host two versions ... | 🟢 8.5 | ADO Wiki |
| 31 📋 | Sign-in logs in customer Log Analytics workspace show timestamps with >2 hour delay from original... | The ingestion pipeline (UDI) processed logs normally; the delay occurs at the... | Query IdxIngestion table (idsharedwus cluster) with correlation ID. If Latenc... | 🟢 8.5 | ADO Wiki |
| 32 📋 | Sign-in/audit logs show >2 hour processing latency in IdxIngestion table (Latency column shows th... | UDI log processing delay at the Reporting and Audit Insights pipeline level; ... | Query IdxIngestion (idsharedwus cluster) to confirm ProcessingDuration/Latenc... | 🟢 8.5 | ADO Wiki |
| 33 📋 | Sign-in or audit log event cannot be found in IdxIngestion table when queried by correlation ID a... | The log event was never received or processed by the UDI pipeline; possible u... | Confirm correlation ID, tenant ID, and timestamps are correct and in UTC. If ... | 🟢 8.5 | ADO Wiki |
| 34 📋 | Entra log event (sign-in, audit, managed identity, service principal, or Graph activity) is missi... | Data flow issue between Entra reporting pipeline and Azure Monitor diagnostic... | Verify diagnostic settings are configured. Query IdxIngestion (idsharedwus, d... | 🟢 8.5 | ADO Wiki |
| 35 📋 | Admin cannot see sign-ins for Password-based SSO application in Entra ID sign-in logs | Password-based SSO apps use IAMUX (Microsoft App Access Panel) as the client ... | Check sign-ins for "Microsoft App Access Panel" application, then add filter ... | 🟢 8.5 | ADO Wiki |
| 36 📋 | Part of the IP address shows as .XXX (redacted) in Entra ID sign-in logs | Azure AD redacts part of IP addresses for privacy in cross-tenant sign-ins or... | This is expected behavior. IP redaction occurs in cross-tenant scenarios (e.g... | 🟢 8.5 | ADO Wiki |
| 37 📋 | Identity Protection Risky Detections shows a different IP address than what appears in the sign-i... | MFA sign-ins aggregate multiple sub-events (browser + phone MFA challenge) wi... | Expected behavior. MFA spans multiple clients (PC browser + phone) which may ... | 🟢 8.5 | ADO Wiki |
| 38 📋 | Sign-ins from a user who does not belong to the tenant appear in the tenant sign-in logs | The user is a pass-through user (UserIsPassthru=1) who signed into a resource... | Check sign-in log in ASC > click Troubleshoot this sign-in > Expert View PerR... | 🟢 8.5 | ADO Wiki |
| 39 📋 | Location information is missing for some entries in Entra ID sign-in logs (both failed and succes... | For failed events: location is populated late in the sign-in workflow; early ... | For failed sign-ins: by design when failure occurs before location processing... | 🟢 8.5 | ADO Wiki |
| 40 📋 | Sign-in logs in Azure Monitor (Log Analytics) show timestamps >2 hours delayed from original even... | UDI (central log processor) adds processing latency between ingestion partner... | Query idsharedwus/Idxingestion table with correlationId to check env_time, Lo... | 🟢 8.5 | ADO Wiki |
| ... | *81 more entries* | | | | |

## Quick Troubleshooting Path

1. Check **fic** related issues (8 entries) `[ado-wiki]`
2. Check **flexible-fic** related issues (6 entries) `[ado-wiki]`
3. Check **sign-in-logs** related issues (3 entries) `[ado-wiki]`
4. Check **sp-less-authentication** related issues (2 entries) `[ado-wiki]`
5. Check **join-type** related issues (2 entries) `[ado-wiki]`
6. Check **federated-identity-credential** related issues (2 entries) `[ado-wiki]`
7. Check **aadsts700213** related issues (2 entries) `[ado-wiki]`
8. Check **case-sensitivity** related issues (2 entries) `[ado-wiki]`
