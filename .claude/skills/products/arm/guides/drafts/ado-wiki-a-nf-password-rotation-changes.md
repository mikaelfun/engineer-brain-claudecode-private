---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Nexus/Readiness/Technical Overview of Network Fabric Password Rotation Changes"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Nexus%2FReadiness%2FTechnical%20Overview%20of%20Network%20Fabric%20Password%20Rotation%20Changes"
importDate: "2026-04-06"
type: troubleshooting-guide
---

## Introduction

Technical summary of password rotation changes in Network Fabric. Password rotation is now customer-driven via a public-facing API, replacing the previous Geneva action-based process.

## Key Changes
- **Policy Shift**: Customer-driven via public API, replaces Geneva action-based process
- **Unified Rotation**: Terminal server and device passwords rotated together
- **Resilience**: Tolerant of partial failures; failed devices retain old passwords and can be resynced

## Architecture and Components
- **Network Fabric**: Terminal server + ~20 devices with shared user passwords
- **Authentication**: Passwords stored in NFC Key Vault with unique, non-predictable secret names
- **APIs/Tools**:
  - ARM API: New endpoints for password rotation and resync
  - Azure CLI: `az networkfabric fabric rotate-password`
  - Geneva Actions: Updated to call ARM API

## Prerequisites
- Azure CLI with Managed Network Fabric extension
- Sufficient permissions (no elevated access required for customers)
- Fabric must be on or migrated to API version 2025-07-15

## Password Rotation Workflow

### Initiate Rotation
```bash
az networkfabric fabric rotate-password --resource-id <fabric_resource_id>
```

### Process Flow
1. Fabric enters "maintenance" state
2. New passwords generated and pushed to terminal server and devices
3. Status transitions: Out of Sync → Synchronizing → In Sync
4. Two-phase update: Non-admin users first, then admin user

### Error Handling
- Devices failing to update remain Out of Sync, using old passwords
- Resync via API/CLI for failed devices:
```bash
az networkfabric device resync-password --resource-id <device_resource_id>
```
- Error messages provide actionable next steps

## Migration for Existing Fabrics
- Fabrics deployed before release 9.2 require migration by running password rotation once
- Migration renames secrets and updates API fields
- Post-migration, only new API/actions supported

## Common Issues
- **Connectivity Failures**: Most common cause for rotation errors; built-in retry logic mitigates transient issues
- **Upgrade Blocked**: Fabric upgrades blocked if any device passwords are Out of Sync
- **Lockbox Requirement**: Geneva actions for resync require lockbox approval (operate in customer environment)

## Best Practices
- Automate password rotation reminders using ARM properties (last rotation time)
- Always attempt resync before opening support cases
- Monitor administrative state and synchronization status during rotation
