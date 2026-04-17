# Intune iOS/iPadOS 注册与 ADE/DEP — 排查工作流

**来源草稿**: ado-wiki-Dual-Enrollment-MMPC.md, ado-wiki-b-Linux-Enrollment.md, mslearn-gp-auto-enrollment-troubleshooting.md, onenote-apple-configurator-enrollment.md, onenote-apple-configurator-iphone-enrollment.md, onenote-apple-enrollment-program-token-setup.md, onenote-comanagement-autoenroll-vs-gpo.md, onenote-comanagement-autoenrollment-process.md, onenote-company-portal-ios-enrollment-log-analysis.md, onenote-configure-gpo-auto-enroll.md, onenote-device-enrollment-tsg.md, onenote-enroll-after-aadj-methods.md, onenote-gp-auto-enrollment-tsg.md, onenote-ios-company-portal-enrollment-log.md, onenote-iphone-enroll-logs.md, onenote-kusto-ios-enrollment.md, onenote-kusto-windows-enrollment.md, onenote-mdm-enrollment-error-codes.md, onenote-windows-oobe-enrollment-cap.md
**Kusto 引用**: apple-device.md, enrollment.md
**场景数**: 75
**生成日期**: 2026-04-07

---

## Portal 路径

- `2. Open Event Viewer > Applications and Services Logs > Microsoft > Windows > DeviceManagement-Enterprise-Diagnostics-Provider > Admin`
- `Intune > How To > Setup Apple Enrollment Program Token`

## Scenario 1: Troubleshooting Steps
> 来源: ado-wiki-Dual-Enrollment-MMPC.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Collect ODC logs
2. Open Event Viewer > Applications and Services Logs > Microsoft > Windows > DeviceManagement-Enterprise-Diagnostics-Provider > Admin
3. Search for "dual" or "enroll" to find errors

## Finding MMPC Device ID
- Registry: `HKLM\Software\Microsoft\Enrollments` > DMClient key with "Microsoft Device Management" folder > EntDMID = MMPC Device ID

## Kusto Queries

## Scenario 2: Find MMPC DeviceID from Intune DeviceID
> 来源: ado-wiki-Dual-Enrollment-MMPC.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kql
let SearchId = "<AccountID>";
cluster('intune.kusto.windows.net').database('Intune').IntuneEvent
| where env_time > ago(3d)
| where EventUniqueName == "DeviceIdMappingCacheAsideBehavior:StoreGetAsync:FoundDeviceIdMapping"
| where Col3 has SearchId
| parse Col3 with "IntuneAccountId:"AccountId","*"AADDeviceId:"AADDeviceId", IntuneDeviceId:"IntuneDeviceId", MMPCDeviceId:"MMPCDeviceId","*
| summarize max(UserId) by AADDeviceId, IntuneDeviceId, MMPCDeviceId, AccountId, ContextId
```
`[来源: ado-wiki-Dual-Enrollment-MMPC.md]`

## Scenario 3: Check MMPC Dual Enrollment Activity
> 来源: ado-wiki-Dual-Enrollment-MMPC.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kql
cluster('mmpc.northcentralus.kusto.windows.net').database('mmpc').IntuneEvent
| where env_time > ago(2d)
| where ServiceName in ("DeviceCheckinFEService", "DeviceCheckinMTService")
| where ScenarioType !startswith "BackgroundTask"
| where * has "<MMPCDeviceId>"
| project env_time, ServiceName, ComponentName, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, Message, TenantId = AccountId, EmmId = ContextId, DeviceId, UserId, PayLoadId, ScenarioType, ScenarioId, ScenarioInstanceId, SessionId, cV, ActivityId, RelatedActivityId
```
`[来源: ado-wiki-Dual-Enrollment-MMPC.md]`

## Scenario 4: Drill Down with ActivityId
> 来源: ado-wiki-Dual-Enrollment-MMPC.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kql
cluster('mmpc.northcentralus.kusto.windows.net').database('mmpc').IntuneEvent
| where env_time > ago(2d)
| where ServiceName in ("DeviceCheckinFEService", "DeviceCheckinMTService")
| where ScenarioType !startswith "BackgroundTask"
| where ActivityId == "<ActivityId>"
| project env_time, ServiceName, ComponentName, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, Message, TenantId = AccountId
```
`[来源: ado-wiki-Dual-Enrollment-MMPC.md]`

## Scenario 5: Prerequisites
> 来源: ado-wiki-b-Linux-Enrollment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Microsoft Edge 102.x or later
- Intune App (`intune-portal`)
- Supported Ubuntu Linux distribution (GNOME desktop required — CLI-only not supported)

## Features (GA)

- Compliance Policies: password complexity, allowed distro version, custom compliance via script, disk encryption
- Device Inventory / Reporting
- Conditional Access via Microsoft Edge to Office 365 web apps
- Enrollment type: **Corporate only** (BYOD not supported)

## Conditions That Will NOT Work

- Using Firefox/Chrome/Safari (must use Microsoft Edge)
- CA Policy enabled but not using Edge
- Hardware binding (TPM/HSM) — not currently supported
- WSL — not currently supported

---

## Scenario 6: Installing Intune on Ubuntu
> 来源: ado-wiki-b-Linux-Enrollment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```bash
# Install prerequisites
sudo apt install curl gpg

# Add Microsoft package signing key
curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.gpg
sudo install -o root -g root -m 644 microsoft.gpg /usr/share/keyrings/
sudo sh -c 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/microsoft.gpg] https://packages.microsoft.com/ubuntu/20.04/prod focal main" > /etc/apt/sources.list.d/microsoft-ubuntu-focal-prod.list'
sudo rm microsoft.gpg

# Install
sudo apt update
sudo apt install intune-portal
```

Reboot recommended after installation.

## Scenario 7: Uninstalling / Resetting
> 来源: ado-wiki-b-Linux-Enrollment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

**Via Company Portal UI**: Context Menu → Remove Device

**Manual removal:**
```bash
sudo systemctl stop microsoft-identity-device-broker
systemctl --user stop microsoft-identity-broker

sudo systemctl clean --what=configuration --what=runtime --what=state microsoft-identity-device-broker
systemctl --user clean --what=state --what=configuration --what=runtime microsoft-identity-broker
rm -r ~/.config/intune

