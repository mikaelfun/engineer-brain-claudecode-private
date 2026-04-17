---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Rack Scale/Readiness/ALRS Kube-OVN/Kube-OVN Custom VPC Internal DNS Configuration Guide"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Rack%20Scale/Readiness/ALRS%20Kube-OVN/Kube-OVN%20Custom%20VPC%20Internal%20DNS%20Configuration%20Guide"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Architecture
![image.png](/.attachments/image-1cfedca8-37b5-4ae7-8db4-66edba74d4c7.png)

✦ User Pod ──> SLR VIP (10.96.0.3) ──> vpc-dns Pod (eth0, Custom VPC) 
✦ forward plugin ──> upstream DNS (non cluster.local domains) 
✦ kubernetes plugin ──> eth1 ──> Default VPC ──> APIServer (list/watch) 
✦ kube-dns (10.96.0.10) is NOT involved in vpc-dns resolution

**Why vpc-dns?**  
Custom VPCs are network-isolated from the default VPC, so Pods in a custom VPC cannot reach `kube-dns` (10.96.0.10) in the default VPC. The `vpc-dns` CRD deploys a **standalone CoreDNS instance** with **dual NICs** inside the custom VPC:  
• **eth0** (Custom VPC): Serves DNS requests from Pods in the custom VPC  
• **eth1** (Default VPC, via NAD): Connects to **Kubernetes APIServer** so the CoreDNS `kubernetes` plugin can list/watch Services and Endpoints to resolve `cluster.local` names  
  
**Key point:** vpc-dns CoreDNS is a **self-contained DNS resolver** (with the built-in kubernetes plugin). It does **NOT** forward requests to the default VPC's kube-dns. The eth1 NIC exists solely to reach the APIServer for service discovery data.  
A **SwitchLBRule (SLR)** provides a VIP as the load-balanced entry point within the custom VPC.

**⚠️ Important:** The DNS VIP address is **NOT** automatically injected into Pod or VM `/etc/resolv.conf`. You must configure it yourself via Webhook or VM image template (see Step 6).

**Current Environment**
Before starting, confirm your VPC and Subnet layout:
```powershell
root@kubeovn-worker1:~# kubectl get vpc -A
NAME          ENABLEEXTERNAL   ENABLEBFD   STANDBY   SUBNETS                  EXTRAEXTERNALSUBNETS   NAMESPACES   DEFAULTSUBNET
ovn-cluster   false            false       true      ["join","ovn-default"]                                       ovn-default
vm-vnet       false            false       true      ["vm-subnet-1"]
```

```powershell
root@kubeovn-worker1:~# kubectl get subnet
NAME                       PROVIDER                               VPC           VLAN   PROTOCOL   CIDR             PRIVATE   NAT     DEFAULT   GATEWAYTYPE   V4USED   V4AVAILABLE   V6USED   V6AVAILABLE   EXCLUDEIPS                      U2OINTERCONNECTIONIP
join                       ovn                                    ovn-cluster          IPv4       100.64.0.0/16    false     false   false                   3        65530         0        0             ["100.64.0.1"]
ovn-default                ovn                                    ovn-cluster          IPv4       10.16.0.0/16     false     true    true      distributed   21       65512         0        0             ["10.16.0.1"]
ovn-vpc-external-network   ovn-vpc-external-network.kube-system                        IPv4       172.100.0.0/24   false     false   false                   2        202           0        0             ["172.100.0.1..172.100.0.50"]
vm-subnet-1                ovn                                    vm-vnet              IPv4       192.168.0.0/24   false     false   false                   6        247           0        0             ["192.168.0.1"]
```

| Role | VPC | Subnet | CIDR | Usage in vpc-dns |
| --- | --- | --- | --- | --- |
| Default VPC | `ovn-cluster` | `ovn-default` | 10.16.0.0/16 | eth1 (net1) — reaches APIServer for list/watch |
| Custom VPC | `vm-vnet` | `vm-subnet-1` | 192.168.0.0/24 | eth0 — serves DNS :53 to user Pods/VMs |

