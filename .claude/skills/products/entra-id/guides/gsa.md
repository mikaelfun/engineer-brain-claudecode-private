# ENTRA-ID Global Secure Access (GSA) — Quick Reference

**Entries**: 37 | **21V**: Partial (36/37)
**Last updated**: 2026-04-07
**Keywords**: gsa, private-access, conditional-access, known-limitation, connector, tls-inspection

> This topic has a fusion guide with detailed troubleshooting flow
> → [Full troubleshooting flow](details/gsa.md)

## Issue Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | Compliant Network option is greyed out (unavailable) in the Conditional Access portal when creati... | CA signaling is not enabled in the Global Secure Access portal, or the admin ... | Enable CA signaling in Global Secure Access portal (portal.azure.com -> Globa... | 🟢 8.5 | ADO Wiki |
| 2 📋 | Compliant Network condition in Conditional Access policy is not taking effect. Users not blocked ... | One or more prerequisites not met: CA-signaling toggle not enabled in GSA por... | 1) Enable CA-signaling toggle in GSA portal (Global Secure Access -> Global s... | 🟢 8.5 | ADO Wiki |
| 3 📋 | Error "The CA certificate has already been issued" (HTTP 400 BadRequest) when configuring TLS ins... | Certificate name and Common name in TLS inspection CSR request conflict with ... | Supply unique values in Certificate name and Common name fields of the CSR re... | 🟢 8.5 | ADO Wiki |
| 4 📋 | GSA health check for 'NRPT rules set' reports False; Private DNS not working because DNS suffix s... | The single label suffix required by GSA Private DNS is missing from the DNS S... | Run IPCONFIG /ALL to verify DNS Suffix Search List. If suffix is missing, col... | 🟢 8.5 | ADO Wiki |
| 5 📋 | GSA health check 'NRPT rules set' reports False on Windows computers with non-English language se... | Known product bug - the NRPT health check logic fails to parse output correct... | Confirm Private DNS is actually working by verifying DNS suffix search list a... | 🟢 8.5 | ADO Wiki |
| 6 📋 | GSA Threat Intelligence policy not blocking malicious sites immediately after configuration - use... | Security profiles in GSA are enforced via access tokens. New or updated secur... | Wait 60-90 minutes after configuring the Threat Intelligence policy and linki... | 🟢 8.5 | ADO Wiki |
| 7 📋 | GSA Web Category Checker API (Graph beta) returns only one category for a URL even though the URL... | Known limitation - the Web Category Checker tool (microsoft.graph.networkacce... | For full category information, check the Web Category column in GSA Traffic L... | 🟢 8.5 | ADO Wiki |
| 8 📋 | GSA blocks Copilot Studio agent traffic but shows 502 Bad Gateway for HTTP Actions or 403 Forbidd... | Known issue - the block experience for Copilot Studio agents does not yet sho... | This is a known issue and improvements are coming. To verify the block was fr... | 🟢 8.5 | ADO Wiki |
| 9 📋 | GSA security policies linked to Conditional Access security profiles are not applied to Copilot S... | Known limitation - GSA for Copilot Studio Agents only supports the baseline p... | Configure all security policies for Copilot Studio agents (web content filter... | 🟢 8.5 | ADO Wiki |
| 10 📋 | GSA Prompt Shield policy does not detect or block malicious prompts in AI apps that use URL-based... | Known limitation - Prompt Shield currently supports only JSON-based generativ... | Verify the customer AI app uses JSON-based communication. If using Gemini or ... | 🟢 8.5 | ADO Wiki |
| 11 📋 | GSA Prompt Shield does not fully scan long prompts - prompts exceeding 10000 characters are silen... | Known limitation - Prompt Shield supports prompts up to 10000 characters. Any... | Be aware that only the first 10K characters of prompts are scanned. For apps ... | 🟢 8.5 | ADO Wiki |
| 12 📋 | GSA Mac client fails to tunnel FQDN-based traffic when DNS over HTTPS (DoH/Secure DNS) is enabled... | The GSA Mac client relies on DNS interception to capture FQDN-based traffic. ... | Disable DNS over HTTPS on both the browser (Chrome: chrome://settings/securit... | 🟢 8.5 | ADO Wiki |
| 13 📋 | GSA Mac client does not tunnel UDP traffic on ports 80/443 (QUIC protocol) for Internet Access wo... | QUIC protocol is not supported for Internet Access on Mac. Traffic to UDP 80 ... | Disable QUIC protocol on browsers to force fallback to HTTPS over TCP (fully ... | 🟢 8.5 | ADO Wiki |
| 14 📋 | GSA BYOD - B2B Guest access "Switch tenant" option is not visible in the Global Secure Access cli... | Intermittent UI issue in the GSA client where the B2B Guest access switch ten... | Restart the Windows device. After restart, the switch tenant option should be... | 🔵 5.5 | ADO Wiki |
| 15 📋 | GSA DLP/ATP - Alert events appear in Traffic logs but are missing from the Alerts blade in the Gl... | The alert action was logged in traffic logs but the traffic may not have been... | Query TalonOperationEvent table in Kusto (idsharedwus cluster, NaasProd datab... | 🔵 5.5 | ADO Wiki |
| 16 📋 | GSA TLS Inspection - Every TLS connection fails with "Your connection isn't private" (NET::ERR_CE... | The public .cer file for the trusted root certificate configured in GSA Setti... | Download the .CER file from the certificate in the TLS Inspection tab (GSA po... | 🔵 5.5 | ADO Wiki |
| 17 📋 | GSA TLS Inspection - Intune Policy Sync fails with "The sync could not be initiated (0x80190194 N... | Intune sync endpoints (checkin.dm.microsoft.com, r.manage.microsoft.com) are ... | Create a Custom Bypass rule: Navigate to Connect > Traffic forwarding > Inter... | 🔵 5.5 | ADO Wiki |
| 18 📋 | GSA TLS Inspection - Windows Update fails with error 0x801901f6 ("There were some problems instal... | Windows Update endpoints (fe2cr.update.microsoft.com, slscr.update.microsoft.... | Create a Custom Bypass rule: Navigate to Connect > Traffic forwarding > Inter... | 🔵 5.5 | ADO Wiki |
| 19 📋 | External users (B2B guests) cannot access on-premises resources requiring Kerberos authentication... | Microsoft Entra B2B collaboration does not provide Kerberos tickets. Global S... | For web applications, the only supported method is publishing the app through... | 🔵 5.5 | ADO Wiki |
| 20 📋 | GSA App Discovery workbook in Log Analytics fails to load data or displays only partial data afte... | The traffic log export to the Log Analytics workspace may be misconfigured, s... | Re-export the Global Secure Access traffic logs by going to Monitor > Diagnos... | 🔵 5.5 | ADO Wiki |
| 21 📋 | Private DNS resolution not working for GSA Private Access; internal domain names are not resolved... | Prerequisites not met for Private DNS feature. Requires: (1) Private Access f... | Verify all prerequisites: (1) Enable the Private Access traffic forwarding pr... | 🔵 5.5 | ADO Wiki |
| 22 📋 | CA Signaling header is missing from Global Secure Access requests, causing SourceIP restoration o... | CA Signaling may not be properly enabled or propagated. The header is require... | Verify CA Signaling configuration using the dedicated Kusto query on the Data... | 🔵 5.5 | ADO Wiki |
| 23 📋 | When adding a network segment (FQDN or IP) to a GSA Private Access application, error 'Fully qual... | The original application was deleted via App Registrations blade instead of G... | Search the Application ID in App Registrations > Deleted Applications. If fou... | 🔵 5.5 | ADO Wiki |
| 24 📋 | Entra Private Access application does not appear under Global Secure Access > Enterprise Applicat... | A race condition during GSA application creation prevents the updating of ser... | PATCH the service principal tags via Graph API: PATCH https://graph.microsoft... | 🔵 5.5 | ADO Wiki |
| 25 📋 | Overlapping network segments in GSA Private Access cause unexpected access behavior. Traffic inte... | Network segments in GSA Private Access are evaluated by priority on the GSA c... | Recreate the Enterprise Applications in the desired priority (creation) order... | 🔵 5.5 | ADO Wiki |
| 26 📋 | Private network connector configured with outbound proxy for GSA Private Access fails. gRPC traff... | The connector does not respect outbound proxy settings for gRPC traffic unles... | 1) Upgrade connector to latest version. 2) Add proxy to connector configurati... | 🔵 5.5 | ADO Wiki |
| 27 📋 | Users with GSA client running receive ESTS login error AADSTS10000108: The policy {guid} provided... | Global Secure Access TRv2 signaling was enabled before the TRv2 policy was cr... | Disable TRv2 signaling on the Session Management blade. Create the TRv2 polic... | 🔵 5.5 | ADO Wiki |
| 28 📋 | Remote Desktop Connection (TCP 3389) fails on first attempt when MFA is enforced by Conditional A... | By default, the Remote Desktop Client waits only 8 seconds for the TCP connec... | Set registry key HKLM\SOFTWARE\Microsoft\Terminal Server Client\TimeoutTcpDir... | 🔵 5.5 | ADO Wiki |
| 29 📋 | Private DNS resolution over GSA intermittently fails or times out. DNS resolution only succeeds a... | The issue is related to IPv6 on the connector. When IPv6 is enabled on the co... | Disable IPv6 on both the client machine and the connector via registry: Set-I... | 🔵 5.5 | ADO Wiki |
| 30 📋 | Private Access Connector service crashes on Windows Server 2025 when Private Access DNS is used. ... | Crashes on Server 2025 correlate to HTTPS and SVCB DNS queries and how these ... | Contact Arpad Gulyas or Shawn Gray to deploy a private Connector version that... | 🔵 5.5 | ADO Wiki |
| 31 📋 | GSA Private Access and/or Application Proxy stops working after Entra ID P1/P2 license expires an... | When a P1/P2 license expires and a new one is purchased, GSA Private Access a... | Step 1: Ensure tenant has valid Entra ID P1/P2 license. Step 2: Navigate to E... | 🔵 5.5 | ADO Wiki |
| 32 📋 | GSA Private Access and Private DNS stop working or become intermittent. Connector trace log: Rust... | New certificates for *.msappproxy.net use a different certificate chain/CA co... | Option 1 (Recommended): Ensure connector server has outbound access to OCSP a... | 🔵 5.5 | ADO Wiki |
| 33 📋 | GSA client shows high memory usage, Event ID 425 error requesting new forwarding profile with cur... | Special (non-ASCII) characters in the Private Network name (Intelligent Local... | Rename the Private Network to remove all special characters and trigger a new... | 🔵 5.5 | ADO Wiki |
| 34 📋 | When multiple connectors are in a connector group for GSA Private Access, connections from the sa... | GSA Private Access does not support connector persistency (stickiness) for cl... | Options: 1) NAT all connector IPs to a single IP. 2) Use cookie-based session... | 🔵 5.5 | ADO Wiki |
| 35 📋 | UDP-dependent applications stop functioning on the connector server. System Event Log Event 4266:... | High-volume UDP traffic from applications using Entra Private Access leads to... | 1) Increase the UDP ephemeral port range per Microsoft documentation. 2) Depl... | 🔵 5.5 | ADO Wiki |
| 36 📋 | GSA client displays Disabled by your organization after installation. EU users see Event 421 Warn... | The Digital Markets Act (DMA) SSO Sign-In Prompt feature enforces user consen... | Update GSA Windows client to version 2.22.90.0 or later which adds a Sign in ... | 🔵 5.5 | ADO Wiki |
| 37 📋 | SourceIP address is not getting restored in Entra sign-in logs after enabling the Source IP resto... | Either CA-signaling is disabled/not yet in effect, or the M365 traffic profil... | Verify: (1) CA Signaling is enabled in the Admin portal and in MS-Graph. (2) ... | 🟡 3.5 | ADO Wiki |

## Quick Troubleshooting Path

1. Check **gsa** related issues (20 entries) `[ado-wiki]`
2. Check **tls-inspection** related issues (4 entries) `[ado-wiki]`
3. Check **compliant-network** related issues (2 entries) `[ado-wiki]`
4. Check **conditional-access** related issues (2 entries) `[ado-wiki]`
5. Check **certificate** related issues (2 entries) `[ado-wiki]`
6. Check **private-dns** related issues (2 entries) `[ado-wiki]`
7. Check **nrpt** related issues (2 entries) `[ado-wiki]`
8. Check **copilot-studio** related issues (2 entries) `[ado-wiki]`
