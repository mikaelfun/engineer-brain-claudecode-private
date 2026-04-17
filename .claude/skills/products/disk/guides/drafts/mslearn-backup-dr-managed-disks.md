# Backup & Disaster Recovery for Azure Managed Disks

> Source: https://learn.microsoft.com/azure/virtual-machines/backup-and-disaster-recovery-for-azure-iaas-disks
> Status: draft (mslearn extraction)

## Built-in Redundancy

| Type | Protection | Limitation |
|------|-----------|------------|
| LRS | 3 replicas in single data center | No zone/region protection |
| ZRS | Sync replication across zones | No region-level protection |

## Solution Comparison

| Feature | Snapshot | Restore Points | Azure Backup | Azure Site Recovery |
|---------|----------|---------------|-------------|-------------------|
| Incremental | Yes | Yes | Yes | Yes |
| Cross-Region | Yes | Preview | Yes | Yes |
| Maintenance | High | Medium | Low | Low |
| App-Consistent | Manual (fsfreeze/VSS) | Yes (Windows) | Yes | Yes |
| Best For | Cost-effective disk backup | Multi-disk VM backup | Managed backup solution | Full BCDR |

## Snapshots

- **Incremental snapshots** recommended (lower cost, faster recovery)
- First snapshot = full copy; subsequent = changes only
- Cross-region copy: use managed copy (Azure orchestrated) or manual copy
- Restrictions: max 100 parallel cross-region copies per sub; must copy in creation order

### Consistency Concerns (Running VM)
1. Snapshots may contain partial in-flight operations
2. Multi-disk snapshots may occur at different times
3. For striped volumes → coordinate: freeze disks → flush writes → snapshot all

### Coordination Tools
- **Windows**: Volume Shadow Service (VSS) for app-consistent
- **Linux**: `fsfreeze` for file-consistent

## Restore Points

- VM-level resource: captures config + all attached disk snapshots
- 3-level hierarchy: Collection → VM Restore Point → Disk Restore Points
- Incremental (first = full, successive = delta)
- Cross-region copy supported

## Azure Backup

- Fully managed, agent-less
- Supports up to 32 TiB disk size
- Azure Disk Backup: crash-consistent, multiple backups/day
- Azure VM Backup: app-consistent, full VM restore capability
- Integrated into Backup Center

## Azure Site Recovery

- Continuous replication to secondary region
- Supports Azure-to-Azure, VMware, Physical, Hyper-V
- Orchestrated failover/failback

## Common DR Scenarios

| Scenario | Recommended Approach |
|----------|---------------------|
| Production DB (SQL/Oracle) | Always On AG + cross-region replica |
| Redundant VM cluster | Spread across regions or periodic backup |
| Standard IaaS workload | Regular Azure Backup (frequency based on data change rate) |
| Data corruption/ransomware | Point-in-time restore from incremental snapshots |