sudo apt remove intune-portal microsoft-edge-stable
sudo apt autoremove
```

**Remove secrets only (identity broker 2.0.2+):**
```bash
dsreg --cleanup
```
(Does not clean server-side entries)

---

## Scoping Questions

**Enrollment phase:**
- Linux OS version?
- Intune-portal version? Supported?
- Identity broker version?
- Are broker services running?

**CA/Compliance related:**
- Intune device ID? Entra device ID? (check `~/.config/intune/registration.xml`)
- Compliance policy ID?
- Which browser? Which service?
- Compliant state in Intune app vs. portal vs. Entra ID?
- Sign-in error code?

---

## Scenario 8: General Troubleshooting Commands
> 来源: ado-wiki-b-Linux-Enrollment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```bash
# Check for updates
sudo apt update

# Check device IDs
cd $HOME/.config/intune/ && cat registration.toml

# Refresh Intune Agent
systemctl --user start intune-agent.service

# Get hostname and OS
hostnamectl | grep hostname && hostnamectl | grep Operating

# Check disk encryption
sudo dmsetup status

# Check installed Microsoft apps and versions
dpkg --list | grep microsoft
dpkg --list | grep Intune
apt-cache policy microsoft-identity-broker
apt-cache policy msalsdk-dbusclient
```

---

## Disk Encryption

- All writable local file systems must be encrypted
- Ignored: read-only, pseudo filesystems (/proc, /sys), /boot/efi
- Supported: dm-crypt subsystem (LUKS recommended)
- Best practice: configure encryption **during OS install**

## Scenario 9: Check encryption:
> 来源: ado-wiki-b-Linux-Enrollment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```bash
sudo dmsetup status
```

---

## Password Policy

Intune checks `pam_pwquality` configuration:

```bash
sudo apt install libpam-pwquality
```

Required line in `/etc/pam.d/common-password`:
```
password requisite pam_pwquality.so retry=3 dcredit=-1 ocredit=-1 ucredit=-1 lcredit=-1 minlen=12
```

To edit:
```bash
sudo nano /etc/pam.d/common-password
```

---

## Log Collection

**Collect identity broker logs:**
```bash
journalctl --user -f -u microsoft-identity-broker.service --since today
journalctl --system -f -u microsoft-identity-device-broker.service --since today
```

**Collect Edge logs:**
```bash
/opt/microsoft/msedge/./msedge --enable-logging -v=1 --oneauth-log-level=5 --oneauth-log-pii
```

**Enable debug mode and collect:**
```bash
cd /opt/microsoft/intune/bin
INTUNE_LOG_LEVEL=debug ./intune-portal
```

**Collect PowerLift logs (Ubuntu 20.04):**
```bash
sudo apt-get install microsoft-identity-diagnostics
sudo /opt/microsoft/microsoft-identity-diagnostics/scripts/collect_logs
```

**Collect PowerLift logs (Ubuntu 22.04):**
```bash
cd $HOME/Downloads/
wget https://packages.microsoft.com/ubuntu/20.04/prod/pool/main/m/microsoft-identity-diagnostics/microsoft-identity-diagnostics_1.1.0_amd64.deb
chmod +x microsoft-identity-diagnostics_1.1.0_amd64.deb
sudo apt install ./microsoft-identity-diagnostics_1.1.0_amd64.deb
sudo /opt/microsoft/microsoft-identity-diagnostics/scripts/collect_logs
```

---

## Scenario 10: Error 2400 — "Something went wrong" during initial enrollment
> 来源: ado-wiki-b-Linux-Enrollment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

**Root Cause**: JavaBroker takes 5-10 minutes to start after new install or reboot.  
**Workaround**: Wait 5-10 minutes and retry.

## Scenario 11: Error 1001 — "An unexpected error has occurred" / SSPR
> 来源: ado-wiki-b-Linux-Enrollment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

**Root Cause**: User in tenant with SSPR enabled, has never signed in before → redirected to mysignins to register auth methods.  
**Solution**: User opens browser → signs into Azure portal → registers SSPR auth methods → returns to Linux device → Intune-Portal registration succeeds.  
**Log indicator**: `ErrorCode:PasswordResetRegistrationRequiredInterrupt ErrorNo:50125`

## Scenario 12: Error 530003 / "Access Denied" page
> 来源: ado-wiki-b-Linux-Enrollment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

**Causes**:
- Not using Microsoft Edge
- CA Policy enabled but using Firefox/Chrome/Safari
- Edge Dev build older than 100.x
- Device not enrolled or not compliant

## Scenario 13: "Are you trying to sign in to Microsoft Authentication Broker?"
> 来源: ado-wiki-b-Linux-Enrollment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

**Root Cause**: Known issue — AAD server code not recognizing Linux Broker as known agent. Displays "speedbump" for transparency.  
**Status**: Will be fixed in future release when server libraries updated to recognize platform from user agent.

## Scenario 14: Device shows compliant but can't access resources
> 来源: ado-wiki-b-Linux-Enrollment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

**Checklist**:
1. Visit https://aka.ms/CPWeb — verify device is compliant (10-20 min delay)
2. Check `/etc/pam.d/common-password` — file may have reset, re-add `pam_pwquality` line
3. Re-sign into Intune Portal → wait 10-20 min for re-push

## Scenario 15: Root access required for scripts
> 来源: ado-wiki-b-Linux-Enrollment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Modify `/usr/share/polkit-1/actions/com.microsoft.intune.policy` — set `allow_active` to `yes`.  
**Warning**: May impact device security.

## Scenario 16: Scripts requiring `sudo` will fail
> 来源: ado-wiki-b-Linux-Enrollment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Discovery scripts run in user context — cannot check System-level settings requiring elevation.

## Scenario 17: BYOD not available
> 来源: ado-wiki-b-Linux-Enrollment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

All Linux enrollments are Corporate-owned. Admin must manually change ownership to Personal if needed.

---

## Support Boundaries

- Intune owns: enrollment, compliance policy, Intune Agent issues
- Collaborate with AAD Auth for: device identity, identity broker, Conditional Access issues
- Intune Agent failures → ICM to Intune PG (use LINUX-SPECIFIC ICM TEMPLATE: https://microsoft.sharepoint.com/teams/IntuneCRI/SitePages/CRI-Templates-v2.aspx)

**SME Channel**: https://teams.microsoft.com/l/channel/19%3af7998410bdd147438b33fadc3dc9c3d4%40thread.skype/LinuxMDM  
**Email**: IntuneLinuxSME@microsoft.com

---

## Additional Resources

- Internal eng docs: https://eng.ms/docs/microsoft-security/management/intune/microsoft-intune/intune/archive/intunewiki/docs/linuxmdm
- Public docs: https://learn.microsoft.com/en-us/mem/intune/user-help/enroll-device-linux
- [Identity wiki (AAD)](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/712901/Enterprise-SSO-for-Linux-Desktops)

## Scenario 18: Task Not Starting
> 来源: mslearn-gp-auto-enrollment-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **Already enrolled in another MDM**: Event 7016 with error 2149056522 → unenroll from other MDM first
- **Group Policy issue**: Run `gpupdate /force` and troubleshoot AD

## Scenario 19: Enrollment Steps
> 来源: onenote-apple-configurator-enrollment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. **Add device in Intune**: Add device serial/info to Intune Apple Configurator device list, assign enrollment profile
2. **Connect iOS device** to Mac, open Apple Configurator 2
3. **Configure Server**:
   - Go to Apple Configurator > Preferences > Server
   - Copy profile URL from Intune Portal
   - Convert to DEP URL format (usually auto-converts, but may need manual conversion)
   - Create Server entry in AC preferences
4. **Create Blueprints**: Configure device Blueprints in Apple Configurator
5. **Prepare Device**:
   - Select device > Prepare
   - Apply the Blueprints
   - AC will erase the device
6. **Complete enrollment**: iOS connects to MDM Server URL via TCP and completes profile installation

## Scenario 20: Common Issues
> 来源: onenote-apple-configurator-enrollment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **DEP URL auto-conversion fails**: Manually convert the Intune enrollment URL to DEP format
- **TCP connection timeout**: Verify network connectivity between iOS device (via Mac) and MDM server
- Device must be erased during Prepare step - warn customer about data loss

## Scenario 21: Pre-enrollment: Device Preparation
> 来源: onenote-apple-configurator-iphone-enrollment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

If the device is already registered or in use:

1. **Erase locally** (NOT via Intune wipe): iOS Settings > General > Transfer or Reset > Erase All Content and Settings
   - This removes Find My / activation lock
   - Intune remote wipe does NOT remove activation lock, which will cause AC enrollment to fail
2. Delete the device from Intune portal

## Scenario 22: Steps: Add Device to ABM via Apple Configurator
> 来源: onenote-apple-configurator-iphone-enrollment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Launch Apple Configurator on your iPhone
2. Start up the target iPhone/iPad
3. Continue through Setup Assistant, **stop at "Choose a Country or Region" pane**
   - Note: Must restart if you go past the Wi-Fi Network pane
4. Bring iPhone with Apple Configurator close to the target device:
   - Scan the pairing image in Setup Assistant, OR
   - Tap "Pair Manually" and enter the 6-digit code
5. Device serial number is uploaded to ABM

## Scenario 23: Steps: Intune + ABM Preparation
> 来源: onenote-apple-configurator-iphone-enrollment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. In Intune Portal: Add an enrollment profile for the device
2. In ABM: Confirm device is assigned to the correct MDM server
   - Can set auto-assign for new devices
   - If not auto-assigned, manually assign via ABM
3. In Intune: Sync to discover the newly added device
4. In Intune: Assign enrollment profile to the device

## Scenario 24: Steps: ADE Enrollment
> 来源: onenote-apple-configurator-iphone-enrollment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. On the device, choose "Erase iPhone" to reset
2. Device restarts into Setup Assistant
3. After connecting to Wi-Fi, the ADE enrollment screen appears
4. If the device entered Apple activation without a profile assigned, erase again and retry
5. Complete enrollment, then sign in with Apple ID

## Scenario 25: Common Pitfalls
> 来源: onenote-apple-configurator-iphone-enrollment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Using Intune wipe instead of local erase → activation lock persists → AC fails
- Going past Wi-Fi pane in Setup Assistant → must restart device
- Not assigning MDM server in ABM before proceeding → device won't get enrollment profile

## Scenario 26: Steps
> 来源: onenote-apple-enrollment-program-token-setup.md | 适用: Mooncake ✅

### 排查步骤

1. **Download MDM token** from Intune portal (Devices > iOS/iPadOS > Enrollment)
2. Go to [Apple Business Manager](https://business.apple.com/)
3. Sign in with your organization's Apple ID
4. Upload the MDM server token
5. Download the enrollment program token from Apple
6. Upload the token back to Intune portal
7. Assign devices to the enrollment profile

## Key Notes
- Token expires annually and must be renewed
- Use the same Apple ID that was used to create the original token
- For Mooncake (21Vianet): Verify ADE support availability

## Source
- OneNote: Mooncake POD Support Notebook > Intune > How To > Setup Apple Enrollment Program Token

## Scenario 27: Without GPO
> 来源: onenote-comanagement-autoenroll-vs-gpo.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Co-management enabled → enrollment timer queued (randomized, can be hours away)
2. Log: `Queuing enrollment timer to fire at {future_time}`
3. Before user sign-in: `Expected MDM_ConfigSetting instance is missing`
4. After user sign-in but before timer: `timer already set for enrollment, no need to re-randomize`
5. Timer fires → retrieves AAD info → enrollment completes
6. Key parameters: `MDMEnrollmentDuration=1440, MDMEnrollmentRetryInterval=15, MDMEnrollmentRetries=3, LogonRandomization=60`

## Scenario 28: With GPO
> 来源: onenote-comanagement-autoenroll-vs-gpo.md | 适用: Mooncake ✅

### 排查步骤

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

## Scenario 29: Phase 1: Client Registration
> 来源: onenote-comanagement-autoenrollment-process.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```
ClientIDManagerStartup:
  [RegTask] - Client is not registered. Sending registration request for GUID:xxx
  Registering client using AAD auth.
  [RegTask] - Client is registered. Server assigned ClientID is GUID:xxx. Approval status 3
