---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/SyncFabric/Outbound provisioning/Troubleshooting Identity Provisioning issues/Missing customer-facing audit events - Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FSyncFabric%2FOutbound%20provisioning%2FTroubleshooting%20Identity%20Provisioning%20issues%2FMissing%20customer-facing%20audit%20events%20-%20Troubleshooting"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# How to troubleshoot missing customer-facing audit events

SyncFabric emits audit logs as checkpoints for various operations for a change flowing through the service. For example, there are audit logs to mark that a change was imported from the source system, imported from the target system and then exported.

## IfxAuditEvent

Audit logs are emitted as Ifx events (event name `IfxAuditEvents`) to Geneva Logs, which are later ingested into Kusto. These logs have a property called `verbosityLevel`, which determines whether customers get to see this log:

- `InternalOnly` - not visible to customers
- `CustomerBrief` - short message visible to customers
- `CustomerDetailed` - detailed message visible to customers

Example Kusto query:

```kusto
cluster("idsharedwus").database("AADSFprod").GlobalIfxAuditEvent
| where verbosityLevel != "InternalOnly"
| take 1
```

## IfxAudit.ExtendedApplicationAudit

Customer-facing audit logs are also emitted as Geneva IfxAudit events (event name `AsmIfxAuditApp`). SyncFabric emits data via the IfxAudit SDK. The Audit Service Team reads data from this table and ingests it into their service, eventually rendering it in the Azure Portal for customers.

### Troubleshooting with DGrep

Access `AsmIfxAuditApp` table via DGrep. The data in this event is much closer to what the customer sees than `IfxAuditEvent`, making it useful for troubleshooting "customer is not seeing audit logs" issues.

While `AsmIfxAuditApp` doesn't have a direct `CorrelationId` field, the `EventPayload` field contains the SyncFabric correlation identifier, which can be used to narrow searches.

## References

- Geneva documentation on IfxAudit (Azure Auditing)
- STRIKE training: Monitor privilege activities on your application (counts towards security compliance)
