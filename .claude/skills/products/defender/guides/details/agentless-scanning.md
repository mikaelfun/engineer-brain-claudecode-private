# DEFENDER 无代理扫描 — Comprehensive Troubleshooting Guide

**Entries**: 14 | **Draft sources**: 10 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-cmk-agentless-disk-scanning.md, ado-wiki-a-diagnostics-agentless-scanning.md, ado-wiki-a-gcp-agentless-scanning-tsg.md, ado-wiki-a-gcp-agentless-scanning-va-issues.md, ado-wiki-b-agentless-vm-scanning-tsg.md, ado-wiki-b-gcp-agentless-scanning.md, ado-wiki-b-technical-knowledge-agentless-scanning.md, ado-wiki-b-tsg-agentless-k8s-node-va.md, ado-wiki-c-disk-scan-container-images.md, ado-wiki-c-product-knowledge-agentless-container-posture.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Agentless
> Sources: ado-wiki

**1. Agentless VM scan job fails with NoPermissionForCustomerKeyVaultRBAC error. VM appears as 'Not Applicable' with 'Failed to scan' under recommendations. Disk scan job shows error related to Key Vault R**

- **Root Cause**: MDC agentless scanner lacks the required RBAC permissions on the customer Key Vault that holds the Customer Managed Key (CMK) used to encrypt the VM disks. The scanner needs access to read the CMK to snapshot and scan encrypted disks.
- **Solution**: Follow the CMK encrypted disk wiki guide to grant proper RBAC permissions on Key Vault. After granting permissions, wait for next scan cycle (24 hours) for results to appear. Ref: Agentless-disk-scanning-of-CMK-encrypted-disks wiki page.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**2. GKE Standard Cluster instances not appearing in agentless scanning results in Defender for Cloud**

- **Root Cause**: Google Kubernetes Engine (GKE) Standard Clusters create regular Compute Instances for their nodes, which are not supported for agentless disk scanning. GKE instances are identified by the gke keyword in their name.
- **Solution**: This is a known limitation. GKE Standard Cluster node instances are not supported for agentless scanning. Customers should use agent-based scanning (MDE) for GKE nodes, or migrate to GKE Autopilot if agentless coverage is required.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🟡 4.0/10 — ADO Wiki]`

**3. GCP VM with Customer-Supplied Encryption Key (CSEK) not scanned by Defender for Cloud agentless scanning**

- **Root Cause**: Agentless disk scanning only supports Google-managed encryption keys and Customer-Managed Encryption Keys (CMEK). Customer-Supplied Encryption Keys (CSEK) are not supported.
- **Solution**: This is a known limitation. If agentless scanning coverage is required, switch the VM disk encryption to Google-managed or Customer-Managed Encryption Key (CMEK). CSEK-encrypted disks cannot be snapshot-copied by the scanning infrastructure.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🟡 4.0/10 — ADO Wiki]`

**4. GCP VM not appearing in agentless scanning results despite agentless scanning being enabled**

