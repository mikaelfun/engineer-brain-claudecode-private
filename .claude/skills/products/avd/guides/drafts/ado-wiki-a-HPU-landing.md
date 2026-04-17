---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Sandbox/In-Development Content/Outdated? - Needs review if still useful/HPU Bkup/landing"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/662573"
importDate: "2026-04-06"
type: troubleshooting-guide
note: "Private Preview content – marked 'Outdated/needs review'. Internal reference only."
---

# Host Pool Update (HPU) – Feature Design & Architecture Reference

> ⚠️ **Stop**: This content is being developed and is not yet ready for consumption.
> Tags: cw.UpcomingFeatures | Private Preview has started. Public Preview has NOT started.
> All information is considered Microsoft internal and should not be shared outside Microsoft.

[[_TOC_]]

## What is Host Pool Image Update?

Host Pool Image update provides customers an admin-friendly Azure Portal interface to:
- Update session hosts within host pools (structured inputs, less expertise needed)
- Update VM Size, Disk type, and AD/AAD join membership
- Automate the update process deterministically
- Schedule updates or start immediately
- Communicate to end users before disruptive updates

### Goals
- Easy-to-use Azure Portal and PowerShell interfaces
- Allow communication to end users impacted by forced actions
- Validate update parameters prior to execution

### Non-Goals
- Building images (handled by Image Creation Service)
- Real-time/dynamic scaling
- Targets pooled environments only (not personal host pools)
- Does not address ephemeral OS disk host pools

---

## Design

### Session Host in Maintenance Mode
- Update service updates a "chunk" of **least-active** session hosts (admin selects batch size).
- Session hosts placed in **drain mode** → users given grace period → forcefully kicked out.
- During update, HPU service holds **exclusive ownership** of the session host.
- Operations sequence: DrainMode-In → PowerDown → OS DiskSwap → VM SizeChange → PowerUp → Reprovision → HealthCheck → DrainMode-Out
- Guarantees original drain-mode and power-state restored post-update.
- Session hosts in maintenance mode excluded from load balancing (RdArmProvider + LoadBalancer enforce this).

### Session Host Model Changes

| Field | Description |
|-------|-------------|
| MaintenanceMode (UpdateStatus) | HPU service reserves exclusive ownership; respected by Load Balancer and RDArmProvider |
| SessionHostConfigurationLastUpdateTime | Tracks SHC version; compared with current SHC in host-pool |
| LastSessionHostUpdateTime | Session host create/last updated date (user-displayed) |
| ImageResourceId/ImageType | Session host image used (user-displayed) |

### In Sync / Out of Sync
- `SessionHostConfigurationLastUpdateTime` vs HostPool SHC version determines sync state.
- Updating SHC puts all existing session hosts out-of-sync.
- HPU service takes snapshot of ALL out-of-sync session hosts at start; updates based on cached SHC.

### Load Balancing Preference
- Newer session hosts (higher `SessionHostConfigurationLastUpdateTime`) preferred by LoadBalancer.
- Reduces (but does not eliminate) chance of users being kicked multiple times.

### Host Pool CRUD During Update
- HostPool NOT locked during update.
- New VMs (in sync) essentially ignored by HPU.
- Race condition possible if session host state changes while being put into maintenance.

---

## Architecture

Three-tier micro-service design (Azure Function Apps):

- **Tier 1**: HostPool AppGateway – HTTP Endpoint (pass-through from RdArmProvider)
  - Scheduler, Initial validation, Version Resolution
- **Tier 2**: HostPool Update Manager (CosmosDB Trigger)
  - Command Processor, Hostpool Update Orchestrator (implements HPU state machine)
- **Tier 3**: HostPool Update Migration (per session host)
  - Azure Durable Function-based
  - Per-session-host: DrainMode-In, PowerDown, OS DiskSwap, VM SizeChange, PowerUp, Reprovision, HealthCheck, DrainMode-Out

---

## VM Migration Process

### Sequential Operations
1. SwitchVmPowerStateOperation (on)
2. DeprovisionExtensions (AADJ)
3. DeprovisionAdExtension
4. DeprovisionExtensions (DSC)
5. DeleteSessionHostOperationReverse
6. DomainRejoinReverseOnlyOperation
7. SwitchVmPowerStateOperation (off)
8. SwapDiskOntoVmOperation
9. VMResizeOperation
10. SwitchVmPowerStateOperation (on)
11. DomainJoinOperation (via domain join extensions)
12. DeleteSessionHostOperation
13. ProvisionAgentOperation (DSC)
14. CustomTemplateOrScriptOperation

### Error Handling
- Attempts rollback if migration fails mid-process.
- No lock on CRP or other non-WVD resources → cannot handle user-side VM modifications (e.g., power off, delete).

### Service Reliability
- Uses Durable Functions (idempotency only needed for individual REST calls).
- Long exponential backoff on most calls.

---

## VM Creation / Disk-Swap Design

### Disk Bringup
1. Create new VM using template (in same resource group as original VM).
   - Temp VM named: `{OriginalName}-YEAR-MONTH-DAY-THOUR-MIN-SEC`
2. Delete temp VM (keep new OS disk).
3. Return VMDiskInfo (OS + Data Disk resource info).

### VM Swap Update
Sequence:
1. Deallocate VM
2. Resize VM
3. Swap Disks
4. Cleanup old SessionHost (VM initialized as new SessionHost)
5. Install extensions: RDAgent + AAD Join
6. Start VM again

### VM Creation (Net New VMs)
- Deployed via ARM template in same resource group.
- Constraint: new VMs cannot share name prefix with old VMs.

---

## Deploying Session Hosts Via REST APIs

Background: ARM template deployments (original stopgap) replaced with ARM REST API for better reliability and error telemetry.
