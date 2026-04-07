---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Data Box/Connect & Copy/Unable to Access Data Box Local Web UI"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Data%20Box%2FConnect%20%26%20Copy%2FUnable%20to%20Access%20Data%20Box%20Local%20Web%20UI"
importDate: "2026-04-05"
type: troubleshooting-guide
---

Description
-----------

Use this guide to troubleshoot an issue where the customer is unable to access the local WebUI of a Data Box device.

When this issue occurs, the customer will see a connection error when attempting to access the local WebUI of their device.

As this issue could occur for a number of reasons, it is necessary to check the following items:
1.  Data Box Hardware
2.  Data Box Network Connectivity and Setup

Data Box Hardware
-----------------

To determine whether or not the issue is caused by an issue with the Data Box device's hardware, have the customer double-check to make sure the device has been properly cabled.

Additionally, have the customer confirm the System Fault LED on the back of the device is not lit to rule out any other hardware issues.

Data Box Network Connectivity and Setup
---------------------------------------

To determine whether or not the issue is caused by an issue with the customer's network, have the customer try to ping the device's MGMT IP address from a computer within the same network using a command prompt (e.g., `ping 192.168.100.5`).

If the ping is unsuccessful, have the customer try to ping other servers on the same network to confirm the issue is isolated to the Data Box itself.

If the ping is successful, have the customer make sure they are using HTTPS to connect to the Data Box local WebUI, and that they are using the IP address to connect instead of a hostname (e.g., `https://192.168.100.10`).

If the customer is still unable to access the local WebUI of the device after attempting to ping the device, make sure none of the Data Box IP addresses are duplicate IPs on the customer's network.

If the customer is still unable to access the local WebUI after confirming there are no duplicate IP addresses on their network, have the customer perform the following steps:

1.  Connect to the MGMT port of the Data Box using a crossover cable.
2.  Configure the Ethernet adapter on the laptop the customer is using to connect to the device with a static IP address of `192.168.100.5` and a subnet of `255.255.255.0`.
3.  Connect to MGMT port of the device and access its local web UI at `https://192.168.100.10`.

Additional Troubleshooting
--------------------------

If the issue persists after the above steps have been performed, have the customer perform a cold reboot and try again.

If it still persists once the device has come back on, the problem is likely the result of a deeper hardware issue and a new order will need to be created.
