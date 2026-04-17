# ENTRA-ID WHfB Deployment & Trust Models — Quick Reference

**Entries**: 189 | **21V**: Partial (186/189)
**Last updated**: 2026-04-07
**Keywords**: whfb, key-trust, adfs, hybrid, certificate-trust, provisioning

> This topic has a fusion guide with detailed troubleshooting flow
> → [Full troubleshooting flow](details/whfb-deployment.md)

## Issue Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | AADSSHLoginForLinux VM extension install fails with Non-zero exit code: 23 and error Detected obs... | The old AADLoginForLinux VM extension (v1 device code flow) or remnants are s... | Uninstall the older AADLoginForLinux VM extension from the VM. The AADSSHLogi... | 🟢 9.5 | ADO Wiki |
| 2 📋 | AADJ device cannot SSO to on-premise share folder with WHFB PIN. Works with username+password. Er... | WHFB key trust or certificate trust not configured for hybrid deployment. SSO... | Configure WHFB key trust or cert trust. Requirements: 1) WS2016+ DC, 2) Kerbe... | 🟢 9.0 | OneNote |
| 3 📋 | Kerberos auth fails with KDC_ERR_CLIENT_NAME_MISMATCH when AADJ user accesses on-prem share with ... | msDS-KeyCredentialLink attribute empty in on-prem AD. Should be written back ... | 1) Verify msDS-KeyCredentialLink exists for user in on-prem AD. 2) If empty, ... | 🟢 9.0 | OneNote |
| 4 📋 | msDS-KeyCredentialLink in on-prem AD keeps being written back by AAD Connect sync after manual de... | AAD Connect sync rule 'Out to AD - User NGCKey' writes Azure AD searchableDev... | Delete source in Azure AD: 1) Verify WHfB via browser F12 checking windowsHel... | 🟢 9.0 | OneNote |
| 5 📋 | WHFB PIN provisioning appears on AAD Registered (workplace joined) device, which is undocumented.... | When a Win10 machine is registered in Azure AD, the system prompts WHFB provi... | 1) WHFB on AAD Registered is by-design but not officially supported for acces... | 🟢 9.0 | OneNote |
| 6 📋 | HP devices: RDP/Win365 auth error dictionary attack mitigation triggered, TPM Event ID 23/21 | HP OneAgent consumes all TPM NV handles (up to 14), blocking WHfB and Entra r... | Run HP cleanup tool for orphaned NV handles, or uninstall/update OneAgent, or... | 🟢 8.5 | ADO Wiki |
| 7 📋 | Federated user signed into local Windows client using WHfB certificate trust gets stuck in an inf... | The user attempting to connect to the Azure Virtual Desktop has not been assi... | Add the user to either the 'Virtual Machine Administrator Login' or 'Virtual ... | 🟢 8.5 | ADO Wiki |
| 8 📋 | After disabling Windows Hello for Business via GPO (Computer or User > Administrative Templates >... | Changing the GPO to Disabled only prevents new provisioning. It does not remo... | 1. Set GPO 'Use Windows Hello for Business' to Disabled to prevent new enroll... | 🟢 8.5 | ADO Wiki |
| 9 📋 | WHfB provisioning fails when migrating from Hybrid Azure AD joined Key Trust to Certificate Trust... | Microsoft Passport Authentication is not enabled in ADFS Global Authenticatio... | 1. Launch ADFS management console. 2. Browse to Services > Authentication Met... | 🟢 8.5 | ADO Wiki |
| 10 📋 | After running ADPREP /DOMAINPREP for Windows Server 2016 AD schema upgrade, the Key Admins (RID 5... | The RID 526 and 527 cannot be resolved to friendly names until a Windows Serv... | Move the PDC Emulator FSMO role to a Windows Server 2016 Domain Controller: M... | 🟢 8.5 | ADO Wiki |
| 11 📋 | Users migrated from one AD domain/forest to another domain/forest are unable to authenticate usin... | WHfB keys are bound to the user's original domain identity. After migration t... | 1. Run 'certutil -deletehellocontainer' on the device (check existing keys fi... | 🟢 8.5 | ADO Wiki |
| 12 📋 | Windows Hello for Business biometric data (fingerprint/facial recognition) is lost after Windows ... | The biometric device (fingerprint reader or camera) has 'Allow the computer t... | Before performing the in-place upgrade, uncheck 'Allow the computer to turn o... | 🟢 8.5 | ADO Wiki |
| 13 📋 | WHfB Cloud Kerberos Trust does not work when Certificate Trust policies are also configured. Cert... | Cloud Kerberos Trust is incompatible with Certificate Trust. When certificate... | Remove Certificate Trust policies (GPO or MDM) before deploying Cloud Kerbero... | 🟢 8.5 | ADO Wiki |
| 14 📋 | User cannot sign in with WHfB Cloud Kerberos Trust on a Microsoft Entra hybrid joined device if t... | Cloud Kerberos Trust requires an initial sign-in with Domain Controller conne... | Ensure the user performs their first sign-in on the hybrid joined device whil... | 🟢 8.5 | ADO Wiki |
| 15 📋 | WHfB on-premises (Cert Trust / Key Trust) provisioning fails with error 0X801C044F. Users cannot ... | MFA authentication method 'ngcmfa' is not enabled on the ADFS Device Registra... | Run on ADFS server: set-AdfsDeviceRegistration -AllowedAuthenticationClassRef... | 🟢 8.5 | ADO Wiki |
| 16 📋 | Windows Hello for Business key-based authentication fails when only Windows Server 2019 Domain Co... | Known issue with Windows Server 2019 DCs affecting WHfB key trust authenticat... | Install KB4487044 on the Windows Server 2019 Domain Controllers. See https://... | 🟢 8.5 | ADO Wiki |
| 17 📋 | Federated user with WHfB certificate trust gets stuck in infinite sign-in loop connecting to AVD/... | User not assigned Azure RBAC Virtual Machine Administrator Login or Virtual M... | Add user to Virtual Machine Administrator Login or Virtual Machine User Login... | 🟢 8.5 | ADO Wiki |
| 18 📋 | After disabling WHfB via GPO, previously configured PCs still have WHfB credentials and users can... | GPO Disabled only prevents new provisioning. Does not remove existing NGC con... | 1. Set GPO Disabled. 2. Each machine: elevated certutil -deleteHelloContainer... | 🟢 8.5 | ADO Wiki |
| 19 📋 | WHfB provisioning fails migrating Key Trust to Certificate Trust. Event 362: authenticated to ent... | Microsoft Passport Authentication not enabled in ADFS Global Auth Policy. | ADFS > Services > Auth Methods > Edit Primary > Intranet: enable Microsoft Pa... | 🟢 8.5 | ADO Wiki |
| 20 📋 | After AD schema upgrade to 2016, Key Admins (RID 526) and Enterprise Key Admins (RID 527) show as... | RID 526/527 need Windows Server 2016 DC holding PDC Emulator FSMO role to res... | Move PDC Emulator to 2016 DC: Move-ADDirectoryServerOperationMasterRole -Iden... | 🟢 8.5 | ADO Wiki |
| 21 📋 | Users migrated from one AD domain/forest to another cannot authenticate using WHfB PIN. | WHfB keys bound to original domain identity, invalid after migration. | 1. certutil -deletehellocontainer. 2. If device migrated: dsregcmd /leave. 3.... | 🟢 8.5 | ADO Wiki |
| 22 📋 | Error 'DirectoryQuotaExceededException: The directory object quota limit for the Tenant has been ... | Default Entra ID tenant object quota is 50k objects. Quota protects service f... | 1) Customer checks current quota: GET https://graph.microsoft.com/beta/organi... | 🟢 8.5 | ADO Wiki |
| 23 📋 | DirectoryQuotaExceededException: The directory object quota limit for the Tenant has been exceeded | Default tenant object quota is 50k. Protects service from over-provisioning. | 1) GET /beta/organization?$select=directorySizeQuota. 2) ASC > Tenant Explore... | 🟢 8.5 | ADO Wiki |
| 24 📋 | SuccessFactors to AD provisioning fails with 'Could not calculate the distinguished name' for new... | Default CN mapping uses displayName from SuccessFactors. Many users do not po... | Change CN attribute mapping from displayName to expression: Join(" ",[firstNa... | 🟢 8.5 | ADO Wiki |
| 25 📋 | SuccessFactors custom entity attributes (e.g. BadgeInfoNav) cannot be retrieved via JSONPath in p... | Provisioning does not support expansion of custom entities (navigation entiti... | Ask customer to: 1) Map desired attribute value to a custom property in userN... | 🟢 8.5 | ADO Wiki |
| 26 📋 | SuccessFactors Writeback fails with SuccessFactorsWritebackRequiredPropertiesMissing: Required pr... | In SuccessFactors, personIdExternal and userId may have different values. Def... | Ask customer to incorporate userId attribute value during writeback as docume... | 🟢 8.5 | ADO Wiki |
| 27 📋 | DuplicateTargetEntries error during Workday worker conversion (CW to FTE or vice versa): two Work... | When CW converts to FTE retaining the same WorkerID, provisioning engine gets... | Post-2021: active worker auto-assumes ownership. If still occurring: Option 1... | 🟢 8.5 | ADO Wiki |
| 28 📋 | HR to AD provisioning fails with InsufficientAccessRights error (DSID-03150F94, problem 4003) for... | Two causes: 1) Target OU does not inherit domain-level permissions. 2) User b... | Cause 1: Enable inheritance on OU (AD Users & Computers > OU Properties > Sec... | 🟢 8.5 | ADO Wiki |
| 29 📋 | HR to Azure AD provisioning fails with AzureActiveDirectoryCannotUpdateObjectsOriginatedInExterna... | extensionAttributes (1-15) in Azure AD can originate from on-prem Exchange, E... | Check if impacted users were originally created from external source. If yes:... | 🟢 8.5 | ADO Wiki |
| 30 📋 | Test connection fails after provisioning agent installation/upgrade with HybridSynchronizationAct... | Three causes: 1) Agent installed but GMSA wizard setup not completed. 2) Agen... | Check 'View on-premises agents' link: active = rule out causes 1&2. Unhealthy... | 🟢 8.5 | ADO Wiki |
| 31 📋 | Installed provisioning agents not showing up in Azure Portal - only some agents visible | Each agent sends bootstrap signals to Azure AD. If agent cannot send signals ... | Check last bootstrap via Kusto: cluster('idsharedwus.kusto.windows.net').data... | 🟢 8.5 | ADO Wiki |
| 32 📋 | Provision-on-demand shows 'Encountered Exception' with no details when testing HR provisioning fo... | Occurs when the user's manager is in scope of the provisioning job. This is a... | Ignore the 'Encountered Exception' message. Verify actual provisioning status... | 🟢 8.5 | ADO Wiki |
| 33 📋 | Provisioning Agent registration fails with Timeout error during wizard setup | Agent unable to connect to Hybrid Identity Service. HTTP proxy required for o... | Configure HTTP proxy in AADConnectProvisioningAgent.exe.config: add <system.n... | 🟢 8.5 | ADO Wiki |
| 34 📋 | Provisioning Agent registration fails with Security Error during wizard setup | Agent cannot execute PowerShell registration scripts due to restrictive execu... | Fix via gpedit.msc: Computer/User Configuration > Administrative Templates > ... | 🟢 8.5 | ADO Wiki |
| 35 📋 | Workday attribute mapping fails with SchemaInvalid error due to unsupported XPATH function (e.g. ... | Provisioning engine supports limited XPATH/XSLT functions. Functions like sib... | Replace unsupported XPATH functions. Supported: Name, last, Position, String,... | 🟢 8.5 | ADO Wiki |
| 36 📋 | Windows devices running HP OneAgent experience RDP/Windows 365 Cloud PC authentication failures; ... | HP OneAgent consumed nearly all available TPM Non-Volatile (NV) Handles, prev... | 1. Run HP cleanup tool to delete orphaned NV handles (preferred). 2. Uninstal... | 🟢 8.5 | ADO Wiki |
| 37 📋 | Hybrid users with WHfB Kerberos Cloud Trust trigger bad password attempts accessing on-prem resou... | Occurs when Credential Guard is enabled on cloud-joined device with hybrid us... | Disable Credential Guard as workaround. See Evergreen article: ADDS: WHfB: Ke... | 🟢 8.5 | ADO Wiki |
| 38 📋 | WHfB Key Trust enrollment does not happen on hybrid Azure AD joined devices. Event 362 shows Ente... | GPO 'Use certificate for on-premises authentication' (Administrative Template... | Set GPO 'Use certificate for on-premises authentication' to Not Configured. L... | 🟢 8.5 | ADO Wiki |
| 39 📋 | WHfB Hybrid Azure AD joined Key Trust enrollment does not trigger. Event 362 shows 'Enterprise us... | GPO 'Use certificate for on-premises authentication' (under Administrative Te... | Set the GPO 'Use certificate for on-premises authentication' to 'Not Configur... | 🟢 8.5 | ADO Wiki |
| 40 📋 | WHfB provisioning fails with error 0x801C03ED (DSREG_E_NGC_INVALID_REQUEST). Event 301 shows 'NGC... | User is a member of AD Protected Groups. AdminSDHolder overwrites security de... | Grant Key Admins group Read and Write msDS-KeyCredentialLink permissions on A... | 🟢 8.5 | ADO Wiki |
| ... | *149 more entries* | | | | |

## Quick Troubleshooting Path

1. Check **whfb** related issues (18 entries) `[onenote]`
2. Check **key-trust** related issues (3 entries) `[ado-wiki]`
3. Check **certificate-trust** related issues (3 entries) `[ado-wiki]`
4. Check **msds-keycredentiallink** related issues (2 entries) `[onenote]`
5. Check **avd** related issues (2 entries) `[ado-wiki]`
6. Check **rdp** related issues (2 entries) `[ado-wiki]`
7. Check **disable** related issues (2 entries) `[ado-wiki]`
8. Check **gpo** related issues (2 entries) `[ado-wiki]`
