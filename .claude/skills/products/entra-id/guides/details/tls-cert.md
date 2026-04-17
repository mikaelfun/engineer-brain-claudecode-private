# ENTRA-ID TLS/Certificate Infrastructure — Detailed Troubleshooting Guide

**Entries**: 23 | **Drafts fused**: 3 | **Kusto queries**: 0
**Draft sources**: ado-wiki-c-rds-tls-certificate-enrollment.md, ado-wiki-d-decrypting-tls-windows10.md, ado-wiki-e-meds-tls-deprecation.md
**Generated**: 2026-04-07

---

## Phase 1: Aadds
> 3 related entries

### Entra Domain Services (AADDS) may stop working after TLS 1.0/1.1 deprecation. Need to identify apps/clients still using deprecated TLS versions.
**Score**: 🟢 10.0 | **Source**: OneNote

**Root Cause**: Microsoft deprecated TLS 1.0/1.1 for Entra Domain Services. Apps authenticating with older TLS versions will fail. Cannot identify source machine/IP, only app name visible in Data2 column.

**Solution**: Check Jarvis telemetry (Geneva shortlink CFDC69AA) to identify TLS 1.0/1.1 traffic. Apps in Data2 column need TLS 1.2 upgrade. ADO Wiki: AzureAD/_wiki/2201046/TLS-1.0-1.1-Deprecation-For-Entra-Domain-Services. PG notifies impacted tenants via ICM.

---

### Applications authenticating against MEDS fail after TLS 1.0/1.1 enforcement (deprecated Aug 31, 2025). ~667 tenants had active legacy TLS applicati...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Azure-wide TLS 1.0/1.1 deprecation. Apps using legacy TLS protocols cannot authenticate to MEDS DCs after TLS 1.2 Only mode enforced.

**Solution**: Identify legacy TLS clients via DGrep query (portal.microsoftgeneva.com/s/9450C455) filtered by tenantID. Data2 column shows app names. Enable TLS 1.2 Only mode to test. Extensions: S500=90d via CSAM, active-app=90d, no-legacy=30d.

---

### Applications fail authentication after TLS 1.0/1.1 is deprecated/disabled for Microsoft Entra Domain Services (deadline August 31, 2025)
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: TLS 1.0/1.1 deprecation enforced for MEDS. Apps using legacy TLS cannot authenticate after TLS12Only mode enabled. Approx 667 tenants had active apps on legacy TLS at announcement

**Solution**: Identify affected apps via DGrep query (portal.microsoftgeneva.com/s/9450C455, filter by tenantID+timestamp). Migrate to TLS 1.2 per docs. S500 customers: 90-day extension via CSAM/support ticket. Non-S500 with active apps: 90-day extension on request. Rollback: disable TLS12Only mode temporarily while remediating

---

## Phase 2: Application Proxy
> 3 related entries

### Microsoft Entra Application Proxy returns BadGateway with SSL certificate error: 'One or more errors were found in the Secure Sockets Layer (SSL) c...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The App Proxy connector cannot negotiate the SSL/TLS session with the backend server. Common causes: (1) TLS protocol/cipher suite mismatch, (2) expired or untrusted SSL certificate on backend, (3) certificate subject/SAN doesn't match internal URL hostname, (4) backend certificate validation enabled (isBackendCertificateValidationEnabled=true, default since June 2021 for new apps) and cert fails validation, (5) backend requires TLS 1.3 but connector runs on Windows Server older than 2022.

**Solution**: 1) Temporarily disable backend cert validation via MS Graph to isolate the issue. 2) Ensure cert subject/SAN covers the internal URL hostname (note: *.domain.com does NOT cover app.sub.domain.com). 3) Verify cert is not expired. 4) Install root/intermediate CA certs in connector's certificate store (certlm.msc). 5) For TLS 1.3, upgrade connector to Windows Server 2022+. 6) If connector and app are on same server, verify IIS HTTPS binding listens on all unassigned IPs.

---

### App Proxy Connector installation or registration fails with SSL/TLS certificate validation errors or cannot establish secure connection to registra...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Missing DigiCert root CA certificates in the local computer Root Certification Authorities store, or incorrect TLS settings on the connector server.

**Solution**: Install required root CAs in certlm.msc: (1) DigiCert Global Root G2 (thumbprint: df3c24f9bfd666761b268073fe06d1cc8d4f82a4), (2) DigiCert Global Root CA (thumbprint: a8985d3a65e5e5c4b2d7d66d40c6dd2fb19c5436). Also verify TLS settings per Microsoft TLS enforcement reference.

