---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Connect Sync/Object Level SOA/Moving SOA to EXO"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FConnect%20Sync%2FObject%20Level%20SOA%2FMoving%20SOA%20to%20EXO"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Move SOA for Exchange Attributes to Exchange Online

## Overview

New capability in Exchange Online allows administrators to manage Exchange attributes for directory-synchronized users with cloud-hosted mailboxes. The Source of Authority (SOA) for Exchange-specific attributes can be transferred to the cloud while identity attributes remain under on-premises AD control.

## How It Works

A new property **IsExchangeCloudManaged** indicates whether Exchange attributes for a synced user have SOA in the cloud or on-premises (default: False).

When set to True:
- Exchange attributes become editable in Exchange Online (no longer overwritten by on-prem sync)
- Identity attributes remain mastered in on-prem AD
- Only supports user, shared, equipment, or room mailboxes (NOT groups or contacts)

## Prerequisites

- Exchange Hybrid Environment configured
- Entra Connect version 2.5.76.0 or higher
- Exchange Administrator role in Exchange Online
- Exchange Online PowerShell module
- Active, healthy directory synchronization

## Check Current SOA Status

```powershell
# Single mailbox
Get-Mailbox -Identity "john.doe@contoso.com" | Select-Object DisplayName, IsExchangeCloudManaged

# All cloud-managed mailboxes (Get-EXOMailbox NOT supported for this property)
Get-Mailbox -ResultSize Unlimited | Where-Object {$_.IsExchangeCloudManaged -eq "True"} | Select-Object DisplayName, PrimarySmtpAddress, IsExchangeCloudManaged
```

## Step-by-Step Implementation

### Step 1: Connect to Exchange Online
```powershell
Connect-ExchangeOnline -UserPrincipalName admin@contoso.com
```

### Step 2: Transfer SOA
```powershell
Set-Mailbox -Identity "john.doe@contoso.com" -IsExchangeCloudManaged $true
```

### Step 3: Verify (wait up to 24 hours)
```powershell
Get-Mailbox -Identity "john.doe@contoso.com" | Select-Object DisplayName, IsExchangeCloudManaged, WhenChangedUTC
```

### Step 4: Test
```powershell
Set-Mailbox -Identity "john.doe@contoso.com" -CustomAttribute1 "Cloud Managed"
Get-Mailbox -Identity "john.doe@contoso.com" | Select-Object CustomAttribute1
```

## Reverting SOA to On-Premises

```powershell
Set-Mailbox -Identity "john.doe@contoso.com" -IsExchangeCloudManaged $false
```
Before reverting: manually update on-prem AD with any Exchange attribute changes made in cloud, then perform directory sync.

## Support Boundaries

| SBU | Engineering Team | SAP Path |
|-----|-----------------|----------|
| MW | EXOManageability | Microsoft 365 > EEE-DEV > EXOManageability |

## Key FAQ

- **SOA transfer takes up to 24 hours** to complete
- **Changes do NOT sync back to on-prem** - expected behavior after SOA transfer
- **Offboarding while IsExchangeCloudManaged=True** breaks sync - must revert first
- **Only works with Entra Connect** (v2.5.76.0+) - Cloud Sync support planned for future
- **Groups and Contacts** not supported - use object-level SOA transfer instead
