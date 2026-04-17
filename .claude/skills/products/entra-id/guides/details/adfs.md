# ENTRA-ID ADFS Config & Troubleshooting — Detailed Troubleshooting Guide

**Entries**: 155 | **Drafts fused**: 45 | **Kusto queries**: 0
**Draft sources**: ado-wiki-a-adfs-365-default-rules.md, ado-wiki-a-adfs-claims-xray-setup.md, ado-wiki-a-adfs-idpinitiated-signon-test.md, ado-wiki-a-adfs-issuerid-claim-issuance-deepdive.md, ado-wiki-a-adfs-wia-settings-check.md, ado-wiki-a-wap-trust-troubleshooter.md, ado-wiki-b-adfs-endpoints-reference.md, ado-wiki-b-adfs-enterprise-prt-event-1021.md, ado-wiki-b-adfs-gmsa-reference.md, ado-wiki-b-adfs-oauth-troubleshooting-guide.md
**Generated**: 2026-04-07

---

## Phase 1: Wap
> 9 related entries

### Chrome cannot access ADFS sign-in page from external network (via WAP/ADFS proxy). IE and other browsers work fine externally and internally. ADFS ...
**Score**: 🟢 10.0 | **Source**: OneNote

**Root Cause**: After a Windows update to Windows Server 2012 R2, the ADFS proxy server negotiated a weak cipher suite (e.g. TLS_RSA_WITH_3DES_EDE_CBC_SHA) with Chrome. Chrome dropped support for 3DES ciphers causing TLS handshake failure.

**Solution**: 1) Disable weak cipher suites (especially 3DES-based) on the ADFS proxy/WAP server. 2) Ensure strong cipher suites like TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384 are enabled and prioritized. 3) Use IISCrypto tool or GPO to manage cipher suite order.

---

### WAP configuration wizard fails with 401 Unauthorized. WAP proxy cannot download configuration from ADFS server.
**Score**: 🟢 10.0 | **Source**: OneNote

**Root Cause**: Exact IP:port SSL bindings on ADFS server take precedence over ADFS hostname:port binding. The IP binding uses default Trusted Root CA store (not AdfsTrustedDevices), so WAP self-signed client cert fails validation.

**Solution**: Remove exact IP:port SSL bindings on ADFS/WAP servers. Add IP wildcard binding: netsh http add sslcert ipport=0.0.0.0:443 certhash=<hash> appid={5d89a20c-beab-4389-9447-324788eb944a} for non-SNI client support.

---

### WAP resets TLS client hello from applications. Application cannot establish SSL connection to ADFS through WAP.
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Application/WAF does not include SNI extension in TLS Client Hello. Http.sys on WAP filters traffic because it cannot determine which certificate to serve without SNI.

**Solution**: Add fallback certificate to 0.0.0.0:443 on every ADFS and WAP: netsh http show sslcert, then netsh http add sslcert ipport=0.0.0.0:443 certhash=<hash> appid={5d89a20c-beab-4389-9447-324788eb944a}. Long-term: upgrade app for SNI.

---

### WAP client certificate authentication fails with CERT_E_UNTRUSTEDROOT (-2146762487) when SendTrustedIssuerList=0; or no client cert provided when S...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Non-self-signed certificate (e.g., Intermediate CA) installed in Local Computer Trusted Root Certification Authorities store on WAP server corrupts the trusted issuer list.

**Solution**: Remove/move non-self-signed certificates from Local Computer Trusted Root Certification Authorities store on WAP. Ref: KB2802568, KB2795828.

---

### WAP trust rebuild fails immediately with 'Could not create SSL/TLS secure channel' after sudden WAP service crash. All standard checks pass. Networ...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: SCHANNEL registry key DisableRenegoOnServer=1 on ADFS server. WAP trust uses client certificate auth performed during TLS renegotiation. Disabling renegotiation blocks WAP from authenticating to ADFS after trust establishment.

**Solution**: Set HKLM\System\CurrentControlSet\Control\SecurityProviders\SCHANNEL\DisableRenegoOnServer to 0 or delete the key. Diagnose with SCHANNEL ETL trace: look for SEC_E_ILLEGAL_MESSAGE errors indicating blocked renegotiation.

---

### ADFS WAP (Web Application Proxy) proxy trust relationship cannot be established or starts failing. HTTP.sys uses wrong certificate for client certi...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: A specific IP:Port SSL binding exists on port 443 that takes highest precedence over the ADFS Hostname:Port binding in HTTP.sys priority order (IP:Port > SNI/Hostname:Port > CSS > wildcard). This causes HTTP.sys to use the wrong certificate and CTL store for WAP proxy trust client certificate validation.

**Solution**: Three options: (1) Remove the specific IP:Port binding (check it does not recreate automatically). (2) Use a 2nd IP address for ADFS traffic and resolve ADFS service FQDN to this IP. (3) Configure the AdfsTrustedDevices store as the CTL Store for the specific IP:Port binding. Check current bindings with netsh http show sslcert.

---

### ADFS WAP proxy trust fails. The SSL certificate binding for the ADFS service FQDN hostname:port on 443 does not have CTL Store Name set to AdfsTrus...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The ADFS hostname:port SSL binding CTL Store is not pointing to AdfsTrustedDevices store, preventing proper client certificate validation for WAP proxy trust. The AdfsTrustedDevices store contains the self-signed proxy trust certificates from WAP servers.

**Solution**: If Azure AD Connect is installed, use AAD Connect to update the SSL certificate bindings on all servers. Otherwise, run Set-AdfsSslCertificate -Thumbprint <thumbprint> on the ADFS server to regenerate the ADFS certificate bindings with correct CTL store configuration.

---

### ADFS WAP proxy trust fails. A CA-issued (non-self-signed) certificate is found in the AdfsTrustedDevices certificate store on the ADFS server.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The AdfsTrustedDevices store should only contain self-signed certificates (MS-Organization-Access cert for Workplace Join and proxy trust certs for each WAP server). A CA-issued certificate in this store corrupts the Certificate Trust List (CTL), causing it to only contain the CA-issued cert and breaking proxy trust validation.

**Solution**: Delete the non-self-signed SSL Server Certificate from the AdfsTrustedDevices store. Only self-signed certs should remain. Verify with PowerShell: Get-ChildItem cert:\LocalMachine\AdfsTrustedDevices | Where-Object {$_.Issuer -ne $_.Subject} - any results indicate CA-issued certs that must be removed.

---

### ADFS WAP proxy trust communication breaks. SSL termination is happening on a network device between AD FS servers and WAP servers.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: WAP and ADFS communication is based on client certificates. SSL termination on an intermediate network device (load balancer, firewall, etc.) strips the client certificate, breaking the proxy trust handshake.

**Solution**: Disable SSL termination on the network device between the ADFS and WAP servers. ADFS-WAP communication requires end-to-end SSL/TLS for client certificate authentication to function correctly.

