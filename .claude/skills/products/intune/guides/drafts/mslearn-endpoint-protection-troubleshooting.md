---
title: Endpoint Protection Troubleshooting in Intune
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/mem/intune/general/troubleshoot-endpoint-protection-in-microsoft-intune
product: intune
dateCreated: 2026-04-18
---

# Endpoint Protection Troubleshooting in Intune

## Engine Unavailable
- Cause: Intune endpoint protection engine corrupted or deleted
- Fix: Force update via taskbar, or uninstall/reinstall Microsoft Intune Endpoint Protection Agent from Control Panel > Programs. Next update sync will reinstall automatically.

## Features Disabled
- Messages: "Endpoint Protection disabled", "Real-time protection disabled", "Download scanning disabled", etc.
- Cause: Disabled by admin via configuration profile or by end user
- Fix: Enable features via endpoint protection settings or Microsoft Defender Antivirus device restrictions

## Malware Definitions Out of Date
- Trigger: Definitions > 14 days old (e.g., device offline)
- Fix: Update definitions via Microsoft Defender Antivirus settings

## Full/Quick Scan Overdue
- Trigger: No scan completed in 14 days (e.g., device restarted during scan)
- Fix: Run one-time scan or schedule recurring scans

## Another Endpoint Protection Running
- Scenario: Another AV is installed; Intune detects it
- Risk: Device may become unstable with multiple AV products
