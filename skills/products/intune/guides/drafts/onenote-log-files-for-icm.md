---
source: onenote
sourceRef: "Mooncake POD Support Notebook/POD/VMSCIM/4. Services/Intune/## Collect Logs/Log files to collect when raising ICM.md"
sourceUrl: null
importDate: "2026-04-04"
type: troubleshooting-guide
---

# Log Files to Collect When Raising ICM (Intune Engineering Escalation)

## Device Restriction Policies — Windows

1. Capture **MDMDiagnostic.html**
2. Capture Event Viewer: `Applications and Services Logs > Microsoft > Windows > DeviceManagement-Enterprise-Diagnostics-Provider > Admin`
3. If issue reproducible: capture **SyncML logs**
4. If issue reproducible: capture **Procmon trace**

## Windows Auto-Enrollment

1. Event Viewer: `Applications and Services Logs > Microsoft > Windows > DeviceManagement-Enterprise-Diagnostics-Provider > Admin`
2. Event Viewer: `Applications and Services Logs > Microsoft > Windows > Task Scheduler > Operational`

## SCCM Co-Management

1. `C:\Windows\CCM\Logs` on the target device (with verbose logging)
2. Event Viewer: `Application and Services > Microsoft > Windows > DeviceManagement-Enterprise-Diagnostics-Provider`
3. Registry key: `HKLM\Software\Microsoft\CCM`

## Edge / Managed Browser Issues (Non-MAM)

- Always capture **Fiddler trace** (DEV requirement)

## SCEP Certificate Issues

1. **Company Portal logs**
2. Newest IIS logs from NDES server: `C:\inetpub\logs\LogFiles\W3SVC1`
3. Application and system event logs from the NDES server

## Intune App Wrapping Issues

1. Provide the **non-wrapped app** (.apk/.ipa)
2. Provide the **wrapped app**
3. Capture **iOS xCode logs**
4. For Android: Company Portal logs

## Windows Autopilot Device Sync Issues

1. Customer's **hardware hash CSV file**
2. Remove affected device from customer portal before repro
3. **F12 trace** during repro on customer tenant

## MAM Issues — Android

1. Full screenshot of **MAM settings**
2. **Company Portal logs**
3. **Android debug logs** while reproducing
4. **RAVE screenshot** of policy status

## MAM Issues — iOS

1. Full screenshot of **MAM settings**
2. **Company Portal logs**
3. **iOS xCode logs** while reproducing
4. **MAM logs** from managed browser
5. **RAVE screenshot** of policy status

## Autopilot Related Issues

```cmd
MdmDiagnosticsTool.exe -area Autopilot -cab C:\temp\AutoPilot.zip
MdmDiagnosticsTool.exe -area Autopilot;TPM -cab c:\temp\autopilot.cab
```
