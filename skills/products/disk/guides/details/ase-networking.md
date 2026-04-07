# Disk Azure Stack Edge: Networking — 综合排查指南

**条目数**: 14 | **草稿融合数**: 3 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-a-changing-network-interface-mtu-value.md, ado-wiki-a-using-az-stackedge-cmdlets.md, ado-wiki-ase-elevated-support-session.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Changing the Port / Network Interface MTU Value on Azure Stack Edge
> 来源: ADO Wiki (ado-wiki-a-changing-network-interface-mtu-value.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Stack Edge/Networking/Changing the Network Interface MTU Value"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Stack%20Edge%2FNetworking%2FChanging%20the%20Network%20Interface%20MTU%20Value"
3. importDate: "2026-04-06"
4. type: troubleshooting-guide
5. In some cases, the customer may want to change the MTU size on one of the Network Interfaces (Ports) of the Azure Stack Edge:
6. - In computer networking, the maximum transmission unit (MTU) is the size of the largest protocol data unit (PDU) that can be communicated in a single network layer transaction.
7. - Reference: [Maximum transmission unit - Wikipedia](https://en.wikipedia.org/wiki/Maximum_transmission_unit)
8. The MTU size can be changed via Support Session using PowerShell. First connect to the ASE Device via Support Session with the customer.
9. Reference: [Elevated Support Session - Overview](https://supportability.visualstudio.com/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki/2242974/Elevated-Support-Session)
10. Once in the Support Session, run the following command to view information for the interfaces:

### Phase 2: Summary
> 来源: ADO Wiki (ado-wiki-a-using-az-stackedge-cmdlets.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Stack Edge/Manage Device/Using Az.StackEdge CMDlets"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Stack%20Edge%2FManage%20Device%2FUsing%20Az.StackEdge%20CMDlets"
3. importDate: "2026-04-06"
4. type: troubleshooting-guide
5. When customers prefer to automate certain tasks with scripts and Azure Resource Manager (ARM) is not sufficient, use this guide to understand how to set up the Az.StackEdge module and use Az.StackEdge cmdlets.
6. 1. If not previously installed, install the Azure Az PowerShell module.
7. 2. Connect to the Azure account the Azure Stack Edge was set up under:
8. 3. Confirm the correct subscription is set, as the account may have multiple subscriptions:
9. If the incorrect subscription is set, run the command:
10. Set-AzContext -Subscription "xxxxxxxx-xxxxxxxx-xxxxxxxx-xxxxxxxx"

### Phase 3: Entering a Support Session on Azure Data Box Gateway & Azure Stack Edge
> 来源: ADO Wiki (ado-wiki-ase-elevated-support-session.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Stack Edge/Manage Device/Elevated Support Session"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Stack%20Edge%2FManage%20Device%2FElevated%20Support%20Session"
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. 1. Connect via PowerShell (as Admin):
6. Set-Item WSMan:\localhost\Client\TrustedHosts $ip -Concatenate -Force
7. Enter-PSSession -ComputerName $ip -Credential $ip\EdgeUser -ConfigurationName Minishell
8. 2. Run `Enable-HcsSupportAccess` - copy the generated key
9. 3. Decrypt key using Support Password Decrypter
10. 4. Close the PowerShell window

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Need to replace data disk or power supply unit (PSU) on Azure Stack Edge device; hardware component failure | Data disks and PSUs are Field Replaceable Units (FRUs) that may fail and require replacement | Open an ICM with Data Box Edge Platform team for any data disk and PSU replacements; these are FRUs handled by the platf | 🟢 8.5 | [ADO Wiki] |
| 2 | Unable to access Kubernetes dashboard on Azure Stack Edge; Get-HcsKubernetesDashboardToken returns empty; neither cert n | Bug in ASE builds 2301/2303: K8s v1.24 no longer auto-generates service account tokens; refreshing K | Enable support session; RDP to ASE; edit kubernetesdashboard.yaml at G:\HcsExternal\Kubernetes\KubeVM\LinuxScripts\kuber | 🟢 8.5 | [ADO Wiki] |
| 3 | Unable to access Azure Stack Edge Local WebUI; Lost heartbeat alerts in Azure portal; hcsmgmt service in failed state | Bug 7297787 (fixed post update 1911): hcsmgmt service fails due to ArgumentNullException when trying | Enter support session; Stop-ClusterResource hcsmgmt; reg delete HKLM\Cluster\HCS\Datastore\WorkEngineInfo\<failed-job-gu | 🟢 8.5 | [ADO Wiki] |
| 4 | Need to change MTU value on Azure Stack Edge network interface/port for proper network communication | Customer internal network requires specific MTU size; ASE default MTU may not match customer network | Enter Support Session; run Get-HcsNetInterface to view current MTU values per port; run Set-HcsNetInterface -InterfaceAl | 🟢 8.5 | [ADO Wiki] |
| 5 | Azure Stack Edge Pro 2 Port 1 or Port 2 (10/1GbE RJ45) fails to establish link, links intermittently, or only links when | Two known issues on Private Preview units: 1) RJ45 connector design issue causing inconsistent elect | Issue #1: Push cable firmly and hold 10sec; try bending latch tab up on RJ45 connector; secure cable in working position | 🟢 8.5 | [ADO Wiki] |
| 6 | Unable to update IP subnet on virtual network (vNET) for Azure Stack Edge VM; VM still shows old IP; new NIC creation fa | Another port was previously configured for compute and disconnected after reconfiguration; ASE devic | Option 1: Delete vSwitch on old port via PowerShell, restart ASE, create new vNIC with new IP, remove old vNIC. Option 2 | 🟢 8.5 | [ADO Wiki] |
| 7 | Unable to write data to Azure Stack Edge; upload failed error; hcsmgmt logs show BlobImmutableDueToLegalHold error with  | Legal hold set on storage container associated with the ASE device makes blobs immutable; prevents u | Check hcsmgmt.Primary logs for BlobImmutableDueToLegalHold error; remove legal hold from the storage container following | 🟢 8.5 | [ADO Wiki] |
| 8 | Cannot update IP Subnet for Virtual Network on Azure Stack Edge VM; subnet shows old IP config; cannot deploy new VM or  | Another port was previously configured for compute and disconnected, leaving stale compute configura | Option 1: Delete vSwitch on old compute port via PowerShell, restart ASE, recreate vNIC. Option 2: Reconnect Port and co | 🟢 8.5 | [ADO Wiki] |
| 9 | Cannot configure web proxy with NTLM authentication from Azure Stack Edge Local WebUI; authentication option not availab | NTLM proxy configuration was removed from Local UI; Local UI does not support NTLM Authentication pr | Configure proxy via console support session using: Set-HcsWebProxy -AuthType NTLM -ConnectionURI <> -UserName <> | 🟢 8.5 | [ADO Wiki] |
| 10 | Unable to apply web proxy on Azure Stack Edge from Local WebUI; errors: web proxy URL not valid or could not reach web p | Required URL patterns not whitelisted on customer proxy; specifically msftconnecttest.com/connecttes | Test proxy with FQDN and port, then IP and port; run diagnostics and collect support package; test connectivity from Sup | 🟢 8.5 | [ADO Wiki] |
| 11 | Azure Stack Edge Local WebUI stuck on Configuring the Device screen on first access after imaging | Bug in ASE software builds predating 2012: ConfigState set to Uninitialized or Standalone instead of | Access BMC Virtual Console; verify state with Get-HcsApplianceInfo and Get-HcsControllerSetupInformation; set ConfigStat | 🟢 8.5 | [ADO Wiki] |
| 12 | Azure Stack Edge Pro 2 Port 1 or Port 2 LEDs always off, port completely fails to establish link under any circumstances | LAN Transformer component has defective solder joints from degraded plating finish on SMT pins (Priv | No field mitigation; customer must return appliance and order replacement unit | 🟢 8.5 | [ADO Wiki] |
| 13 | Adding VHD image to Azure Stack Edge fails with BlobDownloadFailed error after 40-50 minutes; image upload times out on  | Portal UI retry count of 6 is insufficient for low bandwidth networks (~20-30 Mbps); download times  | Upload image via ARM Templates or PowerShell cmdlets instead of Portal; if ARM also fails contact TA or create IcM; PG c | 🟢 8.5 | [ADO Wiki] |
| 14 | Azure Stack Edge throws subject name error when uploading self-signed certificates created with New-SelfSignedCertificat | DeviceName and/or NodeSerialNumber parameters in New-SelfSignedCertificate command do not match the  | Verify that DeviceName and NodeSerialNumber parameters used in New-SelfSignedCertificate exactly match the values config | 🟢 8.5 | [ADO Wiki] |
