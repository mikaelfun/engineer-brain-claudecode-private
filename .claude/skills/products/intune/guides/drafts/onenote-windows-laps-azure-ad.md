# Windows LAPS with Azure AD - Configuration Guide

> Source: OneNote — Mooncake POD Support Notebook / Intune / How To / Windows
> Quality: guide-draft (pending review)

## Overview

Windows LAPS (Local Administrator Password Solution) with Azure AD allows managing and backing up local administrator passwords to Azure AD, with recovery and rotation via Intune and Azure portal.

## Prerequisites

- Windows 11 Insider Preview Build 25145+ (or later GA builds with LAPS support)
- Azure AD Premium license
- Microsoft Intune

## Configuration Steps

### 1. Enable LAPS in Azure AD

1. In **Azure AD** > **Devices** > **Device settings**, set LAPS to **Yes** and click **Save**

### 2. Create Intune LAPS Policy

1. Go to **Microsoft Intune** > **Endpoint security** > **Account protection**
2. Click **Create Policy** > Windows 10 and later > LAPS profile
3. Configure **Backup Directory** = **Azure AD**
4. Set desired password policy settings (see below)
5. Assign to target Azure AD device groups
6. Click **Review + Create**

## Password Recovery

- **Azure AD Portal**: Devices > All devices > **Local admin password recovery** > **Show local administrator password**
- Supports custom roles and administrative units for granular RBAC

## Password Rotation

- **Intune Portal**: Devices > All devices > Select device > **Rotate local admin password** (device action)

## Auditing

- **Azure AD Portal**: Devices > Audit logs
  - Filter by Activity: "Update device local administrator password" or "Recover device local administrator password"

## Policy Settings (Azure AD Mode)

| Setting | Description | Default |
|---------|-------------|---------|
| BackupDirectory | 0=Disabled, **1=Azure AD**, 2=AD | 0 |
| AdministratorAccountName | Custom admin account name | Built-in admin |
| PasswordComplexity | 1=Upper, 2=+Lower, 3=+Numbers, **4=+Special** | 4 |
| PasswordLength | 8-64 characters | 14 |
| PasswordAgeDays | 1-365 days (min 7 for Azure AD) | 30 |
| PostAuthenticationActions | 0=None, 1=Reset pwd, 2=+Signout, 3=+Reboot | — |
| PostAuthenticationResetDelay | 0-24 hours after auth to execute actions | 24 |

## Notes

- Only the settings listed above apply to Azure AD LAPS mode (AD-specific settings do not apply)
- Ensure devices are Azure AD joined or Hybrid Azure AD joined
