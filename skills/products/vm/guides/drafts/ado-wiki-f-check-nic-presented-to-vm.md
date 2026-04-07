---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Cant RDP SSH/How Tos/Check if NIC was Presented to VM_RDP SSH"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FCant%20RDP%20SSH%2FHow%20Tos%2FCheck%20if%20NIC%20was%20Presented%20to%20VM_RDP%20SSH"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Check if NIC was Presented to VM

## Summary

When troubleshooting RDP issues and the VM shows the CTRL+ALT+DELETE screen, verify whether a NIC (Network Interface Card) was properly presented to the VM guest OS.

## Method 1: VM Agent Installed (WaAppAgent.log)

1. Check **WaAppAgent.log**. Go to the bottom and find the latest agent start:
   ```
   [00000006] [06/21/2016 17:04:02.19] [INFO] WindowsAzureGuestAgent starting. Version 2.7.1198.735
   ```

2. Look for successful NIC creation sequence:
   ```
   [INFO] Initializing ControlSystem.
   [INFO] Attempting to discover fabric address on interface Ethernet 39.
   [INFO] Discovered fabric address on interface Ethernet 39.
   [INFO] Using fabric address 100.79.6.170 from DHCP.
   [INFO] Using fabric URI http://100.79.6.170/.
   [INFO] ControlSystem initialized with version 2012-11-30.
   [INFO] Current environment is: Cloud.
   ```

If this sequence is missing or shows errors, the NIC was not properly presented.

## Method 2: No VM Agent (System Event Log)

1. Check System Event Log, filter for Event source **UserPnP**
2. Look for Event IDs:
   - **Event 20001**: Driver installation conclusion for netvsc network driver
   - **Event 20003**: Service add conclusion for netvsc service

3. Verify statuses:
   - Event 20001 status must be `0x0`
   - Event 20003 status must be `0`
   - Any different value = **NIC installation failure** that needs troubleshooting

### Device Instance ID Pattern

Look for VMBUS device: `VMBUS\{F8615163-DF3E-46C5-913F-F2D2F965ED0E}\{...}` with driver `wnetvsc.inf`
