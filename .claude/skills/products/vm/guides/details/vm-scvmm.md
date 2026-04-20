# VM SCVMM — 综合排查指南

**条目数**: 11 | **草稿融合数**: 0 | **Kusto 查询融合**: 0
**生成日期**: 2026-04-18

> ⚠️ 本 topic 为 on-premises SCVMM 内容，所有条目来自 ContentIdea KB。

---

### Issue 1: Build numbers and Update Rollups for System Center 2016 Virtual Machine Manager 
**ID**: vm-contentidea-kb-004 | **来源**: KB | **分数**: 🟡 4.0

**完整症状**:
Build numbers and Update Rollups for System Center 2016 Virtual Machine Manager can be found at:https://social.technet.microsoft.com/wiki/contents/articles/15361.system-center-virtual-machine-manager-list-of-build-numbers.aspx#E

**根因**: Reference doc (no explicit root cause)

**方案**: See original document for detailed steps

**评分明细**: 来源质量=2 | 时效性=2 | 验证强度=0 | 21V适用性=0

---

### Issue 2: Scenario Description Contact SCVMM - Host Cluster Library Server Management SCVM
**ID**: vm-contentidea-kb-009 | **来源**: KB | **分数**: 🟡 4.0

**完整症状**:
Scenario Description Contact SCVMM - Host Cluster Library Server Management SCVMM management consists of three main areas. Hyper-V/Vmware Host management, Cluster management, and Library Management. SCS MON T2 Team - NA <SCSMONT2Team@service.microsoft.com> SCEM POD Tier 2 and Tier 3 <SCEMPOD@service.microsoft.com> SCVMM - Host does not respond and needs attention error Host not responding and/or Host needs attention errors are related to communications issues from the SCVMM Server to the SCVMM A

**根因**: Reference doc (no explicit root cause)

**方案**: See original document for detailed steps

**评分明细**: 来源质量=2 | 时效性=2 | 验证强度=0 | 21V适用性=0

---

### Issue 3: Scenario Failures in VM creation or management Scoping VM creation failures Key 
**ID**: vm-contentidea-kb-011 | **来源**: KB | **分数**: 🟡 4.0

**完整症状**:
Scenario Failures in VM creation or management Scoping VM creation failures Key data points to check: Do we fail to deploy to all Hyper-V hosts\\Clusters or just specific ones?Do we fail to deploy just a specific VM template or any time we try to create a VM?What exactly fails? VHD creation, VM configuration, VM startup, VM customization?What is the full text of the failure with error number and hex code? Scoping VM management failures Key data points to check: What is the full text of the failu

**根因**: Reference doc (no explicit root cause)

**方案**: See original document for detailed steps

**评分明细**: 来源质量=2 | 时效性=2 | 验证强度=0 | 21V适用性=0

---

### Issue 4: Scenario Host not responding and/or Host needs attention errors are related to c
**ID**: vm-contentidea-kb-012 | **来源**: KB | **分数**: 🟡 4.0

**完整症状**:
Scenario Host not responding and/or Host needs attention errors are related to communications issues from the SCVMM Server to the SCVMM Agent on a managed host machine. Scoping Host not responding and/or Host needs attention errors manifest themselves in many different scenarios. For example, a VM deployment may encounter a failure. The root of the problem isn't always related to the VM deployment, the failure may occur if SCVMM is unable to communicate with the Host agent and/or received an une

**根因**: Reference doc (no explicit root cause)

**方案**: See original document for detailed steps

**评分明细**: 来源质量=2 | 时效性=2 | 验证强度=0 | 21V适用性=0

---

### Issue 5: Scenario SCVMM management consists of three main areas. Hyper-V/Vmware Host mana
**ID**: vm-contentidea-kb-013 | **来源**: KB | **分数**: 🟡 4.0

**完整症状**:
Scenario SCVMM management consists of three main areas. Hyper-V/Vmware Host management, Cluster management, and Library Management Scoping SCVMM 2012 R2 Host requirements: Windows Server 2008 R2, Windows Server 2008 R2 SP1, Windows Server 2012 Standard, Datacenter, Windows Server 2012 R2 Standard, Datacenter. SCVMM 2012 R2 SQL requirements: SQL Server 2008 R2 SP3 Standard, Datacenter, SQL Server 2012 Enterprise, Standard (64-bit), SQL Server 2012 SP2 Enterprise, Standard (64 bit), SQL Server 201

**根因**: Reference doc (no explicit root cause)

**方案**: solution and re are trying to re-add it?Is the Host located on the same n

**评分明细**: 来源质量=2 | 时效性=2 | 验证强度=0 | 21V适用性=0

---

### Issue 6: Scenario SCVMM console crashes either randomly or when performing a specific tas
**ID**: vm-contentidea-kb-014 | **来源**: KB | **分数**: 🟡 4.0

**完整症状**:
Scenario SCVMM console crashes either randomly or when performing a specific task. Scoping Key data points to check when scoping console crashesDoes the console crash randomly or when performing specific actions?If the console crashes when performing specific actions, are there specific VMs or Hosts that are involved in those actions that always seem to cause the crashWhen the crash occurs, when you log back into the console are there always specific jobs that have failed that seem to precipitat

