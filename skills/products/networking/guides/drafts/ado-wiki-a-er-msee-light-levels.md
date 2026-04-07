---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/Advanced Troubleshooting/Validate MSEE Light Levels Within Optimal Range"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FAdvanced%20Troubleshooting%2FValidate%20MSEE%20Light%20Levels%20Within%20Optimal%20Range"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Validate MSEE Light Levels Within Optimal Range

[[_TOC_]]

## Overview

This article details how to check light levels on a specific interface associated with a customer's circuit. Applies to both ExpressRoute and ExpressRoute Direct.

## Description

Light levels measure the strength of the light transmitted from and received to the port optic. Each port optic needs to transmit and receive light within an acceptable threshold for physical connectivity.

- **RX** = light reading received on the MSEE from customer equipment
- **TX** = light reading transmitted by the MSEE to customer equipment

## Acceptable Ranges

| Device | Acceptable Tx & Rx Range |
|--------|--------------------------|
| Cisco  | 0 to -10 dBm             |
| Juniper| 5 to -5 dBm              |

> If light levels are outside range → engage a TA in the ExpressRoute Teams channel, providing all relevant info **with Jarvis action links**.

## When to Check

Check light levels when there is a suspected physical connectivity issue.

## Method 1 — Via ASC (ExpressRoute Direct Only)

Navigate to the ExpressRoute Direct resource in ASC → Jarvis Dashboard link → view Rx/Tx for Link 1 (Port 1) and Link 2 (Port 2).

For more detail on ExR Direct physical connectivity: [ExpressRoute Direct Down](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/547320/ExpressRoute-Direct-Down?anchor=physical-connectivity-issues)

## Method 2 — Manually via Jarvis (ExpressRoute & ExR Direct)

### Step 1 — Find the Interface Name

In ASC → ExpressRoute circuit properties → VRF section → port/interface name is listed.

Alternatively, use DumpCircuitInfo to find port name.

**Identify Cisco vs Juniper by interface name format:**
- Cisco: `PortChannel0.12345` or `TenGigabitEthernet1/2/3.12345`
- Juniper: `xe-1/1/9:3.49`

### Step 2 — Check Light Levels

#### Cisco

Command format: `show hw-module subslot {slot}/{subslot} transceiver {port} status`

Example for `TenGigabitEthernet2/3/0`:
```
show hw-module subslot 2/3 transceiver 0 status
```

**Port Channel:** First find active members:
```
show interfaces port-channel {n}
```
Then run `show hw-module subslot` for each member.

Run via Jarvis ACIS commands on the appropriate MSEE device.

#### Juniper

Command format: `show interfaces diagnostics optics {interface}`

Example for `xe-1/1/10:0`:
```
show interfaces diagnostics optics xe-1/1/10:0
```

Run via Jarvis ACIS commands on the appropriate MSEE device.

## Next Steps if Out of Range

1. Collect all relevant information including Jarvis action links
2. Engage a TA in the [ExpressRoute Teams Channel](https://teams.microsoft.com/l/channel/19%3a5693c71a57e34093a0d7c4dae35b05ed%40thread.skype/Express%2520Route?groupId=c3e00ac7-3f76-4350-ba3b-e335a6bbbe21)

# Contributors
@F84DD2EA-3ED8-6E71-BBD4-86A47F7D8B78
