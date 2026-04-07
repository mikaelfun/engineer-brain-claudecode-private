---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Rack Scale/Readiness/ALRS Kube-OVN/Load Balancer (OVNLB) Architecture & Traffic Steering/Kube-OVN Custom VPC Internal Load Balancer"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Rack%20Scale/Readiness/ALRS%20Kube-OVN/Load%20Balancer%20%28OVN%E2%80%91LB%29%20Architecture%20%26%20Traffic%20Steering/Kube-OVN%20Custom%20VPC%20Internal%20Load%20Balancer"
importDate: "2026-04-06"
type: troubleshooting-guide
---

This guide helps you set up and verify **internal load balancing** inside a Kube-OVN **Custom VPC**. It walks through the full workflow — from deploying backends to creating the load balancer rule to verifying the OVN data path — so you can confidently troubleshoot or build this feature in a customer environment.

Overview — What Is SwitchLBRule?
--------------------------------
SwitchLBRule creates an OVN load balancer **bound to the Logical Switch** (not the Router), providing L2-level DNAT within a Custom VPC — no routing involved.

**Why do you need SwitchLBRule?**  
In Kube-OVN, Custom VPCs are **fully isolated** — each VPC has its own OVN logical router, separated from the cluster's default networking. This isolation means:
*   Standard Kubernetes `type: LoadBalancer` and `NodePort` services **do not work** in Custom VPCs
*   `kube-proxy` rules only apply to the default VPC — Custom VPC traffic never hits them
*   There is no distributed/centralized gateway to bridge external traffic into Custom VPCs
**SwitchLBRule (SLR)** fills this gap. It creates an OVN load balancer directly on the **Logical Switch**, providing L2-level DNAT within the Custom VPC — no routing, no kube-proxy, no external gateway required. It is the **only native way** to load-balance traffic among Pods inside a Custom VPC.

Lab Environment
---------------
Confirm your VPC and Subnet layout before starting:
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

| Role | VPC | Subnet | CIDR |
| --- | --- | --- | --- |
| Default VPC | `ovn-cluster` | `ovn-default` | 10.16.0.0/16 |
| Custom VPC | `vm-vnet` | `vm-subnet-1` | 192.168.0.0/24 |

Step1: Deploy Backend Pods/VMs in Custom VPC
-------------------------------------
First, deploy the backend workload (e.g. nginx) in the custom VPC subnet. The SLR will load-balance traffic to these Pods.
```powershell
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-lb-backend
  namespace: default
spec:
  replicas: 2
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
      annotations:
        ovn.kubernetes.io/logical_switch: vm-subnet-1   # Attach to custom VPC subnet
    spec:
      containers:
      - name: nginx
        image: nginx:latest
        ports:
        - containerPort: 80
EOF
```

Verify backend Pods are running:
```powershell
# Confirm Pod IPs are in 192.168.0.0/24 range (vm-subnet-1)
kubectl get pods -l app=nginx -o wide
root@kubeovn-worker1:~# kubectl get pods -l app=nginx -o wide
NAME                                READY   STATUS    RESTARTS   AGE     IP            NODE              NOMINATED NODE   READINESS GATES
nginx-lb-backend-6f896bcff5-9gc6l   1/1     Running   0          3d23h   192.168.0.8   kubeovn-worker2   <none>           <none>
nginx-lb-backend-6f896bcff5-p7dnl   1/1     Running   0          3d23h   192.168.0.7   kubeovn-worker1   <none>           <none>

```
The annotation `ovn.kubernetes.io/logical_switch: vm-subnet-1` is what places the Pods into the Custom VPC. Without it, Pods land in the Default VPC (`ovn-default`).

---

Step2: Create SwitchLBRule
------------------------------------
SwitchLBRule supports two modes for backend discovery:
| Mode | Use Case | Backend Discovery |
| --- | --- | --- |
| Selector | Standard Pods with labels | Automatic — watches Pods matching label selector |
| Endpoints | Static IPs, VMs, or secondary interfaces | Manual — you provide the backend IP list |

Create a `SwitchLBRule` that automatically discovers backend Pods by label selector.
**VIP address:** Since backend Pods are in `192.168.0.0/24`, the VIP must be **outside** this CIDR. Example below uses `10.10.10.100`.

