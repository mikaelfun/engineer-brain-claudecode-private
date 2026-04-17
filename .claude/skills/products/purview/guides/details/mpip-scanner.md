# Purview MPIP / AIP Scanner -- Comprehensive Troubleshooting Guide

**Entries**: 8 | **Drafts fused**: 6 | **Kusto queries fused**: 0
**Source drafts**: [ado-wiki-b-collect-mpip-scanner-logs.md](..\guides/drafts/ado-wiki-b-collect-mpip-scanner-logs.md), [ado-wiki-b-enable-trace-level-logging.md](..\guides/drafts/ado-wiki-b-enable-trace-level-logging.md), [ado-wiki-b-learn-mpip-scanner.md](..\guides/drafts/ado-wiki-b-learn-mpip-scanner.md), [ado-wiki-b-read-scanner-reports.md](..\guides/drafts/ado-wiki-b-read-scanner-reports.md), [ado-wiki-b-required-information-mpip-scanner.md](..\guides/drafts/ado-wiki-b-required-information-mpip-scanner.md), [ado-wiki-b-support-boundaries-mpip-scanner.md](..\guides/drafts/ado-wiki-b-support-boundaries-mpip-scanner.md)
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: Initial Diagnosis
> Sources: ado-wiki-b-enable-trace-level-logging.md, ado-wiki-b-collect-mpip-scanner-logs.md

1. How to: Collect MPIP Scanner Logs `[source: ado-wiki-b-collect-mpip-scanner-logs.md]`
2. Introduction `[source: ado-wiki-b-collect-mpip-scanner-logs.md]`
3. Prerequisites `[source: ado-wiki-b-collect-mpip-scanner-logs.md]`
4. How to: Enable Trace Level Logging for MPIP Scanner `[source: ado-wiki-b-enable-trace-level-logging.md]`
5. Introduction `[source: ado-wiki-b-enable-trace-level-logging.md]`
6. Prerequisites `[source: ado-wiki-b-enable-trace-level-logging.md]`
7. Step-by-Step Instructions `[source: ado-wiki-b-enable-trace-level-logging.md]`
8. Log into the Scanner server with the **Scanner service account** `[source: ado-wiki-b-enable-trace-level-logging.md]`
9. Open **Registry Editor** (`regedit`) `[source: ado-wiki-b-enable-trace-level-logging.md]`
10. Navigate to: `[source: ado-wiki-b-enable-trace-level-logging.md]`

### Phase 2: Decision Logic

| Condition | Meaning | Action |
|-----------|---------|--------|
| AIP Scanner Start-AIPScan fails with MSAL error unknown_user_type when on-prem U... | AIP Scanner does not support different UPN between on-prem A... | 1) Add AAD-verified UPN suffix in on-prem AD (Active Directory Domains and Trust... |
| Need to enable trace level logging for MPIP Scanner to get detailed diagnostic d... | Default MPIP Scanner logging does not capture trace-level de... | On scanner server: open Registry Editor → navigate to HKEY_CURRENT_USER\Software... |
| MPIP Scanner DLP policy runs but does not work — no files blocked or quarantined... | DLP policy for Scanner has no proper action defined. DLP pol... | Create DLP policy with proper enforcement action (restrict file / block / quaran... |
| MPIP Scanner connection fails with NetworkError/HTTP failure even though proxy i... | MPIP Scanner service account lacks the 'Allow Logon locally'... | 1. Grant 'Allow Logon locally' right to the MPIP Scanner service account on the ... |
| Purview Portal reports DB error for AIP Scanner after upgrade. Error: 'The datab... | After upgrading the AIP Scanner, the database owner SID of t... | IMPORTANT: MPIP support should NOT deliver SQL commands directly to customers — ... |
| MPIP Scanner policy download fails with 'provided uri is invalid' error when syn... | DelegatedUser account format is incorrect: domain\username f... | 1) Delete MsalTokenCache or TokenCache from C:\Users\<Scanner user>\AppData\Loca... |
| MPIP Scanner server reaches 100% CPU usage and high memory usage while running s... | By design: MPIP Scanner is configured to utilize maximum ava... | 1) Deploy scanner as a standalone server (primary recommendation); 2) Add Scanne... |
| Information Protection Scanner: 'The underlying connection was closed: An unexpe... | TLS 1.2 is not enabled on the scanner machine | Enable TLS 1.2 on the scanner machine. See Microsoft's guidance on enabling TLS ... |

