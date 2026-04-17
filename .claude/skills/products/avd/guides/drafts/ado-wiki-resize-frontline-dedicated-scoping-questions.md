---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Cloud PC Actions/Resize/Resize Frontline Dedicated Mode/Scoping Questions"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FFeatures%2FCloud%20PC%20Actions%2FResize%2FResize%20Frontline%20Dedicated%20Mode%2FScoping%20Questions"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Resize Frontline Dedicated Mode - Scoping Questions

## 1. Environment & Configuration

- Is this **Windows 365 Frontline** using **Dedicated mode**?
- How is the Cloud PC licensed: **Direct assignment or GroupBased Licensing (GBL)**?
- What is the **current SKU** and the **target SKU** you are attempting to resize to?
- Is the Cloud PC **Gen 2**? (Gen 1 Cloud PCs are not supported for resize.)
- What is the **current provisioning state** of the Cloud PC before the resize attempt?
- Is the resize being performed on a **single Cloud PC**, or **multiple Cloud PCs via group assignment**?
- Are there enough **available Frontline licenses** to support the target SKU?

## 2. User Scenario / UX

- From the admin perspective, **what exactly fails** during the resize experience?
- Does the admin see the resize **start, fail immediately, or fail midprocess**?
- Can the user still **sign in to the original Cloud PC**?
- Is the Cloud PC **stuck, inaccessible, or degraded** after the resize attempt?
- Is this affecting **shift workers actively using the Cloud PC**, or during an off-shift window?

## 3. Scope & Impact

- How many users / Cloud PCs are impacted?
- Is the issue blocking business operations or causing downtime for frontline workers?
- Is the impact **isolated to a specific group**, license assignment, or region?
- Has this resize scenario **worked successfully in the past** for this tenant?

## 4. Reproducibility

- Does the issue reproduce **consistently** when retrying the resize?
- Does it occur with the **same target SKU** or different SKUs?
- If multiple Cloud PCs are resized, do **all fail or only specific ones**?

## 5. Recent Changes

- License reassignment or SKU changes?
- Group membership updates?
- New Cloud PC provisioning?
- Was the Cloud PC **recently reprovisioned or restored**?
- Has this tenant recently transitioned to **Resize V2 behavior**?

## 6. Resize Execution & State Validation

- What is the **resize job status** shown in Microsoft Endpoint Manager?
- Does the resize progress beyond VM shutdown / Snapshot creation / New VM creation?
- Does the Cloud PC return to **Provisioned** state after the attempt?

## 7. Errors, Logs & Evidence

- Are there **error codes or failure categories** shown in the resize action?
- Does the failure indicate capacity issues, invalid disk size (downsize), or VM agent/extension failures?
- Collect: Resize action timestamps, Cloud PC name / Device ID, screenshots

## 8. Workarounds & Mitigations

- Have you attempted a **single retry** of the resize operation?
- If using GBL, validate **license assignment state** before retrying
- Does reprovisioning the Cloud PC resolve the issue?
- Test resizing a **different Cloud PC** in the same tenant

## 9. Validation & Next Steps (CSS Internal)

- Is this consistent with **known resize limitations** (Gen 1, disk downsize, license conflicts)?
- Configuration/sequencing issue vs capacity-related failure vs potential backend resize bug?
- Next steps: Retry after validation, License/assignment correction, or Escalation with resize job evidence
