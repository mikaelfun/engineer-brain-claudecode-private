---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for Servers/Just In Time (JIT)/[Product Knowledge] - Just In Time (JIT)"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FWorkload%20Protections%2FDefender%20for%20Servers%2FJust%20In%20Time%20(JIT)%2F%5BProduct%20Knowledge%5D%20-%20Just%20In%20Time%20(JIT)"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# JIT (Just In Time) VM Access - Product Knowledge

## JIT Overview

Just in time virtual machine (JIT VM) network access is part of the Advanced Cloud Defense offered by Microsoft Defender for Cloud.

- [Official documentation](https://aka.ms/asc-jit)

## Relevant/Underlying Features

JIT depends on:
- **Network resources**: NSGs (Network Security Groups), NICs (Network Interfaces)
- **RBAC** (Role-Based Access Control)

**Exposed via 3 interfaces:** Azure Portal (UI), PowerShell Cmdlet, REST API

## Block JIT from All IP Addresses

Use Azure Policy to block JIT requests where source is set to All IP addresses:
1. Create a new Policy definition
2. Add policy rule that denies NSG security rules with priority 100, inbound allow, and source `*`/`Internet`/`0.0.0.0/0`/`ANY`
3. Assign the policy to the target scope

## Creating Custom Roles for JIT

For least-privileged JIT access (e.g., external users/vendors):

**PowerShell/API only:**
```json
{
    "Actions": [
        "Microsoft.Security/locations/jitNetworkAccessPolicies/initiate/action",
        "Microsoft.Security/locations/jitNetworkAccessPolicies/*/read",
        "Microsoft.Compute/virtualMachines/read",
        "Microsoft.Network/networkInterfaces/*/read"
    ]
}
```

**Portal access requires additional actions:**
```json
"Microsoft.Security/locations/jitNetworkAccessPolicies/read",
"Microsoft.Security/locations/jitNetworkAccessPolicies/initiate/action",
"Microsoft.Compute/virtualMachines/read",
"Microsoft.Security/pricings/read",
"Microsoft.Security/policies/read",
"Microsoft.Network/*/read"
```

Create with: `New-AzRoleDefinition -InputFile <path to template>`

## JIT Cleaner Tool TSG

The cleaner iterates over all NSGs in the subscription, finding JIT Security rules (prefix `SecurityCenter-JITRule`).

**Kusto query for cleaner traces:**
```kql
cluster('romelogs.kusto.windows.net').database("Rome3Prod").FabricTraceEvent
| where env_time > ago(12d)
| where message contains "{subscriptionId}"
| where message has "JitNetworkAccessOrphanedRulesCleaner"
| project env_time, message, traceLevel, env_cloud_location
| order by env_time asc
```

**Rule removal reasons:**
| Trace | Action | Reason |
|-------|--------|--------|
| Malformed: Unknown naming format | Skipped | Rule name doesn't match JIT conventions |
| Malformed: invalid format/no valid description | Skipped | Rule properties don't match JIT |
| Same definitions with higher priority exists | **Removed** | Duplicate rule (possible bug) |
| No VMs found with IP | Skipped | Cannot match rule to VM |
| VM name mismatch with destination IP | **Removed** | VM name in description != VM with destination IP |
| Cannot find VM in any policies | Skipped | VM not in policy (may be different region) |
| Port ID not found in policy | **Removed** | Port not in JIT policy definitions |
| Well-defined JIT rule | Skipped | Rule is valid |

## Known Limitations & Requirements

### VM must meet these conditions to be "Recommended":
1. ARM VM (classic not supported)
2. NIC with NSG attached (directly or via subnet)
3. OS must be Linux or Windows
4. Not already JIT configured

### Conditions for JIT Operations:
- **Configure VM**: Needs `Microsoft.Security/locations/jitNetworkAccessPolicies/write` + write on VM
- **Request access**: Needs `Microsoft.Security/locations/jitNetworkAccessPolicies/initiate/action` + write on VM

### NSG Security Rules:
- **Deny rules** by JIT: priority >= 1000
- **Allow rules** by JIT: priority 100-999
- JIT configuration may shift existing rule priorities to avoid conflicts