---

### After TLS hardening (migration to TLS 1.2-only scale unit) for Application Proxy endpoints, clients using TLS 1.0/1.1 cannot access apps. Custom do...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: App Proxy endpoint moved to TLS 1.2-only scale unit via DNS change. TLS 1.0/1.1 clients cannot negotiate. Custom domain apps with stale CNAME still resolve to old endpoint.

**Solution**: 1) Ensure clients support TLS 1.2 before move. 2) Customer confirms, provides 3+ PST appointments for PG. 3) DNS change ~15 min. 4) Verify via SSLLabs. 5) Update CNAME for custom domains. 6) Rollback possible. 7) Ping hostname to verify *.msappproxy.net.

---

## Phase 3: Dotnet
> 2 related entries

### .NET app throws SocketException 'SSL connection could not be established' or 'existing connection forcibly closed by remote host' when calling Grap...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: TLS protocol misconfiguration, insufficient connection limits (default ServicePointManager.DefaultConnectionLimit=2), or firewall/application gateway blocking connections

**Solution**: Add ServicePointManager config: DefaultConnectionLimit=200, Expect100Continue=true, SecurityProtocol=Tls|Tls11|Tls12. Review firewall and application gateway logs.

---

### .NET app throws 'System.Net.WebException: The request was aborted: Could not create SSL/TLS secure channel' calling Azure AD or Graph endpoints
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Application not configured to use TLS 1.2 or required TLS versions; SSL/TLS mismatch between client and server

**Solution**: Set SecurityProtocol to include TLS 1.2: ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls | SecurityProtocolType.Tls11 | SecurityProtocolType.Tls12 | SecurityProtocolType.Ssl3

---

## Phase 4: Microsoft Identity Web
> 2 related entries

### Microsoft Identity Web throws 'Unable to retrieve document from...' or 'Unable to obtain configuration from...' metadata endpoint error
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Application is not using TLS 1.2 or higher, or the app is behind a proxy that blocks outbound requests to the OpenID configuration endpoint.

**Solution**: Option 1: Set ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12 in Global.asax.cs. Option 2: Target .NET 4.7.2 in web.config. For proxy: configure BackchannelHttpHandler with WebProxy in MicrosoftIdentityOptions via services.PostConfigure<MicrosoftIdentityOptions>.

---

### Unable to retrieve document from or Unable to obtain configuration from error in Microsoft Identity Web / OpenID Connect
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: App not using TLS 1.2 or higher, or app is behind a proxy blocking outbound HTTPS to the OpenID Connect metadata endpoint

**Solution**: For TLS: add ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12 in Application_Start or set httpRuntime targetFramework=4.7.2. For proxy: configure BackchannelHttpHandler with WebProxy in PostConfigure<MicrosoftIdentityOptions>. Also check firewall rules.

---

## Phase 5: Authentication
> 2 related entries

### Certificate validation failures or connectivity disruptions to Azure services (including Azure SQL) after October 1, 2025. Custom TLS implementatio...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: MSPKI OCSP responders removed nonce extension support starting October 1, 2025 (RFC 5019/6960 alignment). OCSP responses valid but nonce ignored. Legacy OneOCSP service retired. Custom clients enforcing nonce match reject response. Risk from outdated libraries, inherited configs, or 3P integrations relying on deprecated OCSP behavior.

**Solution**: Review revocation logic to ensure clients do not reject OCSP responses lacking nonce. Notify downstream partners. Standard TLS stacks (Windows, OpenSSL, Chrome, Edge, Firefox) NOT impacted. Only MSPKI certificates affected - DigiCert/private/AME PKI unaffected. Use PKI team TSG. ICM: MS PKI Incident DRI.

---

### Authentication failures to Microsoft Entra services (login.microsoftonline.com, login.live.com, login.windows.net, autologon.microsoftazuread-sso.c...
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: Microsoft migrating DigiCert certificates from G1 root CA (DigiCert Global Root CA) to G2 root CA (DigiCert Global Root G2) for improved security and compliance. Affects DigiCert, DigiCert EV, Thawte, Thawte EV, GeoTrust, GeoTrust EV, and RapidSSL certificate families. Clients with certificate pinning to G1 or missing G2 trust anchors will fail validation.

