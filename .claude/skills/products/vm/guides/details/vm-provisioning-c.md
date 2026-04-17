# VM Vm Provisioning C — 综合排查指南

**条目数**: 30 | **草稿融合数**: 1 | **Kusto 查询融合**: 1
**来源草稿**: [ado-wiki-a-Pre-Provisioning-Service.md](../../guides/drafts/ado-wiki-a-Pre-Provisioning-Service.md)
**Kusto 引用**: [provisioning-timeout.md](../../../kusto/vm/references/queries/provisioning-timeout.md)
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: 数据收集
> 来源: Kusto skill

1. 执行 Kusto 查询 `[工具: Kusto skill — provisioning-timeout.md]`

### Phase 2: 排查与诊断
> 来源: ADO Wiki

1. 参照 [ado-wiki-a-Pre-Provisioning-Service.md](../../guides/drafts/ado-wiki-a-Pre-Provisioning-Service.md) 排查流程

### Phase 3: 根因判断与解决

**判断逻辑**：

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| Password field was left empty when attempting to r | 1 条相关 | Provide a non-empty password for the account when using VMAc... |
| Resource Group or VM tags contain Unicode characte | 3 条相关 | Remove all Unicode characters from Resource Group and VM tag... |
| VM created from specialized disk (VHD directly att | 1 条相关 | Create VM from image instead of specialized disk. If ovf-env... |
| VM was created from a specialized disk (not an ima | 1 条相关 | Create VM from an image (not specialized disk) if ovf-env.xm... |
| Linux distributions transitioned to Python 3.x and | 2 条相关 | Reinstate /usr/bin/python symlink: For Ubuntu: sudo apt upda... |
| Linux distributions transitioning to Python 3.x re | 2 条相关 | Reinstall python symlink: Ubuntu: sudo apt install python-is... |
| Python < 3.8 get_distro() function picks up /etc/c | 1 条相关 | Remove centos-release and redhat-release symbolic links: sud... |
| BCD (Boot Configuration Data) corruption - missing | 1 条相关 | OFFLINE approach: attach OS disk to rescue VM. Rebuild BCD s... |
| Private endpoint setup is incorrect. DNS resolutio | 1 条相关 | Run nslookup <storage>.file.core.windows.net and verify it r... |
| TrustedInstaller (Windows Modules Installer) servi | 1 条相关 | Use online hang scenario troubleshooting: backup OS disk, co... |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | VMAccess extension fails: 'The Admin User Account password cannot be null or empty if provided the u... | Password field was left empty when attempting to reset or create user account vi... | Provide a non-empty password for the account when using VMAccess extension. | 🔵 7.0 | ADO Wiki |
| 2 | Linux VM provisioning fails; waagent.log shows cloud-init does not appear to be running with repeate... | Resource Group or VM tags contain Unicode characters. IMDS returns these in meta... | Remove all Unicode characters from Resource Group and VM tags. Use only ASCII. V... | 🔵 7.0 | ADO Wiki |
| 3 | Linux VM provisioning fails: cloud-init does not appear to be running in waagent.log. cloud-init.log... | Resource Group or VM tags contain Unicode characters (e.g. accented letters). IM... | Remove Unicode characters from Resource Group name, RG tags, and VM tags. Use on... | 🔵 7.0 | ADO Wiki |
| 4 | Linux VM provisioning fails OSProvisioningTimedOut. waagent.log: cloud-init does not appear to be ru... | Resource Group or VM tags contain Unicode characters. IMDS returns them to cloud... | Remove Unicode characters from Resource Group and VM tags. Use only ASCII charac... | 🔵 7.0 | ADO Wiki |
| 5 | Linux VM provisioning fails with 'Error mounting dvd: Failed to get dvd device from /dev' or 'Failed... | VM created from specialized disk (VHD directly attached, not from image) which d... | Create VM from image instead of specialized disk. If ovf-env.xml is required, cr... | 🔵 7.0 | ADO Wiki |
| 6 | Linux VM provisioning fails with 'Provisioning failed: [ProtocolError] [CopyOvfEnv] Error mounting d... | VM was created from a specialized disk (not an image), so no ISO with ovf-env.xm... | Create VM from an image (not specialized disk) if ovf-env.xml is needed. If UDF ... | 🔵 7.0 | ADO Wiki |
| 7 | VM extension deployment fails on Linux distributions with Python 3.x (Ubuntu 20.04, RHEL 8.1, CentOS... | Linux distributions transitioned to Python 3.x and removed legacy /usr/bin/pytho... | Reinstate /usr/bin/python symlink: For Ubuntu: sudo apt update && sudo apt insta... | 🔵 7.0 | ADO Wiki |
| 8 | VM extension deployment fails on Linux distros with Python 3.x (Ubuntu 20.04, RHEL 8.1, CentOS 8.1);... | Linux distributions transitioning to Python 3.x removed legacy /usr/bin/python e... | Reinstall python symlink: Ubuntu: sudo apt install python-is-python2; RHEL/CentO... | 🔵 7.0 | ADO Wiki |
| 9 | VM extension deployment fails on Linux VMs running Python 3.x distributions (Ubuntu 20.04, RHEL 8.1,... | Linux distributions transitioning to Python 3.x removed the legacy /usr/bin/pyth... | Reinstate /usr/bin/python symlink. Ubuntu: sudo apt update && sudo apt install p... | 🔵 7.0 | ADO Wiki |
| 10 | Rocky Linux 8 VM is shown as centos in Operating System field in Azure Portal. waagent.log shows OS:... | Python < 3.8 get_distro() function picks up /etc/centos-release symlink (alphabe... | Remove centos-release and redhat-release symbolic links: sudo rm /etc/centos-rel... | 🔵 7.0 | ADO Wiki |
| 11 | VM extension deployment fails on Linux VMs running Python 3.x with missing /usr/bin/python entrypoin... | Linux distributions transitioned to Python 3.x and removed the legacy /usr/bin/p... | Reinstall python entrypoint: For Ubuntu: sudo apt update && sudo apt install pyt... | 🔵 7.0 | ADO Wiki |
| 12 | Azure VM shows This is not a bootable disk error due to BCD corruption with missing reference to Win... | BCD (Boot Configuration Data) corruption - missing reference in the BCD store to... | OFFLINE approach: attach OS disk to rescue VM. Rebuild BCD store using standard ... | 🔵 7.0 | ADO Wiki |
| 13 | NFS mount fails with mount.nfs: requested NFS version or transport protocol is not supported | Private endpoint setup is incorrect. DNS resolution for storage.privatelink.file... | Run nslookup <storage>.file.core.windows.net and verify it resolves to correct p... | 🔵 7.0 | ADO Wiki |
| 14 | Azure VM screenshot shows 'Please wait for the TrustedInstaller' - OS hangs waiting for TrustedInsta... | TrustedInstaller (Windows Modules Installer) service is stuck during boot, typic... | Use online hang scenario troubleshooting: backup OS disk, collect memory dump vi... | 🔵 7.0 | ADO Wiki |
| 15 | Azure VM screenshot shows Windows Boot Manager menu waiting for user input to select boot partition ... | VM BCD configuration has displaybootmenu enabled with a boot delay, causing VM t... | Disable BCD displaybootmenu flag. For CRP machines: set displaybootmenu to 'no' ... | 🔵 7.0 | ADO Wiki |
| 16 | Azure Advisor Alert not triggered or alert email not received even though a recommendation was gener... | Advisor alert rules are Activity Log scoped alerts that only trigger when a reco... | 1. Check AzNS transmission via Kusto (aznscluster.southcentralus, AzNSPROD, AzNS... | 🔵 7.0 | ADO Wiki |
| 17 | Azure Advisor category score is less than 100 percent but customer has no active recommendations to ... | Customer dismissed some recommendations but the Advisor Score calculation via AD... | 1. Check dismissed recommendations via ARG in ASC. 2. Verify in Kusto (azureadvi... | 🔵 7.0 | ADO Wiki |
| 18 | Azure Advisor returns zero recommendations for newly created resources or no usage/performance-based... | Advisor needs minimum data history: general recommendations require at least 24 ... | Verify resource age. Wait at least 24 hours for general recommendations and up t... | 🔵 7.0 | ADO Wiki |
| 19 | ACSS deployment fails with ResourceNotPermittedOnDelegatedSubnet error. NIC cannot be created in sub... | The appsubnet or dbsubnet used for ACSS deployment has a delegation setup to ext... | Remove the delegation from the subnet. Query delegation: az network vnet subnet ... | 🔵 7.0 | ADO Wiki |
| 20 | ACSS registration fails with FailedToResolveIpAddressFromSapHostname. SAP VM OS is unable to resolve... | The ASCS instance cannot connect to the hostname mentioned in the error. Root ca... | Check network connectivity by pinging the hostname from the ASCS VM. Verify DNS ... | 🔵 7.0 | ADO Wiki |
| 21 | ACSS Install deployment fails with InstallScsInstallationFailed. Ansible task has failed during SCS ... | Storage account from where the deployer VM picks up the ansible Zip file had iss... | Have customer upload ansible logs container (from error message) plus sapinst_de... | 🔵 7.0 | ADO Wiki |
| 22 | ACSS Install deployment fails with AnsibleTaskExecutionFailed during OS package update (RHEL) or zyp... | Inability to reach the OS repositories (RHEL RHUI or SUSE repos) due to network ... | Review firewall rules to ensure appropriate endpoints for SUSE/RHEL are permitte... | 🔵 7.0 | ADO Wiki |
| 23 | ACSS Register operation fails with AuthorizationFailed. The user-assigned identity for the VIS does ... | The user assigned identity for the Virtual Instance for SAP (VIS) does not have ... | Assign the built-in role Azure Center for SAP Solutions Service role to the user... | 🔵 7.0 | ADO Wiki |
| 24 | Error "Failed to dismiss recommendation" when trying to dismiss Azure Advisor recommendations relate... | By design: resource locks on Databricks VMs prevent dismissal of recommendations... | Create ICM to Azure Databricks RP team to remove resource locks hindering dismis... | 🔵 7.0 | ADO Wiki |
| 25 | ACSS Monitoring Extension installation fails with OperationNotAllowed - ARM template deployment fail... | The ACSS monitoring extension was onboarded for auto-upgrade but was not added t... | A hotfix was released to disable the enableAutomaticUpgrade flag for monitoring ... | 🔵 7.0 | ADO Wiki |
| 26 | Azure Advisor recommendations not visible in portal for ACSS SAP Virtual Instance (VIS) - customer c... | Three possible causes: 1) Database type is empty or not among supported types (H... | For cause 1: Re-register VIS with correct DB type, recommendations appear within... | 🔵 7.0 | ADO Wiki |
| 27 | Cannot create Gallery Image Version - Conflict error: source image OS type, Hypervisor generation, o... | Source image properties (OS type Windows/Linux, VM generation V1/V2, OS state Ge... | Select a source image matching the Image Definition properties, or create a new ... | 🔵 7.0 | ADO Wiki |
| 28 | Gallery Image Version fails: diskControllerType mismatch - source missing NVMe support; known bug ca... | Source OS disk diskControllerTypes does not include NVMe as required by target I... | Update source disk: az resource update --ids <diskId> --set properties.supported... | 🔵 7.0 | ADO Wiki |
| 29 | Cannot create Azure Compute Gallery - 400 Bad Request: gallery name invalid per validation rule | Gallery name contains invalid characters. | Use only uppercase/lowercase letters, digits, dots and periods for gallery name. | 🔵 7.0 | ADO Wiki |
| 30 | Cannot create Gallery Image Version - 400 InvalidParameter: version name must follow Major(int).Mino... | Image Version name must follow semantic versioning: Major.Minor.Patch with numbe... | Use correct format: e.g. 1.0.0, 2024.1.0. Only numbers and periods allowed. | 🔵 7.0 | ADO Wiki |

