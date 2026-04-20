# ENTRA-ID misc — Quick Reference

**Entries**: 386 | **21V**: Partial (336/376)
**Last updated**: 2026-04-18
**Keywords**: identity-protection, verified-id, domain-verification, sbsl, by-design, dns

## Issue Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Linux Enterprise SSO: unable to retrieve broker accounts - microsoft-identity-broker.service not ... | microsoft-identity-broker.service is stopped or crashed on the Linux device | 1. Check service: `systemctl --user status microsoft-identity-broker.service`... | 🟢 9.5 | ADO Wiki |
| 2 | Configuring AAD authentication for multi-tenant Web App/Function App fails with error: The Applic... | Doc steps only work for single-tenant apps. Multi-tenant apps require Applica... | For multi-tenant: use domain+app name format URL as Application ID URI. If cu... | 🟢 9.0 | OneNote |
| 3 | AVD/WVD user repeatedly prompted to enter credentials when launching second RemoteApp. | By design. All RemoteApps share one session ID. When all closed, session beco... | Keep at least one RemoteApp active. Check RDAgent logs: AddOrUpdateConnection... | 🟢 9.0 | OneNote |
| 4 | AADDS primary DC stops responding after Azure Disk Encryption (ADE) V2 migration maintenance. AAD... | PG maintenance operation migrating encryption-at-rest extension (ADE) from V1... | 1) Raise ICM to PG to manually promote secondary DC and recreate failed DC. 2... | 🟢 9.0 | OneNote |
| 5 | AADDS DC failover creates new DC with different IP address instead of reusing the original IP. VN... | Resource group delete lock prevents the old NIC from being deleted when AADDS... | 1) Remove delete locks from AADDS resource group before DC failover or as a p... | 🟢 9.0 | OneNote |
| 6 | On AADJ machine, users can still login with old password after password change. CachedLogonsCount... | By design. AADJ uses cloudAP cache separate from on-prem lsass. CachedLogonsC... | Option 1: Login with new password to update cloudAP cache. Option 2: Delete C... | 🟢 9.0 | OneNote |
| 7 | Password hash synchronization stops working, Event ID 611 logged, RPC Error 8453, but user attrib... | Replicate Directory Changes and Replicate Directory Changes All permissions m... | Grant Replicate Directory Changes and Replicate Directory Changes All at doma... | 🟢 9.0 | OneNote |
| 8 | AADJ device joined via OOBE does not allow cached offline logon immediately after OOBE completes.... | By design. Cached logon is an optimization feature, not behavioral. After OOB... | 1) Join machine to AAD via OOBE. 2) Log off the user. 3) Log on the user (thi... | 🟢 9.0 | OneNote |
| 9 | Need to remove SMTP proxyAddresses for a custom domain being deleted, users synced via Entra ID C... | proxyAddresses synced from on-prem AD cannot be modified in cloud for synced ... | Option 1: Modify proxyAddresses in on-prem AD directly. Option 2: Outbound sy... | 🟢 8.5 | OneNote |
| 10 | Devices unjoined from Entra ID - MS-Organization-Access cert deleted by HP OneAgent 1.2.50.9581 | HP OneAgent cleanup script matches 1E in cert name, deleting Entra cert | Update/uninstall HP OneAgent. Re-join: HAADJ via dsregcmd /join; Entra joined... | 🟢 8.5 | ADO Wiki |
| 11 | Azure AD SSH login fails with Found a user with the same name but different oid in aad_certhandle... | User OID conflict in /etc/aadpasswd. Occurs when migrating from AADLoginForLi... | SSH as local admin, run sudo aaduserdel --remove user@contoso.com, verify use... | 🟢 8.5 | ADO Wiki |
| 12 | AADSSHLoginForLinux extension install fails with Non-zero exit code: 21 and Missing AuthorizedKey... | SSH hardening script modified /etc/ssh/sshd_config after aadsshlogin package ... | Add back to sshd_config: AuthorizedKeysCommand /usr/sbin/aad_certhandler %u %... | 🟢 8.5 | ADO Wiki |
| 13 | az ssh vm fails with Failed to create ssh key file with error: [WinError 2] when connecting to Az... | Bug in Azure CLI ssh extension version 1.1.0 (tracked in GitHub issue #22144) | Remove ssh extension 1.1.0 and install 1.0.0: az extension remove --name ssh ... | 🟢 8.5 | ADO Wiki |
| 14 | SSH to Azure Linux VM from WSL/Linux fails with ssh: connect to host IP port 22: Resource tempora... | Just-In-Time (JIT) access is enabled on the Azure Linux VM, blocking port 22 | Enable JIT on the VM, then request access via Azure Portal Connect blade befo... | 🟢 8.5 | ADO Wiki |
| 15 | AADLoginForWindows VM extension fails with exit code -2145648607 (DSREG_AUTOJOIN_DISC_FAILED) - c... | VM cannot reach https://enterpriseregistration.windows.net or other required ... | Verify endpoints from VM: curl https://login.microsoftonline.com/ and https:/... | 🟢 8.5 | ADO Wiki |
| 16 | AADLoginForWindows VM extension fails with exit code 51 - extension not supported on VM operating... | VM running unsupported OS. Requires Windows Server 2019+, Windows 10 Build 18... | Verify OS meets requirements. If unsupported, uninstall extension. Upgrade OS... | 🟢 8.5 | ADO Wiki |
| 17 | AADLoginForWindows VM extension fails with exit code -2145648572 (DSREG_E_VM_JOINED_NOT_AZURESECU... | VM already joined AAD but not in Secure VM join state required by extension | Unjoin from AAD first, then run dsreg /AzureSecureVmJoin from elevated prompt... | 🟢 8.5 | ADO Wiki |
| 18 | AADLoginForWindows VM extension fails with exit code -2145648509 (DSREG_HOSTNAME_DUPLICATE) - dup... | Another VM with same hostname exists in tenant (active or stale from improper... | Use unique VM names. Before deleting VMs, unregister from ADRS properly (unin... | 🟢 8.5 | ADO Wiki |
| 19 | Device re-registration fails with 'Device already exists' or duplicate DeviceID error when trying... | Soft-deleted object with same DeviceId blocks new registration — DeviceId mus... | Search deleted items for matching DeviceId (check Settings > Accounts > Acces... | 🟢 8.5 | ADO Wiki |
| 20 | Linux identity broker (microsoft-identity-broker) cannot connect to Azure services through proxy ... | HTTP_PROXY and HTTPS_PROXY environment variables not configured for both the ... | For user context: set HTTP_PROXY and HTTPS_PROXY in shell profile (.bashrc). ... | 🟢 8.5 | ADO Wiki |
| 21 | Chrome SSO fails with 'NoSupport: Failed to start native messaging host' in BSSO telemetry; Brows... | cmd.exe is blocked by AppLocker or other security policy. Chrome native messa... | Grant access to cmd.exe for users who need SSO in Chrome. Customer must evalu... | 🟢 8.5 | ADO Wiki |
| 22 | Chrome SSO intermittently fails with 'NoSupport: Native host has exited' in Chrome debug logs; SS... | Windows bug in BrowserCore.exe streaming operations - when SSO cookie buffer ... | Install Windows servicing update: Win10 20H2/2004 -> 19042.662+ (KB4586853), ... | 🟢 8.5 | ADO Wiki |
| 23 | Chrome extensions cannot communicate to background scripts; Chrome debug log shows 'DidStartWorke... | Bug in certain Google Chrome versions where service workers fail to start for... | Chrome bug - customer must escalate directly to Google. Not an AAD/Microsoft ... | 🟢 8.5 | ADO Wiki |
| 24 | LAPS password update fails with HTTP 403 Event 10059: The specified request is not allowed for te... | Device has been disabled in Azure AD | Re-enable the device in Azure AD portal > Devices. Check device status with d... | 🟢 8.5 | ADO Wiki |
| 25 | BitLocker key backup to Entra ID fails - event ID 846 in Microsoft-Windows-BitLocker-API/Manageme... | Client machine needs to connect to https://enterpriseregistration.windows.net... | 1) Check BitLocker event log (Microsoft-Windows-BitLocker-API/Management) for... | 🟢 8.5 | ADO Wiki |
| 26 | SignInAudience value AzureADMultipleOrgs not allowed as per assigned policy. Error creating multi... | Tenant admin configured app management policy with audience restriction block... | Contact tenant admin to update policy or create custom exemption. Or use Azur... | 🟢 8.5 | ADO Wiki |
| 27 | MyApps launcher page (launcher.myapps.microsoft.com) shows failure with Go to the My Apps Portal ... | App launch failure on the MyApps launcher page; backend telemetry needed to i... | Use Kusto cluster idsharedscus.southcentralus.kusto.windows.net, database IAM... | 🟢 8.5 | ADO Wiki |
| 28 | Password-based SSO app returns unable to save credentials error when admin or user tries to store... | Hard limit of 48 keys per user per password-based SSO app has been exceeded | Remove credentials for an app the user is no longer using to free up key slot... | 🟢 8.5 | ADO Wiki |
| 29 | Password-based SSO submits credentials to the application login form but the app does not sign th... | Application login form structure or field labels have changed; stored metadat... | Gallery apps: verify metadata update needed, open ICM with App Name/ID/Sign-o... | 🟢 8.5 | ADO Wiki |
| 30 | 403 size exceeded limit when adding federated identity credential to application. | Max 20 FIC per application object. | Delete existing FIC or use another application object. | 🟢 8.5 | ADO Wiki |
| 31 | Application JSON metadata parser fails after Microsoft added cloud_instance_name tag to JWK signi... | New cloud_instance_name property added to JWK metadata as part of public/gov ... | Application developer must fix their metadata parser to be RFC 7517 compliant... | 🟢 8.5 | ADO Wiki |
| 32 | Verified ID: "Refresh verification status" fails with "Your domain could not be validated" even t... | Stale did.json file from previous deleted Verified ID configuration. The veri... | Re-download both did.json and did-configuration.json from the Domain blade in... | 🟢 8.5 | ADO Wiki |
| 33 | Verified ID Verification: "This app or website may be risky" warning in Authenticator digital wal... | Domain verification is not working for the Verified ID organization. | Verify the Verified ID Organization domain meets requirements per docs: how-t... | 🟢 8.5 | ADO Wiki |
| 34 | Verified ID Verification: "You'll have to add the credential first then try again" - Share button... | Credential type mismatch between issued VC type and Verifier presentation req... | In Verified ID portal, update Rule definition vc.type to match expected type.... | 🟢 8.5 | ADO Wiki |
| 35 | Verified ID: Question mark appears in front of claim name on issued credential in Authenticator app. | Typo in credential Display definition claim path (e.g., "vc.credentialSubject... | In Verified ID portal Properties tab, correct the typo in Display definition ... | 🟢 8.5 | ADO Wiki |
| 36 | Verified ID Setup: Creating did.json or did-configuration.json fails during Verified ID configura... | Administrator does not have KEY SIGN permissions on Key Vault, even if they c... | Modify Key Vault access policy to grant the administrator SIGN permissions fo... | 🟢 8.5 | ADO Wiki |
| 37 | Verified ID: Domain validation fails or Authenticator shows security warning even though did.json... | Files are served through HTTP redirect (302) instead of directly (200). W3C D... | Ensure did.json and did-configuration.json return 200 OK directly without any... | 🟢 8.5 | ADO Wiki |
| 38 | Domain force deletion fails - DomainForceDeleteTask status shows 'Incomplete'. Error in logs: 'Pr... | Exchange mastered groups (_SingleAuthorityMetadata has ExchangeMastered=True)... | 1) Check DS Explorer PropagationTask for DomainForceDeleteTask. 2) Identify E... | 🟢 8.5 | ADO Wiki |
| 39 | Cannot verify custom domain - domain is verified on a viral/unmanaged tenant created by self-serv... | Domain was auto-verified when a user signed up for a self-service cloud servi... | 1) Check User Realm endpoint: https://login.microsoftonline.com/common/userre... | 🟢 8.5 | ADO Wiki |
| 40 | Governed tenant is unable to terminate a governance relationship; Terminate button is unavailable... | The governance relationship was created using a policy template from before N... | The governing tenant must initiate termination: Go to Governed tenants blade ... | 🟢 8.5 | ADO Wiki |
| NEW 📋 | This document describes how to use PII Removal Tool to PII from data that was collected from custome... | N/A | N/A | 🟡 6.5 | ContentIdea |
| NEW 📋 | This article is still in development and is not to be shared with customers yet.                    ... | N/A | N/A | 🟡 6.5 | ContentIdea |
| NEW 📋 | What is this attribute and how is it used? The process that drives populating and using this attribu... | N/A | N/A | 🟡 6.5 | ContentIdea |
| NEW 📋 | The below steps can help collect the appropriate logs from the Kubernentes cluster when troubleshoot... | N/A | N/A | 🟡 6.5 | ContentIdea |
| NEW 📋 | It is possible to create and attach Extension attributes for Azure AD created Groups but it has to b... | N/A | N/A | 🟡 6.5 | ContentIdea |
| NEW 📋 | This FAQ answers common questions about utilizing Azure AD and cloud services to enable your IT Pro ... | N/A | N/A | 🟡 6.5 | ContentIdea |
| NEW 📋 | No this cannot be achieved | Its by design . | Scenario :WVD | Is it possible to do AD sync done between two different AAD tena... | 🟢 8.0 | ContentIdea |
| NEW 📋 | Azure                               Plugins for Jenkins                     will be retired on      ... | N/A | N/A | 🟡 6.5 | ContentIdea |
| NEW 📋 | Short URL for this article: https://aka.ms/howto-fiddler       How to configure Fiddler as proxy    ... | N/A | N/A | 🟡 6.5 | ContentIdea |
| NEW 📋 | If you're wondering how to use ChatGPT, you're not alone. ChatGPT took the world by storm when it la... | N/A | N/A | 🟡 6.5 | ContentIdea |
| ... | *336 more entries* | | | | |

## Quick Troubleshooting Path

1. Check **vm-extension** related issues (4 entries) `[ado-wiki]`
2. Check **aadloginforwindows** related issues (4 entries) `[ado-wiki]`
3. Check **aadj** related issues (3 entries) `[onenote]`
4. Check **linux** related issues (2 entries) `[ado-wiki]`
5. Check **aadds** related issues (2 entries) `[onenote]`
6. Check **cached-logon** related issues (2 entries) `[onenote]`
7. Check **aadc** related issues (2 entries) `[onenote]`
8. Check **ssh** related issues (2 entries) `[ado-wiki]`
