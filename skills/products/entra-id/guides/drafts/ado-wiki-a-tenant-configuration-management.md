---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD Tenant and Domain Management/Tenant Governance/Tenant Configuration Management"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20Tenant%20and%20Domain%20Management%2FTenant%20Governance%2FTenant%20Configuration%20Management"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Tenant Configuration Management (TCM) - TSG

## Summary

Tenant Configuration Management (TCM) provides centralized visibility into configuration state across Microsoft cloud workloads. Located in Entra Admin Center under **Tenant Governance**. Focuses on monitoring and diagnostics, NOT configuration authoring or enforcement.

> **Note**: TCM is the customer-facing name. The underlying Graph APIs and service principal use "Unified Tenant Configuration Management (UTCM)".

## Supported Workloads
- Microsoft Entra ID
- Exchange Online
- Microsoft Intune
- Microsoft Purview
- Microsoft Defender settings
- Microsoft Teams

## Portal Experience

### Monitors Tab
- Displays configuration monitor definitions
- Each monitor evaluates defined resources on a recurring schedule (multiple times/day)
- Tenant-level limit on number of monitors

### Creating a Monitor
1. Check **Permissions** tab (application permissions + Entra roles for UTCM service principal)
2. Set **Configuration baseline** (obtain via Graph snapshot API, paste JSON)
3. Create monitor

### Monitor Results Tab
- Shows execution history per monitor run (start/end time, success/failure, drift count)
- Click "Drifts Detected" value to go to Configuration drifts tab
- Results grow lengthy (runs every 6 hours), use "Load more"

### Configuration Drifts Tab
- Shows actual configuration differences: resource type, resource name, drifted property, desired vs current value, first detection time
- Visibility only - no automatic remediation

### Snapshot Evaluation
- No portal UX for snapshots (API-only via Graph)
- Snapshots run asynchronously, retained 7 days
- Used internally during monitor execution

## Authorization Models
Two models depending on workload:

### Application Permissions Model
- Standard Microsoft Graph application permissions
- Granted via Entra Admin Center > App Registrations > UTCM app
- Used for workloads with granular Graph permissions (e.g., User.Read.All)

### Entra Roles Model
- Required for workloads without granular Graph permissions
- Assigned via Entra Admin Center > Roles and Administrators
- UTCM service principal needs specific roles per workload

## Troubleshooting

### Common Issues
1. **Monitor/snapshot jobs fail**: Usually missing application permission or role assignment. Check Configuration management permissions blade.
2. **No drifts detected**: Verify baseline JSON matches expected resource format. Re-create snapshot and compare.
3. **Permissions tab empty**: UTCM service principal may not be provisioned. Check Enterprise Applications.

### Key Diagnostic Steps
1. Check UTCM service principal exists in tenant Enterprise Applications
2. Verify application permissions via Configuration management permissions blade
3. Check Entra role assignments for UTCM service principal
4. Review Monitor Results for error messages
5. Use Graph API to manually create/retrieve snapshots for comparison