---

## Phase 2: Break/Fix
> 8 related entries

### Consider the following scenario: You have an ADFS 3.0 farm using a dedicated SQL instance to store the configuration data. You try to add an additi...
**Score**: 🔵 7.0 | **Source**: KB

**Root Cause**: Not entirely known, but it seems to be a permission issue on the local machine for the ADFS service account. Possibly a problem in the local security policies or lack of permission to something on the local file system. Unfortunately, we were not able to run a Procmon trace the time, but we didn�t see anything wrong in the Security event log. Note: The error makes you think it�s a problem communicating with the SQL server, but in a Netmon trace, we saw no communication whatsoever with the SQL bo

**Solution**: Add the ADFS service account to the local Administrators group on the ADFS box.

---

### SID showing up when we are change password field when logging into OWA via ADFS
**Score**: 🔵 7.0 | **Source**: KB

**Root Cause**: ADFS claim is sending SID and UPN, but Exchange Client is picking only SID

**Solution**: > When we log into OWA (E2k13\E2k10)via ADFS and arrive at change password page, we see SID of the user instead of DomainName\username. > The ADFS token sent to Exchange also included SID, group SID, UPN > For some reason, although , UPN\SID both are defined to be sent in ADFS claim rule, only SID shows up >When the User has logged in to the Application and hits change Password ------� When the User hits change Password, on the Application page, we observe primary SID S-1-5-21-2242138424-1987062

---

### Unable to configure ADFS 2016 Role on Windows Server 2016. End Goal:- First add ADFS Server 2016 to the existing farm of ADFS Server 2012 R2 and on...
**Score**: 🔵 7.0 | **Source**: KB

**Root Cause**: All 3 ADFS Certificates were not present in Personal Computer Store of DCOLY02 . We have a scenario where for ADFS 3.0 all the three Certificates i.e ADFS Service Communication Certificate, Token- Signing and Token- Decrypting Certificate were all issued by Public CA.... In these scenario, if we are Configuring ADFS Server Role, all 3 Certificates shall be imported in Personal Computer Store of the respective ADFS Server which was not there in this scenario. Error Message observed was"- certific

**Solution**: We would need to export all the 3 Certificates from HBEADFS05 to DCOLY02 .Unfortunately we werent able to copy the ADFS Token-Decrypting Cert along with Private Key from HBEADFS05. In case , we are not able to export private key of the Token Signing or Token- Decryption Certificate, we need to create Self Signed certificate. Note:- If Token Signing and Token Decryption Certificates are SELF Signed, no need to copy them to Personal Computer Store of the respective ADFS Server where we are configu

---

### Users of domain tivit.com unable to access O365 Applicatin Externally and Internally.Error Observed:- Where it says Incorrect Username and Password...
**Score**: 🔵 7.0 | **Source**: KB

**Root Cause**: Since there is a 2 WAY External trust established between 2 Forests tivit.corp and syngbl.int.

On Domain Controller for syngbl.int Name Suffix routing for
Domain tivit.com is disabled

Since the Name Suffix routing for domain tivit.com is disabled on Domain Controller of syngbl.int, when the query reaches syngbl.int, it is not able to route it to Domain Controller for tivit.corp.


 There are 2 Forests:-
     tivit.corp and syngbl.int�
 Under the
     tivit.corp--------> tivit.com.br is added a

**Solution**: We enabled the name suffix for domain tivit.com on the Domain
Controller for syngbl.int post which the users with UPN tivit.com started to access Office 365 Application.

---

### AbstractPTA specific calls on the main logon path to get the current user last DirSync time result in an unhandled exception that blocks / prevents...
**Score**: 🔵 7.0 | **Source**: KB

**Root Cause**: This
issue is being triggered by the PTA specific call to Msol-GetUser on the main
logon path of AAD Connect where multiple
separate commands issued on the same pipeline are being accidentally chained
together when PowerShell transcription is enabledEach
PowerShellProvider has its own local copy of a powerShell pipeline
object.  However it appears PowerShell itself has a common object for
transcriptionThe use of nested clauses also causes problems when transcription is enabled.

**Solution**: Install corrective updatesInstall Windows Management Framework 5.0 from https://www.microsoft.com/en-us/download/confirmation.aspx?id=50395 to enable the transcription functionality. Install the May 2017 or later release of AAD Connect which allows the basic express/custom flow for non-ADFS scenarios to work when transcription is enabledRelease notes for the May 2017 release of AAD Connect describe this fix as follows:

Previously, you must disable PowerShell transcription for Azure
AD Connect w

---

### Symptom from 117031715473638We have issues with Outlook clients, across all users, maintaining auth to Office 365. It's behaving as though the Refr...
**Score**: 🔵 7.0 | **Source**: KB

**Root Cause**: This behavior is by-design due to the LastPasswordChangeTimestamp not being synchronized for the user profiles. The issue stems from the fact that the code path diverged.  Tenants created prior to August 2016 follow this process for user profiles that do not synchronize the LastPasswordChangeTimestamp with regards to the Refresh Token. Consider the following workflow: User Authenticates User is issued a Refresh Token The tenant has the Refresh Token Max Inactive Time set to 2 hours The end user 

**Solution**: Change the Okta profile synchronization configuration to include the LastPasswordChangeTimestamp

---

### Known issue where if customers try to use ADFS Authentication through an ILB/VPN, they are unable to. Topology:Local Client -> VPN -> ILB -> ADFS s...
**Score**: 🔵 7.0 | **Source**: KB

**Root Cause**: The issue is due to a problem with how ILBs handle the jumbo packets sent by ADFS servers as SSL &quot;Server Hello. Certificates&quot;. Once they reach the Azure Gateway, they are not fragmented properly so they do not make it across the VPN tunnel.

**Solution**: Solution is to reduce the MTU packet size on the ADFS servers by executing:netsh interface ipv4 show subinterfacesnetsh interface ipv4 set subinterface &quot;Sub-interface name from previous command&quot; mtu=1350 store=persistentYou can point customers to this solution on the Azure Diagnostics blade:

---

### Abstract  This article describes an issue where device objects that are synchronized into the on-premises AD DS from Azure AD, using Device Writeba...
**Score**: 🔵 7.0 | **Source**: KB

**Root Cause**: If device authentication is required, the user must have
registered their device and the device object synchronized into the local AD
DS.  The device is associated with the
device object and ADFS verifies this when evaluating the access policies.  If the device object doesn�t exist, the
evaluation will fail.

 

The device registration service will periodically check all
device objects in the directory and clean them up due it inactivity.  This is done to reduce AD DS bloat.  However, since the 

**Solution**: The workaround to this problem is to disable device clean-up
in ADFS. In AD FS 2016 this is set on the properties
dialog for the Device Registration Service in the ADFS admin MMC snap-in as shown below.Customers in ADFS 2012/R2 need to use PowerShell to disable this
device clean-up using the following command:  



