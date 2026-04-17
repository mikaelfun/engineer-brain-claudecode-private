# INTUNE Windows 通用问题 — 已知问题详情

**条目数**: 9 | **生成日期**: 2026-04-17

---

## Quick Troubleshooting Path

### Step 1: Intune-managed Windows device cannot receive remote commands or policy updates immediately; device only syncs at default 8-hour check-in interval
**Solution**: 1) Check Push reg key exists under HKLM\SOFTWARE\Microsoft\Enrollments\{EnrollmentID}\Push and verify expiry time is in future. 2) Verify WNS service is running and stable. 3) Ensure dependency services are started: ncbservice and Microsoft Account Sign-in Assistant. 4) Check netstat for ESTABLISHED connections to WNS IPs (e.g., 20.198.x.x). 5) Check Event Viewer > Microsoft-Windows-PushNotification-Platform Operational for Event ID 1116. 6) Verify device ticket at HKU\.DEFAULT\Software\Microsof
`[Source: onenote, Score: 9.5]`

### Step 2: Intune-managed Windows device cannot receive WNS push notifications; Event ID 1116: Device Compact Ticket request failed with error 0x80070426
**Solution**: 1) Enable Microsoft Account Sign-in Assistant service; 2) Enable Network Connection Broker (ncbservice); 3) Verify device ticket exists in registry; 4) Check WNS TCP via netstat | findstr ESTABLISHED; 5) Trigger sync to re-establish Push channel
`[Source: onenote, Score: 9.5]`

### Step 3: Collecting diagnostic logs from Intune portal fails or takes ~8 hours. Issue happens on almost all customer devices. WNS push notification (Event I...
**Solution**: 1. Check GPO: Computer Configuration > Start Menu and Taskbar > Notifications > Turn off notifications network usage must be Disabled or Not Configured. 2. Ensure registry NoCloudApplicationNotification = 0. 3. Enable Cloud Notifications/WindowsMDMPush in GPO.
`[Source: onenote, Score: 9.5]`

### Step 4: Device Inventory 策略已分配但 Resource Explorer 中看不到设备的硬件属性数据
**Solution**: 1. 确认设备 Windows 版本满足最低要求（Win11 23H2 需 22631.2506+KB5031455）；2. 检查 C:\Program Files\Microsoft Device Inventory Agent\Logs（InventoryAdaptor.log 和 IntuneInventoryHarvesterLog*.log）；3. 确认服务状态：services.msc 中检查 Microsoft Device Inventory Agent 和 Declared Configuration Service；4. 初次数据采集可能需要最长 24 小时
`[Source: ado-wiki, Score: 9.0]`

### Step 5: Intune 管理员通过 Portal 触发 On-Demand Remediation (Run Remediation) 远程操作后设备未执行脚本，WNS 推送通知未到达设备
**Solution**: 1. 检查设备注册表是否 ToastEnabled=0（被禁用）；2. 启用 Toast Notification（取消 GPO 限制或调整 Intune 策略）；3. 确认 WNS 服务正常运行；4. 注意：On-Demand Remediation 不需要脚本分配到用户/设备组，但必须启用 WNS
`[Source: ado-wiki, Score: 9.0]`

### Step 6: Intune Endpoint Security firewall rule deployment fails with error 0x80070057 (E_INVALIDARG); one bad rule in an Atomic SyncML block causes all sub...
**Solution**: 1) Identify the failing rule via Event Log EventID 404 under DeviceManagement-Enterprise-Diagnostics-Provider. 2) Check registry HKLM\SYSTEM\CurrentControlSet\Services\SharedAccess\Parameters\FirewallPolicy\Mdm\FirewallRules for created rules. 3) Use Test-IntuneFirewallRules PowerShell script (https://github.com/markstan/Test-IntuneFirewallRules) to identify bad rules. 4) Use SyncML Viewer to trace individual rule creation. 5) Fix the bad rule parameters and redeploy.
`[Source: onenote, Score: 8.5]`

### Step 7: Endpoint Security Firewall 端口配置使用逗号分隔时报 Invalid regEx format 错误
**Solution**: 参考: https://internal.evergreen.microsoft.com/en-us/topic/8da0116c-a406-4690-ec83-7cc4e4e332db。使用正确的端口分隔格式
`[Source: ado-wiki, Score: 8.0]`

### Step 8: Domain joined machines with Microsoft Intune full client report error 0x80041013 in the Intune Admin console for firewall policies.
**Solution**: This is a cosmetic error and PG stated it will not be fixed. The error only shows in the admin portal and can be safely ignored. Firewall policies are applied correctly.
`[Source: contentidea-kb, Score: 7.5]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Intune-managed Windows device cannot receive remote commands or policy update... | Windows Push Notification Services (WNS) channel is not working. Common cause... | 1) Check Push reg key exists under HKLM\SOFTWARE\Microsoft\Enrollments\{Enrol... | 9.5 | onenote |
| 2 | Intune-managed Windows device cannot receive WNS push notifications; Event ID... | WNS push channel depends on hidden service dependencies: (1) Network Connecti... | 1) Enable Microsoft Account Sign-in Assistant service; 2) Enable Network Conn... | 9.5 | onenote |
| 3 | Collecting diagnostic logs from Intune portal fails or takes ~8 hours. Issue ... | Group Policy (GPO) has cloud notifications disabled. Registry key NoCloudAppl... | 1. Check GPO: Computer Configuration > Start Menu and Taskbar > Notifications... | 9.5 | onenote |
| 4 | Device Inventory 策略已分配但 Resource Explorer 中看不到设备的硬件属性数据 | Device Inventory Agent MSI 安装最长需 4 小时；或设备 Windows 版本不满足最低要求（Win11 23H2/22H2/2... | 1. 确认设备 Windows 版本满足最低要求（Win11 23H2 需 22631.2506+KB5031455）；2. 检查 C:\Program ... | 9.0 | ado-wiki |
| 5 | Intune 管理员通过 Portal 触发 On-Demand Remediation (Run Remediation) 远程操作后设备未执行脚本，W... | 设备上 Toast Notification 被 GPO 或 Intune 策略禁用，导致 Windows Push Notification Servi... | 1. 检查设备注册表是否 ToastEnabled=0（被禁用）；2. 启用 Toast Notification（取消 GPO 限制或调整 Intune... | 9.0 | ado-wiki |
| 6 | Intune Endpoint Security firewall rule deployment fails with error 0x80070057... | Common causes: 1) Invalid file path with typos in environment variables (e.g.... | 1) Identify the failing rule via Event Log EventID 404 under DeviceManagement... | 8.5 | onenote |
| 7 | Endpoint Security Firewall 端口配置使用逗号分隔时报 Invalid regEx format 错误 | Firewall 端口配置的格式验证使用正则表达式，逗号分隔格式不符合预期的输入格式 | 参考: https://internal.evergreen.microsoft.com/en-us/topic/8da0116c-a406-4690-e... | 8.0 | ado-wiki |
| 8 | Domain joined machines with Microsoft Intune full client report error 0x80041... | Domain joined machines make an RPC call to a domain controller for authentica... | This is a cosmetic error and PG stated it will not be fixed. The error only s... | 7.5 | contentidea-kb |
| 9 | Windows device shows as Not Compliant for Firewall configuration | McAfee Personal Firewall set as primary firewall on the device | Uninstall&nbsp;McAfee Personal Firewall | 7.5 | contentidea-kb |
