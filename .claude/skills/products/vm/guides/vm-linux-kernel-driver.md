# VM Linux 内核与驱动 — 排查速查

**来源数**: 2 (ML, ON) | **条目**: 10 | **21V**: 全部
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | OS Provisioning timeout (OSProvisioningTimedOut) on CentOS 7.x VM; cloud-init fails with 'module obj | Unicode characters in VM tags cause cloud-init to fail parsing IMDS JSON respons | Recreate the VM without tags containing unicode characters. Add tags with unicod | 🟢 8 | ON |
| 2 | Ubuntu 22.04 VM reports false Resource Health Unavailable alerts daily. VM running fine. Kernel vers | Known Canonical kernel bug below 6.2.0-1017 causes false health heartbeat failur | Upgrade kernel to >= 6.2.0-1017. Requires reboot. Verify with uname -a. ADO Work | 🔵 7 | ON |
| 3 | Linux VM deployment fails with OSProvisioningInternalError. VM stuck in Creating state ~40min then f | Missing/misconfigured provisioning agent, incorrect image config, or disabled UD | Enable boot diagnostics, check serial log. Ensure UDF not blocked. Verify cloud- | 🔵 6.5 | ML |
| 4 | GPU disabled on Azure N-Series Ubuntu 16.04 LTS VM after upgrading to 4.4.0-75 kernel; kernel NULL p | Incompatibility between NVIDIA driver and Ubuntu 4.4.0-75 kernel causing kernel  | Upgrade kernel to at least version 4.4.0-77 | 🔵 5.5 | ML |
| 5 | SLES 12->15 migration fails: HPC Module 12 x86_64 not activated or Invalid combination of products r | HPC became standalone product in SLES 15, blocks migration target resolution. | Remove HPC: zypper rm sle-module-hpc-release-POOL sle-module-hpc-release. Or mv  | 🔵 5.5 | ML |
| 6 | SLES 15->SP3 migration fails: products not activated, list of SP1 modules not activated | Previous SLES migration interrupted/terminated, incomplete package updates. | zypper dup, zypper rollback, zypper migration to retry. | 🔵 5.5 | ML |
| 7 | After SLES migration, VM won t boot with latest kernel, repositories not defined | /etc/credentials.d has incorrect permissions or corrupted content. | rm /var/cache/cloudregister/ /etc/zypp/credentials.d/, chmod 0755 /etc/zypp/cred | 🔵 5.5 | ML |
| 8 | SLES 15 SP3->SP4: Invalid system credentials and No repositories defined | Certification module conflicts with migration, causes invalid credentials. | SUSEConnect -d -p sle-module-certifications/15.3/x86_64 then retry. | 🔵 5.5 | ML |
| 9 | SLES SP3->SP4/SP5: No migration available, products not available after incomplete migration | Required modules not activated while obsolete modules block path. | Activate web-scripting/public-cloud/containers/live-patching, deactivate legacy/ | 🔵 5.5 | ML |
| 10 | yum SyntaxError/No module named yum/bad interpreter. Wrong Python version. | Default Python changed or symlink modified. | Fix symlink: ln -s python2.7 python. Or rpm -ivh python --replacepkgs. | 🔵 5.5 | ML |

## 快速排查路径

1. **OS Provisioning timeout (OSProvisioningTimedOut) on CentOS 7.x VM; cloud-init fa**
   - 根因: Unicode characters in VM tags cause cloud-init to fail parsing IMDS JSON response. This is a cloud-init bug in Python 2.
   - 方案: Recreate the VM without tags containing unicode characters. Add tags with unicode characters only after VM creation completes successfully. For newer 
   - `[🟢 8 | ON]`

2. **Ubuntu 22.04 VM reports false Resource Health Unavailable alerts daily. VM runni**
   - 根因: Known Canonical kernel bug below 6.2.0-1017 causes false health heartbeat failures.
   - 方案: Upgrade kernel to >= 6.2.0-1017. Requires reboot. Verify with uname -a. ADO Work Item 59536.
   - `[🔵 7 | ON]`

3. **Linux VM deployment fails with OSProvisioningInternalError. VM stuck in Creating**
   - 根因: Missing/misconfigured provisioning agent, incorrect image config, or disabled UDF module
   - 方案: Enable boot diagnostics, check serial log. Ensure UDF not blocked. Verify cloud-init/waagent configured. Check /var/tmp not noexec.
   - `[🔵 6.5 | ML]`

4. **GPU disabled on Azure N-Series Ubuntu 16.04 LTS VM after upgrading to 4.4.0-75 k**
   - 根因: Incompatibility between NVIDIA driver and Ubuntu 4.4.0-75 kernel causing kernel NULL pointer dereference in nvidia modul
   - 方案: Upgrade kernel to at least version 4.4.0-77
   - `[🔵 5.5 | ML]`

5. **SLES 12->15 migration fails: HPC Module 12 x86_64 not activated or Invalid combi**
   - 根因: HPC became standalone product in SLES 15, blocks migration target resolution.
   - 方案: Remove HPC: zypper rm sle-module-hpc-release-POOL sle-module-hpc-release. Or mv /etc/products.d/sle-module-hpc.prod /tmp/
   - `[🔵 5.5 | ML]`