Step 2A — SLR with Selector (auto-discover backends)
```powershell
cat <<EOF | kubectl apply -f -
apiVersion: kubeovn.io/v1
kind: SwitchLBRule
metadata:
  name: nginx-slr
  namespace: default
spec:
  vip: 10.10.10.100              # VIP outside vm-subnet-1 CIDR
  sessionAffinity: ClientIP      # or None
  namespace: default              # namespace of the backend Pods
  selector:                       # label selector (like K8s Service)
    - app:nginx
  ports:
  - name: http
    port: 80                      # VIP listening port
    targetPort: 80               # backend Pod port
    protocol: TCP
EOF
```
| Field | Description |
| --- | --- |
| `vip` | Load balancing virtual IP. Must be outside backend subnet CIDR. |
| `sessionAffinity` | `ClientIP` (sticky) or `None` (round-robin). Same as K8s Service. |
| `namespace` | Namespace where the backend Pods reside. |
| `selector` | Label selector to auto-discover Pods. Format: `key:value`. |
| `ports` | Port mappings. `port` = VIP port, `targetPort` = backend port. |

**Alternative: Endpoints-based SLR**  
If you need to target static IPs or secondary interfaces, use `endpoints` instead of `selector`:
Step 2B — SLR with static Endpoints (alternative)
```powershell
cat <<EOF | kubectl apply -f -
apiVersion: kubeovn.io/v1
kind: SwitchLBRule
metadata:
  name: nginx-slr
  namespace: default
spec:
  vip: 10.10.10.100
  sessionAffinity: ClientIP
  namespace: default
  endpoints:                      # static backend IPs
    - 192.168.0.10
    - 192.168.0.11
  ports:
  - name: http
    port: 80
    targetPort: 80
    protocol: TCP
EOF
```
**Optional annotations on SLR:**  
`ovn.kubernetes.io/logical_router` — Force SLR to a specific VPC (skip auto-detection).  
`ovn.kubernetes.io/logical_switch` — Force SLR to a specific subnet.  
`ovn.kubernetes.io/service_health_check: false` — Disable OVN health checks.

Step3: Verify Deployment
-----------------
**Check 1: Confirm SwitchLBRule Created**
```powershell
root@kubeovn-worker1:~# kubectl get slr
NAME                  VIP            PORT(S)                  SERVICE                               AGE
nginx-slr             10.10.10.100   80/TCP                   default/slr-nginx-slr                 125m
vpc-dns-vm-vnet-dns   10.96.0.3      53/UDP,53/TCP,9153/TCP   kube-system/slr-vpc-dns-vm-vnet-dns   20h
```

**Check 2: Inspect OVN Load Balancer**
```powershell
root@kubeovn-worker1:~# kubectl ko nbctl list Load_Balancer
_uuid               : 210d20fb-768c-4468-8db8-7bf0735066ce
external_ids        : {}
health_check        : [9e5c0c5d-33d0-4258-a95e-b066e8a30e85]
ip_port_mappings    : {"192.168.0.7"="nginx-lb-backend-6f896bcff5-p7dnl.default:192.168.0.5", "192.168.0.8"="nginx-lb-backend-6f896bcff5-9gc6l.default:192.168.0.5"}
name                : vpc-vm-vnet-tcp-sess-load
options             : {affinity_timeout="10800", prefer_local_backend="false"}
protocol            : tcp
selection_fields    : [ip_src]
vips                : {"10.10.10.100:80"="192.168.0.7:80,192.168.0.8:80"}
```
Key fields to verify:
| Field | Expected Value | Meaning |
| --- | --- | --- |
| `vips` | `{"10.10.10.100:80"="192.168.0.7:80,192.168.0.8:80"}` | VIP maps to backend Pod IPs |
| `health_check` | Non-empty UUID list | Health check is associated |
| `ip_port_mappings` | Backend IPs with health check source | Maps each backend to health check VIP |
| `protocol` | `tcp` | Protocol matches SLR spec |

**Check 3: Test Load Balancing from a Client Pod**
From any Pod in the same custom VPC, send a request to the VIP to confirm traffic is load-balanced:
```powershell
root@kubeovn-worker1:~# kubectl exec -it pod-a -- curl 10.10.10.100:80
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
...
<p><em>Thank you for using nginx.</em></p>
</body>
</html>
```

