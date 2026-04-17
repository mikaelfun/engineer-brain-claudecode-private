# P2S VPN Comprehensive Troubleshooting Guide

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-vpn-point-to-site-connection-problems

## Quick Reference: Error Codes

| Error | Root Cause | Fix |
|-------|-----------|-----|
| 798 | Client cert missing from Personal store | Re-import .pfx to Current User\Personal\Certificates |
| 0x80090326 | Root cert invalid/expired or UDR on GatewaySubnet | Remove UDR; re-upload root cert |
| 0x80092013 | CRL check blocked by proxy/firewall | Allow crl3/crl4.digicert.com |
| 800 | Outdated NIC driver | Update via Device Manager |
| 812 | RADIUS server misconfigured | Verify shared secret, NAS port type |
| 8007026f | VPN opened via shortcut | Open VPN package directly |

## Certificate Issues

### Certificate Store Locations
- Client cert (.pfx): `Current User\Personal\Certificates`
- Gateway cert (.cer): `Current User\Trusted Root CA`
- Root cert (.cer): `Local Computer\Trusted Root CA`

### Root Certificate Upload
- Must be one continuous line (no line breaks/carriage returns)
- Invalid characters in cert name cause Error "resource name invalid"

## IKEv2 Issues

### Windows KB Requirements
| OS | KB |
|----|-----|
| Server 2016 / Win10 1607 | KB4057142 |
| Win10 1703 | KB4057144 |
| Win10 1709 | KB4089848 |

Registry: `HKLM\SYSTEM\CurrentControlSet\Services\RasMan\IKEv2\DisableCertReqPayload = 1`

### macOS IKEv2 Checklist
1. Server Address = full FQDN (*.cloudapp.net)
2. Remote ID = Server Address
3. Local ID = client cert Subject
4. Auth = Certificate
5. macOS 10.11+

## DNS Issues

### Cannot Resolve On-Prem FQDNs
- Cause: Azure DNS takes precedence over local DNS
- Fix: DNS Forwarders / Conditional Forwarders / Azure Private Resolver

### Cannot Resolve Private DNS Zones
- Cause: 168.63.129.16 unreachable from P2S clients
- Fix: Private Resolver inbound IP as custom DNS on VNet

## Authentication Issues

### RADIUS Error 812
- Verify shared secret, NAS port type = Virtual (VPN)
- Check MFA Server integration

### Entra ID Token Expiry
- Refresh token default lifetime: 90 days
- Conditional access can shorten this
- To force re-auth on disconnect: set `cachesigninuser=false` in profile XML

## Network Access Issues

### SMB File Shares
- Cause: Kerberos fails without DC access
- Fix: `HKLM\SYSTEM\CurrentControlSet\Control\Lsa\DisableDomainCreds = 1`

### No Routes to Azure Resources
- Fix: Reset VPN gateway; re-download P2S client package after VNet peering changes

## Windows 11 / Intune

### Profile Repeatedly Deleted
- Cause: XML format mismatch between Intune and Windows
- Fix: Export profile from device, use device-generated XML in Intune

## Azure VPN Client Diagnostics
1. Status Logs: arrows icon bottom-right
2. Run Diagnosis: profile ... > Diagnose > Run Diagnosis
3. Collect Logs: ... > Diagnose > Show Logs Directory
4. Entra ID: Clear Saved Account if auth fails

## 21V Applicability
NOT applicable - P2S VPN Gateway features may differ in 21V (Mooncake). Entra ID auth not available in 21V.
