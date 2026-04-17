---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD.wiki:/Authentication/Device Registration/Window Devices/Microsoft Entra Hybrid Join/Troubleshooting Persistent and Non-Persistent VDI scenarios"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FDevice%20Registration%2FWindow%20Devices%2FMicrosoft%20Entra%20Hybrid%20Join%2FTroubleshooting%20Persistent%20and%20Non-Persistent%20VDI%20scenarios"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# Summary

Administrators often deploy virtual desktop infrastructure (VDI) platforms with Windows operating systems to streamline management, reduce costs through resource consolidation and centralization, and provide end-users with mobility and access to virtual desktops from any device, anywhere, at any time.
There are two main types of virtual desktops:

## **Persistent**
- Each user or a pool of users has a unique desktop image that can be customized and saved for future use.

## **Non-persistent**
- Users access a collection of desktops as needed, which revert to their original state after a shutdown, restart, or OS reset.

---

# Supported Scenarios

| **Device identity type** | **Identity infrastructure** | **Windows devices** | **VDI platform** | **Supported** |
| --- | --- | --- | --- | --- |
| Microsoft Entra hybrid joined | Federated | Windows current | Persistent | Yes |
| Microsoft Entra hybrid joined | Federated | Windows current | Non-persistent | Yes |
| Microsoft Entra hybrid joined | Managed | Windows current | Persistent | Yes |
| Microsoft Entra hybrid joined | Managed | Windows current | Non-persistent | Limited (Citrix only) |
| Microsoft Entra joined | Federated/Managed | Windows current | Persistent | Limited (AVD, W365, Amazon WorkSpaces) |
| Microsoft Entra joined | Federated/Managed | Windows current | Non-persistent | No |

**Notes:**
- Non-persistence support for Managed identity infrastructure is only available with Citrix (on-premises customer managed and Cloud service managed)
- Microsoft Entra join support for persistent VDI is available with Azure Virtual Desktop, Windows 365, and Amazon WorkSpaces

---

# Guidance

> ⚠️ **Critical**: Any Golden/Master image used to provision VDIs should **never** be joined to Entra ID. If the Golden/Master image is already joined, all provisioned VDIs will use the same Device ID causing device health issues.

Each provisioned VDI should go through the Microsoft Entra Hybrid Join process itself to obtain a unique Device ID.

## **Persistent VDI**

- If using sysprep.exe with a pre-Windows 10 1809 image: ensure image is not from a device already registered as Microsoft Entra hybrid joined
- If using VM snapshots: ensure snapshot is not from a VM already registered as Microsoft Entra hybrid join
- Implement stale device management process: https://learn.microsoft.com/en-us/entra/identity/devices/manage-stale-devices

## **Non-Persistent VDI**

- Same sysprep/snapshot caveats as Persistent VDI apply
- **For Federated environments (AD FS)**: Implement `dsregcmd /join` as part of VM boot sequence (before user signs in); do **NOT** run `dsregcmd /leave` during shutdown/restart
- **For Managed environments**: Non-persistent HAADJ only supported with Citrix
- Define aggressive stale device cleanup strategy using device name prefix to identify non-persistent VDI devices
- Stale devices from NP-VDI will consume tenant quota and risk service interruption

## **Stale Device Management for NP-VDI**

Use naming convention for NP-VDI devices (e.g., `VDI-NP-*`) to enable targeted cleanup:

```powershell
# Get all stale HAADJ devices with NP-VDI naming prefix
$staleDate = (Get-Date).AddDays(-90)
Get-MgDevice -All -Filter "TrustType eq 'ServerAd' and startsWith(displayName,'VDI-NP-')" |
  Where-Object { $_.ApproximateLastSignInDateTime -lt $staleDate } |
  ForEach-Object { Remove-MgDevice -DeviceId $_.Id }
```

---

# Common Issues and Resolutions

## Issue: Multiple VDI devices sharing same Device ID

**Symptom**: Devices from VDI pool all show as same device in Entra portal; Conditional Access behaves unexpectedly

**Cause**: Golden/Master image was already Entra hybrid joined before cloning

**Resolution**:
1. Run `dsregcmd /leave` on Golden/Master image to remove Hybrid Join state
2. Sysprep the image (ensure no device registration state persists)
3. Re-provision all VDIs from the clean image
4. Each VDI must independently complete the Hybrid Join process

## Issue: Non-persistent VDI devices accumulating as stale in Entra

**Symptom**: Tenant device count rapidly growing; stale NP-VDI device objects in Entra portal

**Cause**: Each time NP-VDI boots and rejoins, a new device object may be created without deleting the old one

**Resolution**:
- Implement scheduled stale device cleanup (recommended: run weekly)
- Use `dsregcmd /leave` in shutdown scripts for NP-VDI in federated environments
- Monitor device count via: `Get-MgDevice -All -Filter "TrustType eq 'ServerAd'" | Measure-Object`

## Issue: Non-persistent VDI fails to join in managed (PHS/PTA) environment

**Symptom**: NP-VDI cannot complete HAADJ in managed identity environment (not using Citrix)

**Cause**: Managed environment NP-VDI only supported with Citrix; other platforms not supported

**Resolution**: This is a supportability boundary. Options:
1. Switch to Citrix for NP-VDI in managed environments
2. Use federated environment (AD FS) which supports NP-VDI
3. Consider Azure Virtual Desktop or Windows 365 for cloud-native VDI with Entra Join

---

# ICM Escalation

Route to: **Owning Service**: ADRS | **Owning Team**: ADRS
