# Windows VPN Custom Policy via Intune OMA-URI

Source: MCVKB/Intune/Windows/Windows VPN Custom Policy.md

## Always On VPN via Custom OMA-URI

- **Setting name**: Always On
- **Data type**: String
- **OMA-URI**: `./Device/Vendor/VPNv2/{ProfileName}/AlwaysOn`
- **Value**: `True`

## VPN Profile Storage Locations

| Tunnel Type | Path |
|------------|------|
| Device tunnel | `%ALLUSERSPROFILE%\Microsoft\Network\Connections\Pbk\` |
| User VPN profile | `%APPDATA%\Microsoft\Network\Connections\Pbk\` (when signed in as that user) |

## References

- [Create VPN profile via Custom OMA-URI](https://blogs.technet.microsoft.com/tune_in_to_windows_intune/2015/01/30/create-a-vpn-profile-using-microsoft-intune-standalone-via-custom-oma-uris/)
- [VPNv2 CSP](https://learn.microsoft.com/en-us/windows/client-management/mdm/vpnv2-csp)
