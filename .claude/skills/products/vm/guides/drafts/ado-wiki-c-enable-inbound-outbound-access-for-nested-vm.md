---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Cant RDP SSH/How Tos/Enable Inbound Outbound Access for Nested VM_RDP SSH"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Cant%20RDP%20SSH/How%20Tos/Enable%20Inbound%20Outbound%20Access%20for%20Nested%20VM_RDP%20SSH"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.How-To
- cw.RDP-SSH
- cw.Reviewed-08-2025
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::


[[_TOC_]]


## Summary

Assist customers with enabling inbound and outbound access to external networks for nested VMs in these scenarios:

- Customer may need the nested VM to access external resources (for example, to join a domain when the domain controller is outside the Azure network).
- Customer needs to RDP into a nested VM from other Azure VMs.
- Verify RDP functionality after applying mitigations, before restoring the OS disk to Azure.


## How To Steps

### Option 1 — Inbound RDP from the rescue VM (Hyper-V host) to the nested VM (Hyper-V guest)

Most commonly, inbound access from the rescue VM to the nested VM is used to test RDP. Once RDP works, the OS disk can be swapped back into Azure for further checks or mitigations.

This uses an Internal Hyper-V virtual switch, which provides an internal, private (non-routable) network for communication between the two VMs.

1. Deploy a rescue VM (Hyper-V host) and create a nested VM (Hyper-V guest) following the Wiki: https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495132/Nested-Virtualization_RDP-SSH

2. On the rescue VM, open an elevated PowerShell session and run:
    ```powershell
    New-VMSwitch -Name "RescueSwitch" -SwitchType Internal
    ```

3. Open Hyper-V Manager, ensure the nested VM is powered off. Right-click the VM and select Settings.

    ![virtualSwitch.png](/.attachments/SME-Topics/Cant-RDP-SSH/virtualSwitch.png)

4. Select the Network Adapter and choose the switch you created under Virtual Switch. Click Apply and OK.

    ![virtualSwitch1.png](/.attachments/SME-Topics/Cant-RDP-SSH/virtualSwitch1.png)

5. Power on the nested VM and run `ipconfig`. You should see an APIPA address (169.254.x.x).

    ![APIPA_IP.png](/.attachments/SME-Topics/Cant-RDP-SSH/APIPA_IP.png)

You should now be able to RDP into the nested VM from the rescue VM.

### Option 2 — Inbound RDP from external clients to the nested VM (Hyper-V guest)

Less common: test RDP from external resources to the nested VM by using Hyper-V NAT to translate the destination IP and forward traffic to the nested VM.

1. On the rescue VM, open an elevated PowerShell session and run:
    ```powershell
    New-NetNat -Name Rescue -InternalIPInterfaceAddressPrefix 169.254.0.0/16
    New-NetIPAddress -IPAddress 169.254.0.1 -PrefixLength 16 -InterfaceAlias "vEthernet (RescueSwitch)"
    ```

2. Inside the nested VM, run `ipconfig` and note the assigned IP address and the Ethernet adapter name. Then, in an elevated command prompt or PowerShell on the nested VM, set the static IP, gateway, and DNS (replace placeholders):
    ```powershell
    netsh interface ipv4 set address name="<Ethernet Adapter Name>" static <IP address> 255.255.0.0 169.254.0.1
    netsh interface ipv4 set dnsservers name="<Ethernet Adapter Name>" static 168.63.129.16 primary
    ```

3. Back on the rescue VM PowerShell session, map an external port to the nested VM's RDP port:
    ```powershell
    Add-NetNatStaticMapping -NatName Rescue -Protocol TCP -ExternalIPAddress 0.0.0.0 -InternalIPAddress <Nested VM IP address> -InternalPort 3389 -ExternalPort 50000
    ```

4. In the Azure Portal, go to the rescue VM's Networking blade and add an inbound security rule to allow TCP traffic on port `50000` from the customer's source IP.

This enables RDP to the nested VM using the rescue VM's public IP and port `50000` (for example: RescueVM_PublicIP:50000).

Note: This setup also provides outbound internet access for the nested VM, but traffic will egress using the rescue VM's IP address because of the internal virtual switch. As a result, the nested VM may not be able to perform certain actions that require a native VNet IP (for example, joining a domain).

### Option 3 — Outbound connectivity from the nested VM (Hyper-V guest)

Rare scenarios require the nested VM to have full outbound connectivity (for example, to join a domain). This requires using an External Virtual Switch on the rescue VM and assigning an IP within the customer's VNet range.

Because of the risk and complexity, contact the Unable to RDP/SSH SMEs for assistance before proceeding.


::: template /.templates/Processes/Knowledge-Management/RdpSsh-Feedback-Template.md
:::
