---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACI/How To/Run tcpdump in a Container Group"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACI/How%20To/Run%20tcpdump%20in%20a%20Container%20Group"
importDate: "2026-04-21"
type: guide-draft
---

# Running tcpdump in an ACI Container Group

## Overview

Capturing network traffic in ACI container groups for troubleshooting connectivity issues.

## Option 1: Install tcpdump in Running Container

**Prerequisites**: Container has a base OS image with package manager (e.g., Debian) and Internet access.

1. Connect to container from Azure Portal
2. Install tcpdump: 'apt-get install --yes tcpdump'
3. Mount Azure File Share for saving capture files
4. Run capture: 'tcpdump -i eth0 -s0 dst <destIP> and dst port <destPort> -w /mnt/acishare/dump.pcap'

**Limitation**: Alpine-based images lack package manager. BYOVNET with firewall may block Internet.

## Option 2: Sidecar Container (Requires Recreation)

Use when tcpdump cannot be installed in the main container.

1. Export container group config: 'az container export -g <RG> -n <Name> -f <file.yaml>'
2. Delete or rename existing container group
3. Add sidecar container with tcpdump image (e.g., nicolaka/netshoot) to YAML
4. Redeploy with: 'az container create -g <RG> -f <file.yaml>'
5. Exec into sidecar: 'az container exec -g <RG> -n <Name> --container-name <sidecar> --exec-command bash'
6. Run tcpdump in sidecar (shares network namespace with main container)

**Note**: For BYOVNET without Internet, import the sidecar image to ACR first.

## Key Considerations

- All containers in a container group share the same network namespace
- Option 2 requires container group recreation (downtime)
- Save captures to Azure File Share for easy retrieval
