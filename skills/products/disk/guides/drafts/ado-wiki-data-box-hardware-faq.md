---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Data Box/Hardware/Hardware FAQ"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Data%20Box%2FHardware%2FHardware%20FAQ"
importDate: "2026-04-05"
type: troubleshooting-guide
---

## What hardware is shipped along with Databox?

Databox pod is shipped along with its power cable. We do not ship any other cables or SFPs for this product.

## What should be done if the power supply unit is faulty?

There is no field replaceable unit in Databox. If there is any hardware issue with Databox, the device will have to be returned.

## Data Box Specifications

| Specifications | Description |
| --- | --- |
| Weight | < 50 lbs. |
| Dimensions | Device - Width: 309.0 mm Height: 430.4 mm Depth: 502.0 mm |
| Rack space | 7 U when placed in the rack on its side (cannot be rack-mounted) |
| Cables required | 1 X power cable (included), 2 RJ45 cables (not included), 2 X SFP+ Twinax copper cables (not included) |
| Storage capacity | 100-TB device has 80 TB of usable capacity after RAID 5 protection |
| Power rating | The power supply unit is rated for 700 W. Typically, the unit draws 375 W. |
| Network interfaces | 2 X 1-GbE interface - MGMT, DATA 3. MGMT for management (not user configurable, used for initial setup). DATA3 for data (user configurable, dynamic by default). MGMT and DATA 3 can also work as 10 GbE. 2 X 10-GbE interface - DATA 1, DATA 2 (both for data, configurable as dynamic or static) |
| Data transfer | Both import and export are supported. |
| Data transfer media | RJ45, SFP+ copper 10 GbE Ethernet |
| Security | Rugged device casing with tamper-proof custom screws, tamper-evident stickers placed at the bottom |
| Data transfer rate | Up to 80 TB in a day over a 10-GbE network interface |
| Management | Local web UI (one-time initial setup and configuration), Azure portal (day-to-day device management) |

## System Fault Indicator LED

There are two LED lights under the power button on the front of a Data Box. The bottom-most light is the system fault indicator.

A system fault indicator LED that is red may indicate:
- Fan failure
- CPU temperature is high
- Motherboard temperature is high
- Dual inline Memory Module (DIMM) Error Connecting Code (ECC) error

**Recommendations:**
- Check whether the fan is working
- Move the device to a location with greater airflow
- If none of the above resolve the issue, customer will have to return the device

## Reference Documentation

- https://learn.microsoft.com/en-us/azure/databox/data-box-safety
- https://learn.microsoft.com/en-us/azure/databox/data-box-cable-options
- https://learn.microsoft.com/en-us/azure/databox/data-box-overview
