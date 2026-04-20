---
source: mslearn
sourceRef: null
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/windows-11-support-azure-virtual-machines
importDate: '2026-04-20'
type: guide-draft
---

# Windows 11 Support Matrix for Azure VMs

## Overview

Windows 11 has specific hardware requirements that limit which Azure VM SKUs can run it.
Three main criteria: VM Generation (Gen2), Trusted Launch (Secure Boot + vTPM), and CPU generation.

## VM SKU Support Matrix

### Supported (Windows 11 compatible)
- Bsv2, DCv2/DCv3, Dv4/Dv5/Ddv5/Dav5/Dlsv5, Eav4/Edv4/Ev4/Ev5/Ebdsv5/Edv5/Easv5
- Fsv2, FX, HBv2/HBv3/HBv4, HC, HX, Lsv3/Lasv3, Msv2/Mv2
- NCasT4_v3, NC_A100_v4, NDasrA100_v4, NDm_A100_v4, NDv2, NGads_V620
- NVv4, NVadsA10_v5, NP

### Not Supported
- A-series, Av2, B-series (original), D-series, Dv2, Dv3
- Ev3, F-series, G/GS-series, HB (original), L-series, Lsv2
- M-series (original), NC/NCv2/NCv3, ND (original), NV/NVv2/NVv3

### Preview / Not Supported
- Dpsv5, Dplsv5, Epsv5 (ARM64 preview)

## Requirements Checklist

1. **Generation**: Must be Gen2 VM
2. **Security**: Trusted Launch with Secure Boot and vTPM enabled
3. **Storage**: >= 64 GB OS disk
4. **Memory**: >= 4 GB RAM
5. **Processor**: 2+ vCPUs, host CPU must be Intel 8th gen+ / AMD Zen 2+ / Qualcomm 7/8 series

## Common Issues

- VMs deployed before June 28, 2023 default to standard security (no Trusted Launch)
- Gen1 VMs must be upgraded to Gen2 via Trusted Launch upgrade path
- Trusted Launch can only be set during creation (unless upgrading from standard)
- Azure portal may allow selecting unsupported VM SKUs for Win11 images
- Cannot upgrade to Win11 22H2 without Trusted Launch

## CPU Details

Intel supported: Skylake (7th gen Xeon X/W only), Coffee Lake 8th+, Cascade Lake 9th+, Ice Lake 10th+
Intel NOT supported: Haswell 4th gen, Broadwell 5th gen
AMD supported: Rome Zen 2+, Milan Zen 3+, Genoa Zen 4+
AMD NOT supported: Naples Zen 1