```

## Scenario 30: Phase 2: Initial Policy (AutoEnroll = False)
> 来源: onenote-comanagement-autoenrollment-process.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

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

## Scenario 31: Phase 3: Move to Pilot Collection (AutoEnroll = True)
> 来源: onenote-comanagement-autoenrollment-process.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

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

## Scenario 32: Phase 4: Device Enrollment (Intune Side)
> 来源: onenote-comanagement-autoenrollment-process.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

> **Note**: Device Enrollment is an Intune action.

Check Event Viewer: `Application and Service logs → Windows → DeviceManagement-Enterprise-Diagnostics-Provider`

Sequence:
1. Client requests MDM Policy
2. Certificate Enrollment request sent and processed
3. OMA-DM configured, MDM provisioned and completed
4. Session starts for AAD User (Hybrid User)

## Scenario 33: Phase 5: Scheduled Tasks
> 来源: onenote-comanagement-autoenrollment-process.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Windows tasks created under `EnterpriseMgmt`:
- **PushLaunch** — initial enrollment via `deviceenroller.exe`
- **PushRenewal** — enrollment renewal via `deviceenroller.exe`

## Key Configuration Locations

## Scenario 34: WMI Class: CCM_CoMgmt_Configuration
> 来源: onenote-comanagement-autoenrollment-process.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

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

## Scenario 35: Registry: Azure AD Join Info
> 来源: onenote-comanagement-autoenrollment-process.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

`HKLM\SYSTEM\CurrentControlSet001\Control\CloudDomainJoin\TenantInfo\<TenantID>`

## Scenario 36: dsregcmd /status
> 来源: onenote-comanagement-autoenrollment-process.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- `AzureAdJoined: YES` required
- `MdmUrl` shows enrollment endpoint

## Scenario 37: Troubleshooting Checkpoints
> 来源: onenote-comanagement-autoenrollment-process.md | 适用: Mooncake ✅

### 排查步骤

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

## Scenario 38: Phase 1: User Login (Company Portal Sign-In)
> 来源: onenote-company-portal-ios-enrollment-log-analysis.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

**Log keywords**: `Login button was clicked`, `ADALLoginStarted`

```
WelcomeController: Login button was clicked, starting login
featureArea: Login | eventTitle: ADALLoginStarted | brokerAuth:false
```

- MSAL acquires token for scope `0000000a-0000-0000-c000-000000000000/.default` (Microsoft Intune resource)
- Successful token fetch: `result: Succeeded | target: AADIntuneToken`

**Verification**: Check Azure AD Sign-in Activity log to confirm Company Portal sign-in succeeded.

## Scenario 39: Phase 2: Enrollment Profile Download
> 来源: onenote-company-portal-ios-enrollment-log-analysis.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

**Log keywords**: `enrollment`, `ProfileDownload`, `EnrollmentProfiles`

```
CompanyAccessSetupViewController: steps: PrivacyInformation, ProfileDownload, ProfileInstall, Compliance
```

- Requests enrollment progress via `StatelessEnrollmentService/EnrollmentSessions`
- Fetches **AADIntuneEnrollmentToken** (resource ID: `d4ebce55-015a-49b5-a083-c84d1797ae8c`)

## Scenario 40: Phase 3: Enrollment Eligibility Check
> 来源: onenote-company-portal-ios-enrollment-log-analysis.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

**Log keywords**: `EnrollmentEligibility`, `Approved`

```
URL: StatelessIWService/EnrollmentProfiles('default')
Result: EnrollmentEligibility: Approved
```

- Service URL pattern: `fef.msuc01.manage.microsoft.com` (varies by tenant region)
- Parameters include: `os=iOS`, `os-version`, `ssp-version`, `arch`

## Scenario 41: Phase 4: Device Enrollment Execution
> 来源: onenote-company-portal-ios-enrollment-log-analysis.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

**Log keywords**: `Starting device enrollment flow`, `UserClickEnroll`

```
EnrollmentManager: Starting device enrollment flow
featureArea: Enrollment | eventTitle: UserClickEnroll
```

## Key Resource IDs

| Resource ID | Service |
|---|---|
| `0000000a-0000-0000-c000-000000000000` | Microsoft Intune |
| `d4ebce55-015a-49b5-a083-c84d1797ae8c` | Microsoft Intune Enrollment |

## Key Token Types

| Token Type | Purpose |
|---|---|
| `AADIntuneToken` | Company Portal authentication |
| `AADIntuneEnrollmentToken` | MDM enrollment authentication |

## Scenario 42: Troubleshooting Tips
> 来源: onenote-company-portal-ios-enrollment-log-analysis.md | 适用: Mooncake ✅

### 排查步骤

- If login fails → check `ADALLoginStarted` event and MSAL error
- If enrollment token fails → check authority URL resolution (common → tenant-specific)
- If eligibility check fails → check `EnrollmentEligibility` result in response
- For Mooncake/21Vianet → service URL will differ from global (`fef.msuc01.manage.microsoft.com`)
- Cross-reference with Azure AD Sign-in Activity logs for token acquisition issues

## Scenario 43: 1. Create OU for Target Devices
> 来源: onenote-configure-gpo-auto-enroll.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Open Active Directory Users and Computers
- Create a new OU (e.g., "Autopilot Devices") under the domain
- Move target hybrid-joined devices into this OU

## Scenario 44: 2. (Optional) Create Device Security Group
> 来源: onenote-configure-gpo-auto-enroll.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Under Users, create a security group for security filtering
- Add target device objects to this group
- **Note**: Device group membership may require a **device restart** to take effect

## Scenario 45: 3. Create and Configure GPO
> 来源: onenote-configure-gpo-auto-enroll.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Open Group Policy Management
- Right-click the OU > Create a GPO and link it
- Edit the GPO:
  - Navigate to: Computer Configuration > Policies > Administrative Templates > Windows Components > MDM
  - Enable: **"Enable automatic MDM enrollment using default Azure AD credentials"**

## Scenario 46: 4. (Optional) Configure Security Filtering
> 来源: onenote-configure-gpo-auto-enroll.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- If using a device security group for targeted deployment:
  - On the GPO Delegation tab > Advanced: uncheck "Apply group policy" for **Authenticated Users**
  - Add the device security group to Security Filtering
- **Important**: Without removing Authenticated Users from Apply, the security group filter is ineffective because all devices in the OU are part of Authenticated Users

## Scenario 47: 5. Verify on Client Device
> 来源: onenote-configure-gpo-auto-enroll.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```cmd
gpupdate /force
gpresult /r       # Quick view - check if GPO is applied
gpresult /v       # Detailed view - confirm MDM enrollment GPO
```

## Scenario 48: 6. Confirm Scheduled Task
> 来源: onenote-configure-gpo-auto-enroll.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- On the client device, open Task Scheduler
- Verify the MDM auto-enrollment scheduled task has been created
- The task triggers enrollment with Intune using AAD credentials

## Scenario 49: Troubleshooting
> 来源: onenote-configure-gpo-auto-enroll.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- If GPO shows "Denied (Security Filtering)": verify device is in the security group and has restarted
- If enrollment doesn't trigger: check Task Scheduler for the MDM enrollment task and verify its status

## References
- [Enroll a Windows 10 device automatically using Group Policy](https://docs.microsoft.com/en-us/windows/client-management/mdm/enroll-a-windows-10-device-automatically-using-group-policy)

## Scenario 50: Three Types of Enrollment Failures
> 来源: onenote-device-enrollment-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. **Client Errors** - account misconfig or unable to reach enrollment endpoint
2. **Service Errors** - server-side failures
3. **Pre/Post Enrollment Failure** - not visible in DeviceLifecycle log

## Scenario 51: Step 1: Get Client Information
> 来源: onenote-device-enrollment-tsg.md | 适用: Mooncake ✅

### 排查步骤

Use UserId and AccountContextId (AAD Tenant ID) as filter:

```kql
GetEnrollmentDetailsByTimeAndScaleUnitMooncake(ago(7d), now(), "CNPASU01")
| where Scenario == "DeviceEnrollment"
| where UserId == "<userId>"
| project env_time, ActivityId, SummarizedError, Provider, PlatformType, 
         EnrollmentType, AccountId, AccountContextId, DeviceId, UserId
