---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Device Registration/Window Devices/Microsoft Entra Join/Audit BitLocker Recovery Keys in Azure AD"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FDevice%20Registration%2FWindow%20Devices%2FMicrosoft%20Entra%20Join%2FAudit%20BitLocker%20Recovery%20Keys%20in%20Azure%20AD"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Audit BitLocker Recovery Keys in Azure AD

## Overview

MS Graph API provides BitLocker key retrieval with audit trail. Available in v1.0 in Public, FF, BF & MC clouds.

**Limitation**: Only Azure AD Joined Windows 10+ devices.

## Required Roles

- Global administrator
- Cloud device administrator
- Helpdesk administrator
- Security reader / Security administrator
- Intune service administrator
- Registered owner of the device

## API Usage

### Required Headers (MUST be present or 400 error)
- `ocp-client-name` - client name identifier
- `ocp-client-version` - client version

### Permissions
- `BitLockerKey.ReadBasic.All` - metadata only
- `BitLockerKey.Read.All` - metadata + key

### Graph API Endpoints
1. List all keys: `GET /BitLocker/recoveryKeys`
2. Filter by device: `GET /BitLocker/recoveryKeys?$filter=deviceId eq '{id}'`
3. Get key metadata: `GET /BitLocker/recoveryKeys/{keyId}`
4. Read recovery key (triggers audit): `GET /BitLocker/recoveryKeys/{keyId}?$select=key`

Note: `$Top` filter is NOT supported on List recoveryKeys API.

## Admin Flows
- **Azure Portal**: AAD > Devices > select device > Show recovery key
- **Endpoint Manager**: Devices > Windows > select device > Recovery keys > Show Recovery Key
- **End User**: myworkaccount.microsoft.com > Devices > Manage Devices > View recovery key

## Audit Logs
- Service: Device Registration Service
- Category: KeyManagement
- Activities: Add/Read/Delete BitLocker key
- **Filter is case-sensitive**: Must be "Read BitLocker key" (not "Read Bitlocker key")

## Known Issues
1. Company Portal mobile app redirects to web app for BitLocker keys
2. End users can only recover keys for devices they own (registered owner). HAADJ devices require admin help
3. Admin missing required role cannot view keys
4. Duplicate Read audit events (known PG issue)
5. "Multiple keys found" error when BitLockered drive moved to new device
6. $Top filter not supported on List recoveryKeys API

## ICM: Owning Service: ADRS, Owning Team: ADRS
## Root Cause Tree: Sign-in and MFA > Device Registration > Device Administration > Bitlocker Key Recovery
