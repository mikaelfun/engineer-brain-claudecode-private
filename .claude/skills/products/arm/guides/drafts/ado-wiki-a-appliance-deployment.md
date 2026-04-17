---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Labs for ALDO CSS/Single Node/Appliance Deployment"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Disconnected%20Operations%2FLabs%20for%20ALDO%20CSS%2FSingle%20Node%2FAppliance%20Deployment"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# ALDO Single Node Appliance Deployment (CSS Lab)

## Overview

This guide covers deploying a single node Azure Local disconnected operations environment in the AL CSS lab. Currently 14 nodes are available and should be reserved via the [Reservation System](https://microsoft.sharepoint.com/teams/AzureStackCSSTeams/SitePages/CSS-Labs-Reservation.aspx).

## Deployment Sequence

1. Baremetal Deployment
2. VM Deployment (virtual)
3. DC Preparation
4. Azure Local Node Preparation
5. **Appliance Deployment** (this guide)
6. Azure Local Deployment
7. Post Steps and Cleanup

## Appliance Deployment Steps

> **Important**: Scripts must be run in order (starting with 2A). Each section must complete without error. Passwords and group identifiers from AD User creation (DC Preparation step) are required as inputs.

### Step 2A-2C: Initial Setup
Run from the SeedNode VM (`vHCI01-S1-N01`):
- Steps 2A through 2C are template-based scripts for initial configuration

### Step 2D: Observability Configuration
- If observability is to be used, update parameters in section 2D
- Uncomment `ObservabilityConfiguration` in `$installParams`
- Requires manually setting `SyncGroupIdentifier` from the DC Preparation step output

### Step 2E: Final Setup
- Complete remaining configuration from SeedNode VM

### Post-Appliance Steps

**Copy RootCert to HCI nodes:**
- Run from DC VM (`vHCI01-DC`)

**Setup Context and backup Bitlocker Recovery Keys:**
- Run from SeedNode VM (`vHCI01-S1-N01`)

**Setup Azure CLI and point to AzureLocal:**
- Run on ALL Azure Local Nodes (`vHCI01-s1-n0[1-3]`)

**Register Required Resource Providers:**
- Run from SeedNode VM (`vHCI01-S1-N01`)

**Run ArcInitialization on HCI Nodes:**
- Run on ALL HCI Nodes (`vHCI01-s1-n0[1-3]`)

> **Note**: When prompted, perform device activation for all 3 nodes from the DC VM, using `operator@vhci01.lab` credentials and the device code provided from the powershell script. Once activated, the process will continue and you can proceed to Azure Local Deployment.

## Next Steps
After Appliance Deployment → proceed to Azure Local Deployment step.
