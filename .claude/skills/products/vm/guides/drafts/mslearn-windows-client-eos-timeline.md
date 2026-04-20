# Windows Client End of Support (EOS) Timeline for Azure VMs

> Source: mslearn
> sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/ms-azure-windows-eos-client
> Quality: guide-draft | Needs review before promotion

## Overview

This guide covers Windows Client operating systems that have reached End of Support (EOS) and their support status on Azure VMs.

## Windows 10 (EOS)

- Windows 10 is **no longer supported** except under the Extended Security Updates (ESU) program
- ESU includes only **critical and important security updates** (no new features, no non-security fixes)
- Support covers only enabling and ensuring that ESU is functional

### Azure VM Special Benefit

- For workloads running on Azure VMs, **ESU is automatically included at no additional cost**
- No MAK keys or manual activation is required
- This is a key differentiator for Azure vs on-premises

## Key References

- [Extended Security Updates (ESU) program for Windows 10](https://learn.microsoft.com/en-us/windows/whats-new/extended-security-updates)
- [Enable Extended Security Updates (ESU)](https://learn.microsoft.com/en-us/windows/whats-new/enable-extended-security-updates)
- [Lifecycle FAQ - Extended Security Updates](https://learn.microsoft.com/en-us/lifecycle/faq/extended-security-updates)

## Diagnostic Tools (for Azure VMs with Windows Update issues)

| Tool | Purpose |
|------|---------|
| Windows Update Error Detection Tool | Diagnose specific Windows Update errors |
| Windows Update Reset Tool | Reset Windows servicing stack |
| OS Upgrade Assessment Tool | Validate OS upgrade path and known issues |

## 21V Applicability

ESU policy for Azure VMs in 21Vianet (Mooncake) may differ from Global Azure. Verify with regional documentation.
