---
title: Windows 11 Support Matrix on Azure VMs
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/windows-11-support-azure-virtual-machines
product: vm
tags: [Windows-11, VM-size, compatibility, Trusted-Launch, Gen2]
21vApplicable: true
---

# Windows 11 Support Matrix on Azure VMs

## 核心要求

| 条件 | 要求 |
|------|------|
| Generation | Gen 2 |
| 存储 | >= 64 GB |
| 安全 | Secure boot + Trusted Launch + vTPM |
| 内存 | >= 4 GB |
| 处理器 | >= 2 vCPU，且宿主 CPU 满足 Win11 要求 |

## 不支持的 VM 系列

A-Series, A-Series v2, B-Series, D-Series, Dv2, Dv3, Ev3, F-Series, G-Series, GS-Series, HB-Series, L-Series, Lsv2, M-Series, NC, NCv2, NCv3, ND-Series, NV, NVv2, NVv3 等。

## 支持的 VM 系列

Bsv2, DCv2/v3, Dv4/v5, Ddv5, Dav5, DCasv5, Dlsv5, Eav4, Edv4/v5, Ev4/v5, Ebdsv5, Easv5, ECasv5, Fsv2, FX, HBv2/v3/v4, HC, HX, Lsv3, Lasv3, Msv2, Mv2, NCasT4_v3, NC_A100_v4, NDasrA100_v4, NDm_A100_v4, NDv2, NGads_V620, NVv4, NVadsA10_v5, NP 等。

## 关键注意事项

- Gen 1 VM 可通过升级到 Trusted Launch 安全类型转换为 Gen 2
- 2023-06-28 之前创建的 VM 默认非 Trusted Launch
- 无法在 VM 创建后设置 Trusted Launch
- Win11 22H2 升级需要 Trusted Launch
- Azure Portal 可能允许在不支持的 SKU 上选择 Win11 部署（但实际不支持）
- CPU 要求：Intel 8th gen+, AMD Zen 2+, Qualcomm Series 7/8

## 21V 注意

21V 的 VM SKU 可用性与 Global 不同，需根据实际可用 SKU 对照此表。
