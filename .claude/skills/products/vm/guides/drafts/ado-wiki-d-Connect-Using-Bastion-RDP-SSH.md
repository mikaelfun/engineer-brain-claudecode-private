---
source: ado-wiki
sourceRef: Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Cant RDP SSH/TSGs/Isolation/Connect Using Bastion_RDP SSH
sourceUrl: https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FCant%20RDP%20SSH%2FTSGs%2FIsolation%2FConnect%20Using%20Bastion_RDP%20SSH
importDate: 2026-04-06
type: troubleshooting-guide
---

---
Tags:
- cw.TSG
- cw.RDP-SSH
- cw.Reviewed-04-2025
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::



[[_TOC_]]

## Introduction

<details>

<summary>Click here to expand or collapse this section</summary>

### What is Bastion Host as a Service

Azure Bastion Host Service enables you to securely and seamlessly RDP & SSH to your VMs in an Azure virtual network without the need for a public IP on the VM. This is done directly from the Azure portal, without requiring any additional client, agent, or software. Once you provision an Azure Bastion service in your virtual network, the seamless RDP/SSH experience is available to all your VMs in the same virtual network. The deployment is per virtual network, not per subscription, account, or virtual machine.

In a nutshell, the Bastion host allows connectivity to VMs running either Windows or Linux via the SSH or RDP port, respectively. The public IP exposed to the internet is the IP for Bastion, providing an additional layer of security to the environment.

It is important to understand that the customer does not manage the Bastion host directly. The customer simply deploys it in the environment.

When dealing with "cannot SSH/RDP" cases, it is important to check with the customer if they are trying to RDP using the regular RDP or SSH client or if they are using Bastion.

1. If the answer is Bastion, double-check that the machine is up and running and accepting connections via other methods.
2. If this criterion is met, Azure Networking needs to be involved, as they are the team that supports Bastion Host.

From our end, it is expected to validate that the machine is in a healthy state and that the customer can RDP using the regular client.

### Bastion as a Service Architecture

Bastion Host requires the OS and the SSH/RDP services to be up and running to work. It is merely a different way to reach out to them. If the machine is not booting, the SSH/RDP services are failing, or there is a firewall blocking connectivity at the OS level, then we need to troubleshoot that first for Bastion to work. We need to ensure that we can RDP/SSH into the machine using regular clients. If this works and Bastion fails, then we can collaborate with Networking for them to troubleshoot the Bastion-related problem.

![Bastion Architecture](/.attachments/SME-Topics/Cant-RDP-SSH/cb22371c-ae37-a8ca-f4b8-da29262de768Bastion_architecture.png)

### Bastion as a Service Troubleshooting Logic

There are two main areas related to Bastion support:

1. Issues related to Bastion directly.
2. Issues related to connectivity between Bastion and the VMs.

#### Issues Related to the Bastion Host Directly

These are issues related to the status of the Bastion host or deployment errors. If the Bastion host appears as failed in ASC or throws errors during deployment, send the case to Azure Networking. They are the team that supports Bastion Host. Bastion logs and deployment are reflected under NRP, so there is not much we can do from the compute side to troubleshoot these scenarios. Even though Bastion Host relies on VMSS, those VMSS are not directly reachable, and neither the Azure VM POD nor the customer can interact with the nodes directly.

#### Issues Related to Connectivity Between Bastion and the VMs

Connectivity issues are trickier to troubleshoot as they could reside on Bastion or directly on the machines the customer is trying to reach. If a case lands on the **Azure VM POD** related to Bastion as a host, first ensure you understand where the connectivity issue resides. The main test is to validate whether you can RDP or SSH using regular clients into the machine. If that works and Bastion continues to fail, then reach out to the **Azure Networking team** to troubleshoot further.

To troubleshoot connectivity to the machine:

- Check if the VM is accepting connections to the default RDP or SSH ports.
- If this fails, follow the TSGs to ensure the machine is reachable via RDP/SSH (check NSGs, internal firewall, VM status, etc.).
- Once you can successfully log in to the machine using the regular client, ask the customer to try logging in using Bastion again.
- If Bastion still fails while regular RDP/SSH works, escalate to the Azure Networking team to troubleshoot from the Bastion standpoint.

### References

- [Azure Networking - Azure Bastion](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/24350/Azure-Bastion)

</details>

## Symptoms

Customers report issues when attempting to connect using [**Azure Bastion**](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/24350/Azure-Bastion). Bastion as a Service enables secure RDP or SSH connections to VMs residing in the same VNet where the Bastion Host is deployed.

