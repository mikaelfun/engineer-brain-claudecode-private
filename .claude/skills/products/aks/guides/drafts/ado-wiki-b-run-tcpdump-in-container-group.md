---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACI/How To/Run tcpdump in a Container Group"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FHow%20To%2FRun%20tcpdump%20in%20a%20Container%20Group"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Running tcpdump in a Container Group

[[_TOC_]]

## Option 1 — Install tcpdump in existing container

If a container in the Container Group has a base OS image that includes a package manager (e.g., Debian), the `tcpdump` binary can be installed.

> **Limitations**: Some base OS images (e.g., Alpine) come without a package manager. Installation also requires Internet connectivity.

1. Connect to container from Portal.
2. Install tcpdump: `apt-get install --yes tcpdump`
3. Run tcpdump capture.
4. For saving output: mount an Azure file share, then run:
   ```sh
   tcpdump -i eth0 -s0 dst <destinationIp> and dst port <destinationPort> -w /mnt/acishare/dump.pcap
   ```

## Option 2 — Sidecar container with tcpdump

Use a sidecar container that already has tcpdump. All containers in a Container Group share the same networking environment.

> **Note**: This approach requires the Container Group to be **recreated**.

1. Export current Container Group config: `az container export -g <ResourceGroup> -n <Name> -f <file.yaml>`
2. Delete (or rename) the Container Group.
3. Modify the YAML to add a sidecar container (e.g., `kengp/debian-helper` or `nicolaka/netshoot`) with an Azure file share mount:

   ```yaml
   - name: debian-helper
     properties:
       image: kengp/debian-helper
       command: ["/bin/bash", "-c", "echo hello; sleep 100000"]
       resources:
         requests:
           cpu: 1
           memoryInGb: 1.5
       volumeMounts:
       - mountPath: /aci/share/
         name: filesharevolume
   ```

4. Deploy: `az container create -g <ResourceGroup> -f <file.yaml>`
5. Connect to sidecar container from Portal.
6. Run tcpdump and save to file share: `tcpdump -i eth0 -s0 dst <destinationIp> and dst port <destinationPort> -w /aci/share/dump.pcap`

> For BYOVNET scenarios without Internet access, import the sidecar image to ACR first.

## Windows Containers

Currently there is no way to run a network capture binary inside a Windows container. The winpcap driver is unable to list available interfaces for packet capture.

## Key Networking Considerations

* All ACIs SNAT through random platform public IPs during deployment time (registry pull, storage volume mounts) — even private BYOVNET ACIs.
* External services (Storage Accounts, ACR) need public access enabled, except in BYOVNET with private endpoints.
* For public ACIs, the ingress IP **is not** used for SNAT.
* In private BYOVNET ACIs, after creation, the Container Group honors VNET Route Table, NSG, and NAT Gateway configurations.
* Global eth0 capture will show platform management traffic on reserved ports (19XXX range): https://learn.microsoft.com/en-us/azure/container-instances/container-instances-faq#does-the-aci-service-reserve-ports-for-service-functionality-
