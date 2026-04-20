---
title: Troubleshoot Global Secure Access Client for Windows
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/entra/global-secure-access/troubleshoot-global-secure-access-client-windows-issues
product: entra-id
date: 2026-04-18
type: troubleshooting-guide
21vApplicable: false
---

# Troubleshoot Global Secure Access Client for Windows

Overview of troubleshooting the Global Secure Access (GSA) client deployed on managed Windows devices (Entra hybrid join or Entra joined).

## Architecture
GSA client routes traffic from managed devices through Microsoft Entra, enabling:
- Continuous Access Evaluation (CAE)
- Device compliance checks
- Multi-factor authentication enforcement

## Installation Issues

### Prerequisites Check
- Verify all prerequisites per MS Learn docs

### Installation Methods
- Direct download + install as local admin
- AD DS Group Policy (hybrid join)
- Intune/MDM (hybrid join or Entra joined)

### Troubleshooting Installation Failures
1. Check client logs: `C:\Users\<username>\AppData\Local\Temp\Global_Secure_Access_Client_<number>.log`
2. Review Application and System event logs
3. For upgrade failures: uninstall old version -> restart -> install new version

## Post-Installation Diagnostics

### Self-Service Tools
1. Advanced Diagnostics tool (built into client)
2. Health Check Tab (built into client)

### Log Collection
If self-service tools cannot resolve, collect logs via Advanced Log Collection tab and submit support ticket with logs attached.