```
`[来源: onenote-device-enrollment-tsg.md]`

**Kusto cluster**: intunecn.chinanorth2.kusto.chinacloudapi.cn / intune

## Scenario 52: Step 2: Query Provider-Specific Logs
> 来源: onenote-device-enrollment-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Use ActivityId from Step 1 in the appropriate provider log:

| Platform | Kusto Tables |
|----------|-------------|
| Windows (Win10, HoloLens, WinPhone) | EnrollmentSoapProvider, CommonSoapMessageProviderOperations, EnrollmentService |
| iOS/Mac (iPad, iOS, Mac) | IOSEnrollmentService |
| Android (Android, AfW) | CommonSoapMessageProviderOperations, EnrollmentService |
| Any | IntuneEvent, EnrollmentLibrary |

```kql
DeviceLifecycle 
| where env_time > ago(1d)
| where SourceNamespace == "IntuneCNP"
| where ActivityId == "<activityId>"
| extend PlatformType = GetDeviceLifecyclePlatform(platform)
| extend EnrollmentType = GetDeviceLifecycleEnrollmentTypeFriendlyName(platform, ['type'])
| project env_time, details, SourceNamespace, ActivityId, PlatformType, EnrollmentType, 
         EventId, failureReason, TaskName, sessionId, accountId, userId, deviceId
