---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/How To/ExpressRoute Gateway Packet Capture"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FHow%20To%2FExpressRoute%20Gateway%20Packet%20Capture"
importDate: "2026-04-18"
type: troubleshooting-guide
---

# ExpressRoute Gateway Packet Capture

## Description

How to collect ExpressRoute gateway packet captures via ASC.

## How to Run

1. In ASC, find the ExpressRoute gateway
2. Select Diagnostics tab
3. Select ExpressRoute Gateway Packet Capture

## Start Capture

Leave both `List Of Gateway Instances` and `Capture Filter String` blank for simplicity.
Have customer reproduce the issue while capture is running.

## Stop Capture

Change Packet Capture Operation to `Stop Packet Capture` and select Run.
Keep same options as when starting.

## Options

### Packet Capture Feature
- `OuterPacketCapture`: uses netsh trace start capture=yes
- `OuterPacketCaptureVerbose`: includes Microsoft-Windows-TCPIP provider at level 0x05

### List Of Gateway Instances
Comma separated (0,1,2...). Empty = capture all instances.

### Capture Filter String
Supports netsh capture filters:
- `IPv4.Address=<IP>` - filter by IP
- `Protocol=<num>` - filter by protocol (6=TCP, 17=UDP)
- `Ethernet.Address=<MAC>` - filter by MAC
- `PacketTruncateBytes=<value>` - limit bytes per packet

## Stop Capture Fails

If ASC reports timeout or unhandled server error:
- Stop capture may have actually succeeded
- Get capture URL from Jarvis Logs
- Enter gateway Id in the 'any' field, provide gateway manager resource location
