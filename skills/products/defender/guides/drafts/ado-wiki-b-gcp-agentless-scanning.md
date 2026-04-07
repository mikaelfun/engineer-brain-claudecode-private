---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for Servers/Vulnerability Assessment/Agentless scanning VM VA/Google Cloud Platform (GCP) Agentless scanning"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FWorkload%20Protections%2FDefender%20for%20Servers%2FVulnerability%20Assessment%2FAgentless%20scanning%20VM%20VA%2FGoogle%20Cloud%20Platform%20(GCP)%20Agentless%20scanning"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Google Cloud Platform (GCP) Agentless Disk Scanning

## What is GCP Agentless Disk Scanning

- Scans customers' instances without installing agents.
- Scan is triggered twice a day.
- Supported scanners: Vulnerability Assessment (VA), Secrets scanning.
- Onboarding via Security Connectors in: Defender CSPM or Servers plan.
- Machines can be excluded via exclusion labels (customized during onboarding).

## How It Works (Scanning Flow)

1. Discover Compute Instances from the customer GCP project.
2. Take a snapshot of all disks from discovered instances.
3. Initiate a new worker instance to scan customer disks.
4. Create new copy of disks from snapshots.
5. Attach disk copies to worker instance.
6. Worker scans disks and uploads results.
7. Results passed to: VA service, Secrets scanning.

## Worker Instance Boundaries

- Separate worker per customer (not per instance).
- Worker is region-scoped: data stays in-region.
- A worker may scan multiple instances from same customer.

## Encryption Support

| Type | Supported |
|------|-----------|
| Google-managed encryption key | Yes |
| Customer-managed encryption key (CMEK) | Yes |
| Customer-supplied encryption key (CSEK) | **No** |

## Permissions Required

Granted during onboarding script execution:

1. `compute.disks.createSnapshot` - via custom role `MDCAgentlessScanningRole`
2. `compute.instances.get` - via custom role `MDCAgentlessScanningRole`
3. `roles/cloudkms.cryptoKeyEncrypterDecrypter` - for CMEK support

Service accounts:
- Scanning: `mdc-agentless-scanning@guardians-prod-diskscanning.iam.gserviceaccount.com`
- Compute Engine: `service-220551266886@compute-system.iam.gserviceaccount.com`

## Limitations

- **Maximum disk count**: 8 disks per instance.
- **OS disk required**: Must be present and not corrupted for scan success.
- **Instance must be Running**.
- **GKE Standard Clusters**: Not supported for agentless scan (nodes identified by "gke" in name).
