---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Connect Sync/Migration of Entra Connect Sync To Cloud Sync"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FConnect%20Sync%2FMigration%20of%20Entra%20Connect%20Sync%20To%20Cloud%20Sync"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Migration of Entra Connect Sync To Cloud Sync

> CONFIDENTIAL - Internal only. Do not share with customers.

## Summary

Starting July 2026, Microsoft will begin migrating customers from Entra Connect Sync to Entra Cloud Sync in 5 phases/cohorts based on tenant size, feature usage, and complexity.

## What is Changing

During each cohort, customers must migrate to Cloud Sync. Advanced features will be retired from the Entra Connect Wizard at later stages as Cloud Sync gains parity:

- **Password Write Back (SSPR)** - Supported with Cloud Sync
- **Passthrough Authentication (PTA)** - Planned, no ETA
- **Device Write Back** - Planned, no ETA. Workaround: configure Hybrid Cloud Kerberos
- **Device Sync** - On roadmap for Cloud Sync
- **ADFS Configuration** - Must be configured outside Entra Connect Wizard
- **Ping Federate Configuration** - Third party configuration
- **Desktop SSO** - Planned, no ETA

## Migration Rollout Strategy (5 Cohorts)

| Phase | Criteria | Features |
|-------|----------|----------|
| Phase 1 | <2000 synced objects, basic features only | User & Group Sync, PHS, Domain Filtering, Hybrid Exchange, Group Filtering, OU <=30/domain |
| Phase 2 | <10000 objects | + Device Sync, Directory Extensions, Custom AD Connector Account, OU Filtering |
| Phase 3 | <150000 objects, complex configs | + Custom UPN, Custom Sync Rules |
| Phase 4 | >150000 objects, significant dependencies | + Custom Source Anchor/Join Criteria, Built-in App Filtering, Large Scale |
| Phase 5 | S500/High Value Customers | All Features |

## Migration Timeline (Subject to Change)

| Milestone | Date |
|-----------|------|
| Phase 1 Awareness Announcement | March 13, 2026 |
| Migration Tool Limited Preview | Est: March 30, 2026 |
| Cohort 1 Migration Begins | July 30, 2026 |
| Cohort 1 Deadline | January 30, 2027 |
| Cohort 2 Migration Begins | October 30, 2026 |
| Cohort 2 Deadline | April 30, 2027 |
| Cohort 3 Migration Begins | January 30, 2027 |
| Cohort 3 Deadline | June 30, 2027 |
| Cohort 4/5 | TBD |

## Key FAQ Points for Customer Responses

1. **No immediate action required** - Phase 1 is awareness only
2. **6-month migration window** per cohort, hard deadline enforced
3. **Migration tool** will be provided for eligible configurations
4. **Early migration encouraged** - customers can migrate before their cohort
5. **Cannot opt out** - exception process exists but rigorous
6. **Unsupported features** - customers can stay on Connect Sync until Cloud Sync gains parity
7. **Rollback available** within migration tool before cohort deadline

## Connect Sync vs Cloud Sync Comparison

| Feature | Connect Sync | Cloud Sync |
|---------|-------------|------------|
| Infrastructure | Dedicated Windows server | Lightweight agent on any domain-joined machine |
| Management | On-premises | Cloud-managed |
| HA | Manual failover | Multiple active agents, auto redundancy |
| Device Sync | Supported | Not yet (private preview FY26 Q4) |
| PTA | Supported | Not supported (use PHS) |
| Multi-Forest | Requires trusts | Natively supports disconnected forests |

## Escalation

Owning Service: TBD
Owning Team: TBD
