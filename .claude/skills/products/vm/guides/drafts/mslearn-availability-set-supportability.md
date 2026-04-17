# Availability Set VM Size Compatibility

Source: [Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/virtual-machines-availability-set-supportability)

## Overview
Not all VM sizes can be mixed in the same availability set. Use the REST API to check supported sizes:
- [Availability Sets - List Available Sizes](/en-us/rest/api/compute/availability-sets/list-available-sizes)

## Compatible Series (Same Availability Set)

| Series | B | Dv2 | Dv3 | Dv4 | Dv5 |
|--------|---|-----|-----|-----|-----|
| B      | OK | OK | OK | OK | OK |
| Dv2    | OK | OK | OK | OK | OK |
| Dv3    | OK | OK | OK | OK | OK |
| Dv4    | OK | OK | OK | OK | OK |
| Dv5    | OK | OK | OK | OK | OK |

## Key Rule
- B, D-series (v2-v5) are mutually compatible
- All other series require specific hardware and **cannot** be mixed in the same availability set
- Use the REST API to verify before adding VMs
