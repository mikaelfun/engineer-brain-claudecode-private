# VM 其他未分类 — 排查速查

**来源数**: 4 (AW, KB, ML, ON) | **条目**: 31 | **21V**: 28/31
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | VM or resource exists in the resource provider (RP) but is not visible in ARM cache, causing it to n | ARM cache entry was not created or was lost; subscription/tenant-level resources | Execute ARM Sync (Create mode) via Jarvis action: Azure Resource Manager > Resou | 🔵 7.5 | AW |
| 2 | Kusto query returns masked/obfuscated PII data (e.g., clientIpAddress shows as {PII:Hxxx(<mixed_data | Kusto has compliance requirements that mask sensitive PII data (e.g., client IP  | Use Geneva raw data via Jarvis to retrieve unmasked values. For ARM requests: fi | 🔵 7.5 | ON |
| 3 | Pull request (PR) in Azure DevOps wiki incorrectly marks a wiki page as deleted when the page was ac | Git loses file tracking when you simultaneously rename/move a file AND edit more | Split the change into two separate PRs: (1) First PR: revert the rename/move bac | 🔵 7.5 | AW |
| 4 | AIB build times out before reaching AIB timeout period when using GitHub Actions with OpenID tokens. | OpenID token issued by GitHub Actions expires before AIB build completes, or Git | Redirect customer to GitHub Support (https://support.github.com). Contact CSAM t | 🔵 7.5 | AW |
| 5 | Azure IaaS VM reboots every hour; user can log in after reboot; Guest OS Event logs show Dynamics, I | Expired Dynamics AX trial license causing the system to automatically reboot eve | Transfer the entire case to the Dynamics AX queue. Update case Product to Dynami | 🔵 7.5 | AW |
| 6 | Azure Linux VM unable to boot after OS disk resize. Boot diagnostics show GRUB rescue prompt ('Minim | During Linux OS disk resize, customer used fdisk in DOS compatibility mode (cyli | 1) Attach problem VHD to rescue VM. 2) Run fdisk with correct flags: fdisk -u=se | 🔵 7.5 | AW |
| 7 | Need to quickly find VM ContainerID, NodeID, TenantName, RoleInstanceName for VMs under a subscripti |  | Query LogContainerSnapshot table in azurecmmc Kusto cluster (requires RAMWeb Pro | 🔵 7.5 | ON |
| 8 | Purpose of this internal content is to present solution to how to:How to increase quota of a VHDXHow | E.g. after having configured User Profile Disk, it is not possible to change quo | For the 2 actions below the user must have signed out otherwise the VHDX won't b | 🔵 7 | KB |
| 9 | Azure VM Bugcheck 7B. Boot driver .sys NOT found in System32/drivers per 7Bchecks. | Missing driver .sys in System32/drivers from corruption/update failure. | Copy from DriverStore/FileRepository or identical server. SFC scan. | 🔵 6.5 | AW |
| 10 | Customer inquires about Intel Processor MMIO Stale Data Vulnerabilities (CVE-2022-21123, CVE-2022-21 | Vulnerabilities in certain Intel processor models allow MMIO stale data attacks; | Azure infrastructure already mitigated; no proactive customer outreach needed; c | 🔵 6.5 | AW |
| 11 | Linux VM fails to boot due to ext4 filesystem corruption. Serial log shows EXT4-fs error, IO failure | Disk corruption on ext4 filesystem caused by kernel problems, driver errors, or  | Identify corrupted disk via serial log. Use fsck /dev/sdX to repair ext4. Repeat | 🔵 6.5 | ML |
| 12 | Cannot delete Azure storage account/container/blob. Error: storage account cannot be deleted due to  | VHD page blobs attached to VMs have active leases. Azure prevents deletion of di | Identify blobs via Blob Metadata (MicrosoftAzureCompute_VMName). Delete VM if OS | 🔵 6.5 | ML |
| 13 | Kaspersky VM extension (ksws/kesl) removed from Azure VMs or extension deployment fails for Kaspersk | U.S. Commerce Department banned Kaspersky products (June 2024). Microsoft remove | No customer action needed - the extension was forcibly removed. VMs that had the | 🔵 6.5 | AW |
| 14 | Linux VM shuts down or fails to boot when OS disk /var/log/audit partition is full. auditd HALT conf | auditd.conf admin_space_left_action=HALT causes system shutdown when audit log d | Change HALT to SUSPEND in /etc/audit/auditd.conf via rescue VM. Free disk space  | 🔵 6.5 | ML |
| 15 | Boot diagnostics shows: A disk read error occurred. Press Ctrl+Alt+Del to restart. VM cannot boot. | Disk structure corrupted and unreadable. For Gen1 VMs, boot partition may not be | 1. Create repair VM, attach OS disk. 2. Gen1: diskpart check/set partition activ | 🔵 6.5 | ML |
| 16 | Azure VM Bugcheck 7B. NoBootDeviceCheck: driver Start value NOT BOOT. | Driver Start not 0 (disabled/misconfigured). | Load SYSTEM hive, set Start=0 for the driver, recreate VM. | 🔵 6.5 | AW |
| 17 | Customer attempts to use Standard SSD or Standard HDD disk with Ebdsv5/Ebsv5 (Ebv5) series VM and en | Ebv5 series VMs only support Premium Storage. Standard SSDs and Standard HDDs di | Use Premium SSD (P-series), Premium SSD v2, or Ultra Disk instead of Standard SS | 🔵 6.5 | AW |
| 18 | Azure VM unresponsive during boot, stuck at 'Please wait for the Local Session Manager' message show | Multiple potential causes requiring memory dump analysis. VM is stuck waiting fo | 1) Wait up to 1 hour as process may self-resolve. 2) If persists, prepare repair | 🔵 6.5 | ML |
| 19 | User with inherited subscription owner role does not receive Customer Lockbox notification email and | Customer Lockbox does NOT recognize inherited owner roles. Only users with expli | Ensure the approving user has a direct (non-inherited) Subscription Owner or Glo | 🔵 6.5 | AW |
| 20 | Azure VM Bugcheck 7B. Third-party filter drivers in Upperfilter/LowerFilter per 7Bchecks. | Filter drivers interfere with boot device access. | Remove third-party entries from HKLM ControlSet Services Upperfilter/LowerFilter | 🔵 6.5 | AW |
| 21 | Customer reports CVE-2021-44228 (Log4j RCE 0-day) affecting Java/Apache services running on Azure VM | Apache Log4j2 versions 2.0-beta9 through 2.15.0 do not protect against attacker- | Upgrade Log4j2 to version 2.16.0+; if on 2.10+, set log4j2.formatMsgNoLookups=tr | 🔵 6.5 | AW |
| 22 | Reference: DSS data classification standards for handling Azure VM support data including crash dump |  | DSS classifications: Content Data (VM data, crash dumps, customer files) = Highl | 🔵 6 | ON |
| 23 | 需要就 Azure 非事件类问题咨询 PG 或获取专家意见 |  | 使用以下 DL 咨询对应 PG（需先通过 IDWeb 加入）：全球 Azure: WINAZRTT@microsoft.com / wwcomazm@micro | 🔵 6 | ON |
| 24 | Need to deploy SSIS packages from a client machine to a remote SQL server running in Azure Virtual m | It is not possible to deploy SSIS packages directly to a SQL instance running on | Note:Works for small number of packages:Here are the steps that I tried and veri | 🔵 6 | KB |
| 25 | Deployment error when deploying VM or service in Azure portal Other (non-recommended) region; some s | Azure portal reclassified regions: Recommended = regions with Availability Zones | Deploy in a Recommended region (one with Availability Zones) or verify service a | 🔵 6.0 | AW |
| 26 | HealthResources table in Azure Resource Graph has missing entries — VM availability status or health | The health data emitted by the monitoring service sometimes lacks the associated | Workaround: Use the VM Resource Health blade or Metrics blade in the Azure porta | 🔵 5.5 | ML |
| 27 | VM availability metric continues to show Available (value=1) during VM restart — Azure Monitor Metri | A 15-second delay in the monitoring service gathering health status, plus up to  | Wait at least 3 minutes and 15 seconds after observing Available status before t | 🔵 5.5 | ML |
| 28 | Cannot manually extend/configure volume on SQL Server VM deployed from Azure Marketplace. Storage po | SQL Server Marketplace VMs pre-create a storage pool with DATA and LOG volumes.  | Use Azure portal > VM > SQL Server configuration > Manage SQL virtual machine >  | 🔵 5.5 | ML |
| 29 | VM Inspector 405 ResourceNotSupported for encrypted/unmanaged/ephemeral disk | VM Inspector does not support encrypted, unmanaged, or ephemeral OS disks | Use alternative diagnostics: Serial Console, Boot Diagnostics. Convert unmanaged | 🔵 5.5 | ML |
| 30 | VM error: StorageAccountTypeNotSupported - Boot diagnostics fails because premium storage account is | Premium storage account type does not support boot diagnostics. | Use a General purpose storage account for boot diagnostics instead of premium st | 🔵 5.5 | ML |
| 31 | [container] VM+SCIM Process section index page |  | Section container page. No actionable content. | 🔵 5 | ON |

## 快速排查路径

1. **VM or resource exists in the resource provider (RP) but is not visible in ARM ca**
   - 根因: ARM cache entry was not created or was lost; subscription/tenant-level resources are still subject to ARM internal stora
   - 方案: Execute ARM Sync (Create mode) via Jarvis action: Azure Resource Manager > Resource Synchronization > Synchronize resource state. Required fields: Sub
   - `[🔵 7.5 | AW]`

2. **Kusto query returns masked/obfuscated PII data (e.g., clientIpAddress shows as {**
   - 根因: Kusto has compliance requirements that mask sensitive PII data (e.g., client IP addresses, user identifiers) in query re
   - 方案: Use Geneva raw data via Jarvis to retrieve unmasked values. For ARM requests: find the source namespace in Jarvis — ARM records the unmasked clientIpA
   - `[🔵 7.5 | ON]`

3. **Pull request (PR) in Azure DevOps wiki incorrectly marks a wiki page as deleted **
   - 根因: Git loses file tracking when you simultaneously rename/move a file AND edit more than a certain threshold percentage of 
   - 方案: Split the change into two separate PRs: (1) First PR: revert the rename/move back to original location but keep the content edits; complete and merge.
   - `[🔵 7.5 | AW]`

4. **AIB build times out before reaching AIB timeout period when using GitHub Actions**
   - 根因: OpenID token issued by GitHub Actions expires before AIB build completes, or GitHub Action workflow is misconfigured. Th
   - 方案: Redirect customer to GitHub Support (https://support.github.com). Contact CSAM to re-route. Verify via customization log from ASC that context timeout
   - `[🔵 7.5 | AW]`

5. **Azure IaaS VM reboots every hour; user can log in after reboot; Guest OS Event l**
   - 根因: Expired Dynamics AX trial license causing the system to automatically reboot every hour
   - 方案: Transfer the entire case to the Dynamics AX queue. Update case Product to Dynamics AX 2012 R3, Support Topic to Dynamics. Customer may need to re-arm 
   - `[🔵 7.5 | AW]`

