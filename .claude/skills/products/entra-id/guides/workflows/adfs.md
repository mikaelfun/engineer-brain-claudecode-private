# Entra ID ADFS Config & Troubleshooting — 排查工作流

**来源草稿**: ado-wiki-a-adfs-365-default-rules.md, ado-wiki-a-adfs-claims-xray-setup.md, ado-wiki-a-adfs-idpinitiated-signon-test.md, ado-wiki-a-adfs-issuerid-claim-issuance-deepdive.md, ado-wiki-a-adfs-wia-settings-check.md, ado-wiki-a-wap-trust-troubleshooter.md, ado-wiki-b-adfs-endpoints-reference.md, ado-wiki-b-adfs-enterprise-prt-event-1021.md, ado-wiki-b-adfs-gmsa-reference.md, ado-wiki-b-adfs-oauth-troubleshooting-guide.md... (+35 more)
**场景数**: 32
**生成日期**: 2026-04-07

---

## Scenario 1: ADFS Workflow - Check Sign-in Using IdpInitiatedSignOn
> 来源: ado-wiki-a-adfs-idpinitiated-signon-test.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Steps**
   - 1. Log-in to the AD FS server
   - 2. Open PowerShell
   - 3. Check if the ADFS sign on page is enabled:

---

## Scenario 2: ADFS Understanding the IssuerID Claim Issuance
> 来源: ado-wiki-a-adfs-issuerid-claim-issuance-deepdive.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting Steps**
   - 1. **Check registered IssuerURI**: `Get-MgDomainFederationConfiguration -DomainId <domain>`
   - 2. **Review ADFS claim rules**: Check all 4 IssuerID-related rules in the Azure AD Relying Party Trust
   - 3. **Verify UPN suffixes**: Ensure all UPN suffixes used by federated users have corresponding IssuerURI entries

### 相关错误码: AADSTS50107, AADSTS500083, AADSTS900023

---

