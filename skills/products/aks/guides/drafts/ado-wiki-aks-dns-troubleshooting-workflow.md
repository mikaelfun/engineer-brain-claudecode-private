---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/AKS Network Troubleshooting Methodology/AKS DNS troubleshooting workflow"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2FAKS%20DNS%20troubleshooting%20workflow"
importDate: "2026-04-05"
type: troubleshooting-guide
---
# AKS DNS troubleshooting workflow

Author: @<49DA5BCB-FF89-4F96-877C-3D9D211C6ED9>

[[_TOC_]]

## High level workflow

::: mermaid
graph LR;
STR([Start]) --> B[Collect the facts];
B --> C[Generate tests at <br>different levels to <br>reproduce the issue];
C --> D[Review health and <br>performance of the <br>nodes];
C --> E[Capture traffic and <br>review DNS <br>performance];
C --> F[Review health and <br>performance of the <br>coredns pods];
D --> G[Develop hypothesis];
E --> G[Develop hypothesis];
F --> G[Develop hypothesis];
G --> H{Is the issue <br>external to AKS?};
H -->|Yes| I[Identify the <br>support groups <br>for external <br>components];
I --> J[Collaborate with <br>corresponding <br>groups];
J --> K[Create an action <br>plan];
H -->|No| K;
K --> L[Implement action <br>plan and observe <br>results];
L --> N{Is the issue <br>resolved?};
N -->|Yes| M[Document findings <br>and resolution];
M --> END([End]);
N -->|No| O[Escalation process];
O --> B;
:::

<details>
  <summary><b>Diagram image from Visio</b></summary>

![DNS-troubleshooting-highlevel-workflow.png](/.attachments/1-DNS-troubleshooting-highlevel-workflow.png)

</details>

## Troubleshooting steps

<details open>
  <summary><b>1 - Collect the facts</b></summary>

## 1 - Collect the facts

### Summary

The following aims to provide a minimum baseline of required information that has to be requested from the customer or collected using our internal tools before we start troubleshooting AKS DNS issues.

### Baseline questionnaire template

**1. Where is the DNS resolution failing?**

_Pod | Node | Both nodes and pods_

**2. What type of DNS errors do you get?**

_Timeout | No such host | Other DNS error_

**3. How often do the DNS errors happen?**

_Always | Intermittently | Specific pattern_

**4. Which records are affected?**

_Specific domain | Any domain_

**5. Are there any custom DNS configurations?**

_Custom DNS server configured on the VNET | Custom DNS on coredns config_

### Example