---
Step1: Deploy RBAC and CoreDNS Corefile
--------------------------------
Create the ClusterRole, ClusterRoleBinding, ServiceAccount, and CoreDNS Corefile ConfigMap required by `vpc-dns`.
[RBAC + Corefile.txt](/.attachments/RBAC%20+%20Corefile-31a8ea46-a233-4ee3-ad3f-b93a658bdd02.txt)
**💡 Note:** This Corefile is similar to the default cluster CoreDNS config. It resolves `cluster.local` via the kubernetes plugin and forwards other domains upstream. This feature also depends on the `nat-gw-pod` image for route configuration.

  

---
Step2: Create NetworkAttachmentDefinition (Second NIC)
-----------------------------------------------
The vpc-dns Pod requires dual NICs. This `NetworkAttachmentDefinition` via Multus CNI configures the second NIC (eth1) connecting to the default VPC.
```powershell
cat <<EOF | kubectl apply -f -
apiVersion: "k8s.cni.cncf.io/v1"
kind: NetworkAttachmentDefinition
metadata:
  name: ovn-nad
  namespace: default
spec:
  config: '{
      "cniVersion": "0.3.0",
      "type": "kube-ovn",
      "server_socket": "/run/openvswitch/kube-ovn-daemon.sock",
      "provider": "ovn-nad.default.ovn"
    }'
EOF
```
**💡 Key:** The `provider` format is `{name}.{namespace}.ovn`, i.e. `ovn-nad.default.ovn`. The `nad-provider` in Step 3 must match this value exactly.

  

---
Step3: Configure vpc-dns Global Parameters (ConfigMap)
-----------------------------------------------
Create the `vpc-dns-config` ConfigMap in `kube-system` namespace to control vpc-dns global behavior.
```powershell
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: vpc-dns-config
  namespace: kube-system
data:
  enable-vpc-dns: "true"              # Enable vpc-dns feature
  coredns-vip: "10.96.0.3"            # LB VIP for CoreDNS (modify as needed)
  nad-name: ovn-nad                    # NAD name from Step 2
  nad-provider: ovn-nad.default.ovn    # Must match NAD provider
EOF
```
Full parameter reference:
| Parameter | Description | Default |
| --- | --- | --- |
| `enable-vpc-dns` | Enable/disable vpc-dns feature | `"true"` |
| `coredns-vip` | VIP address for CoreDNS LB service | (required) |
| `coredns-image` | CoreDNS container image | Cluster's current CoreDNS version |
| `coredns-template` | CoreDNS Deployment template URL | Built-in template for current Kube-OVN version |
| `nad-name` | NetworkAttachmentDefinition resource name | (required) |
| `nad-provider` | Provider name in the NAD | (required) |
| `k8s-service-host` | IP for CoreDNS to reach K8s APIServer | In-cluster apiserver address |
| `k8s-service-port` | Port for CoreDNS to reach K8s APIServer | In-cluster apiserver port |

Step4: Create VpcDns Resource
----------------------
Create a `VpcDns` CRD instance specifying which VPC and Subnet to deploy the DNS component in.
```powershell
cat <<EOF | kubectl apply -f -
apiVersion: kubeovn.io/v1
kind: VpcDns
metadata:
  name: vm-vnet-dns
spec:
  vpc: vm-vnet
  subnet: vm-subnet-1
  replicas: 2                        # Recommended ≥2 for HA
EOF
```
**⚠️ Constraint:** Only **one** active vpc-dns instance per VPC. If multiple VpcDns resources exist under the same VPC (pointing to different subnets), only one will have `ACTIVE=true`, others will be `false`. When the active instance is deleted, the system auto-activates a `false` one as replacement.

  

---
Step5: Configure Pod/VM to Use VPC DNS (Required)
------------------------------------------
The VIP is NOT auto-injected. You must manually configure `/etc/resolv.conf` or use a Webhook for auto-injection.
```powershell
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: test-dns-pod
  annotations:
    ovn.kubernetes.io/logical_switch: vm-subnet-1   # Attach to custom VPC subnet
spec:
  dnsPolicy: "None"                   # Do not use cluster default DNS
  dnsConfig:
    nameservers:
      - 10.96.0.3                    # vpc-dns VIP
    searches:
      - default.svc.cluster.local
      - svc.cluster.local
      - cluster.local
    options:
      - name: ndots
        value: "5"
  containers:
  - name: app
    image: busybox
    command: ["sleep", "3600"]
EOF
```

