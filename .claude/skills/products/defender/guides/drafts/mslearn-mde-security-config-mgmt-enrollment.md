# MDE Security Configuration Management — Enrollment Troubleshooting

> Source: https://learn.microsoft.com/defender-endpoint/troubleshoot-security-config-mgt

## Overview

Security Management for MDE allows devices not managed by Intune to receive security configurations. Enrollment failures are tracked via registry key `HKLM\SOFTWARE\Microsoft\SenseCM\EnrollmentStatus`.

## Diagnostic Tool

Run the **MDE Client Analyzer** (`https://aka.ms/MDEClientAnalyzerPreview`) on the failing device:
- Check **General Device Details** → OS in scope
- Check **Device Configuration Management Details** → device appears in Entra ID
- Review **Detailed Results** for Errors and Warnings

## Enrollment Error Code Matrix

| Error Code | Status | Root Cause | Action |
|---|---|---|---|
| 5-7, 9, 11-12, 26-33 | General error | Device doesn't meet prerequisites for MDE management channel | Run Client Analyzer; contact support if unresolved |
| 8, 44 | Intune config issue | Intune not configured to allow MDE Security Configuration | Enable feature in Intune Admin Center |
| 10, 42 | Hybrid join failure | OS failed to perform Entra hybrid join | Use Entra hybrid join troubleshooter |
| 13-14, 20, 24, 25 | Connectivity issue | Firewall blocking Entra ID / Intune endpoints | Verify connectivity requirements in firewall |
| 15 | Tenant mismatch | MDE tenant ID != Entra tenant ID | Verify SCP entry matches Entra tenant |
| 16, 17 | SCP misconfigured | Service Connection Point configured for Enterprise DRS instead of Entra ID | Reconfigure SCP to point to Entra ID |
| 18 | Certificate error | Device certificate belongs to a different tenant | Verify trusted certificate profiles |
| 36, 37 | Entra Connect misconfig | Entra Connect preventing device registration | Run Device Registration Troubleshooter Tool |
| 38, 41 | DNS error | Invalid DNS settings on workstation | Verify domain DNS (not router address) is used |
| 40 | Clock sync issue | Device clock not synced | Sync device clock with domain time |
| 43 | ConfigMgr conflict | Device managed by both ConfigMgr and MDE | Isolate endpoint security policies to single control plane |
| 2 | Not enrolled | Device onboarded but not enrolled for MDE management | Configure MDE per Intune docs |
| 4 | SCCM managed | Device configured to be managed by SCCM | Turn off "Manage Security setting using Configuration Manager" toggle |

## Key Checks

1. Verify device OS is in scope for Security Config Mgmt
2. Confirm device appears in Entra ID
3. Check enrollment status registry key
4. Run Client Analyzer for actionable guidance
5. Verify Entra ID + Intune endpoints are reachable
