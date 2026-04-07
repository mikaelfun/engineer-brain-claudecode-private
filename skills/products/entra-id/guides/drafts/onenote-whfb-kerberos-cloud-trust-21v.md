# WHFB Kerberos Cloud Trust Deployment (Mooncake / 21V)

## Summary
End-to-end guide for deploying Windows Hello for Business with Kerberos Cloud Trust in Mooncake (21Vianet) environment, including FIDO security key sign-in and Intune policy configuration.

## Prerequisites
- AAD (Entra ID) + Intune License
- Hybrid AAD Join environment (DRS done, Intune enrollment done)
- Domain Controller with AD DS

## Step 1: Deploy Microsoft Entra Kerberos Server

### Install PowerShell Module
```powershell
Install-Module -Name AzureADHybridAuthenticationManagement -AllowClobber
# Note: depends on AzureADPreview module
```

### Set Endpoint to China (21V Critical)
```powershell
# Check current endpoint
Get-AzureADKerberosServerEndpoint
# Output: Current Endpoint = 1(China)

# Set to China if not already
Set-AzureADKerberosServerEndpoint -TargetEndpoint 1
```

> Endpoints: 0=Public, 1=China, 2=US Government, 99=PreProduction

### Create Kerberos Server Object
```powershell
$domain = $env:USERDNSDOMAIN
$userPrincipalName = "admin@tenant.partner.onmschina.cn"
$domainCred = Get-Credential

Set-AzureADKerberosServer -Domain $domain -UserPrincipalName $userPrincipalName -DomainCredential $domainCred
```

### Verify
```powershell
Get-AzureADKerberosServer -Domain $domain -UserPrincipalName $userPrincipalName -DomainCredential (Get-Credential)
```

**Expected objects on DC:**
- `CN=krbtgt_AzureAD,CN=Users,DC=...` (User Account)
- `CN=AzureADKerberos,OU=Domain Controllers,DC=...` (Computer Account)

**AAD Audit Log:** Look for "Add Kerberos Domain" event.

## Step 2: FIDO Security Key (Optional)

For passwordless security key sign-in on 21V:
```powershell
Install-Module -Name AzureADKerberosTest -RequiredVersion 2.0.55.0
Set-AzureADKerberosServerEndpoint -TargetEndpoint 1
Set-AzureADKerberosServer -Domain $domain -CloudCredential $cloudCred -DomainCredential $domainCred -Debug
```

## Step 3: Intune Policy Configuration

### 3a. Enable WHFB
- Intune > Device Configuration > Create profile
- Enable Windows Hello for Business

### 3b. Configure Cloud Trust
Custom OMA-URI:
| Setting | Value |
|---------|-------|
| URI | `./Device/Vendor/MSFT/PassportForWork/{TenantId}/Policies/UseCloudTrustForOnPremAuth` |
| Value | Boolean - True |

## Step 4: Provision & Verify

After policy takes effect, next reboot/sign-in prompts WHFB setup.

### Verify Cloud Trust Active
```cmd
dsregcmd /status
```
Look for:
- **OnPremTgt**: YES — partial TGT from AAD (RODC), needs on-prem DC exchange for full TGT
- **CloudTgt**: YES — for accessing Kerberos-enabled Azure resources

### Registry Check
Check `UseCloudTrustForOnPremAuth` in PassportForWork registry path.

### Klist Verification
```cmd
klist cloud_debug
```

## TGT Types Reference

| klist cloud_debug | Internal Name | Usage |
|---|---|---|
| Cloud Primary (Hybrid logon) TGT | Mcticket / rodctgt / partial tgt | For FIDO/WHFB Cloud Trust logon. Presented to on-prem DC for full TGT. Cannot directly access on-prem resources. |
| Cloud Referral TGT | Cloud TGT / cloudtgt | For legacy Kerberos apps integrated with AAD. Presented to AAD for service ticket. |

**Cloud TGT Details:**
- SPN target: `krbtgt/kerberos.microsoftonline.com`
- Realm: `kerberos.microsoftonline.com`
- Valid: 10 hours
- Etype: -1 (custom)

## References
- [WHFB Cloud Kerberos Trust](https://learn.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/deploy/hybrid-cloud-kerberos-trust)
- [Passwordless security key on-prem](https://learn.microsoft.com/en-us/entra/identity/authentication/howto-authentication-passwordless-security-key-on-premises)
- [Azure AD Kerberos Wiki](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/861817/Azure-AD-Kerberos)

## Source
- OneNote: Mooncake POD Support Notebook > WHFB > Lab record