**Solution**: Trust all Root and Subordinate CAs listed in Azure Certificate Authority details (https://learn.microsoft.com/azure/security/fundamentals/azure-ca-details). Trust DigiCert Global Root G2 and its subordinate CAs. Remove client-side pinning to DigiCert Global Root CA. Ensure pinned certificates can be updated on short notice (24hr per CA/Browser Forum). ICM: AAD Gateway/Gateway.

---

## Phase 6: Verified Id
> 1 related entries

### Verified ID: DID registration / domain verification fails. HTTPS issues with did-configuration.json hosting. SSL certificate errors in Postman.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: HTTPS not properly configured on site hosting did-configuration.json; unsupported SSL certificate (wildcard GoDaddy certs, LetsEncrypt); or Azure CDN Custom domain HTTPS not enabled.

**Solution**: Verify https://{domain}/.well-known/did-configuration.json is accessible. Test with Postman (SSL check enabled). For Azure CDN: enable Custom domain HTTPS (8hr cooldown). Check supported SSL cert.

---

## Phase 7: Throttling
> 1 related entries

### TCP RST (connection reset) after ~120 seconds idle on connections to Entra endpoints, causing intermittent failures confused with throttling
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: Azure/Entra platform closes HTTP connections idle for approximately 2 minutes (expected server behavior). Not throttling but idle connection cleanup.

**Solution**: Avoid leaving HTTP connections idle for ~2 minutes. Reuse HTTP client connection pools correctly. If no HTTP 429 evidence, investigate caching/retry and network path (proxy/firewall/TLS interception) before assuming throttling.

---

## Phase 8: Java
> 1 related entries

### Java application fails with PKIX path building failed: SunCertPathBuilderException: unable to find valid certification path to requested target whe...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Java truststore/keystore is missing root CA certificates for Microsoft gateway servers. May also occur behind a proxy whose SSL certificates are not imported into Java truststore.

**Solution**: Import Microsoft root certificates into Java truststore: keytool -importcert -file cert.crt -keystore cacerts -alias mycert -storepass changeit. Verify Azure TLS root certs per learn.microsoft.com/azure/security/fundamentals/tls-certificate-changes. For proxy: import proxy root cert. Debug with -Djavax.net.debug=all. Default truststore: Windows C:/Program Files/Java/jre/lib/security/cacerts, Linux /etc/pki/java/cacerts.

---

## Phase 9: Msal.Net
> 1 related entries

### MSAL.NET browser-based authentication dialog fails with error: the server or proxy was not found
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Network connectivity issue - proxy misconfiguration or TLS 1.2 not enabled on the client machine

**Solution**: Check proxy settings (netsh winhttp show proxy), enable TLS 1.2 in Internet Options and registry via PowerShell script, restart. Review Fiddler capture for proxy errors.

---

## Phase 10: Mfa Server
> 1 related entries

### MFA Server stops servicing user sign-ins after TLS 1.0/1.1 deprecation (Feb 28, 2022). MFA authentication requests fail silently.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Azure MFA backend deprecated TLS 1.0/1.1 connections. MFA Server communicating using old TLS versions can no longer reach the backend.

**Solution**: Verify customer is on the TLS 1.0/1.1 deprecation impact list. Upgrade MFA Server and OS to support TLS 1.2. Ensure .NET Framework 4.6+ and registry settings enforce TLS 1.2.

---

## Phase 11: B2C
> 1 related entries

### B2C users or applications receive 426 error This service requires use of the TLS-1.2 protocol after April 30 2023
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Azure AD B2C enforced deprecation of TLS 1.0, TLS 1.1, and 3DES cipher suite TLS_RSA_WITH_3DES_EDE_CBC_SHA on April 30 2023

**Solution**: Update all client applications to use TLS 1.2 for connections to B2C endpoints. Update federated identity providers to support TLS 1.2. Use Kusto on AADGatewayProd.AllRequestSummaryEvents filtering CryptProtocol == Tls or Tls11 to identify legacy TLS usage. Hard enforcement deadline was May 31 2023.

---

## Phase 12: Certificate Authority
> 1 related entries

### Authentication to login.microsoftonline.com fails with SSL/TLS certificate validation errors after Microsoft introduces new Azure Certificate Autho...
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: Microsoft implements new Azure CAs for login.microsoftonline.com. Systems with outdated OS, custom trust stores, disconnected environments, or unsupported platforms may not trust new Azure CAs. Min versions: Windows XP SP3, Firefox 32, iOS 7, macOS 10.9, Android SDK 5.x, Java JRE 1.8.0_101.

**Solution**: 1) Update to supported OS. 2) If cannot update, manually add Azure CAs to trusted root store. 3) Linux: add CAs to /etc/ssl/certs. 4) Java: update key store. 5) Immediate mitigation: update hosts file for login.microsoftonline.com to DigiCert-only IPs: EU=20.190.177.19, APAC=20.190.141.32, NA=20.190.152.19. Ref: https://learn.microsoft.com/en-us/azure/security/fundamentals/azure-ca-details

