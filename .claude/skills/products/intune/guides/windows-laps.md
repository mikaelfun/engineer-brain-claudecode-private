# INTUNE Windows LAPS — 排查速查

**来源数**: 2 | **21V**: 全部适用
**条目数**: 6 | **最后更新**: 2026-04-17

## 快速排查路径

1. **Windows LAPS client fails to update password to Azure AD; Event ID 10025 with error 0x80072EE7 (INTERNET_NAME_NOT_RESOLVED) in LAPS Operational log**
   → Verify connectivity: curl https://enterpriseregistration.windows.net/ -D - from admin cmd; check proxy/firewall rules; if Reset-LapsPassword -Verbose also fails, confirms network issue `[onenote, 🟢 9.5]`

2. **Windows LAPS Event 10059: 'Local admin password solution is not enabled for this tenant' — password backup to Azure AD fails**
   → Navigate to Azure AD > Devices > Device settings, toggle 'Enable Azure AD Local Administrator Password Solution (LAPS)' to Yes. Can also enable via Graph API PUT to /policies/deviceRegistrationPoli... `[ado-wiki, 🟢 9.0]`

3. **Windows LAPS Reset-LapsPassword fails with hr:0x80070190 (ERROR_THREAD_MODE_ALREADY_BACKGROUND) and Event 10028 'LAPS failed to update Azure Active Directory with the new password'**
   → Enable LAPS in Azure AD Device Settings (toggle to Yes). The 0x80070190 error and Event 10028 are secondary symptoms of the tenant-level LAPS setting being disabled `[ado-wiki, 🟢 9.0]`

4. **Windows LAPS Event 10059 HTTP 400: 'The device {deviceId} in {tenantId} could not be found' — password backup fails with error_missing_device**
   → Verify device registration status with 'dsregcmd /status' on the client. If device was deleted, re-register the device to Azure AD. The device must exist and be enabled in Azure AD for LAPS passwor... `[ado-wiki, 🟢 9.0]`

5. **Windows LAPS Event 10059 HTTP 403: 'The specified request is not allowed for tenant' — authorization_error when backing up password**
   → Check device status in Azure AD portal — re-enable the device if it was disabled. LAPS requires the device to be in enabled state for password rotation and backup `[ado-wiki, 🟢 9.0]`

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Windows LAPS client fails to update password to Azure AD; Event ID 10025 with error 0x80072EE7 (I... | Client cannot resolve enterpriseregistration.windows.net DNS endpoint due to network filtering, p... | Verify connectivity: curl https://enterpriseregistration.windows.net/ -D - from admin cmd; check ... | 🟢 9.5 | onenote: Mooncake POD Support Notebook/POD/VMS... |
| 2 | Windows LAPS Event 10059: 'Local admin password solution is not enabled for this tenant' — passwo... | The 'Enable Azure AD Local Administrator Password Solution (LAPS)' toggle in Azure AD Device Sett... | Navigate to Azure AD > Devices > Device settings, toggle 'Enable Azure AD Local Administrator Pas... | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FEndpoint%20Security%2FWindows%20LAPS%20(Cloud%20LAPS)) |
| 3 | Windows LAPS Reset-LapsPassword fails with hr:0x80070190 (ERROR_THREAD_MODE_ALREADY_BACKGROUND) a... | LAPS is not enabled at the tenant level in Azure AD Device Settings | Enable LAPS in Azure AD Device Settings (toggle to Yes). The 0x80070190 error and Event 10028 are... | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FEndpoint%20Security%2FWindows%20LAPS%20(Cloud%20LAPS)) |
| 4 | Windows LAPS Event 10059 HTTP 400: 'The device {deviceId} in {tenantId} could not be found' — pas... | The device object has been removed from the Azure AD tenant | Verify device registration status with 'dsregcmd /status' on the client. If device was deleted, r... | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FEndpoint%20Security%2FWindows%20LAPS%20(Cloud%20LAPS)) |
| 5 | Windows LAPS Event 10059 HTTP 403: 'The specified request is not allowed for tenant' — authorizat... | The device has been disabled in Azure AD | Check device status in Azure AD portal — re-enable the device if it was disabled. LAPS requires t... | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FEndpoint%20Security%2FWindows%20LAPS%20(Cloud%20LAPS)) |
| 6 | Windows LAPS Event 10025: 'Azure discovery failed' with error 0x80072EE7 (ERROR_ADAL_INTERNET_NAM... | Network connectivity issue — the client cannot resolve enterpriseregistration.windows.net | Verify network connectivity from the client by running 'curl https://enterpriseregistration.windo... | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FEndpoint%20Security%2FWindows%20LAPS%20(Cloud%20LAPS)) |

> 本 topic 有排查工作流 → [排查工作流](workflows/windows-laps.md)
> → [已知问题详情](details/windows-laps.md)
