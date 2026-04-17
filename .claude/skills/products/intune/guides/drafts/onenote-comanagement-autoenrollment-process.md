# Co-management Auto-enrollment Process Flow (ConfigMgr → Intune)

> Source: OneNote — Mooncake POD Support Notebook / Co-management / ConfigMgr autoenrollment process
> Additional source: ConfigMgr: CLD: Co-management: ConfigMgr (Intune) autoenrollment process
> Quality: guide-draft (pending SYNTHESIZE review)

## Overview

When a client is registered in a co-management enabled environment, it receives Configuration Policies including CoManagement Settings. For auto-enrollment, client needs `CoMgmtSettingsPilotAutoEnroll = True`.

## Process Flow

### Phase 1: Client Registration

```
ClientIDManagerStartup:
  [RegTask] - Client is not registered. Sending registration request for GUID:xxx
  Registering client using AAD auth.
  [RegTask] - Client is registered. Server assigned ClientID is GUID:xxx. Approval status 3
```

### Phase 2: Initial Policy (AutoEnroll = False)

```
CoManagementHandler:
  Processing GET for assignment (ScopeId_.../ConfigurationPolicy_... : 1)
  Merged value for 'CoManagementSettings_AutoEnroll' is 'False'
  Merged value for 'CoManagementSettings_Allow' is 'True'
  Merged value for 'CoManagementSettings_Capabilities' is '1'
  Device is not MDM enrolled yet. All workloads are managed by SCCM.
  Co-management is disabled but expected to be enabled.
```

At this point, client knows Co-Management is enabled in the environment, but autoenrollment is not enabled, and no enrollment action has run.

> **Tip**: Check the policy via SQL:
> ```sql
> SELECT * FROM fn_listconfigurationPolicy_List(1033)
> WHERE CI_UniqueID = '<PolicyID>'
> ```
> Policy is stored as XML in `SDMPackageDigest` column.

### Phase 3: Move to Pilot Collection (AutoEnroll = True)

Client is moved to Intune Pilot Collection where autoenrollment and workloads are enabled:

```
CoManagementHandler:
  Processing GET for assignment (ScopeId_.../ConfigurationPolicy_... : 1)
  Getting/Merging value for setting 'CoManagementSettings_AutoEnroll'
  Merged value for 'CoManagementSettings_AutoEnroll' is 'True'
  New merged workloadflags value with co-management max capabilities '4095' is '65'
  Merging workload flags 1 with 65
  Successfully queued MDM auto enrollment
  Mdm Enrollment Url has not yet been configured.
  Device is not MDM enrolled yet. All workloads are managed by SCCM.
  Device is not provisioned
```

**MDMEnrollmentURL Discovery**: Retrieved from AAD join info using `NetGetAadJoinInformation` API, stored in WMI class `CCM_CoMgmt_Configuration`.

Once MDMEnrollmentUrl is available:

```
CoManagementHandler:
  Enrolling device to MDM... Try #1 out of 3
  Enrolling device with RegisterDeviceWithManagementUsingAADDeviceCredentials
  ...
  MDM enrollment succeeded
```

### Phase 4: Device Enrollment (Intune Side)

> **Note**: Device Enrollment is an Intune action.

Check Event Viewer: `Application and Service logs → Windows → DeviceManagement-Enterprise-Diagnostics-Provider`

Sequence:
1. Client requests MDM Policy
2. Certificate Enrollment request sent and processed
3. OMA-DM configured, MDM provisioned and completed
4. Session starts for AAD User (Hybrid User)

### Phase 5: Scheduled Tasks

Windows tasks created under `EnterpriseMgmt`:
- **PushLaunch** — initial enrollment via `deviceenroller.exe`
- **PushRenewal** — enrollment renewal via `deviceenroller.exe`

## Key Configuration Locations

### WMI Class: CCM_CoMgmt_Configuration
```powershell
Get-WmiObject -Namespace "root/ccm/policy/Machine" -Query "SELECT * FROM CCM_CoMgmt_Configuration"
```

Key properties:
- `MDMEnrollmentUrl` — enrollment endpoint (e.g., `https://manage-beta.microsoft.com/EnrollmentServer/Discovery.svc`)
- `MDMClientAppID` — client app ID (e.g., `9ba1a5c7-f17a-4de9-a1f1-6178c8d51223`)
- `MDMServiceResourceID` — service resource
- `MDMServiceResourceUri` — STS token handler URL
- `MDMTenantID` — tenant ID
- `MDMEnrollmentRetries` — retry count (default 3)
- `MDMEnrollmentRetryInterval` — retry interval (15 min)

### Registry: Azure AD Join Info
`HKLM\SYSTEM\CurrentControlSet001\Control\CloudDomainJoin\TenantInfo\<TenantID>`

### dsregcmd /status
- `AzureAdJoined: YES` required
- `MdmUrl` shows enrollment endpoint

## Troubleshooting Checkpoints

| Checkpoint | What to Check |
|------------|---------------|
| AutoEnroll=False | Device not in pilot collection or autoenroll not enabled in policy |
| MDMEnrollmentUrl empty | AAD join info not available; check `dsregcmd /status` and WMI class |
| Enrollment fails (Try #n) | Check Event Viewer for enrollment errors; max 3 retries with 15-min interval |
| WMI class missing | `CCM_CoMgmt_Configuration` not populated; check client registration in ClientIDManagerStartup.log |
| Device not provisioned | Wait for MDMEnrollmentUrl to populate from AAD join info |

## Related Articles

- [ConfigMgr: CLD: Co-management: Understanding & Tracing MDM enrollment](https://internal.evergreen.microsoft.com/en-us/topic/474db03a-d77c-034f-f31c-d1965f9783e5)
- [Windows Client enrollment process](https://docs.microsoft.com/en-us/intune/enrollment/windows-enroll)

## 21v Applicability

Applicable — enrollment endpoint will be 21v-specific (`manage.microsoftonline.cn`).
