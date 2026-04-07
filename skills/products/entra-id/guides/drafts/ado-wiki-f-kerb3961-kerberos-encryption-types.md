---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AskDS Blog Content/20250603 What's the deal with Kerb3961?"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAskDS%20Blog%20Content%2F20250603%20What%27s%20the%20deal%20with%20Kerb3961%3F"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Kerb3961: Kerberos Encryption Type Policy Engine (Windows Server 2025 / Windows 11 24H2)

Originally posted on AskDS blog at [What's the deal with Kerb3961? | Microsoft Community Hub](https://techcommunity.microsoft.com/blog/askds/whats-the-deal-with-kerb3961/4420109)

## What is Kerb3961?

Kerb3961, named after [RFC3961](https://www.rfc-editor.org/rfc/rfc3961), is a refactor of the Kerberos cryptography engine into its own library. It is the authoritative source for:

1. Etype selection
2. Etype usage
3. Etype management

## Key Changes

### Hard-coded Etype Removal

The biggest change is the removal of hard-coded cipher usage and stronger adherence to administrator-configured encryption types. The environment will operate as configured.

### Legacy Registry Key No Longer Honored

Kerb3961 no longer honors the legacy registry key path:
```
HKEY_LOCAL_MACHINE\CurrentControlSet\Control\Lsa\Kerberos\Parameters
REG_DWORD SupportedEncryptionTypes
```

Instead, use the Group Policy: [Network security: Configure encryption types allowed for Kerberos](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/security-policy-settings/network-security-configure-encryption-types-allowed-for-kerberos)

The group policy configures supported encryption types for a machine account, propagated to AD's `msds-SupportedEncryptionType` attribute.

### Impact on Existing Environments

Misconfigurations previously hidden by loose adherence to configured etypes will now be exposed. This increases the knowledge required by administrators.

## What Needs to Be Done

### Audit Etype Usage

Use improved KDC auditing events:
- [Event 4768](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4768) - Kerberos TGT requested
- [Event 4769](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4769) - Kerberos service ticket requested

### Tools

- [Kerberos EType Calculator](https://microsoft.github.io/Kerberos-Crypto/pages/etype-calc.html) - verify etype configuration
- [Microsoft Kerberos-Crypto GitHub](https://github.com/microsoft/Kerberos-Crypto) - PowerShell scripts for etype usage and account key availability analysis

## Why This Matters

This refactor enables:
- DES deprecation
- Ongoing RC4 deprecation work
- More secure Kerberos operations by default
- More predictable etype usage
- More stable etype additions/removals

Related CVEs that drove this change:
- [CVE-2022-37966 (KB5021131)](https://support.microsoft.com/en-gb/topic/kb5021131-how-to-manage-the-kerberos-protocol-changes-related-to-cve-2022-37966-fd837ac3-cdec-4e76-a6ec-86e67501407d)
- [CVE-2022-37967 (KB5020805)](https://support.microsoft.com/en-us/topic/kb5020805-how-to-manage-kerberos-protocol-changes-related-to-cve-2022-37967-997e9acc-67c5-48e1-8d0d-190269bf4efb)

## Feedback Channels

- [Feedback Hub](https://support.microsoft.com/en-us/windows/send-feedback-to-microsoft-with-the-feedback-hub-app-f59187f8-8739-22d6-ba93-f66612949332)
- [Windows Insider Program](https://www.microsoft.com/en-us/windowsinsider/)
