---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Bastion/How To/Connectivity Issues"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FHow%20To%2FConnectivity%20Issues"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]
# Quick Architecture Overview

First a reminder on the Azure Bastion Architecture. There are 2 basic paths for connectivity with Azure Bastion.

The path in Green is the Client connecting to Bastion on port 443.
The path in Blue is Azure Bastion connecting to the backend via RDP or SSH.
They are separate connections. Your first goal is to determine which path is failing

## Step 1 | Is the target VM running and does the connectivity check in ASC pass?
- Verify that the target VM is running and healthy in ASC
- Verify that Bastion has connectivity to the backend using the Connectivity checker in ASC **`Note: This only checks TCP connectivity - it does not actually log in via RDP or establish SSL.`**

## Step 2 | Verify the NSGs

- Verify the NSG on the AzureBastionSubnet Allows Port 443 inbound from clients Public IPs. 
- Verify the NSG on the AzureBastionSubnet Allows Port 443 inbound from the Gateway Manager Public IPs.
- Verify the NSG on the AzureBastionSubnet allows ports 8080/5701 inbound from VirtualNetwork to VirtualNetwork
- Verify the NSG on the AzureBastionSubnet allows port 443 inbound from AzureLoadBalancer
- Verify the NSG on the AzureBastionSubnet Allows port 443 outbound to Public IPs
- Verify the NSG on the AzureBastionSubnet allows ports 3389/22 outbound to the vnet ranges. 
- Verify the NSG on the AzureBastionSubnet allows ports 8080/5701 outbound from VirtualNetwork to VirtualNetwork
- Verify the NSG on the AzureBastionSubnet allows port 443 outbound to AzureCloud
- Verify the NSG on the AzureBastionSubnet allows port 80 to the Internet
- Verify the NSG on the VM subnet allows the AzureBastionSubnet inbound on 3389/22.
- If applicable Verify the NSG on the VM NIC allows the AzureBastionSubnet inbound on 3389/22.
- If the NSGs look good move on to the Daemon Tomcat logs.

**Note: The Source for the inbound rules has to be ANY and the Destination for the outbound rules has to be ANY.**
**Note: In case of Private-Only Bastion, verify the NSG on the AzureBastionSubnet Allows Port 443 from VirtualNetwork instead of Client's Public IPs.**

## Step 3 | Check the External Side (Tomcat Logs) 
Using the details from scoping the issue filter the Tomcat logs on the Client IP and Time of the issue.
Start with the link in ASC and then modify it for the correct time.
You can also add the following Client Query to narrow it down to a specific client:
```
where httpRemoteHost == "1.1.1.1"
// Note: Replace 1.1.1.1 with the public IP of the client connecting
```

Successful connections will say things like:
- "Successfully authenticated from"
- "Login was successful for user"

Remember that this part may be successful even if the full connection fails.
If this part seems to be successful make note of the time and then look at the Daemon logs.
If this part is failing jump to getting Client side logs or possible the Authentication troubleshooter.
If you don't see the Client connecting at all: Verify the NSG again and have the customer verify their Internet Path to the Bastion Public IP.

```
Note: If the Problem seems Intermittent also check the Resource Health step
```

## Step 4 | The Bastion Service and Internal Side of the Connection
The Daemon logs don't have a common field for the backend IP or the client IP.
That makes the time you got from the Tomcat logs critical to narrowing things down.
Use the link in ASC and modify the time to cover the attempt you saw in the Tomcat logs.

### Successful connections will say things like:
- It will start with "Creating new client for protocol "rdp""
- And it won't say things like "Internal RDP client disconnected"

### Failed connections will say things like:
- Error connecting to RDP server

Note: "failed to load" guacdr and guacsnd can typically be ignored — it just means sound/drive redirect is not available.

If we can't determine what is happening in this log beyond "it failed to connect" we need to get a Network trace from the backend. 
We should also ask if they can connect from a VM in the same Vnet. If they cannot and the NSGs are not blocking, we should engage the VM team with a collab.

## Step 5 | Checking Bastion VMSS Instances and Destination VM for Potential Resource Exhaustion

Frequent disconnects and intermittent connectivity issues (often temporarily resolved by a VM restart) can be caused by resource exhaustion on the Bastion VMSS instances and/or the destination VM.

- Steps to check Bastion VMSS resources:
     - Go to the Bastion resource in ASC
     - Inside the Properties tab look for the "Gateway Subscription ID," which is the PG Subscription. Load the PG subscription in ASC
     - Once loaded, change the view to Resource Group
     - Search the resource group by the name found in the DNS Name column, ignoring the "bst-" prefix. Typically, you can find the Resource Group using the first few characters in the name
     - All PG Resource Groups will start with "armrg-" followed by the characters you are looking for
     - Once you have located the Resource Group, expand it. Click on the BastionVMSS, then click on the individual instances that make up the VMSS to check performance metrics under the Guest tab. RAM issues are typically identified here, indicating that the customer is over-utilizing their available resources and needs to scale out. **Anything under 1 GB of available RAM will cause issues.**

- Also check the destination VM for the same over utilization, by going to the VM resource, clicking the Guest tab, and checking the same resources. 

## Step 6 | Logging on the Backend VM 

- Get a Network trace while attempting to connect via Azure Bastion.
    - Verify the TCP handshake completes
    - Verify the SSL handshake is successful

### Engaging the VM Team for assistance with the RDP logs
Note: **We are not sending the case to the VM team.** Phrase collab as: "Need assistance with figuring out why RDP is failing to this VM. We have verified network connectivity is working."

- Have the VM team run the WinGuest Analyzer against the target VM's resource URI:
    - http://aka.ms/WinGuestAnalyzer (un-encrypted disks)
    - VM Pod has a way to collect logs from VMs with encrypted disks

Event Logs for Review:
- Windows-System
- Windows-Security  
- Microsoft-Windows-TerminalServices  
    - Microsoft-Windows-Terminal-Services-RemoteConnectionManager/Operational
    - Microsoft-Windows-TerminalServices-LocalSessionManager/Operational
    - Microsoft-Windows-TerminalServices-SessionBroker-Client
- Microsoft-Windows-RemoteDesktopServices

Key Event IDs:
- Event ID 4626: "An account was successfully logged on"
- Event ID 4625: "An account failed to log on"
- Event ID 21: "Remote Desktop Services: Session logon succeeded"
- Event ID 40: "Session <X> has been disconnected, reason code <Z>"

## Step 7 | Client Logs (from the source) 
- Get Screenshots and Error messages
- Run Inspect IaaS Disk from ASC for the backend client (if permitted and disks not encrypted)
- Get Browser Debug logging: https://docs.microsoft.com/en-us/azure/azure-portal/capture-browser-trace

## Step 8 | Resource Health
In ASC we can verify the resource Health of the Azure Bastion at the time the connection attempt was made.
This is more relevant for intermittent issues or issues that only happened during a specific time window.