Set-AdfsDeviceRegistration -MaximumInactiveDays 0 Note: Setting MaximumInactiveDays to value 0 disables the cleanup task.

---

## Phase 3: Federation
> 7 related entries

### Convert-MsolDomainToFederated fails with Service not available in 21V. SOAP fault: TrustedRealm not found.
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: MSOL deprecated. Backend returns TrustedRealm not found for new unfederated domains.

**Solution**: Use Graph PowerShell New-MgDomainFederationConfiguration. Requires Domain.ReadWrite.All AND Directory.AccessAsUser.All (both needed - known issue). Get ADFS params from existing federated domain or metadata.

---

### Cannot convert federated domain to managed after ADFS server uninstalled. Set-MsolADFSContext fails.
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: ADFS server removed before domain conversion. Standard cmdlets require active ADFS.

**Solution**: Use Set-MsolDomainAuthentication or Get-MsolUser | Convert-MsolFederatedUser directly without ADFS context. Passwords lost after conversion.

---

### Cannot add child federated domain with New-MsolFederatedDomain when parent uses third-party STS (Shibboleth). Error asks for ADFS context.
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: New-MsolFederatedDomain only works with AD FS as IDP. Fails for 3rd-party IdPs.

**Solution**: Use New-MsolDomain -Name child.domain -Authentication Federated. For non-ADFS: use New-MsolDomain, Set-MsolDomainAuthentication, Set-MsolDomainFederationSettings.

---

### Update-MsolFederatedDomain -SupportMultipleDomain fails. IssuerUri mismatch between ADFS service identifier and domain-based URI.
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: First federated domain set up without -SupportMultipleDomain. HAADJ script with multipleVerifiedDomainNames=true adds claim rule changing issuerURI format.

**Solution**: Delete claim rules, rerun with multipleVerifiedDomainNames=false. Or reconfigure with -SupportMultipleDomain. Check via Get-MsolDomainFederationSettings.

---

### Federated users must sign in twice (enter username and password two times) before being prompted for MFA in AD FS with Azure MFA Server or third-pa...
**Score**: 🔵 5.5 | **Source**: MS Learn

**Root Cause**: MsolDomainFederationSettings has SupportsMFA=$true and PromptLoginBehavior=TranslateToFreshPasswordAuth, causing Entra ID to send wfresh=0 to ADFS which forces a fresh password login before MFA

**Solution**: Change PromptLoginBehavior to NativeSupport: Set-MsolDomainFederationSettings -DomainName <domain> -PreferredAuthenticationProtocol WsFed -SupportsMfa $True -PromptLoginBehavior NativeSupport. Requires AD FS on Windows Server 2016 or 2012 R2 with July 2016 update KB3172614

---

### Error setting up second federated domain: 'The federation service identifier specified in the AD FS 2.0 server is already in use' when running New-...
**Score**: 🔵 5.5 | **Source**: MS Learn

**Root Cause**: Entra ID requires a unique federation brand URI per federated domain, but AD FS uses a global value by default for all federated trusts - second domain reuses existing URI

**Solution**: 1) Install Update Rollup 1 for AD FS 2.0. 2) Delete existing Microsoft Office 365 Identity Platform relying party trust. 3) Re-create with -supportmultipledomain switch: Update-MSOLFederatedDomain -DomainName <domain> -supportmultipledomain. 4) Add new domain: New-MSOLFederatedDomain -domainname <domain> -supportmultipledomain

---

### Federated user is unexpectedly prompted to enter credentials when accessing Office 365/Azure/Intune - expected SSO experience but gets forms-based ...
**Score**: 🟡 4.5 | **Source**: MS Learn

**Root Cause**: Internal client resolves AD FS endpoint to proxy IP instead of federation service IP, or IE security/proxy settings not configured for SSO, or browser doesn't support Integrated Windows Auth, or client can't connect to on-premises AD

**Solution**: 1) Fix DNS: nslookup sts.contoso.com must resolve to internal ADFS IP for internal clients. 2) IE: add AD FS endpoint to Local Intranet zone (Tools > Internet Options > Security > Local Intranet > Sites > Advanced). 3) Configure proxy exceptions for AD FS endpoint. 4) Use browser supporting Integrated Windows Auth. 5) Verify AD connectivity: nltest /dsgetdc:<FQDN>

---

## Phase 4: Avd
> 7 related entries

### AVD SSO via ADFS fails with SendLogonCertRequest (-2146233029) error. ADFS service consumes excessive memory, Resource-Exhaustion-Detector events l...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: ADFS acts as Enrollment Agent for AVD logon certificates. Each certificate request leaves a public key artifact in the ADFS service account profile under SystemCertificates\My\Certificates. Over time tens of thousands accumulate degrading performance. Unlike WHFB certificates, LogonCertificate template lacks the CTPRIVATEKEY_FLAG_HELLO_LOGON_KEY flag causing CertEnroll to install certs in the enrollment agent store.

**Solution**: Set the CTPRIVATEKEY_FLAG_HELLO_LOGON_KEY flag on the LogonCertificate template: certutil.exe -dsTemplate <TemplateName> msPKI-Private-Key-Flag +CTPRIVATEKEY_FLAG_HELLO_LOGON_KEY. Then clean up accumulated certificates using PowerShell script with X509Store to find and remove certificates by template name. Run cleanup as ADFS service account (scheduled task for gMSA). Deletion may be slow (~10-166 certs/sec).

---

### When connecting to Azure Virtual Desktop (AVD) with smart card or user certificate via ADFS federated CBA, the Session Desktop prompts for password...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Forms-based authentication is enabled as an authentication method on the ADFS External (Extranet) interface, causing a credential prompt at the STS before certificate authentication can occur.

**Solution**: Remove/uncheck Forms-based authentication from the Extranet authentication methods in ADFS. Also ensure Certificate authentication is enabled on the Extranet. Users should click More choices and select the smart card credential, then enter PIN. Note: smart card users will still see a PIN prompt at the STS; this unlocks the smart card and is not part of the authentication pipeline.

---

### Kerberos tickets not issued via KDCProxy for Azure Virtual Desktop. Network Level Authentication (NLA) fails when connecting to AVD host pool using...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: After KDCProxy is configured, domain controllers have stale Domain Controller Authentication certificates that prevent Kerberos ticket issuance via the KDC Proxy service.

**Solution**: Request new Domain Controller Authentication certificates on each domain controller, delete the old certificates, and reboot all domain controllers. Enable Kerberos-KDCProxy Operational event logging for diagnosis. Also verify: (1) Server Authentication certificate is bound to TCP 443 (netsh http show sslcert ipport=0.0.0.0:443). (2) KDCProxy is properly configured per docs.

---