| order by env_time asc
```
`[来源: onenote-device-enrollment-tsg.md]`

## Scenario 53: Step 3: Deep Dive with IntuneEvent
> 来源: onenote-device-enrollment-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kql
IntuneEvent
| where env_time > ago(1d)
| where ActivityId == '<activityId>'
| project env_time, ActivityId, RelatedActivityId, EventUniqueName, ColMetadata, 
         Col1, Col2, Col3, Col4, Col5, Col6, Message
| extend metakeys = todynamic(split(trim_end(';',ColMetadata),';'))
| extend metavalues = pack(tostring(metakeys[0]), Col1, tostring(metakeys[1]), Col2, 
         tostring(metakeys[2]), Col3, tostring(metakeys[3]), Col4, 
         tostring(metakeys[4]), Col5, tostring(metakeys[5]), Col6)
| project env_time, ActivityId, RelatedActivityId, EventUniqueName, metavalues
| order by env_time asc
```
`[来源: onenote-device-enrollment-tsg.md]`

## Scenario 54: Important Notes
> 来源: onenote-device-enrollment-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- If no DeviceLifecycle log appears 20 min after failure -> likely pre-enrollment failure
- Pre-enrollment failures: check network connectivity, certificate trust, enrollment endpoint reachability
- Scale units: CNPASU01 (sub: a1472f7d-...), CNBASU01 (sub: 3f7fcc0f-...)

## Scenario 55: Scenario
> 来源: onenote-enroll-after-aadj-methods.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Device completed AADJ during OOBE but was not auto-enrolled to Intune because the user was not yet in the MDM auto-enrollment group. After the user is added to the group and assigned an Intune license, how to enroll the device?

## Scenario 56: Enrollment Methods Comparison
> 来源: onenote-enroll-after-aadj-methods.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Pre-condition | Action | Result | Intune Ownership |
|---|---|---|---|
| N/A | Enroll only in Device Management | Registration will not happen; Intune device is Personal Own | Personal |
| AADJ | Connect | Registration will not happen; device binds to AADJ one | Personal |
| AADJ | Enroll only in Device Management | Registration will not happen; device binds to AADJ one | Personal |
| N/A | Auto-Enroll + Connect | Registration will happen | Corporate |
| AADJ | GP enroll | Registration will not happen; device binds to AADJ one | Corporate |

## Key Findings

## Scenario 57: OOBE Auto-Enroll (Baseline)
> 来源: onenote-enroll-after-aadj-methods.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Enrollment type: `6 (MDMDeviceWithAAD)` 
- Device ownership: Corporate
- UI shows Microsoft logo

## Scenario 58: Manual "Enroll only in Device Management"
> 来源: onenote-enroll-after-aadj-methods.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Enrollment type: `0 (MDMFull)` - BYOD enrollment
- Device ownership: Personal
- UI shows briefcase icon
- May have limitations with IME, AAD CA, etc.

