# Disk Azure Stack Edge: Networking — 排查速查

**来源数**: 14 | **21V**: 全部适用
**最后更新**: 2026-04-07
**关键词**: 403, azure-stack-edge, blobdownloadfailed, bmc, bug, bug-7297787, certificates, clustered-state, compute, configuring-device

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Need to replace data disk or power supply unit (PSU) on Azure Stack Edge device; hardware component failure | Data disks and PSUs are Field Replaceable Units (FRUs) that may fail and require replacement | Open an ICM with Data Box Edge Platform team for any data disk and PSU replacements; these are FRUs handled by the platf | 🟢 8.5 | [ADO Wiki] |
| 2 📋 | Unable to access Kubernetes dashboard on Azure Stack Edge; Get-HcsKubernetesDashboardToken returns empty; neither cert n | Bug in ASE builds 2301/2303: K8s v1.24 no longer auto-generates service account tokens; refreshing K | Enable support session; RDP to ASE; edit kubernetesdashboard.yaml at G:\HcsExternal\Kubernetes\KubeVM\LinuxScripts\kuber | 🟢 8.5 | [ADO Wiki] |
| 3 📋 | Unable to access Azure Stack Edge Local WebUI; Lost heartbeat alerts in Azure portal; hcsmgmt service in failed state | Bug 7297787 (fixed post update 1911): hcsmgmt service fails due to ArgumentNullException when trying | Enter support session; Stop-ClusterResource hcsmgmt; reg delete HKLM\Cluster\HCS\Datastore\WorkEngineInfo\<failed-job-gu | 🟢 8.5 | [ADO Wiki] |
| 4 📋 | Need to change MTU value on Azure Stack Edge network interface/port for proper network communication | Customer internal network requires specific MTU size; ASE default MTU may not match customer network | Enter Support Session; run Get-HcsNetInterface to view current MTU values per port; run Set-HcsNetInterface -InterfaceAl | 🟢 8.5 | [ADO Wiki] |
| 5 📋 | Azure Stack Edge Pro 2 Port 1 or Port 2 (10/1GbE RJ45) fails to establish link, links intermittently, or only links when | Two known issues on Private Preview units: 1) RJ45 connector design issue causing inconsistent elect | Issue #1: Push cable firmly and hold 10sec; try bending latch tab up on RJ45 connector; secure cable in working position | 🟢 8.5 | [ADO Wiki] |
| 6 📋 | Unable to update IP subnet on virtual network (vNET) for Azure Stack Edge VM; VM still shows old IP; new NIC creation fa | Another port was previously configured for compute and disconnected after reconfiguration; ASE devic | Option 1: Delete vSwitch on old port via PowerShell, restart ASE, create new vNIC with new IP, remove old vNIC. Option 2 | 🟢 8.5 | [ADO Wiki] |
| 7 📋 | Unable to write data to Azure Stack Edge; upload failed error; hcsmgmt logs show BlobImmutableDueToLegalHold error with  | Legal hold set on storage container associated with the ASE device makes blobs immutable; prevents u | Check hcsmgmt.Primary logs for BlobImmutableDueToLegalHold error; remove legal hold from the storage container following | 🟢 8.5 | [ADO Wiki] |
| 8 📋 | Cannot update IP Subnet for Virtual Network on Azure Stack Edge VM; subnet shows old IP config; cannot deploy new VM or  | Another port was previously configured for compute and disconnected, leaving stale compute configura | Option 1: Delete vSwitch on old compute port via PowerShell, restart ASE, recreate vNIC. Option 2: Reconnect Port and co | 🟢 8.5 | [ADO Wiki] |
| 9 📋 | Cannot configure web proxy with NTLM authentication from Azure Stack Edge Local WebUI; authentication option not availab | NTLM proxy configuration was removed from Local UI; Local UI does not support NTLM Authentication pr | Configure proxy via console support session using: Set-HcsWebProxy -AuthType NTLM -ConnectionURI <> -UserName <> | 🟢 8.5 | [ADO Wiki] |
| 10 📋 | Unable to apply web proxy on Azure Stack Edge from Local WebUI; errors: web proxy URL not valid or could not reach web p | Required URL patterns not whitelisted on customer proxy; specifically msftconnecttest.com/connecttes | Test proxy with FQDN and port, then IP and port; run diagnostics and collect support package; test connectivity from Sup | 🟢 8.5 | [ADO Wiki] |
| 11 📋 | Azure Stack Edge Local WebUI stuck on Configuring the Device screen on first access after imaging | Bug in ASE software builds predating 2012: ConfigState set to Uninitialized or Standalone instead of | Access BMC Virtual Console; verify state with Get-HcsApplianceInfo and Get-HcsControllerSetupInformation; set ConfigStat | 🟢 8.5 | [ADO Wiki] |
| 12 📋 | Azure Stack Edge Pro 2 Port 1 or Port 2 LEDs always off, port completely fails to establish link under any circumstances | LAN Transformer component has defective solder joints from degraded plating finish on SMT pins (Priv | No field mitigation; customer must return appliance and order replacement unit | 🟢 8.5 | [ADO Wiki] |
| 13 📋 | Adding VHD image to Azure Stack Edge fails with BlobDownloadFailed error after 40-50 minutes; image upload times out on  | Portal UI retry count of 6 is insufficient for low bandwidth networks (~20-30 Mbps); download times  | Upload image via ARM Templates or PowerShell cmdlets instead of Portal; if ARM also fails contact TA or create IcM; PG c | 🟢 8.5 | [ADO Wiki] |
| 14 📋 | Azure Stack Edge throws subject name error when uploading self-signed certificates created with New-SelfSignedCertificat | DeviceName and/or NodeSerialNumber parameters in New-SelfSignedCertificate command do not match the  | Verify that DeviceName and NodeSerialNumber parameters used in New-SelfSignedCertificate exactly match the values config | 🟢 8.5 | [ADO Wiki] |

## 快速排查路径

1. Need to replace data disk or power supply unit (PSU) on Azure Stack Edge device; → Open an ICM with Data Box Edge Platform team for any data disk and PSU replacements; these are FRUs  `[来源: ado-wiki]`
2. Unable to access Kubernetes dashboard on Azure Stack Edge; Get-HcsKubernetesDash → Enable support session; RDP to ASE; edit kubernetesdashboard `[来源: ado-wiki]`
3. Unable to access Azure Stack Edge Local WebUI; Lost heartbeat alerts in Azure po → Enter support session; Stop-ClusterResource hcsmgmt; reg delete HKLM\Cluster\HCS\Datastore\WorkEngin `[来源: ado-wiki]`
4. Need to change MTU value on Azure Stack Edge network interface/port for proper n → Enter Support Session; run Get-HcsNetInterface to view current MTU values per port; run Set-HcsNetIn `[来源: ado-wiki]`
5. Azure Stack Edge Pro 2 Port 1 or Port 2 (10/1GbE RJ45) fails to establish link,  → Issue #1: Push cable firmly and hold 10sec; try bending latch tab up on RJ45 connector; secure cable `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/ase-networking.md#排查流程)