### Azure AD Federated Certificate Based Authentication fails for Azure Virtual Desktop. Smart card or certificate sign-in to Azure AD for AVD does not...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The issuer and serialnumber AD FS claim rules are configured on the wrong Relying Party Trust. When AVD SSO is configured, a separate Windows Virtual Desktop ADFS Logon SSO RP Trust is created, but the CBA claims must be on the Microsoft Office 365 Identity Platform Worldwide RP Trust instead.

**Solution**: Add issuer and serialnumber AD FS claim rules to the Microsoft Office 365 Identity Platform Worldwide Relying Party Trust, NOT the Windows Virtual Desktop ADFS Logon SSO RP Trust. Deploy root and intermediate CA certificates to Azure AD using Microsoft Graph PowerShell cmdlets. Ensure WAP certauth endpoint (port 443 or 49443) is accessible, with hosts file entry for certauth.<adfs-farm-name> if WAP is domain-joined.

---

### AVD SSO with ADFS fails with errors: MSIS9623 GlobalAuthenticationPolicy doesn't allow OAuth JWT Bearer request; or MSIS9265 client not configured ...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: ADFS SsoSecretType configuration does not match what is stored in Azure Key Vault. E.g., SsoSecretType is set to SharedKeyInKeyVault but Key Vault has a certificate, or vice versa.

**Solution**: Set SsoSecretType on ADFS to match Key Vault content. For shared key: Update-AzWvdHostPool with -SsoSecretType SharedKeyInKeyVault. For certificate: Update-AzWvdHostPool with -SsoSecretType CertificateInKeyVault.

---

### AVD SSO fails with error: Cannot find certificate or public key to validate message/token signature obtained from OAuth Client https://client.wvd.m...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: An ADFS Client was not created with the identifier https://client.wvd.microsoft.com. As of April 18, 2022, WVD started automatically redirecting the Web Client to this URL, but the ADFS setup script did not include this new client identifier.

**Solution**: Update the ADFS Client setup script to include the new client identifier https://client.wvd.microsoft.com and re-run to create the missing ADFS Client registration.

---

### AVD SSO CertLogonRequest times out after ~30 seconds with TaskCanceledException / IOException. ADFS service consumes extremely high virtual memory ...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: ADFS uses Certificate Enrollment API for user logon certificates. The API installs certificates into the ADFS service account personal certificate store, which grows unbounded. When the store accumulates thousands of certificates, enumeration becomes extremely slow, causing timeouts and memory exhaustion.

**Solution**: Clean up accumulated certificates from the ADFS service account personal certificate store (under the service account profile AppData). Consider implementing periodic certificate store cleanup automation.

---

## Phase 5: Verified Id
> 6 related entries

### Verified ID Issuance: "token_validation.invalid_openid_token" / "No OpenId token claim found matching required claim family_name" for B2C users.
**Score**: 🟢 9.5 | **Source**: ADO Wiki

**Root Cause**: B2C user account does not have First/Last name populated. Credential rules definition requires these claims.

**Solution**: Edit user account properties to supply First name and Last name, then re-attempt credential request.

---

### Verified ID Issuance: "Cannot read properties of undefined (reading 'length')" in sample app. API returns "No acceptable roles were found in access...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Verifiable Credentials Service Request API permissions not granted on App registration. Access token missing VerifiableCredential.Create.All role.

**Solution**: Grant Verifiable Credentials Service Request API permissions on the App registration and ensure admin consent is given.

---

### Verified ID Issuance: "ServiceUnreachableException failed to sign digest" in Authenticator when scanning QR code.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Key Vault permissions incorrect for Verifiable Credential Issuer Service. Missing Create, Delete, Sign permissions for Keys.

**Solution**: Grant the Verifiable Credential Issuer Service the required Key Vault permissions: Create, Delete, and Sign for Keys.

---

### Verified ID Issuance: 403 "At least one unexpected OpenID token attestation encountered: https://self-issued.me" when adding IdToken credential.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: IdToken flow payload incorrectly modified to include pin and claims sections (only for IdTokenHint flow).

**Solution**: Remove pin and claims sections from issuance request payload for IdToken flow. These are only for IdTokenHint scenarios.

---

### Verified ID Issuance: 504 Service Error. Users in specific regions fail while VPN/US-based users succeed. Authenticator logs show timeout on mobile...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Customer network/firewall blocks inbound traffic from certain Azure regions. Verified ID service callback URI must be accessible globally.

**Solution**: Check network/firewall rules. Ensure callback URI accessible globally. Use FQDNs in firewall rules. Download Azure IP Ranges and Service Tags for required IPs.

---

### Not receiving callback events during Verified ID issuance or presentation flow
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: Callback URL is not reachable from the Verified ID service, or there are networking issues preventing delivery of callback requests.

**Solution**: Verify callback URL is accessible by pasting it in browser window and checking for networking errors. Check web server logs where the app is hosted. Review Microsoft Authenticator logs and Verified ID service logs for error details.

---

## Phase 6: Claim Rules
> 4 related entries

### ADFS claim rule for x-ms-forwarded-client-ip does not work. MDM managed devices cannot access Exchange Online despite claim rule allowing their IPs.
**Score**: 🟢 10.0 | **Source**: OneNote

**Root Cause**: ADFS claim rule parameters (x-ms-*) are case-sensitive. Uppercase letters cause silent failure. x-ms-forwarded-client-ip shows WAP/proxy IP, not actual client IP.

**Solution**: Ensure exact lowercase for claim type URIs. Use regex with word boundaries for IP matching. Collect WAP/ADFS debug+admin+audit logs. Test regex at regex101.com.

---

### ADFS issues windowsaccountname claim with different case than AD samAccountName; case-sensitive apps fail to recognize user. Format persists in cac...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: ADFS reads windowsaccountname from Windows/Kerberos logon session context, preserving case as typed at login. Cached until computer restart

**Solution**: Configure additional ADFS claim rules to query AD directly for sAMAccountName instead of using session context. Note: domain name hard-coded, multi-domain needs extra rules

---

### Federated user authentication fails because ADFS immutableID (sourceAnchor) and UPN issuance claim rules do not match the attributes configured in ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The claim rule variables for immutableID and UPN in the ADFS Relying Party Trust for Azure AD do not match the sourceAnchor and userPrincipalName attributes configured in AAD Connect. This can happen when the trust is manually managed instead of via AAD Connect.

**Solution**: 1) Open AAD Connect > View current configuration > note sourceAnchor and userPrincipalName attributes. 2) On ADFS server, open ADFS Management > Relying Party Trusts > select Azure AD RP > Edit Claims Issuance Policy. 3) Verify immutableID and UPN claim rule variables match AAD Connect settings. 4) Consider upgrading to latest AAD Connect and managing the trust automatically.

---

### User denied access to ADFS relying party but the specific denying claim rule is unclear
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: An issuance authorization claim rule is explicitly denying user access, or a required claim is missing from the token output

