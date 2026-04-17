---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Device Registration/Linux Devices/Enterprise SSO for Linux Desktops/Windows System for Linux (WSL) Support/MSAL.Python Integration with WSL"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/Device%20Registration/Linux%20Devices/Enterprise%20SSO%20for%20Linux%20Desktops/Windows%20System%20for%20Linux%20(WSL)%20Support/MSAL.Python%20Integration%20with%20WSL"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# MSAL.Python Integration with WSL

## Overview

The MSAL Python library supports broker-based authentication on both WSL and standalone Linux via the `enable_broker_on_linux` flag.

## Key Points

1. The `enable_broker_on_linux` flag enables the broker on both WSL and standalone Linux. If the goal is to enable broker support solely on WSL for Azure CLI, consider modifying the Azure CLI app code to activate the flag exclusively on WSL.

2. **WSL**: No additional dependencies required. The Windows Authentication Manager (WAM), available by default on Windows, will serve as the broker.

3. **Standalone Linux**: The Intune Portal must be installed for the Linux standalone broker to be set up and running.

4. If the broker is not installed on standalone Linux, it will **fall back** to the non-broker authentication flow.

5. If enabling the broker on standalone Linux, test the environment to ensure there is no regression.

## Decision Tree

- Is the target WSL or standalone Linux?
  - **WSL** → No extra deps, WAM handles brokering
  - **Standalone Linux** → Requires Intune Portal installed
    - Intune Portal installed? → Broker auth works
    - Not installed? → Falls back to non-broker flow (no error, reduced SSO)
