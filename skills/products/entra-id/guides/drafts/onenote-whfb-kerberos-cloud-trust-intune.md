# WHFB Kerberos Cloud Trust with Intune (Hybrid AADJ)

> Source: OneNote MCVKB — Lab - WHFB Kerberos cloud trust with Intune
> Quality: guide-draft | Needs: review, 21V endpoint validation

## Prerequisites

- AAD & Intune License
- Hybrid AADJ environment (DRS configured, Intune enrollment done)
- Domain Controller with line-of-sight to Azure

## Step 1: Deploy Azure AD Kerberos Server Object

Install the PowerShell module:
```powershell
Install-Module -Name AzureADHybridAuthenticationManagement -AllowClobber
# Note: depends on AzureADPreview module
```

Create the Kerberos server object:
```powershell
$domain = $env:USERDNSDOMAIN
$userPrincipalName = "admin@tenant.partner.onmschina.cn"
$domainCred = Get-Credential

Set-AzureADKerberosServer -Domain $domain -UserPrincipalName $userPrincipalName -DomainCredential $domainCred
```

Verify:
```powershell
Get-AzureADKerberosServer -Domain $domain -UserPrincipalName $userPrincipalName -DomainCredential (Get-Credential)
```

Expected result: `UserAccount: CN=krbtgt_AzureAD`, `ComputerAccount: CN=AzureADKerberos` in AD. AAD Audit log shows "Add Kerberos Domain".

## Step 2: Configure WHFB Policy via Intune

1. **Enable WHFB**: Create Intune device configuration profile → Identity Protection → Enable Windows Hello for Business
2. **Enable Cloud Kerberos Trust**: Create custom OMA-URI profile:
   - URI: `./Device/Vendor/MSFT/PassportForWork/{TenantID}/Policies/UseCloudTrustForOnPremAuth`
   - Value: `Boolean - True`

## Step 3: Provision WHFB on Device

After policy syncs to device, next reboot/sign-in triggers WHFB enrollment wizard. User sets up PIN (and optionally biometrics).

## Step 4: Verify Cloud Kerberos Trust

### dsregcmd /status
Check for:
- `OnPremTgt: YES` — Partial TGT from AAD (as RODC), must exchange with on-prem DC for full TGT
- `CloudTgt: YES` — Used to access Kerberos-enabled Azure resources (e.g., Azure File Share)

### Registry
Check `HKLM\...\PassportForWork` for UseCloudTrustForOnPremAuth = 1.

### klist cloud_debug
Shows TGT types:

| klist cloud_debug | Internal Name | Usage |
|---|---|---|
| Cloud Primary (Hybrid logon) TGT available | Mcticket / rodctgt / partial TGT | Presented to on-prem DC for full TGT (used for FIDO logon or WHFB Cloud Trust) |
| Cloud Referral TGT present in cache | Cloud TGT / cloudtgt | Presented to AAD for service ticket (legacy Kerberos apps integrated with AAD) |

### Cloud TGT Details
```
klist get krbtgt
```
- SPN target: `krbtgt/kerberos.microsoftonline.com`
- Realm: `kerberos.microsoftonline.com`
- Valid for: 10 hours
- Etype: -1 (custom)

## References

- [WHFB Cloud Kerberos Trust Deployment](https://learn.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/deploy/hybrid-cloud-kerberos-trust)
- [Passwordless Security Key On-Premises](https://learn.microsoft.com/en-us/entra/identity/authentication/howto-authentication-passwordless-security-key-on-premises)
- [Azure AD Kerberos Overview (internal wiki)](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/861817/Azure-AD-Kerberos)