## Scenario 59: Group Policy Auto-Enroll (Recommended for post-AADJ)
> 来源: onenote-enroll-after-aadj-methods.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Enrollment type: `6 (MDMDeviceWithAAD)` - same as OOBE
- Device ownership: Corporate
- UI effect identical to OOBE auto-enroll
- Reference: [Enroll a Windows device automatically using Group Policy](https://learn.microsoft.com/en-us/windows/client-management/enroll-a-windows-10-device-automatically-using-group-policy#configure-the-autoenrollment-group-policy-for-a-single-pc)

## UI Icon Explanation

- **Microsoft logo**: Cloud user logged in after AADJ
- **Briefcase icon**: "Enroll only in Device Management" (always), or local user that performed AADJ (before switching to cloud user)

## Recommendation

For devices already AADJ without auto-enrollment, use **Group Policy auto-enroll** to achieve the same effect as OOBE auto-enrollment (Corporate ownership, MDMDeviceWithAAD type).

## Scenario 60: Step 1: Check Event Viewer
> 来源: onenote-gp-auto-enrollment-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Open Event Viewer → `Applications and Services Logs > Microsoft > Windows > DeviceManagement-Enterprise-Diagnostic-Provider > Admin`

| Event ID | Meaning |
|----------|---------|
| 75 | Auto-enrollment succeeded |
| 76 | Auto-enrollment failed (check error code in event details) |
| Neither | Auto-enrollment task was never triggered |

## Scenario 61: Step 2: Verify Task Scheduler
> 来源: onenote-gp-auto-enrollment-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

The auto-enrollment is triggered by a scheduled task: `Microsoft > Windows > EnterpriseMgmt`

- This task runs **every 5 minutes** for **1 day** duration
- Task is only visible with **admin credentials** in Task Scheduler
- Check task scheduler logs: `Applications and Services Logs > Microsoft > Windows > Task Scheduler > Operational`
  - Event ID **107**: Task triggered
  - Event ID **102**: Task completed (does NOT indicate enrollment success/failure)

## Scenario 62: Step 3: If Task Not Triggered
> 来源: onenote-gp-auto-enrollment-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Run `gpupdate /force` to force GP object application
2. Check for **stale enrollment entries** in registry:
   - Path: `HKLM\Software\Microsoft\Enrollments`
   - Old enrollment keys may remain after unenrollment
   - `gpupdate /force` fails with **error 2149056522** in Task Scheduler event ID 7016
3. **Fix**: Manually remove the stale registry key (the one with the most sub-entries)

## Scenario 63: Step 4: GP Policy Verification
> 来源: onenote-gp-auto-enrollment-tsg.md | 适用: Mooncake ✅

### 排查步骤

Verify the MDM auto-enrollment GP is applied:
- Run `gpresult /h gpreport.html` to check applied policies
- Confirm the GP targets the correct OU/group

## Log Collection Reference

- [Collect MDM Event Viewer Log (YouTube)](https://www.youtube.com/watch?v=U_oCe2RmQEc)
- [Microsoft docs: MDM enrollment diagnostics](https://learn.microsoft.com/en-us/windows/client-management/mdm-diagnose-enrollment)

## 21v Applicability

Fully applicable to 21v environment. Ensure Entra ID tenant has MDM auto-enrollment scope configured correctly.

## Scenario 64: Phase 1: Sign In
> 来源: onenote-ios-company-portal-enrollment-log.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. User clicks Login button in Company Portal
2. `ADALLoginStarted` / MSAL acquires token
3. Scope: `0000000a-0000-0000-c000-000000000000/.default` (Microsoft Intune resource)
4. Token type: **AADIntuneToken** → result: Succeeded

## Scenario 65: Phase 2: Profile Download & Enrollment
> 来源: onenote-ios-company-portal-enrollment-log.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Enrollment steps initialized:
   - PrivacyInformation → ProfileDownload → ProfileInstall → Compliance
2. Reports enrollment progress to: `fef.msuc01.manage.microsoft.com/StatelessEnrollmentService/EnrollmentSessions`
3. Fetches **AADIntuneEnrollmentToken**:
   - Scope: `d4ebce55-015a-49b5-a083-c84d1797ae8c/.default` (Microsoft Intune Enrollment resource)
   - Uses silent token acquisition with cached account
   - Authority resolved from `/common` to tenant-specific endpoint

## Scenario 66: Enrollment Service Endpoints
> 来源: onenote-ios-company-portal-enrollment-log.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- `fef.msuc01.manage.microsoft.com` — Intune service endpoint (varies by region)
- API version: `15.0` for enrollment profiles, `2.19` for enrollment sessions

## Source
- OneNote: MCVKB/Intune/iOS/Company Portal log - GoodSample.md

## Scenario 67: Step 1: Get Enrollment ActivityId from DeviceLifecycle
> 来源: onenote-kusto-ios-enrollment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kql
DeviceLifecycle
| where userId == "<user-id>"
| project env_time, I_Srv, scenarioType, scenarioInstanceId, ActivityId,
  TaskName, sessionId, accountId, userId, aadDeviceId, type, platform,
  version, newThumbprint, accountContextId, oldManagementState,
  newManagementState, oldRegistrationState, newRegistrationState
```
`[来源: onenote-kusto-ios-enrollment.md]`

Look for `scenarioType = Enrollment` entries and note the `ActivityId`.

## Scenario 68: Step 2: Query IOSEnrollmentService
> 来源: onenote-kusto-ios-enrollment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kql
IOSEnrollmentService
| where env_time between (ago(1d) .. now())
| where ActivityId == "<activity-id-from-step1>"
| project env_time, userId, callerMethod, deviceTypeAsString,
  serialNumber, message, siteCode
```
`[来源: onenote-kusto-ios-enrollment.md]`

## Scenario 69: Key Methods in iOS Enrollment Flow
> 来源: onenote-kusto-ios-enrollment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. **Apple unsigned input payload** - Initial device check-in with UDID, serial number, product info
2. **signedCms challenge not NULL** - SCEP challenge validation
3. **Apple challenge expiry** - Challenge has 10-minute validity window
4. **ValidateAndFetchSignerCertificate** - Certificate chain validation
   - "Chain building done. Valid chain: True" = success
   - "SN+I validation done. Valid SNI: True" = serial + IMEI validation passed
5. **HandleReportDeviceInfoToReturnScepProfile** - Device info reported, SCEP profile being returned
6. **StartFirstReportDeviceInfo** - Initial device registration with serial number

## Scenario 70: DeviceLifecycle
> 来源: onenote-kusto-windows-enrollment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Track enrollment lifecycle events by device or user:
```kql
DeviceLifecycle
| where userId == "<user-id>"
| project env_time, I_Srv, scenarioType, scenarioInstanceId, ActivityId, TaskName,
  sessionId, accountId, userId, aadDeviceId, type, platform, version,
  newThumbprint, accountContextId, oldManagementState, newManagementState,
  oldRegistrationState, newRegistrationState
```
`[来源: onenote-kusto-windows-enrollment.md]`

**Platform codes:**
- `3` = Windows
- `10` = Mac

## Scenario 71: EnrollmentSoapProvider
> 来源: onenote-kusto-windows-enrollment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Get Windows enrollment SOAP details using ActivityId from DeviceLifecycle (ScenarioType = Enrollment/MobileWindows):
```kql
EnrollmentSoapProvider
| where ActivityId == "<activity-id-from-DeviceLifecycle>"
| project env_time, I_Srv, scenarioType, TaskName, requestDetails, platform, version
```
`[来源: onenote-kusto-windows-enrollment.md]`

## Scenario 72: IntuneEvent
> 来源: onenote-kusto-windows-enrollment.md | 适用: Mooncake ✅

### 排查步骤

Deep-dive into enrollment events:
```kql
IntuneEvent
| where env_time >= ago(29d)
| where ActivityId == "<activity-id>"
| project env_time, UserId, ActivityId, DeviceId, AccountId, ContextId,
  PayLoadId, ComponentName, EventUniqueName, ColMetadata,
  Col1, Col2, Col3, Col4, Col5, Col6, Message
```
`[来源: onenote-kusto-windows-enrollment.md]`

## Key Fields to Check
- **TokenIssuer**: Verify correct token issuer (e.g., UserTokenFromAzureADTokenIssuer)
- **Audience**: Check enrollment endpoint (e.g., `https://enrollment.manage.microsoftonline.cn/` for 21v)
- **MDMAuthority**: Should be "Intune"
- **EnrollmentType**: AutoEnrollment=8/10, indicates auto-enrollment
- **IsOpenForEnrollment**: Must be true
- **IntuneLicenced**: Must be true for enrollment to succeed

## 21v (Mooncake) Specific
- Login endpoint: `login.partner.microsoftonline.cn`
- Enrollment endpoint: `enrollment.manage.microsoftonline.cn`

## Scenario 73: Error Code Table
> 来源: onenote-mdm-enrollment-error-codes.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Code | ID | Error Message |
|------|-----|---------------|
| 0x80180001 | MENROLL_E_DEVICE_MESSAGE_FORMAT_ERROR | Server connectivity error |
| 0x80180002 | MENROLL_E_DEVICE_AUTHENTICATION_ERROR | Account/device authentication problem |
| 0x80180003 | MENROLL_E_DEVICE_AUTHORIZATION_ERROR | User not authorized to enroll |
| 0x80180004 | MENROLL_E_DEVICE_CERTIFCATEREQUEST_ERROR | Certificate error |
| 0x80180005 | MENROLL_E_DEVICE_CONFIGMGRSERVER_ERROR | Server connectivity error |
| 0x80180006 | MENROLL_E_DEVICE_CONFIGMGRSERVER_ERROR | Server connectivity error |
| 0x80180007 | MENROLL_E_DEVICE_INVALIDSECURITY_ERROR | Authentication problem |
| 0x80180008 | MENROLL_E_DEVICE_UNKNOWN_ERROR | Server connectivity error |
| 0x80180009 | MENROLL_E_ENROLLMENT_IN_PROGRESS | Another enrollment in progress |
| 0x8018000A | MENROLL_E_DEVICE_ALREADY_ENROLLED | Device already enrolled |
| 0x8018000D | MENROLL_E_DISCOVERY_SEC_CERT_DATE_INVALID | Certificate date invalid |
| 0x8018000E | MENROLL_E_PASSWORD_NEEDED | Password needed |
| 0x8018000F | MENROLL_E_WAB_ERROR | Authentication problem |
| 0x80180010 | MENROLL_E_CONNECTIVITY | Connectivity error |
| 0x80180012 | MENROLL_E_INVALIDSSLCERT | Invalid SSL certificate |
| 0x80180013 | MENROLL_E_DEVICECAPREACHED | Device limit reached |
| 0x80180014 | MENROLL_E_DEVICENOTSUPPORTED | Device not supported |
| 0x80180015 | MENROLL_E_NOTSUPPORTED | Feature not supported |
| 0x80180016 | MENROLL_E_NOTELIGIBLETORENEW | Renewal rejected |
| 0x80180017 | MENROLL_E_INMAINTENANCE | Service in maintenance |
| 0x80180018 | MENROLL_E_USERLICENSE | License error |

## Scenario 74: Common Troubleshooting Steps
> 来源: onenote-mdm-enrollment-error-codes.md | 适用: Mooncake ✅

### 排查步骤

1. **0x80180002 / 0x80180003**: Check user Intune license assignment and MDM scope in Entra ID
2. **0x8018000A**: Device already enrolled — unenroll first or check for stale enrollment entries in `HKLM\Software\Microsoft\Enrollments`
3. **0x80180013**: Check device enrollment limit in Intune portal → Devices → Enrollment restrictions
4. **0x80180004 / 0x8018000D / 0x80180012**: Verify SSL/TLS certificates, check proxy/firewall not intercepting traffic

## 21v Applicability

All error codes apply to 21v (Mooncake) environment. Ensure MDM discovery URLs point to `.partner.microsoftonline.cn` endpoints.

## Scenario 75: Enrollment Flow
> 来源: onenote-windows-oobe-enrollment-cap.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. **Login to Microsoft Entra ID** during OOBE
2. **MFA kicks in** (if configured)
3. **Discover tenant realm** — ENROLLClient queries tenant endpoints
4. **Device Registration** — dsreg creates TPM-bound RSA 2048-bit key pair (device key dkpub/dkpriv + transport key tkpub/tkpriv), initiates PKCS device certificate request
5. **Receive device certificate** — Device ID + device certificate received from DRS
6. **Discover Intune service endpoints** — MDM discovery call from Windows ENROLLClient to Intune
7. **Intune enrollment** — MDM enrollment client authenticates and enrolls despite CAP requiring compliance (by-design)
8. **Receive MDM device certificate** — Intune MDM device certificate received

## Event Log Locations

- `Microsoft\Windows\User Device Registration\Admin` — Device registration events
- Entra Sign-In Logs — Device Registration Service events
- Entra Audit Logs — Microsoft Intune Enrollment events

---

## Kusto 查询参考

### 查询 1: Apple 设备请求/响应查询

```kql
let _deviceId = '{deviceId}';

IntuneEvent
| where env_time > ago(6h)
| where env_cloud_name == "CNPASU01"
| where DeviceId == _deviceId
| where EventUniqueName in ("ExternalAppleHttpCallRequestBody", "ExternalAppleHttpCallResponseBody")
| extend _body = iff(EventUniqueName == "ExternalAppleHttpCallRequestBody", Col5, Col4)
| extend _url = iff(EventUniqueName == "ExternalAppleHttpCallRequestBody", Col4, Col3)
| extend _durationMs = iff(EventUniqueName == "ExternalAppleHttpCallRequestBody", parse_json(Col6).durationMs, "(response has no duration)")
| extend _json = parse_json(_body)
| project env_time, cV, _url, _durationMs, _json, DeviceId
| order by env_time asc
```
`[来源: apple-device.md]`

### 查询 2: iOS 注册服务查询

```kql
IOSEnrollmentService 
| where env_time > ago(30d)
| where ActivityId == '{deviceId}'
| project env_time, userId, callerMethod, message, deviceTypeAsString, 
    serialNumber, siteCode, ActivityId, relatedActivityId2
```
`[来源: apple-device.md]`

### 查询 3: 获取 Apple 设备列表

```kql
let accountId = '{accountId}';

DeviceLifecycle
| where env_time > ago(90d)
| where accountId == accountId
| where platform in ("7", "8", "10")  // iPhone, iPad, macOS
| where deviceId != ""
| summarize 
    LastSeen=max(env_time),
    FirstSeen=min(env_time)
  by deviceId, platform
| extend PlatformName = case(
    platform=="7", "iPhone",
    platform=="8", "iPad",
    platform=="10", "macOS",
    platform)
| order by LastSeen desc
| limit 1000
```
`[来源: apple-device.md]`

### 查询 1: 基础注册操作查询

```kql
IntuneOperation
| where env_time between (datetime({startTime}) .. datetime({endTime}))
| where TenantId == '{tenantId}'
| where operationName contains "Enrollment"
| project env_time, AccountId, DeviceId, UserId, operationName, resultType, resultDescription
| order by env_time desc
```
`[来源: enrollment.md]`

### 查询 2: 设备生命周期查询

```kql
let starttime = datetime({startTime});
let endtime = datetime({endTime});
let deviceid = '{deviceId}';
let accountid = '{accountId}';

DeviceLifecycle
| where env_time between (starttime .. endtime)
| where accountId == accountid
| where deviceId contains deviceid
| project env_time, deviceId, userId, tenantID, accountId, ActivityId, relatedActivityId2
| order by env_time desc
```
`[来源: enrollment.md]`

### 查询 3: 设备生命周期详细查询 (含事件类型解析)

```kql
let _deviceId = '{deviceId}';
let _tenantId = '{tenantId}';
let _maxcount = int(5000);

DeviceLifecycle
| where tenantId <> ''
| where deviceId == _deviceId or userId == _deviceId
| extend TypeName = case(
    type==0, 'Unknown', type==1, 'User Personal', type==2, 'User Personal with AAD',
    type==3, 'User Corporate', type==4, 'User Corporate with AAD', type==5, 'Userless Corporate',
    type==10, 'AutoEnrollment', type==12, 'On Premise Comanaged',
    type==13, 'AutoPilot Azure Domain Joined with profile', tostring(type))
| extend EventName = case(
    EventId==46801, 'EnrollmentAddDeviceEvent', EventId==46804, 'EnrollmentAddDeviceFailedEvent',
    EventId==46806, 'EnrollmentStartEvent', EventId==46802, 'Renewal succeeded',
    EventId==46821, 'Registration succeeded', EventId==46822, 'Device removed',
    EventId==46825, 'Device checked in', tostring(EventId))
| extend PlatformName = case(
    platform==3, 'Windows 10', platform==7, 'iPhone', platform==8, 'iPad',
    platform==11, 'Android', platform==14, 'Android for Work', tostring(platform))
| project env_time, EventId, EventName, TypeName, PlatformName, deviceId, userId, accountId,
    oldManagementState, newManagementState, oldRegistrationState, newRegistrationState, details
| limit _maxcount
```
`[来源: enrollment.md]`

### 查询 5: DDM 日志查询

```kql
let deviceid = '{deviceId}';
let starttime = datetime({startTime});
let endtime = datetime({endTime});

DeviceManagementProvider
| where env_time between (starttime..endtime)
| where ActivityId == deviceid or userId == deviceid
| project env_time, deviceId, ActivityId, message, EventId, userId, TaskName
| order by env_time
```
`[来源: enrollment.md]`

### 查询 6: 设备管理会话查询

```kql
DeviceManagementProvider
| where env_time between (datetime({startTime}) .. datetime({endTime}))
| where ActivityId =~ '{deviceId}'
| where message contains "ending management session" or message contains "starting management session"
| project env_time, message, EventMessage, EventId, ActivityId, relatedActivityId2, 
    actionName, deviceId, accountId
| sort by env_time asc
```
`[来源: enrollment.md]`

---

## 判断逻辑参考

### Step 3: Deep Dive with IntuneEvent

| where env_time > ago(1d)
| where ActivityId == '<activityId>'
| project env_time, ActivityId, RelatedActivityId, EventUniqueName, ColMetadata, 

### Step 3: Deep Dive with IntuneEvent

| extend metakeys = todynamic(split(trim_end(';',ColMetadata),';'))
| extend metavalues = pack(tostring(metakeys[0]), Col1, tostring(metakeys[1]), Col2, 

### Step 3: Deep Dive with IntuneEvent

| project env_time, ActivityId, RelatedActivityId, EventUniqueName, metavalues
| order by env_time asc

### Enrollment Methods Comparison

| Pre-condition | Action | Result | Intune Ownership |
|---|---|---|---|
| N/A | Enroll only in Device Management | Registration will not happen; Intune device is Personal Own | Personal |
| AADJ | Connect | Registration will not happen; device binds to AADJ one | Personal |
| AADJ | Enroll only in Device Management | Registration will not happen; device binds to AADJ one | Personal |
| N/A | Auto-Enroll + Connect | Registration will happen | Corporate |
| AADJ | GP enroll | Registration will not happen; device binds to AADJ one | Corporate |

### Step 1: Check Event Viewer

| Event ID | Meaning |
|----------|---------|
| 75 | Auto-enrollment succeeded |
| 76 | Auto-enrollment failed (check error code in event details) |
| Neither | Auto-enrollment task was never triggered |

---

> ⚠️ **21V (Mooncake) 注意**: 本主题包含 21V 特有的限制或配置，请注意区分 Global 与 21V 环境差异。
