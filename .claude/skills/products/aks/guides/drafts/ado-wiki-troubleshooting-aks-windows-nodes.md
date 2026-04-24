---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Compute/Windows/Troubleshooting AKS WIndows Nodes"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCompute%2FWindows%2FTroubleshooting%20AKS%20WIndows%20Nodes"
importDate: "2026-04-24"
type: guide-draft
---

# Troubleshooting AKS Windows Nodes - Automated Log Collection

## Summary
kubectl plugin for automated Windows log collection and network capture on AKS nodes.
Uses HostProcess pods with shared namespace and azcopy for uploading to Storage Account.

## Prerequisites
- Bash environment with kubectl configured
- SAS URL for storage account: export SAS="your SAS URL"

## Usage
kubectl winlogs <nodeName>

## Features
- Deploys privileged Windows pod with shared namespace
- Runs default Windows log collector PowerShell scripts
- Captures network traces
- Uploads results to storage account via azcopy
- Provides direct PowerShell session on the node