**Solution**: Set up Claims X-Ray RP with same issuance policy and auth policy as failing RP. Have user login to get full claims output. Compare claims against issuance authorization rules to identify which rule denies access or which expected claim is missing.

---

## Phase 7: Esl
> 4 related entries

### ADFS Extranet Smart Lockout (ESL) cmdlets (Get-ADFSAccountActivity, Set-ADFSAccountActivity, Reset-ADFSAccountLockout) fail when executed remotely,...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: ESL REST endpoint requires ADFS local administrator privilege executed locally on the primary ADFS server. Remote PSH uses IWA auth then ESL cmdlets reconnect to the REST endpoint using IWA again (double-hop), causing authentication to fail. This is by design in ADFS delegation model.

**Solution**: Use PowerShell Just Enough Administration (JEA) to delegate ESL commands to service desk workers: 1) Create JEA session configuration allowing only ESL cmdlets; 2) Register the JEA endpoint on the primary ADFS server; 3) Service desk connects via Enter-PSSession to the JEA endpoint.

---

### ADFS Extranet Smart Lockout (ESL) not working after enabling. Get-ADFSAccountActivity fails even though ExtranetLockoutEnabled shows True. Lockout ...
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: ADFS service was not restarted on all farm nodes after enabling ESL. The new ESL mode requires a service restart on every node to take effect.

**Solution**: Restart ADFS service on ALL nodes in the farm: Restart-Service adfssrv. For WID farms, wait 5 minutes between restarts for config sync.

---

### Users from external trust domain cannot authenticate via ADFS extranet while internal access works. ADFS debug log shows CrackName DS_NAME_ERROR_NO...
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: ADFS ESL uses DsCrackNames API which requires forest trust. External trust breaks CrackNames RPC calls because DsCrackNames only resolves accounts through GC lookups and forest trusts, not external trusts.

**Solution**: Change trust type from external trust to two-way forest trust. Alternatively, disable ESL (not recommended as it reduces security). External Lockout feature explicitly does not support External Trusts.

---

### After running Reset-AdfsAccountLockout on primary ADFS server, user still cannot log in on secondary ADFS server. Secondary shows IsLockedOut=true ...
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: ESL secondary nodes sync user activity from master only per user per hour (DefaultUserActivitySyncWindow = 1 hour, hardcoded). Reset-AdfsAccountLockout clears the counter on primary but is NOT auto-synced to secondaries. Secondary only contacts master when local data is stale (older than UserActivitySyncWindow).

**Solution**: After Reset-AdfsAccountLockout: (1) Direct user auth to primary ADFS server first, OR (2) Wait up to 60 minutes for UserActivitySyncWindow to expire. If ExtranetObservationWindow < 1 hour, the lockout will clear when that window passes. Use PowerShell script to query AccountActivity table from AdfsArtifactStore DB to monitor LastUpdate timestamps.

---

## Phase 8: Fbl
> 4 related entries

### After FBL raise from 2012R2 to 2016, secondary ADFS server shows Event ID 344 and 345 synchronization errors. Get-AdfsSyncProperties shows last syn...
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: FBL raise was executed while farm was still in mixed mode (2012R2 + 2016 servers). Secondary 2016 server retained old FBL 1 database (AdfsConfiguration) but FBL is set to version 3 (AdfsConfigurationV3), creating a database/FBL mismatch.

**Solution**: Re-add the secondary node with Add-AdfsFarmNode -OverwriteConfiguration -PrimaryComputerName PrimaryWIDHost -PrimaryComputerPort 80 -ServiceAccountCredential $cred -CertificateThumbprint thumbprint. If AdfsArtifactStore.mdf files are missing from C:\Windows\WID\Data\, copy them from the primary server first.

---

### Error about rowguid issue when trying to raise the FBL on ADFS farm using SQL database backend.
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: SQL database has replication enabled which conflicts with the FBL raise operation (Invoke-AdfsFarmBehaviorLevelRaise) because replication uses rowguid columns.

**Solution**: Stop SQL database replication before raising the FBL. After ADFS farm upgrade completes, re-enable SQL replication. Engage SQL Replication Team for assistance with stopping/starting replication safely.

---

### Event ID 180 is logged and ADFS endpoints are missing in Windows Server 2016 after installing March 2018 KB4088787 update on primary node of farm r...
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: Known issue in KB4088787 causing regression and reordering of rows in the ADFS configuration database on farms that were raised from FBL 1 to FBL 3.

**Solution**: Follow resolution in Microsoft KB article: https://docs.microsoft.com/en-us/troubleshoot/windows-server/identity/adfs-error-180-endpoints-missing

---

### ADFS farm FBL upgrade (Invoke-AdfsFarmBehaviorLevelRaise) fails, and retrying the command errors with message that the database already exists.
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: The failed upgrade command may have partially created the new configuration database (e.g., AdfsConfigurationV3). Retrying conflicts with the already-existing partial database.

**Solution**: Run Restore-AdfsFarmBehaviorLevel to delete the newly created database, then run Invoke-AdfsFarmBehaviorLevelRaise again. Reference: https://docs.microsoft.com/en-us/powershell/module/adfs/restore-adfsfarmbehaviorlevel

---

## Phase 9: Kb
> 4 related entries

### Unable to create Group Managed Service Account during ADFS configuration on Server 2019.                         Receive error message:    ...
**Score**: 🔵 7.0 | **Source**: KB

**Root Cause**: The AD FS configuration powershell/installer looks for the CN=Managed Service Accounts, container by WKGUID.   
  
  
     
  
  
    Expected value:
  
  
    
      
    
    
      
    
      
    Customer didn
    
    t have a CN=Managed Service Accounts container in AD. Instead he had created an OU with the same name.
    
      
    
      
    As the container couldn
    
    t be found to create GMSA ,it reports above error and fails.
  
  
     
  
  
  

**Solution**: Please review article:  4549462 ADDS How to force re-running parts of ADPREP /domainprep Implement the steps needed to re-play the task for the &quot;Managed Service Accounts&quot; Container. It's about re-running operations GUIDs (Windows Server 2008 R2): Operation 75: {5e1574f6-55df-493e-a6-71-aa-ef-fc-a6-a1-00} Operation 76: {d262aae8-41f7-48ed-9f-35-56-bb-b6-77-57-3d}

---

### When customers try to customize error messages on ADFS page they see duplicate entries of the attributes as:The above ADFSGlobalWebContent has dupl...
**Score**: 🔵 7.0 | **Source**: KB

**Root Cause**: The reason being that each locale has its own web content and customization of the error pages. When the customization is done without specifying the locale it by default updates the Global web content where the value of locale is &quot;NULL&quot;.In order to customize the error messages for a particular locale you need to explicitly call out the name of the locale while running the PowerShell cmdlet as below: To avoid confusion you can remove the locale which is not required in environment by b

