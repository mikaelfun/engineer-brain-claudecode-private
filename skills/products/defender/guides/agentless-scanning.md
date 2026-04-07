# DEFENDER 无代理扫描 — Troubleshooting Quick Reference

**Entries**: 14 | **21V**: 7/14 applicable
**Sources**: ado-wiki, mslearn | **Last updated**: 2026-04-07

> This topic has a fusion troubleshooting guide with complete workflow
> → [Full troubleshooting workflow](details/agentless-scanning.md)

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Agentless Scanning (MDFC) disk scan fails for VMs. ASC DiskScan Failures diagnostic tool shows fa... | Various per failure category: disk SKU not supported for agentless scanning, invalid disk referen... | Use ASC Tenant Explorer > Defender for Cloud > DiskScan failures tab. Enter Subscription ID + Res... | 🟢 8.5 | ADO Wiki |
| 2 | Agentless Scanning DiskScan fails with UnsupportedUnmanagedDisk or UnsupportedDiskSku - VM uses u... | The VM uses unmanaged disks or an unsupported disk SKU type. Agentless scanning only supports man... | Migrate the VM to use managed disks if using unmanaged disks. Check the disk SKU type against sup... | 🔵 7.0 | ADO Wiki |
| 3 | Customer enabled FIM Agentless but cannot see any events at all in Log Analytics workspace | Multiple possible causes: (1) Missing prerequisites - P2 not enabled, agentless scanning not enab... | 1) Validate prerequisites via Kusto: query ascentitystorflreprdus MDCGlobalData.Environments to c... | 🔵 7.0 | ADO Wiki |
| 4 | Customer can see some FIM Agentless events but not all expected file changes are tracked | Disk scanning mount or scan may have failed for the machine. Agentless FIM relies on 24-hour cade... | Run DiskScanningWorkerOperations Kusto query to verify MountSucceed and Scanned for the machine o... | 🔵 7.0 | ADO Wiki |
| 5 | No agentless scan results for GCP VMs within 24 hours after connecting GCP project to Defender fo... | GCP organizational policy Compute Storage resource use restrictions (Compute Engine disks, images... | Navigate to GCP IAM and Admin > Organization Policies, find Compute Storage resource use restrict... | 🔵 6.0 | MS Learn |
| 6 | Windows-based AKS nodes do not show container image VA results from Defender for Cloud disk scan. | Windows-based nodes do not store container images on disk. Disk Scan Platform scans VM/VMSS disk ... | Known limitation. Windows node images not scanned by disk scan. Use registry-based scanning (ACR/... | 🔵 5.5 | ADO Wiki |
| 7 | AKS cluster using ephemeral OS disk shows no container image VA results from disk scan. | Ephemeral OS property prevents Disk Scan Platform visibility into images on disk. Ephemeral disks... | Known limitation. Use registry-based scanning (ACR/ECR/GAR) for images on ephemeral OS nodes. | 🔵 5.5 | ADO Wiki |
| 8 | Auto-scaled AKS cluster shows partial or no container image VA results from disk scan. | Disk scan runs once every 24h. Auto-scale nodes may be down at scan time, resulting in partial/mi... | Ensure nodes are running during scan window. Use registry-based scanning for complete coverage. C... | 🔵 5.5 | ADO Wiki |
| 9 | Vulnerability Assessment scan results are not appearing or are delayed for existing Azure VMs wit... | Agentless scanning is triggered every 24 hours at subscription level. Results need processing by ... | Set correct expectations: Agentless results appear within 1.5-25.5 hours. Agent-based Azure (with... | 🔵 5.5 | ADO Wiki |
| 10 | New VMs created in an already onboarded environment do not show VA agentless scan results, or res... | Agentless scanning for new VMs has a limitation of 20 VMs per subscription per day. If the number... | Inform customer of the 20 VMs/subscription/day limit for agentless new VM scanning. If customer h... | 🔵 5.5 | ADO Wiki |
| 11 | Agentless VM scan job fails with NoPermissionForCustomerKeyVaultRBAC error. VM appears as 'Not Ap... | MDC agentless scanner lacks the required RBAC permissions on the customer Key Vault that holds th... | Follow the CMK encrypted disk wiki guide to grant proper RBAC permissions on Key Vault. After gra... | 🔵 5.5 | ADO Wiki |
| 12 | GKE Standard Cluster instances not appearing in agentless scanning results in Defender for Cloud | Google Kubernetes Engine (GKE) Standard Clusters create regular Compute Instances for their nodes... | This is a known limitation. GKE Standard Cluster node instances are not supported for agentless s... | 🟡 4.0 | ADO Wiki |
| 13 | GCP VM with Customer-Supplied Encryption Key (CSEK) not scanned by Defender for Cloud agentless s... | Agentless disk scanning only supports Google-managed encryption keys and Customer-Managed Encrypt... | This is a known limitation. If agentless scanning coverage is required, switch the VM disk encryp... | 🟡 4.0 | ADO Wiki |
| 14 | GCP VM not appearing in agentless scanning results despite agentless scanning being enabled | The VM does not meet agentless scanning eligibility requirements: (1) instance must be in Running... | Verify the GCP VM meets all eligibility requirements: ensure instance is Running, has at most 8 a... | 🟡 4.0 | ADO Wiki |

## Quick Troubleshooting Path

1. Use ASC Tenant Explorer > Defender for Cloud > DiskScan failures tab. Enter Subscription ID + Resource ID and click Run. Match FailedReason to category: UnsupportedDiskSku/InvalidDiskReference -> v... `[Source: ADO Wiki]`
2. Migrate the VM to use managed disks if using unmanaged disks. Check the disk SKU type against supported types. Other common DiskScan failure categories include: TotalDiskSizeExceeded (combined disk... `[Source: ADO Wiki]`
3. 1) Validate prerequisites via Kusto: query ascentitystorflreprdus MDCGlobalData.Environments to check isP2Enabled, isFIMEnabled, isAgentlessVmScanningEnabled, FIMDetectionType. If FIMDetectionType=... `[Source: ADO Wiki]`
4. Run DiskScanningWorkerOperations Kusto query to verify MountSucceed and Scanned for the machine on day before/of/after the event. If disk scanning issue, transfer to MDC Guardians - Disk Scanning T... `[Source: ADO Wiki]`
5. Navigate to GCP IAM and Admin > Organization Policies, find Compute Storage resource use restrictions policy, change policy type to Allow, add under:organizations/517615557103 to allowlist, and sav... `[Source: MS Learn]`
