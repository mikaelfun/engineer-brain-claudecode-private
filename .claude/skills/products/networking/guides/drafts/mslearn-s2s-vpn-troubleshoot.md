# S2S VPN Troubleshooting Checklist

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-site-to-site-cannot-connect

## Quick Triage: First Steps

1. **Reset Azure VPN Gateway** + reset tunnel on on-prem device
2. If still failing, follow checklist below

## 8-Step Checklist

### Step 1: Validate On-Prem VPN Device
- Check against [validated device list](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-about-vpn-devices#devicetable)
- Contact device vendor for compatibility if not validated
- Verify device configuration against Azure sample configs

### Step 2: Verify Shared Key (PSK)
```powershell
Get-AzVirtualNetworkGatewayConnectionSharedKey -Name <conn> -ResourceGroupName <rg>
```
- Azure portal: VPN Gateway > Connections > select > Authentication Type
- Must match EXACTLY on both sides

### Step 3: Verify VPN Peer IPs
- Local Network Gateway IP in Azure = on-prem device public IP
- Azure gateway IP configured on on-prem device = Azure VPN Gateway public IP

### Step 4: Check UDR and NSG on GatewaySubnet
- Remove UDR and NSG from GatewaySubnet
- Test connectivity
- If resolved, audit UDR/NSG rules (ensure UDP 500, 4500, ESP not blocked)

### Step 5: On-Prem Device External IP
- On-prem device Internet-facing IP should NOT be in Local Network address space
- Including it creates routing loop causing sporadic disconnections

### Step 6: Subnet Match (Policy-Based Only)
- VNet address spaces must match EXACTLY on both sides
- Local Network Gateway subnets must match on-prem local definitions EXACTLY
- No supernets allowed for policy-based

### Step 7: Health Probe
```
https://<VPN-Gateway-IP>:8081/healthprobe
```
- Active/Active second IP: port 8083
- Healthy response = XML with instance info
- No response = gateway unhealthy or NSG blocking
- Note: Basic SKU does NOT respond to health probe

### Step 8: Perfect Forward Secrecy (PFS)
- PFS mismatch between Azure and on-prem causes intermittent disconnections
- Disable PFS on on-prem device OR configure matching PFS settings on Azure IPsec policy

## Common Error Patterns

| Symptom | Likely Cause | Quick Fix |
|---------|-------------|-----------|
| Tunnel never connects | PSK mismatch or peer IP wrong | Steps 2-3 |
| Intermittent drops | PFS mismatch or external IP in LNG | Steps 5, 8 |
| Traffic not flowing (tunnel up) | Policy-based subnet mismatch | Step 6 |
| Sudden stop after config change | PSK changed or UDR added | Steps 2, 4 |

## VPN Gateway Does NOT Respond To
- ICMP on local address
- Health probe on Basic SKU

## 21V Applicability
Applicable - S2S VPN Gateway available in 21V (Mooncake). Health probe and diagnostic logs work the same way.
