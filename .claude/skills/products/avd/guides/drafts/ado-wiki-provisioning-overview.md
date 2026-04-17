---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Cloud PC Actions/Provisioning/Provisioning Overview"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Cloud%20PC%20Actions/Provisioning/Provisioning%20Overview"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Provisioning Overview

## Provisioning Workflow
Assignment is a 3-tuple of (user Id, policy id, license type).

For a given user, policy change or license change may trigger different types of provision requests, according to the device's provisioning states.

## CPC Provisioning States

| State | Description |
|-------|-------------|
| `None` | No record in DB or deleted |
| `Licensed` | User is licensed but no policy assigned |
| `Provisioned` | Device is provisioned and available to use |
| `InGracePeriod Reprovision` | Provisioned but will be reprovisioned after grace period expiry |
| `InGracePeriod Deprovision` | Provisioned but will be deprovisioned after grace period expiry |
| `InGracePeriod Delete` | Provisioned but will be deleted after grace period expiry |
| `Pending` | Workspace will go to Provisioning State when quota is available |

## Equivalent States

| State | Meaning |
|-------|---------|
| `Deprovisioned` | Licensed, last state is Deprovisioning |
| `DeprovisionFailed` | Provisioned, last state is Deprovisioned, not consistent with License Policy |
| `Upgraded` | Provisioned, last state is Upgrading |
| `UpgradeFailed` | Provisioned, last state is Upgrading, not consistent with License Policy |
| `ProvisionFailed` | Licensed, last state is Provisioning, not consistent with License Policy |
| `ReprovisionFailed` | Provisioned, last two states are Reprovision and Provisioning, failed but consistent |
| `Restored` | Provisioned, last state is Restoring |
| `RestoreFailed` | Provisioned, last state is Restoring, failed but consistent |

## Transient States

| State | Transition |
|-------|-----------|
| `Provisioning` | Licensed → Provisioned |
| `Upgrading` | Provisioned → Provisioned (triggered by upgrade) |
| `Deprovisioning` | InGracePeriod Deprovision → Deprovisioned or InGracePeriod Delete → None |
| `Restoring` | Provisioned → Provisioned (triggered by restore) |

## Grace Period

| Scenario | Length |
|----------|--------|
| Grace Period for Reprovision | Enterprise(7d), VSB(1d) |
| Grace Period for Deprovision | Enterprise(7d), VSB(1d) |
| Grace Period for Delete | Enterprise(7d), VSB(1d) |
| Grace Period for Fraud Block | Enterprise(7d), VSB(3d if used, 1d never used) |
| Grace Period for Guard Rail | 15d (in don't touch list) |
