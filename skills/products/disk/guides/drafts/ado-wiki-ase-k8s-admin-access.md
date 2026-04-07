---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Stack Edge/Kubernetes/Granting Kubernetes Admin Access on Azure Stack Edge"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Stack%20Edge%2FKubernetes%2FGranting%20Kubernetes%20Admin%20Access%20on%20Azure%20Stack%20Edge"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Granting Kubernetes Admin Access on Azure Stack Edge

**IMPORTANT**: Confirm with Engineering (raise IcM with DBE Container Compute Team) before proceeding.

## Method 1: Via File Explorer
1. Connect to ASE CLI via PowerShell (as Admin):
   ```powershell
   winrm quickconfig
   $ip = "<device_ip>"
   Set-Item WSMan:\localhost\Client\TrustedHosts $ip -Concatenate -Force
   Enter-PSSession -ComputerName $ip -Credential $ip\EdgeUser -ConfigurationName Minishell
   ```
2. Run `Enable-HcsSupportAccess` - copy the generated key
3. Decrypt key using Support Password Decrypter - this is the EdgeSupport password
4. In File Explorer: `\\<ASE_IP>\c$\ClusterStorage\HcsInternal\hcsInternal\.kube\config`
5. Login: Username=EdgeSupport, Password=decrypted key
6. Copy config file to customer's host

## Method 2: Via PowerShell
Steps 1-3 same as above, then:
4. New PowerShell as Admin: `net use \\<device_IP>\c$ /user:~\EdgeSupport`
5. `copy-item \\<ASE_IP>\c$\ClusterStorage\HcsInternal\hcsInternal\.kube\config -Destination <Host_Path>`

## Method 3: Via CMD
Steps 1-3 same as above, then:
4. CMD: `net use \\<ip>\c$\ClusterStorage\HcsInternal\hcsInternal\.kube <support password> /u:~\EdgeSupport`
5. Use Run.exe to navigate and copy config file
