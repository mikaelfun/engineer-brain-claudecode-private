# ENTRA-ID TLS/Certificate Infrastructure — Quick Reference

**Entries**: 23 | **21V**: Partial (21/23)
**Last updated**: 2026-04-07
**Keywords**: tls, ssl, deprecation, certificate, aadds, network

> This topic has a fusion guide with detailed troubleshooting flow
> → [Full troubleshooting flow](details/tls-cert.md)

## Issue Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | Entra Domain Services (AADDS) may stop working after TLS 1.0/1.1 deprecation. Need to identify ap... | Microsoft deprecated TLS 1.0/1.1 for Entra Domain Services. Apps authenticati... | Check Jarvis telemetry (Geneva shortlink CFDC69AA) to identify TLS 1.0/1.1 tr... | 🟢 10.0 | OneNote |
| 2 📋 | Verified ID: DID registration / domain verification fails. HTTPS issues with did-configuration.js... | HTTPS not properly configured on site hosting did-configuration.json; unsuppo... | Verify https://{domain}/.well-known/did-configuration.json is accessible. Tes... | 🟢 8.5 | ADO Wiki |
| 3 📋 | .NET app throws SocketException 'SSL connection could not be established' or 'existing connection... | TLS protocol misconfiguration, insufficient connection limits (default Servic... | Add ServicePointManager config: DefaultConnectionLimit=200, Expect100Continue... | 🟢 8.5 | ADO Wiki |
| 4 📋 | .NET app throws 'System.Net.WebException: The request was aborted: Could not create SSL/TLS secur... | Application not configured to use TLS 1.2 or required TLS versions; SSL/TLS m... | Set SecurityProtocol to include TLS 1.2: ServicePointManager.SecurityProtocol... | 🟢 8.5 | ADO Wiki |
| 5 📋 | Java application fails with PKIX path building failed: SunCertPathBuilderException: unable to fin... | Java truststore/keystore is missing root CA certificates for Microsoft gatewa... | Import Microsoft root certificates into Java truststore: keytool -importcert ... | 🟢 8.5 | ADO Wiki |
| 6 📋 | MSAL.NET browser-based authentication dialog fails with error: the server or proxy was not found | Network connectivity issue - proxy misconfiguration or TLS 1.2 not enabled on... | Check proxy settings (netsh winhttp show proxy), enable TLS 1.2 in Internet O... | 🟢 8.5 | ADO Wiki |
| 7 📋 | Microsoft Identity Web throws 'Unable to retrieve document from...' or 'Unable to obtain configur... | Application is not using TLS 1.2 or higher, or the app is behind a proxy that... | Option 1: Set ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls... | 🟢 8.5 | ADO Wiki |
| 8 📋 | Unable to retrieve document from or Unable to obtain configuration from error in Microsoft Identi... | App not using TLS 1.2 or higher, or app is behind a proxy blocking outbound H... | For TLS: add ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls1... | 🟢 8.5 | ADO Wiki |
| 9 📋 | Applications authenticating against MEDS fail after TLS 1.0/1.1 enforcement (deprecated Aug 31, 2... | Azure-wide TLS 1.0/1.1 deprecation. Apps using legacy TLS protocols cannot au... | Identify legacy TLS clients via DGrep query (portal.microsoftgeneva.com/s/945... | 🟢 8.5 | ADO Wiki |
| 10 📋 | Applications fail authentication after TLS 1.0/1.1 is deprecated/disabled for Microsoft Entra Dom... | TLS 1.0/1.1 deprecation enforced for MEDS. Apps using legacy TLS cannot authe... | Identify affected apps via DGrep query (portal.microsoftgeneva.com/s/9450C455... | 🟢 8.5 | ADO Wiki |
| 11 📋 | MFA Server stops servicing user sign-ins after TLS 1.0/1.1 deprecation (Feb 28, 2022). MFA authen... | Azure MFA backend deprecated TLS 1.0/1.1 connections. MFA Server communicatin... | Verify customer is on the TLS 1.0/1.1 deprecation impact list. Upgrade MFA Se... | 🟢 8.5 | ADO Wiki |
| 12 📋 | B2C users or applications receive 426 error This service requires use of the TLS-1.2 protocol aft... | Azure AD B2C enforced deprecation of TLS 1.0, TLS 1.1, and 3DES cipher suite ... | Update all client applications to use TLS 1.2 for connections to B2C endpoint... | 🟢 8.5 | ADO Wiki |
| 13 📋 | Certificate validation failures or connectivity disruptions to Azure services (including Azure SQ... | MSPKI OCSP responders removed nonce extension support starting October 1, 202... | Review revocation logic to ensure clients do not reject OCSP responses lackin... | 🟢 8.5 | ADO Wiki |
| 14 📋 | Microsoft Entra Application Proxy returns BadGateway with SSL certificate error: 'One or more err... | The App Proxy connector cannot negotiate the SSL/TLS session with the backend... | 1) Temporarily disable backend cert validation via MS Graph to isolate the is... | 🟢 8.5 | ADO Wiki |
| 15 📋 | App Proxy Connector installation or registration fails with SSL/TLS certificate validation errors... | Missing DigiCert root CA certificates in the local computer Root Certificatio... | Install required root CAs in certlm.msc: (1) DigiCert Global Root G2 (thumbpr... | 🟢 8.5 | ADO Wiki |
| 16 📋 | After TLS hardening (migration to TLS 1.2-only scale unit) for Application Proxy endpoints, clien... | App Proxy endpoint moved to TLS 1.2-only scale unit via DNS change. TLS 1.0/1... | 1) Ensure clients support TLS 1.2 before move. 2) Customer confirms, provides... | 🟢 8.5 | ADO Wiki |
| 17 📋 | LDAP over SSL/TLS authentication fails; Event ID 3039 (client does not support CBT) or Event ID 3... | Client application or device does not support LDAP Channel Binding Tokens (CB... | 1) Identify affected clients from Event 3039/3040 details. 2) Update clients/... | 🟢 8.5 | ADO Wiki |
| 18 📋 | Remote Desktop Services TLS connection fails after certificate renewal period - users unable to c... | RDS Authentication certificate template configured for autoenrollment. Autoen... | Configure RDS certificate via Group Policy: Computer Configuration > Administ... | 🟢 8.5 | ADO Wiki |
| 19 📋 | TLS connections intermittently fail due to cipher suite configuration randomly resetting. The SSL... | A Group Policy Preference item targets the same registry key (Functions under... | Never use GP Preference items to target group policy registry locations (incl... | 🟢 8.5 | ADO Wiki |
| 20 📋 | TCP RST (connection reset) after ~120 seconds idle on connections to Entra endpoints, causing int... | Azure/Entra platform closes HTTP connections idle for approximately 2 minutes... | Avoid leaving HTTP connections idle for ~2 minutes. Reuse HTTP client connect... | 🔵 7.5 | ADO Wiki |
| 21 📋 | Authentication failures to Microsoft Entra services (login.microsoftonline.com, login.live.com, l... | Microsoft migrating DigiCert certificates from G1 root CA (DigiCert Global Ro... | Trust all Root and Subordinate CAs listed in Azure Certificate Authority deta... | 🔵 6.5 | ADO Wiki |
| 22 📋 | Authentication to login.microsoftonline.com fails with SSL/TLS certificate validation errors afte... | Microsoft implements new Azure CAs for login.microsoftonline.com. Systems wit... | 1) Update to supported OS. 2) If cannot update, manually add Azure CAs to tru... | 🔵 6.5 | ADO Wiki |
| 23 📋 | Application authentication fails with AADSTS1002016 TLS 1.0/1.1 deprecated error or IDX20804/IDX1... | Microsoft enforced TLS 1.2 starting Jan 31 2022; older .NET Framework or plat... | Upgrade to .NET Framework 4.7+, or enable TLS 1.2 programmatically, or set ht... | 🔵 6.5 | MS Learn |

## Quick Troubleshooting Path

1. Check **tls** related issues (12 entries) `[onenote]`
2. Check **ssl** related issues (4 entries) `[ado-wiki]`
3. Check **aadds** related issues (3 entries) `[onenote]`
4. Check **deprecation** related issues (3 entries) `[ado-wiki]`
5. Check **application-proxy** related issues (3 entries) `[ado-wiki]`
6. Check **dotnet** related issues (2 entries) `[ado-wiki]`
7. Check **network** related issues (2 entries) `[ado-wiki]`
8. Check **proxy** related issues (2 entries) `[ado-wiki]`
