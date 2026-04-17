---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Networking/AKS TCPDump instructions"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2FAKS%20TCPDump%20instructions"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# AKS TCPDump Instructions

## Overview

When we have networking issues, getting network traces are often required. There are two ways to take network traces and these instructions apply to both ACS And AKS.

## TCPDump from node

The first is to connect to the node (Azure VM) and take trace there. This will capture traces on the VM and all pods running on the VM and is typically the preferred method for obtaining network traces for AKS networking issues.

To capture a TCPDump from the ACS/AKS nodes, first to get traces from the node, you need to follow the steps in this link to get SSH access to the node: <https://docs.microsoft.com/en-us/azure/aks/ssh>

Once you are connected to the node, then you can do the following to get the network trace: `apt-get update && apt-get install tcpdump`

Then you can run tcpdump using this command: `tcpdump -s 0 -vvv -w /path/nameofthecapture.cap` or `tcpdump -ni eth0 -w ethcap-%H.pcap -e -C 200 -G 3600 -K`

This will instruct customer to press ctrl+c to stop the TCPDump capture.

Once the trace files have been created, have customer copy them to the workspace (DTM). To do so, we first need to get the traces off the cluster and onto the customer's machine. The steps below outline how to do this.

1. Exit the SSH connection to the node from the helper pod.
2. From the helper pod run: `scp -i id_rsa azureuser@10.240.0.4:/home/azureuser/ethcap-20.pcap .`
3. The packet capture should now be on the helper pod, confirm by running `ls`.
4. Exit the helper pod. You should now be back on the development machine.
5. Run `kubectl cp aks-ssh-66cf68f4c7-vwgvg:/ethcap-20.pcap .`
6. The `.pcap` is now on the customer's laptop an can be uploaded to the DTM workspace.

> NOTE: If customer is using ACS and the node is a Windows VM, then in order to get a network trace, you should run the following from an elevated cmd prompt:

1. `netsh trace start capture=yes tracefile=c:\AKS_node_name.etl`
2. Reproduce the issue.
3. Run the following command on both servers to stop the trace once the issue has been reproduced: `netsh trace stop`
4. This will generate two files a cab and an etl. These can simply be copied using drag and drop through the RDP session.
5. Need to open .etl file on Microsoft Message Analyzer
6. If you want to analyse it on Wireshark, choose Save as and Export to .cap

## TCPDump from Node using Node-Shell

For Node-Shell installation/setup go here - <https://github.com/kvaps/kubectl-node-shell>

1. Once installed connect into the node with `kubectl node-shell <nodeName>`.
2. At the node prompt start the capture with `tcpdump -s 0 -vvv -w /tcpdump/testcapture.pcap` and reproduce the issue.
3. Use CTRL+c to end the capture, don't exit the node yet.

## Copying the pcap off of the node

1. Open a second terminal connected to the cluster and get the pods (the pod name always starts with "nsenter").
2. Copy the file from the node/helper pod to the local machine: `kubectl cp nsenter-azqnbr:/tcpdump/testcapture.pcap /mnt/c/aks/testcapture.pcap`
3. Now you can go back to the other terminal that is connected into the node and exit.
4. The customer can now upload the file to DTM for analysis.

## TCPDump from pod

1. First, connect to the pod and spawn a bash shell (Linux): `kubectl exec -it POD_NAME /bin/bash`
2. Once connected to the pod, you can run the following to install tcpdump: `apt-get update && apt-get install tcpdump`
3. Then you can run tcpdump using this command: `tcpdump -s 0 -vvv -w /path/nameofthecapture.cap`
4. You can then use this command to copy it out, even to Windows: `kubectl cp [namespace]/[pod_name]:/path/nameofthecapture.cap /path/destination_folder`

> **NOTE**: If using Windows and you want to copy to the user profile folder, path would look like `/users/username`. The file then exists inside the "username" folder (do not use "c:" as the first "/" implies the root of C:\)

## Node Packet Capture - all nodes at once

Use the DaemonSet script here to capture tcpdump on all nodes at once: <https://github.com/tdihp/dspcap>

## Analyzing the Packet Captures

### Option 1 - Consult Azure Networking Pod

Create a collaboration task to Azure Networking Pod for assistance. Provide the source IP (Pod IP) and the destination IP & Port.

### Option 2 - Analyze the traces yourself

You can use Wireshark, Network Monitor 3.4 or Message Analyzer.

**Network Monitor filter examples:**
- Find traffic containing an IP: `ipv4.address==192.168.0.4`
- Find traffic using a specific port: `tcp.port==443`
- Find traffic with IP and port: `ipv4.address==192.168.0.4 and tcp.port==443`
- Filter on ephemeral port for specific TCP conversation: `tcp.port==52453`

## More Information

- [TCP Troubleshooting](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/301277/TCP-Troubleshooting)
- [Wireshark primer](https://www.instructables.com/id/Wireshark-primer/)
