# Monitor MMA 代理通用问题与迁移

**Entries**: 22 | **21V**: PARTIAL | **Sources**: 2
**Last updated**: 2026-04-07

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | VM keeps reconnecting to a Log Analytics Workspace after being disconnected -... | Azure Policy or Microsoft Defender for Cloud auto-provisioning is configured ... | 1) Check if Azure Policy is enforcing agent deployment to a workspace 2) Chec... | 8.5 | ADO Wiki |
| 2 | MMA extension uninstall fails - HealthService remains in partial deletion sta... | HealthService is stuck in a partial deletion state after a failed or interrup... | Delete HealthService manually: 1) Without reboot: open elevated cmd, run sc.e... | 8.5 | ADO Wiki |
| 3 | Microsoft Monitoring Agent (MMA) for SCOM exhibits high handle count after ap... | Code defect in SCOM 2019 UR3 (Bug 879292) causes the MMA agent to accumulate ... | If the agent is SCOM code tree: transfer incident to System Center Operations... | 8.5 | ADO Wiki |
| 4 | All data types suddenly stop ingesting to the Log Analytics Workspace and App... | Customer disables public access for ingestion under network isolation setting... | Re-enable public access for ingestion in the workspace/AI component network i... | 8.5 | ADO Wiki |
| 5 | Agents behind Log Analytics Gateway unable to connect to workspace - no heart... | Older OMS Gateway versions (< 1.0.448.0) have pinned Baltimore CyberTrust Roo... | 1) Update OMS Gateway to version 1.0.448.0 or later 2) Before upgrading, back... | 8.5 | ADO Wiki |
| 6 | MMA installation fails with Error 25211: Failed to install performance counte... | Default permissions on the Security Event Log registry key (HKLM\SYSTEM\Curre... | 1) Backup registry key HKLM\SYSTEM\CurrentControlSet\Services\Eventlog\Securi... | 8.5 | ADO Wiki |
| 7 | MMA agent logs error Keyset does not exist (0x80090016) in event viewer or ag... | Stale or corrupted MMA certificates stored in the Local Machine certificate s... | 1) Stop Microsoft Monitoring Agent service 2) Open mmc.exe, add Certificates ... | 8.5 | ADO Wiki |
| 8 | MMA agent proxy settings are erased/cleared once the agent is connected to a ... | SCOM Management Group is configured to distribute or override proxy settings ... | 1) Confirm MMA is integrated with SCOM 2) Check if SCOM is integrated with a ... | 8.5 | ADO Wiki |
| 9 | On-Demand Assessment not submitting data due to connectivity issues with OMS | Computer unable to establish connection to OMS workspace; Event Viewer shows ... | 1) Check if computer ever submitted data by querying workspace for assessment... | 8.5 | ADO Wiki |
| 10 | On-Demand Assessment solutions (SQL/AD/AD Replication/SCOM) not uploading dat... | Prerequisites not met: SQL Assessment requires agent on SQL Server + .NET 4; ... | Verify prerequisites for the specific solution type: 1) SQL Assessment — agen... | 8.5 | ADO Wiki |
| 11 | SCOM console throws 'System.ServiceModel.CommunicationException: An error occ... | TLS/SSL configuration issue - the .NET Framework is not configured to use str... | 1) Open Registry Editor 2) Navigate to HKLM\SOFTWARE\Microsoft\.NETFramework ... | 8.5 | ADO Wiki |
| 12 | MMA agent proxy settings configured manually on the agent are not working as ... | When MMA agent is integrated with SCOM Management Group, the proxy settings c... | 1) Check SCOM console for proxy configuration (Administration > Settings > Sy... | 8.5 | ADO Wiki |
| 13 | MMA (Microsoft Monitoring Agent) has sporadic delay uploading custom logs and... | Bug in the Management Pack for custom log uploads. The agent reports upload e... | Restart the MMA agent to temporarily clear the stuck queue. For recurring cas... | 6.0 | ADO Wiki |
| 14 | MMA installation fails with MSI error Event ID 1013: 'The Microsoft Monitorin... | SCOM/Service Manager roles include a native HealthService version that cannot... | This is expected behavior by design. Customer should use SCOM 2016 or 2019 wi... | 6.0 | ADO Wiki |
| 15 | MMA agent configurations cannot be saved when updated via the Control Panel a... | Default permissions for built-in Administrators group changed from Full Contr... | Take a registry backup. Restore default permissions (Full Control for System ... | 6.0 | ADO Wiki |
| 16 | Using MMA downloaded from Azure portal in a SCOM 1801 environment causes IIS ... | The APM (Application Performance Monitoring) feature in SCOM 2016 Agent cause... | Option 1: Install the SCOM agent instead of the Azure portal MMA. Option 2: R... | 6.0 | ADO Wiki |
| 17 | MMA installation fails with MSI error Event ID 1013: 'Upgrade is not supporte... | The currently installed MMA agent version (e.g., SCOM 1801 RTM 8.0.13053.0) i... | Remove the existing MMA agent and perform a clean install of the Azure Log An... | 6.0 | ADO Wiki |
| 18 | MMA service fails to start with Event ID 7024 (Service Control Manager): 'The... | Default permissions on registry key HKLM\SYSTEM\CurrentControlSet\services\He... | Restore default permissions on HKLM\SYSTEM\CurrentControlSet\services\HealthS... | 6.0 | ADO Wiki |
| 19 | OMS Gateway Log shows Event ID 106, Error level: 'ERROR TcpConnection - Inval... | The OMS Gateway server does not have the Hybrid Runbook Worker client certifi... | On the OMS Gateway server, run from elevated PowerShell: 'Add-OMSGatewayAllow... | 6.0 | ADO Wiki |
| 20 | MMA agent fails to connect to Log Analytics workspace with error 0x80090016 K... | Server was cloned from a golden image with MMA already installed and configur... | Stop MMA service → open MMC Certificates snap-in → export and delete existing... | 5.5 | MS Learn |
| 21 | Microsoft Monitoring Agent proxy settings are erased after connecting to SCOM... | Operations Manager specifies a different proxy address that overrides MMA pro... | Option A: Disable SCOM proxy server in Azure Log Analytics Settings Wizard th... | 5.5 | MS Learn |
| 22 | IIS application pool crashes after deploying MMA downloaded from Azure portal... | The Application Performance Monitoring (APM) feature in SCOM 2016 Operations ... | Workaround Option 1: Install the SCOM agent from the SCOM package instead of ... | 4.0 | ADO Wiki |

> This topic has fusion troubleshooting guide with detailed workflow
> [Full troubleshooting workflow](details/agent-mma-general.md)