Step6: Verify Deployment
-----------------
**Check 1: Confirm VpcDns Status**
```powershell
kubectl get vpc-dns
```
Expected output:
```powershell
root@kubeovn-worker1:~# kubectl get vpc-dns
NAME          ACTIVE   VPC       SUBNET
vm-vnet-dns   true     vm-vnet   vm-subnet-1
```
**Check 2: Confirm vpc-dns Pod Status**
```powershell
kubectl get pods -o wide -A | grep vpc-dns
```

Expected output:
```powershell
root@kubeovn-worker1:~# kubectl get pods -o wide -A | grep vpc-dns
kube-system   vpc-dns-vm-vnet-dns-5df8998c75-pl7k8     1/1     Running   0               13h     192.168.0.4     kubeovn-worker2   <none>           <none>
kube-system   vpc-dns-vm-vnet-dns-5df8998c75-w48r7     1/1     Running   0               13h     192.168.0.3     kubeovn-worker1   <none>           <none>
```
**Check 3: Confirm SwitchLBRule (SLR) Created**
```powershell
kubectl -n kube-system get slr
```
Expected output:
```powershell
root@kubeovn-worker1:~# kubectl -n kube-system get slr
NAME                  VIP         PORT(S)                  SERVICE                               AGE
vpc-dns-vm-vnet-dns   10.96.0.3   53/UDP,53/TCP,9153/TCP   kube-system/slr-vpc-dns-vm-vnet-dns   13h
```

**Check 4: Verify Dual NIC (Multi-NIC) Configuration**
Each vpc-dns Pod must have **two network interfaces** to function correctly:
*   **eth0** (primary NIC): Attached to the **Custom VPC subnet** (`vm-subnet-1`, 192.168.0.0/24). This is where DNS queries arrive from user Pods via the SLR VIP.
*   **net1** (secondary NIC via NAD): Attached to the **Default VPC subnet** (`ovn-default`, 10.16.0.0/16). This allows the CoreDNS `kubernetes` plugin to reach the Kubernetes APIServer for list/watch of Service and Endpoints resources — which is required for resolving `*.svc.cluster.local` names.
If the secondary NIC (`net1`) is missing, CoreDNS cannot contact the APIServer and **all cluster.local DNS resolution will fail**.
Run this command for **each** vpc-dns Pod to confirm dual NIC is properly configured:
```powershell
# Replace POD_NAME with actual Pod name from Check 2
$ POD=vpc-dns-vm-vnet-dns-xxxxx-xxxxx
$ NS=kube-system

$ kubectl -n $NS get pod $POD \
  -o jsonpath='{.metadata.annotations.k8s\.v1\.cni\.cncf\.io/network-status}'
$ echo
```
Expected output (two entries — one per NIC):
```powershell
root@kubeovn-worker1:~#
POD=vpc-dns-vm-vnet-dns-5df8998c75-pl7k8
NS=kube-system

kubectl -n $NS get pod $POD -o jsonpath='{.metadata.annotations.k8s\.v1\.cni\.cncf\.io/network-status}'
echo
[{
    "name": "kube-ovn",
    "interface": "eth0",
    "ips": [
        "192.168.0.4"
    ],
    "mac": "fa:d0:4b:d7:d7:39",
    "default": true,
    "dns": {},
    "gateway": [
        "192.168.0.1"
    ]
},{
    "name": "default/ovn-nad",
    "interface": "net1",
    "ips": [
        "10.16.0.44"
    ],
    "mac": "1a:2a:a9:68:b2:5b",
    "dns": {}
}]
```
**Key fields to verify:**
| Field | Expected Value | Meaning |
| --- | --- | --- |
| `interface: "eth0"` | Primary NIC | Connected to Custom VPC (`vm-subnet-1`). Serves DNS :53. |
| `interface: "net1"` | Secondary NIC (NAD) | Connected to Default VPC (`ovn-default`). Reaches APIServer. |
| `name: "default/ovn-nad"` | NAD reference | Confirms the NetworkAttachmentDefinition from Step 2 is applied. |
| `ips` for eth0 | 192.168.0.x range | IP from `vm-subnet-1` CIDR. |
| `ips` for net1 | 10.16.0.x range | IP from `ovn-default` CIDR. |

