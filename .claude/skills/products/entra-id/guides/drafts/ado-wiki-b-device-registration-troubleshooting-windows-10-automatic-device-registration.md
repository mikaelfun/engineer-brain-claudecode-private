---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD.wiki:/Authentication/Device Registration/Window Devices/Microsoft Entra Hybrid Join/Device registration_Troubleshooting Windows 10 Automatic Device Registration"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/Device%20Registration/Window%20Devices/Microsoft%20Entra%20Hybrid%20Join/Device%20registration_Troubleshooting%20Windows%2010%20Automatic%20Device%20Registration"
importDate: "2026-04-05"
type: troubleshooting-guide
---

The following guide is intended to guide you through troubleshooting Windows 10 automatic device registration with Azure Active Directory (Microsoft Entra Hybrid Join).

[[_TOC_]]

## Begin Here - Common Issues

| Question | Solution |
|---|---|
| Has the customer followed the setup instructions? | [Setting up Windows 10 Automatic Device Registration](https://docs.microsoft.com/en-us/azure/active-directory/active-directory-conditional-access-automatic-device-registration-setup) |
| Is the failure impacting all Windows 10 devices or only a sub-set? | If subset, proceed directly to Gathering and reviewing logs |
| Does the org use an outbound internet proxy? | See Verify outbound internet proxy configuration |
| Does the org use AD FS with multiple verified domain names in Azure AD? | See Verify AD FS Device Registration Transform Rules |
| Does the org use AD FS with alternate login Id? | See Verify AD FS ImmutableId Transform Rules |
| Does the org use a 3rd party IdP (Ping, Okta)? | Ensure WS-Trust endpoints for username/password and Windows Integrated auth are enabled |

## Windows 10 Processes and Applications involved in PRT acquisition

- **AAD WAM**: `Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy` — `C:\Windows\SystemApps\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy\Microsoft.AAD.BrokerPlugin.exe`
- **MSA WAM**: `Microsoft.Windows.CloudExperienceHost_cw5n1h2txyewy`
- Other: `backgroundTaskHost.exe`, `lsass.exe`

## Verify AD FS Device Registration Transform Rules

### Required Claim Rules (Multiple Verified Domains)

| Rule Name | Rule |
|---|---|
| Issue accounttype for domain-joined computers | `c:[Type == "...groupsid", Value =~ "-515$", Issuer =~ "^(AD AUTHORITY\|SELF AUTHORITY\|LOCAL AUTHORITY)$"] => issue(Type = "...accounttype", Value = "DJ");` |
| Issue AccountType USER when not computer | `NOT EXISTS([Type == "...accounttype", Value == "DJ"]) => add(Type = "...accounttype", Value = "User");` |
| Issue issuerid when not computer | `c1:[Type == "...UPN"] && c2:[Type == "...accounttype", Value == "User"] => issue(Type = "...issuerid", Value = regexreplace(...));` |
| Issue issuerid for DJ computer auth | `c1:[Type == "...accounttype", Value == "DJ"] => issue(Type = "...issuerid", Value = "http://verifiedDomainName/adfs/services/trust/");` |
| Issue onpremobjectguid for domain-joined | `c1:[groupsid -515$] && c2:[windowsaccountname] => issue(store = "Active Directory", types = ("...onpremobjectguid"), query = ";objectguid;{0}", param = c2.Value);` |
| Pass through primary SID | `c1:[groupsid -515$] && c2:[primarysid] => issue(claim = c2);` |

### Required Claim Rules (Single Verified Domain)

Include: accounttype for DJ, onpremobjectguid, pass through primary SID (same as above, no USER/issuerid rules needed).

## Verify AD FS ImmutableId Transform Rules

If using AD FS alternate login Id, ensure the ImmutableId rule handles computer accounts separately:

1. Add rule to tag USER accounts: `NOT EXISTS([accounttype == "DJ"]) => add(Type = "...accounttype", Value = "User");`
2. Modify ImmutableId rule to apply only to users (add `&& c2:[accounttype, Value == "User"]` condition)
3. Add separate ImmutableId rule for DJ computer accounts using `objectGUID`

## Verify AD FS WS-Trust Endpoints

Ensure the following endpoints are enabled:
```
/adfs/services/trust/2005/windowstransport
/adfs/services/trust/13/windowstransport
/adfs/services/trust/2005/usernamemixed
/adfs/services/trust/13/usernamemixed
/adfs/services/trust/2005/certificatemixed
/adfs/services/trust/13/certificatemixed
```

Run `Get-AdfsEndpoint` to verify. Also ensure `IssuanceAuthorizationRules` permits both user and computer accounts.

## Verify Outbound Network Connectivity

Required URLs accessible under system context:
- `https://enterpriseregistration.windows.net`
- `https://login.microsoftonline.com`
- `https://device.login.microsoftonline.com`

**WPAD requirement**: Required for proxy detection on Windows 10 1703 or lower. Not required for 1709+.
Proxy support was added in build 1607 (Anniversary Update).

**User-level proxy issue**: Device registration runs as SYSTEM and needs machine-level proxy. Migrate proxy settings from `HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings` to `HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Internet Settings`.

## Verify Device Registration Service Connection Point (SCP)

```powershell
$Root = [ADSI]"LDAP://RootDSE"
$ConfigurationName = $Root.rootDomainNamingContext
$scp = New-Object System.DirectoryServices.DirectoryEntry
$scp.Path = "LDAP://CN=62a0ff2e-97b9-4513-943f-0d221bd30080,CN=Device Registration Configuration,CN=Services,CN=Configuration," + $ConfigurationName
$scp.Keywords
```

Expected output:
- `azureADName:contoso.com` (must NOT be `onmicrosoft.com` in federated environments)
- `azureADId:<tenantGuid>`

**Multi-forest**: Create SCP in each forest root separately (requires Enterprise Admin).

## Gathering and Reviewing Logs

### Client Side Logs

1. Download auth scripts: [KB4487175](https://internal.evergreen.microsoft.com/en-us/help/4487175)
2. Elevated PowerShell: `.\Start-auth.ps1 -v -acceptEULA`
3. Reproduce the issue (restart or run Automatic-Device-Join scheduled task)
4. `.\stop-auth.ps1`
5. Upload `authlogs` folder to DTM workspace

### Error Code Reference

| Error Code / Message | Cause | Solution |
|---|---|---|
| `NTE_INTERNAL_ERROR (0x8009002d)` | TPM hardware issue | Reset TPM (tpm.msc → Clear), try TPM 2.0 mode in BIOS, or disable TPM as last resort |
| `0x801c03f2 DSREG_E_DIRECTORY_FAILURE "device not found"` | Computer object not yet synced from AD to Azure AD | Wait for sync cycle or trigger delta sync |
| `WININET_E_TIMEOUT (0x80072ee2)` | Network failure / outbound proxy blocking | Verify computer account can reach `https://enterpriseregistration.windows.net` under SYSTEM context |
| `ERROR_ADAL_FAILED_TO_PARSE_XML (0xcaa9002c)` | AD FS connection issue | Verify: line of sight to AD FS, WS-Trust endpoints enabled, Windows Integrated Auth enabled as primary auth |
| `0x80090016 Keyset does not exist` | TPM ownership issue | Clear/reset TPM via Windows Defender Security Center → Device Security → Security Processor Troubleshooting |
| `0xcaa82f8f ERROR_ADAL_INTERNET_SECURE_FAILURE` | SSL cert from AD FS not trusted | Add AD FS service cert root CA to Trusted Root store on client |
| `0xcaa9002c` (federated, builds 1709 and below) | Incorrect ADFS claim rules — issuerid rule conflicts | Fix claim rules per [hybrid-azuread-join-manual](https://docs.microsoft.com/en-us/azure/active-directory/devices/hybrid-azuread-join-manual) |
| `0x80070005 E_ACCESSDENIED` | Computer account lacks Write permission on its own AD object | Grant Write permission on `usercertificate` attribute to computer account in on-premises AD |

## Common Scenarios

### TPM issue - Hybrid Join / PRT failure

Symptoms: Event ID 304 (join failed), Event ID 1098 `0x80090030`, System Event 1026 (TPM defending against dictionary attacks).

Fix: Clear TPM via Windows Defender Security Center → Device Security → Clear TPM. **Warning**: Disables BitLocker keys; disable BitLocker first.

### Hybrid Join fails in Managed domain (0x801c03f2)

Two sub-scenarios:
1. `usercertificate` attribute missing on computer object → `dsregcmd /leave`, delete MS-Organization-Access cert from `certlm.msc`, restart, trigger delta sync
2. Device object missing in Azure AD → same as above; re-check sync

### Device in dual state (Hybrid Joined + Azure AD Registered)

Auto-resolved on Windows 10 1803 (KB4489894) and 1809+. For 1709: use cleanup tool.  
Prevention: Deploy `HKLM\SOFTWARE\Policies\Microsoft\Windows\WorkplaceJoin` → `BlockAADWorkplaceJoin = 1`.

### HAADJ fails on Windows 10 builds 1709 and below (federated, 0xcaa1000e)

Cause: `support multiple domains` switch creates conflicting issuerid claim rule. Remove duplicate rule and follow [hybrid-azuread-join-manual](https://docs.microsoft.com/en-us/azure/active-directory/devices/hybrid-azuread-join-manual).

## DeviceRegTroubleshooter Tool

Runs 30+ tests for all join types.
Download: https://aka.ms/DSRegTool

## Hybrid Device Health Checker Script

Download: https://github.com/mzmaili/HybridDevicesHealthChecker  
Tests: join status to local AD, connection to Azure AD, certificate configuration, device existence/status in Azure AD.

## Test Device Registration Connectivity

Download: https://docs.microsoft.com/en-us/samples/azure-samples/testdeviceregconnectivity/testdeviceregconnectivity/  
Tests connectivity under SYSTEM context to all required Microsoft endpoints.
