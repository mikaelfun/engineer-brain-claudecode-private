---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Cloud PC Actions/Disaster Recovery Plus/Scoping Questions"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Cloud%20PC%20Actions/Disaster%20Recovery%20Plus/Scoping%20Questions"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Disaster Recovery Plus - Scoping Questions

## 1) Customer scenario / intent (what are we trying to do?)

- Are you **testing DR Plus** or responding to an **active outage / regional degradation**?
- What is the **expected outcome** (failover to temporary Cloud PC, validate backups, restore service, etc.)?
- Are you trying to **activate**, **deactivate**, or **verify readiness/status** (restore points, reserved capacity)?
- Who initiated the action (tenant admin vs end user), and from **where** (admin center vs user portal)?

## 2) Environment & configuration (tenant + Cloud PC setup)

- Is the tenant using **Windows 365 Enterprise** and is **DR Plus enabled** for the affected users/devices?
- Which **User Settings** profile is applied to the impacted users, and is **Enable additional DR** set to **DR Plus**?
- What **network type** is used for these Cloud PCs?
  - **Microsoft-hosted network**, or
  - **Azure Network Connection (ANC)**?
- If using **ANC**: is there a **working ANC in the backup/alternate region** that can support restored Cloud PCs?
- What **backup geography/region** is configured for DR Plus? Any **data sovereignty** constraints that influenced this choice?
- Are all affected users in the **same group assignment** for the User Settings profile?
- How long ago was DR Plus configured for these users — has the **initial backup window** completed?

## 3) Activation / deactivation workflow details (what exactly happened?)

- What exact action did you run: **Activate DR Plus** or **Deactivate DR Plus**?
- Was the action performed via **bulk device actions**? If yes:
  - Was it targeted to **specific devices** or **all users in a group**?
  - Roughly how many devices were included?
- When did you start the action, and what is the **current state** (in progress / completed / failed)?
- Are users **unable to access** the temporary Cloud PCs until the move completes (i.e., stuck in transition)?
- If deactivating: approximately how long has it been since deactivation started, and are users still on the temporary device?

## 4) User experience / symptoms (what is the customer seeing?)

- What is the **user's exact symptom**?
  - Can't connect at all?
  - Connects but lands on an unexpected device/region?
  - Performance/latency complaints after failover?
  - Confusion about temporary device warning message?
- Do users see any **warning/banner** indicating they're on a **temporary DR Plus device**?
- Are users trying to connect via **Windows App / Remote Desktop client** or the **web portal**?
- Does the issue happen for **all users** in the configured scope, or only a subset?

## 5) Scope, impact & severity (how bad is it?)

- How many **users/devices** are impacted (approx.)?
- Is this impacting **business-critical** workflows? Any deadlines or compliance implications?
- What's the customer's required **RTO/RPO expectation**, and is this an outage scenario with strict recovery timing?
- Are users blocked from their **primary Cloud PCs** (can't access) while the DR Plus device is active?

## 6) Reproducibility & timing (can we isolate a pattern?)

- Is the problem **100% reproducible**? If not, what's the pattern (specific users, groups, regions, device types)?
- Did this start after:
  - enabling DR Plus,
  - changing User Settings,
  - changing network type/ANC,
  - or running activation/deactivation?
- How long after configuration did you test? (Important if initial backups weren't complete yet.)
- Does the issue occur for **newly provisioned** Cloud PCs vs **existing** ones?

## 7) Recent changes (what changed right before it broke?)

- Any recent changes to:
  - **User Settings** (PITR settings, DR Plus toggle, assignments)?
  - **ANC** (routing/DNS/firewall/proxy/VNet changes, region changes)?
  - **Groups** (membership changes affecting assignments)?
  - **Tenant policies** impacting Windows 365 provisioning or connectivity?
- Any recent **region/geography** changes for provisioning or DR backup location?

## 8) Data & expectations check (avoid surprises / confirm behavior)

- Are users aware that the **temporary DR Plus Cloud PC is not permanent**?
- Did users save any data locally on the temporary device expecting it to sync back to primary?
- Is the customer expecting **applications/settings/data changes** made on the temporary device to persist after deactivation?

## 9) Evidence to collect (fastest way to prove config vs service issue)

- From **Reports > Cloud PC overview** (optional BCDR/DR status):
  - Do the impacted devices show **Configured vs Activated** correctly?
  - Is there a **restore point timestamp** present for each impacted device?
  - Does the report indicate any **health** concerns?
- Can you share:
  - screenshots of the **Bulk action** configuration (selected OS/device type/action),
  - screenshots of the **status report** entries for an impacted device,
  - and the **exact time** the action was initiated?
- If available internally: do you have the **TenantID** and any telemetry showing the applied **User Settings** used for DR Plus?

## 10) Troubleshooting alignment (separating product vs configuration quickly)

- Have you validated the **User Settings** object is correctly applied to the affected users/devices (and not conflicting with another User Settings assignment)?
- If using **ANC**, have you validated the alternate region network is fully ready to host restored Cloud PCs (connectivity prerequisites met)?
- Are you seeing symptoms consistent with:
  - **configuration not applied**,
  - **restore point not available**,
  - **activation stuck/in progress**,
  - or **regional service impact**?

## 11) Workarounds / mitigations (what can the customer do right now?)

- Is the immediate goal to **restore user productivity** (even with reduced experience), or to keep the primary region?
- Can you temporarily scope activation to a **smaller pilot set** to validate success before broad activation?
- If this is a testing scenario: can you run activation/deactivation against **multiple test devices** to validate end-to-end readiness?
- If user-initiated action is involved: are users attempting activation/deactivation via the **supported portal path** for their scenario?

## Quick next-step signals

- **Likely configuration/assignment issue** if only a subset is impacted, or if affected users share a specific group/User Settings profile.
- **Likely ANC readiness issue** if the failure correlates with ANC tenants/regions or alternate-region networking dependencies.
- **Likely timing/readiness issue** if DR Plus was enabled recently and backups/restore points aren't present yet.
- **Potential service issue** if multiple tenants/users are stuck during activation/deactivation in the same timeframe/region.