Using the scenario from "AKS troubleshooting DNS issues lab" section [Problem description](/Azure-Kubernetes-Service-Wiki/AKS/TSG/AKS-Network-Troubleshooting-Methodology/[TSG]-AKS-troubleshooting-DNS-issues-lab#problem-description), we can address the questions as follow:

1. Where is the DNS resolution failing?

   _Issue only happens at pods_

2. What type of DNS errors do you get?

   _The error is "No such host"_

   _Specific error from app:_

  ```text
   Error: not able to resolve host db.contoso.com
  ```

3. How often do the DNS errors happen?

   _Intermittently_

4. Which records are affected?

   _Specific domain "`db.contoso.com`"_

5. Are there any custom DNS configurations?

   _Custom DNS servers are configured on the VNET. There is no custom DNS on coredns config._

</details>
<br>

<details open>
  <summary><b>2 - Generate tests at different levels to reproduce the issue</b></summary>

## 2 - Generate tests at different levels to reproduce the issue

### Summary

The following aims to provide a set of minimum  test that can be done to identify at what level the name resolution is failing - _Pod | Node | Both nodes and pods_

The result of the tests will help you filling up the "required inputs" from the Develop hypothesis step.

Based on customer issue, related to failing name resolution, you can use at least two type of tests at the pod level and at the node level.

### Baseline tests from inside a test pod

**1. Start a test pod, using the next kubectl command line and exec into it to do the tests:**

`kubectl run dns-test --image mcr.microsoft.com/mirror/docker/library/busybox:1.35 -- sleep inf`

`kubectl exec -it pod/dns-test -- sh`

**2. Test the name resolution for customer FQDN using nslookup**

`nslookup {FQDN}`

_**2.1 Next to the output of a working name resolution:**_

```bash
/ # # This is an example and we used mcr.microsoft.com for the test
/ #
/ # nslookup mcr.microsoft.com
Server:         10.0.0.10
Address:        10.0.0.10:53

Non-authoritative answer:
mcr.microsoft.com       canonical name = global.fe.mscr.io
global.fe.mscr.io       canonical name = mcr-microsoft-com.a-0016.a-msedge.net
mcr-microsoft-com.a-0016.a-msedge.net   canonical name = a-0016.a-msedge.net

Non-authoritative answer:
mcr.microsoft.com       canonical name = global.fe.mscr.io
global.fe.mscr.io       canonical name = mcr-microsoft-com.a-0016.a-msedge.net
mcr-microsoft-com.a-0016.a-msedge.net   canonical name = a-0016.a-msedge.net
Name:   a-0016.a-msedge.net
Address: 204.79.197.219

/ #
```

_**2.2 Next to the output of a non working resolution, where coreDNS is not getting a response from upstream DNS server(s)**_

```bash
/ # nslookup mcr.microsoft.com
Server:         10.0.0.10
Address:        10.0.0.10:53

;; connection timed out; no servers could be reached

/ #
```

_**2.3 To rule out a possible problem with CoreDNS, we can use the Azure DNS server, 168.63.129.16, for our tests**_

We see in this example that using Azure DNS server name resolution working. In this scenario the issue might be related to coreDNS or its configuration.

```bash
/ #
/ # nslookup mcr.microsoft.com 168.63.129.16
Server:         168.63.129.16
Address:        168.63.129.16:53

Non-authoritative answer:
mcr.microsoft.com       canonical name = global.fe.mscr.io
global.fe.mscr.io       canonical name = mcr-microsoft-com.a-0016.a-msedge.net
mcr-microsoft-com.a-0016.a-msedge.net   canonical name = a-0016.a-msedge.net
Name:   a-0016.a-msedge.net
Address: 204.79.197.219

Non-authoritative answer:
mcr.microsoft.com       canonical name = global.fe.mscr.io
global.fe.mscr.io       canonical name = mcr-microsoft-com.a-0016.a-msedge.net
mcr-microsoft-com.a-0016.a-msedge.net   canonical name = a-0016.a-msedge.net

/ #
```

_**2.4 Next to the output for a FQDN that cannot be resolved**_

Please keep in mind that the response NXDOMAIN means the requested FQDN is not found by the specific DNS server.

```bash
/ #
/ # nslookup mcr.microsoft.de
Server:         10.0.0.10
Address:        10.0.0.10:53

** server can't find mcr.microsoft.de: NXDOMAIN

** server can't find mcr.microsoft.de: NXDOMAIN

/ #
```

_**2.5 To rule out that the issue is related to coreDNS we can use an explicit DNS server for resolution**_

We observe that event request the name resolution from Azure DNS server, the FQDN is still not found.
It might be possible the customer is using a custom DNS server on the VNet.
In this scenario replace the Azure DNS server 168.63.129.16, with the one on the VNet.

```bash
/ #
/ # nslookup mcr.microsoft.de 168.63.129.16
Server:         168.63.129.16
Address:        168.63.129.16:53

** server can't find mcr.microsoft.de: NXDOMAIN

** server can't find mcr.microsoft.de: NXDOMAIN

/ #
```

Please check the the steps highlighted in section [3c - Capture traffic and review DNS resolution performance](#3c---capture-traffic-and-review-dns-resolution-performance) for tools and procedures on how you can collect network captures, depending on the level where the name resolution is failing.

_**2.6 Remove the test pod from customer cluster using the next command:**_

`kubectl delete pod dns-test`

### Baseline tests from inside a node

**1. Connect to one of the nodes, using the next command lines:**

`kubectl debug node/{node-name} --image mcr.microsoft.com/mirror/docker/library/busybox:1.35 -- sleep inf`

`kubectl exec -it {pod-name} -- sh`

`chroot /host/`

Next to the output of the above commands for the nodename aks-syssmall-87611351-vmss00000f

```bash
/ # kubectl debug node/aks-syssmall-87611351-vmss00000f --image mcr.microsoft.com/mirror/docker/library/busybox:1.35 -- sleep inf
Creating debugging pod node-debugger-aks-syssmall-87611351-vmss00000f-qsvz8 with container debugger on node aks-syssmall-87611351-vmss00000f.
/ #
/ # kubectl exec -it node-debugger-aks-syssmall-87611351-vmss00000f-qsvz8 -- sh
/ #
/ # chroot /host/
root [ / ]#
```

_**2.1 Next to the output of a working name resolution from the node:**_

The shell prompt looks different from Ubuntu nodes, as I am using Azure Linux nodes for the tests.
We can observe  that the name resolution is been done by the Azure DNS server, 168.63.129.16.

```text
root [ / ]# # This is an example and we used mcr.microsoft.com for the test
root [ / ]#
root [ / ]# nslookup mcr.microsoft.com
Server:         168.63.129.16
Address:        168.63.129.16#53

Non-authoritative answer:
mcr.microsoft.com       canonical name = global.fe.mscr.io.
global.fe.mscr.io       canonical name = mcr-microsoft-com.a-0016.a-msedge.net.
mcr-microsoft-com.a-0016.a-msedge.net   canonical name = a-0016.a-msedge.net.
Name:   a-0016.a-msedge.net
Address: 204.79.197.219

root [ / ]#
```

_**2.2 Next to the output of a non working name resolution from the node where the DNS server is timing out**_

Using the flag `-timeout=` we can control how many seconds nslookup will wait for a response.

```text
root [ / ]#
root [ / ]# nslookup -timeout=10 mcr.microsoft.com
;; connection timed out; no servers could be reached

root [ / ]#
```

Please check the steps highlighted in section [3c - Capture traffic and review DNS resolution performance](#3c---capture-traffic-and-review-dns-resolution-performance) for tools and procedures on how you can collect network captures, depending on the level where the name resolution is failing.

</details>
<br>

<details open>
  <summary><b>3a - Review health and performance of nodes</b></summary>

## 3a - Review health and performance of nodes

### Summary

DNS resolution performance issues can manifest as intermittent errors, specifically 'timed out' from the client's perspective. One of the main causes of this issue could be when nodes hosting the CoreDNS POD experience resource exhaustion and/or IO throttling. The objective of this document is to guide engineers on how to identify whether slow DNS resolution is caused by slow node performance.

### Identify Node name for CoreDNS POD

#### Method 1 From ASI

![image.png](/.attachments/image-46de4dc0-8ce7-4c83-99ea-664ed2331438.png)

#### Method 2 From Jarvis Action [kubectl]

![image.png](/.attachments/image-6d6e6f91-6fcf-4627-9e5d-4ea87ec71da5.png)
<br>
![image.png](/.attachments/image-4585ec59-1acc-458f-9da5-aa70dfab42ad.png)

### Review the Node Performance of Node

1. Open Node, where CoreDNS POD hosted in the ASI, and click the VM Performance (please refer below screenshot)

![image.png](/.attachments/image-1502e1a1-747e-4d83-b438-29726634103e.png)

2. VM Per-WithParameters Dashboard

![image.png](/.attachments/image-87c29565-6876-4da0-984f-6a025b287f22.png)

Review the CPU, Memory, and IO graph to view any indication of resource crunch.

### Check node health from Applens

We can use the Applens Node Health detector to get a general overview of the cluster nodes health ("Checks for any node related issues in the AKS cluster. This includes issues with CPU, Memory, and Disk resource saturation, as well as general node availability issues.")

For example:

![Applens-Node-Health.png](/.attachments/Applens-Node-Health.png)

### Review nodes request and limits overcommitted status

We can get this information from the output of `kubectl describe nodes`. This is available in our Jarvis actions for AKS or we can ask the customer to share the output of the following command:

```text
kubectl describe no | grep -A5 '^Name:\|^Allocated resources:' | grep -v '.kubernetes.io\|^Roles:\|Labels:'
```

For example:

```text
kubectl describe no | grep -A5 '^Name:\|^Allocated resources:' | grep -v '.kubernetes.io\|^Roles:\|Labels:'                                             
Name:               aks-nodepool1-17046773-vmss00000m
--
Allocated resources:
  (Total limits may be over 100 percent, i.e., overcommitted.)
  Resource           Requests    Limits
  --------           --------    ------
  cpu                250m (13%)  40m (2%)
  memory             420Mi (9%)  1762Mi (41%)
--
Name:               aks-nodepool1-17046773-vmss00000n
--
Allocated resources:
  (Total limits may be over 100 percent, i.e., overcommitted.)
  Resource           Requests     Limits
  --------           --------     ------
  cpu                612m (32%)   8532m (449%)
  memory             804Mi (18%)  6044Mi (140%)
--
Name:               aks-nodepool1-17046773-vmss00000o
--
Allocated resources:
  (Total limits may be over 100 percent, i.e., overcommitted.)
  Resource           Requests    Limits
  --------           --------    ------
  cpu                250m (13%)  40m (2%)
  memory             420Mi (9%)  1762Mi (41%)
--
Name:               aks-ubuntu-16984727-vmss000008
--
Allocated resources:
  (Total limits may be over 100 percent, i.e., overcommitted.)
  Resource           Requests     Limits
  --------           --------     ------
  cpu                250m (13%)   40m (2%)
  memory             420Mi (19%)  1762Mi (82%)
```

</details>
<br>

<details open>
  <summary><b>3b - Review health and performance of coredns pods</b></summary>

## 3b - Review health and performance of coredns pods

### Summary

The objective of this section is to guide engineers on checking the health and performance of Coredns pods that are the back-end for Coredns service using telemetry and tooling.
For application pods that have DNS policy configured as ClusterFirst or ClusterFirstWithHostNet with HostNet is True parameters, DNS lookup calls go to Coredns service backed by Coredns pods. In case of name resolution issues for app pods, it can be beneficial to do a quick Coredns pod performance review before going into further troubleshooting. If the CoreDNS pods or service are not healthy, they will not be able to respond to queries outside the namespace or forward the queries to upstream DNS servers configured on the VNET, configmaps etc.

A quick way to verify if application pod is using CoreDNS service is to look into /etc/resolv.conf file of the pod if possible. This entry points to the Coredns service IP as default config, usually to IP address of 10.0.0.10 of Coredns service in AKS.

The diagrams below describe typical lookup flow with Coredns service and default Azure upstream DNS or custom DNS.

![Image1.png](/.attachments/Image1-c1ef4959-9f93-492f-968c-e46b731ca20f.png)

Ref:
<https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/#pod-s-dns-policy>

[[TSG] CoreDNS](/Azure-Kubernetes-Service-Wiki/AKS/TSG/AKS-Network-Troubleshooting-Methodology/[TSG]-CoreDNS)

### 1. Using ASI telemetry to check AKS CoreDNS pod(s) health

ASI provides some quick ways to check for the following to verify DNS service and pod(s) health:

- CoreDNS Pods CPU usage
- CoreDNS Pods CPU Throttling
- CoreDNS Pods Memory Usage
- CoreDNS  pod restarts, deployment status(s)
- CoreDNS requests/limits parameter configuration
- CoreDNS pod(s) node placement and corresponding node disk IO related issues

If the telemetry covered below indicates Coredns service to be unhealthy due to resource exhaustion of pods themselves, adjust the Coredns autoscaler for additional replicas as covered in the links and training listed below.

<https://kubernetes.io/docs/tasks/administer-cluster/dns-horizontal-autoscaling/>

[DNS Networking module](/Azure-Kubernetes-Service-Wiki/New-Hires-and-Training/ACT-Readiness/ACT-certification-program/ACT-Specialist-Cert/AKS-Networking-Specialist-Learning-Path/DNS-Networking-module)

#### Checking Core DNS memory and CPU resources

One of the first things to check is how are the Coredns pods doing. For checking Coredns CPU, CPU throttling and memory utilization , load the corresponding cluster URI on ASI AKS service and head to the Add-ons tab below state and health timeline graphic.

If the performance shows inconsistency, check for pods placement on nodes and if any restarts or scheduling issues are reported.

![Picture1.png](/.attachments/Picture1-6338092d-5337-4799-a73a-32dd87205524.png)

#### CoreDNS Pod AKS node placements

To check for placement of pods, under the pods & restarts tab, look for pods and nodes and search for Coredns in pods parameter.

![Picture2.png](/.attachments/Picture2-bfc88e2a-208c-4d26-ac5b-70388629a447.png)

#### Checking scheduling issues, requests/limits, status

When you click on the specific pods listing as shown above, the page for specific Coredns pod will show the Coredns Pod status at different timestamps, you can expand the status entry column to see the deployment parameters.  If the pod is having issues in attaining running status, it will show up in the status here with reasons.

This page also shows the requests and limits configured for the coredns container and image version for verification, this will help in reviewing the CPU and memory usage.

![Picture3.png](/.attachments/Picture3-6557485b-f391-4825-a326-54aa781c5d7e.png)

#### Pod restarts

Under pod and restarts section, you can check if Coredns pods were having restarts when issues were reported by using the Pod filter, note the exit code if available. In the example below, the section is highlighted.

Check for OOM kills of CoreDNS pods, an exit code of 137 will indicate pods trying to use more memory that the limit configured. Certain adjustments can be made in Coredns autoscaler to tune the performance. The OOM kills with code 143 will indicate other issues such as host AKS node running out of resources. Customer will need to address node resource usage in such a case.

![Picture4.png](/.attachments/Picture4-e11e3166-0593-4ff4-b455-cac49ccbdb39.png)

#### Host node disk IO issues

At times the  Coredns pod(s) corresponding AKS node disk IO issues can cause slow response too.  This is covered under section "3a - Review health and performance of nodes".

### 2. Jarvis actions to see runtime Coredns service status and endpoints

These actions require SAW access and JIT approval.

#### CoreDNS service IP and endpoints

If the Coredns pods performance looks good, proceed to verify that the service endpoints are available in Jarvis actions under AzureContainerService- AKS -> Customer Data ->CustomerCluster- Run `kubectl describe` for resource type services usually under namespace kube-system. The output will show the Coredns service IP, by default configured as 10.0.0.10, this is the IP populated in application pod /etc/resolv.conf file for DNS server. This step also shows the corresponding endpoints as in the example below.It's important the endpoints are working since they serve the backend request of the Coredns service. If unhealthy, you can try a restart of Coredns pods, if it's a large mission critical cluster for customer it's always a good idea to check with them on restarts. In edge cases issues with IP Tables, node/pod networking runtime can cause issues with endpoints that be mitigated with pod(s) restart.

![Picture5.png](/.attachments/Picture5-39b11f68-4c17-461e-964f-d3e253ded8db.png)

#### CoreDNS Pod events and containers status

If the endpoints are not showing up, check for the pod events with run `kubectl describe` action on resource pod under kube-system namespace and look for Coredns. Check for the events section to see reasons for potential scheduling issues like availability of nodes or cluster resources.

Another action to check historical issues is to run the `kubectl` command in Jarvis action `get pod -n kube-system -o yaml` and look for Coredns pod status section. The �`conditions`� section, like �laststate� will provide information for the status of the container to help further troubleshoot issues retroactively.

In case no issues are identified, if customer agrees , restarting the pods can be performed.

![Picture6.png](/.attachments/Picture6-a93220cf-545a-4bab-8cad-559458c2a5c0.png)

### 3. Kusto queries: Another way to check for Coredns pod status, config changes is audit events table in Kusto. This provides a good way to check on historical issues or looking back in time windows for investigation

[Reuse audit TSG for Coredns pod Kusto queries](/Azure-Kubernetes-Service-Wiki/AKS/Platform-and-Tools/Tools/Kusto/Audit-query-with-Kusto)

Queries from ASI add-ons CoreDNS graphs can also be reused with modifications:
For example, on CPU usage we can get the 10 worst readings:

Execute in [[Web](https://dataexplorer.azure.com/clusters/aks/databases/AKSprod?query=H4sIAAAAAAAAA3WQX0vDMBTF3%2FcprnlqYRtps07s2IMIvogirPjgS0nbKwvmz0xSt4kf3mRqkW1CHpKc8zs5uRI9vPVo9zdGbYxG7W%2BtUbCEjnv0QmFCcprPJpRNWFZlRcmykrEppfSZpIuRPMErcwYOK6vo5b%2Bw7J1H%2B4TWCaMDT%2BZzetXQhr4wnrM8AFkzm9EiJ4vR9d3qx3%2BP3orWjT5hu0aL8GixFQ6r8PDKc7WBBv0WUSenH5xOj1unQ0z7nV6LDpZLONsQBrM6dIhGsjFd3RrtudBoy2FXKyGlaI3F2mG47Vyp%2BK62YUSFIkNQoB%2B4QlhzByS6O%2B1O1Yu%2F8oT33riWS7TR6XqluBUfoRTfJe9c9phCs4dG6OR4NGMoVDr%2BjR3D0DYeY5axPrKx6SEJOnRtEDx%2FRcjoFySL6Bg3AgAA)] [[Desktop](https://aks.kusto.windows.net/AKSprod?query=H4sIAAAAAAAAA3WQX0vDMBTF3%2FcprnlqYRtps07s2IMIvogirPjgS0nbKwvmz0xSt4kf3mRqkW1CHpKc8zs5uRI9vPVo9zdGbYxG7W%2BtUbCEjnv0QmFCcprPJpRNWFZlRcmykrEppfSZpIuRPMErcwYOK6vo5b%2Bw7J1H%2B4TWCaMDT%2BZzetXQhr4wnrM8AFkzm9EiJ4vR9d3qx3%2BP3orWjT5hu0aL8GixFQ6r8PDKc7WBBv0WUSenH5xOj1unQ0z7nV6LDpZLONsQBrM6dIhGsjFd3RrtudBoy2FXKyGlaI3F2mG47Vyp%2BK62YUSFIkNQoB%2B4QlhzByS6O%2B1O1Yu%2F8oT33riWS7TR6XqluBUfoRTfJe9c9phCs4dG6OR4NGMoVDr%2BjR3D0DYeY5axPrKx6SEJOnRtEDx%2FRcjoFySL6Bg3AgAA&web=0)]

### 4. Azure AKS API server performance impact on CoreDNS service

Finally, since Coredns queries API server for record(s) updates or pods and services, API server performance degradation or connectivity issues from nodes to API server can also lead to DNS performance issues. Refer to API server performance TSG or networking TSG whichever is application to resolve the issue.

</details>
<br>

<details open>
  <summary><b>3c - Capture traffic and review DNS resolution performance</b></summary>

## 3c - Capture traffic and review DNS resolution performance

### Summary

The objective of this document is to guide engineers on the Capturing Traffic using various methods internally and externally and how to Review Captures to find any protentional DNS resolution Performance issues. This will also include the use of opensource tools to automate the capture of network traffic on targeted pods, as well as basic traffic capture analysis.

::: mermaid
graph LR;
STR([Start]) --> B[Identify the nodes <br>and pods where the <br>captures are required];
B --> C{Which method will be <br>used for the caputre?};
C --> D[Running tcpdump <br>directly on the nodes];
C --> E[Using opensource tools <br>for K8s like Dumpy];
C --> F[Using Microsoft tools <br>like Retina or other <br>internal options];
D --> G[Collect captures in a <br>centralized location];
E --> G;
F --> G;
G --> H["Analisys of caputres <br>and findings <br>(Collaboration with <br>Net support if <br>required)"];
H --> END([End]);
:::

### Different Ways to Capture Traffic at different levels

Once Identify the nodes where the Capture is required, you can use below methods to get the Traces

#### **Packet capture on Host using Node-shell**

Setup node-shell by following steps here <https://github.com/kvaps/kubectl-node-shell>.

It can be used with both Linux and Windows nodes (Windows supported since 2023-01-23 <https://github.com/kvaps/kubectl-node-shell/pull/45>).

```text
kubectl node-shell <node-name>


# Install tcpdump if it is not installed yet
    apt install tcpdump

# or `dnf install tcpdump` on Mariner
```

Some clusters have policies that prevent running node-shell:

If the customer has image pull locked down you might see a timeout try `KUBECTL_NODE_SHELL_IMAGE=mcr.microsoft.com/cbl-mariner/base/core:1.0`

Sometimes customers have validating webhooks that prevent running node-shell in the default namespace. You can sometimes work around this by using the kube-system namespace: ./kubectl-node_shell -n kube-system <node>

![DNSWF1.png](/.attachments/DNSWF1-c2896ae5-9c8a-46f9-a3a5-67d8b35cf93a.png)

```text
# check the version of tcpdump
root@aks-agentpool-34185836-vmss000017:/# tcpdump --version
```

![image.png](/.attachments/image-fdaf35e9-4e5d-4aab-a1b5-a47107b1b264.png)

```bash
# Run tcpdump command and save the capture in a file.
tcpdump -e -n udp port 53 -w capture.pcap

```

![image.png](/.attachments/image-ef582466-a51d-4e41-a6c7-d2aafc9141a7.png)

```text
# we will see the .pcap file
root@aks-agentpool-29513533-vmss000000:/# ls
```

![image.png](/.attachments/image-2fb88a6d-6681-4b6f-8817-f3667b3b5f01.png)

```text
# For example if using WSL ,Open another WSL window and copy the pcap file locally
# Syntax - kubectl cp <namespace>/<pod-name>:<path/to/source-file> <path/to/destination-directory> -c <container-name>
kubectl cp nsenter-m645an:capture.pcap capture.pcap

Then Verify if file is Copied in the directory

ls
```

![image.png](/.attachments/image-bb28ec28-f425-4f41-b629-f6076b3b50c3.png)

```text
# If Want to Move the file from WSL drive to local drive

cp capture.pcap /mnt/c/Users/suimma
```

![image.png](/.attachments/image-8cedab0e-77c6-4e09-9fed-287cffb15f80.png)

After the trace is copied locally, use tools like Wireshark to open trace file and review:

![image.png](/.attachments/image-fbe7bb76-9e62-44e7-a2ac-42f4092bf77f.png)

#### **Packet capture on Test pod**

```text
# Create a test deployment
kubectl create deployment nginxtest --image nginx

# Wait for test pod to get to running state
kubectl get pods

kubectl exec <Testpod> -it -- /bin/bash

# Install tcpdump
apt-get update && apt-get install tcpdump

# Install dnsutils package, so that we can use dig command
 apt install dnsutils

# run tcpdump command
tcpdump -e -n udp port 53 -w capture.pcap
```

![image.png](/.attachments/image-01a31e46-c242-476c-96aa-dfb948a45474.png)

If customer has image pull locked down you might see a timeout try `--image=mcr.microsoft.com/cbl-mariner/base/core:1.0`

```text
# For Pod
kubectl debug <Pod> -it --image=mcr.microsoft.com/azure-policy/alpine:prod_20210713.1 -- sh -c 'apk add tcpdump --update; tcpdump -e -n udp port 53'
```

Now, we need to generate traffic. Exec into pod using other Window

```text
kubectl exec <TestPod> -it -- /bin/bash

# Run continuous dig command by exec into test pod and by using any of Coredns pod ip or if you want can use Coredns service IP too

FQDN=microsoft.com; DNS_SERVER=<xx>; for i in $(seq 1 1 10); do echo "host= $(dig +short ${FQDN} @${DNS_SERVER})"; sleep 1; done
```

![image.png](/.attachments/image-da6589e8-de48-4dc0-a920-80d76c9d3b07.png)

Stop the packet capture (in the previous WSL window)

![image.png](/.attachments/image-66f6389c-d52a-4b9a-8631-b987a69d7c65.png)

```text
# Copy the .pcap file to local machine
# Syntax - kubectl cp <namespace>/<pod-name>:<path/to/source-file> <path/to/destination-directory> -c <container-name>
kubectl cp <testPod>:capture.pcap capturefrompod.pcap

# on your local linux machine
$ ls
capture.pcap  capturefrompod.pcap  master 

# Move the file to local drive
cp capturefrompod.pcap /mnt/c/Users/suimma/
```

![image.png](/.attachments/image-30ed0bee-84c2-4f78-bbb7-cc669082fc6c.png)

Now you can use WireShark to analyze the packets from the Pod

![image.png](/.attachments/image-3fc0e625-d682-4e4b-b6f8-4e9c50a3fd68.png)

#### **Packet Capture on CoreDNS Pod**

For clusters >= 1.23, ephemeral containers  is an easy way to troubleshoot container issues, including packet capture.

```text
kubectl debug -it coredns-789789675-q6nzg --image=ubuntu -n kube-system --target=coredns

Targeting container "coredns". If you don't see processes from this container it may be because the container runtime doesn't support this feature.
Defaulting debug container name to debugger-v6bz2.
If you don't see a command prompt, try pressing enter.
root@coredns-789789675-q6nzg:/#

# Install tcpdump
root@coredns-789789675-q6nzg:/# apt-get update && apt-get install tcpdump

#Now, we can  generate some traffic. Exec into pod using other Window

kubectl exec <TestPod> -it -- /bin/bash

# Run continuous dig command by exec into test pod and by using any of Coredns pod ip or if you want can use Coredns service IP too

FQDN=microsoft.com; DNS_SERVER=<xx>; for i in $(seq 1 1 10); do echo "host= $(dig +short ${FQDN} @${DNS_SERVER})"; sleep 1; done

# run tcpdump command on CoreDNS Pod
root@coredns-789789675-q6nzg:/# tcpdump -e -n udp port 53 -w capture.pcap

# Copy the .pcap file to local machine. 
# Syntax - kubectl cp <namespace>/<pod-name>:<path/to/source-file> <path/to/destination-directory> -c <container-name>
# Use the ephemeral container in -c parameter which was created when we ran Kubectl debug command earlier. 
kubectl cp coredns-789789675-q6nzg:capturecoredns.pcap capturecoredns.pcap -n kube-system -c debugger-v6bz2

# on your local linux machine
:~$ ls
capturecoredns.pcap  capturefrompod.pcap  master 

# Move the file to local drive
:~$ cp captrurecoredns.pcap /mnt/c/Users/suimma/
```

If errors are encounter while Running ephemeral containers like below make sure kubectl version and cluster versions are > 1.23

```text
error: ephemeral containers are disabled for this cluster (error from server: "the server could not find the requested resource").
error: error updating ephemeral containers: EphemeralContainers in version "v1" cannot be handled as a Pod: no kind "EphemeralContainers" is registered for version "v1" in scheme "k8s.io/kubernetes/pkg/api/legacyscheme/scheme.go:30"
```

![image.png](/.attachments/image-27cccdf0-e6cc-4015-86f5-242f0e831ae1.png)

![image.png](/.attachments/image-3c735466-b1b5-4666-a4cc-6e671ae5d9e0.png)

![image.png](/.attachments/image-8bc08aff-203b-427e-8e91-12b4a69d588a.png)

#### **Packet Capture using Dumpy**

Leveraging some of the open source tools that can be use to facilitate capturing traffic on K8s cluster we can use Dumpy

Please refer to [Using opensource tools to capture target traffic from pods](/Azure-Kubernetes-Service-Wiki/AKS/TSG/AKS-Network-Troubleshooting-Methodology/[TSG]-AKS-troubleshooting-DNS-issues-lab#using-opensource-tools-to-capture-target-traffic-from-pods) to capture traces from multiple pods.

##### Installing krew

Follow the corresponding install instructions from <https://krew.sigs.k8s.io/docs/user-guide/setup/install/>

##### Installing dumpy

Run the following command:

```bash
kubectl krew update; kubectl krew install dumpy
```

Before Running captures we can generate traffic by exec into a test pods and run dig command

```bash
# FQDN=cncf.com;  for i in $(seq 1 1 10); do echo "host= $(dig +short ${FQDN})"; sleep 1; done
```

![image.png](/.attachments/image-bc4f4cd1-dc04-4920-bd7e-285ea26cc007.png)

##### Running a capture targeting the Coredns pods while generating traffic

We can follow the instructions from [Capture Network Traffic](https://github.com/larryTheSlap/dumpy/tree/main?tab=readme-ov-file#capture-network-traffic).
In particular, we run the following to create a capture to target the coredns deployment:

```bash
kubectl dumpy capture deploy coredns -n kube-system  -f "-i any port 53" --name dns-cap1
```

This starts the captures on each Coredns pod, we let it run for some time while the db-monitor is still running and intermittently failing.

We can check the status of the capture with the following:

```bash
kubectl dumpy get -n kube-system
```

##### Collecting the captures

We use the following commands to collect the current captures:

```bash
mkdir dns-captures
kubectl dumpy export dns-cap1 ./dns-captures -n kube-system
```

Using the following command, we can merge all the coredns pods captures into one single pcap file:

```bash
mergecap -w coredns-cap1.pcap dns-cap1-<COREDNS_POD1_NAME>.pcap dns-cap1-<COREDNS_POD2_NAME>.pcap
```

![image.png](/.attachments/image-c85a5a50-2e81-482b-bf5a-ec63db949620.png)

#### **Packet Capture using Jarvis Action**

We can also leverage some of the Internal Jarvis action to collect TCPDump Traces and store in Blob Storage after getting Permissions from Customer.

<https://portal.microsoftgeneva.com/8C0A6598?genevatraceguid=769318c2-f8c8-4e55-b40d-6c9b25580075>

![image.png](/.attachments/image-c9d6611b-8977-432e-b54b-42f7ce7f3fde.png)

#### **Packet Capture using IG (Inspektor Gadget)**

We can also leverage Inspektor Gadget Internal Jarivs action to Trace dns using below Jarvis action

<https://portal.microsoftgeneva.com/337DFA86?genevatraceguid=769318c2-f8c8-4e55-b40d-6c9b25580075>

![image.png](/.attachments/image-6345614e-a47b-4af8-a0c4-b92f1141f2cb.png)

##### Using the ig tool

The tool can be used to check the DNS resolution flow: POD -> codeDNS -> upstream DNS servers.
As such, you would need to connect to each node where codeDNS pods as a starting point.

You can use the enxt command to identify the nodes:

`kubectl get pods -n kube-system -o wide -l=k8s-app=kube-dns`

To be able to use the ig tool, connecting to a node, using `kubectl debug node` will not work.
For this, please connect to the node using the next steps, considering customer is able to connect to `mcr.microsoft.com`

It might take some time to get the command prompt on the node!

```bash
NODE={node-name}

kubectl run debug-node-$NODE --restart=Never -it --rm \
> --image mcr.microsoft.com/cbl-mariner/base/core:2.0 \
> --overrides '{"spec": {"hostPID": true,"hostNetwork": true, "nodeSelector": { "kubernetes.io/hostname": "'${NODE:?}'"}, "tolerations": [{"operator": "Exists"}],"containers": [{"name": "nsenter", "image": "'${IMAGE:?}'","command": ["sh","-xc","tdnf install util-linux -y -q; nsenter -m -u -i -n -p -C -r -w --target=1 -- bash"], "stdin": true, "tty": true, "securityContext": {"privileged": true }}] } }'
```

If customer is not able to connect to `mcr.microsoft.com`, maybe he would be able to ssh to the nodes.

Next to an example, to find out what is happing with the name resolution for the FQDN `mcr.microsoft.de.`
Please notice the `.` at the end. This ensures that no additional DNS suffixes will be added and will speed up the name resolution.

After connecting to the node where coreDNS pod is running, execute the next command:

`ig trace dns -F name:mcr.microsoft.de. -o json`

From a test pod with curl, try to connect to our FQDN

`k exec nginx-app-5b47c88df-984dc -- curl -4 mcr.microsoft.de.`

After curl will fail in the above command, stop the `ig` tool using ctrl+c and lets analyze the output.

Now let's check the output of the `ig`command. After the output, I will comment what is happening on each of the lines

```text
root [ / ]# ig trace dns -F name:mcr.microsoft.de. -o json
{"runtime":{},"k8s":{},"timestamp":1711398550337621613,"type":"normal","mountnsid":4026532213,"netnsid":4026531840,"pid":867,"tid":867,"comm":"systemd-resolve","uid":77,"gid":77,"srcIP":"10.224.0.178","dstIP":"10.224.0.113","srcPort":45232,"dstPort":53,"protocol":"UDP","id":"2e69","qr":"Q","nameserver":"10.224.0.113","pktType":"HOST","qtype":"A","name":"mcr.microsoft.de."}
{"runtime":{},"k8s":{},"timestamp":1711398550337735814,"type":"normal","netnsid":4026531840,"uid":0,"gid":0,"srcIP":"10.224.0.178","dstIP":"10.224.0.113","srcPort":45232,"dstPort":53,"protocol":"UDP","id":"2e69","qr":"Q","nameserver":"10.224.0.113","pktType":"OUTGOING","qtype":"A","name":"mcr.microsoft.de."}
{"runtime":{"runtimeName":"containerd","containerId":"f8406521bc474d9f911c36328ed1540bd9d4d9ce2c311a6291ae79a55de050a7","containerName":"coredns","containerImageName":"mcr.microsoft.com/oss/kubernetes/coredns:v1.9.4","containerImageDigest":"sha256:44c342f04bc1c875474c5bf10bcb9453a051c804c0205f1d7bf0a617abf6107a"},"k8s":{"namespace":"kube-system","podName":"coredns-7459659b97-nmmj9","containerName":"coredns"},"timestamp":1711398550337761714,"type":"normal","mountnsid":4026532362,"netnsid":4026532295,"pid":536786,"tid":536835,"comm":"coredns","uid":0,"gid":0,"srcIP":"10.224.0.178","dstIP":"10.224.0.113","srcPort":45232,"dstPort":53,"protocol":"UDP","id":"2e69","qr":"Q","nameserver":"10.224.0.113","pktType":"HOST","qtype":"A","name":"mcr.microsoft.de."}
{"runtime":{"runtimeName":"containerd","containerId":"f8406521bc474d9f911c36328ed1540bd9d4d9ce2c311a6291ae79a55de050a7","containerName":"coredns","containerImageName":"mcr.microsoft.com/oss/kubernetes/coredns:v1.9.4","containerImageDigest":"sha256:44c342f04bc1c875474c5bf10bcb9453a051c804c0205f1d7bf0a617abf6107a"},"k8s":{"namespace":"kube-system","podName":"coredns-7459659b97-nmmj9","containerName":"coredns"},"timestamp":1711398550338614719,"type":"normal","mountnsid":4026532362,"netnsid":4026532295,"pid":536786,"tid":536835,"comm":"coredns","uid":0,"gid":0,"srcIP":"10.224.0.113","dstIP":"8.8.8.8","srcPort":41230,"dstPort":53,"protocol":"UDP","id":"6231","qr":"Q","nameserver":"8.8.8.8","pktType":"OUTGOING","qtype":"A","name":"mcr.microsoft.de."}
{"runtime":{},"k8s":{},"timestamp":1711398550338646819,"type":"normal","mountnsid":4026532213,"netnsid":4026531840,"pid":867,"tid":867,"comm":"systemd-resolve","uid":77,"gid":77,"srcIP":"10.224.0.113","dstIP":"8.8.8.8","srcPort":41230,"dstPort":53,"protocol":"UDP","id":"6231","qr":"Q","nameserver":"8.8.8.8","pktType":"HOST","qtype":"A","name":"mcr.microsoft.de."}
{"runtime":{},"k8s":{},"timestamp":1711398550338709319,"type":"normal","netnsid":4026531840,"uid":0,"gid":0,"srcIP":"10.224.0.10","dstIP":"8.8.8.8","srcPort":41230,"dstPort":53,"protocol":"UDP","id":"6231","qr":"Q","nameserver":"8.8.8.8","pktType":"OUTGOING","qtype":"A","name":"mcr.microsoft.de."}
{"runtime":{"runtimeName":"containerd","containerId":"f8406521bc474d9f911c36328ed1540bd9d4d9ce2c311a6291ae79a55de050a7","containerName":"coredns","containerImageName":"mcr.microsoft.com/oss/kubernetes/coredns:v1.9.4","containerImageDigest":"sha256:44c342f04bc1c875474c5bf10bcb9453a051c804c0205f1d7bf0a617abf6107a"},"k8s":{"namespace":"kube-system","podName":"coredns-7459659b97-nmmj9","containerName":"coredns"},"timestamp":1711398550348304272,"type":"normal","mountnsid":4026532362,"netnsid":4026532295,"pid":536786,"tid":536834,"comm":"coredns","uid":0,"gid":0,"srcIP":"10.224.0.113","dstIP":"10.224.0.178","srcPort":53,"dstPort":45232,"protocol":"UDP","id":"2e69","qr":"R","nameserver":"10.224.0.113","pktType":"OUTGOING","qtype":"A","name":"mcr.microsoft.de.","rcode":"NXDomain"}
{"runtime":{},"k8s":{},"timestamp":1711398550348321873,"type":"normal","netnsid":4026531840,"uid":0,"gid":0,"srcIP":"10.224.0.113","dstIP":"10.224.0.178","srcPort":53,"dstPort":45232,"protocol":"UDP","id":"2e69","qr":"R","nameserver":"10.224.0.113","pktType":"HOST","qtype":"A","name":"mcr.microsoft.de.","rcode":"NXDomain"}
{"runtime":{},"k8s":{},"timestamp":1711398550348362473,"type":"normal","mountnsid":4026532213,"netnsid":4026531840,"pid":867,"tid":867,"comm":"systemd-resolve","uid":77,"gid":77,"srcIP":"10.224.0.113","dstIP":"10.224.0.178","srcPort":53,"dstPort":45232,"protocol":"UDP","id":"2e69","qr":"R","nameserver":"10.224.0.113","pktType":"OUTGOING","qtype":"A","name":"mcr.microsoft.de.","rcode":"NXDomain"}
{"runtime":{},"k8s":{},"timestamp":1711398550347909070,"type":"normal","netnsid":4026531840,"uid":0,"gid":0,"srcIP":"8.8.8.8","dstIP":"10.224.0.10","srcPort":53,"dstPort":41230,"protocol":"UDP","id":"6231","qr":"R","nameserver":"8.8.8.8","pktType":"HOST","qtype":"A","name":"mcr.microsoft.de.","rcode":"NXDomain"}
{"runtime":{},"k8s":{},"timestamp":1711398550347961971,"type":"normal","mountnsid":4026532213,"netnsid":4026531840,"pid":867,"tid":867,"comm":"systemd-resolve","uid":77,"gid":77,"srcIP":"8.8.8.8","dstIP":"10.224.0.113","srcPort":53,"dstPort":41230,"protocol":"UDP","id":"6231","qr":"R","nameserver":"8.8.8.8","pktType":"OUTGOING","qtype":"A","name":"mcr.microsoft.de.","rcode":"NXDomain"}
{"runtime":{"runtimeName":"containerd","containerId":"f8406521bc474d9f911c36328ed1540bd9d4d9ce2c311a6291ae79a55de050a7","containerName":"coredns","containerImageName":"mcr.microsoft.com/oss/kubernetes/coredns:v1.9.4","containerImageDigest":"sha256:44c342f04bc1c875474c5bf10bcb9453a051c804c0205f1d7bf0a617abf6107a"},"k8s":{"namespace":"kube-system","podName":"coredns-7459659b97-nmmj9","containerName":"coredns"},"timestamp":1711398550347986471,"type":"normal","mountnsid":4026532362,"netnsid":4026532295,"pid":536786,"tid":536835,"comm":"coredns","uid":0,"gid":0,"srcIP":"8.8.8.8","dstIP":"10.224.0.113","srcPort":53,"dstPort":41230,"protocol":"UDP","id":"6231","qr":"R","nameserver":"8.8.8.8","pktType":"HOST","qtype":"A","name":"mcr.microsoft.de.","rcode":"NXDomain","latency":9371752}
```

For More Information Please also refer: <https://www.inspektor-gadget.io/docs/latest/builtin-gadgets/trace/dns/>

</details>
<br>

<details open>
  <summary><b>3d - Analyze Traces for any potential issues with DNS</b></summary>

## 3d - Analyze Traces for any potential issues with DNS

### Summary

This section aims to guide engineers with some basics of analyzing network cpature files using Wireshark. It will review some basic concepts as well as examples, but it's always suggested to collaborate with Network support team if any deep analysis is required, please refer to section [6 - Collaboration information](#6\---collaboration-information).

### Understanding the Output Format

The `tcpdump` tool captures and analyzes network traffic, displaying a detailed output that can be complex to understand at first. Here's a basic breakdown of the output format:

1. **Timestamp**: Displays the date and time when the packet was captured.

2. **Source/Destination**: Shows the source and destination IP addresses or hostnames, along with the port numbers.

3. **Protocol**: Indicates the protocol used, such as TCP, UDP, ICMP, etc.

4. **Flags**: For TCP packets, flags like SYN, ACK, FIN, RST, etc., indicate the state of the TCP connection.

5. **Length**: Specifies the length of the packet data.

6. **Data**: Displays the actual packet data in hexadecimal and ASCII format.

Here's an example output:

The fields may vary depending on the type of the Packet being sent but this is general format

```text
13:24:56.123456 IP source_ip.1234 > dest_ip.5678: Flags [S], seq 123456789, ack 1 win 65535, options [mss 1460,nop,nop,sackOK], length 0
```

- **13:24:56.123456**: Timestamp

   This field represents the Timestamp of the received packet as per the local clock.

- **IP source_ip.1234 > dest_ip.5678**: Source and destination IP addresses with port numbers

    IP represents the network layer protocol-in this case, IPV4 . For IPV6 the value is IP6

- **Flags [S]**: TCP flag indicating a SYN packet

     These are TCP Flags. Typical value for this field Include:

     This Field can also be a combination of these Values Such as [S.] for a SYN-ACK Packet

| Value | Flag Type | Description |
|--|--|--|
|S  | SYN | Connection Start |
|F  | FIN  | Connection Finish |
|P  |PUSH  | Data Push  |
|R  |RST  |Connection Reset  |
| . |ACK  |Acknowledgment  |

- **seq 123456789**: Sequence number of the TCP segment
  
   This field indicates the byte number of the first data byte in the current segment. It is used to keep track of the order of the data segments sent in a TCP connection. Each byte of data in a TCP segment is assigned a unique sequence number.

  For example, if the Sequence Number is 1000, it means that the first byte of data in the current segment is the 1000th byte of data in the overall stream.
  
- **ack 1**: ACK number

    This field is used to acknowledge the receipt of data. It contains the next sequence number that the sender of the segment expects to receive. In other words, it acknowledges the receipt of all bytes up to, but not including, the acknowledged sequence number.

     For example, if the Acknowledgment Number is 1500, it means that the receiver has successfully received all bytes up to (but not including) the 1500th byte and is expecting the next byte to be the 1500th.

   Here's a simplified example of how these fields work in a TCP connection:

  Host A sends a TCP segment with a Sequence Number of 1000 and data of 500 bytes.

  Host B receives the segment and sends back an acknowledgment with an Acknowledgment Number of 1500, indicating
  that it has successfully received all bytes up to 1500.

These fields help TCP ensure that data is transmitted reliably and in the correct order, even in the presence of network issues or packet loss.

- **win 65535**: TCP window size
- **options [mss 1460,nop,nop,sackOK]**: TCP options

  Window Size  which represents the number of bytes available in the receiving buffer, followed by TCP options such as the MSS (Maximum Segment Size) or Window Scale.

- **length 0**: Length of the packet data
  
   This field represents the length, in bytes, of the payload data. The length is the difference between the last and first bytes in the sequence number.

Understanding this output requires some familiarity with networking concepts and protocols. If you're new to this, it can be helpful to refer to documentation or guides that explain [TCP/IP networking and packet analysis](https://opensource.com/article/18/10/introduction-tcpdump).

### Three-Way Handshake Basics

 Let's consider a scenario where a client (C) wants to establish a TCP connection with a server (S).

1. **SYN (Client to Server)**:
   - Client sends a SYN packet to the server to initiate a connection.
   - Sequence number (Seq=C) is set by the client.
   - Client's Initial Sequence Number (ISN) is 100.

   ```text
   Client (C)                Server (S)
   SEQ=100, SYN    ------>

   ```

2. **SYN-ACK (Server to Client)**:
   - Server receives the SYN packet, prepares to accept the connection, and sends a SYN-ACK packet back to the client.
   - Server's ISN is 300.
   - Acknowledges the client's sequence number (Ack=C+1).
   - Server's sequence number (Seq=S) is set by the server.

   ```text
   Client (C)                Server (S)
                     <------   SEQ=300, ACK=101, SYN
   ```

3. **ACK (Client to Server)**:
   - Client receives the SYN-ACK packet, acknowledges the server's sequence number, and completes the connection establishment.
   - Acknowledges the server's sequence number (Ack=S+1).

   ```text
   Client (C)                Server (S)
   SEQ=101, ACK=301   ------>
   ```

After this three-way handshake, the TCP connection is established between the client and server, and they can start exchanging data.

The sequence and acknowledgment numbers are crucial for ensuring reliable data transfer and maintaining the order of packets. Each packet in the TCP connection contains these numbers to help the receiving end understand the order and integrity of the data being transmitted.

### Filters used

For Full list of Filter for DNS please refer this [document](https://www.wireshark.org/docs/dfref/d/dns.html)

General Wireshark useful filter examples:

1. **Filtering by IP Address**: You can filter packets to and from a specific IP address using the `ip.addr` filter. For example, to filter packets involving the IP address `192.168.1.1`, you can use the filter `ip.addr == 192.168.1.1`.

2. **Filtering by Port**: You can filter packets by port number using the `tcp.port` or `udp.port` filters. For example, to filter packets on port `80`, you can use the filter `tcp.port == 80`.

3. **Follow TCP Stream**: You can follow a TCP stream to see the entire conversation between two hosts. Right-click on a packet, select "Follow", and then choose "TCP Stream".

4. **Find Slow TCP Connections**: You can identify slow TCP connections by looking for TCP packets with high response times. Use the "tcp.analysis.ack_rtt" display filter to find packets with high round-trip times.

5. **Analyze HTTP Traffic**: You can analyze HTTP traffic by applying the filter `http`. This will show you all HTTP packets, which you can further analyze to see request and response details.

6. **Analyze DNS Traffic**: You can analyze DNS traffic by applying the filter `dns`. This will show you all DNS packets, which you can further analyze to see DNS query and response details.

DNS specific Wireshark filter examples:

1. **Filter DNS Queries**: To filter DNS queries only, you can use the filter `dns.flags.response == 0`. This filter will show packets that are DNS queries (i.e., requests).

2. **Filter DNS Responses**: To filter DNS responses only, you can use the filter `dns.flags.response == 1`. This filter will show packets that are DNS responses.

3. **Filter by DNS Query Type**: You can filter DNS packets based on the query type. For example, to filter packets that are DNS queries for type A records (IPv4 addresses), you can use the filter `dns.qtype == 1`. Similarly, for type AAAA records (IPv6 addresses), you can use `dns.qtype == 28`.

4. **Filter by DNS Response Code**: You can filter DNS packets based on the response code. For example, to filter packets that have a response code indicating a name error (NXDOMAIN), you can use the filter `dns.flags.rcode == 3`.

5. **Filter DNS Queries for a Specific Domain**: To filter DNS queries for a specific domain, you can use the filter `dns.qry.name == "example.com"`. Replace `"example.com"` with the domain you are interested in.

6. **Filter DNS Responses with a Specific IP Address**: To filter DNS responses containing a specific IP address, you can use the filter `dns.a == 192.168.1.1`. Replace `192.168.1.1` with the IP address you are interested in.

These filters can help you analyze DNS traffic more effectively and gain insights into DNS query and response patterns on your network.
These are just a few examples of what you can do with Wireshark to analyze TCPDumps. Wireshark offers a wide range of filters and tools to analyze network traffic in detail.

### **Reviewing Captures for any DNS Resolution Performance**

After collecting TCP Dump we can use WireShark to analyze TCP Dumps for any DNS Performance issues/ Latency issues.

If Necessary and need further assistance in the capture analysis please involve the Network support team for help.

Reference: [Reviewing the Captures](/Azure-Kubernetes-Service-Wiki/AKS/TSG/AKS-Network-Troubleshooting-Methodology/[TSG]-AKS-troubleshooting-DNS-issues-lab#reviewing-the-captures).

For Example

Capture from COREDNS Pod

![image.png](/.attachments/image-cd8a48f3-3556-40a1-93d5-3fac2fe7f668.png)

In the above Capture we are dealing with our target domain cncf.com and we can use below filter to filter target domain

`_ws.col.info matches "cncf.com"
`

There are multiple useful features from Wireshark when doing DNS issue analysis.
For example the statistics tab has an option for DNS:

![image.png](/.attachments/image-56d6c54b-c418-4f5b-84f7-b852cf4f7621.png)

Depending on the capture size it can take some time to load all data.
Once it loads, we will be able to see useful information about the amount of query/response, result code (No such name, No error):

![image.png](/.attachments/image-6e0a40d5-209d-4320-92af-fbb035d462e3.png)

Based on above Stats we can check any performance issues by Generating some traffic and Check the DNS Stats from the TCP Dump collected from all the CoreDNS pods to see the Query/Response rate and see how much percent of requests have been failed.

Please refer to some of the Internal & External Docs for resources

<https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki/538805/Network-Capture-Basics>

<https://dev.azure.com/Supportability/AzureAppServicesTDP/_wiki/wikis/AzureAppServicesTDP/577798/Networking-troubleshooting>

<https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki/181141/Troubleshooting-Random-DNS-Query-Failures>

<https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki/759928/Wireshark-File-Manipulation>

<https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki/620043/Wireshark-Profiles>

</details>
<br>

<details open>
  <summary><b>4 - Develop hypothesis</b></summary>

## 4 - Develop hypothesis

### Summary

This section serves as a comprehensive guide to systematically develop hypotheses for identifying the underlying causes of DNS resolution issues within an AKS cluster. It categorizes common problem types to aid in narrowing down potential issues and outlines likely components that may require adjustments. This approach sets the foundation for creating a targeted action plan to mitigate and resolve these issues effectively.

### Terminology and concepts

To effectively map symptoms to possible causes, let's establish some key terminology and concepts:

### Common DNS response codes

Below is a table with the most common DNS return codes:

| DNS Return Code | DNS Return Message | Description                                          |
|-----------------|--------------------|------------------------------------------------------|
| RCODE:0         | NOERROR            | DNS Query completed successfully                     |
| RCODE:1         | FORMERR            | DNS Query Format Error                               |
| RCODE:2         | SERVFAIL           | Server failed to complete the DNS request            |
| RCODE:3         | NXDOMAIN           | Domain name does not exist                           |
| RCODE:5         | REFUSED            | The server refused to answer for the query           |
| RCODE:8         | NOTAUTH            | Server not authoritative for the zone                |

### General problem types

Let's define problem type categories to help in breaking down the issue symptoms:

#### Performance issues

DNS resolution performance issues can manifest with intermittent errors, specifically "timed out" from the client's perspective. These issues may occur when nodes experience resource exhaustion and/or IO throttling. Additionally, constraints on CoreDNS pods' compute resources can lead to resolution latency.
Also, if Coredns latency is high or is increasing over time, it may indicate a load issue. If CoreDNS instances are overloaded, you may experience issues with DNS name resolution and expect delays, or issues in workloads and Kubernetes internal services.

#### Configuration issues

Configuration issues can manifest with incorrect DNS resolution with errors like "NXDOMAIN" as well as "timed out" from client perspective.
The incorrect configurations can be at Coredns, nodes, Kubernetes, routing, Kubernetes, VNET DNS, private DNS zones, firewalls, proxies, among others.

#### Network connectivity issues

Network connectivity issues can impact pod-to-pod connectivity (east-west traffic) as well as pod-and-node connectivity to external resources (north-south traffic). This can manifest with "timed out" errors.
The connectivity issues can happen when the Coredns service endpoints are not up to date (kube-proxy issues, routing issues, packet loss, among others).
Also, external resource dependency with connectivity issue can be part of the problem, like connectivity to external resources, for example custom DNS servers, or external DNS servers.

### Required inputs

Before we start formulating a hypothesis of the probable causes of the issue, we need the outcome of the previous steps from the workflow.

We can summarize the results using the following tables:

#### Results of baseline questionnaire template

| **Baseline questionnaire**               | **Answer**                                            |
|------------------------------------------|-------------------------------------------------------|
| Where is the DNS resolution failing?     | _Pod \| Node \| both pod and node_                    |
| What type of DNS error do you get?       | _Timed out \| NXDOMAIN \| Other DNS error_            |
| How often do the DNS errors happen?      | _Always \| Intermittently \| Specific pattern_        |
| Which records are affected?              | _Specific domain \| Any domain_                       |
| Are there any custom DNS configurations? | _Custom DNS servers on VNET \| Custom Coredns config_ |

#### Results of tests at different levels

| **Resolution test results**     | **Works** | **Fails** |
|---------------------------------|-----------|-----------|
| From pod to Coredns service     |           |           |
| From pod to Coredns pod IP      |           |           |
| From pod to Azure internal DNS  |           |           |
| From pod to VNET DNS            |           |           |
| From node to Azure internal DNS |           |           |
| From node to VNET DNS           |           |           |

#### Results of health and performance of the nodes and Coredns pods

| **Performance review results** | **Healthy** | **Unhealthy** |
|--------------------------------|-------------|---------------|
| Nodes performance              |             |               |
| Coredns pods performance       |             |               |

#### Results of traffic captures and DNS resolution performance

| **Capture review results**    | **Yes** | **No** |
|-------------------------------|---------|--------|
| DNS queries vs responses > 2% |         |        |
| DNS latency > 1s              |         |        |

### Developing a hypothesis

To start developing our first hypothesis, we map each of the results from our required inputs to one or more of our problem types.
By analyzing these results in the context of problem types, we can develop hypotheses about the potential root causes of the DNS resolution issues and proceed with targeted investigation and resolution efforts that we will define when we create our possible action plan.

#### Example of mapping results to problem types to generate a hypothesis

##### 1. Configuration issue example

Using the [[TSG] AKS troubleshooting DNS issues lab](/Azure-Kubernetes-Service-Wiki/AKS/TSG/AKS-Network-Troubleshooting-Methodology/[TSG]-AKS-troubleshooting-DNS-issues-lab) scenario, we map the results to the problem types as follows:

| **Baseline questionnaire**               | **Answer**                                            |
|------------------------------------------|-------------------------------------------------------|
| Where is the DNS resolution failing?     | _Pod_                    |
| What type of DNS error do you get?       | _NXDOMAIN_            |
| How often do the DNS errors happen?      | _Intermittently_        |
| Which records are affected?              | _Specific domain_                       |
| Are there any custom DNS configurations? | _It has custom DNS servers on VNET, and does not have custom Coredns config_ |

| **Resolution test results**     | **Works** | **Fails** |
|---------------------------------|-----------|-----------|
| From pod to Coredns service     |           |      x (intermittently)    |
| From pod to Coredns pod IP      |           |      x (intermittently)     |
| From pod to Azure internal DNS  |     x      |           |
| From pod to VNET DNS            |     x     |           |
| From node to Azure internal DNS |     x    |           |
| From node to VNET DNS           |     x      |           |

| **Performance review results** | **Healthy** | **Unhealthy** |
|--------------------------------|-------------|---------------|
| Nodes performance              |     x        |               |
| Coredns pods performance       |     x        |               |

| **Capture review results**    | **Yes** | **No** |
|-------------------------------|---------|--------|
| DNS queries vs responses > 2% |         |    x    |
| DNS latency > 1s              |         |    x    |

In summary, the pods are failing intermittently to resolve a specific domain, the error we get is "NXDOMAIN", the VNET has custom DNS server configuration, nodes and Coredns pods performance looks healthy, and DNS capture review does not indicate packet loss or DNS response latency.
We can discard performance issues as well as connectivity issues, which leaves us with configuration issues.
All evidence points to configuration issues at the custom DNS servers on the VNET.

##### 2. Performance issue example

Using the [[TSG] AKS troubleshooting DNS performance issues lab](/Azure-Kubernetes-Service-Wiki/AKS/TSG/AKS-Network-Troubleshooting-Methodology/[TSG]-AKS-troubleshooting-DNS-performance-issues-lab) scenario, we map the results to the problem types as follows:

| **Baseline questionnaire**               | **Answer**                                            |
|------------------------------------------|-------------------------------------------------------|
| Where is the DNS resolution failing?     | _Pod_                    |
| What type of DNS error do you get?       | _Timed out_            |
| How often do the DNS errors happen?      | _Intermittently_        |
| Which records are affected?              | _Any domain_                       |
| Are there any custom DNS configurations? | _Does not have a custom DNS servers on VNET, and does not have custom Coredns config_ |

| **Resolution test results**     | **Works** | **Fails** |
|---------------------------------|-----------|-----------|
| From pod to Coredns service     |           |      x (intermittently)    |
| From pod to Coredns pod IP      |           |      x (intermittently)     |
| From pod to Azure internal DNS  |     x      |           |
| From pod to VNET DNS            |     x     |           |
| From node to Azure internal DNS |     x    |           |
| From node to VNET DNS           |     x      |           |

| **Performance review results** | **Healthy** | **Unhealthy** |
|--------------------------------|-------------|---------------|
| Nodes performance              |             |      x         |
| Coredns pods performance       |             |      x         |

| **Capture review results**    | **Yes** | **No** |
|-------------------------------|---------|--------|
| DNS queries vs responses > 2% |     x    |        |
| DNS latency > 1s              |     x   |        |

In summary, any pods are failing intermittently to resolve any domain. the error we get is "timed out" and "SERVFAIL". The VNET does not has a custom DNS configuration as well as no custom Coredns config.
Performance of the nodes looks unhealthy with high CPU usage and nodes highly over-committed on CPU.
Also, the Coredns pods have high CPU usage as well as CPU throttling.
The DNS capture reveals high DNS latency as well as more than 6% of queries without a response.
All evidence point to performance issues with workloads doing to many DNS queries and node pools with incorrect sizing.

### Known issues and general pointers that can help on error type mapping

- Test results showing DNS resolution failures specifically at the CoreDNS service or to specific endpoints with "timed out" errors may indicate configuration and/or connectivity issues.
- Indications of compute resource starvation at CoreDNS pods or nodes levels may suggest performance issues.
- DNS captures that have a considerable mismatch between DNS queries vs DNS responses can indicate packets lost suggesting connectivity issues and/or performance issues.
- The presence of custom configurations at the VNET level or Kubernetes level can contain setups that will not work with AKS and Coredns as expected.

</details>
<br>

<details open>
  <summary><b>5 - Identify external components to AKS</b></summary>

## 5 - Identify external components to AKS

### Summary

The purpose of this section is to provide a guide to identify network and DNS external components to AKS that could impact the DNS resolution from the ASK
cluster side. It will cover the common scenarios/components implemented by customers which could potentially impact the DNS resolution.

### External Network/DNS Resources

These are some of the resources that could contribute to a DNS resolution issue from AKS clusters, however, it is important to understand these components are
external to AKS.

#### Custom DNS servers

When AKS VNET is configured with _custom DSN servers_ instead of using the Azure Provided DNS Server, all DNS requests are sent to those DNS severs for resolution.
This means that the AKS VNET should be able to reach the _custom DNS server_ VNET. If the _custom DNS server_ is running in Azure on a different VNET than AKS cluster VNET,
a [VNET Peering](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-peering-overview)should exist between these 2 VNETS otherwise, requests would never
reach the _CUSTOM DSN SERVER_.
In case the _custom DNS server_ is hosted On-Premise, there should be a VPN or EXPRESS Route connection between the AKS VNET and the _custom DNS server_ VNET On-Prem.

##### How to check if VNET is using a custom DNS Server

Use this wiki article to determine if AKS VNET is using Azure Provided or custom [DNS Servers](/Azure-Kubernetes-Service-Wiki/New-Hires-and-Training/ACT-Readiness/Other-learning-materials/Tools-trainings/ASC-&-AppLens-Training/Looking-for-information-in-ASC/Networking/DNS)

[[TSG] DNS Troubleshooting](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Networking/DNS-Troubleshooting)

[[TSG] AKS troubleshooting DNS issues lab](/Azure-Kubernetes-Service-Wiki/AKS/TSG/AKS-Network-Troubleshooting-Methodology/[TSG]-AKS-troubleshooting-DNS-issues-lab)

#### User Defined Routing

UDR is another important Azure resource external to AKS that can cause severe DNS resolution issues. When AKS subnets are configured to use a UDR, the traffic is routed
based on the rules created on the Route Table, meaning that DNS traffic (as well as AKS traffic in general) can be interfered and sent to a different destination than expected
and never gets to the upstream DNS servers configured on the AKS VNET.

When UDR is in place, it is extremely important to understand how traffic will flow and make sure that the **"Next Hop"** will be able to handle DNS requests properly. For example,
if the next hop is an Azure firewall, it is imperative to check that the Azure Firewall configured on the UDR will allow the DNS traffic to go through, if this Azure Firewall blocks
DNS traffic, AKS cluster will be impacted.

##### How to check if AKS subnet is using an UDR

  1. Determine what is the VNET/SUBNET AKS cluster is using by going to ASC AKS cluster Agent Pools tab.

     ![AKS VNET](/.attachments/AKS_Vnet.png  =700x400)

  2. Once the VNET/SUBNET is identified, access the VNET and confirm if the AKS subnet has any UDR attached to it.

     ![AKS UDR](/.attachments/AKS_UDR.png  =700x280)

With the above steps, it has been shown that the AKS Subnet has a UDR attached to it called **"aks-udr-lab-rt"** which contains the rule shown on below
image (this is just an example). In this example below, the next hop with ip address 10.42.2.4 is an Azure Firewall where all the traffic for the cluster
0.0.0.0/0 is sent to.
The next hop could be "Internet" or even "a Virtual Machine running on Azure" with some routing rules that will decide how the
traffic is routed, this does not have to be a Network firewall exclusively, the VNET routing destination for the traffic is based on the UDR Rules configured.

![AKS UDR](/.attachments/AKS_UDR_Rules-2.png  =650x250)

#### Network Firewall

When talking about Networking, Network firewalls are a very important component that most of customers use for security purposes, when AKS subnet is attached
to a UDR where traffic is sent to a Network Firewall (could be all traffic 0.0.0.0/0 or traffic sent to an specific endpoint), AKS clusters could experience
DNS resolution issues if the DNS port 53 is blocked or even if specific traffic is not allowed, this could be traffic to the Azure DNS server or custom DNS
server IP addresses.

##### How to check if AKS subnet is sending traffic to a Network Firewall

The way to confirm if the AKS Subnet is sending traffic to a Network Firewall is the same way as reference here [How to check if AKS subnet is using an UDR](#how-to-check-if-aks-subnet-is-using-an-udr).
If we confirm that traffic is sent to a **"Virtual Appliance"**, we need to confirm with customer what exactly that Virtual Appliance IP address belongs to in order to
properly troubleshoot the issue and understand if that is associate to a Nerwork Firewall, either an Azure Firewall or an external firewall.

This is the list of [required outbound network rules and FQDNs for AKS clusters](<https://learn.microsoft.com/en-us/azure/aks/outbound-rules-control-egress#required-outbound-network-rules-and-fqdns-for-aks-clusters>).

[[TSG] Azure Firewall](/Azure-Kubernetes-Service-Wiki/AKS/TSG/AKS-Network-Troubleshooting-Methodology/[TSG]-Azure-Firewall)

#### Network Security Groups

Another element in the network stack that can contribute to a DNS Resolution issue from AKS are the Network Security Groups (NSGs). Users can leverage the use of NSG on
Azure VNETs to block inbound as well as outbound traffic, when an AKS cluster subnet is attached to a NSG and the NSG is blocking outbound traffic, DNS resolution can be
impacted leaving the AKS cluster in a broken state with no access to DNS servers.

##### How to check if AKS subnet is using a NSG

  1. Determine what is the VNET/SUBNET AKS cluster is using by going to ASC AKS cluster Agent Pools tab.

     ![AKS VNET](/.attachments/AKS_Vnet.png  =700x400)

  2. Once the VNET/SUBNET is identified, access the VNET and confirm if the AKS subnet has any NSG attached to it.

     ![AKS UDR](/.attachments/AKS_NSG.png  =700x280)

  3. After checking and confirming that a NSG is attached to the AKS subnet, we can check the rules created for it by accessing the NSG Resource from
 ACS and determine if any of the rules created could potentially block DNS traffic impacting the DNS resolution.

 In this example, we are seen CUSTOM rules and we can clearly evidence a specific rule which will block DNS traffic on port 53.

![AKS UDR](/.attachments/AKS_NSG_Rules.png  =650x250)

[[TSG] Network Security Group (NSG)](/Azure-Kubernetes-Service-Wiki/AKS/TSG/AKS-Network-Troubleshooting-Methodology/[TSG]-Network-Security-Group-\(NSG\))

### Additional References

[Network security groups](<https://learn.microsoft.com/en-us/azure/virtual-network/network-security-groups-overview>)

[User-defined Routing](<https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-udr-overview#user-defined>)

[Use Azure Firewall to protect Azure Kubernetes Service](<https://learn.microsoft.com/en-us/azure/firewall/protect-azure-kubernetes-service>)

</details>
<br>

<details open>
  <summary><b>6 - Collaboration information</b></summary>

## 6 - Collaboration information

### Summary

Part of the analysis and review of evidence for DNS issues troubleshooting process might require collaboration with other support teams. For example, we can ask for help to review traffic captures as well as to review specific Azure network resources.

### General networking troubleshooting collaboration document

Please refer to the following document for more details on the corresponding Azure network support teams
[[TSG] Collaborations when doing AKS network troubleshooting](/Azure-Kubernetes-Service-Wiki/AKS/TSG/AKS-Network-Troubleshooting-Methodology/[TSG]-Collaborations-when-doing-AKS-network-troubleshooting).

### Component level troubleshooting reference table

[[TSG]Component Level Troubleshooting](/Azure-Kubernetes-Service-Wiki/AKS/TSG/AKS-Network-Troubleshooting-Methodology/[TSG]Component-Level-Troubleshooting)

### Collaborating with Azure Networking team for capture analysis

We can leverage Azure Networking support team to collaborate with capture analysis.
Just keep in mind that they will not have much context on AKS or Coredns. This means we have to provide them with a clear ask on what we want to review from the captures we share.

For DNS issues, we will care mostly about:

- queries vs responses rate (are we missing many responses?)
- response latency (are the responses taking too long?)
- missing packages (like having specific DNS query IDs that did not make it from the client to the Coredns pods or having DNS query response IDs not reaching the clients)

</details>
<br>

<details open>
  <summary><b>7 - Create action plan, implement the plan, and collect findings</b></summary>

## 7 - Create action plan, implement the plan, and collect findings

### Summary

The following section provides a list of reference action plans related to the problem categories defined in the develop hypothesis section.

### General recommendations to improve DNS resolution performance

When dealing with performance issues the following best practices and guidance should be review and implemented:

- Follow best practice to setup a dedicated system node pool that meets minimum sizing requirements as documented in <https://learn.microsoft.com/en-us/azure/aks/use-system-pools?tabs=azure-cli>

- Use nodes with ephemeral OS disk to avoid disk IO throttling as documented in <https://learn.microsoft.com/en-us/azure/aks/cluster-configuration#default-os-disk-sizing> and as referenced in <https://github.com/Azure/AKS/issues/1373#issuecomment-827782655>

- Follow best practices for the configuration of request and limits for CPU and memory on workloads on the nodes as documented in <https://learn.microsoft.com/en-us/azure/aks/developer-best-practices-resource-management>

- If after those changes, DNS performance is still not good enough, consider using Node Local DNS
<https://kubernetes.io/docs/tasks/administer-cluster/nodelocaldns/>

### Configuration issues

The configuration issues should be address by the customer. Depending on the specific component we have to  review and understand the implications of the specific configuration setup.
Here is a list of components and corresponding documentations with configuration details:

- Kubernetes DNS configuration options <https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/>

- AKS Coredns custom configuration options <https://learn.microsoft.com/en-us/azure/aks/coredns-custom>

- Private DNS zones missing virtual network link <https://learn.microsoft.com/en-us/azure/dns/private-dns-virtual-network-links>

### Connectivity issues

- Bugs on CNI and/or other Kubernetes or OS components would usually require intervention from AKS PG.
- Infrastructure issues like hardware failures or hypervisor problems could require collaboration from infra teams or would have self-healing features.

### Examples of action plans

#### Configuration issue action plan

We can use the "AKS troubleshooting DNS issues lab" section [Mitigation Steps](/Azure-Kubernetes-Service-Wiki/AKS/TSG/AKS-Network-Troubleshooting-Methodology/[TSG]-AKS-troubleshooting-DNS-issues-lab#mitigation-steps) as an example of the action plan options.

#### Performance issue action plan

We have the "AKS troubleshooting DNS performance issues lab" section [Create action plan, implement the plan, and collect findings](/Azure-Kubernetes-Service-Wiki/AKS/TSG/AKS-Network-Troubleshooting-Methodology/[TSG]-AKS-troubleshooting-DNS-performance-issues-lab#create-action-plan%2C-implement-the-plan%2C-and-collect-findings) as an example of the action plan options.

### Collect findings

After the action plan is implemented, we can repeat the steps from the evidence collection sections and document the findings.

</details>
<br>

<details open>
  <summary><b>8 - Escalation process</b></summary>

## 8 - Escalation process

### Summary

This section aims to provide guidance on when and how to escalate.

### When should we escalate?

If we follow the workflow and collect all facts and evidence around the issue, but we failed to formulate a hypothesis or end up with an action plan that does not solve the issue, then we should consider the escalation process. Before escalating the issue remember to leverage collaboration with your peers, TAs, and SMEs on AVA.

### How should we escalate?

We follow the escalation process described in the document [How To Escalate CRI (ICM)](/Azure-Kubernetes-Service-Wiki/ACT-Team/Processes/How-To-Escalate-CRI-\(ICM\)).
Please include the workflow results from your iteration on the CRI summary (facts, summary of evidence collected, hypothesis if any, and action plan if any).

</details>
<br>

<details open>
  <summary><b>Additional resources and documentation</b></summary>

## Additional resources and documentation

This aims to consolidate multiple references to internal and public documents that can be useful to get more context and additional knowledge related to DNS and other networking topics.

- [DNS Records (Azure Network Wiki)](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/407525/DNS-Records)
- [DNS Resolution (Azure Network Wiki)](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/405591/DNS-Resolution)
- [Troubleshooting Random DNS Query Failures (Azure Network Wiki)](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/181141/Troubleshooting-Random-DNS-Query-Failures)
- [Network Capture Basics (Azure Network Wiki)](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/538805/Network-Capture-Basics)

### Hands-on labs

- [[TSG] AKS troubleshooting DNS issues lab](/Azure-Kubernetes-Service-Wiki/AKS/TSG/AKS-Network-Troubleshooting-Methodology/[TSG]-AKS-troubleshooting-DNS-issues-lab)
- [[TSG] AKS troubleshooting DNS performance issues lab](/Azure-Kubernetes-Service-Wiki/AKS/TSG/AKS-Network-Troubleshooting-Methodology/[TSG]-AKS-troubleshooting-DNS-performance-issues-lab)

</details>
<br>

## Owner and Contributors

**Owner:** Sergio Turrent <seturren@microsoft.com>
**Contributors:**

- Sergio Turrent <seturren@microsoft.com>