---

## Phase 13: Ldap Channel Binding
> 1 related entries

### LDAP over SSL/TLS authentication fails; Event ID 3039 (client does not support CBT) or Event ID 3040 (channel binding failure/token mismatch) logge...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Client application or device does not support LDAP Channel Binding Tokens (CBT), or a TLS-terminating intermediary device (load balancer, reverse proxy) breaks the channel binding by establishing a new TLS session to the DC

**Solution**: 1) Identify affected clients from Event 3039/3040 details. 2) Update clients/applications to support CBT. 3) Check for TLS-terminating network devices between client and DC; configure them for TLS pass-through. 4) If client cannot be updated, temporarily set Domain controller: LDAP server channel binding token requirements to When Supported instead of Always. 5) Mac/Linux clients: verify CBT support per vendor docs.

---

## Phase 14: Rds
> 1 related entries

### Remote Desktop Services TLS connection fails after certificate renewal period - users unable to connect to RDS server, SSLCertificateSHA1Hash in WM...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: RDS Authentication certificate template configured for autoenrollment. Autoenrollment archives existing certificate, causing SessionEnv service to lose its configured certificate thumbprint (SSLCertificateSHA1Hash mismatch). Network Service account may also lack private key Read permission when certificate obtained via autoenrollment.

**Solution**: Configure RDS certificate via Group Policy: Computer Configuration > Administrative Templates > Windows Components > Remote Desktop Services > Remote Desktop Session Host > Security > Server authentication certificate template. Use Template Name (not Display Name). Set template permission to Allow Enroll only - DO NOT enable Autoenroll. Template EKU should be Remote Desktop Authentication (OID 1.3.6.1.4.1.311.54.1.2) only, not Server Authentication.

---

## Phase 15: Group Policy
> 1 related entries

### TLS connections intermittently fail due to cipher suite configuration randomly resetting. The SSL Cipher Suite Order registry value under HKLM\SOFT...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: A Group Policy Preference item targets the same registry key (Functions under SSL\00010002) as an Administrative Template. The Registry CSE processes first (setting Admin Template value), then the Group Policy Registry CSE may or may not overwrite it depending on the NoGPOListChanges flag. When no GPO changes are detected and NoGPOListChanges=1, the Preference item skips processing, leaving the correct Admin Template value. On forced refreshes, the Preference item overwrites it.

