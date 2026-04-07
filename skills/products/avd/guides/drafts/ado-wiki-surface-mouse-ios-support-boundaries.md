---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Sandbox/In-Development Content/Surface Mouse Support on iOS/Support Boundaries"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Sandbox/In-Development%20Content/Surface%20Mouse%20Support%20on%20iOS/Support%20Boundaries"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Surface Mouse Support on iOS - Support Boundaries

## 1. Bluetooth Service vs Bluetooth Device Issues
**Scenario**: Bluetooth service issues affecting multiple devices.
**Indicators**: Bluetooth fails across multiple devices, not Surface Mouse only; iOS cannot reliably maintain Bluetooth connections.
**Ownership**: iOS / Platform-level Bluetooth issue (not Surface hardware, not Windows App)
**Routing**: iOS Bluetooth troubleshooting. Outside Windows App and Surface Mouse support scope.

## 2. Bluetooth Works for Other Mice, but Surface Mouse Is Not Discoverable
**Scenario**: Bluetooth discovers other mice but Surface Mouse is not discoverable.
**Ownership**: Surface device / firmware / hardware
**Routing**: Surface Support. Validate firmware version, power state, pairing mode.

## 3. Surface Mouse Is Discovered but Cannot Connect
**Scenario**: Surface Mouse appears in Bluetooth discovery but pairing never completes.
**Ownership**: Surface firmware / hardware
**Routing**: Surface Support. Validate firmware, reset mouse, hardware diagnostics.

## 4. Mouse Connects Successfully but Disconnects Randomly
**Scenario**: Surface Mouse connects, works briefly, then disconnects unexpectedly.
**Ownership**: Surface hardware / firmware
**Routing**: Surface Support. Investigate firmware stability, power, interference.

## 5. Firmware Updated but Mouse Does Not Work Properly
**Scenario**: Firmware update completes, but mouse exhibits abnormal behavior.
**Ownership**: Surface firmware / hardware
**Routing**: Surface Support or Windows Update team.

## 6. Cursor Lag, Double-Clicks, or Erratic Movement
**Scenario**: Mouse movement feels delayed, double-clicks unexpectedly, or behaves inconsistently.
**Ownership**: Surface hardware / firmware
**Routing**: Surface Support. Validate firmware, hardware integrity.

## 7. Surface Arc Mouse Does Not Update via Windows Update
**Scenario**: Connected to Windows PC but firmware does not update.
**Ownership**: Surface firmware update pipeline and Windows Update team
**Routing**: Surface Support or Windows Update team.

## 8. Updated Surface Mouse Pairs with Other Devices but Not Detected in Windows App
**Scenario**: Mouse pairs with other platforms but does not appear in Windows App > Input Devices.
**Ownership**: Windows App on iOS
**Routing**: Windows App / Windows UEX Support. Validate app version, supported device list.

## 9. Surface Mouse Cannot Pair with Any Device
**Scenario**: Surface Mouse cannot pair with any device universally.
**Ownership**: Surface hardware failure
**Routing**: Surface Support. Hardware replacement.

**Surface SAP**: Surface/Surface Accessories/Surface Mouse/Warranty and Service
