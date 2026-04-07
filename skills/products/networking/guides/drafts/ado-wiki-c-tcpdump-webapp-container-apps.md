---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/How To/Take tcpdump from WebApp or ContainersApps"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FTake%20tcpdump%20from%20WebApp%20or%20ContainersApps"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How to Take Packet Capture from WebApps or Azure Container Apps

[[_TOC_]]

## Overview
On Layer 7 cases we are constantly getting in touch with Azure WebApps that are being used to deliver the content for clients. This guide explains how to take packet captures from WebApps and Container Apps directly, without opening a collaboration task with the App Services team.

## WebApps (KuduLite / WebSSH)

1. Access KuduLite GUI: Take the WebApp FQDN (e.g., `aztested-cyfkdqe7e5cpacfv.uksouth-01.azurewebsites.net`) and add `.scm` before the region part, plus `/newui` path:
   - URL: `https://aztested-cyfkdqe7e5cpacfv.scm.uksouth-01.azurewebsites.net/newui`
2. Open **WebSSH** from the left side.

3. Check tcpdump and interfaces:
   ```bash
   tcpdump -D
   ```
   If tcpdump not installed:
   ```bash
   apt-get update && apt-get install -y tcpdump
   ```

**Useful interfaces:**
- `eth0`: Primary network interface for general internet traffic.
- `vnet00ro2650a` (or similar): VNET integration interface - handles traffic between WebApp and resources within the VNET.
- `any`: Captures all traffic (broad overview).

4. **Start capture:**
   ```bash
   tcpdump -i {interface} -s0 -w {filename}.pcap
   # Example:
   tcpdump -i eth0 -s0 -w eth0_capture.pcap
   ```
   Stop with `CTRL+C`.

   Flags:
   - `-i` => interface
   - `-s0` => unlimited capture length
   - `-w` => write to .pcap file

   Extra filter examples:
   ```
   src host 192.168.1.100     # source IP filter
   dst host 192.168.1.100     # destination IP filter
   host 192.168.1.100         # either source or destination
   ```

5. **Download the capture:**
   - Go to **File Manager** in KuduLite → find the file → click Download.
   - If not visible in File Manager, upload to blob storage via CURL:
     ```bash
     curl -X PUT -T [file_name] -H "x-ms-blob-type: BlockBlob" \
       "https://[storage_account].blob.core.windows.net/[container]/[blob_name]?[sas_token]"
     ```

## Azure Container Apps (Console)

1. Go to the Azure Container App in Azure Portal → **Console** from left menu.
2. Start a `/bin/bash` command line.
3. Install tcpdump if needed:
   ```bash
   tdnf install -y tcpdump
   ```
   > Note: Takes a while to install. Please wait!
4. Run capture commands (same as WebApps above).
5. After stopping with `CTRL+C`, run `ls` to confirm file exists.
6. Upload to blob storage via CURL (same template as WebApps).

## Quick Command Summary

| Command | Purpose |
|---------|---------|
| `tcpdump -D` | Shows available interfaces |
| `apt-get update && apt-get install -y tcpdump` | Install tcpdump (WebApps) |
| `tdnf install -y tcpdump` | Install tcpdump (Container Apps) |
| `tcpdump -i vnet00ro2650a -s0 -w vnetcapture.pcap` | Start capture on VNET interface |
| `CTRL+C` | Stop capture |
