---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACI/TSG/Azure Copilot ACI Handlers"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2FAzure%20Copilot%20ACI%20Handlers"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Azure Copilot ACI Handlers

## Overview

The Azure Portal now has copilot integrated into it. Support for copilot in the Azure portal is mainly owned by the VM team, however there are handlers for specific services. See the [AKS Wiki page for Copilot Handlers](/Azure-Kubernetes-Service-Wiki/AKS/Platform-and-Tools/Azure-Copilot-AKS-Handlers)

## ACI Handlers

### ACI Troubleshooting Plugin

This plugin will integrate the top ACI (Azure Container Instances) AppLens detectors with Copilot for Azure, to enhance customer self-help and troubleshooting for ACI management, configuration, and connectivity issues.

PluginID: acitroubleshoot_plugin

Two plugins will be developed:

**Handler 1:** For issues related to "Unable to Deploy."

Copilot Orchestration: Users open Copilot and ask why their container deployment failed. Copilot will prompt the user to confirm if they want to troubleshoot using the current Resource Group.
Let the user select failed deployment from drop down and then run the appropriate detectors. Detector results are communicated to the user by copilot, and the user can choose to view the full detector output.

_Example prompts:_
Why did my deployment fail?
Help me with this deployment failure.
Why did my container fail to deploy.

**Handler 2:** For issues related to "Unexpected Restarts."

Copilot Orchestration: Users open Copilot and ask why their container deployment failed. Copilot will prompt the user to confirm if they want to troubleshoot using the current Resource Group or select different Resource Group, then run the appropriate detectors.
Detector results are communicated to the user by copilot and the user can choose to view the full detector output.

Example prompts:
Why did my deployment fail?
Help me with this deployment failure.
Why did my container fail to deploy.

## Gather Data and Escalate

Please refer to [The main Copilot Wiki Page](/Azure-Kubernetes-Service-Wiki/AKS/Platform-and-Tools/Azure-Copilot-AKS-Handlers) for information on how to [Troubleshoot](/Azure-Kubernetes-Service-Wiki/AKS/Platform-and-Tools/Azure-Copilot-AKS-Handlers#basic-troubleshooting), how to [Gather Data](/Azure-Kubernetes-Service-Wiki/AKS/Platform-and-Tools/Azure-Copilot-AKS-Handlers#data-gathering), and where to [Escalate to.](/Azure-Kubernetes-Service-Wiki/AKS/Platform-and-Tools/Azure-Copilot-AKS-Handlers#escalation)
