---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACI/How To/Keep a connection to container group alive"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FHow%20To%2FKeep%20a%20connection%20to%20container%20group%20alive"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Configuring a keep-alive connection for Azure Container Instances

## Summary

This article shows a workaround to keep alive a connection to an ACI that runs Ubuntu 20.04. When attempting to run a long-lived process (even if it's idle), eventually ACI times out the connection when there's no user interaction.

## Prerequisites

* Active and running ACI instance

## Implementation Steps

### (OPTIONAL) Deploy an Azure Container Instance

```sh
az container create --resource-group <rg> \
--cpu 1 \
--memory 1 \
--restart-policy Never \
--ip-address Public \
--ports 80 443 \
--dns-name-label <dns> \
--log-analytics-workspace <loganalytics> \
--name ubuntu-20-04 \
--image ubuntu:latest \
--command-line "tail -f /dev/null"
```

### Keeping an ACI connection alive

1. Establish a connection to the container group:

   ```sh
   az container exec --name <container-group-name> \
       --resource-group <rg-name> \
       --container-name <name of the container inside the group> \
       --exec-command "/bin/bash"
   ```

2. Keep the connection alive using:

   ```sh
   nohup tail -f /dev/null
   ```

   This will run the command in a way that ignores any hangup signals and thus will keep the connection alive. When you're ready to resume control, `Ctrl+C` to kill the `nohup` process.
