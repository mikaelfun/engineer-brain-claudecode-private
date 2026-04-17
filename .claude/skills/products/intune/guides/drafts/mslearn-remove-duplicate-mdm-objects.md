# Remove Duplicate Mobile Device Management Objects in Microsoft Entra ID

**Source**: [Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/mem/intune/device-management/remove-duplicate-mobile-device-management)

## When to Use

- Customer reports duplicate device entries in Entra ID or Intune
- Orphaned device objects not automatically cleaned up after 90 days
- Need to manually remove stale MDM device records

## Recommended Approach

Microsoft recommends using **PowerShell** to remove duplicate or stale devices. Manual removal via portal is a fallback.

## Steps (Portal)

1. Sign in to [Microsoft 365 admin center](https://admin.microsoft.com/) as administrator
2. Navigate to **Microsoft Entra ID** > **Users** > select the user account
3. Select **Devices**
4. Identify and select the duplicate/orphaned device entry
5. Delete the orphaned entry

## Notes

- A free Azure subscription is included with paid Office 365 subscriptions (required for Entra ID access)
- For automated cleanup, see: [Clean up stale devices in the Azure portal](https://learn.microsoft.com/en-us/azure/active-directory/devices/manage-stale-devices#clean-up-stale-devices-in-the-azure-portal)
- Related: Device UPN showing as "None" may indicate orphaned devices (see intune-mslearn-144)