## Scenario 3: ado-wiki-a-wap-trust-troubleshooter
> 来源: ado-wiki-a-wap-trust-troubleshooter.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. **Verify time is correct** on all AD FS and WAP servers. Check the time AND TIME ZONE. It should be within a 5-minute offset of the active directory domain. Compare time against the domain controll
- 2. **Verify updates are installed** on ALL AD FS and WAP servers:
- 3. **Obtain the federation service name**:
- 4. **Obtain the AD FS service account**:
- 5. **On WAP servers**, ping the federation service name and verify it resolves to an IP with a route to the AD FS servers (either AD FS server IP or VIP of load balancer).
- 6. **Attempt authentication** to: `https://<federation service name>/adfs/ls/idpinitiatedsignon.aspx` with an account that has admin rights on AD FS servers.
- 7. **Get service communication cert thumbprint** (on primary AD FS or any if using SQL):
- 8. **Check MachineKeys ACL**:
- 9. **Verify cert private key access**:
- 10. **If KeySpec is not 1_AT_KEYEXCHANGE**, refer to: [ADFS and keyspec property](https://learn.microsoft.com/en-us/windows-server/identity/ad-fs/technical-reference/ad-fs-and-keyspec-property)

---

## Scenario 4: ADFS EnterprisePRT and Event ID 1021
> 来源: ado-wiki-b-adfs-enterprise-prt-event-1021.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 5: ADFS - GMSA Service Account Information and Troubleshooting
> 来源: ado-wiki-b-adfs-gmsa-reference.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. **Test-ADServiceAccount** - Verify gMSA can authenticate:
- 2. **Get-ADServiceAccount** - Review properties:
- 3. **Set-ADServiceAccount** - Modify permissions:

---

## Scenario 6: ADFS OAuth Troubleshooting Guide
> 来源: ado-wiki-b-adfs-oauth-troubleshooting-guide.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Check ADFS Admin/Debug logs for OAuth-specific error events
- 2. Use Fiddler to capture OAuth flow and inspect redirect URLs, tokens
- 3. Verify Application Group configuration matches expected flows
- 4. Validate scope/resource parameters match ADFS configuration
- 5. Check certificate trust chain for confidential client assertions
- 6. For token validation issues, decode JWT and verify claims (iss, aud, scp)

---

## Scenario 7: ADFS Account Lockout Troubleshooting Guide
> 来源: ado-wiki-b-adfs-troubleshooting-account-lockout.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Step 1: Use Connect Health for AD FS**
   - Generate top bad password attempts report per [docs](https://docs.microsoft.com/en-us/azure/active-directory/connect-health/active-directory-aadconnect-health-adfs#reports-for-ad-fs)
   - Contact Connect Health PG for detailed data if not yet public
2. **Step 2: Collect ADFS Event Logs**
   - Enable auditing on each ADFS server (not WAP)
   - **Server 2012 R2 / 2016**: Search Security event logs for Event ID 411 (ADFS Auditing)
   - Contains UPN of targeted user and IP address
3. **Step 3: Analyze IP and Username**
   - Identify unexpected IPs
   - Block rogue IPs per [KB4015192](https://internal.evergreen.microsoft.com/en-us/help/4015192)
4. **Step 4: Check Service Accounts**
   - If user account used as service account, verify latest credentials are updated across all devices
5. **Step 5: Check Cached Credentials**
   - Clear cached/saved credentials in applications causing repeated auth attempts
6. **Step 6: Verify Extranet Lockout**
   - `Get-AdfsProperties` to check ExtranetLockoutEnabled
   - ExtranetLockoutThreshold should be less than AD lockout threshold
   - Enable Smart Lockout (ADFS 2016+)
7. **Step 7: Deploy Modern Authentication & CBA**
   - Enable modern auth for Office clients
   - Consider certificate-based authentication (removes password attack vector)
   - Deploy Azure MFA as additional or primary authentication

---

## Scenario 8: ADFS Device Authentication Troubleshooting Guide
> 来源: ado-wiki-b-adfs-troubleshooting-device-authentication.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Step 1: Check if Device Policy is Defined for RP**
   - Open AD FS Management MMC
   - Select the impacted RP trust
   - Click "Edit Access Control Policy" and check for device-related policy conditions
2. **Step 2: Check Client Configuration**
   - Run `dsregcmd /status` to verify device registration state
3. **Step 3: Verify Device Registration**
   - Confirm device appears in Azure AD / Entra ID
   - Check if device certificate is valid and not expired
   - Verify SCP (Service Connection Point) configuration for hybrid join scenarios

---

## Scenario 9: ADFS Proxy (WAP) Troubleshooting Checklist
> 来源: ado-wiki-b-adfs-troubleshooting-proxy.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. **Time sync**: Verify time is correct on all ADFS and WAP servers
- 2. **Prerequisites (2012 R2)**: Install required updates: KB2919355, KB3000850, KB3013769, KB3020773
- 3. **SSL Certificate binding check**:
- 4. **Fix SSL binding mismatches**:
- 5. **Certificate chain**: Check for non-self-signed certs in trusted root store, move to intermediate if found
- 6. **Replication**: Check ADFS MMC on secondary servers for sync status
- 7. **SPN check**: `setspn -f -q host/<federation service name>` and `setspn -f -q http/<federation service name>` - HOST should resolve to ADFS service account
- 8. **WAP IDP sign-in test**: Verify sign-in at AD FS IDP Initiated Sign-in Page from WAP servers
- 9. **Reset WAP trust**: `Install-WebApplicationProxy -FederationServiceName "sts.contoso.com" -CertificateThumbprint "<thumbprint>"`

---

## Scenario 10: ADFS User Sign-in Troubleshooting Flowchart
> 来源: ado-wiki-b-adfs-troubleshooting-user-sign-in.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 11: Update ADFS Token Signing Certificate in Entra ID via Microsoft Graph
> 来源: ado-wiki-b-adfs-update-token-signing-cert-graph.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 12: ado-wiki-c-adfs-azure-mfa-adapter-deepdive
> 来源: ado-wiki-c-adfs-azure-mfa-adapter-deepdive.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Generate a new self-signed certificate on each ADFS server in the farm.
- 2. Update the certificate to Azure AD MFA client Service Principal.
- 3. Set Azure MFA for ADFS farm and import config data into ADFS Configuration DB.
- 1. Install-Module Microsoft.Graph
- 1. Get-InstalledModule Microsoft.Graph
- 1. Set-Executionpolicy Unrestricted
- 1. Import-Module Microsoft.Graph.Authentication
- 1. User access Web App (claim-aware application) on web browser.
- 2. Because user hasn?t logged in, he/she is redirected to the ADFS for authentication.
- 3. User enters credentials against ADFS login page. ADFS verifies user credential.

---

## Scenario 13: ado-wiki-c-adfs-deepdive-trainings
> 来源: ado-wiki-c-adfs-deepdive-trainings.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 14: ADFS X-Frame-Options Deny behavior control for modern Browsers
> 来源: ado-wiki-c-adfs-iframe-support-modern-browsers.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 15: Feature overview
> 来源: ado-wiki-c-adfs-sign-ins-connect-health.md | 适用: Mooncake ✅ / Global ✅

### 关键 KQL 查询
```kql
unioncluster('Idsharedweu').database('ADFSConnectHealth').SignInEvent,  
cluster('Idsharedwus').database('ADFSConnectHealth').SignInEvent 
| where env_time > ago(2d)
| where tenantId == "00000000-0000-0000-0000-000000000000"
| take 15
```
`[来源: ado-wiki-c-adfs-sign-ins-connect-health.md]`

---

## Scenario 16: Compliance note
> 来源: ado-wiki-c-adfs-to-aad-migration-wizard.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. On-premises AD FS environment
- 2. Azure AD Connect and AAD Connect AD FS Health Agents
- 3. Azure AD Connect Health Cloud Services
- 4. Relying party and sign-in data source Kusto clusters
- 5. AD FS Application Insights jobs - Contains AD FS migration business logic.
- 6. AD FS Migration processed output - The processed AD FS migration data intermediate storage.
- 7. Relying Party Summary API - The *getRelyingPartyDetailedSummary* endpoint which powers data to the UX.
- 8. AD FS application activity/migration UX experience
- 1. If the **All apps** tile is selected, a *Ready* link will appear to the right of any app that is ready to migrate. Clicking the *Ready* link exposes all of the rules that have passed in a *Migratio
- 2. The *Migration details* blade provides a **Begin Migration** button which launches the *Application migration* wizard.

### 相关错误码: AADSTS7500525

---

## Scenario 17: Upgrading to AD FS in Windows Server 2016 using a WID database from 2012R2
> 来源: ado-wiki-c-adfs-upgrade-wid-2012r2-to-2016.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1.  Using Server Manager, install the Active Directory Federation Services Role
- 2.  Using the AD FS Configuration wizard, join the new Windows Server 2016
- 3.  On the Windows Server 2016 federation server, open AD FS management. Note
- 4.  On the Windows Server 2016 server, open an elevated PowerShell command
- 5.  On the AD FS server that was previously configured as primary, open an
- 6.  Now on the Windows Server 2016 federation server open AD FS Management. Note
- 7.  If you are upgrading an AD FS 2012 R2 farm to 2016, the farm upgrade
- 8.  Now on the Windows Server 2016 Server open PowerShell and run the following
- 9.  When prompted, type Y. This will begin raising the level. Once this
- 10.  Now, if you go to AD FS Management, you will see the new capabilities have

---

## Scenario 18: Upgrading to AD FS in Windows Server 2019 using a WID database from 2012R2
> 来源: ado-wiki-c-adfs-upgrade-wid-2012r2-to-2019.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1.  Using Server Manager, install the Active Directory Federation Services Role
- 2.  Using the AD FS Configuration wizard, join the new Windows Server 2019
- 3.  On the Windows Server 2019 federation server, open AD FS management. Note
- 4.  On the Windows Server 2019 server, open an elevated PowerShell command
- 5.  On the AD FS server that was previously configured as primary, open an
- 6.  Now on the Windows Server 2019 federation server open AD FS Management. Note
- 7.  If you are upgrading an AD FS 2012 R2 farm to 2019, the farm upgrade
- 8.  Now on the Windows Server 2019 Server open PowerShell and run the following
- 9.  When prompted, type Y. This will begin raising the level. Once this
- 10.  Now, if you go to AD FS Management, you will see the new capabilities have

---

## Scenario 19: Upgrading to AD FS in Windows Server 2019 using a WID database from 2016
> 来源: ado-wiki-c-adfs-upgrade-wid-2016-to-2019.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1.  Using Server Manager, install the Active Directory Federation Services Role
- 2.  Using the AD FS Configuration wizard, join the new Windows Server 2019
- 3.  On the Windows Server 2019 federation server, open AD FS management. Note
- 4.  On the Windows Server 2019 server, open an elevated PowerShell command
- 5.  On the AD FS server that was previously configured as primary, open an
- 6.  Now on the Windows Server 2019 federation server open AD FS Management. Note
- 7.  Now on the Windows Server 2019 Server open PowerShell and run the following
- 8.  When prompted, type Y. This will begin raising the level. Once this
- 9.  Now, if you go to AD FS Management, you will see the new capabilities have
- 10.  Likewise, you can use the PowerShell cmdlet:?Get-AdfsFarmInformation?to show

---

## Scenario 20: ado-wiki-c-adfs-wid-reference
> 来源: ado-wiki-c-adfs-wid-reference.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 21: ado-wiki-d-adfs-proxy-trust-cert-check
> 来源: ado-wiki-d-adfs-proxy-trust-cert-check.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1.  Log-in to AD FS server
- 2.  Open PowerShell
- 3.  Run **netsh http show sslcert**

---

## Scenario 22: ado-wiki-d-connect-health-adfs
> 来源: ado-wiki-d-connect-health-adfs.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting**

---

## Scenario 23: ado-wiki-e-ADFS-Delegated-PowerShell
> 来源: ado-wiki-e-ADFS-Delegated-PowerShell.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting**

---

## Scenario 24: Best practices
> 来源: ado-wiki-e-adfs-extranet-smart-lockout.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. You can download the PowerShell script to search your AD FS servers for events 411 at this link. The script will provide a CSV file which contains the UserPrincipalName, IP address of submitter, an
- 2. Open the CSV in Excel and quickly filter by username, IP, or times.
- 3. More information on the 411 events themselves:
- 4. If the server has 411 events showing up but the IP address field isn't in the event, make sure you have the latest AD FS updates installed. (More information can be found in KB3134222.)

---

## Scenario 25: ADFS 2019 Per-RP Additional Authentication Method Selection
> 来源: onenote-adfs-2019-per-rp-auth-method.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Steps**

---

## Scenario 26: ADFS Banned IPs Feature (2016+)
> 来源: onenote-adfs-banned-ips.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 27: ADFS Account Lockout via EXO Basic Authentication
> 来源: onenote-adfs-exo-lockout-guide.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. **Disable EXO basic auth per-user** — focus on non-critical accounts first
- 2. **Block malicious IPs on EXO**: `Set-OrganizationConfig contoso.onmicrosoft.com -IPListBlocked 127.0.0.1` (passive, less recommended)
- 3. **Adjust lockout thresholds** — raise AD lockout and/or ADFS lockout threshold (many customers set < 10, consider higher)

---

## Scenario 28: ADFS Password Expiration Sync for Federated Tenants
> 来源: onenote-adfs-password-expiration-sync-federated.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. **Federated user password = on-prem AD controlled**: PasswordNeverExpires = True on cloud side.
- 2. **ADFS claim rule** sends `passwordexpirationtime` claim via `_PasswordExpiryStore`:
- 3. **Azure AD** receives the ADFS token with `passwordexpirationtime` claim, sets `pwd_exp` in id token (seconds until expiry).
- 4. **AAD Connect** syncs `pwdLastSet` -> `LastPasswordChangeTimestamp`. Azure AD uses this to invalidate previously issued tokens.
- 5. **Office portal** reads `pwd_exp` from id token to decide whether to show notification.
- 1. User changes password in AD
- 2. AAD Connect syncs `pwdLastSet` (next sync cycle, ~30 min)
- 3. Azure AD invalidates old tokens: `AADSTS50133: Session is invalid due to expiration or recent password change`
- 4. User re-authenticates, ADFS sends new `passwordexpirationtime` claim
- 5. Azure AD issues new token with updated `pwd_exp`

### 关键 KQL 查询
```kql
| where MaskedResponse contains "AdfsRedirectUri=http" and PUID != ""
```
`[来源: onenote-adfs-password-expiration-sync-federated.md]`

```kql
| where ErrorCode == "50133"
```
`[来源: onenote-adfs-password-expiration-sync-federated.md]`

### 相关错误码: AADSTS50133

---

## Scenario 29: ADFS Publish to Extranet via WAP (Lab Setup)
> 来源: onenote-adfs-publish-extranet-wap.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Steps**
   - 1. Finish basic setup: DC, ADFS server, AAD Connect server, WAP server
   - 2. Contact VMAS support team (CNVMASSPRT@microsoft.com) to:
   - Create A record for public IP → public domain

---

## Scenario 30: ADFS SSL Certificate Renewal/Replacement Procedure
> 来源: onenote-adfs-ssl-cert-renewal.md | 适用: Mooncake ✅

### 排查步骤
1. **Steps**

---

## Scenario 31: ADFS/WAP ETL Trace Collection and Analysis
> 来源: onenote-adfs-wap-etl-trace-collection.md | 适用: Mooncake ✅

### 排查步骤
- 1. Download script to server, rename to `.bat`
- 2. Right-click → Run as Admin
- 3. Reproduce the issue
- 4. Press any key in CMD to stop capture
- 5. Output saved to `C:\AdfsWapTrace`

---

## Scenario 32: Convert ADFS-AAD Federation from WS-Fed to SAML
> 来源: onenote-adfs-wsfed-to-saml-conversion.md | 适用: Mooncake ✅

### 排查步骤
1. **Steps**

### 相关错误码: AADSTS500082

---


---

## Incremental Scenarios (2026-04-18)

## Scenario 33: Unable to create Group Managed Service Account during ADFS configuration on Server 2019.                               R...
> Source: contentidea-kb (entra-id-3652) | Applicability: unverified

### Troubleshooting Steps
1. **Confirm symptom**: Unable to create Group Managed Service Account during ADFS configuration on Server 2019.                               Receive error message:                             &quot;The specified service ac...
2. **Root cause**: The AD FS configuration powershell/installer looks for the CN=Managed Service Accounts, container by WKGUID.                                Expected value:                                             ...
3. **Solution**: Please review article:  4549462 ADDS How to force re-running parts of ADPREP /domainprep Implement the steps needed to re-play the task for the &quot;Managed Service Accounts&quot; Container. It's abo...

---

## Scenario 34: When customers try to customize error messages on ADFS page they see duplicate entries of the attributes as:The above AD...
> Source: contentidea-kb (entra-id-3656) | Applicability: unverified

### Troubleshooting Steps
1. **Confirm symptom**: When customers try to customize error messages on ADFS page they see duplicate entries of the attributes as:The above ADFSGlobalWebContent has duplicate attributes but with different values for some a...
2. **Root cause**: The reason being that each locale has its own web content and customization of the error pages. When the customization is done without specifying the locale it by default updates the Global web conten...
3. **Solution**: In order to customize the error messages for a particular locale you need to explicitly call out the name of the locale while running the PowerShell cmdlet as: Set-AdfsGlobalWebContent -Locale  en -Er...

---

## Scenario 35: We have created ADFS claim rule to block all external request except the particular Active directory group of users. Aft...
> Source: contentidea-kb (entra-id-3665) | Applicability: unverified

### Troubleshooting Steps
1. **Confirm symptom**: We have created ADFS claim rule to block all external request except the particular Active directory group of users. After creating the rule, we still see connections are allowed and the requirement w...
2. **Root cause**: In ADFS Audit / debug logs, when claim processing was happening, the group was not being evaluated. The group SID S-1-5-21-1010517290-1075059173-903097961-179968 assigned in the ADFS claim rule was fo...
3. **Solution**: Changed the group type to Security group and ADFS started processing the group claims and issued deny claim as it should.

---

## Scenario 36: ADFS gives a responder token back to relying party and the event viewer logs the below eventLog Name:      AD FS/AdminSo...
> Source: contentidea-kb (entra-id-3669) | Applicability: unverified

### Troubleshooting Steps
1. **Confirm symptom**: ADFS gives a responder token back to relying party and the event viewer logs the below eventLog Name:      AD FS/AdminSource:        AD FSDate:          6/23/2020 10:13:38 AMEvent ID:      316Task Cat...
2. **Root cause**: This mostly happens when the relying party sends a signed request to ADFS server and ADFS server could not verify the revocation of the certificate which is used to sign the authentication request.
3. **Solution**: First thing we need to do is to identify the certificate from the thumbprint found in the event 316 in ADFS admin log. Once done export the certificate to file path.Then run the below command to verif...

---

## Scenario 37: When trying to start the ADFS / AD FS service within the services console, it fails with the following error: The Active...
> Source: contentidea-kb (entra-id-3676) | Applicability: unverified

### Troubleshooting Steps
1. **Confirm symptom**: When trying to start the ADFS / AD FS service within the services console, it fails with the following error: The Active Directory Federation Services service terminated with the following error: An e...
2. **Root cause**: This can occur if the ADFS Token Signing and Token Decrypting certificates have expired, and the system was not able to roll over to new certificates. This situation may be most common when using a VM...
3. **Solution**: The ADFS service won't start because the certificates are expired, and you can't update the certificates unless the ADFS service is started.  You have to trick the system into thinking the certificate...

---

## Scenario 38: When trying to start the ADFS / AD FS service within the services console, it fails with the following error: The Active...
> Source: contentidea-kb (entra-id-3684) | Applicability: unverified

### Troubleshooting Steps
1. **Confirm symptom**: When trying to start the ADFS / AD FS service within the services console, it fails with the following error: The Active Directory Federation Services service terminated with the following error: An e...
2. **Root cause**: This can occur if the ADFS Token Signing and Token Decrypting certificates have expired, and the system was not able to roll over to new certificates.
3. **Solution**: The ADFS service won't start because the certificates are expired, and you can't update the certificates unless the ADFS service is started. You have to trick the system into thinking the certificates...

---
