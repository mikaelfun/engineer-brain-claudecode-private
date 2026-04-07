---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Stack Edge/Manage Device/Elevated Support Session"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Stack%20Edge%2FManage%20Device%2FElevated%20Support%20Session"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Entering a Support Session on Azure Data Box Gateway & Azure Stack Edge

## Steps
1. Connect via PowerShell (as Admin):
   ```powershell
   winrm quickconfig
   $ip = "<device_ip>"
   Set-Item WSMan:\localhost\Client\TrustedHosts $ip -Concatenate -Force
   Enter-PSSession -ComputerName $ip -Credential $ip\EdgeUser -ConfigurationName Minishell
   ```
2. Run `Enable-HcsSupportAccess` - copy the generated key
3. Decrypt key using Support Password Decrypter
4. Close the PowerShell window
5. New session: `Enter-PSSession -ComputerName $ip -Credential $ip\EdgeSupport -ConfigurationName SupportSession`
   (Set `$ip` variable again in new session)
6. Enter decrypted support password when prompted
7. Success: you will see the support session prompt
