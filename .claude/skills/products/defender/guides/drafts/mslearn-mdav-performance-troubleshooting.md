# Defender Antivirus Performance Troubleshooting Guide

> Source: https://learn.microsoft.com/defender-endpoint/troubleshoot-performance-issues
> Status: draft (mslearn)

## Overview
Troubleshooting guide for high CPU usage and performance issues related to Microsoft Defender Antivirus (MsMpEng.exe).

## Common Causes of High CPU

| # | Cause | Solution |
|---|-------|----------|
| 1 | Unsigned binaries (.exe, .dll) | Sign binaries with internal PKI; add certificate to Indicators allow list; add AV exclusions as workaround |
| 2 | HTA/CHM files used as databases | Switch to actual databases; add AV exclusions as workaround |
| 3 | Obfuscated scripts | Only obfuscate when necessary; add process+path exclusions |
| 4 | AV cache not finished before VDI image sealed | Let cache maintenance complete before sealing image |
| 5 | Misspelled exclusions | Validate with: `MpCmdRun.exe -CheckExclusion -Path <path>` |
| 6 | Path exclusion doesn't stop BM/NRI | Use Indicators (file hash/certificate allow) instead of path exclusions |
| 7 | File hash computation overhead | Disable via GPO: Computer Config > Admin Templates > Windows Components > MDAV > MpEngine |

## Component-Level Diagnosis

### Real-time Protection (RTP)
- Use Troubleshooting Mode to turn off Tamper Protection temporarily
- Disable Real-time Protection to isolate the cause

### Scheduled Scanning
- Enable low CPU priority: `ScanOnlyIfIdle` + CPU usage limit (default 50%)
- Review daily quick scan interval and weekly full scan settings
- Disable scan after security intelligence update if needed

### Conflicts with Third-party Software
- Add third-party security software to MDAV exclusions and vice versa
- Check for antivirus, EDR, DLP, endpoint privilege management, VPN conflicts

### Large File Scanning
- Move large files (.iso, .vhdx) off network-redirected profile folders
- Local storage scans are faster than network share scans

## Diagnostic Tools (in order of preference)

1. **MDAV Diagnostic Data**: `MpCmdRun.exe -GetFiles` → always collect first
2. **Performance Analyzer**: Purpose-built for MDAV perf issues; run during reproduction
3. **Process Monitor (ProcMon)**: 5-10 min capture during reproduction if PA insufficient
4. **WPRUI/WPR**: Advanced tracing; limit to 3-5 min; most verbose option

## Vendor Coordination
- Check vendor KB for known issues with AV exclusions
- Vendors should follow Microsoft's false positive partnership guidelines
- Submit software via Microsoft Security Intelligence portal