`[conclusion: 🔵 7.5/10]`

---

## Known Issues Lookup

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AIP Scanner Start-AIPScan fails with MSAL error unknown_user_type when on-prem UPN suffix differs fr... | AIP Scanner does not support different UPN between on-prem AD and Azure AD. Scan... | 1) Add AAD-verified UPN suffix in on-prem AD (Active Directory Domains and Trusts); 2) Trigger AAD C... | 🔵 7.5 | MCVKB/21.3 AIP_ AIP-scanner auth issue with different UP.md |
| 2 | Need to enable trace level logging for MPIP Scanner to get detailed diagnostic data | Default MPIP Scanner logging does not capture trace-level detail needed for adva... | On scanner server: open Registry Editor → navigate to HKEY_CURRENT_USER\Software\Microsoft\MSIP → ad... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FMPIP%20Scanner%2FHow%20to%3A%20MPIP%20Scanner%2FHow%20to%3A%20Enable%20trace%20level%20logging) |
| 3 | MPIP Scanner DLP policy runs but does not work — no files blocked or quarantined despite policy matc... | DLP policy for Scanner has no proper action defined. DLP policies for Scanner wi... | Create DLP policy with proper enforcement action (restrict file / block / quarantine). Do not rely o... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FMPIP%20Scanner%2FHow%20to%3A%20MPIP%20Scanner%2FHow%20to%3A%20Scanner%20DLP) |
| 4 | MPIP Scanner connection fails with NetworkError/HTTP failure even though proxy is configured on the ... | MPIP Scanner service account lacks the 'Allow Logon locally' privilege on the Sc... | 1. Grant 'Allow Logon locally' right to the MPIP Scanner service account on the Scanner Server. 2. O... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FMPIP%20Scanner%2FTroubleshooting%20Scenarios%3A%20MPIP%20Scanner%2FScenario%3A%20MPIP%20Scanner%20doesn%27t%20use%20Proxy%20and%20the%20connection%20fails) |
| 5 | Purview Portal reports DB error for AIP Scanner after upgrade. Error: 'The database owner SID record... | After upgrading the AIP Scanner, the database owner SID of the AIPScanner databa... | IMPORTANT: MPIP support should NOT deliver SQL commands directly to customers — refer them to their ... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FMPIP%20Scanner%2FTroubleshooting%20Scenarios%3A%20MPIP%20Scanner%2FScenario%3A%20SQL%20Error%20when%20upgrading%20the%20Scanner) |
| 6 | MPIP Scanner policy download fails with 'provided uri is invalid' error when syncing policy from Pso... | DelegatedUser account format is incorrect: domain\username format (e.g., CONTOSO... | 1) Delete MsalTokenCache or TokenCache from C:\Users\<Scanner user>\AppData\Local\Microsoft\MSIP\  (... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FMPIP%20Scanner%2FTroubleshooting%20Scenarios%3A%20MPIP%20Scanner%2FScenario%3A%20Scanner%20policy%20download%20fails%20with%20%27provided%20uri%20is%20invalid%27%20error) |
| 7 | MPIP Scanner server reaches 100% CPU usage and high memory usage while running scan jobs | By design: MPIP Scanner is configured to utilize maximum available server resour... | 1) Deploy scanner as a standalone server (primary recommendation); 2) Add ScannerMaxCpu and ScannerM... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FMPIP%20Scanner%2FTroubleshooting%20Scenarios%3A%20MPIP%20Scanner%2FScenario%3A%20Scanner%20utilizing%20high%20CPU) |
| 8 | Information Protection Scanner: 'The underlying connection was closed: An unexpected error occurred ... | TLS 1.2 is not enabled on the scanner machine | Enable TLS 1.2 on the scanner machine. See Microsoft's guidance on enabling TLS 1.2 for clients. | 🟡 4.5 | [MS Learn](https://learn.microsoft.com/troubleshoot/microsoft-365/purview/information-protection-scanner/resolve-deployment-issues) |