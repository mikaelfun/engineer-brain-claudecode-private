---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/Purview Message Encryption/How to: Purview Message Encryption/How to: Verify and set the Information Rights Management (IRM) Configuration for Purview Message Encryption"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FPurview%20Message%20Encryption%2FHow%20to%3A%20Purview%20Message%20Encryption%2FHow%20to%3A%20Verify%20and%20set%20the%20Information%20Rights%20Management%20%28IRM%29%20Configuration%20for%20Purview%20Message%20Encryption"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How to: Verify and Set IRM Configuration for Purview Message Encryption

**Scope**: Exchange Online IRM configuration for MIP/RMS-based encryption (PME). **Not applicable to on-premises AD RMS customers.**

IRM = the RMS-enabled application component in Exchange Online that enforces Rights Management. Required for EXO Transport Rules, OWA encryption, and making Do Not Forward (DNF) / Encrypt-Only (EO) templates available.

## Prerequisites
- AipService PowerShell module
- ExchangeOnlineManagement PowerShell module  
- Admin must be in 'Compliance Management' or 'Organization Management' group roles (or custom role with Information Rights Management role)

## Step 1: Install Modules & Connect

```PowerShell
# Install
Install-Module AipService
Install-Module ExchangeOnlineManagement

# Connect
Connect-AipService
Connect-ExchangeOnline
```

## Step 2: Check AipService is Enabled

```PowerShell
Get-AipServiceConfiguration | FL
```

Check:
- `FunctionalState` = **Enabled** → If not: `Enable-AipService`
- `IPCv3ServiceFunctionalState` = **Enabled** → If not: `Enable-AipServiceIPCv3`

> After enabling, wait ~24h for replication before testing IRM.

## Step 3: Set IRM LicensingLocation and Enable IRM

```PowerShell
# Get AIP endpoint
$EndPoint = (Get-AipServiceConfiguration).LicensingExtranetDistributionPointUrl

# Set in IRM
Set-IRMConfiguration -LicensingLocation $EndPoint

# Enable IRM
Set-IRMConfiguration -InternalLicensingEnabled $true -AzureRMSLicensingEnabled $true
```

Wait a couple of hours (ideally 24h), then run `Get-RMSTemplate` to confirm DNF and EO templates appear.

## Step 4: Check IRM Configuration

**Via Assist (Assist365):**
- Actions → Diagnostics → search "irm" → run with sender + recipient → check Full Details or Diagnostics details

**Via PowerShell:**
```PowerShell
Get-IRMConfiguration | FL
```

### Key Parameters Explained

| Parameter | Description |
|-----------|-------------|
| `InternalLicensingEnabled` | Enables IRM for EXO. Required with AzureRMSLicensingEnabled. |
| `AzureRMSLicensingEnabled` | Enables Azure RMS licensing and advanced labeling features. |
| `TransportDecryptionSetting` | `Mandatory`/`Optional`/`Disabled`. If Disabled, may block DLP on encrypted emails. |
| `JournalReportDecryptionEnabled` | Enables journal decryption — journal recipient gets encrypted + decrypted copy. |
| `SimplifiedClientAccessEnabled` | Enables encryption features in OWA (required for sensitivity button + EO/DNF in OWA). |
| `SearchEnabled` | Enables search of IRM-encrypted messages in OWA. |
| `DecryptAttachmentForEncryptOnly` | If true, EO-encrypted attachments are decrypted on download. |
| `SimplifiedClientAccessEncryptOnlyDisabled` | If true, Encrypt-Only is hidden in OWA. |
| `SimplifiedClientAccessDoNotForwardDisabled` | If true, Do Not Forward is hidden in OWA. |
| `EnablePdfEncryption` | Enables PDF attachment encryption. |
| `AutomaticServiceUpdateEnabled` | Required for Teams/AAD Groups labeling. Enables AIP feature auto-sync. |
| `LicensingLocation` | RMS licensing URL(s). **Must have Get-AipServiceConfiguration URL as first entry.** |
| `EnablePortalTrackingLogs` | Enables OME portal audit logging (E5 license required). |
| `EDiscoverySuperUserEnabled` | If true, bypasses RMS decryption for eDiscovery super users. |

## Step 5: Test IRM Configuration

```PowerShell
# Via PowerShell
Test-IrmConfiguration -Sender sender@contoso.com -Recipient recipient@contoso.com
```

If result = `Fail`: IRM disabled/misconfigured, AIP disabled, user has no label access, or Onboarding policy is set.

## Step 6: Common Issues and Fixes

| Symptom | Root Cause | Fix |
|---------|-----------|-----|
| OWA labels/templates not available; Sensitivity button missing | IRM not enabled or SimplifiedClientAccessEnabled=false | Enable IRM; `Set-IRMConfiguration -SimplifiedClientAccessEnabled $true` |
| Transport Rules can't see encryption templates | InternalLicensingEnabled or AzureRMSLicensingEnabled=false | `Set-IRMConfiguration -InternalLicensingEnabled $true -AzureRMSLicensingEnabled $true` |
| RMS templates missing or fail to sync to Exchange | Multiple LicensingLocations with wrong order | LicensingExtranetDistributionPointUrl from Get-AipServiceConfiguration MUST be first |
| PDF attachments not encrypted with EO | EnablePdfEncryption=false | `Set-IRMConfiguration -EnablePdfEncryption $true` |
| No OME audit logs | EnablePortalTrackingLogs=false | `Set-IRMConfiguration -EnablePortalTrackingLogs $true` (E5 required) |
| Encrypted messages not searchable in OWA | SearchEnabled=false | `Set-IRMConfiguration -SearchEnabled $true` |
| Teams/AAD Group labels not showing | AutomaticServiceUpdateEnabled=false | `Set-IRMConfiguration -AutomaticServiceUpdateEnabled $true` |
| Journaling copies still encrypted | JournalReportDecryptionEnabled=false | `Set-IRMConfiguration -JournalReportDecryptionEnabled $true` |
| Recipient gets unencrypted attachment unexpectedly | DecryptAttachmentForEncryptOnly=true | `Set-IRMConfiguration -DecryptAttachmentForEncryptOnly $false` |
| OWA DNF or EO not available | SimplifiedClientAccessEncryptOnlyDisabled or DoNotForwardDisabled=true | Set the respective flag to $false |
| Labels visible but can't apply encrypted labels | TransportDecryptionSetting=Disabled | Set to Optional or Mandatory |

### Multiple Licensing Locations
If `Get-IRMConfiguration` shows multiple LicensingLocation values, the URL from `Get-AipServiceConfiguration` **MUST** be listed first. If not, templates will fail to sync.
Follow TSG: [How To: Re-order IRM licensing Locations](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10531/How-To-Re-order-IRM-licensing-Locations)