⚠️ If the output shows **only one entry** (missing `net1`), check that the NAD (`ovn-nad`) was deployed correctly in Step 2 and that the Pod annotations include `k8s.v1.cni.cncf.io/networks: default/ovn-nad`.

**Check 5: Test DNS Resolution**
From Pod 'test-dns-pod' in the custom VPC, test DNS resolution using the VIP:
```powershell
root@kubeovn-worker1:~# kubectl exec -it test-dns-pod -- /bin/sh
/ # cat /etc/resolv.conf
search default.svc.cluster.local svc.cluster.local cluster.local
nameserver 10.96.0.3
options ndots:5

/ # nslookup kubernetes.default.svc.cluster.local
Server:         10.96.0.3
Address:        10.96.0.3:53


Name:   kubernetes.default.svc.cluster.local
Address: 10.96.0.1

/ # nslookup www.google.com
Server:         10.96.0.3
Address:        10.96.0.3:53

Non-authoritative answer:
Name:   www.google.com
Address: 142.250.73.132

Non-authoritative answer:
Name:   www.google.com
Address: 2607:f8b0:400a:80c::2004
```
**Check 6: Verify vpc-dns Pod's Own DNS Policy**
**Why this check matters:** The vpc-dns Pod itself also needs to resolve external domain names (via the `forward` plugin in Corefile). Its `dnsPolicy` determines where the Pod's own `/etc/resolv.conf` points to — this is **not** about serving DNS to user Pods, but about the CoreDNS `forward` plugin's upstream resolver.
*   `dnsPolicy: Default` — The Pod inherits the **Node's** `/etc/resolv.conf`. The `forward` plugin will use the Node's DNS server (e.g. `127.0.0.53` → systemd-resolved → upstream like `168.63.129.16`) to resolve non-`cluster.local` domains.
*   `dnsPolicy: ClusterFirst` — The Pod would use kube-dns (10.96.0.10), but since vpc-dns is in Custom VPC and cannot reach kube-dns, this would **break** external DNS resolution.
Run:
```powershell
# Replace POD_NAME with actual Pod name from Check 2
$ POD=vpc-dns-vm-vnet-dns-xxxxx-xxxxx
$ NS=kube-system

$ kubectl -n $NS get pod $POD \
  -o jsonpath='{.spec.dnsPolicy}{"\n"}{.spec.dnsConfig}{"\n"}'
```
Expected output:
```powershell
Default 
(empty line — no custom dnsConfig)
```
`dnsPolicy: Default` means the vpc-dns Pod uses the **Node's DNS** for its own outbound resolution. This is correct because:
1.  The CoreDNS `forward . /etc/resolv.conf` directive forwards non-`cluster.local` queries to whatever is in the Pod's `/etc/resolv.conf`.
2.  With `dnsPolicy: Default`, `/etc/resolv.conf` points to the Node's resolver (e.g. `127.0.0.53` via systemd-resolved).
3.  The Node's systemd-resolved then forwards to the actual upstream DNS (e.g. Azure DNS `168.63.129.16`).

**Verify Node Upstream DNS (Optional)**
**Why:** Since vpc-dns Pod uses `dnsPolicy: Default` (inherits Node DNS), confirming the Node's upstream DNS is healthy ensures the `forward` plugin can resolve external domains (e.g. `google.com`).
```powershell
# Run on the worker Node where vpc-dns Pod is scheduled
$ cat /etc/resolv.conf
$ resolvectl status
```
/etc/resolv.conf output:
```powershell
nameserver 127.0.0.53 ← systemd-resolved stub
```
resolvectl status (Link eth0)
```powershell
Link 2 (eth0) 
Current Scopes: DNS 
Current DNS Server: 168.63.129.16 ← Azure DNS (actual upstream) 
DNS Servers: 168.63.129.16
```
**DNS resolution chain for external domains:**
`User Pod` → `vpc-dns VIP (10.96.0.3)` → `CoreDNS forward plugin` → `Pod /etc/resolv.conf (127.0.0.53)` → `Node systemd-resolved` → `168.63.129.16 (Azure DNS)`