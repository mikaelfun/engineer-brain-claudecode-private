# Azure Shared Disk Limitations Quick Reference

**Source**: https://learn.microsoft.com/azure/virtual-machines/disks-shared-enable

## Supported Disk Types
- Ultra Disk, Premium SSD v2, Premium SSD, Standard SSD only
- HDD not supported

## General Limitations (All Types)
- Host caching NOT supported (maxShares > 1)
- Write accelerator NOT supported
- Cannot expand disk while attached — deallocate all VMs or detach first
- Azure Disk Encryption (ADE/BitLocker/DM-Crypt) NOT supported → use SSE
- Cannot be defined in VMSS models for auto-deploy
- maxShares can only be changed when disk detached from all VMs

## Per-Type Limitations

### Premium SSD
- Data disks only (not OS disks)
- Disk bursting NOT available (maxShares > 1)
- maxShares: P1-P20=3, P30-P50=5, P60-P80=10
- Cross-AZ only with ZRS

### Standard SSD
- Data disks only (not OS disks)
- maxShares: E1-E20=3, E30-E50=5, E60-E80=10
- Cross-AZ only with ZRS

### Ultra Disk / Premium SSD v2
- maxShares: 1-15 (no size restrictions)
- Cannot share across availability zones
- Extra throttles: 4 total (Read IOPS/BW + Write IOPS/BW)

## SCSI PR Commands
Available: PR_REGISTER_KEY, PR_REGISTER_AND_IGNORE, PR_GET_CONFIGURATION,
PR_RESERVE, PR_PREEMPT_RESERVATION, PR_CLEAR_RESERVATION, PR_RELEASE_RESERVATION

## Deployment
```bash
# CLI
az disk create -g myRG -n mySharedDisk --size-gb 1024 --sku Premium_LRS --max-shares 2

# Update existing
az disk update --name myDisk --max-shares 5 --resource-group myRG
```
