---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Support Processes and Guidance/ICM process & templates/Cloud PC recovery for passive deletion/Scoping Questions"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Support%20Processes%20and%20Guidance/ICM%20process%20%26%20templates/Cloud%20PC%20recovery%20for%20passive%20deletion/Scoping%20Questions"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Scoping Questions - Cloud PC Recovery for Passive Deletion

## 1. Environment & Configuration
- Windows 365 Enterprise scenario?
- Passively deprovisioned (license expiration) vs actively deprovisioned (admin action)?
- Same SKU license repurchased and reassigned?
- User still exists in Entra ID?
- User in Entra ID groups for original provisioning policy?
- Original provisioning policy still exists and assigned?
- Recovery within 28-day window?

## 2. User / Admin Scenario
- Goal: restore previous Cloud PC state or provision new?
- Following Restore device / snapshot recovery flow?
- Expecting data recovery from latest snapshot?
- Admin received license expiration/deprovision notification emails?

## 3. Scope & Impact
- Number of affected Cloud PCs?
- Production users or business-critical workloads?
- Users currently blocked from access?
- Single user or bulk recovery?

## 4. Reproducibility
- Reproducible for multiple users?
- Recovery failure every attempt?
- Snapshots consistently missing/failing?

## 5. Recent Changes
- Recent license removal/expiration/SKU change?
- Recent Entra ID group membership changes?
- Provisioning policy modified/deleted/reassigned?
- Started after tenant-wide license cleanup?

## 6. Logs, Evidence & Technical Data
- Current Cloud PC status in Intune?
- Device snapshots visible in Restore action?
- Timestamp of last available snapshot?
- Errors in Intune during restore?

## 7. Workarounds / Mitigations
- Attempted new Cloud PC provisioning after license reinstatement?
- All prerequisites confirmed before retry?

## 8. Product vs Configuration Validation
- All documented prerequisites met?
- Failure due to missing prerequisites, expired window, or no valid snapshots?
- Expected limitation (outside 28-day window or active deletion)?
- All requirements met but still fails → potential product issue for escalation?
