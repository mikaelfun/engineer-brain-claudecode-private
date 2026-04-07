---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Cant RDP SSH/How Tos/How to use NetworkWatcher Flowlogs for connectivity issues_RDP SSH"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Cant%20RDP%20SSH/How%20Tos/How%20to%20use%20NetworkWatcher%20Flowlogs%20for%20connectivity%20issues_RDP%20SSH"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.How-To
- cw.RDP-SSH
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::



[[_TOC_]]

## Summary

Network security groups flow logging is a feature of Azure Network Watcher that allows you to log information about IP traffic flowing through a network security group. Flow data is sent to Azure Storage from where you can access it and export it to any visualization tool, security information and event management (SIEM) solution, or intrusion detection system (IDS) of your choice.


 <https://learn.microsoft.com/en-us/azure/network-watcher/network-watcher-nsg-flow-logging-overview>


**NOTE**: *Network Watcher is currently supported by the Azure Networking team; however, the intention of the document is to provide an easy alternative that can help identify potential connectivity issues, 
which would assist the engineer in the analysis of the problem.**

## Why use Flow flogs?

Flow logs are very useful in cases where a VM is experiencing connectivity issues and the VM team wants to ensure that a VM in Azure can be reached by a source machine, whether it's located in Azure, a remote VM, or on-premises, through any port. You can use flow 
logs to monitor incoming traffic on any port that was previously allowed in the NSG (Network Security Group).

Below diagram shows how a Network Watcher and flow logs looks like:

![](/.attachments/SME-Topics/Cant-RDP-SSH/How-to-Network-Watcher-Diagram.png)

## Common use cases

1. Identify unknown or undesired traffic.
2. Filter flow logs by IP and port to understand application behavior.
3. User cannot RDP and gets generic timed out error.
4. test-netconnection on port 3389 failed. No issues on NSGs

## LabBox
 https://aka.ms/LabBox

- For the purpose of training or following along with this TSG, you can use the following link to deploy a VM with this scenario built-in. You will need to enable JIT for the VM. This lab is not to be shared with customers.

  [![Click to Deploy](/.attachments/SME-Topics/Cant-RDP-SSH/ARMDeploy_Deploy-ARM-JSON-to-Azure.png)](https://labboxprod.azurewebsites.net/api/Labbox?url=https://supportability.visualstudio.com/AzureIaaSVM/_git/Labbox?path=/SME/Connectivity/Flow-logs.json)


#### Limitations

1. Only traffic at the source VMs can be captured. Traffic at the destination PaaS resource can't be captured.
2. We don't recommend that you log flows on an Azure ExpressRoute gateway subnet because traffic can bypass that 
type of gateway (for example, FastPath). If an NSG is linked to an ExpressRoute gateway subnet and NSG flow logs 
are enabled, then outbound flows to virtual machines might not be captured. Such flows must be captured at the subnet or NIC of the VM.


### Examples where NSG flow logs might help

**Internet access issues from a VM:** If a VM in Azure is unable to access the Internet, you can enable Flow Logs on 
the VM's network interface and analyze the logs to identify any outbound traffic blockage or routing issues that may be preventing web access.

**Communication issues between VMs:** If you have multiple VMs in a virtual network and they are experiencing 
difficulties communicating with each other, enabling Flow Logs on all involved VMs can help you identify whether traffic is being blocked by any network security rules or if there are network-level connectivity issues.

**Connectivity issues with Microsoft  services:** If a VM is having issues connecting to Azure services such as SQL
 , RDP, Azure Storage; , Flow Logs can assist you in tracking the traffic and determining whether there are connectivity problems or traffic blocking between the VM and Azure services.


## How NSG flow logs work

* Flow logs operate at Layer 4 of the Open Systems Interconnection (OSI) model and record all IP flows 
going in and out of a network security group.

* Logs are collected at 1-minute intervals through the Azure platform. They don't affect 
your Azure resources or network performance in any way.

* Logs are written in JSON format and show outbound and inbound flows per network security group rule.

* Each log record contains the network interface (NIC) that the flow applies to, 5-tuple information, the traffic 
decision, and (for version 2 only) throughput information.

* NSG flow logs have a retention feature that allows deleting the logs automatically up to a year after their creation.


## How to create a Network Watcher / Flow logs
1.	In the search bar, type network watcher
2.	Click on create
3.	 Select the region, it must be on the same region as the VM you want to test
4.	Select flow logs in logs section.

![](/.attachments/SME-Topics/Cant-RDP-SSH/How-to-Network-Watcher-Bladepng.png =500x)

5.	Click on create.
6.	Select your subscription and resource type: Network security group
7.	In the 'Select Resource' option, choose the NSG currently attached to the VM you want to test. If the VM has multiple NSGs, you can select all of them
8.	You need a Storage account to save the logs, choose a existing one or create a new one.

![](/.attachments/SME-Topics/Cant-RDP-SSH/How-to-Network-Watcher-CreateFlowLogs.png =500x)

9.	In the analytic tab, select version 2 and Enable traffic analytics.

After creating the Network Watcher and flow logs, you can test the connection using the desired service, such as RDP.

## How to verify the flow logs

1.	Go to the storage account created in step 8
2.	Select container and navigate thru the container, if it is a new storage account, you will see only a name into the container, if not, be guide by the last modified value.

![](/.attachments/SME-Topics/Cant-RDP-SSH/How-to-Network-Watcher-container.png =500x)

3.	At the end of the container, you will see JSON file, that file will contain the flow logs entries.

![](/.attachments/SME-Topics/Cant-RDP-SSH/How-to-Network-Watcher-fileLocation.png =500x)

Note: if you select more than one NSG, the JSON file will be in a subcontainer with the name of the corresponding NSG.

![](/.attachments/SME-Topics/Cant-RDP-SSH/How-to-Network-Watcher-containerfolders.png =500x)

4.	Download the Json file and open it with visual studio code.

![](/.attachments/SME-Topics/Cant-RDP-SSH/How-to-Network-Watcher-Jsonlocation.png =500x)

5. 	In visual studio code, right click on the code and select format document.

![](/.attachments/SME-Topics/Cant-RDP-SSH/How-to-Network-Watcher-jsonFormat.png =500x)

6.	By identifying the source IP address, you can search within the document to determine whether the traffic from the source machine is reaching the VM through the NSG or not.

Below is an example of a unsuccessful connection.

![](/.attachments/SME-Topics/Cant-RDP-SSH/How-to-Network-Watcher-logs1.png =500x)

In the above example, we saw that the IP ended in 23 is trying to connect to the IP ended in 4 thru port 3389, using protocol TCP (T), 
source port (61278),  it is an inbound connection (I), Traffic decision (D), Bytes (B)

Below an example of a successful connection:

![](/.attachments/SME-Topics/Cant-RDP-SSH/How-to-Network-Watcher-logs2.png =500x)

In the example above, we observed an attempt from an IP ending in '23' to connect to an IP ending in '4' via port 3389. The protocol used was TCP (T), with a source port of 59517. 
This was an inbound connection (I), and the traffic decision was 'Allowed' (A). 


::: template /.templates/Processes/Knowledge-Management/RdpSsh-Feedback-Template.md
:::
