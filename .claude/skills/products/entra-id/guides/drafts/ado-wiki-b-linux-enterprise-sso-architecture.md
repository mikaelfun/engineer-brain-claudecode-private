---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Device Registration/Linux Devices/Enterprise SSO for Linux Desktops/Architecture"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FDevice%20Registration%2FLinux%20Devices%2FEnterprise%20SSO%20for%20Linux%20Desktops%2FArchitecture"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Linux Enterprise SSO for Desktops — Architecture

## High Level Architecture

Linux device with Enterprise SSO involves three core Microsoft components interacting with the Linux OS stack:

1. **Microsoft Identity Broker** → device registration (WPJ), authentication, SSO tokens
2. **Microsoft Edge** → sole method for CA-protected resource access
3. **Intune Agent (Company Portal)** → device compliance, MDM enrollment

## Linux OS Components

| Component | Role |
|-----------|------|
| systemd | System service manager; manages broker and Intune background services |
| Secret Service (Keyring) | Stores auth secrets (AT, RT, ID tokens) used by broker and Intune |
| D-Bus | IPC bus — broker exposes D-Bus interface; Intune and Edge request tokens via it |
| LSB/FHS | Linux standards; Intune assesses compliance against these |
| Package management | apt (Ubuntu/Debian) or dnf/yum (RHEL/Fedora); packages from packages.microsoft.com |

### Package Repository Setup

- **Microsoft signing key**: `https://packages.microsoft.com/keys/microsoft.asc`
- **Ubuntu 20.04 repo**: `https://packages.microsoft.com/ubuntu/20.04/prod`
- **Ubuntu 22.04 repo**: `https://packages.microsoft.com/ubuntu/22.04/prod`
- **Edge repo**: `https://packages.microsoft.com/repos/edge`

## Component: Microsoft Identity Broker

- Shared authentication and registration component (analogous to Authenticator on mobile)
- Performs Workplace Join (WPJ = Microsoft Entra Registration)
- Handles login including MFA
- Provides SSO tokens to cooperating apps (Intune + Edge) via D-Bus

**D-Bus Bus Types:**
- **System Bus** — single system-wide instance; all users talk to it (with policy restrictions)
- **Session Bus** — per-user login session daemon for IPC among user applications

## Component: Microsoft Edge

- **Only** method for CA-protected resource access on Linux
- Requires Edge profile sign-in
- Integrates with broker via D-Bus for SSO tokens
- Supports stable / beta / dev channels

## Component: Intune Agent

- Portal UI (GTK+ app) + background systemd services
- Enrolls device in Intune (creates Intune record + Azure AD device record + WPJ)
- `intune-agent.timer` / `intune-agent.service` — periodic compliance check-in (~1 hr interval)
- Installs MSAL + `microsoft-identity-device-broker`

### Enrollment Association (per device)

- Linux device + UNIX user pair
- Device record in Azure AD (Entra registered)
- Device record in Intune

### Compliance States

| State | Meaning |
|-------|---------|
| Compliant | Meets org policies; access allowed |
| Checking status | Intune evaluating |
| Not compliant | Does not meet requirements; access may be blocked |

### Remediation: OS Distro/Version

- Check supported Linux distributions with system administrator
- Tested upgrades: Ubuntu 20.04→22.04, Ubuntu 22.04→22.10, RHEL (TBD)

### Remediation: Password Complexity

- Intune monitors local user logins and password changes
- Stats compared against password policies
- Strongly suggest log out/in after initial install

### Remediation: Disk Encryption

- Intune only recognizes dm-crypt subsystem (LUKS format with cryptsetup)
- Strongly recommended: set up encryption at OS install time
- Ignored partitions: read-only, pseudo-filesystems (/proc, tmpfs), /boot or /boot/efi

## Conditional Access Integration

- CA Policy → Include/Exclude **Linux** as Device platform condition
- Non-compliant devices → blocked from corporate resources
- `az login` (Azure CLI) also protected on compliant devices

## Refreshing Compliance

- Click "Refresh" in Intune app device details or compliance issues page
- Auto check-in: ~1 hour interval while device is on and user signed in
