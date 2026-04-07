# ENTRA-ID Global Secure Access (GSA) — Detailed Troubleshooting Guide

**Entries**: 37 | **Drafts fused**: 30 | **Kusto queries**: 0
**Draft sources**: ado-wiki-a-gsa-advanced-threat-protection.md, ado-wiki-a-gsa-auth-troubleshooting-guide.md, ado-wiki-a-gsa-byod.md, ado-wiki-a-gsa-copilot-studio-agents.md, ado-wiki-a-gsa-custom-block-pages.md, ado-wiki-a-gsa-datapipeline-trafficlogconnections.md, ado-wiki-a-gsa-dlp-atp.md, ado-wiki-a-gsa-m365-signaling-changes.md, ado-wiki-a-gsa-mac-client.md, ado-wiki-a-gsa-prompt-shield-gateway.md
**Generated**: 2026-04-07

---

## Phase 1: Private Access
> 11 related entries

### When adding a network segment (FQDN or IP) to a GSA Private Access application, error 'Fully qualified domain name and port overlaps with an applic...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: The original application was deleted via App Registrations blade instead of GSA Enterprise Applications blade, creating an orphaned object that still holds the network segment reservation but is no longer manageable through GSA.

**Solution**: Search the Application ID in App Registrations > Deleted Applications. If found, click Restore App Registration to restore it, then delete or modify via GSA Enterprise Application blade. If permanently deleted, wait at least 1 day before re-adding the segment. Collect browser/Fiddler/HAR trace and use Kusto query on MsgraphApplicationOperationEvent to validate. Escalate via ICM if still unresolved.

---

### Entra Private Access application does not appear under Global Secure Access > Enterprise Application. The app may show as a Non-Gallery App or Appl...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: A race condition during GSA application creation prevents the updating of service principal tags. The service principal is created with incorrect tags (missing ZTNA-specific tags), causing it to not appear in the GSA Enterprise Application blade.

**Solution**: PATCH the service principal tags via Graph API: PATCH https://graph.microsoft.com/beta/servicePrincipals/{objectId} with body containing tags: IsAccessibleViaZTNAClient, HideApp, PrivateAccessNonWebApplication, WindowsAzureActiveDirectoryCustomSingleSignOnApplication, WindowsAzureActiveDirectoryIntegratedApp. Alternatively use Update-MgServicePrincipal PowerShell cmdlet, or delete and recreate the application from Enterprise Application blade.

---

### Overlapping network segments in GSA Private Access cause unexpected access behavior. Traffic intended for a specific FQDN (e.g., app1.contoso.com) ...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: Network segments in GSA Private Access are evaluated by priority on the GSA client from lowest to highest; first applicable segment wins. Priority is determined by creation order, not by URL specificity. Segments created earlier always have lower priority numbers and are evaluated first. QuickAccess segments always have higher priority than Enterprise Application segments.

**Solution**: Recreate the Enterprise Applications in the desired priority (creation) order, as recreating segments within an application does not change priority. If recreation is not feasible due to scale, engage the Product Group via IcM.

---

### Private network connector configured with outbound proxy for GSA Private Access fails. gRPC traffic to porto backend attempts to go directly instea...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: The connector does not respect outbound proxy settings for gRPC traffic unless the proxy is configured at both the connector configuration file level AND the WinHTTP level. If the outbound proxy uses default ports 80/443, the port is stripped before reaching the connector.

**Solution**: 1) Upgrade connector to latest version. 2) Add proxy to connector configuration file per docs. 3) Configure proxy at WinHTTP level: netsh winhttp set proxy http://proxy:port. If proxy uses default ports 80/443, share the private connector version with the fix under NDA.

---

### Remote Desktop Connection (TCP 3389) fails on first attempt when MFA is enforced by Conditional Access for GSA Private Access. RDP client shows: Re...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: By default, the Remote Desktop Client waits only 8 seconds for the TCP connection. When MFA is required through CA and GSA Private Access, the authentication flow takes longer than 8 seconds, causing the first RDP connection to time out.

**Solution**: Set registry key HKLM\SOFTWARE\Microsoft\Terminal Server Client\TimeoutTcpDirectConnection (REG_DWORD) to 60 (decimal). PowerShell: Set-ItemProperty -Path HKLM:\Software\Microsoft\Terminal Server Client -Name TimeoutTcpDirectConnection -Value 60 -Type DWord. This is a temporary workaround; PG is working on an enterprise-ready solution.

