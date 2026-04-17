# ENTRA-ID Kerberos Auth & Delegation — Quick Reference

**Entries**: 118 | **21V**: Partial (115/118)
**Last updated**: 2026-04-07
**Keywords**: kerberos, azure-files, seamless-sso, azure-fileshare, aes, kcd

> This topic has a fusion guide with detailed troubleshooting flow
> → [Full troubleshooting flow](details/kerberos.md)

## Issue Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | Azure Files storage account AD DS join script runs successfully but FSLogix/Kerberos authenticati... | Join-AzStorageAccount script parameters silently accept wrong values: 1) Encr... | Re-run Join-AzStorageAccount with correct parameters: $EncryptionType = 'AES2... | 🟢 9.0 | OneNote |
| 2 📋 | All O365 Basic Auth clients unable to access email. Modern Auth and OWA work fine. ADFS external ... | ADFS Extranet Lockout depends on PDC. When PDC unavailable, lockout blocks al... | Disable Extranet Lockout: Set-AdfsProperties -EnableExtranetLockout $false. F... | 🟢 9.0 | OneNote |
| 3 📋 | ADFS Smart Lockout PowerShell cmdlets return 401 Unauthorized error on ADFS 4.0 (Windows Server 2... | Duplicate SPN registered on two different AD accounts. ADFS internal REST API... | Check for duplicate SPNs using setspn -Q. Remove the duplicate SPN registrati... | 🟢 9.0 | OneNote |
| 4 📋 | AADJ device cannot SSO to on-prem share folder after initial join. Only works after rebooting (so... | By design, AADJ device needs reboot after initial setup to cache domain info ... | Reboot the AADJ device after initial join. By-design behavior. After reboot, ... | 🟢 9.0 | OneNote |
| 5 📋 | Seamless SSO fails after enabling via AAD Connect wizard; AADSTS81004 Kerberos authentication fai... | AZUREADSSOACCT computer account not created in on-premises AD when enabling S... | Reset SSO feature using Azure AD PowerShell (5-step process per MS docs). Ver... | 🟢 9.0 | OneNote |
| 6 📋 | Seamless SSO fails in IE; Fiddler shows Frame returned code 105 IFrame Running in un-trusted zone... | IE setting Allow status bar updates via script is disabled in Local Intranet ... | Enable Allow status bar updates via script in Internet Options > Local Intran... | 🟢 9.0 | OneNote |
| 7 📋 | Repeated Windows login prompt when RDP to HAADJ target machine via RDS AAD Auth - cannot sign in | Kerberos Server Object missing for user on-prem domain, or domain controller ... | 1. Verify Kerberos Server Object exists: run Set-AzureAdKerberosServer for ea... | 🟢 8.5 | ADO Wiki |
| 8 📋 | Repeated AAD login prompt (not Windows prompt) when RDP to HAADJ target via RDS AAD Auth - KDC_ER... | User account is member of Domain Admins group or local admin group. By design... | If customer needs Domain Admin login, change default Password Replication Pol... | 🟢 8.5 | ADO Wiki |
| 9 📋 | Kerberos authentication fails with KDC_ERR_ETYPE_NOTSUPP error in ADFS environment. Network trace... | Encryption type mismatch between client, ADFS service account, and domain con... | Ensure GPO encryption type settings match across all servers. For standard ac... | 🟢 8.5 | ADO Wiki |
| 10 📋 | gMSA password retrieval fails. Netlogon.log shows [MSA] NetpGMSAAddWrapper failed 0xc0000719 with... | msDS-SupportedEncryptionTypes attribute on the ADFS server computer account d... | Review msDS-SupportedEncryptionTypes attribute on both the ADFS server comput... | 🟢 8.5 | ADO Wiki |
| 11 📋 | Error 0x51f running 'klist get' for Azure SQL MI or Azure File Share. Fiddler tool installed on s... | Fiddler installs proxy config that interferes with Kerberos KDC proxy communi... | Uninstall Fiddler and delete registry keys under HKLM\SYSTEM\CurrentControlSe... | 🟢 8.5 | ADO Wiki |
| 12 📋 | Error 0x51f / 0x2ee5 (ERROR_INTERNET_INVALID_URL) with KDC proxy for Azure AD Kerberos. KDC proxy... | Missing space at end of Kerberos URL in KDC proxy GPO, or invisible/extra cha... | Verify KDC proxy URL format: must have space after '/kerberos' before closing... | 🟢 8.5 | ADO Wiki |
| 13 📋 | Error 0x51f mounting Azure File Share with per-user MFA Enforce enabled on user account. | Per-user MFA 'Enforce' mode blocks Kerberos ticket acquisition for Azure File... | Disable per-user MFA 'Enforce' option. Use Conditional Access policies for MF... | 🟢 8.5 | ADO Wiki |
| 14 📋 | Error 0x51f with 'ProxyHelperClientGetProxyForUrl failed: 1753' in Kerberos ETL. WinHTTP or IP He... | WinHTTP Web Proxy Auto-Discovery Service (WinHttpAutoProxySvc) or IP Helper s... | Ensure WinHttpAutoProxySvc and iphlpsvc services are running. | 🟢 8.5 | ADO Wiki |
| 15 📋 | After rotating Azure AD Kerberos trust key (Set-AzureAdKerberosServer -RotateServerKey), Azure Fi... | Entra ID activates new keys after 24h by default, causing mismatch and Kerber... | Delete trust and recreate: Remove-AzureADKerberosServerTrustedDomainObject th... | 🟢 8.5 | ADO Wiki |
| 16 📋 | Set-AzureAdKerberosServer fails: 'missing required properties. Property: UserAccount.SecondaryKrb... | $domainCred lacks sufficient privileges. Must be Domain Admins (root domain) ... | Ensure $domainCred is member of Domain Admins in root domain AND Enterprise A... | 🟢 8.5 | ADO Wiki |
| 17 📋 | Set-AzureADKerberosServer fails: 'The user has insufficient access rights' when creating AzureADK... | Account lacks SeEnableDelegationPrivilege on DCs, needed to set TRUSTED_TO_AU... | Check gpresult for 'Enable computer and user accounts to be trusted for deleg... | 🟢 8.5 | ADO Wiki |
| 18 📋 | Set-AzureAdKerberosServer fails: 'Strong authentication is required for this operation' (Director... | Mismatch: ldapserverintegrity=2 on root DC vs ldapClientIntegrity=0 on client... | Set LdapClientIntegrity=2 on client registry (HKLM\System\CurrentControlSet\S... | 🟢 8.5 | ADO Wiki |
| 19 📋 | Azure File Share mount fails with error 50076 'multi-factor authentication required' when CA poli... | Conditional Access policy applied to Azure Storage Service Principal (SPN) re... | Exclude Azure Storage SPN from the Conditional Access policy. | 🟢 8.5 | ADO Wiki |
| 20 📋 | Azure File Share mount fails with AADSTS50105 when 'Assignment required' enabled on Storage Servi... | SP used by AAD only for Kerberos ticket issuance, not Azure Files authorizati... | Disable 'Assignment required' on Storage Account SP. Use VNet ACLs, RBAC, fil... | 🟢 8.5 | ADO Wiki |
| 21 📋 | Set-AzureAdKerberosServer fails on Windows Server 2025: '2.2.10.6 Primary:Kerberos-Newer-Keys. Se... | Bug in AzureADHybridAuthenticationManagement module versions older than 2.4.7... | Update to AzureADHybridAuthenticationManagement module v2.4.71.0+ from PowerS... | 🟢 8.5 | ADO Wiki |
| 22 📋 | 'Could not load file or assembly Microsoft.Online.PasswordSynchronization.Rpc.dll' when using Azu... | VC++ 2013 Runtime (x64) not installed. Module auto-install fails due to depre... | Update to AzureADHybridAuthenticationManagement v2.4.71.0. Or manually instal... | 🟢 8.5 | ADO Wiki |
| 23 📋 | Set-AzureAdKerberosServer fails: 'Collision setting top level names on trust KERBEROS.MICROSOFTON... | 'windows.net' top-level name already in Name Suffix Routing of another AD tru... | Open AD Domains And Trusts > check trust properties > Name Suffix Routing > r... | 🟢 8.5 | ADO Wiki |
| 24 📋 | Error 0x51f when running klist get MSSQLSvc/<name>.database.windows.net:1433. Kerberos ticket acq... | Fiddler tool installs a proxy configuration that interferes with Kerberos KDC... | Uninstall Fiddler. Delete registry keys related to Fiddler under HKLM\SYSTEM\... | 🟢 8.5 | ADO Wiki |
| 25 📋 | Error 0x51f accessing Azure File Shares. Kerberos.etl shows failed to open connection to kdc prox... | KDC proxy server URL in Group Policy missing required space at end of /kerber... | Ensure URL format has a space after /kerberos in the KDC proxy URL value. Val... | 🟢 8.5 | ADO Wiki |
| 26 📋 | Error 0x51f mounting Azure Fileshare via net use. klist shows Error calling API LsaCallAuthentica... | User account has per-user MFA set to Enforce. Azure AD Kerberos-based authent... | Disable the per-user MFA Enforce option. No workaround available with Enforce... | 🟢 8.5 | ADO Wiki |
| 27 📋 | Error 0x51f accessing Azure resources. Kerberos.etl shows ProxyHelperClientGetProxyForUrl failed:... | WinHTTP Web Proxy Auto-Discovery Service (WinHttpAutoProxySvc) or IP Helper s... | Ensure WinHTTP Web Proxy Auto-Discovery Service and IP Helper service are set... | 🟢 8.5 | ADO Wiki |
| 28 📋 | Customer can access Azure MI or Azure Fileshare on-prem but authentication fails when connected o... | VPN client stores credentials in Credential Manager. Cached RAS credentials i... | Remove cached RAS credentials. See internal KB 3682d54a for methods to disabl... | 🟢 8.5 | ADO Wiki |
| 29 📋 | Set-AzureAdKerberosServer fails: Azure AD Kerberos Server object in Active Directory is missing r... | The domain credential used is not a member of both Domain Admins group in Roo... | Use a credential that is member of Domain Admins in Root domain AND Enterpris... | 🟢 8.5 | ADO Wiki |
| 30 📋 | Set-AzureADKerberosServer fails: Failed to create Azure AD Kerberos Server: Error sending directo... | Account lacks SeEnableDelegationPrivilege on DCs, required to set TRUSTED_TO_... | Run gpresult /h on DC. Check Enable computer and user accounts to be trusted ... | 🟢 8.5 | ADO Wiki |
| 31 📋 | Set-AzureAdKerberosServer fails: Failed to connect to domain: Strong authentication is required f... | Discrepancy between ldapserverintegrity=2 on root domain DC and LdapClientInt... | Set LdapClientIntegrity=2 on client via Group Policy: Computer Configuration ... | 🟢 8.5 | ADO Wiki |
| 32 📋 | After key rotation via Set-AzureAdKerberosServer -RotateServerKey, Azure file shares accessible f... | Entra ID activates new keys after 24 hours by default, causing key mismatch b... | Delete trust and recreate: Remove-AzureADKerberosServerTrustedDomainObject th... | 🟢 8.5 | ADO Wiki |
| 33 📋 | Error mounting Azure Fileshare: Account restrictions preventing this user from signing in. ASC sh... | Conditional Access policy applied to Azure Storage Service Principal Name blo... | Exclude the SPN of the Storage account from the Conditional Access policy. | 🟢 8.5 | ADO Wiki |
| 34 📋 | Error accessing Azure FileShare after enabling Assignment required under Azure Fileshare Service ... | The Azure Fileshare SP is used by AAD to issue Kerberos tickets, not for dire... | Do not enable Assignment required on the Azure Fileshare Service Principal. U... | 🟢 8.5 | ADO Wiki |
| 35 📋 | Set-AzureADKerberosServer fails: Collision setting top level names on trust KERBEROS.MICROSOFTONL... | Another forest trust already has windows.net in its Name Suffix Routing list,... | Open Active Directory Domains and Trusts > domain properties > Trust tab > ch... | 🟢 8.5 | ADO Wiki |
| 36 📋 | Set-AzureADKerberosServer fails: Could not load file or assembly Microsoft.Online.PasswordSynchro... | AzureADHybridAuthenticationManagement module install script uses deprecated -... | Upgrade to AzureADHybridAuthenticationManagement v2.4.71.0, or manually insta... | 🟢 8.5 | ADO Wiki |
| 37 📋 | Set-AzureADKerberosServer fails on Windows Server 2025: ArgumentOutOfRangeException Primary:Kerbe... | Known issue in AzureADHybridAuthenticationManagement modules older than v2.4.... | Upgrade to AzureADHybridAuthenticationManagement v2.4.71.0 which contains the... | 🟢 8.5 | ADO Wiki |
| 38 📋 | Establishing multiple Kerberos incoming trusts between different Microsoft Entra tenants and the ... | Multiple Kerberos incoming trusts across different Entra tenants to the same ... | Not supported. Feature request tracked in ADO 2372314. Customer must use a si... | 🟢 8.5 | ADO Wiki |
| 39 📋 | Seamless SSO AES ticket processing long latency - user on domain-joined machine gets password pro... | Windows SSPI API used for AES Kerberos ticket decryption introduces latency; ... | Workaround: switch AZUREADSSOACC to RC4 encryption type and roll over Kerbero... | 🟢 8.5 | ADO Wiki |
| 40 📋 | Users cannot benefit from Seamless SSO after Kerberos key rolled over more than once | Entra stores only current and previous Kerberos key; rolling over more than o... | Wait up to 10 hours for TGS to renew, or flush Kerberos cache with klist purg... | 🟢 8.5 | ADO Wiki |
| ... | *78 more entries* | | | | |

## Quick Troubleshooting Path

1. Check **kerberos** related issues (13 entries) `[onenote]`
2. Check **azure-files** related issues (7 entries) `[onenote]`
3. Check **adfs** related issues (4 entries) `[onenote]`
4. Check **setup** related issues (3 entries) `[ado-wiki]`
5. Check **seamless-sso** related issues (2 entries) `[onenote]`
6. Check **rds-aad-auth** related issues (2 entries) `[ado-wiki]`
7. Check **haadj** related issues (2 entries) `[ado-wiki]`
8. Check **encryption-type** related issues (2 entries) `[ado-wiki]`
