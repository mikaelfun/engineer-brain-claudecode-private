# Intune Windows LAPS — 排查速查

**来源数**: 1 | **21V**: 全部适用
**条目数**: 5 | **最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Windows LAPS Event 10059: 'Local admin password solution is not enabled for this tenant' — passwo... | The 'Enable Azure AD Local Administrator Password Solution (LAPS)' toggle in ... | Navigate to Azure AD > Devices > Device settings, toggle 'Enable Azure AD Local Administrator Pas... | 🟢 8.5 | ADO Wiki |
| 2 | Windows LAPS Reset-LapsPassword fails with hr:0x80070190 (ERROR_THREAD_MODE_ALREADY_BACKGROUND) a... | LAPS is not enabled at the tenant level in Azure AD Device Settings | Enable LAPS in Azure AD Device Settings (toggle to Yes). The 0x80070190 error and Event 10028 are... | 🟢 8.5 | ADO Wiki |
| 3 | Windows LAPS Event 10059 HTTP 400: 'The device {deviceId} in {tenantId} could not be found' — pas... | The device object has been removed from the Azure AD tenant | Verify device registration status with 'dsregcmd /status' on the client. If device was deleted, r... | 🟢 8.5 | ADO Wiki |
| 4 | Windows LAPS Event 10059 HTTP 403: 'The specified request is not allowed for tenant' — authorizat... | The device has been disabled in Azure AD | Check device status in Azure AD portal — re-enable the device if it was disabled. LAPS requires t... | 🟢 8.5 | ADO Wiki |
| 5 | Windows LAPS Event 10025: 'Azure discovery failed' with error 0x80072EE7 (ERROR_ADAL_INTERNET_NAM... | Network connectivity issue — the client cannot resolve enterpriseregistration... | Verify network connectivity from the client by running 'curl https://enterpriseregistration.windo... | 🟢 8.5 | ADO Wiki |

## 快速排查路径
1. Navigate to Azure AD > Devices > Device settings, toggle 'Enable Azure AD Local Administrator Password Solution (LAPS)' to Yes. Can also enable via Gr `[来源: ADO Wiki]`
2. Enable LAPS in Azure AD Device Settings (toggle to Yes). The 0x80070190 error and Event 10028 are secondary symptoms of the tenant-level LAPS setting  `[来源: ADO Wiki]`
3. Verify device registration status with 'dsregcmd /status' on the client. If device was deleted, re-register the device to Azure AD. The device must ex `[来源: ADO Wiki]`
4. Check device status in Azure AD portal — re-enable the device if it was disabled. LAPS requires the device to be in enabled state for password rotatio `[来源: ADO Wiki]`
5. Verify network connectivity from the client by running 'curl https://enterpriseregistration.windows.net/ -D -' in an admin command prompt. If it fails `[来源: ADO Wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/windows-laps.md#排查流程)