**Solution**: Never use GP Preference items to target group policy registry locations (including Windows Settings\Local Policies\Security Options). Remove the conflicting Preference item and use only Administrative Templates for cipher suite ordering. Enable GP debug logging (gpsvc.log) to diagnose CSE processing order conflicts.

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Entra Domain Services (AADDS) may stop working after TLS 1.0/1.1 deprecation.... | Microsoft deprecated TLS 1.0/1.1 for Entra Domain Service... | Check Jarvis telemetry (Geneva shortlink CFDC69AA) to ide... | 🟢 10.0 | OneNote |
| 2 | Verified ID: DID registration / domain verification fails. HTTPS issues with ... | HTTPS not properly configured on site hosting did-configu... | Verify https://{domain}/.well-known/did-configuration.jso... | 🟢 8.5 | ADO Wiki |
| 3 | .NET app throws SocketException 'SSL connection could not be established' or ... | TLS protocol misconfiguration, insufficient connection li... | Add ServicePointManager config: DefaultConnectionLimit=20... | 🟢 8.5 | ADO Wiki |
| 4 | .NET app throws 'System.Net.WebException: The request was aborted: Could not ... | Application not configured to use TLS 1.2 or required TLS... | Set SecurityProtocol to include TLS 1.2: ServicePointMana... | 🟢 8.5 | ADO Wiki |
| 5 | Java application fails with PKIX path building failed: SunCertPathBuilderExce... | Java truststore/keystore is missing root CA certificates ... | Import Microsoft root certificates into Java truststore: ... | 🟢 8.5 | ADO Wiki |
| 6 | MSAL.NET browser-based authentication dialog fails with error: the server or ... | Network connectivity issue - proxy misconfiguration or TL... | Check proxy settings (netsh winhttp show proxy), enable T... | 🟢 8.5 | ADO Wiki |
| 7 | Microsoft Identity Web throws 'Unable to retrieve document from...' or 'Unabl... | Application is not using TLS 1.2 or higher, or the app is... | Option 1: Set ServicePointManager.SecurityProtocol = Secu... | 🟢 8.5 | ADO Wiki |
| 8 | Unable to retrieve document from or Unable to obtain configuration from error... | App not using TLS 1.2 or higher, or app is behind a proxy... | For TLS: add ServicePointManager.SecurityProtocol = Secur... | 🟢 8.5 | ADO Wiki |
| 9 | Applications authenticating against MEDS fail after TLS 1.0/1.1 enforcement (... | Azure-wide TLS 1.0/1.1 deprecation. Apps using legacy TLS... | Identify legacy TLS clients via DGrep query (portal.micro... | 🟢 8.5 | ADO Wiki |
| 10 | Applications fail authentication after TLS 1.0/1.1 is deprecated/disabled for... | TLS 1.0/1.1 deprecation enforced for MEDS. Apps using leg... | Identify affected apps via DGrep query (portal.microsoftg... | 🟢 8.5 | ADO Wiki |
| 11 | MFA Server stops servicing user sign-ins after TLS 1.0/1.1 deprecation (Feb 2... | Azure MFA backend deprecated TLS 1.0/1.1 connections. MFA... | Verify customer is on the TLS 1.0/1.1 deprecation impact ... | 🟢 8.5 | ADO Wiki |
| 12 | B2C users or applications receive 426 error This service requires use of the ... | Azure AD B2C enforced deprecation of TLS 1.0, TLS 1.1, an... | Update all client applications to use TLS 1.2 for connect... | 🟢 8.5 | ADO Wiki |
| 13 | Certificate validation failures or connectivity disruptions to Azure services... | MSPKI OCSP responders removed nonce extension support sta... | Review revocation logic to ensure clients do not reject O... | 🟢 8.5 | ADO Wiki |
| 14 | Microsoft Entra Application Proxy returns BadGateway with SSL certificate err... | The App Proxy connector cannot negotiate the SSL/TLS sess... | 1) Temporarily disable backend cert validation via MS Gra... | 🟢 8.5 | ADO Wiki |
| 15 | App Proxy Connector installation or registration fails with SSL/TLS certifica... | Missing DigiCert root CA certificates in the local comput... | Install required root CAs in certlm.msc: (1) DigiCert Glo... | 🟢 8.5 | ADO Wiki |
| 16 | After TLS hardening (migration to TLS 1.2-only scale unit) for Application Pr... | App Proxy endpoint moved to TLS 1.2-only scale unit via D... | 1) Ensure clients support TLS 1.2 before move. 2) Custome... | 🟢 8.5 | ADO Wiki |
| 17 | LDAP over SSL/TLS authentication fails; Event ID 3039 (client does not suppor... | Client application or device does not support LDAP Channe... | 1) Identify affected clients from Event 3039/3040 details... | 🟢 8.5 | ADO Wiki |
| 18 | Remote Desktop Services TLS connection fails after certificate renewal period... | RDS Authentication certificate template configured for au... | Configure RDS certificate via Group Policy: Computer Conf... | 🟢 8.5 | ADO Wiki |
| 19 | TLS connections intermittently fail due to cipher suite configuration randoml... | A Group Policy Preference item targets the same registry ... | Never use GP Preference items to target group policy regi... | 🟢 8.5 | ADO Wiki |
| 20 | TCP RST (connection reset) after ~120 seconds idle on connections to Entra en... | Azure/Entra platform closes HTTP connections idle for app... | Avoid leaving HTTP connections idle for ~2 minutes. Reuse... | 🔵 7.5 | ADO Wiki |
| 21 | Authentication failures to Microsoft Entra services (login.microsoftonline.co... | Microsoft migrating DigiCert certificates from G1 root CA... | Trust all Root and Subordinate CAs listed in Azure Certif... | 🔵 6.5 | ADO Wiki |
| 22 | Authentication to login.microsoftonline.com fails with SSL/TLS certificate va... | Microsoft implements new Azure CAs for login.microsoftonl... | 1) Update to supported OS. 2) If cannot update, manually ... | 🔵 6.5 | ADO Wiki |
| 23 | Application authentication fails with AADSTS1002016 TLS 1.0/1.1 deprecated er... | Microsoft enforced TLS 1.2 starting Jan 31 2022; older .N... | Upgrade to .NET Framework 4.7+, or enable TLS 1.2 program... | 🔵 6.5 | MS Learn |
