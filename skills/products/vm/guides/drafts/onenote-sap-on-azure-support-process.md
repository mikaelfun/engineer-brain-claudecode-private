# SAP on Azure VM Support Process (Mooncake)

## Support Topics
- `Azure/21Vianet Mooncake/21Vianet China Azure SAP on Azure VM`
- `Azure/Mooncake Support Escalation/Mooncake - VM PoD/SAP on Azure VM`

## Process for Mooncake Team
1. Update support topic if case is SAP-related but incorrectly categorized
2. CC v-team alias `mcsaponvm@microsoft.com` in all case email communications
3. Check CCFinder to identify who to loop in
4. Cases handled by dedicated V-Team members
5. Engage Linux SME Team when needed
6. Engage PG and notify field team if platform issues (e.g., maintenance) may impact VM cluster failover
7. Raise ICM for PG engagement when needed

## For ARR Team
- When receiving SAP cases, CC `mcsaponvm@microsoft.com` in communications

## Related Azure Products
- Azure VM, Azure Storage
- High Availability (Azure Fence Agent, Shared Disk, Azure File NFS)
- Azure Monitor, Azure Backup for SAP HANA
- Azure Site Recovery, Azure Networking

## N-Series / HPC Cases
- Premier cases: Transfer to HCLV team for pure HPC issues
- Professional cases (21V escalated): Hold main case, cut collaboration to HCLV team
- HCLV SAP: `Azure/High Performance Computing (HPC)/HPC VM (N or H series)`
- HCLV supports all plans and regions including Mooncake

## RCA Delivery
1. Engineer delivers high-level RCA (Kusto-based) to customer
2. If customer requires detailed PG RCA → raise ICM ticket
3. If suspected bug → raise ICM to PG
4. If frequent recurring issue → engage PG for further investigation
