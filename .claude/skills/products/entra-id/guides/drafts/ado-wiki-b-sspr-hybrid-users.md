---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/SSPR - Self Service Password Reset/SSPR - Hybrid Users"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Account%20Management/SSPR%20-%20Self%20Service%20Password%20Reset/SSPR%20-%20Hybrid%20Users"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# SSPR - Hybrid Users (Password Writeback) Troubleshooting Guide

Supported by Entra ID(AAD) - Account Management.

## Prerequisites
- Entra ID P1 or trial license
- Hybrid Identity Administrator account
- SSPR configured in Entra ID
- On-premises AD DS with current Microsoft Entra Connect version

## How Password Writeback Works
See [On-premises password writeback with SSPR](https://learn.microsoft.com/en-us/entra/identity/authentication/concept-sspr-writeback)

## Supported Writeback Operations
- End-user self-service: voluntary change, force change (expiry), portal reset
- Administrator: self-service change/force/portal reset, admin-initiated reset via Entra admin center or Graph API

## Unsupported Writeback Operations
- End-user: reset via PowerShell v1/v2 or Graph API
- Administrator: reset via PowerShell v1/v2 or M365 admin center
- Admin cannot reset own password for writeback

## Troubleshooting Approach
1. Get error message from Password Reset Portal + Fiddler/HAR
2. Check if user is Synced or Cloud-only (verify in ASC)
3. Check Application Event Log in ASC (Source: ADSync, PasswordResetService)
4. Match error to table below

## Error Reference Table

| Portal Error | Event IDs | Keywords |
|---|---|---|
| SSPR_0029 | 33004, 6329 | ExportPasswordSet failed / management agent credentials denied |
| SSPR_0029 | 33004, 6329 | Failed to acquire user info / Servers not allowed remote calls to SAM |
| SSPR_0029 | 6329, 33001 | ExportPasswordSet failed / Invalid character in AD DN |
| SSPR_0029 | 4724 (Security-Auditing) | Password policy violation (length/complexity/age/history) |
| SSPR_0030 | 31004 | Connection to connect service was lost (ConnectionLostException) |
| SSPR_009 | - | Password reset not turned on for organization (admin role + synced user) |
| SSPR_0015 | - | Service principal needed for password reset missing or misconfigured |

## SSPR_0029: Common Scenarios

### MA Credentials Denied Access
- Synced AD administrator forgot password, wants to reset from cloud
- Check if MSOL connector account has proper permissions

### Servers Not Allowed Remote Calls to SAM
- Network policy blocking SAM access
- Check Network Policy Server configuration

### Invalid Character in AD Distinguished Names
- Special characters in user DN causing export failure

### Password Policy Violation
- On-premises password policy (length/complexity/age/history) rejecting new password
- Check Event ID 4724 in Security Auditing log

## Escalation
If not resolved, consult senior resource or ask in [Cloud Identity - Account Management | Password reset](https://teams.microsoft.com/l/channel/19%3A4577cedc5be44ccca87da015e89eb84f%40thread.skype/Password%20reset) Teams channel.