---

### Private DNS resolution over GSA intermittently fails or times out. DNS resolution only succeeds after multiple attempts. Connector debug log: DNS r...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: The issue is related to IPv6 on the connector. When IPv6 is enabled on the connector or client machine, DNS queries may intermittently fail due to IPv6-related resolution issues.

**Solution**: Disable IPv6 on both the client machine and the connector via registry: Set-ItemProperty -Path HKLM:\SYSTEM\CurrentControlSet\Services\Tcpip6\Parameters -Name DisabledComponents -Value 0x20. After applying the change, private DNS resolution should become consistent.

---

### Private Access Connector service crashes on Windows Server 2025 when Private Access DNS is used. Faulting module: pap_connector_lib.dll. Applicatio...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: Crashes on Server 2025 correlate to HTTPS and SVCB DNS queries and how these are handled by newer OS versions. Only Server 2025 is known to have this issue. The connector service auto-recovers after each crash.

**Solution**: Contact Arpad Gulyas or Shawn Gray to deploy a private Connector version that fixes this issue. Validate using Kusto query on BootstrapRootOperationEvent with initialBootstrap==true to confirm abnormal restart pattern.

---

### GSA Private Access and/or Application Proxy stops working after Entra ID P1/P2 license expires and a new license is purchased. Accessing apps resul...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: When a P1/P2 license expires and a new one is purchased, GSA Private Access and Application Proxy do not resume automatically. The private network feature needs to be manually re-enabled.

**Solution**: Step 1: Ensure tenant has valid Entra ID P1/P2 license. Step 2: Navigate to Entra Portal > Global Secure Access > Connectors and Sensors, click Enable private network connectors. Alternative: Entra Portal > Enterprise Applications > Private Network Connectors. For first-time activation, register the first private network connector.

---

### GSA Private Access and Private DNS stop working or become intermittent. Connector trace log: RustSslCertificateValidator: Failed to validate chain ...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: New certificates for *.msappproxy.net use a different certificate chain/CA configuration. The connector server cannot validate the new chain because it lacks access to OCSP/CRL endpoints or is missing intermediate/root certificates.

**Solution**: Option 1 (Recommended): Ensure connector server has outbound access to OCSP and CRL endpoints per docs. Option 2: Manually install Microsoft TLS G2 RSA CA OCSP XX intermediates (XX=02-16) and Microsoft TLS RSA Root G2 root cert into Local Computer store (certlm.msc). Then restart the connector service.

---

### When multiple connectors are in a connector group for GSA Private Access, connections from the same client are routed through different connectors,...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: GSA Private Access does not support connector persistency (stickiness) for clients by default. Each connection may be routed to any available connector, resulting in different source IPs.

**Solution**: Options: 1) NAT all connector IPs to a single IP. 2) Use cookie-based session persistence. 3) For RDWEB, configure RD Web and RD Gateway per docs. 4) Use single connector (not recommended). 5) Join the Connector Stickiness Private Preview via enrollment form.

---

## Phase 2: Tls Inspection
> 4 related entries

### Error "The CA certificate has already been issued" (HTTP 400 BadRequest) when configuring TLS inspection in Global Secure Access. InvalidPropertyVa...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Certificate name and Common name in TLS inspection CSR request conflict with a previously used certificate name.

**Solution**: Supply unique values in Certificate name and Common name fields of the CSR request form on the TLS inspection settings blade. Do not reuse names from previously issued certificates.

---

### GSA TLS Inspection - Every TLS connection fails with "Your connection isn't private" (NET::ERR_CERT_AUTHORITY_INVALID). Clicking Advanced shows the...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: The public .cer file for the trusted root certificate configured in GSA Settings > Session management > TLS Inspection tab is either missing from the client computer's Trusted Root Certificate store, or the .cer file present does not match the certificate in the TLS Inspection tab.

**Solution**: Download the .CER file from the certificate in the TLS Inspection tab (GSA portal > Settings > Session management > TLS Inspection) and import it into the Trusted Root Certificate store of the client computer.

---

### GSA TLS Inspection - Intune Policy Sync fails with "The sync could not be initiated (0x80190194 Not found (404))" after enabling TLS inspection in ...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: Intune sync endpoints (checkin.dm.microsoft.com, r.manage.microsoft.com) are incorrectly intercepted by TLS inspection policy as Internet traffic instead of being bypassed as M365 traffic.