**Check 4: Verify OVN LB DNAT Flows for VIP**
Confirms that OVN has programmed DNAT flows for the VIP in the Logical Switch's `ls_in_lb` (load balancer) pipeline stage.
Dump OVN SB flows — look for LB DNAT rules
```powershell
root@kubeovn-worker1:~# kubectl ko sbctl dump-flows vm-subnet-1 | grep "10.10.10.100"
  table=6 (ls_in_pre_stateful ), priority=120  , match=(reg0[2] == 1 && ip4.dst == 10.10.10.100 && tcp.dst == 80), action=(reg1 = 10.10.10.100; reg2[0..15] = 80; ct_lb_mark;)
  table=13(ls_in_lb), priority=120  , match=(ct.new && ip4.dst == 10.10.10.100 && tcp.dst == 80), action=(ct_lb_mark(backends=192.168.0.7:80,192.168.0.8:80);)

```
| Stage | Pipeline | What It Does |
| --- | --- | --- |
| 6 | `ls_in_pre_stateful` | Matches VIP, marks packet for conntrack LB processing |
| 13 | `ls_in_lb` | **DNAT** — rewrites `ip4.dst` from VIP to backend Pod IP |

You should see flows containing the VIP `10.10.10.100` in `ls_in_lb` stage. These flows match `ct.new && ip4.dst == 10.10.10.100` and apply `ct_lb_mark` to DNAT the destination to a backend Pod IP. This confirms the LB interception happens at the Logical Switch ingress pipeline — **before** the packet reaches the Router.

**Check 5: Verify LB is Bound to the Logical Switch**
```powershell
#Check Logical Switch load_balancer association
root@kubeovn-worker1:~# kubectl ko nbctl ls-lb-list vm-subnet-1
UUID                                    LB                  PROTO      VIP                IPs
1cb04269-71c9-46e4-8cd5-8a2cd94e0271    vpc-vm-vnet-tcp-    tcp        10.96.0.3:53       192.168.0.3:53,192.168.0.4:53
                                                            tcp        10.96.0.3:9153     192.168.0.3:9153,192.168.0.4:9153
210d20fb-768c-4468-8db8-7bf0735066ce    vpc-vm-vnet-tcp-    tcp        10.10.10.100:80    192.168.0.7:80,192.168.0.8:80
aa5bde6a-40e4-4f5d-aab9-713b6f1fc5b1    vpc-vm-vnet-udp-    udp        10.96.0.3:53       192.168.0.3:53,192.168.0.4:53
```
This proves: the LB is bound to the **Logical Switch** (`vm-subnet-1`), the VIP is matched in the L2 pipeline, and traffic is DNAT'd to backend Pod IPs — all without routing.

**Check 6: Verify Traffic Path — Pod Routes via Gateway, LB Intercepts**
The VIP (`10.10.10.100`) is **outside** the Pod's subnet (`192.168.0.0/24`), so the Pod will NOT ARP for the VIP. Instead, it sends the packet to the default gateway. OVN's LB intercepts the packet in the Logical Switch pipeline **before** it reaches the Router.
```powershell
#1.Confirm Pod routes VIP via gateway (not direct ARP）
root@kubeovn-worker1:~# kubectl exec -it pod-a -- ip route get 10.10.10.100
10.10.10.100 via 192.168.0.1 dev eth0  src 192.168.0.2
```
Expected output: `10.10.10.100 via **192.168.0.1** dev eth0` — confirms the Pod sends VIP traffic to the gateway, not directly.
```powershell
#2.Confirm curl still works (LB DNAT is active）
root@kubeovn-worker1:~# kubectl exec -it pod-a -- curl 10.10.10.100:80
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
...
<p><em>Thank you for using nginx.</em></p>
</body>
</html>
```
Nginx response returned. This proves the LB intercepts the packet **at the Logical Switch** even though the Pod addresses it to the gateway.
*   Step 1 showed the Pod routes `10.10.10.100` via gateway `192.168.0.1` → the packet's `dst_mac = gateway MAC`
*   Normally, this packet would enter the Logical Router for routing → but the Router has **no route** for `10.10.10.0/24` → the packet should be **dropped**
*   But `curl` succeeds → the packet **never reached the Router**
*   The only explanation: OVN's `ls_in_lb` stage (table 13) in the **Logical Switch ingress pipeline** intercepted the packet and performed DNAT **before** it could reach the Router

```powershell
#3.Confirm ARP entry is for the gateway, NOT the VIP
root@kubeovn-worker1:~# kubectl exec -it pod-a -- ip neigh show
192.168.0.1 dev eth0 lladdr 72:15:d8:cf:2b:51 used 0/0/0 probes 1 STALE
```
There is an ARP entry for `192.168.0.1` (the gateway) but **NO** entry for `10.10.10.100`. This confirms:
*   The Pod never ARPs for the VIP (it is outside the local subnet)
*   The Pod sends to the gateway's MAC, with `dst_ip = 10.10.10.100`
*   OVN's `ls_in_lb` stage intercepts and DNATs the packet before it leaves the Logical Switch
