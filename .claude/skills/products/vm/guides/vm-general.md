# VM Vm General — 排查速查

**来源数**: 3 | **21V**: 未标注
**条目数**: 21 | **关键词**: general
**最后更新**: 2026-04-18

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Customer inquires about Intel Processor MMIO Stale Data Vulnerabilities (CVE-2022-21123, CVE-2022-21... | Vulnerabilities in certain Intel processor models allow MMIO stale data attacks;... | Azure infrastructure already mitigated; no proactive customer outreach needed; c... | 🟢 8.0 | ADO Wiki |
| 2 | 通过 ASC 创建 CRI/ICM 后立即失去访问权限（Restricted CRI），提交者包括 case owner 本人也被锁定 | ASC 近期变更了访问模型，新创建的 ICM 默认为 Restricted CRI，当前行为已知在调查中 | 1. 先在关联的 DFM case 上申请 JIT（DFM JIT 审批通过后即可访问 linked ICMs）；2. 若 JIT 失败，在 aka.ms/ic... | 🟢 8.0 | ADO Wiki |
| 3 | Customer receives Azure Safety Guard / Microsoft Azure Safeguards email warning that their Azure res... | Azure Safeguards team detected active security threat on customer subscription a... | Inform customer this request is outside CSS scope. Direct customer to reply to a... | 🟢 8.0 | ADO Wiki |
| 4 | Genomics workflow fails with 'Blob <blob> already exists and the overwrite option was set to False' | Output blob with the same name already exists in the output container and the ov... | Delete the existing output blob before resubmitting, or resubmit the workflow wi... | 🟢 8.0 | ADO Wiki |
| 5 | WaAppAgent.log shows repeated Response status code does not indicate success: 502 (cannotconnect) fo... | Third-party proxy (McAfee Client Proxy or Skyhigh Client Proxy) intercepts traff... | Check WinGuestAnalyzer Software tab for installed proxies. Disable McAfee/Skyhig... | 🟢 8.0 | ADO Wiki |
| 6 | Azure Advisor REST API/CLI returns different recommendation count than Portal GUI. API output shows ... | API/CLI lists recommendations individually per affected resource, while Portal g... | Explain to customer that API counts per impacted resource while Portal groups by... | 🟢 8.0 | ADO Wiki |
| 7 | Azure Advisor Security Score displays "No Data" instead of a numerical value; security category scor... | Latency refresh issue between Microsoft Defender for Cloud (MDC) Secure Score an... | Wait 24-48 hours for refresh to complete; compare MDC Secure Score with Advisor ... | 🟢 8.0 | ADO Wiki |
| 8 | Customer encounters "Active sessions present on Volume. Close active sessions before modifying" erro... | Active iSCSI sessions exist to the volume from one or more VMs, preventing delet... | Customer must terminate iSCSI sessions from all VMs that have active connections... | 🟢 8.0 | ADO Wiki |
| 9 | After attempting to update Elastic SAN volume size, portal shows incorrect/stale volume details inst... | Volume size update fails due to active iSCSI sessions, but portal may not immedi... | Refresh the volume details in the portal to obtain the correct (original) volume... | 🟢 8.0 | ADO Wiki |
| 10 | Azure File Sync gaps for prolonged periods. ECS_E_SERVER_CREDENTIAL_NEEDED (0x80c80300) in Telemetry... | Local server time is out of sync, causing authentication failures with the AFS m... | Set the local server time correctly. Verify NTP synchronization is working. | 🟢 8.0 | ADO Wiki |
| 11 | Azure File Sync fails with JET_errWriteConflict (HEX 0x8e5e044e / DEC -1906441138) during sync opera... | Database corruption in the Azure File Sync metadata database. | If the customer continually hits this error, escalate to engineering (PG). This ... | 🟢 8.0 | ADO Wiki |
| 12 | Azure File Sync auto-update policy (InstallLatest) does not auto-update agent to latest version | InstallLatest policy only applies during agent flighting phase - setting it afte... | Use alternative update methods: 1) Configure Microsoft Update for automatic down... | 🟢 8.0 | ADO Wiki |
| 13 | Azure File Sync heatstore corruption detected - cloud tiering not working, Event ID 9013 shows Heats... | ESE database (heatstore) corruption on the server volume | Query Event 9013 via Kusto: cluster(Xfiles).database(xsynctelemetrysf).ServerTel... | 🟢 8.0 | ADO Wiki |
| 14 | 20-30 second delay when browsing Azure File shares configured with DFS namespace showing contacting ... | Windows client redirector sequentially tries SMB (445) then NetBIOS (139) then W... | Disable the WebClient service on the client machine. Azure Files only supports S... | 🟢 8.0 | ADO Wiki |
| 15 | AIB build times out or fails before AIB timeout period is reached. Customization.log shows: Future#W... | GitHub Actions OpenID token expires or GitHub Action is misconfigured, causing t... | Redirect customer to GitHub support (https://support.github.com). Contact CSAM t... | 🟢 8.0 | ADO Wiki |
| 16 | Azure VM shows This is not a bootable disk error due to BCD corruption with missing reference to Win... | BCD (Boot Configuration Data) corruption - missing reference in the BCD store to... | OFFLINE approach: attach OS disk to rescue VM. Rebuild BCD store using standard ... | 🟢 8.0 | ADO Wiki |
| 17 | System Center Virtual Machine Manager 2016 Agent Installation can fail with the following error mess... | SCVMM 2016 Agent installation can fail with the error message: ôThere is a probl... | The installation of vcredist_x64.exe was triggered automatically by the VMM Agen... | 🔵 7.5 | KB |
| 18 | [container] VM+SCIM Process section index page |  | Section container page. No actionable content. | 🟢 8.5 | OneNote |
| 19 | [container] VM+SCIM Windows section index page |  | Section container page. No actionable content. | 🟢 8.5 | OneNote |
| 20 | Azure VPN gateway S2S connections to strongSwan VPNs (AWS) both disconnected for extended period | Misconfiguration of pre-shared key on customer side VPN gateway | Customer re-checked VPN configuration and re-configured the pre-shared key; conn... | 🟢 8.5 | OneNote |
| 21 | This article will contain a walk through of how to use Dump Insights to scan a dump or review the re... | Reference doc (no explicit root cause)... | See original document for detailed steps... | 🟡 5.0 | KB |

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/vm-general.md)
