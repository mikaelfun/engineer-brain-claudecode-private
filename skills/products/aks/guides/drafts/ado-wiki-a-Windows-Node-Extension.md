---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Compute/Windows/Windows Node Extension"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Compute/Windows/Windows%20Node%20Extension"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Windows Node Extension Troubleshooting Guide

## Overview

AKS Windows nodes have the Azure VM extension  () installed on the VMSS instance. It manages Windows system services including .

Verify extension: 

## Prerequisites

- Customer can run: 
- Use GenevaAction to get WindowsGuestVMLogs

## Diagnostic Sequence

### 1. windows-exporter logs
- stdout: 
- stderr: 
- Check service status: 
- If service not running → check extension logs

### 2. Extension logs
- Path: 
- Extension script/config: 
- If no extension logs → check VM Agent logs

### 3. VM Agent log (Kusto)


### 4. aks-operator log (Kusto)


## Known Issue: Port 19182 Conflict

AKS windows-exporter uses port 19182. Customer deployments using same port will conflict.

See JSONL entry  for full break-fix details.

**Kusto to detect hostPort 19182 conflicts:**


## Owner
Jordan Harder (joharder@microsoft.com)
