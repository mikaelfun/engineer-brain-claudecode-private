# AVD AVD Host Pool 与缩放 (Part 2) - Quick Reference

**Entries**: 2 | **21V**: all applicable
**Keywords**: ase, deployment, host-pool, paas, subnet, vnet-integration
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | Deploying AVD host pool VMs in a subnet fails with error that subnet is referenc... | IaaS resources (VMs) cannot be created in a subnet that has existing PaaS VNet i... | 1) Remove the VNet integration/service association link from the subnet before d... | 🔵 6.0 | OneNote |
| 2 📋 | Deploying AVD host pool VMs in a subnet fails with error that subnet is referenc... | IaaS resources (VMs) cannot be created in a subnet that has existing PaaS VNet i... | 1) Remove the VNet integration/service association link from the subnet before d... | 🔵 6.0 | OneNote |

## Quick Triage Path

1. Check: IaaS resources (VMs) cannot be created in a subnet `[Source: OneNote]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/avd-host-pool-scaling-2.md#troubleshooting-flow)
