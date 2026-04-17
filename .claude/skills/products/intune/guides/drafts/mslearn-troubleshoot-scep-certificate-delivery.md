# SCEP Certificate Delivery Troubleshooting (Step 5)

> Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/mem/intune/certificates/troubleshoot-scep-certificate-delivery)

## Verify on Certification Authority
- Check CA for issued certificate entry after NDES processes the request

## Device-Side Verification

### Android
- Device administrator: notification prompts cert install
- Android Enterprise / Samsung Knox: automatic, silent install
- Use third-party cert viewing app to verify
- OMADM log key entries:
  - Root cert state: `CERT_INSTALL_REQUESTED → CERT_INSTALLING → CERT_INSTALL_SUCCESS`
  - SCEP cert state: `CERT_ENROLLED → CERT_INSTALL_REQUESTED → CERT_INSTALLING → CERT_ACCESS_REQUESTED → CERT_ACCESS_GRANTED`
  - GetCACert and GetCACaps requests should return `200 OK`

### iOS/iPadOS
- Settings → General → Device Management → view certificate
- Debug log entries:
  - Synchronous URL requests to NDES (GetCACert, GetCACaps, PKIOperation)
  - `Profile 'www.windowsintune.com.SCEP...' installed.`

### Windows
- Event Viewer → DeviceManagement-Enterprise-Diagnostic-Provider → Admin
- **Event 39**: "SCEP: Certificate installed successfully"
- certmgr.msc verification:
  - Trusted Root Certification Authorities → root cert present (Issued To = Issued By)
  - Personal → Certificates → SCEP cert present (Issued By = CA name)

## Troubleshooting Failures
- **Android**: Review OMA DM log errors
- **iOS**: Review device debug log errors
- **Windows**: Check Event log; delivery errors typically related to Windows operations, not Intune