**Solution**: In order to customize the error messages for a particular locale you need to explicitly call out the name of the locale while running the PowerShell cmdlet as: Set-AdfsGlobalWebContent -Locale  en -ErrorPageGenericErrorMessage &quot;<Message>&quot;

---

### We have created ADFS claim rule to block all external request except the particular Active directory group of users. After creating the rule, we st...
**Score**: 🔵 7.0 | **Source**: KB

**Root Cause**: In ADFS Audit / debug logs, when claim processing was happening, the group was not being evaluated. The group SID S-1-5-21-1010517290-1075059173-903097961-179968 assigned in the ADFS claim rule was for a distribution group and not a Security group.

**Solution**: Changed the group type to Security group and ADFS started processing the group claims and issued deny claim as it should.

---

### ADFS gives a responder token back to relying party and the event viewer logs the below eventLog Name:      AD FS/AdminSource:        AD FSDate:    ...
**Score**: 🔵 7.0 | **Source**: KB

**Root Cause**: This mostly happens when the relying party sends a signed request to ADFS server and ADFS server could not verify the revocation of the certificate which is used to sign the authentication request.

**Solution**: First thing we need to do is to identify the certificate from the thumbprint found in the event 316 in ADFS admin log. Once done export the certificate to file path.Then run the below command to verify if the revocation is getting successful or not.certutil -f �urlfetch -verify &quot;<Path of the exported RP signing cert>&quot;In case the revocation fails you will get an error as below The above error means the CRL distribution list is not accessible from the ADFS server. The CRL distribution li

---

## Phase 10: Saml
> 3 related entries

### SAML authentication to ADFS RP fails when POST binding is used and the SAML request does not contain a signing certificate. ADFS uses only the firs...
**Score**: 🟢 10.0 | **Source**: OneNote

**Root Cause**: For POST binding, ADFS expects the signing certificate embedded in the SAML request. If missing, ADFS picks the first cert from the database (not sorted). If that cert does not match the one used by the RP to sign, validation fails.

**Solution**: Ensure RP includes signing certificate in the SAML request body. For Redirect binding, ADFS scans all certs. For POST binding without embedded cert, verify the first cert in ADFS RP Trust matches the RP signing cert.

---

### AADSTS500082: SAML assertion is not present in the token — when converting ADFS-AAD federation from WS-fed to SAML protocol.
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: ADFS returns InvalidNameIDPolicy because it cannot provide NameID in the format AAD requests (urn:oasis:names:tc:SAML:2.0:nameid-format:persistent). Also missing IDPEmail attribute in claim rules.

**Solution**: 1) Remove extra RPID, keep only urn:federation:partner.microsoftonline.cn. 2) Change claim rule NameID format to persistent. 3) Add IDPEmail claim rule mapping UPN to IDPEmail. 4) To revert: Set-MsolDomainAuthentication Managed → delete RP → Convert-MsolDomainToFederated → Update-MsolFederatedDomain.

---

### SAML auth to ADFS RP fails with Event ID 364/303: MSIS0038 SAML Message has wrong signature.
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Mismatch between signing cert in SAML request and cert in ADFS RP Trust config. RP vendor using wrong cert.

**Solution**: Verify ADFS via IDP-initiated page. Capture Fiddler + Debug logs. Compare certs. RP vendor must fix signing cert.

---

## Phase 11: Mfa
> 3 related entries

### AD FS 2016 with Azure MFA does not support Alternate Login ID. Authentication fails when using alternate login ID with Azure MFA adapter.
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Known limitation by design: ADFS 2016 Azure MFA adapter does not support alternate login ID.

**Solution**: Known limitation. Workaround: use UPN instead of alternate login ID, or use a different MFA method.

---

### Unexpected MFA prompts or MFA not triggering as expected on ADFS relying party
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: MFA claim rules misconfigured at global level (AdditionalAuthenticationRules) or RP level, or Access Control Policy (ADFS 2016+) forcing/skipping MFA based on device state, network location, or group membership

**Solution**: Check global: Get-ADFSAdditionalAuthenticationRules. Check RP: Get-ADFSRelyingPartyTrust -TargetName <RP> | Select -ExpandProperty AdditionalAuthenticationRules. For ADFS 2016+: check AccessControlPolicyName. MFA triggers when issue contains multipleauthn claim. Review conditions (isregistereduser, insidecorporatenetwork, group).

---

### Users stuck in MFA verification loop - keep getting prompted for MFA but cannot complete it. Occurs when using ADFS with both Keep me signed in (KM...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Remember my device is incompatible with ADFS KMSI when ADFS performs MFA via MFA Server or 3rd party. When remember device days expire, Azure AD requests fresh MFA, but ADFS returns its existing cached token instead of performing new MFA, creating an infinite loop.

**Solution**: Disable either Keep me signed in on ADFS or Remember my device - do not use both simultaneously when ADFS is performing MFA. If using Azure AD Premium, migrate to Conditional Access sign-in frequency and persistent browser policies instead.

---

## Phase 12: Alternate Login Id
> 3 related entries

### ADFS alternate login ID with Employee Number fails. Set-AdfsClaimsProviderTrust succeeds but authentication with employee number (e.g., 5555) fails.
**Score**: 🟢 10.0 | **Source**: OneNote

**Root Cause**: Alternate login ID attribute must conform to UPN format (e.g., 5555@domain.com). Plain digits are not valid. Attribute must also be indexed, in Global Catalog, and GC-replicated.

**Solution**: 1) Ensure AD attribute is GC-replicated (AD Schema snap-in, check Replicate this attribute to the Global Catalog). 2) Format employee number as UPN: 5555@domain.com. 3) Workaround: customize ADFS onload.js to auto-append domain suffix for non-UPN input.

---

### Email sign-in (Alternate Login ID) not working for federated domain users; redirected to STS but sign-in fails
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Alternate Login ID with email is not supported for federated domains (AD FS). Only PHS, PTA, and Managed authentication are supported

**Solution**: Email as alternate sign-in is not supported with AD FS. Deploy Staged Rollout of Seamless SSO and Pass-through Authentication to migrate away from federation

---

### Unable to configure Alternate Login ID using description attribute for ADFS. Customer needed an attribute other than mail as some users had UPN ove...
**Score**: 🔵 7.0 | **Source**: KB

**Root Cause**: The Description Attribute is not replicated in Global Catalog PAS (Partial Attribute Set).

**Solution**: Include description attribute to be part of PAS on the Global Catalog and allow it to be indexed for searches. Once replication happened between GCs, the command to set Alternate Login ID with Description Attribute worked.

---

## Phase 13: Ldap
> 3 related entries

### ADFS configuration to authenticate users stored in AD LDS (LDAP directories) fails when using Get-Credential approach from official documentation.
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: The official Microsoft documentation PowerShell example for creating LDAP server connection uses Get-Credential incorrectly for AD LDS scenarios. The doc approach does not work with AD LDS.

