# Co-management: Auto-Enroll vs GPO for MDM Enrollment

## Question
Do we need to deploy the Auto-MDM enrollment GPO for co-management deployment?

**GPO Path:** Computer Configuration > Policies > Administrative Templates > Windows Components > MDM > Enable automatic MDM enrollment using default Azure AD credentials

## Answer

**No, the GPO is not required.** Without the GPO, the ConfigMgr client on a Hybrid AAD joined device will auto-enroll to MDM via the CoManagementHandler enrollment timer. However, the GPO triggers enrollment **immediately** upon application.

## Behavior Comparison

### Without GPO
1. Co-management enabled → enrollment timer queued (randomized, can be hours away)
2. Log: `Queuing enrollment timer to fire at {future_time}`
3. Before user sign-in: `Expected MDM_ConfigSetting instance is missing`
4. After user sign-in but before timer: `timer already set for enrollment, no need to re-randomize`
5. Timer fires → retrieves AAD info → enrollment completes
6. Key parameters: `MDMEnrollmentDuration=1440, MDMEnrollmentRetryInterval=15, MDMEnrollmentRetries=3, LogonRandomization=60`

### With GPO
1. Same enrollment timer queued by ConfigMgr
2. **But** the GPO triggers MDM enrollment immediately upon being applied (via Event Viewer)
3. When ConfigMgr timer fires later: `Device is already or being enrolled into MDM`
4. `Co-mgmt workloads flag is compliant` / `Machine is already enrolled with MDM`

## Key Log Entries (CoManagementHandler.log)
- `Queuing enrollment timer to fire at {time}` — timer scheduled
- `Enrollment randomization timer fired` — timer executed
- `Found Active User Session` — user context acquired
- `AAD-Join Info: type = 1, DeviceId, TenantId, EnrollmentUrl` — AAD info read
- `Enrollment type: 6` — co-management enrollment type
- `Intune SA Account ID retrieved` — Intune account confirmed
- `Device is provisioned` — enrollment complete
- `StateID or report hash is changed. Sending up the report for state 107` — state reported

## Conclusion
- GPO speeds up enrollment by triggering immediately instead of waiting for queue timer
- The device shows in Intune portal as co-managed once MDM enrolled
- Both paths result in the same final state

## Source
- OneNote: Mooncake POD Support Notebook > Co-management > Question 2