**Solution**: Create a Custom Bypass rule: Navigate to Connect > Traffic forwarding > Internet access profile > Internet access policies > View > Custom Bypass > Add rule. Set Destination type to FQDN and enter: checkin.dm.microsoft.com,r.manage.microsoft.com. Save and disable/re-enable the GSA client to pick up the change.

---

### GSA TLS Inspection - Windows Update fails with error 0x801901f6 ("There were some problems installing updates") after enabling TLS inspection in Gl...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: Windows Update endpoints (fe2cr.update.microsoft.com, slscr.update.microsoft.com, fe3cr.delivery.mp.microsoft.com) are incorrectly intercepted by TLS inspection policy as Internet traffic instead of being bypassed.

**Solution**: Create a Custom Bypass rule: Navigate to Connect > Traffic forwarding > Internet access profile > Internet access policies > View > Custom Bypass > Add rule. Set Destination type to FQDN and enter: fe2cr.update.microsoft.com,slscr.update.microsoft.com,fe3cr.delivery.mp.microsoft.com. Save and disable/re-enable the GSA client to pick up the change.

---

## Phase 3: Private Dns
> 3 related entries

### GSA health check for 'NRPT rules set' reports False; Private DNS not working because DNS suffix search list on the Windows client does not include ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The single label suffix required by GSA Private DNS is missing from the DNS Suffix Search List on the client machine, preventing NRPT rules from being applied correctly

**Solution**: Run IPCONFIG /ALL to verify DNS Suffix Search List. If suffix is missing, collect Advanced log collection + Process Monitor while disabling/re-enabling GSA client to investigate why the suffix is not being added

---

### GSA health check 'NRPT rules set' reports False on Windows computers with non-English language settings, even though Private DNS functions correctl...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Known product bug - the NRPT health check logic fails to parse output correctly on non-English OS locale (tracked: identitydivision work item 3099172)

**Solution**: Confirm Private DNS is actually working by verifying DNS suffix search list and netsh output. This is a false positive from the health check. Track engineering fix via work item: https://identitydivision.visualstudio.com/Engineering/_workitems/edit/3099172

---

### Private DNS resolution not working for GSA Private Access; internal domain names are not resolved when accessed through Global Secure Access client.
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: Prerequisites not met for Private DNS feature. Requires: (1) Private Access forwarding profile enabled, (2) Microsoft Entra Private Network Connector >= 1.5.3829.0, (3) GSA client >= 2.0.0.0 (version 1.7.376+), (4) IPv6 and Secure DNS / DNS over TCP must be disabled on the client device.

**Solution**: Verify all prerequisites: (1) Enable the Private Access traffic forwarding profile at Global Secure Access > Connect > Traffic Forwarding. (2) Update Private Network Connector to >= 1.5.3829.0 (check via connector server file properties). (3) Update GSA client to >= 2.0.0.0 (check via Advanced Diagnostics > Overview). (4) Disable IPv6 and Secure DNS on each client per https://learn.microsoft.com/entra/global-secure-access/how-to-install-windows-client. (5) Verify DNS suffixes are configured unde

---

## Phase 4: Compliant Network
> 2 related entries

### Compliant Network option is greyed out (unavailable) in the Conditional Access portal when creating or editing CA policies in Global Secure Access.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: CA signaling is not enabled in the Global Secure Access portal, or the admin lacks required RBAC roles (Conditional Access admin or Global Secure Access admin).

**Solution**: Enable CA signaling in Global Secure Access portal (portal.azure.com -> Global Secure Access -> Global settings -> Adaptive Access). Ensure admin has either Conditional Access admin or Global Secure Access admin role.

---

### Compliant Network condition in Conditional Access policy is not taking effect. Users not blocked or granted access based on compliant network statu...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: One or more prerequisites not met: CA-signaling toggle not enabled in GSA portal, M365 traffic profile not enabled, or Global Secure Access client disabled/not running on client machine.

**Solution**: 1) Enable CA-signaling toggle in GSA portal (Global Secure Access -> Global settings -> Adaptive Access); wait up to 30 min. 2) Enable M365 traffic forwarding in GSA portal. 3) Ensure Global Secure Access client is installed and running. Note: Compliant Network does not support CAE enforcement yet.

---

## Phase 5: Copilot Studio
> 2 related entries

