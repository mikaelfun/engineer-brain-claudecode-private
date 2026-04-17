# INTUNE Windows LAPS — 已知问题详情

**条目数**: 6 | **生成日期**: 2026-04-17

---

## Quick Troubleshooting Path

### Step 1: Windows LAPS client fails to update password to Azure AD; Event ID 10025 with error 0x80072EE7 (INTERNET_NAME_NOT_RESOLVED) in LAPS Operational log
**Solution**: Verify connectivity: curl https://enterpriseregistration.windows.net/ -D - from admin cmd; check proxy/firewall rules; if Reset-LapsPassword -Verbose also fails, confirms network issue
`[Source: onenote, Score: 9.5]`

### Step 2: Windows LAPS Event 10059: 'Local admin password solution is not enabled for this tenant' — password backup to Azure AD fails
**Solution**: Navigate to Azure AD > Devices > Device settings, toggle 'Enable Azure AD Local Administrator Password Solution (LAPS)' to Yes. Can also enable via Graph API PUT to /policies/deviceRegistrationPolicy with {localAdminPassword:{isEnabled:true}}
`[Source: ado-wiki, Score: 9.0]`

### Step 3: Windows LAPS Reset-LapsPassword fails with hr:0x80070190 (ERROR_THREAD_MODE_ALREADY_BACKGROUND) and Event 10028 'LAPS failed to update Azure Active...
**Solution**: Enable LAPS in Azure AD Device Settings (toggle to Yes). The 0x80070190 error and Event 10028 are secondary symptoms of the tenant-level LAPS setting being disabled
`[Source: ado-wiki, Score: 9.0]`

### Step 4: Windows LAPS Event 10059 HTTP 400: 'The device {deviceId} in {tenantId} could not be found' — password backup fails with error_missing_device
**Solution**: Verify device registration status with 'dsregcmd /status' on the client. If device was deleted, re-register the device to Azure AD. The device must exist and be enabled in Azure AD for LAPS password backup to work
`[Source: ado-wiki, Score: 9.0]`

### Step 5: Windows LAPS Event 10059 HTTP 403: 'The specified request is not allowed for tenant' — authorization_error when backing up password
**Solution**: Check device status in Azure AD portal — re-enable the device if it was disabled. LAPS requires the device to be in enabled state for password rotation and backup
`[Source: ado-wiki, Score: 9.0]`

### Step 6: Windows LAPS Event 10025: 'Azure discovery failed' with error 0x80072EE7 (ERROR_ADAL_INTERNET_NAME_NOT_RESOLVED) — LAPS cannot reach Azure endpoint
**Solution**: Verify network connectivity from the client by running 'curl https://enterpriseregistration.windows.net/ -D -' in an admin command prompt. If it fails, work with network team to ensure the endpoint is accessible (firewall/proxy rules)
`[Source: ado-wiki, Score: 9.0]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Windows LAPS client fails to update password to Azure AD; Event ID 10025 with... | Client cannot resolve enterpriseregistration.windows.net DNS endpoint due to ... | Verify connectivity: curl https://enterpriseregistration.windows.net/ -D - fr... | 9.5 | onenote |
| 2 | Windows LAPS Event 10059: 'Local admin password solution is not enabled for t... | The 'Enable Azure AD Local Administrator Password Solution (LAPS)' toggle in ... | Navigate to Azure AD > Devices > Device settings, toggle 'Enable Azure AD Loc... | 9.0 | ado-wiki |
| 3 | Windows LAPS Reset-LapsPassword fails with hr:0x80070190 (ERROR_THREAD_MODE_A... | LAPS is not enabled at the tenant level in Azure AD Device Settings | Enable LAPS in Azure AD Device Settings (toggle to Yes). The 0x80070190 error... | 9.0 | ado-wiki |
| 4 | Windows LAPS Event 10059 HTTP 400: 'The device {deviceId} in {tenantId} could... | The device object has been removed from the Azure AD tenant | Verify device registration status with 'dsregcmd /status' on the client. If d... | 9.0 | ado-wiki |
| 5 | Windows LAPS Event 10059 HTTP 403: 'The specified request is not allowed for ... | The device has been disabled in Azure AD | Check device status in Azure AD portal — re-enable the device if it was disab... | 9.0 | ado-wiki |
| 6 | Windows LAPS Event 10025: 'Azure discovery failed' with error 0x80072EE7 (ERR... | Network connectivity issue — the client cannot resolve enterpriseregistration... | Verify network connectivity from the client by running 'curl https://enterpri... | 9.0 | ado-wiki |
