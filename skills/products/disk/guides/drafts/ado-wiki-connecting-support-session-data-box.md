---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Data Box/Management and How-To/Connecting to a Support Session on a Data Box Device"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Data%20Box%2FManagement%20and%20How-To%2FConnecting%20to%20a%20Support%20Session%20on%20a%20Data%20Box%20Device"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Connecting to a Support Session on a Data Box Device

## Overview
Step-by-step instructions on how to connect to a support session on a Data Box device. The procedure varies depending on the version of the Data Box device software.

## Determine the Data Box Version
Run the following Kusto Query to find the device version:
```kusto
cluster('ssemprod.kusto.windows.net').database('DataboxService').DeviceTelemetry
| where SerialNumber == "<serial>" and JobName == "<jobname>"
| where Data contains "DeviceFriendlySoftwareName"
| project PreciseTimeStamp, SerialNumber, Data
| take 5
```
Look for "DeviceFriendlySoftwareName:" in the "Data" column.

## Data Box 2.9 or Before
1. Open PowerShell:
   ```powershell
   set-item wsman:\localhost\Client\TrustedHosts <<ipv4_address_of_databox>>
   ```
2. Get password from Azure Portal:
   ```powershell
   $Pwd = ConvertTo-SecureString <password-from-Azure-portal> -AsPlainText -Force
   $Cred = New-Object System.Management.Automation.PSCredential("~\PodSupportAdmin", $Pwd)
   $podPs = new-PSSession -Computer <<ipv4_address_of_databox>> -ConfigurationName Minishell -Credential $Cred
   Invoke-Command -Session $podPs -ScriptBlock {Enable-HcsSupportAccess}
   Invoke-Command -Session $podPs -ScriptBlock {Get-HcsSupportAccessKey}
   ```
3. Refer to the **Decrypt Password** document.
4. Open another PowerShell window:
   ```powershell
   $Pwd = ConvertTo-SecureString <<PodDecryptedPwd_from_previous_step>> -AsPlainText -Force
   $Cred = New-Object System.Management.Automation.PSCredential("~\StorSimpleSupport", $Pwd)
   Enter-PSSession -Computer <<ipv4_address_of_databox>> -Credential $Cred -ConfigurationName SupportSession
   ```

## Data Box 3.0 to Data Box 4.0
1. Open PowerShell:
   ```powershell
   set-item wsman:\localhost\Client\TrustedHosts <<ipv4_address_of_databox>>
   ```
2. Get password from Azure Portal:
   ```powershell
   $Pwd = ConvertTo-SecureString <password-from-Azure-portal> -AsPlainText -Force
   $Cred = New-Object System.Management.Automation.PSCredential("~\StorSimpleAdmin", $Pwd)
   $podPs = new-PSSession -Computer <<ipv4_address_of_databox>> -ConfigurationName Minishell -Credential $Cred
   Invoke-Command -Session $podPs -ScriptBlock {Enable-HcsSupportAccess}
   Invoke-Command -Session $podPs -ScriptBlock {Get-HcsSupportAccessKey}
   ```
3. Refer to the **Decrypt Password** document.
4. Open another PowerShell window:
   ```powershell
   $Pwd = ConvertTo-SecureString <<PodDecryptedPwd_from_previous_step>> -AsPlainText -Force
   $Cred = New-Object System.Management.Automation.PSCredential("~\StorSimpleSupport", $Pwd)
   Enter-PSSession -Computer <<ipv4_address_of_databox>> -Credential $Cred -ConfigurationName SupportSession
   ```

## Data Box 4.1 or Later
- If customer consents to skip certificate check, skip to step 2 and use IP instead of hostname.

1. **Install Certificate on Host/Client**
   - Default certificates: Download from Azure Portal, add host file entry mapping IP to FQDN (`.microsoftdatabox.com`).
   - BYOC certificates: Install signing chain certificate in LocalMachine/Root, add host file entry.
   - Can also use IP of the Device instead of hostname.

2. **Enter MiniShell of the POD**
   ```powershell
   set-item wsman:\localhost\Client\TrustedHosts <<ipv4_address_of_databox>>
   $Pwd = ConvertTo-SecureString <password-from-Azure-portal> -AsPlainText -Force
   $Cred = New-Object System.Management.Automation.PSCredential("<<ipv4_address_of_databox>>\StorSimpleAdmin", $Pwd)
   $Sess = New-PSSession -Computer <DBXFQDNName.databox.microsoft.com> -ConfigurationName Minishell -Credential $Cred -UseSSL
   Invoke-Command -Session $Sess -ScriptBlock {Enable-HCSSupportAccess}
   ```
   - **Skip cert validation** (if customer consents):
     ```powershell
     $sessOptions = New-PSSessionOption -SkipCACheck -SkipCNCheck -SkipRevocationCheck
     $podPs = new-PSSession -Computer <<ipv4_address_of_databox>> -ConfigurationName Minishell -Credential $Cred -UseSSL -SessionOption $sessOptions
     Invoke-Command -Session $podPs -ScriptBlock {Enable-HcsSupportAccess}
     Invoke-Command -Session $podPs -ScriptBlock {Get-HcsSupportAccessKey}
     ```

3. Refer to https://hcssupport/ for decrypting the password.

4. Open another PowerShell window for support session:
   ```powershell
   $Pwd = ConvertTo-SecureString <<DecryptedPwd_from_previous_step>> -AsPlainText -Force
   $Cred = New-Object System.Management.Automation.PSCredential("<<ipv4_address_of_databox>>\StorSimpleSupport", $Pwd)
   Enter-PSSession -Computer <DBXFQDNName.databox.microsoft.com> -Credential $Cred -ConfigurationName SupportSession -UseSSL
   ```
