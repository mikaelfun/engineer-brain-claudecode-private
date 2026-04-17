---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Sandbox/In-Development Content/Surface Mouse Support on iOS/Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Sandbox/In-Development%20Content/Surface%20Mouse%20Support%20on%20iOS/Troubleshooting"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Surface Mouse on iOS — Troubleshooting Guide

## Logging (iOS)
1. Windows App > Settings > Troubleshooting
2. Set Core & UI Log Level to Verbose
3. Reproduce issue
4. Share Logs / Open Logs Folder
Logs: BT auth, sensitivity, connect/disconnect, connection failed, in-session, firmware validation, watchdog, dedicated mode

## 1. Mouse Not Detected / Not Connecting
- BT not authorized for Windows App, not paired at OS level, unsupported firmware
- Steps: Confirm OS-level pairing → verify BT permissions → re-pair → test with known-supported mouse → restart app

## 2. Bluetooth Authorization Issues
- Permission denied/revoked, OS-level privacy restriction (common after OS upgrades)
- Steps: Check OS Privacy/BT settings → confirm app BT access → toggle BT → relaunch app

## 3. Cursor Moves but Clicks/Scrolling Don't Work
- Mouse profile not fully supported, partial HID compatibility
- Steps: Test basic inputs → confirm across sessions

## 4. Mouse Disconnects Randomly
- BT power management, low battery, OS background restrictions
- Steps: Check battery → keep app in foreground → re-pair + restart session

## Escalation Checklist
Device model/OS version, Windows App version, Mouse make/model/connection type, Repro steps/frequency, BT auth status
