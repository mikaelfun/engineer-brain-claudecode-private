---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Endpoint Security/Bitlocker Recovery Key"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FEndpoint%20Security%2FBitlocker%20Recovery%20Key"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# BitLocker Key Recovery via Company Portal

Users can access BitLocker recovery keys of Intune-enrolled devices through the Company Portal website (April 2024+).

## Prerequisites
- Enrolled Windows device in Intune
- Ability to log into Company Portal website (https://portal.manage.microsoft.com/)
- Permission to view BitLocker recovery key (if one exists in Entra ID)

## How It Works
1. Open Company Portal website
2. Navigate to Devices > select enrolled Windows device
3. Click "Get recovery key"
4. If multiple keys, click "Show recovery key" under the device with the needed key ID

## Entra ID Settings

### Restrict Recovery Key Access
- Location: Entra ID > Devices > Device settings
- Default: 'No' (all users can recover keys)
- 'Yes': restricts non-admin users from seeing BitLocker keys
- If restricted, users see: "Recovery key could not be retrieved"

### Audit Recovery Key Access
- Entra ID > Audit Logs > Key Management category
- Activity type: "Read BitLocker key"
- Logs include UPN and key ID
