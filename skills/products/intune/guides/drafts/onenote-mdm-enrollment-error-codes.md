# MDM Enrollment Error Code Reference

> Source: OneNote — Mooncake POD Support Notebook / Intune / Windows TSG / Windows Enrollment

## Error Code Table

| Code | ID | Error Message |
|------|-----|---------------|
| 0x80180001 | MENROLL_E_DEVICE_MESSAGE_FORMAT_ERROR | Server connectivity error |
| 0x80180002 | MENROLL_E_DEVICE_AUTHENTICATION_ERROR | Account/device authentication problem |
| 0x80180003 | MENROLL_E_DEVICE_AUTHORIZATION_ERROR | User not authorized to enroll |
| 0x80180004 | MENROLL_E_DEVICE_CERTIFCATEREQUEST_ERROR | Certificate error |
| 0x80180005 | MENROLL_E_DEVICE_CONFIGMGRSERVER_ERROR | Server connectivity error |
| 0x80180006 | MENROLL_E_DEVICE_CONFIGMGRSERVER_ERROR | Server connectivity error |
| 0x80180007 | MENROLL_E_DEVICE_INVALIDSECURITY_ERROR | Authentication problem |
| 0x80180008 | MENROLL_E_DEVICE_UNKNOWN_ERROR | Server connectivity error |
| 0x80180009 | MENROLL_E_ENROLLMENT_IN_PROGRESS | Another enrollment in progress |
| 0x8018000A | MENROLL_E_DEVICE_ALREADY_ENROLLED | Device already enrolled |
| 0x8018000D | MENROLL_E_DISCOVERY_SEC_CERT_DATE_INVALID | Certificate date invalid |
| 0x8018000E | MENROLL_E_PASSWORD_NEEDED | Password needed |
| 0x8018000F | MENROLL_E_WAB_ERROR | Authentication problem |
| 0x80180010 | MENROLL_E_CONNECTIVITY | Connectivity error |
| 0x80180012 | MENROLL_E_INVALIDSSLCERT | Invalid SSL certificate |
| 0x80180013 | MENROLL_E_DEVICECAPREACHED | Device limit reached |
| 0x80180014 | MENROLL_E_DEVICENOTSUPPORTED | Device not supported |
| 0x80180015 | MENROLL_E_NOTSUPPORTED | Feature not supported |
| 0x80180016 | MENROLL_E_NOTELIGIBLETORENEW | Renewal rejected |
| 0x80180017 | MENROLL_E_INMAINTENANCE | Service in maintenance |
| 0x80180018 | MENROLL_E_USERLICENSE | License error |

## Common Troubleshooting Steps

1. **0x80180002 / 0x80180003**: Check user Intune license assignment and MDM scope in Entra ID
2. **0x8018000A**: Device already enrolled — unenroll first or check for stale enrollment entries in `HKLM\Software\Microsoft\Enrollments`
3. **0x80180013**: Check device enrollment limit in Intune portal → Devices → Enrollment restrictions
4. **0x80180004 / 0x8018000D / 0x80180012**: Verify SSL/TLS certificates, check proxy/firewall not intercepting traffic

## 21v Applicability

All error codes apply to 21v (Mooncake) environment. Ensure MDM discovery URLs point to `.partner.microsoftonline.cn` endpoints.
