# S2S VPN Intermittent Disconnection Troubleshooting

> Source: [Troubleshoot Azure site-to-site VPN disconnects intermittently](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-site-to-site-disconnected-intermittently)

## Prerequisites

- Verify gateway type: Portal → Virtual network gateway → Overview → check Type (Route-based vs Policy-based)

## 7-Step Troubleshooting

### Step 1: Validate On-Premises VPN Device
- Check if device is on the [validated VPN device list](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-about-vpn-devices#devicetable)
- Contact device manufacturer for compatibility issues if not validated
- Verify device configuration matches [sample configurations](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-about-vpn-devices#editing)

### Step 2: Check Security Association Settings (Policy-Based Only)
- Local network gateway definition must match on-premises VPN device config
- VNet, subnets, and ranges must be identical on both sides

### Step 3: Check UDR or NSG on GatewaySubnet
- UDR on GatewaySubnet may restrict some traffic while allowing others
- This causes VPN to appear unreliable for certain traffic types

### Step 4: Check "One VPN Tunnel per Subnet Pair" (Policy-Based Only)
- On-premises device must use one VPN tunnel per subnet pair for policy-based gateways

### Step 5: Check Security Association Pair Limits
- Limit: 200 subnet Security Association pairs
- Formula: (Azure VNet subnets) × (local subnets) must be ≤ 200
- Exceeding this causes sporadic subnet disconnections

### Step 6: Check On-Premises VPN Device External Interface IP
- If the VPN device's Internet-facing IP is included in the Local network gateway address space → sporadic disconnections
- Remove the VPN device public IP from the LNG address space

### Step 7: Check Perfect Forward Secrecy (PFS)
- PFS can cause disconnection problems
- If PFS is enabled on VPN device, try disabling it
- Update the virtual network gateway IPsec policy accordingly

## Key Diagnostic Approach
1. Determine if disconnections affect all traffic or specific subnets
2. All traffic → Steps 1, 2, 7
3. Specific subnets → Steps 3, 4, 5, 6
