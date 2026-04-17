---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Microsoft Entra Domain Services/Microsoft Entra Domain Services - Sync Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FMicrosoft%20Entra%20Domain%20Services%2FMicrosoft%20Entra%20Domain%20Services%20-%20Sync%20Troubleshooting"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# AADDS Sync Troubleshooting

## Prerequisites

Verify networking meets all requirements per [Network planning for MEDS](https://learn.microsoft.com/en-us/entra/identity/domain-services/network-considerations#network-security-groups-and-required-ports). Improper NSG/port config will cause sync failures.

## Identify Tenant Details

Provide one of: (a) Entra Tenant ID, or (b) MEDS Domain Name.

Use Jarvis Query: https://jarvis-west.dc.ad.msft.net/C6148125 to verify tenant details and get `ClientSubscriptionID` and `env_cloud_deploymentUnit`.

- `dcaasarm-prod-su1` or `dcaasarm-tip-su-1` → ARM deployment → [ARM Sync Troubleshooting](#arm-sync)
- `dcaas-prod-su-1` or `dcaas-tip-su-1` → Classic deployment → Classic Sync TSG

## ARM Deployment Sync Troubleshooting

### 1. Check Azure Support Center

Using `ClientSubscriptionID`:
1. ASC Resource Explorer → correct subscription → View = Resource Provider → Microsoft.AAD\DomainServices
2. Review: "Running Status", Sync V2 enabled, health status of each DC VM.
3. Check "Sync Health Status" link: last sync timestamp, quarantine status.
4. Check "Health" tab for active MEDS health alerts.

### 2. Check Sync Health via Jarvis

1. Run query: https://jarvis-west.dc.ad.msft.net/3D36785F
2. Update time frame (use "Now" button).
3. Update ContextId/Tenant ID filter.
4. Review results using below interpretation.

### Understanding InvalidReason Error Codes

| Error Code | Meaning |
|--|--|
| `Missing91ServicePrincipal` | Customer deleted the sync Service Principal |
| `FirstPartyServicePrincipalMisconfigured` | Customer deleted 1st Party SP + Password-Sync SP/Application |
| `FirstPartyServicePrincipalDisabledOrNotFound` | Customer deleted the 1st Party SP |
| `IpAddressNotInPrivateRange` | MEDS deployed with invalid subnet IP (not private range) — must delete and recreate |
| `NetworkError` | NSG/Route rule blocking PowerShell access to DCs from PaaS roles |
| `NoOutboundInternetAccess` | NSG/Route rule blocking outbound internet traffic from DC |
| `Inbound443Blocked` | NSG/Route rule blocking inbound TCP 443 |

> If `InvalidReason` is **non-empty**: Guide customer to fix the specific issue. No further Jarvis investigation needed.
> If `InvalidReason` is **empty**: Proceed to evaluator failure analysis below.

### Understanding Sync Evaluator Logs

#### ProvisioningAgentEvaluator
If failing → Sync Agent in DC is **unhealthy** (MEDS infrastructure issue). File ICM against MEDS team. No further customer troubleshooting needed.

#### LastSyncEvaluator
Check `resultDescription` field for details. Interpret in this priority order:

1. **`Quarantined: True`** → Sync is unhealthy. Contact AADDS team with evaluation + remediation stage findings.
2. **`SyncDisabledOrStopped: True`** → Sync is disabled. File ICM against MEDS team.
3. **`SyncStalled: True`** → Sync hasn't occurred for 6+ hours. Informational.
4. **`HasReachedSteadyState: False`** → Initial sync not complete yet. Inform customer to wait. Use `NumObjects` field to show progress.

#### AADObjectSyncEvaluator
If failing and customer reports specific users/groups not syncing → escalate to MEDS team.

## Troubleshooting Password Sync

Ask customer to change their password, then monitor: https://jarvis-west.dc.ad.msft.net/8F2A0B67 for 15-20 minutes. Contact AADDS team if errors appear or no relevant logs after 15-20 minutes.

## Sync Telemetry

User/group/computer count in DC: https://jarvis-west.dc.ad.msft.net/C6A76499

## Escalation

For confirmed valid sync issues on ARM deployment:
- Gather: tenant ID, client subscription ID, affected object ID(s).
- File ICM against MEDS team with Jarvis query links.
