# Troubleshooting VPN Profile Issues in Microsoft Intune

Source: https://learn.microsoft.com/en-us/troubleshoot/mem/intune/device-configuration/troubleshoot-vpn-profiles

## Prerequisites

- Trusted Root and SCEP profiles must be installed and working on device
- VPN app must be installed before VPN profile is applied
- Group-type deployment (user/device) must be consistent across Trusted Root, SCEP, and VPN profiles

## Troubleshooting: VPN Profile Not Deployed

### Android
1. Check profile assignment to correct group
2. Verify device can sync (check LAST CHECK IN)
3. Verify Trusted Root and SCEP profiles deployed
4. If CertificateSelector cannot find matching cert, VPN profile skipped
   - Log: "Waiting for required certificates for vpn profile"
   - Check Any Purpose EKU mismatch between SCEP profile and CA template
5. Verify AnyConnect External Control option enabled

### iOS
1. Check profile assignment
2. Verify sync capability
3. Check Management Profile for VPN profile
4. Console/device logs for installation details

### Windows
1. Check profile assignment
2. Verify sync
3. Download MDM Diagnostic Information log
4. Check Event Viewer: DeviceManagement-Enterprise-Diagnostic-Provider Admin/Debug logs

## Troubleshooting: VPN Deployed But Cannot Connect

- Usually not an Intune issue
- Try manual connection with same certificate criteria
- Android/iOS: Check VPN client app logs (AnyConnect Diagnostics)
- Windows: Check Radius server logs

## Logs

| Platform | Log Location |
|----------|-------------|
| Android | Omadmlog.log (search android.vpn.client) |
| iOS | Console app on Mac, search VPN profile name |
| Windows | Event Viewer > DeviceManagement-Enterprise-Diagnostic-Provider |

## Common DNS Resolution Failure

AnyConnect log: "SOCKETSUPPORT_ERROR_GETADDRINFO failed to resolve host name" - verify VPN server hostname is resolvable.
