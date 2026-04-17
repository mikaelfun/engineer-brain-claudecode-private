---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/Hello for Business/Common scenarios/S2 Unable to access onprem resources AADJ"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FStrongAuth%20Passwordless(WHfB%20FIDO%20phone%20based)%2FHello%20for%20Business%2FCommon%20scenarios%2FS2%20Unable%20to%20access%20onprem%20resources%20AADJ"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Unable to access local resources with Azure AD Joined PC and Federated account (WHfB Key Trust)

## Scenario
Hybrid user logging in to a PC that is Azure AD Joined, using Windows Hello for Business Key Trust configuration (available since Windows 10 RS2).

## Prerequisites Checklist

- [ ] User has successfully Azure AD Joined the PC
- [ ] PC has line of sight (network access) to a domain controller for the user's AD domain
- [ ] Each domain controller has a certificate per [Domain Controller certificate template](https://docs.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/hello-hybrid-key-whfb-settings-pki#domain-controller-certificate-template)
- [ ] Each AADJ PC has the root certificate from the DC cert's CA in its trusted root store
- [ ] The CRL from the DC cert's CA is accessible from the client
- [ ] 30 minutes have passed since provisioning (for public key sync from AAD to AD)

## Troubleshooting Steps

### 1. Verify public key has been synced to AD
```powershell
repadmin /showobjmeta DCSERVER "CN=TEST USER,OU=UserAccounts,DC=company,DC=domain,DC=com"
```
Check that `msDS-KeyCredentialLink` attribute is populated.

### 2. Verify DC can be located from client
```cmd
nltest /dsgetdc:FQDN
```

### 3. Collect diagnostic data (in order of preference)
1. Network capture of the failure from the client
2. Kerberos logging from the client
3. KDC logging on the DC
