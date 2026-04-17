# INTUNE Windows 通用问题 — 排查速查

**来源数**: 3 | **21V**: 全部适用
**条目数**: 9 | **最后更新**: 2026-04-17

## 快速排查路径

1. **Intune-managed Windows device cannot receive remote commands or policy updates immediately; device only syncs at default 8-hour check-in interval**
   → 1) Check Push reg key exists under HKLM\SOFTWARE\Microsoft\Enrollments\{EnrollmentID}\Push and verify expiry time is in future. 2) Verify WNS service is running and stable. 3) Ensure dependency ser... `[onenote, 🟢 9.5]`

2. **Intune-managed Windows device cannot receive WNS push notifications; Event ID 1116: Device Compact Ticket request failed with error 0x80070426**
   → 1) Enable Microsoft Account Sign-in Assistant service; 2) Enable Network Connection Broker (ncbservice); 3) Verify device ticket exists in registry; 4) Check WNS TCP via netstat / findstr ESTABLISH... `[onenote, 🟢 9.5]`

3. **Collecting diagnostic logs from Intune portal fails or takes ~8 hours. Issue happens on almost all customer devices. WNS push notification (Event ID 42/2415) appears but device is not woken up for ...**
   → 1. Check GPO: Computer Configuration > Start Menu and Taskbar > Notifications > Turn off notifications network usage must be Disabled or Not Configured. 2. Ensure registry NoCloudApplicationNotific... `[onenote, 🟢 9.5]`

4. **Device Inventory 策略已分配但 Resource Explorer 中看不到设备的硬件属性数据**
   → 1. 确认设备 Windows 版本满足最低要求（Win11 23H2 需 22631.2506+KB5031455）；2. 检查 C:\Program Files\Microsoft Device Inventory Agent\Logs（InventoryAdaptor.log 和 IntuneInventoryHarvesterLog*.log）；3. 确认服务状态：services.... `[ado-wiki, 🟢 9.0]`

5. **Intune 管理员通过 Portal 触发 On-Demand Remediation (Run Remediation) 远程操作后设备未执行脚本，WNS 推送通知未到达设备**
   → 1. 检查设备注册表是否 ToastEnabled=0（被禁用）；2. 启用 Toast Notification（取消 GPO 限制或调整 Intune 策略）；3. 确认 WNS 服务正常运行；4. 注意：On-Demand Remediation 不需要脚本分配到用户/设备组，但必须启用 WNS `[ado-wiki, 🟢 9.0]`

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Intune-managed Windows device cannot receive remote commands or policy updates immediately; devic... | Windows Push Notification Services (WNS) channel is not working. Common causes: (1) HKLM\SOFTWARE... | 1) Check Push reg key exists under HKLM\SOFTWARE\Microsoft\Enrollments\{EnrollmentID}\Push and ve... | 🟢 9.5 | onenote: MCVKB/Intune/Windows/Intune Remote co... |
| 2 | Intune-managed Windows device cannot receive WNS push notifications; Event ID 1116: Device Compac... | WNS push channel depends on hidden service dependencies: (1) Network Connection Broker (ncbservic... | 1) Enable Microsoft Account Sign-in Assistant service; 2) Enable Network Connection Broker (ncbse... | 🟢 9.5 | onenote: MCVKB/Intune/Windows/Intune Remote co... |
| 3 | Collecting diagnostic logs from Intune portal fails or takes ~8 hours. Issue happens on almost al... | Group Policy (GPO) has cloud notifications disabled. Registry key NoCloudApplicationNotification ... | 1. Check GPO: Computer Configuration > Start Menu and Taskbar > Notifications > Turn off notifica... | 🟢 9.5 | onenote: Mooncake POD Support Notebook/POD/VMS... |
| 4 | Device Inventory 策略已分配但 Resource Explorer 中看不到设备的硬件属性数据 | Device Inventory Agent MSI 安装最长需 4 小时；或设备 Windows 版本不满足最低要求（Win11 23H2/22H2/21H2 或 Win10 22H2 特定 ... | 1. 确认设备 Windows 版本满足最低要求（Win11 23H2 需 22631.2506+KB5031455）；2. 检查 C:\Program Files\Microsoft Devi... | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FAdminUI%2FDevice%20Inventory) |
| 5 | Intune 管理员通过 Portal 触发 On-Demand Remediation (Run Remediation) 远程操作后设备未执行脚本，WNS 推送通知未到达设备 | 设备上 Toast Notification 被 GPO 或 Intune 策略禁用，导致 Windows Push Notification Service 本地无法接收云通知（Event I... | 1. 检查设备注册表是否 ToastEnabled=0（被禁用）；2. 启用 Toast Notification（取消 GPO 限制或调整 Intune 策略）；3. 确认 WNS 服务正常运... | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevice%20Config%20Features%20Restrictions%20and%20Custom%2FWindows%2FRemediations) |
| 6 | Intune Endpoint Security firewall rule deployment fails with error 0x80070057 (E_INVALIDARG); one... | Common causes: 1) Invalid file path with typos in environment variables (e.g., extra space in %Pr... | 1) Identify the failing rule via Event Log EventID 404 under DeviceManagement-Enterprise-Diagnost... | 🟢 8.5 | onenote: Mooncake POD Support Notebook/POD/VMS... |
| 7 | Endpoint Security Firewall 端口配置使用逗号分隔时报 Invalid regEx format 错误 | Firewall 端口配置的格式验证使用正则表达式，逗号分隔格式不符合预期的输入格式 | 参考: https://internal.evergreen.microsoft.com/en-us/topic/8da0116c-a406-4690-ec83-7cc4e4e332db。使用正... | 🟢 8.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevice%20Config%20Features%20Restrictions%20and%20Custom%2FWindows) |
| 8 | Domain joined machines with Microsoft Intune full client report error 0x80041013 in the Intune Ad... | Domain joined machines make an RPC call to a domain controller for authentication. If the machine... | This is a cosmetic error and PG stated it will not be fixed. The error only shows in the admin po... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4016390) |
| 9 | Windows device shows as Not Compliant for Firewall configuration | McAfee Personal Firewall set as primary firewall on the device | Uninstall&nbsp;McAfee Personal Firewall | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4527625) |
