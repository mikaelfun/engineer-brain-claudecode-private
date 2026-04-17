# Windows VPN Custom OMA-URI Policy Guide

> Source: MCVKB/Intune/Windows/Windows VPN Custom Policy.md
> Status: draft (pending SYNTHESIZE)

## Custom OMA-URI for VPN

### Always On VPN Example
| Setting | Value |
|---------|-------|
| Setting name | Always On |
| Data type | String |
| OMA-URI | `./Device/Vendor/VPNv2/{ProfileName}/AlwaysOn` |
| Value | True |

## VPN Profile Storage Paths

### Device Tunnel
```
%ALLUSERSPROFILE%\Microsoft\Network\Connections\Pbk\
```

### User VPN Profile
```
%APPDATA%\Microsoft\Network\Connections\Pbk\
```
(Accessible only when signed in with that user)

## References
- [Create VPN profile via Custom OMA-URIs](https://blogs.technet.microsoft.com/tune_in_to_windows_intune/2015/01/30/create-a-vpn-profile-using-microsoft-intune-standalone-via-custom-oma-uris/)
- [Configuring custom Windows 10 VPN profiles using Intune](https://technofocusin.wordpress.com/2015/08/07/configuring-custom-windows-10-vpn-profiles-using-intune/)
