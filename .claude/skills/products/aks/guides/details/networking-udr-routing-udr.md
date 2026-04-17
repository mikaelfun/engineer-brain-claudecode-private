# AKS UDR 与路由 — udr -- Comprehensive Troubleshooting Guide

**Entries**: 5 | **Draft sources**: 1 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-imds-restriction.md
**Generated**: 2026-04-07

---

## Phase 1: System-managed identity does not get role assignme

### aks-143: AKS cluster creation with system-managed identity fails when subnet has UDR asso...

**Root Cause**: System-managed identity does not get role assignment on UDR/route table; kubenet with custom route tables requires user-assigned managed identity. Portal has stricter validation than CLI for CNI scenario

**Solution**:
Use user-assigned managed identity for kubenet with custom route tables (UDR). For Azure CNI with CLI, creation succeeds even with UDR on subnet (no route table role needed). Portal limitation requires removing UDR first or using CLI

`[Score: [G] 10.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 2: AKS preflight validation checks if it can create a

### aks-093: AKS cluster creation fails with RequestDisallowedByPolicy when using existing su...

**Root Cause**: AKS preflight validation checks if it can create a UDR even when customer already has one attached. This phantom UDR creation check triggers Azure Policy denial. Bug: CustomerProvidedKubenetRouteTableID not set during preflight.

**Solution**:
Known bug (work item 25581388). Workaround: temporarily exempt AKS resource group from policy during creation, or adjust policy. Check FrontEndContextActivity for RequestDisallowedByPolicy errors.

`[Score: [G] 8.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 3: Conflicting routes pushed to VNET via BGP Gateway 

### aks-660: AKS network routing issues caused by CIDR overlap between pod/node CIDRs and BGP...

**Root Cause**: Conflicting routes pushed to VNET via BGP Gateway overlap with Pod or Node CIDRs. VNET also adds default routes with None nextHopType to drop traffic in certain scenarios. VNETs connected via Azure Virtual Network Manager may show unexpected ConnectedGroup nextHopType.

**Solution**:
Use cidroverlap tool to identify overlapping CIDRs: 1) Export NIC Effective Routes from ASC to Excel after running Test Traffic. 2) Run cidroverlap <target-CIDR> <excel-file> to find all overlapping routes with row numbers. Download: https://github.com/kennethgp/cidroverlap/releases. Use #.#.#.# format for single target IP.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACT%20Team/Tools/CIDR%20overlap)]`

## Phase 4: AKS RP validates outbound by checking for static r

### aks-255: AKS creation with outbound type UDR fails validation when required route is inje...

**Root Cause**: AKS RP validates outbound by checking for static route in UDR. BGP-injected routes are dynamic and not visible to Azure resource validation.

**Solution**:
Workaround: Configure static route in UDR when creating cluster then update/remove after creation to rely on BGP. Note Azure networking does not allow UDR with same prefix as BGP route.

`[Score: [B] 6.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 5: Gateway daemon calls IMDS for LB config. With UDR/

### aks-849: kube-egress-gateway-daemon-manager pod CrashLoopBackOff. Logs: unable to retriev...

**Root Cause**: Gateway daemon calls IMDS for LB config. With UDR/NatGateway, no LB exists by default. LB kubeegressgateway-ilb is only created after StaticGatewayConfiguration (SGC) is created.

**Solution**:
Create the SGC resource first. The kubeegressgateway-ilb will then be provisioned, resolving the IMDS 404.

`[Score: [Y] 4.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FOutbound%20Connectivity%2FTroubleshoot%20Static%20Egress%20Gateway%20Feature)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS cluster creation with system-managed identity fails when subnet has UDR asso... | System-managed identity does not get role assignment on UDR/... | Use user-assigned managed identity for kubenet with custom r... | [G] 10.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | AKS cluster creation fails with RequestDisallowedByPolicy when using existing su... | AKS preflight validation checks if it can create a UDR even ... | Known bug (work item 25581388). Workaround: temporarily exem... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | AKS network routing issues caused by CIDR overlap between pod/node CIDRs and BGP... | Conflicting routes pushed to VNET via BGP Gateway overlap wi... | Use cidroverlap tool to identify overlapping CIDRs: 1) Expor... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACT%20Team/Tools/CIDR%20overlap) |
| 4 | AKS creation with outbound type UDR fails validation when required route is inje... | AKS RP validates outbound by checking for static route in UD... | Workaround: Configure static route in UDR when creating clus... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 5 | kube-egress-gateway-daemon-manager pod CrashLoopBackOff. Logs: unable to retriev... | Gateway daemon calls IMDS for LB config. With UDR/NatGateway... | Create the SGC resource first. The kubeegressgateway-ilb wil... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FOutbound%20Connectivity%2FTroubleshoot%20Static%20Egress%20Gateway%20Feature) |
