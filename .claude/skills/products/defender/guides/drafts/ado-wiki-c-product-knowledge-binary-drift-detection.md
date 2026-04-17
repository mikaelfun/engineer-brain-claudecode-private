---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for Containers/Defender Sensor and PODs/[Product Knowledge] Binary drift detection"
sourceUrl: "https://dev.azure.com/ASIM-Security/08a9716f-c06d-418d-9916-e38023d36752/_wiki/wikis/805e0e78-f6b1-4ad5-ad26-6cb3aad9f60e?pagePath=%2FDefender%20for%20Cloud%2FWorkload%20Protections%2FDefender%20for%20Containers%2FDefender%20Sensor%20and%20PODs%2F%5BProduct%20Knowledge%5D%20Binary%20drift%20detection"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Product Knowledge: Binary Drift Detection (Defender for Containers)

## Overview

Binary Drift Detection identifies containers running external processes not included in the original image — indicating potential attacks or legitimate activities (e.g., debugging).

Integrated into Defender for Containers plan — no separate license required. Supports Azure, AWS, and GCP.

## Key Features

- **Drift Detection:** Identifies external processes running in containers that deviate from original image.
- **Policy Mechanism:** Users define conditions for when drift alerts are generated (reduces false positives, allows customization).
- **Multi-Cloud:** Azure, AWS, GCP.

## Known Issues and Considerations

### 1. Block Action Requires Sensor v0.10+

The UI allows users to define rules with "block" action, but **the sensor version must be 0.10 or greater** to support prevention. If the cluster runs an older sensor version, the block rule is **silently ignored** (detection still works).

**Fix:** Upgrade Defender Sensor to version 0.10 or later on the cluster.

### 2. Policy Mechanism Complexity

Prioritization and conditions for drift detection alerts may be confusing to users. Advise customers to review policy rule priority order.

### 3. Additional Permissions Required

The feature requires extra permissions beyond the default Defender for Containers setup. Ensure these are configured.

### 4. Alert Noise

Potential for excessive alerts. An opt-out model is under consideration. Advise customers to tune their policy rules to reduce noise.