**Solution**: Use PSCredential directly: $ldapuser='CN=admin,OU=...'; $ldappassword=ConvertTo-SecureString -String 'pwd' -AsPlainText -Force; $Credential=New-Object System.Management.Automation.PSCredential -ArgumentList $ldapuser,$ldappassword. Then use $Credential in New-AdfsLdapServerConnection.

---

### ADFS LDAP query fails when UserContainer OU name contains a space (e.g. OU=User Container). ADFS URL-encodes the space as %20 which LDAP server can...
**Score**: 🟢 8.0 | **Source**: OneNote

**Root Cause**: Known ADFS bug: ADFS incorrectly URL-encodes spaces in LDAP UserContainer parameter, translating spaces to %20 in the LDAP query, which the LDAP server cannot interpret.

**Solution**: No workaround available. Known bug reported to ADFS product team. Avoid spaces in OU names if possible.

---

### Unable to access the Relying Party configured on ADFS. Error: POLICY0018: Query to attribute store Active Directory failed: The supplied credential...
**Score**: 🔵 7.0 | **Source**: KB

**Root Cause**: Missing Registry Value MSOIDSSP under HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Lsa\Security Packages.

**Solution**: Add MSOIDSSP value under registry HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Lsa\Security Packages and reboot the server.

---

## Phase 14: Token Signing
> 3 related entries

### Update-MsolFederatedDomain fails with 'Invalid length for a Base-64 char array or string' when trying to update O365 RPT token-signing certificate....
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: When ADFS metadata is not publicly accessible from the internet, the O365 RPT cannot auto-update the token-signing cert. The Update-MsolFederatedDomain cmdlet fails with base64 parsing errors.

**Solution**: Use Set-MsolDomainFederationSettings as workaround: 1) Export token-signing cert from ADFS console in base64 format, 2) Read cert file, strip BEGIN/END headers and newlines, 3) Run Set-MsolDomainFederationSettings -DomainName 'domain' -SigningCertificate '$cert'. Can run from any PC.

---

### ADFS token signing (TS) certificate does not match the certificate registered with the federation partner (e.g., Azure AD or third-party RP), causi...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: If AutoCertificateRollover is TRUE, ADFS auto-generates new TS certificates 30 days before expiration and promotes them 25 days before expiration. Federation partners may not have picked up the new certificate. If AutoCertificateRollover is FALSE, manual replacement was not performed in time.

**Solution**: 1) Run Get-ADFSCertificate -CertificateType token-signing to get current primary cert (isPrimary=TRUE). 2) Run Get-ADFSProperties | FL AutoCertificateRollover to check auto-rollover status. 3) Compare ADFS primary TS cert with partner's cert. 4) If mismatch: for partners that cannot consume federation metadata, manually send the new .cer/.p7b public key; for partners that can consume metadata, ensure they refresh federation metadata to pick up the new cert.

---

### Federation/SSO breaks after ADFS token-signing or token-decrypting certificate is renewed. Partner applications or relying parties reject tokens si...
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: Federation partners (relying party trusts and claims provider trusts) still trust the old certificate and have not been updated with the new one after ADFS auto-rollover or manual renewal.

**Solution**: For partners who CANNOT consume federation metadata: manually export the new token-signing certificate public key (.cer or .p7b including the chain) and send it to them for import on their side. For partners who CAN consume federation metadata: ensure they re-fetch the updated federation metadata URL to pick up the new certificate automatically. Verify all RP and CP trusts reflect the new primary certificate before decommissioning the old one.

---

## Phase 15: Aadc
> 3 related entries

### After AAD Connect upgrade, federated domain authentication fails. IssuerID in ADFS claim rule is corrupted - e.g. 'technodyne.co.uk' issuerID becom...
**Score**: 🟢 10.0 | **Source**: OneNote

**Root Cause**: AAD Connect upgrade process replaces the 'Issue the IssuerID when it is not a computer account' ADFS claim rule with a buggy regex: regexreplace(c1.Value, "^((.*)([.|@]))?(?<domain>[^.]*[.].*)$", ...) which strips subdomain from two-part TLD domains like .co.uk.

**Solution**: Manually fix the ADFS claim rule. Replace the corrupted regex with: regexreplace(c1.Value, ".+@(?<domain>.+)", "http://${domain}/adfs/services/trust/"). This is a known AADC bug - verify correct issuerID via Get-MsolDomainFederationSettings.

---

### After AAD Connect upgrade, ADFS federated SSO breaks. IssuerID claim rule regex changed, causing incorrect IssuerID for multi-part TLDs (e.g. techn...
**Score**: 🟢 10.0 | **Source**: OneNote

**Root Cause**: AAD Connect upgrade replaces the IssuerID claim rule regex from simple UPN-based pattern to broader regex (^((.*)([.|@]))?(?<domain>[^.]*[.].*)$) which incorrectly parses multi-part TLDs like .co.uk. This is a known AAD Connect bug.

**Solution**: Manually revert the 'Issue the IssuerID when it is not a computer account' claim rule to use the simpler regex: c1:[Type=UPN] && c2:[Type=accounttype,Value=User] => issue(issuerid = regexreplace(c1.Value, '.+@(?<domain>.+)', 'http://${domain}/adfs/services/trust/')). Also check AAD Connect Health alerts for ADFS config issues and apply recommended fixes.

---

### AADC upgrade fails with 'Could not connect to primary ADFS server' because primary ADFS server changed but AADC still references old server
**Score**: 🔵 7.0 | **Source**: OneNote

**Root Cause**: AADC stores initial ADFS primary server info in PersistedState.xml (Base64 encoded). Server change does not auto-update this config