### GSA blocks Copilot Studio agent traffic but shows 502 Bad Gateway for HTTP Actions or 403 Forbidden for connectors instead of a proper GSA block page
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Known issue - the block experience for Copilot Studio agents does not yet show a standard GSA block page. HTTP Node traffic returns 502 Bad Gateway and connector traffic returns 403 Forbidden when blocked by GSA security policies.

**Solution**: This is a known issue and improvements are coming. To verify the block was from GSA, check GSA Traffic Logs (Entra portal > Global Secure Access > Monitor > Traffic Logs). Use Kusto query on TalonOperationEvent table to see PolicyAction and ResponseCode. Filter by TunnelType==AiAgentPlatform and TenantId.

---

### GSA security policies linked to Conditional Access security profiles are not applied to Copilot Studio agent traffic - only baseline profile polici...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Known limitation - GSA for Copilot Studio Agents only supports the baseline profile for enforcement. Security profiles linked to Conditional Access policies are not currently supported for agent traffic. Policies are per-tenant only.

**Solution**: Configure all security policies for Copilot Studio agents (web content filtering, threat intelligence, network file filtering) under the baseline profile in GSA. Do not rely on CA-linked security profiles for agent traffic. After enabling GSA for Agents in Power Platform, create or update custom connectors for them to route through GSA.

---

## Phase 6: Prompt Shield
> 2 related entries

### GSA Prompt Shield policy does not detect or block malicious prompts in AI apps that use URL-based encoding (e.g., Google Gemini) - only JSON-based ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Known limitation - Prompt Shield currently supports only JSON-based generative AI apps. Apps using URL-based encoding for prompt submission are not supported. Only text prompts are supported (not files).

**Solution**: Verify the customer AI app uses JSON-based communication. If using Gemini or other URL-based AI apps, Prompt Shield cannot protect them. For custom LLMs, configure a custom type model with exact URL and JSON path for optimal performance. For unsupported app types, recommend alternative security controls at the app layer.

---

### GSA Prompt Shield does not fully scan long prompts - prompts exceeding 10000 characters are silently truncated, potentially allowing malicious cont...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Known limitation - Prompt Shield supports prompts up to 10000 characters. Anything longer is truncated before scanning. Rate limits also apply when scanning requests for specified conversation schemes.

**Solution**: Be aware that only the first 10K characters of prompts are scanned. For apps generating very long prompts, recommend implementing app-level prompt validation for content beyond 10K chars. To optimize performance for custom LLMs, specify the exact URL and JSON path for each conversation scheme.

---

## Phase 7: Mac Client
> 2 related entries

### GSA Mac client fails to tunnel FQDN-based traffic when DNS over HTTPS (DoH/Secure DNS) is enabled on the browser or macOS - traffic bypasses GSA an...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The GSA Mac client relies on DNS interception to capture FQDN-based traffic. When DNS over HTTPS is enabled (browser or OS level), DNS queries bypass the client interception. IP-based traffic acquisition is not affected.

