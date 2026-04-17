# Troubleshooting Wi-Fi Device Configuration Profiles in Microsoft Intune

Source: https://learn.microsoft.com/en-us/troubleshoot/mem/intune/device-configuration/troubleshoot-wi-fi-profiles

## Prerequisites

- Trusted Root and SCEP profiles must be installed before Wi-Fi profile
- Certificate chain must be complete on device

## Deployment Flow (Android)

1. Trusted Root certificate notification > install
2. SCEP certificate notification > install
3. Wi-Fi profile notification > install
4. Wi-Fi appears as saved network

## Troubleshooting: Wi-Fi Profile Not Deployed

1. Check profile assignment to correct group
2. Verify device sync (LAST CHECK IN)
3. Verify Trusted Root and SCEP profiles deployed
4. Android: If CertificateSelector cannot match cert, Wi-Fi skipped
   - Log: "Skipping Wifi profile because it is pending certificates"
   - Check Any Purpose EKU mismatch
5. Windows: Download MDM Diagnostic Information log

## Troubleshooting: Deployed But Cannot Connect

- Usually not an Intune issue
- Try manual connection with same cert criteria
- Check Radius server logs for connectivity errors

## Users Not Getting New Profile After Password Change

- Set up guest Wi-Fi as fallback
- Enable auto-connect settings
- Test with small group first
- Verify SSID and Pre-Shared Key correct

## All Wi-Fi Profiles Report Failing

- Android Enterprise: When multiple Wi-Fi profiles deployed and one fails, all report failing (even working ones)

## Wi-Fi Profile Reports Failing But Works

- May be reporting error on Android
- Update Intune app to version 2021.05.02 or later

## Logs

| Platform | Log | Search Term |
|----------|-----|------------|
| Android | Omadmlog.log | wifimgr |
| iOS | Console app on Mac | Wi-Fi profile name |
| Windows | Event Viewer DeviceManagement-Enterprise-Diagnostic-Provider | WiFi |
