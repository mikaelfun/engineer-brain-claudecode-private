# AKS UDR 与路由 — udr -- Quick Reference

**Sources**: 2 | **21V**: All | **Entries**: 5
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS cluster creation with system-managed identity fails when subnet has UDR asso... | System-managed identity does not get role assignment on UDR/... | Use user-assigned managed identity for kubenet with custom r... | [G] 10.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | AKS cluster creation fails with RequestDisallowedByPolicy when using existing su... | AKS preflight validation checks if it can create a UDR even ... | Known bug (work item 25581388). Workaround: temporarily exem... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | AKS network routing issues caused by CIDR overlap between pod/node CIDRs and BGP... | Conflicting routes pushed to VNET via BGP Gateway overlap wi... | Use cidroverlap tool to identify overlapping CIDRs: 1) Expor... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACT%20Team/Tools/CIDR%20overlap) |
| 4 | AKS creation with outbound type UDR fails validation when required route is inje... | AKS RP validates outbound by checking for static route in UD... | Workaround: Configure static route in UDR when creating clus... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 5 | kube-egress-gateway-daemon-manager pod CrashLoopBackOff. Logs: unable to retriev... | Gateway daemon calls IMDS for LB config. With UDR/NatGateway... | Create the SGC resource first. The kubeegressgateway-ilb wil... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FOutbound%20Connectivity%2FTroubleshoot%20Static%20Egress%20Gateway%20Feature) |

## Quick Troubleshooting Path

1. Check: Use user-assigned managed identity for kubenet with custom route tables (UDR) `[source: onenote]`
2. Check: Known bug (work item 25581388) `[source: onenote]`
3. Check: Use cidroverlap tool to identify overlapping CIDRs: 1) Export NIC Effective Routes from ASC to Excel `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/networking-udr-routing-udr.md)
