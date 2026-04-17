---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/ADFS and WAP/ADFS Troubleshooting/ADFS - Troubleshooting Device Authentication"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FADFS%20and%20WAP%2FADFS%20Troubleshooting%2FADFS%20-%20Troubleshooting%20Device%20Authentication"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# ADFS Device Authentication Troubleshooting Guide

## Step 1: Check if Device Policy is Defined for RP
- Open AD FS Management MMC
- Select the impacted RP trust
- Click "Edit Access Control Policy" and check for device-related policy conditions

## Step 2: Check Client Configuration
- Run `dsregcmd /status` to verify device registration state

### Device State Properties Reference
| Property | Description |
|----------|-------------|
| AzureAdJoined | YES if device is joined to Azure AD |
| EnterpriseJoined | YES if device is joined to AD FS (on-premises WHfB) |
| DeviceId | Unique device ID; hybrid joined matches AD computer object GUID |
| Thumbprint | X509 cert thumbprint in LocalMachine\My store |
| KeySignTest | PASSED if device key works (must run elevated) |
| TpmProtected | YES if device key is protected by TPM |
| DomainJoined | YES if joined to traditional AD domain |
| DomainName | NETBIOS domain name |

### User State Properties
- NgcSet: YES if Windows Hello credential is set
- WorkplaceJoined: YES if workplace joined (Azure AD registered)

### SSO State Properties
- AzureAdPrt: YES if Primary Refresh Token exists
- AzureAdPrtUpdateTime: Last PRT update timestamp
- AzureAdPrtExpiryTime: PRT expiry timestamp

## Step 3: Verify Device Registration
- Confirm device appears in Azure AD / Entra ID
- Check if device certificate is valid and not expired
- Verify SCP (Service Connection Point) configuration for hybrid join scenarios
