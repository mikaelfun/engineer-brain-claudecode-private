---
source: onenote
sourceRef: "Mooncake POD Support Notebook/POD/VMSCIM/4. Services/Intune/## Collect Logs/iPhone enroll logs.md"
sourceUrl: null
importDate: "2026-04-05"
type: reference-guide
---

# iPhone/iOS Enrollment Log Collection

## 1. Company Portal Log
- In Company Portal app -> shake device -> tap "Send Diagnostic Report"
- If shake gesture does not work: Settings -> Company Portal -> enable "Shake Gesture"
- Ref: https://learn.microsoft.com/en-us/mem/intune/user-help/send-logs-to-microsoft-ios

## 2. Sysdiagnose Log (with ManagedConfiguration Debug Profile)
- Install ManagedConfigurationDebugProfile on device
- Trigger collection: simultaneously press Volume + Power button
- Reproduce the issue
- Transfer via iTunes to computer
- Ref: https://it-training.apple.com/tutorials/support/sup075/

## 3. iPhone Console Log
- Requires Mac with Xcode installed
- Connect iPhone to Mac via USB
- Capture console log during reproduction
- Transfer log files

## 4. Screen Recording
- Use iOS built-in screen recording during reproduction