**Solution**: Disable DNS over HTTPS on both the browser (Chrome: chrome://settings/security, Edge: edge://settings/privacy) and macOS system DNS settings. Verify GSA client status shows connected (green tick in system tray). Network traffic acquired by IP rules is unaffected by DoH.

---

### GSA Mac client does not tunnel UDP traffic on ports 80/443 (QUIC protocol) for Internet Access workload - QUIC traffic bypasses GSA and goes direct...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: QUIC protocol is not supported for Internet Access on Mac. Traffic to UDP 80 and 443 cannot be tunneled. QUIC is supported for Private Access and M365 workloads only.

**Solution**: Disable QUIC protocol on browsers to force fallback to HTTPS over TCP (fully supported). For Chrome/Edge: navigate to chrome://flags or edge://flags, search QUIC and set to Disabled. Administrators can also deploy browser policies to disable QUIC organization-wide. Private Access and M365 workloads are not affected.

---

## Phase 8: Source Ip
> 2 related entries

### CA Signaling header is missing from Global Secure Access requests, causing SourceIP restoration or compliant network checks to fail.
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: CA Signaling may not be properly enabled or propagated. The header is required for SourceIP restoration and compliant network CA policies to function.

**Solution**: Verify CA Signaling configuration using the dedicated Kusto query on the Datapath-CA-Signaling wiki page (https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1001342/Datapath-CA-Signaling). Check that CA Signaling is enabled both in the Admin portal and at the NaaS Edge.

---

### SourceIP address is not getting restored in Entra sign-in logs after enabling the Source IP restoration feature in Global Secure Access.
**Score**: 🟡 3.5 | **Source**: ADO Wiki

**Root Cause**: Either CA-signaling is disabled/not yet in effect, or the M365 traffic profile is not enabled. There is a known 15-20 minute delay from toggling the SourceIP restoration feature before changes appear in sign-in logs.

**Solution**: Verify: (1) CA Signaling is enabled in the Admin portal and in MS-Graph. (2) CA Signaling is enabled at the NaaS Edge. (3) M365 traffic profile is enabled at Global Secure Access > Connect > Traffic Forwarding. (4) Use the GSA client Health Check tool to confirm the destination URL is flowing through the NaaS service. (5) Wait at least 15-20 minutes after toggling the feature before checking sign-in logs.

---

## Phase 9: Client
> 2 related entries

### GSA client shows high memory usage, Event ID 425 error requesting new forwarding profile with curl timeout. ForwardingProfile.json shows garbled ch...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: Special (non-ASCII) characters in the Private Network name (Intelligent Local Access) cause a string conversion failure during the GSA Client policy processing, resulting in forwarding profile corruption.

**Solution**: Rename the Private Network to remove all special characters and trigger a new forwarding profile download or wait until the profile is updated. Fix is included in GSA Client version 2.28.

---

### GSA client displays Disabled by your organization after installation. EU users see Event 421 Warning: User token acquisition failed with AADSTS9002...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: The Digital Markets Act (DMA) SSO Sign-In Prompt feature enforces user consent for SSO in EU regions. The GSA client uses silent (non-interactive) auth which cannot display the DMA consent prompt.

**Solution**: Update GSA Windows client to version 2.22.90.0 or later which adds a Sign in button for DMA consent. User must click Sign in, provide UPN, and consent to SSO. After consent, SSO works normally.

---

## Phase 10: Byod
> 1 related entries

### GSA BYOD - B2B Guest access "Switch tenant" option is not visible in the Global Secure Access client on registered (non-joined) Windows devices.
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: Intermittent UI issue in the GSA client where the B2B Guest access switch tenant option may fail to render after initial sign-in.

**Solution**: Restart the Windows device. After restart, the switch tenant option should become visible in the GSA client.

---

## Phase 11: Dlp
> 1 related entries

### GSA DLP/ATP - Alert events appear in Traffic logs but are missing from the Alerts blade in the Global Secure Access portal.
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: The alert action was logged in traffic logs but the traffic may not have been properly routed to Netskope, or Netskope did not generate a corresponding alert entry. The transactionId in traffic logs maps to partnerTransactionId in the Alerts blade.

**Solution**: Query TalonOperationEvent table in Kusto (idsharedwus cluster, NaasProd database) to check if VendorName contains "Netskope" and review securityProfileMetadata. If Netskope is present but alert is still missing from the Alerts blade, file an ICM to GSA Control Plane team.

---

## Phase 12: B2B
> 1 related entries

### External users (B2B guests) cannot access on-premises resources requiring Kerberos authentication (e.g., SMB file shares, applications using Integr...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: Microsoft Entra B2B collaboration does not provide Kerberos tickets. Global Secure Access Private Access does not proxy Kerberos or support Kerberos Constrained Delegation (KCD) for external users.

**Solution**: For web applications, the only supported method is publishing the app through Application Proxy with KCD. See: https://learn.microsoft.com/en-us/entra/identity/app-proxy/how-to-configure-sso-with-kcd. SMB file shares are not supported for B2B users via GSA.

---

## Phase 13: Threat Intelligence
> 1 related entries

### GSA Threat Intelligence policy not blocking malicious sites immediately after configuration - users can still access threat sites for up to 90 minu...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Security profiles in GSA are enforced via access tokens. New or updated security profiles take 60-90 minutes to propagate and become effective across all user sessions.

**Solution**: Wait 60-90 minutes after configuring the Threat Intelligence policy and linking it to a Conditional Access policy. Clear browser cache on test devices. Verify enforcement by navigating to test threat sites (e.g., entratestthreat.com, smartscreentestratings2.net). Check GSA Network Traffic Logs for action taken (may take up to 5 minutes to appear).

---

## Phase 14: Web Category
> 1 related entries

### GSA Web Category Checker API (Graph beta) returns only one category for a URL even though the URL may belong to multiple web categories
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Known limitation - the Web Category Checker tool (microsoft.graph.networkaccess.getWebCategoryByUrl) currently returns only the first category. This is API-only with no UI in the Entra admin center.

**Solution**: For full category information, check the Web Category column in GSA Traffic Logs instead of relying solely on the API. If a URL needs encoding (spaces/query strings), URL-encode the @url parameter. To dispute categorization, email gsawebcatdispute@service.microsoft.com with FQDN, Category Returned, Category Expected, Justification.

---

## Phase 15: App Discovery
> 1 related entries

### GSA App Discovery workbook in Log Analytics fails to load data or displays only partial data after configuring diagnostic settings to export Global...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: The traffic log export to the Log Analytics workspace may be misconfigured, stale, or incomplete. The Discovered Application Segments workbook relies on properly exported traffic logs in the workspace.

**Solution**: Re-export the Global Secure Access traffic logs by going to Monitor > Diagnostic settings and reconfiguring the export. Then reload the workbook from Monitor > Workbooks. If the issue persists, open an IcM to Microsoft Network as a Service/ZTNA Data Pipeline (template: j1L1U3) with a PSR of the repro and a HAR file.

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Compliant Network option is greyed out (unavailable) in the Conditional Acces... | CA signaling is not enabled in the Global Secure Access p... | Enable CA signaling in Global Secure Access portal (porta... | 🟢 8.5 | ADO Wiki |
| 2 | Compliant Network condition in Conditional Access policy is not taking effect... | One or more prerequisites not met: CA-signaling toggle no... | 1) Enable CA-signaling toggle in GSA portal (Global Secur... | 🟢 8.5 | ADO Wiki |
| 3 | Error "The CA certificate has already been issued" (HTTP 400 BadRequest) when... | Certificate name and Common name in TLS inspection CSR re... | Supply unique values in Certificate name and Common name ... | 🟢 8.5 | ADO Wiki |
| 4 | GSA health check for 'NRPT rules set' reports False; Private DNS not working ... | The single label suffix required by GSA Private DNS is mi... | Run IPCONFIG /ALL to verify DNS Suffix Search List. If su... | 🟢 8.5 | ADO Wiki |
| 5 | GSA health check 'NRPT rules set' reports False on Windows computers with non... | Known product bug - the NRPT health check logic fails to ... | Confirm Private DNS is actually working by verifying DNS ... | 🟢 8.5 | ADO Wiki |
| 6 | GSA Threat Intelligence policy not blocking malicious sites immediately after... | Security profiles in GSA are enforced via access tokens. ... | Wait 60-90 minutes after configuring the Threat Intellige... | 🟢 8.5 | ADO Wiki |
| 7 | GSA Web Category Checker API (Graph beta) returns only one category for a URL... | Known limitation - the Web Category Checker tool (microso... | For full category information, check the Web Category col... | 🟢 8.5 | ADO Wiki |
| 8 | GSA blocks Copilot Studio agent traffic but shows 502 Bad Gateway for HTTP Ac... | Known issue - the block experience for Copilot Studio age... | This is a known issue and improvements are coming. To ver... | 🟢 8.5 | ADO Wiki |
| 9 | GSA security policies linked to Conditional Access security profiles are not ... | Known limitation - GSA for Copilot Studio Agents only sup... | Configure all security policies for Copilot Studio agents... | 🟢 8.5 | ADO Wiki |
| 10 | GSA Prompt Shield policy does not detect or block malicious prompts in AI app... | Known limitation - Prompt Shield currently supports only ... | Verify the customer AI app uses JSON-based communication.... | 🟢 8.5 | ADO Wiki |
| 11 | GSA Prompt Shield does not fully scan long prompts - prompts exceeding 10000 ... | Known limitation - Prompt Shield supports prompts up to 1... | Be aware that only the first 10K characters of prompts ar... | 🟢 8.5 | ADO Wiki |
| 12 | GSA Mac client fails to tunnel FQDN-based traffic when DNS over HTTPS (DoH/Se... | The GSA Mac client relies on DNS interception to capture ... | Disable DNS over HTTPS on both the browser (Chrome: chrom... | 🟢 8.5 | ADO Wiki |
| 13 | GSA Mac client does not tunnel UDP traffic on ports 80/443 (QUIC protocol) fo... | QUIC protocol is not supported for Internet Access on Mac... | Disable QUIC protocol on browsers to force fallback to HT... | 🟢 8.5 | ADO Wiki |
| 14 | GSA BYOD - B2B Guest access "Switch tenant" option is not visible in the Glob... | Intermittent UI issue in the GSA client where the B2B Gue... | Restart the Windows device. After restart, the switch ten... | 🔵 5.5 | ADO Wiki |
| 15 | GSA DLP/ATP - Alert events appear in Traffic logs but are missing from the Al... | The alert action was logged in traffic logs but the traff... | Query TalonOperationEvent table in Kusto (idsharedwus clu... | 🔵 5.5 | ADO Wiki |
| 16 | GSA TLS Inspection - Every TLS connection fails with "Your connection isn't p... | The public .cer file for the trusted root certificate con... | Download the .CER file from the certificate in the TLS In... | 🔵 5.5 | ADO Wiki |
| 17 | GSA TLS Inspection - Intune Policy Sync fails with "The sync could not be ini... | Intune sync endpoints (checkin.dm.microsoft.com, r.manage... | Create a Custom Bypass rule: Navigate to Connect > Traffi... | 🔵 5.5 | ADO Wiki |
| 18 | GSA TLS Inspection - Windows Update fails with error 0x801901f6 ("There were ... | Windows Update endpoints (fe2cr.update.microsoft.com, sls... | Create a Custom Bypass rule: Navigate to Connect > Traffi... | 🔵 5.5 | ADO Wiki |
| 19 | External users (B2B guests) cannot access on-premises resources requiring Ker... | Microsoft Entra B2B collaboration does not provide Kerber... | For web applications, the only supported method is publis... | 🔵 5.5 | ADO Wiki |
| 20 | GSA App Discovery workbook in Log Analytics fails to load data or displays on... | The traffic log export to the Log Analytics workspace may... | Re-export the Global Secure Access traffic logs by going ... | 🔵 5.5 | ADO Wiki |
| 21 | Private DNS resolution not working for GSA Private Access; internal domain na... | Prerequisites not met for Private DNS feature. Requires: ... | Verify all prerequisites: (1) Enable the Private Access t... | 🔵 5.5 | ADO Wiki |
| 22 | CA Signaling header is missing from Global Secure Access requests, causing So... | CA Signaling may not be properly enabled or propagated. T... | Verify CA Signaling configuration using the dedicated Kus... | 🔵 5.5 | ADO Wiki |
| 23 | When adding a network segment (FQDN or IP) to a GSA Private Access applicatio... | The original application was deleted via App Registration... | Search the Application ID in App Registrations > Deleted ... | 🔵 5.5 | ADO Wiki |
| 24 | Entra Private Access application does not appear under Global Secure Access >... | A race condition during GSA application creation prevents... | PATCH the service principal tags via Graph API: PATCH htt... | 🔵 5.5 | ADO Wiki |
| 25 | Overlapping network segments in GSA Private Access cause unexpected access be... | Network segments in GSA Private Access are evaluated by p... | Recreate the Enterprise Applications in the desired prior... | 🔵 5.5 | ADO Wiki |
| 26 | Private network connector configured with outbound proxy for GSA Private Acce... | The connector does not respect outbound proxy settings fo... | 1) Upgrade connector to latest version. 2) Add proxy to c... | 🔵 5.5 | ADO Wiki |
| 27 | Users with GSA client running receive ESTS login error AADSTS10000108: The po... | Global Secure Access TRv2 signaling was enabled before th... | Disable TRv2 signaling on the Session Management blade. C... | 🔵 5.5 | ADO Wiki |
| 28 | Remote Desktop Connection (TCP 3389) fails on first attempt when MFA is enfor... | By default, the Remote Desktop Client waits only 8 second... | Set registry key HKLM\SOFTWARE\Microsoft\Terminal Server ... | 🔵 5.5 | ADO Wiki |
| 29 | Private DNS resolution over GSA intermittently fails or times out. DNS resolu... | The issue is related to IPv6 on the connector. When IPv6 ... | Disable IPv6 on both the client machine and the connector... | 🔵 5.5 | ADO Wiki |
| 30 | Private Access Connector service crashes on Windows Server 2025 when Private ... | Crashes on Server 2025 correlate to HTTPS and SVCB DNS qu... | Contact Arpad Gulyas or Shawn Gray to deploy a private Co... | 🔵 5.5 | ADO Wiki |