To use Bastion to connect to a VM, the following criteria must be met:

1. Bastion must be successfully deployed on a subnet named **AzureBastionSubnet** within the same VNet as the VM. However, if the Bastion SKU is **Developer**, it won't have this dedicated 
subnet named **AzureBastionSubnet**, instead your NSG rules must allow traffic to ports 22 and 3389 from the Wire server IP address **168.63.129.16**.
2. Ports 3389 (for **Windows**) and 22 (for **Linux**) must be **open** on the OS firewall.
3. The VM's network stack at the OS level must be responsive, meaning the VM must be fully booted and available over the network.

Azure Bastion is supported by the **Azure Networking POD**. However, due to the case submission workflow in the portal, the **Azure VM POD** may still receive cases for the following reasons:

1. The customer wants to use Bastion to connect to the VM but does not know how to file a case for the Bastion product directly.
2. The target VM is either not booting or lacks connectivity.

Azure Bastion is accessed directly from the portal, and the session it creates uses HTTPS (port 443) in a web browser. On the backend, Bastion connects to the VMs using the default SSH (22) or RDP (3389) ports.

> **Note:** During the preview phase of this feature, customers must access the portal via [aka.ms/bastionhost](http://aka.ms/bastionhost) to see the Bastion connection option.

### Symptoms 1

1. The customer is unable to connect to the VM using Bastion Host, receiving the error:<br>
  ![Error: Machine not responding](/.attachments/SME-Topics/Cant-RDP-SSH/2d838e77-20d5-5b17-29b4-f729f5e989d0450px-BastionError_Machine_not_responding.png)
2. Attempts to use standard RDP or SSH on the private/public IP of the VM also fail.
3. The screenshot feature shows OS issues (e.g., the OS did not finish booting or encountered an error that crashed the machine).

### Symptoms 2

1. The customer is unable to connect to the VM using Bastion Host, encountering the following errors:
  - Initially, the bottom-right section of the screen shows:<br>
    ![Network connection to Bastion Host](/.attachments/SME-Topics/Cant-RDP-SSH/8160c9ce-2df0-6985-283c-a4215ec25d18300px-NetworkConnectiontoBastionHost.png)
  - Then, the following error appears:<br>
    ![Connection closed](/.attachments/SME-Topics/Cant-RDP-SSH/803d2d1c-8813-fb53-a41b-60442f603f59450px-Connectionclosed.png)
2. The VM is reachable via other network services.
3. The screenshot feature shows the OS is **healthy**.
4. Direct RDP/SSH connections to the VM's private/public IP work without issues.

These errors indicate that the VM's OS is fully operational, but the Bastion service cannot connect to the VM on the default RDP or SSH port.

### Symptoms 3

1. **Direct RDP or SSH connections to the VM's private/public IP work fine.** The only issue is with Azure Bastion connectivity.
2. The customer is unable to connect to the VM using Bastion Host, encountering errors such as:<br>
  ![Connection closed](/.attachments/SME-Topics/Cant-RDP-SSH/803d2d1c-8813-fb53-a41b-60442f603f59450px-Connectionclosed.png)<br>
  or<br>
  ![Bastion failed state](/.attachments/SME-Topics/Cant-RDP-SSH/a2bfd4a7-0ece-12a1-ca70-edcae2e65270900px-Bastionfailedstate.png)
3. If this scenario occurs, proceed with **Root Cause Analysis 3** and **Mitigation 3**.



### Symptoms 4
1. Direct RDP to the VM's private/public IP works fine. The issue only occurs with Azure Bastion.
2. Azure Bastion connection fails with a ?machine not responding? error.: 
 ![Error: Machine not responding](/.attachments/SME-Topics/Cant-RDP-SSH/2d838e77-20d5-5b17-29b4-f729f5e989d0450px-BastionError_Machine_not_responding.png)
3. The server has the **RDSH (Remote Desktop Session Host)** role installed, either intentionally to allow multiple concurrent sessions or unintentionally from a past configuration.
4. If you check your **WinGuest Analyzer** you will find under the RDP even multiple messages stating the following: 
*The RD Licensing grace period has expired and Licensing mode for the Remote Desktop Session Host server has not been configured. Licensing mode must be configured for continuous operation.*
![RDSLicensingExpired.png](/.attachments/SME-Topics/Cant-RDP-SSH/RDSLicensingExpired.png)
5. You might find a similar message on Microsoft-Windows-Terminal-Services-RemoteConnectionManager/Admin:
![RDSLicensingExpiredErrorMessage.png](/.attachments/SME-Topics/Cant-RDP-SSH/RDSLicensingExpiredErrorMessage.png)
3. If this scenario occurs, proceed with **Root Cause Analysis 4** and **Mitigation 4**.







## Root Cause Analysis

### Root Cause Analysis 1

The symptoms indicate that the target VM is healthy and has connectivity, but there are issues with the Guest OS configuration preventing connections to the RDP/SSH application. Possible causes include:

1. The default RDP/SSH port was changed on the Guest OS, and the NSGs were not updated accordingly.
2. A local firewall is blocking the connection.
3. The RDP/SSH port is not functioning properly.
4. Other OS-level misconfigurations.

### Root Cause Analysis 2

The symptoms indicate that the target VM is healthy and has connectivity, but there are issues with the NSG or UDR configuration between the Bastion Host and the VM. Specifically:

1. The RDP/SSH ports (3389/22) are not open in the NSG.
2. A UDR is misrouting traffic between the Bastion Host and the VM.

> **Note:** Verify if the RDS Session Host role is installed on the VM, as Azure Bastion does not support connections to VMs configured as RDS Session Hosts.(https://learn.microsoft.com/en-us/azure/bastion/bastion-faq)


     Run the following PowerShell command on the VM:
        
     Get-WindowsFeature | Where-Object { $_.Name -like "*RDS*" }
  If Remote-Desktop-Session-Host is Installed, the VM is an RDS Session Host

**Note**- Please verify if the RDS session host is installed on the VM, as Azure Bastion does not support connections to a VM configured as an RDS session host.Kindly refer this https://learn.microsoft.com/en-us/azure/bastion/bastion-faq


### Root Cause Analysis 3

If the VM is proven to be healthy and the setup appears correct, further investigation is required. This should be escalated to the **Azure Networking POD**.

### Tracking close code for this volume

| Root Cause | Product            | Support Topic                                      | Cause Tracking Code                                                                                     | Bug |
|------------|--------------------|---------------------------------------------------|---------------------------------------------------------------------------------------------------------|-----|
| 1          | *Bastion - Preview* | *Routing Azure\Connectivity\Failure to connect using RDP* | *Root Cause - Windows Azure\Azure Bastion\Connectivity Issues\RDP\No Connectivity to Workload\Target VM Issues - RDP not configured properly on target VM* |     |
|            | *Bastion - Preview* | *Routing Azure\Connectivity\Failure to connect using SSH* | *Root Cause - Windows Azure\Azure Bastion\Connectivity Issues\SSH\No Connectivity to Workload\Target VM Issues - SSH not configured properly on target VM* |     |
| 2          | *Bastion - Preview* | *Routing Azure\Connectivity\Failure to connect using RDP* | *Root Cause - Windows Azure\Azure Bastion\Connectivity Issues\SSH\No Connectivity to Workload\Target VM Issues - NSG/UDR* |     |
|            | *Bastion - Preview* | *Routing Azure\Connectivity\Failure to connect using SSH* | *Root Cause - Windows Azure\Azure Bastion\Connectivity Issues\SSH\No Connectivity to Workload\Target VM Issues - NSG/UDR* |     |
| 3          | *Bastion - Preview* | *Routing Azure\Connectivity\Failure to connect using RDP* | This will depend on the investigation                                                                  |     |
|            | *Bastion - Preview* | *Routing Azure\Connectivity\Failure to connect using SSH* | This will depend on the investigation                                                                  |     |


### Root Cause Analysis 4

While the article [Azure Bastion FAQ](https://learn.microsoft.com/en-us/azure/bastion/bastion-faq#rdscal-compatibility) states that "Bastion doesn't support any RDS-related scenarios," it is still possible for IT administrators to connect to a VM via Bastion for administrative purposes, even if the RDSH (Remote Desktop Session Host) role is installed.

However, this connection is limited to single-session administrative access and cannot be used to support RDS scenarios, such as multiple concurrent user sessions or RDS CAL-based environments.

In such a case, imperative to check with the customer whether they are using this role or not on the VM. If they are not, it is possible that they installed it the RDS license grace period expired. Information about RDS Grace Period: [License your RDS deployment with client access licenses (CALs)](https://learn.microsoft.com/windows-server/remote/remote-desktop-services/rds-client-access-license)


## Mitigation

### How to Validate if the Customer Has a Bastion Host in Their Environment

1. In **ASC**, navigate to the affected machine under **Resource Explorer** and note the VNet on which the NIC of this machine is configured.<br>
  ![ASC Resource Explorer](/.attachments/SME-Topics/Cant-RDP-SSH/93375f1d-2d3b-b004-7256-0599e031602f400px-ASC_DATAC_1.png)
2. With the VNet name, go to **Resource Provider** and select **Microsoft.Networking**. If Bastion Host is enabled, you will see an object type called **BastionHost**.<br>
  ![Microsoft.Networking Resource Provider](/.attachments/SME-Topics/Cant-RDP-SSH/f7feaa87-bf6a-9c8a-4ef0-f56978724c3d300px-ASC_DATAC_2.png)
3. Click on it and validate the deployed instances. Each Bastion Host is deployed on a single VNet, so search for one that shares the same VNet as your affected machine.<br>
  ![Bastion Host Validation](/.attachments/SME-Topics/Cant-RDP-SSH/25bdb432-75a6-f3fb-2728-1968447396e01000px-ASC_DATAC_3.png)

### Mitigation 1

1. If the machine has a **private IP**, test by attempting a direct RDP/SSH connection:
  - If this works, proceed to **Mitigation 2**.
  - If this fails:
    1. Verify the VM is fully booted and has connectivity.
    2. Check the following:
      - Ensure the local firewall is not blocking RDP/SSH connections.
      - Confirm the RDP/SSH application is functioning. If the port number was changed, ensure the change is reflected in the local firewall and NSGs.
      - Validate if the issue is related to [CredSSP](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495377). Currently, Bastion Host is not patched for CredSSP. If the server forces the client to be patched, the connection will fail. **This will be addressed before the feature goes GA.**
    3. If the above issues are resolved and the connection works, close the case as per the **Tracking Close Code for This Volume** section.
    4. If the issue persists, re-code the case as:
      - **Product:** Azure Virtual Machine ? Windows or Azure Virtual Machine ? Linux (as appropriate).
      - **Support Area Path:** Routing Azure Virtual Machine V3\\Cannot connect to my VM\\Failure to connect using RDP or SSH port.
    5. Follow the [RDP-SSH Basic Workflow](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495388) to determine why the machine is not accepting requests.
2. If the machine has a **public IP**, perform the same test as above to check if the connection works.
3. If both the public and private IPs allow direct RDP/SSH connections, the target VM is ruled out as the issue. Proceed to **Mitigation 3** for further investigation of Bastion.

### Mitigation 2

1. Check the NSG configuration between the Bastion Host and the target VM. Ensure the RDP/SSH ports are enabled.
2. If the ports are not open, configure them and retry the connection. If it works, close the case as per the **Tracking Close Code for This Volume** section.
3. If updating the NSGs does not resolve the issue, proceed to the next mitigation step.

### Mitigation 3

1. The Azure Bastion connection requires further investigation. Update the case with:
  - **Product:** Bastion - Preview.
  - **Support Area Path:** Connectivity\\Failure to connect using RDP or Connectivity\\Failure to connect using SSH (as appropriate).
2. Transfer the case to the **Azure Networking POD**.



### Mitigation 4

Verify if the RDS Session Host role is installed on the VM:

     Run the following PowerShell command on the VM:
        
     Get-WindowsFeature | Where-Object { $_.Name -like "*RDS*" }
  If Remote-Desktop-Session-Host is Installed, the VM is an RDS Session Host.

Depending on whether the customer confirms the **RDSH (Remote Desktop Session Host)** role is in use:

* If the RDSH role was installed by mistake or is not longer used, they can uninstall it to recover access to Bastion. An easy way is to do this via [Run Command](https://learn.microsoft.com/en-us/azure/virtual-machines/windows/run-command?tabs=portal%2Cpowershellremove#using-run-commands) or [Serial console](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/serial-console-windows#use-cmd-or-powershell-in-serial-console):
  **Uninstall-WindowsFeature -Name RDS-RD-Server -Restart**

* If customer has RDS farm, then customer needs to verify internally if they have configured RDS License Server and have proper licenses (CALs), if not customer should buy licenses since the grace period ends and the farm will stop working.

  More information can be found on the Azure Networking TSG: [Unable to use Bastion to connect to a VM due to RDS licensing issue](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/1910679/Unable-to-use-Bastion-to-connect-to-a-VM-due-to-RDS-licensing-issue)


### Escalation

::: template /.templates/SME-Topics/Cant-RDP-SSH/Azure-Virtual-Machine-RDPSSH-ContactRDPSME-Template.md
:::



::: template /.templates/Processes/Knowledge-Management/RdpSsh-Feedback-Template.md
:::
