---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Engineer Reference/Tools/Android Bug Report"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=/Engineer%20Reference/Tools/Android%20Bug%20Report"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Android Bug Report — Collection Guide

## What Is an Android Bug Report?

Android bug reports are **comprehensive logs collected by the Android OS**. They capture system state, app logs, and OS-level diagnostics useful for deep troubleshooting of Android behavior issues.

## When to Capture an Android Bug Report?

Collect an Android bug report when troubleshooting an issue that appears to be related to **how the Android OS is handling something** — for example:
- Android Intune Company Portal behavior anomalies
- Android enrollment failures with no clear Intune-side error
- Device behavior issues not explained by Intune policy data

## How to Gather an Android Bug Report

Follow **[Google's official documentation](https://developer.android.com/studio/debug/bug-report)** (most up-to-date steps).

> ⚠️ **Note**: Capturing a bug report requires **developer mode** on the device.
> - Developer mode may be **disabled by customer policy**.
> - If blocked, the customer may need to **temporarily revert the policy** on the affected device while performing testing/log collection.

## After Collecting the Bug Report

1. Review the log file directly — look for relevant app/system errors.
2. Focus on Intune Company Portal process logs and Android framework errors.
3. Share findings with PG if OS-level behavior is suspected (not an Intune config issue).
