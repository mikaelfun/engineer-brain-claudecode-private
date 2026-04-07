---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Cloud PC Actions/Provisioning/Autopilot DPP for Windows 365 Enterprise And Frontline Dedicated"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Cloud%20PC%20Actions/Provisioning/Autopilot%20DPP%20for%20Windows%20365%20Enterprise%20And%20Frontline%20Dedicated"
importDate: "2026-04-05"
type: troubleshooting-guide
---

**This feature is currently in Public Preview.**

## Feature Description

Windows 365 integrates Autopilot Device Preparation policy (DPP) allowing IT admins to define which device-targeted applications and scripts must be installed during provisioning and available to users immediately.

## Known Issues and Limitations

- ESP not compatible with DPP
- **Device Preparation works only with Windows 11 Images. Windows 10 Images are not supported!**
- Win32 and Store Winget apps show as "Skipped" in DPP Report when Managed Installer is enabled on the tenant (apps still install, just not tracked in report)

## DPP Components Flow

1. **DppProvisionOrchestrator (EntryPoint)** - Receives batch provisioning requests, coordinates overall workflow
2. **PrepareDPPContextActivity** - Prepares context and metadata for batch processing
3. **DppProvisionSubOrchestrator (n instances)** - One per device, manages individual device provisioning lifecycle, retries network errors with 15min timeout
4. **TriggerDppProvisionActivity** - Initiates DPP provisioning for a single device via RdBrokerClient
5. **QueryDppProvisionResultActivity (n polling)** - Polls provisioning status until completion/failure/timeout
6. **RdBrokerClient** - Interface to AVD RD Broker for trigger and query operations

## Setup Steps

### Step 1: Create a Device Group for Cloud PCs
- Set **Intune Provisioning Client** as the Group Owner
- Ref: [MS Learn - Create device group](https://learn.microsoft.com/en-us/autopilot/device-preparation/tutorial/user-driven/entra-join-device-group#create-a-device-group)

### Step 2: Assign Intune Apps/Scripts to Device Group
- Apps must be **System installed** (install when no user profiles exist)
- Assign to Device Group as **Required**
- Supported: LOB, Win32, Microsoft Store, Microsoft 365, PowerShell Scripts

### Step 3: Create Device Preparation Policy in Intune
- Select **"Automatic (Preview)"** (formerly "Agent Driven")
- Note: "User Driven" only works for physical devices, NOT for FLS Cloud PCs
- Choose the device group and apps/scripts

### Step 4: Create Cloud PC Provisioning Policy
- Select DPP profile from dropdown under Configuration tab
- Set timeout (generally 30 minutes; longer for large/dependency chain apps)
- Option to prevent user connection on installation failure/timeout

### Step 5: DPP Reporting
- Intune → Devices → Monitor → Windows Autopilot device preparation deployments
- Click entry to see per-app/script deployment results

## Support Boundaries & Case Handling

1. **Provisioning failures due to DPP failing steps** (App/Script deployment errors) → **Intune case**
2. **CPC Provisioned without errors but missing from DPP Report** → Win365 owns initially, check if DPP config present in provisioning policy + kusto
3. **CPC Provisioned with Warnings related to DPP** → Scope to determine Win365 vs Intune ownership

## Escalation Path (Windows 365)

- CSS raises CRI to **Windows 365 SaaF Team**
- Enterprise/FLD DPP Issues → **WCX Device Action**
- RDAgent side issues → **CloudPC Policy and Cloud App management**
- CD agent functionality → **CloudPC Policy and Cloud App management**
- FLS DPP issues with CD Agent → **CloudPC Policy and Cloud App management**

## Provisioning Service States

| Code | State |
|------|-------|
| 0 | NotStarted |
| 1 | Running |
| 2 | PendingRetry |
| 3 | PendingReboot |
| 4 | PendingRebootRetry |
| 5 | PostReboot |
| 6 | Completed |
| 7 | Failed |
| 8 | NotApplicable |
