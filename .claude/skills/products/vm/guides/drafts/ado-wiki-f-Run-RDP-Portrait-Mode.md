---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Cant RDP SSH/How Tos/Run RDP in Portrait Mode_RDP SSH"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FCant%20RDP%20SSH%2FHow%20Tos%2FRun%20RDP%20in%20Portrait%20Mode_RDP%20SSH"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Run RDP in Portrait Mode

How to run an RDP session in portrait mode orientation.

## Pre-requisites

1. Port 3389 must be open (firewall allows inbound connections).
2. The device should be part of Azure Virtual Desktop (AVD) or other VDI management solutions.

## Instructions

1. **Physical Monitor Rotation**: Physically rotate your monitor to portrait orientation before initiating the RDP session. The RDP client will not control the monitor's physical orientation.
2. **RDP Client Configuration**: The RDP client does not have an option to enforce portrait mode. It depends on the physical orientation and OS display settings.
3. **Windows Display Settings (Remote Computer)**: Configure the display settings on the remote computer to align with your monitor's physical setup.
4. **Steps on the remote computer**:
   1. Open Settings > System > Display.
   2. In the "Display orientation" dropdown, select Portrait.
