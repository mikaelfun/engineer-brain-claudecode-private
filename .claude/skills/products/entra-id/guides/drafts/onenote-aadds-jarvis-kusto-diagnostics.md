# Entra Domain Services (AADDS) Jarvis/Kusto Diagnostics

## Overview

Reference table for Jarvis/Geneva queries used to diagnose Azure AD Domain Services issues. These queries are accessed via the Geneva portal (portal.microsoftgeneva.com).

## Verify Managed Domain Existence

| Scenario | Query Link | Parameters |
|----------|-----------|------------|
| Search by AAD tenant ID | [Geneva s/9F15ECC2](https://portal.microsoftgeneva.com/s/9F15ECC2) | Replace context ID filter with customer's AAD tenant ID |
| Search by managed domain name | [Geneva s/54A73A14](https://portal.microsoftgeneva.com/s/54A73A14) | Replace domainName filter |

## Login / Security Events

| Scenario | Query Link | Parameters |
|----------|-----------|------------|
| Login Events containing Username | [Geneva s/758221E2](https://portal.microsoftgeneva.com/s/758221E2) | Replace timestamp, tenant ID, username |
| Account Lockout Lookup | [Geneva s/46D5519A](https://portal.microsoftgeneva.com/s/46D5519A) | Replace timestamp, tenant ID, username |
| Account Changes (password changes) | [Geneva s/27B485E0](https://portal.microsoftgeneva.com/s/27B485E0) | Replace timestamp, tenant ID, username |
| Account Creation | [Geneva s/83D821E6](https://portal.microsoftgeneva.com/s/83D821E6) | Replace timestamp, tenant ID, username |
| Computer Account Events (join/change/delete) | [Geneva s/6A320C3A](https://portal.microsoftgeneva.com/s/6A320C3A) | Replace timestamp, tenant ID |

## Domain Health

| Scenario | Query Link | Notes |
|----------|-----------|-------|
| Domain evaluation events | [Geneva s/C9CEFFA](https://portal.microsoftgeneva.com/s/C9CEFFA) | Check resultDescription and InvalidReason |
| Sync Health Evaluator | [Geneva s/2B96814B](https://portal.microsoftgeneva.com/s/2B96814B) | Review resultDescription for sync health |
| Trace Level Error/Warnings | [Geneva s/946270D1](https://portal.microsoftgeneva.com/s/946270D1) | Search for errors and warnings on tenant |
| CPU Usage of AADDS DC VMs | [Geneva s/44BA9565](https://portal.microsoftgeneva.com/s/44BA9565) | Replace tenant ID, timestamp |
| CPU Graph | [Geneva s/1BC05FE4](https://portal.microsoftgeneva.com/s/1BC05FE4) | Replace tenant ID, timestamp, DC hostnames |
| DNS Forwarder Status | [Geneva s/56D2076D](https://portal.microsoftgeneva.com/s/56D2076D) | Note: root hints/server-level DNS forwarders NOT supported |

## Important Notes

- DNS forwarder configuration: Configuring root hints or server-level DNS forwarders is NOT supported on AADDS. See [Manage DNS for AADDS](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/manage-dns).
- These Geneva queries are for internal Microsoft support use only.

## Source

- OneNote: Mooncake POD Support Notebook / Azure AD / Account management / Entra Domain Service / Jarvis_Kusto
