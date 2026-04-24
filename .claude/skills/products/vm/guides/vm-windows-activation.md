# VM Windows 激活与许可 — 排查速查

**来源数**: 2 (AW, ML) | **条目**: 7 | **21V**: 5/7
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Cannot install prerequisite hotfixes for ESU on Windows Server 2008/R2, or cannot install/activate E | ESU MAK installation and activation issues are handled by the Devices and Deploy | Route to Devices and Deployment team. Support paths: (1) Prerequisite hotfixes:  | 🔵 7.5 | AW |
| 2 | Windows activation fails on Azure VM in forced tunneling scenario (site-to-site VPN or ExpressRoute) | Forced tunneling routes all internet-bound traffic (including KMS activation tra | Create Azure custom routes (UDR) to route KMS server IPs directly to Internet ne | 🔵 6.5 | ML |
| 3 | SLES migration: suse-migration-sle15-activation not found in package names | SLES 12 Public Cloud module not enabled by default. | SUSEConnect -p sle-module-public-cloud/12/x86_64. For SAP remove sle-ha-release. | 🔵 6.5 | ML |
| 4 | Azure VM cannot connect to IMDS endpoint (169.254.169.254). IMDS-dependent apps fail, activation wat | Connection to IMDS wire server blocked by web proxy, incorrect routing table (mi | 1. route print - verify 169.254.169.254 route exists. 2. ipconfig /all - match M | 🔵 5.5 | ML |
| 5 | Windows activation fails with duplicate Client Machine ID (CMID) error when using self-hosted KMS se | Azure Marketplace Windows Server images use Sysprep with SkipRearm=1, so VMs fro | For already deployed VMs: run slmgr /rearm from elevated prompt, restart VM, ver | 🔵 5.5 | ML |
| 6 | Azure Windows VM activation fails with error 0xC004FD01 (Windows is not running on a supported Micro | VM is configured to use Automatic Virtual Machine Activation (AVMA), which is no | Change activation from AVMA to KMS: run slmgr /ipk <KMS-client-setup-key> using  | 🔵 5.5 | ML |
| 7 | Windows Server 2022/2025 Datacenter Azure Edition shows activation watermark on desktop despite KMS  | Two possible causes: (1) VM cannot reach Azure IMDS endpoint (169.254.169.254) d | Cause 1 (IMDS): Bypass web proxies for 169.254.169.254, verify route table entry | 🔵 5.5 | ML |

## 快速排查路径

1. **Cannot install prerequisite hotfixes for ESU on Windows Server 2008/R2, or canno**
   - 根因: ESU MAK installation and activation issues are handled by the Devices and Deployment team, not Azure VM support
   - 方案: Route to Devices and Deployment team. Support paths: (1) Prerequisite hotfixes: Windows Servers > <OS> > <OS Edition> > Installing Windows Updates, Fe
   - `[🔵 7.5 | AW]`

2. **Windows activation fails on Azure VM in forced tunneling scenario (site-to-site **
   - 根因: Forced tunneling routes all internet-bound traffic (including KMS activation traffic on port 1688) to on-premises networ
   - 方案: Create Azure custom routes (UDR) to route KMS server IPs directly to Internet next hop. Add routes for azkms.core.windows.net IPs (20.118.99.224, 40.8
   - `[🔵 6.5 | ML]`

3. **SLES migration: suse-migration-sle15-activation not found in package names**
   - 根因: SLES 12 Public Cloud module not enabled by default.
   - 方案: SUSEConnect -p sle-module-public-cloud/12/x86_64. For SAP remove sle-ha-release. Cleanup: SUSEConnect --cleanup, registercloudguest --force-new.
   - `[🔵 6.5 | ML]`

4. **Azure VM cannot connect to IMDS endpoint (169.254.169.254). IMDS-dependent apps **
   - 根因: Connection to IMDS wire server blocked by web proxy, incorrect routing table (missing/wrong route for 169.254.169.254), 
   - 方案: 1. route print - verify 169.254.169.254 route exists. 2. ipconfig /all - match MAC and IP with Azure portal. 3. Fix routing if mismatch. 4. Bypass web
   - `[🔵 5.5 | ML]`

5. **Windows activation fails with duplicate Client Machine ID (CMID) error when usin**
   - 根因: Azure Marketplace Windows Server images use Sysprep with SkipRearm=1, so VMs from the same image share the same CMID. Se
   - 方案: For already deployed VMs: run slmgr /rearm from elevated prompt, restart VM, verify CMID changed with cscript slmgr.vbs /dlv, then re-trigger activati
   - `[🔵 5.5 | ML]`

