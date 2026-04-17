---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Cant RDP SSH/How Tos/Access via Remote PowerShell_RDP SSH"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Cant%20RDP%20SSH/How%20Tos/Access%20via%20Remote%20PowerShell_RDP%20SSH"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.How-To
- cw.RDP-SSH
- cw.Reviewed-10-2024
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::

 

[[_TOC_]]

## Summary

Remote PowerShell sessions can be made both from within and outside VNET/CloudService to confirm any network connectivity issues surrounding the Azure Software Load Balancer. This article explains how to Access thru PSSession and InvokeCommand to an Azure Virtual Machine.

## Prerequisite

1.  The following ports needs to be open to use this option:
      - TCP Port 5985 (HTTP)
      - TCP Port 5986 (HTTPS)
2.  Usually, you can control this by the inbound rule *Windows Remote Management (HTTP-In)*

## Instructions

1.  Powershell is not going to be enable by default on GuestOS, this needs to be enable on the Guest
2.  NSGs needs to be updated to allow WinRM inbound traffic to the VM
3.  On the ***client machine*** from where you are trying to connect to the GuestOS, its powershell's needs to be setup to a allow to connect to the Azure VM. We do this by setting that machine as part of the Powershell whitelist:
    1.  To whitelist only my target machine, run the following:
        <br/>`set-item wsman:\localhost\Client\TrustedHosts -value <ComputerName>`
    2.  To whitelist multiple machines:
        <br/>` set-item wsman:\localhost\Client\TrustedHosts -value <ComputerName1>,<ComputerName2>  `
    3.  To whitelist all machines
        <br/>`set-item wsman:\localhost\Client\TrustedHosts -value *`
    4.  Enable RemotePS on your VM:
        1.  For Classic VMs, you can use *Custom Script Extension* by pushing the following script:
            ```
                Enable-PSRemoting -Force
                New-NetFirewallRule -Name "Allow WinRM HTTPS" -DisplayName "WinRM HTTPS" -Enabled True -Profile Any -Action Allow -Direction Inbound -LocalPort 5986 -Protocol TCP
                $thumbprint = (New-SelfSignedCertificate -DnsName $env:COMPUTERNAME -CertStoreLocation Cert:\LocalMachine\My).Thumbprint
                $command = "winrm create winrm/config/Listener?Address=*+Transport=HTTPS @{Hostname=""$env:computername""; CertificateThumbprint=""$thumbprint""}"
                cmd.exe /C $command
            ```
        2.  For CRP VMs, you can use *RunCommands* from the portal with the *EnableRemotePS* script from the repository:<br>
4.  Once that is all done, you could connect remotely:
    1.  To connect to the VM ***from outside the VNET/Deployment***
          - For a classic VM:
            ```
                $Skip = New-PSSessionOption -SkipCACheck -SkipCNCheck
                Enter-PSSession -ComputerName  "<<CLOUDSERVICENAME.cloudapp.net>>" -port "<<PUBLIC PORT NUMBER>>" -Credential (Get-Credential) -useSSL -SessionOption $Skip
            ```
          - For an ARM machine:
            1.  First add a DNS name to the public IP address
                ```
                    $Skip = New-PSSessionOption -SkipCACheck -SkipCNCheck
                    Enter-PSSession -ComputerName "<<DNSname.DataCenter.cloudapp.azure.com>>" -port "<<PUBLIC PORT NUMBER>>" -Credential (Get-Credential) -useSSL -SessionOption $Skip
                ```
    2.  To connect to the VM ***from within the VNET/Deployment***
        ```
            $Skip = New-PSSessionOption -SkipCACheck -SkipCNCheck
            Enter-PSSession -ComputerName  "<<HOSTNAME>>" -port 5986 -Credential (Get-Credential) -useSSL -SessionOption $Skip
        ```
        **Or**
        ```
            $Skip = New-PSSessionOption -SkipCACheck -SkipCNCheck
            Enter-PSSession -ComputerName  "<<HOSTNAME>>" -port 5985 -Credential (Get-Credential) -SessionOption $Skip
        ```
        **Note:** @{SkipCaCheck=$True} variable prevents the need to import a certificate to the remote machine initiating the session.

#### <u>How to Invoke-Commands</u>

```
    Invoke-Command -ComputerName "<<COMPUTERNAME>" -ScriptBlock {"<<SCRIPT BLOCK>>"}
```
## LabBox
 https://aka.ms/LabBox

- For the purpose of training or following along with this TSG, you can use the following link to deploy a VM with this scenario built-in. This lab is not to be shared with customers.

  [![Click to Deploy](/.attachments/SME-Topics/Cant-RDP-SSH/ARMDeploy_Deploy-ARM-JSON-to-Azure.png)](https://labboxprod.azurewebsites.net/api/Labbox?url=https://supportability.visualstudio.com/azureiaasvm/_git/labbox?path=/sme/Connectivity/AccessviaRemotePowerShell.json)
  
## Reference

  - [Enter-PSSession](https://technet.microsoft.com/en-us/library/hh849707.aspx)


::: template /.templates/Processes/Knowledge-Management/RdpSsh-Feedback-Template.md
:::