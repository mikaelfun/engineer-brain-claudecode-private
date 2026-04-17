# Windows LAPS with Azure AD — Configuration Guide

> Source: OneNote — Mooncake POD Support Notebook / How To / Windows
> Quality: draft (pending SYNTHESIZE review)

## Overview

Windows LAPS (Local Administrator Password Solution) with Azure AD backs up local admin passwords to Entra ID, allowing recovery and rotation via Intune.

**Availability**: As of 03/2023, Azure AD LAPS requires Windows 11 Insider Preview Build 25145+. Azure AD LAPS scenario is in public preview.

## Step 1: Enable LAPS in Azure AD

1. Azure AD → **Devices** → **Device settings**
2. Set LAPS to **Yes**, click **Save**

## Step 2: Create Intune Account Protection Policy

1. Microsoft Intune → **Endpoint security** → **Account protection**
2. **Create Policy** → Platform: Windows 10 and later → Profile: Windows LAPS
3. Configure:
   - **Backup Directory**: Azure AD
   - Other settings as needed (see Policy Settings below)
4. Set **Assignments** to target Azure AD groups
5. **Review + Create**

## Step 3: Recover Local Admin Password

1. Azure AD → **Devices | Overview** → **Local admin password recovery**
2. All LAPS-enabled devices are listed
3. Click **Show local administrator password** next to target device
4. Custom RBAC roles and Administrative Units can scope password recovery permissions

## Step 4: Manual Password Rotation

1. Intune → **Devices | All devices** → Search for device
2. Device action: **Rotate local admin password**

## Step 5: Audit

1. Azure AD → **Devices | Overview** → **Audit logs**
2. Activity filter:
   - `Update device local administrator password`
   - `Recover device local administrator password`

## Policy Settings (Azure AD Mode)

| Setting | Values |
|---------|--------|
| BackupDirectory | 0=Disabled (default), **1=Azure AD**, 2=Windows Server AD |
| AdministratorAccountName | Custom admin account name (default: built-in administrator) |
| PasswordComplexity | 1=Upper, 2=Upper+Lower, 3=+Numbers, **4=+Special (default)** |
| PasswordLength | 8–64 chars (**default 14**) |
| PasswordAgeDays | 1–365 (**default 30**, min 7 for Azure AD) |
| PostAuthenticationActions | 0=Disabled, 1=Reset password, 2=+Sign out, 3=+Reboot |
| PostAuthenticationResetDelay | 0–24 hours (default 24h) |

## Related Entries

- intune-onenote-194: LAPS Kusto troubleshooting queries
- intune-onenote-196–198: LAPS specific error scenarios (DNS, 403, 400)
- intune-onenote-204: LAPS Event Log troubleshooting guide
