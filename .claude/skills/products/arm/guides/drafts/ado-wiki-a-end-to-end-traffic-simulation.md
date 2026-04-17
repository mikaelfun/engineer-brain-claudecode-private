---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Rack Scale/Readiness/ALRS Kube-OVN/EndtoEnd Traffic Simulation"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Rack%20Scale/Readiness/ALRS%20Kube-OVN/End%E2%80%91to%E2%80%91End%20Traffic%20Simulation"
importDate: "2026-04-06"
type: troubleshooting-guide
---

  
We can take the setup we created earlier in in _VPC and Subnet routing_ we can use it to simulate traffic flow in Kube-OVN.

![image.png](/.attachments/image-2788c332-0d64-4a16-8759-69dafe840cd9.png)
  
We can simulate at two levels, the OVN (Control plane level), and the OVS (Data plane level).

<br></br> 
**OVN traffic simulation**

If we first try to recreate how traffic may flow between pod-a and pod-b at the OVN level.

```
#First connect to the ovn central pod
kubectl exec -it -n kube-system ovn-central-766cc8bf6d-nrpbd -c ovn-central -- bash

#Then run a simulation that sends a packet from pod-a to pod-b (this will only go as high as the subnet1 switch)
$ ovn-trace subnet1 'inport == "pod-a.default" && eth.src == 6a:81:23:e2:b2:c7 && eth.dst == 0a:bb:81:3b:15:3a'
```

Output
![image.png](/.attachments/image-d29b391b-e606-415d-8f23-4c7786aef37f.png)

We can see the traffic is successfully sent to pod-b

Note: ovn-trace can be used with the -- minimal  -- summary  --detailed switches to control the verbosity of the returned results.

<br></br>
If we move onto a more complicated simulation now to simulate traffic between pod-a and pod-c

```
#First connect to the ovn central pod
kubectl exec -it -n kube-system ovn-central-766cc8bf6d-nrpbd -c ovn-central -- bash

#Then run a simulation that sends a packet from pod-a to pod-c (this will go through the vpc1 router)
$ ovn-trace subnet1 'inport == "pod-a.default" && eth.src == 6a:81:23:e2:b2:c7 && ip4.src == 192.168.1.2 && eth.dst == 42:e8:59:59:45:ec && ip4.dst == 192.168.2.2 &&  ip.ttl == 32'
```
Output
![image.png](/.attachments/image-f5dfd393-9496-4246-b3aa-ad56642237f0.png)
  
again we can see the simulation was successful. The simulation output shows the ingress and egress at each port on its journey, if there been something like an acl blocking the traffic between pod-a and pod-c we would see the packet drop as a result.

<br></br>
**OVS traffic simulation**

The data plane is where our traffic really flows so it is useful if we can also simulate traffic at this level.

Note: It can be useful to collect some ovn information (e.g. mac address for pod-a and pod-b) from the north and south databases prior to working the ovs simulation
```
kubectl ko nbctl list Logical_Switch_Port | grep -B 9 -A 7 pod-a.default
kubectl ko sbctl list Port_Binding | grep -B 9 -A 13 pod-a.default
```
To simulate ovs traffic we must first connect to the ovs pod.
Run _kubectl get pod -A -o wide_ to see where the pod you're planning to simulate against (e.g. pod-a) is running (e.g. on kubeovn-worker2). Then identify the ovs pod that is running on kubeovn-worker2 and connect to that.

![image.png](/.attachments/image-6de08401-e4ab-4446-9606-199f90525736.png)

```
kubectl exec -it -n kube-system ovs-ovn-ct69k -c openvswitch -- bash

#We are going to simulate traffic flow between pod-a and pod-b so we first need to find the ovsdb interface name for pod-a
$ ovs-vsctl --data=bare --columns=_uuid,name,external_ids,ofport find Interface | grep pod-a.default -B 2 -A 1
```

![image.png](/.attachments/image-93f4896d-f5e7-46f1-9fce-197d835e63d8.png)
  
We can now see the interface name/id associated with pod-a at the ovs level.
Note: This is an alternative command which can find the same information _ovs-vsctl list Interface | grep -i -B 13 -A 22 pod-a.default_

  
To help us later we are going to run the same command for pod-b 

```
$ ovs-vsctl --data=bare --columns=_uuid,name,external_ids,ofport find Interface | grep pod-b.default -B 2 -A 1
```

![image.png](/.attachments/image-92c7c5ff-0e54-421d-bec4-97ff9cb6480b.png)
  
The important point to note here is that pod-b is using switch port 88 at the ovs level

Now to simulate traffic between pod-a and pod-b at the ovs level we run

```
kubectl exec -it -n kube-system ovs-ovn-ct69k -c openvswitch -- bash

#Simulate traffic flow between pod-a and pod-b
$ ovs-appctl ofproto/trace br-int in_port=b554a442325f_h,dl_src=6a:81:23:e2:b2:c7,dl_dst=0a:bb:81:3b:15:3a -generate
```
Output
![image.png](/.attachments/image-a43c5c37-c3d3-4799-a74c-dafe4dbe6b68.png)

  
Here we can see the packet made it to switch port 88 which we previously associated with pod-b showing the ovs trace completed successfully between pod-a and pod-b

Further reading - [https://blog.russellbryant.net/post/2016/11/2016-11-11-ovn-logical-flows-and-ovn-trace/](https://blog.russellbryant.net/post/2016/11/2016-11-11-ovn-logical-flows-and-ovn-trace/)