**Solution**: Edit %ProgramData%\AADConnect\PersistedState.xml, find IAdfsContext.TargetAdfsServers, decode old Base64 server name, encode new server FQDN to Base64, replace, then retry upgrade

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | ADFS claim rule for x-ms-forwarded-client-ip does not work. MDM managed devic... | ADFS claim rule parameters (x-ms-*) are case-sensitive. U... | Ensure exact lowercase for claim type URIs. Use regex wit... | 🟢 10.0 | OneNote |
| 2 | Chrome cannot access ADFS sign-in page from external network (via WAP/ADFS pr... | After a Windows update to Windows Server 2012 R2, the ADF... | 1) Disable weak cipher suites (especially 3DES-based) on ... | 🟢 10.0 | OneNote |
| 3 | SAML authentication to ADFS RP fails when POST binding is used and the SAML r... | For POST binding, ADFS expects the signing certificate em... | Ensure RP includes signing certificate in the SAML reques... | 🟢 10.0 | OneNote |
| 4 | WAP configuration wizard fails with 401 Unauthorized. WAP proxy cannot downlo... | Exact IP:port SSL bindings on ADFS server take precedence... | Remove exact IP:port SSL bindings on ADFS/WAP servers. Ad... | 🟢 10.0 | OneNote |
| 5 | ADFS service fails to start after SSL certificate replacement. Event 133: cer... | ADFS does not support CNG (Cryptographic Next Generation)... | Replace certificate with one NOT using CNG keys. Check wi... | 🟢 10.0 | OneNote |
| 6 | ADFS service running but /adfs/services/trust/mex returns 503. Office client ... | Certificate KeySpec=2 (AT_SIGNATURE) instead of AT_KEYEXC... | Delete certificate and reimport with: certutil -importpfx... | 🟢 10.0 | OneNote |
| 7 | ADFS alternate login ID with Employee Number fails. Set-AdfsClaimsProviderTru... | Alternate login ID attribute must conform to UPN format (... | 1) Ensure AD attribute is GC-replicated (AD Schema snap-i... | 🟢 10.0 | OneNote |
| 8 | ADFS Extranet Lockout feature does not work for user accounts from a trusted ... | Extranet Lockout requires PDC of the user's domain to be ... | 1) Ensure PDC of each trusted domain is reachable from AD... | 🟢 10.0 | OneNote |
| 9 | After AAD Connect upgrade, federated domain authentication fails. IssuerID in... | AAD Connect upgrade process replaces the 'Issue the Issue... | Manually fix the ADFS claim rule. Replace the corrupted r... | 🟢 10.0 | OneNote |
| 10 | After AAD Connect upgrade, ADFS federated SSO breaks. IssuerID claim rule reg... | AAD Connect upgrade replaces the IssuerID claim rule rege... | Manually revert the 'Issue the IssuerID when it is not a ... | 🟢 10.0 | OneNote |
| 11 | Verified ID Issuance: "token_validation.invalid_openid_token" / "No OpenId to... | B2C user account does not have First/Last name populated.... | Edit user account properties to supply First name and Las... | 🟢 9.5 | ADO Wiki |
| 12 | AADSTS50107: "The requested federation realm object does not exist" with mult... | Issuance Transform Rule is missing or outdated, or the AD... | Review and fix the issuerid claim issuance transform rule... | 🟢 9.5 | ADO Wiki |
| 13 | SSL inspection/termination breaks auth for Azure services (AVD, AIP, ADFS, Ap... | SSL inspection intercepts and re-signs TLS traffic, break... | Bypass SSL inspection for Azure service domains. Use Fidd... | 🟢 9.0 | OneNote |
| 14 | Convert-MsolDomainToFederated fails with Service not available in 21V. SOAP f... | MSOL deprecated. Backend returns TrustedRealm not found f... | Use Graph PowerShell New-MgDomainFederationConfiguration.... | 🟢 9.0 | OneNote |
| 15 | AADSTS500082: SAML assertion is not present in the token — when converting AD... | ADFS returns InvalidNameIDPolicy because it cannot provid... | 1) Remove extra RPID, keep only urn:federation:partner.mi... | 🟢 9.0 | OneNote |
| 16 | ADFS SSO for AVD fails during user login with certificate authentication error. | Certificate Authentication not enabled in ADFS. ADFS SSO ... | Enable Certificate Authentication in ADFS. Verify: Enterp... | 🟢 9.0 | OneNote |
| 17 | Sudden ADFS service outage; system log shows Event 4231 from Tcpip source ind... | AAD Connect Health Agent for ADFS version 3.0.244.0 has a... | Upgrade AAD Connect Health Agent for ADFS to version 3.1.... | 🟢 9.0 | OneNote |
| 18 | ADFS issues windowsaccountname claim with different case than AD samAccountNa... | ADFS reads windowsaccountname from Windows/Kerberos logon... | Configure additional ADFS claim rules to query AD directl... | 🟢 9.0 | OneNote |
| 19 | AD FS 2016 with Azure MFA does not support Alternate Login ID. Authentication... | Known limitation by design: ADFS 2016 Azure MFA adapter d... | Known limitation. Workaround: use UPN instead of alternat... | 🟢 9.0 | OneNote |
| 20 | Connect-EXOPSSession with -Credential uses basic auth (usernamemixed endpoint... | Get-Credential + -Credential sends creds to ADFS username... | Use Connect-EXOPSSession without -Credential to trigger b... | 🟢 9.0 | OneNote |
| 21 | WAP resets TLS client hello from applications. Application cannot establish S... | Application/WAF does not include SNI extension in TLS Cli... | Add fallback certificate to 0.0.0.0:443 on every ADFS and... | 🟢 9.0 | OneNote |
| 22 | ADFS Extranet Smart Lockout (ESL) cmdlets (Get-ADFSAccountActivity, Set-ADFSA... | ESL REST endpoint requires ADFS local administrator privi... | Use PowerShell Just Enough Administration (JEA) to delega... | 🟢 9.0 | OneNote |
| 23 | ADFS federation service fails to start after replacing SSL certificate. ADFS ... | ADFS 2.0/2.1 has no Set-AdfsSslCertificate cmdlet; certif... | 1) Use IIS Management Console to replace ADFS SSL cert (n... | 🟢 9.0 | OneNote |
| 24 | Chrome and Firefox cannot access ADFS IDP-initiated page with connection rese... | A local Group Policy SSL Cipher Suite Order was configure... | 1) On ADFS server open gpedit.msc - Computer Configuratio... | 🟢 9.0 | OneNote |
| 25 | Login failure in 2-farm ADFS scenario (account provider + resource provider, ... | Known bug in ADFS 2016 Token Binding feature. In 2-farm s... | Disable Token Binding on ADFS 2016: Set-AdfsProperties -E... | 🟢 9.0 | OneNote |
| 26 | Cross-forest users can sign in to ADFS with DomainBIOS\User but fail with UPN... | UPN suffix routing is not enabled for the external forest... | Enable UPN suffix routing for external domains: 1) Open A... | 🟢 9.0 | OneNote |
| 27 | Application requires HS256 (symmetric key) JWT token signing algorithm from A... | ADFS 2016 only supports RS256 (RSA-SHA256) for JWT token ... | Redesign the application to accept RS256 signed JWT token... | 🟢 9.0 | OneNote |
| 28 | Third-party desktop app prompts for credentials when authenticating via ADFS ... | ADFS ExtendedProtectionTokenCheck set to Required blocks ... | Set-ADFSProperties -ExtendedProtectionTokenCheck None. Al... | 🟢 9.0 | OneNote |
| 29 | Cannot convert federated domain to managed after ADFS server uninstalled. Set... | ADFS server removed before domain conversion. Standard cm... | Use Set-MsolDomainAuthentication or Get-MsolUser / Conver... | 🟢 9.0 | OneNote |
| 30 | Cannot add child federated domain with New-MsolFederatedDomain when parent us... | New-MsolFederatedDomain only works with AD FS as IDP. Fai... | Use New-MsolDomain -Name child.domain -Authentication Fed... | 🟢 9.0 | OneNote |
