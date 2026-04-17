# AKS 网络连通性通用 — networking — 排查工作流

**来源草稿**: ado-wiki-aks-networking-connectivity-baseline-template.md, ado-wiki-b-run-tcpdump-in-container-group.md, mslearn-capture-tcpdump-linux.md, mslearn-capture-tcpdump-windows.md
**Kusto 引用**: 无
**场景数**: 4
**生成日期**: 2026-04-07

---

## Scenario 1: AKS networking connectivity issues base line template
> 来源: ado-wiki-aks-networking-connectivity-baseline-template.md | 适用: 适用范围未明确

### 排查步骤

#### AKS networking connectivity issues base line template

Author: Sergio Turrent

#### Summary

The following document aims to provide a minimum baseline of required information that has to be requested to the customer or collected using our internal tools before we start troubleshooting network connectivity issues.

#### Baseline template

##### Network flow information

| **Source IP** | **Protocol**      | **Port** | **Source Network details**             | **Error from Src perspective**                |
|---------------|-------------------|----------|----------------------------------------|-----------------------------------------------|
| x.x.x.x       | TCP \| UDP \| N/A | # \| N/A | VNET \| Internet \| On-Prem \| Cluster | Error code \| Connection status \| Client log |

| **Destination IP / URL**           | **Protocol**      | **Port** | **Destination Network details**        | **Error from Dst perspective**                |
|------------------------------------|-------------------|----------|----------------------------------------|-----------------------------------------------|
| x.x.x.x \| "`example.org/test:8443`" | TCP \| UDP \| N/A | # \| N/A | VNET \| Internet \| On-Prem \| Cluster | Error code \| Connection status \| Server log |

##### AKS information

| **CNI type**                                                                                  | **Outbound type**                                                                 | **Has UDR / Firewall** | **Network Policies**         | **Custom DNS**        | **Service Mesh**                                  | **Ingress Controller**                                                                     |
|-----------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------|-------------|------------------------------|-----------------------|---------------------------------------------------|--------------------------------------------------------------------------------------------|
| Azure CNI legacy \| Overlay \| Dynamic allocation of IPs \| Kubenet \| Cilium \| BYO CNI | LoadBalancer \| managedNATGateway \| userAssignedNATGateway \| userDefinedRouting | Yes with FW \| Yes for Kubenet only no FW \| No   | Azure \| Calico \| No \| N/A | VNET \| Coredns \| No | Istio Add-on \| OSM Add-on \| Custom \| No \| N/A | AGIC Add-on \| Custom AGIC \| Routing Add-On \| Custom nginx-ingress \| Other \| No \| N/A |

#### Examples

##### Sample 1: pod fails to connect to API

Issue description: Custom pod running an API health check that is failing with:

`Status = " curl: (35) OpenSSL SSL_connect: SSL_ERROR_SYSCALL in connection to kubernetes.default.svc:443  " - Date = Thu Feb  8 22:45:36 UTC 2024`

Using the AKS with firewall lab for a sample issue.

##### Sample 2: connection to service in AKS fails with timeout

Issue description: Service exposed with public IP is not reachable. Connections fails with error:

`curl: (28) Failed to connect to 10.81.x.x port 80 after 21033 ms: Timed out`

Using sample troubleshooting scenario from [custom-nsg-blocks-traffic](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/custom-nsg-blocks-traffic).

---

## Scenario 2: Running tcpdump in a Container Group
> 来源: ado-wiki-b-run-tcpdump-in-container-group.md | 适用: 适用范围未明确

### 排查步骤

#### Running tcpdump in a Container Group


#### Option 1 — Install tcpdump in existing container

If a container in the Container Group has a base OS image that includes a package manager (e.g., Debian), the `tcpdump` binary can be installed.

> **Limitations**: Some base OS images (e.g., Alpine) come without a package manager. Installation also requires Internet connectivity.

1. Connect to container from Portal.
2. Install tcpdump: `apt-get install --yes tcpdump`
3. Run tcpdump capture.
4. For saving output: mount an Azure file share, then run:
   ```sh
   tcpdump -i eth0 -s0 dst <destinationIp> and dst port <destinationPort> -w /mnt/acishare/dump.pcap
   ```

#### Option 2 — Sidecar container with tcpdump

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

#### Windows Containers

Currently there is no way to run a network capture binary inside a Windows container. The winpcap driver is unable to list available interfaces for packet capture.

#### Key Networking Considerations

* All ACIs SNAT through random platform public IPs during deployment time (registry pull, storage volume mounts) — even private BYOVNET ACIs.
* External services (Storage Accounts, ACR) need public access enabled, except in BYOVNET with private endpoints.
* For public ACIs, the ingress IP **is not** used for SNAT.
* In private BYOVNET ACIs, after creation, the Container Group honors VNET Route Table, NSG, and NAT Gateway configurations.
* Global eth0 capture will show platform management traffic on reserved ports (19XXX range): https://learn.microsoft.com/en-us/azure/container-instances/container-instances-faq#does-the-aci-service-reserve-ports-for-service-functionality-

---

## Scenario 3: Troubleshooting Flow
> 来源: mslearn-capture-tcpdump-linux.md | 适用: 适用范围未明确

### 排查步骤

##### 1. Find Target Node

```bash
kubectl get nodes --output wide
```

##### 2. Connect to Node

Use `kubectl debug node/<node-name>` to create interactive shell (node-debugger pod).

##### 3. Install tcpdump (if needed)

```bash
apt-get update && apt-get install tcpdump
```

##### 4. Capture

```bash
tcpdump --snapshot-length=0 -vvv -w /capture.cap
#### With filters (recommended to reduce file size):
tcpdump dst 192.168.1.100 -w /capture.cap
tcpdump port 80 or port 443 -w /capture.cap
```

Press Ctrl+C to stop.

##### 5. Transfer Locally

```bash
#### From local machine:
kubectl cp node-debugger-aks-nodepool1-xxx:/capture.cap capture.cap
```

Note: If using `chroot /host`, prefix source path with `/host`.

---

## Scenario 4: Capture TCP Dump from Windows Node in AKS
> 来源: mslearn-capture-tcpdump-windows.md | 适用: 适用范围未明确

### 排查步骤

#### Capture TCP Dump from Windows Node in AKS

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/logs/capture-tcp-dump-windows-node-aks

#### Connection Methods

1. **HostProcess container** (recommended)
2. **SSH** via node-debugger
3. **RDP** via jump VM

##### HostProcess Container Setup

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: hpc
spec:
  securityContext:
    windowsOptions:
      hostProcess: true
      runAsUserName: "NT AUTHORITY\\SYSTEM"
  hostNetwork: true
  containers:
    - name: hpc
      image: mcr.microsoft.com/windows/servercore:ltsc2022
      command: ["powershell.exe", "-Command", "Start-Sleep 2147483"]
  nodeSelector:
    kubernetes.io/os: windows
    kubernetes.io/hostname: AKSWINDOWSNODENAME
```

#### Capture

```cmd
netsh trace start capture=yes tracefile=C:\temp\AKS_node_name.etl
#### Reproduce issue...
netsh trace stop
```

Output: `.etl` and `.cab` files in `C:\temp\`.

#### Transfer

- HostProcess: `kubectl cp hpc:/temp/AKS_node_name.etl ./AKS_node_name.etl`
- SSH: `scp` via ProxyCommand
- RDP: `net use z: \\tsclient\c` then copy

---