- **Root Cause**: The VM does not meet agentless scanning eligibility requirements: (1) instance must be in Running status, (2) maximum 8 disks attached, (3) OS disk must be present and not corrupted. Missing or corrupted OS disk will cause scan failure.
- **Solution**: Verify the GCP VM meets all eligibility requirements: ensure instance is Running, has at most 8 attached disks, and has a valid OS disk. Check instance status in GCP console and verify disk configuration. Use the Romelogs Kusto queries (DS_ResourcesValidation) to check instance validation status.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🟡 4.0/10 — ADO Wiki]`

### Phase 2: Agentless Scanning
> Sources: ado-wiki, mslearn

**1. Agentless Scanning (MDFC) disk scan fails for VMs. ASC DiskScan Failures diagnostic tool shows failure categories such as UnsupportedDiskSku, InvalidDiskReference, TotalDiskSizeExceeded, SingleDiskSiz**

- **Root Cause**: Various per failure category: disk SKU not supported for agentless scanning, invalid disk reference, total/single disk size exceeds scanning limits, resource-level encryption unsupported, VM not running (deallocated/stopped), unmanaged disks not supported, Databricks VM excluded by design, exclusion tags applied, too many attached disks, extended location (Edge Zone) unsupported, region not supported for agentless scanning, or CMK encryption with missing Key Vault RBAC permissions for scanner.
- **Solution**: Use ASC Tenant Explorer > Defender for Cloud > DiskScan failures tab. Enter Subscription ID + Resource ID and click Run. Match FailedReason to category: UnsupportedDiskSku/InvalidDiskReference -> verify disk type; TotalDiskSizeExceeded/SingleDiskSizeExceeded -> reduce disk size or count; UnsupportedEncryption -> check encryption config; UnsupportedOperationalState -> ensure VM is running; UnsupportedUnmanagedDisk -> migrate to managed disks; DatabricksExclusion -> by design, no action; ExclusionTags -> remove exclusion tags; MaxDiskCount -> reduce attached disks; UnsupportedExtendedLocation/UnsupportedRegion -> move resource; NoPermissionForCustomerKeyVaultRBAC -> grant scanner RBAC on customer Key Vault. For issues contact MDC EEE team.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Agentless Scanning DiskScan fails with UnsupportedUnmanagedDisk or UnsupportedDiskSku - VM uses unmanaged disks or unsupported disk SKU type**

- **Root Cause**: The VM uses unmanaged disks or an unsupported disk SKU type. Agentless scanning only supports managed disks with supported SKU types.
- **Solution**: Migrate the VM to use managed disks if using unmanaged disks. Check the disk SKU type against supported types. Other common DiskScan failure categories include: TotalDiskSizeExceeded (combined disk size too large), SingleDiskSizeExceeded (individual disk too large), UnsupportedRegion, UnsupportedExtendedLocation, MaxDiskCount (too many attached disks), DatabricksExclusion (by design), ExclusionTags (explicitly excluded), UnsupportedOperationalState-ResourceNotRunning (VM deallocated/stopped). Use ASC Tenant Explorer > Defender for Cloud > DiskScan failures to identify the exact failure category.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

**3. No agentless scan results for GCP VMs within 24 hours after connecting GCP project to Defender for Cloud**

- **Root Cause**: GCP organizational policy Compute Storage resource use restrictions (Compute Engine disks, images, and snapshots) prevents Defender for Cloud from accessing necessary resources for disk scanning
- **Solution**: Navigate to GCP IAM and Admin > Organization Policies, find Compute Storage resource use restrictions policy, change policy type to Allow, add under:organizations/517615557103 to allowlist, and save. Results appear within 24 hours after next API call.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 3: Container Va
> Sources: ado-wiki

**1. Windows-based AKS nodes do not show container image VA results from Defender for Cloud disk scan.**

- **Root Cause**: Windows-based nodes do not store container images on disk. Disk Scan Platform scans VM/VMSS disk snapshots but Windows nodes lack on-disk image storage.
- **Solution**: Known limitation. Windows node images not scanned by disk scan. Use registry-based scanning (ACR/ECR/GAR) for Windows workloads.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**2. AKS cluster using ephemeral OS disk shows no container image VA results from disk scan.**

- **Root Cause**: Ephemeral OS property prevents Disk Scan Platform visibility into images on disk. Ephemeral disks are temporary and attached to VM host, preventing snapshot-based scanning.
- **Solution**: Known limitation. Use registry-based scanning (ACR/ECR/GAR) for images on ephemeral OS nodes.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**3. Auto-scaled AKS cluster shows partial or no container image VA results from disk scan.**

- **Root Cause**: Disk scan runs once every 24h. Auto-scale nodes may be down at scan time, resulting in partial/missing results.
- **Solution**: Ensure nodes are running during scan window. Use registry-based scanning for complete coverage. Check Phoenix_DiskScan_K8sNodes_LifeCycleEvents Kusto table to verify scanned nodes.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

### Phase 4: Fim
> Sources: ado-wiki

**1. Customer enabled FIM Agentless but cannot see any events at all in Log Analytics workspace**

- **Root Cause**: Multiple possible causes: (1) Missing prerequisites - P2 not enabled, agentless scanning not enabled, or FIM not enabled. (2) FIMDetectionType set to RealTimeViaMDE only. (3) File path not part of FIM configuration. (4) Customer did not wait 24 hours after enablement or rule editing. (5) Error sending events to LA workspace. (6) Multi-cloud machines not supported.
- **Solution**: 1) Validate prerequisites via Kusto: query ascentitystorflreprdus MDCGlobalData.Environments to check isP2Enabled, isFIMEnabled, isAgentlessVmScanningEnabled, FIMDetectionType. If FIMDetectionType=RealTimeViaMDE, set a custom rule or disable/re-enable FIM. 2) Validate Agentless VM Scanning (transfer to Disk Scanning Team if issue). 3) Verify file/registry is in FIM config via portal. 4) Wait 24h after enablement. 5) Check Guardians.Log for errors.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

**2. Customer can see some FIM Agentless events but not all expected file changes are tracked**

- **Root Cause**: Disk scanning mount or scan may have failed for the machine. Agentless FIM relies on 24-hour cadence snapshots, so consecutive changes within one window produce only one event. Custom detections not supported on ARC machines.
- **Solution**: Run DiskScanningWorkerOperations Kusto query to verify MountSucceed and Scanned for the machine on day before/of/after the event. If disk scanning issue, transfer to MDC Guardians - Disk Scanning Team. Note: agentless creates only one event per 24h window for the same entity.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

### Phase 5: Va
> Sources: ado-wiki

**1. Vulnerability Assessment scan results are not appearing or are delayed for existing Azure VMs with agentless scanning enabled. Customer expects results within 24 hours but sees stale or missing findin**

- **Root Cause**: Agentless scanning is triggered every 24 hours at subscription level. Results need processing by MDVM before appearing in MDC platform. Total pipeline time is 1.5H min to 25.5H max for agentless, 15H-27H for agent-based Azure VMs (with BYOL), and 3H-15H for agent-based AWS/GCP/Arc.
- **Solution**: Set correct expectations: Agentless results appear within 1.5-25.5 hours. Agent-based Azure (with BYOL) takes 15-27H (improving to 3-15H after BYOL deprecation May 2025). Agent-based non-Azure takes 3-15H. Official SLA statement is 24 hours. If results still missing after max window, escalate to server VA team.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**2. New VMs created in an already onboarded environment do not show VA agentless scan results, or results are delayed significantly beyond 24 hours.**

- **Root Cause**: Agentless scanning for new VMs has a limitation of 20 VMs per subscription per day. If the number of new VMs exceeds this limit, remaining VMs are queued for subsequent days. Max time to results can be up to 26 hours even within the limit.
- **Solution**: Inform customer of the 20 VMs/subscription/day limit for agentless new VM scanning. If customer has many new VMs, results will appear over multiple days. For agent-based new Azure VMs, agent installation takes up to 4H + 15H processing = up to 31H total (improving after BYOL deprecation). For non-Azure: Arc install ~3H + MDE ~4H + 3H processing = up to 22H.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Agentless Scanning (MDFC) disk scan fails for VMs. ASC DiskScan Failures diagnostic tool shows fa... | Various per failure category: disk SKU not supported for agentless scanning, invalid disk referen... | Use ASC Tenant Explorer > Defender for Cloud > DiskScan failures tab. Enter Subscription ID + Res... | 🟢 8.5 | ADO Wiki |
| 2 ⚠️ | Agentless Scanning DiskScan fails with UnsupportedUnmanagedDisk or UnsupportedDiskSku - VM uses u... | The VM uses unmanaged disks or an unsupported disk SKU type. Agentless scanning only supports man... | Migrate the VM to use managed disks if using unmanaged disks. Check the disk SKU type against sup... | 🔵 7.0 | ADO Wiki |
| 3 ⚠️ | Customer enabled FIM Agentless but cannot see any events at all in Log Analytics workspace | Multiple possible causes: (1) Missing prerequisites - P2 not enabled, agentless scanning not enab... | 1) Validate prerequisites via Kusto: query ascentitystorflreprdus MDCGlobalData.Environments to c... | 🔵 7.0 | ADO Wiki |
| 4 ⚠️ | Customer can see some FIM Agentless events but not all expected file changes are tracked | Disk scanning mount or scan may have failed for the machine. Agentless FIM relies on 24-hour cade... | Run DiskScanningWorkerOperations Kusto query to verify MountSucceed and Scanned for the machine o... | 🔵 7.0 | ADO Wiki |
| 5 ⚠️ | No agentless scan results for GCP VMs within 24 hours after connecting GCP project to Defender fo... | GCP organizational policy Compute Storage resource use restrictions (Compute Engine disks, images... | Navigate to GCP IAM and Admin > Organization Policies, find Compute Storage resource use restrict... | 🔵 6.0 | MS Learn |
| 6 | Windows-based AKS nodes do not show container image VA results from Defender for Cloud disk scan. | Windows-based nodes do not store container images on disk. Disk Scan Platform scans VM/VMSS disk ... | Known limitation. Windows node images not scanned by disk scan. Use registry-based scanning (ACR/... | 🔵 5.5 | ADO Wiki |
| 7 | AKS cluster using ephemeral OS disk shows no container image VA results from disk scan. | Ephemeral OS property prevents Disk Scan Platform visibility into images on disk. Ephemeral disks... | Known limitation. Use registry-based scanning (ACR/ECR/GAR) for images on ephemeral OS nodes. | 🔵 5.5 | ADO Wiki |
| 8 | Auto-scaled AKS cluster shows partial or no container image VA results from disk scan. | Disk scan runs once every 24h. Auto-scale nodes may be down at scan time, resulting in partial/mi... | Ensure nodes are running during scan window. Use registry-based scanning for complete coverage. C... | 🔵 5.5 | ADO Wiki |
| 9 | Vulnerability Assessment scan results are not appearing or are delayed for existing Azure VMs wit... | Agentless scanning is triggered every 24 hours at subscription level. Results need processing by ... | Set correct expectations: Agentless results appear within 1.5-25.5 hours. Agent-based Azure (with... | 🔵 5.5 | ADO Wiki |
| 10 | New VMs created in an already onboarded environment do not show VA agentless scan results, or res... | Agentless scanning for new VMs has a limitation of 20 VMs per subscription per day. If the number... | Inform customer of the 20 VMs/subscription/day limit for agentless new VM scanning. If customer h... | 🔵 5.5 | ADO Wiki |
| 11 | Agentless VM scan job fails with NoPermissionForCustomerKeyVaultRBAC error. VM appears as 'Not Ap... | MDC agentless scanner lacks the required RBAC permissions on the customer Key Vault that holds th... | Follow the CMK encrypted disk wiki guide to grant proper RBAC permissions on Key Vault. After gra... | 🔵 5.5 | ADO Wiki |
| 12 ⚠️ | GKE Standard Cluster instances not appearing in agentless scanning results in Defender for Cloud | Google Kubernetes Engine (GKE) Standard Clusters create regular Compute Instances for their nodes... | This is a known limitation. GKE Standard Cluster node instances are not supported for agentless s... | 🟡 4.0 | ADO Wiki |
| 13 ⚠️ | GCP VM with Customer-Supplied Encryption Key (CSEK) not scanned by Defender for Cloud agentless s... | Agentless disk scanning only supports Google-managed encryption keys and Customer-Managed Encrypt... | This is a known limitation. If agentless scanning coverage is required, switch the VM disk encryp... | 🟡 4.0 | ADO Wiki |
| 14 ⚠️ | GCP VM not appearing in agentless scanning results despite agentless scanning being enabled | The VM does not meet agentless scanning eligibility requirements: (1) instance must be in Running... | Verify the GCP VM meets all eligibility requirements: ensure instance is Running, has at most 8 a... | 🟡 4.0 | ADO Wiki |