**根因**: Reference doc (no explicit root cause)

**方案**: See original document for detailed steps

**评分明细**: 来源质量=2 | 时效性=2 | 验证强度=0 | 21V适用性=0

---

### Issue 7: ScenarioThe SCVMM Service VMMService.exe will not start, is failing periodically
**ID**: vm-contentidea-kb-015 | **来源**: KB | **分数**: 🟡 4.0

**完整症状**:
ScenarioThe SCVMM Service VMMService.exe will not start, is failing periodically, or is crashing. Scoping If the VMMService.exe will not start it is probably due to one of a few things:The SCVMM service account password is wrong (Try to logon with the service account)The SCVMM service account is locked (Check Active Directory)We do not have access to the SQL server (Create a TXT file on the desktop and rename it to SQL.UDL, see if you can connect to the SQL server)The Service account for SCVMM h

**根因**: due to one of a few things:The SCVMM service account password is wrong (Try to logon with the service account)The SCVMM service account is locked (Check Active Directory)We do not have access to the S

**方案**: See original document for detailed steps

**评分明细**: 来源质量=2 | 时效性=2 | 验证强度=0 | 21V适用性=0

---

### Issue 8: Scenario When attempting to create a new virtual machine in Virtual Machine Mana
**ID**: vm-contentidea-kb-016 | **来源**: KB | **分数**: 🟡 4.0

**完整症状**:
Scenario When attempting to create a new virtual machine in Virtual Machine Manager, the job may fail with an error. Scoping Key data points to check when scoping console crashes: Do we fail to deploy to all Hyper-V hosts\\Clusters or just specific ones? Do we fail to deploy just a specific VM template or any time we try to create a VM? What exactly fails? VHD creation, VM configuration, VM startup, VM customization? What is the full text of the failure with error number and hex code? Data Colle

**根因**: Reference doc (no explicit root cause)

**方案**: See original document for detailed steps

**评分明细**: 来源质量=2 | 时效性=2 | 验证强度=0 | 21V适用性=0

---

### Issue 9: Security operations group noticed that during an SCVMM operation with a field Hy
**ID**: vm-contentidea-kb-018 | **来源**: KB | **分数**: 🟡 4.0

**完整症状**:
Security operations group noticed that during an SCVMM operation with a field Hyper-V server credentials were sent in clear text.RunAs accounts in VMM can be used in two major scenariosò VMM management server initiates some action remotely. In this case, WinRM with CredSSP is used. ò Local agent on managed server initiates some action. The agent itself is always running as Local Service, so if thereÆs a mechanism to use RunAs accounts for such actionsùit should be something like secondary logon 

**根因**: because the session is initiated locally, so the credentials are not passed over the network

**方案**: See original document for detailed steps

**评分明细**: 来源质量=2 | 时效性=2 | 验证强度=0 | 21V适用性=0

---

### Issue 10: A public version of this is available on the following blogs: https://blogs.tech
**ID**: vm-contentidea-kb-021 | **来源**: KB | **分数**: 🟡 4.0

**完整症状**:
A public version of this is available on the following blogs: https://blogs.technet.microsoft.com/momteam/2017/10/25/system-center-2016-now-supports-tls1-2-security-protocols/ https://blogs.technet.microsoft.com/scvmm/2017/10/25/system-center-2016-now-supports-tls1-2-security-protocols/ https://blogs.technet.microsoft.com/servicemanager/2017/10/25/system-center-2016-now-supports-tls1-2-security-protocols/ https://blogs.technet.microsoft.com/orchestrator/2017/10/25/system-center-2016-now-supports

**根因**: Reference doc (no explicit root cause)

**方案**: See original document for detailed steps

**评分明细**: 来源质量=2 | 时效性=2 | 验证强度=0 | 21V适用性=0

---

### Issue 11: Summary This article details common debug logging steps for WinRM, BITS, and WMI
**ID**: vm-contentidea-kb-028 | **来源**: KB | **分数**: 🟡 4.0

**完整症状**:
Summary This article details common debug logging steps for WinRM, BITS, and WMI providers in Microsoft System Center 2008 and later versions of Virtual Machine Manager environments. These logs may be collected and analyzed for a more thorough investigation of underlying root cause isssues in VMM support incidents. These logs tend to grow very large, and it is highly recommended that you limit to your repro to as short a time period as possible and use these logs only as after exhausting other o

**根因**: Reference doc (no explicit root cause)

**方案**: See original document for detailed steps

**评分明细**: 来源质量=2 | 时效性=2 | 验证强度=0 | 21V适用性=0

---

## 排查参考

| 场景 | 关键排查点 |
|------|-----------|
| VMMService 不启动 | 检查服务账号密码、账号锁定、SQL 连接 |
| Host Not Responding | SCVMM Server → Agent 通信问题（WinRM/BITS/WMI） |
| Console Crash | 检查特定 VM/Host 操作触发、内存转储 |
| VM 创建失败 | VHD 创建/网络配置/模板问题 |
| 凭据明文传输 | RunAs 账号配置、CredSSP vs 本地 Agent |
| TLS 1.2 兼容 | System Center 2016 TLS 1.2 补丁 |
| Debug Logging | WinRM/BITS/WMI provider 日志收集 |
