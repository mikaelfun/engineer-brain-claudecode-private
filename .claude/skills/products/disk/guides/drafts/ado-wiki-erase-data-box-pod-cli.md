---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Data Box/Data Copy Service/How to Erase Data on Data Box Pod from CLI (PowerShell Support Session)"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Data%20Box%2FData%20Copy%20Service%2FHow%20to%20Erase%20Data%20on%20Data%20Box%20Pod%20from%20CLI%20(PowerShell%20Support%20Session)"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to Erase Data on Data Box Pod from CLI (PowerShell Support Session)

## Overview
This guide provides instructions on how to erase data on a Data Box Pod using the CLI (PowerShell support session). This is particularly useful when the customer is unable to run "prepare to ship" due to copy jobs being stuck in a paused state. The customer has already ingested the data into Azure using another method and now needs to ensure the data is erased due to encryption concerns.

## Common Issues and Solutions
### Issue
The copy job is stuck in a paused state and cannot be resumed or canceled from the Web UI, preventing the customer from completing the data erase or running "prepare to ship."

### Solution
Trigger a data erase from the support session using PowerShell commands.

## Cause
When a copy job via the Data Copy Service is stuck in a paused state, you are unable to trigger a device reset or run "prepare to ship" from the Web UI.

## Step-by-Step Instructions

### Step 1: Trigger Data Erase from the Support Session

1. **Enter Mini Shell**
   - **Note:** `<Customer Password>` is the UI password.
   - **Note:** If #3 and `-UseSSL -SessionOption $sessOptions` are not run, you might encounter the following error:
     ```
     Connecting to remote server failed with the following error message: The WinRM client cannot process the request. Default authentication may be used with an IP address under the following conditions: the transport is HTTPS or the destination is in the TrustedHosts list, and explicit credentials are provided. Use winrm.cmd to configure TrustedHosts. Note that computers in the TrustedHosts list might not be authenticated.
     ```
   - Run the following PowerShell commands:
     ```powershell
     $Pwd = ConvertTo-SecureString <Customer Password> -AsPlainText -Force
     $Cred = New-Object System.Management.Automation.PSCredential("~\StorSimpleAdmin", $Pwd)
     $sessOptions = New-PSSessionOption -SkipCACheck -SkipCNCheck -SkipRevocationCheck
     $ps = New-PSSession -Computer <databox IP> -ConfigurationName Minishell -Credential $Cred -UseSSL -SessionOption $sessOptions
     Enter-PSSession $ps
     ```

2. **Enter Support Session**
   - Enable support access:
     ```powershell
     Enable-HcsSupportAccess
     ```
   - If the string is cut off, use:
     ```powershell
     $pass = Enable-HcsSupportAccess
     $pass.encryptedpassword
     ```

3. **Decrypt Password Using ACIS Tool**
   - **Note:** To decrypt password you can use: [HCS Decryption Tool (Requires MSFT VPN)](https://hcssupport/)
   - Open a new PowerShell window and run the following commands:
     ```powershell
     $Pwd = ConvertTo-SecureString <Decrypted Password> -AsPlainText -Force
     $Cred = New-Object System.Management.Automation.PSCredential("DataboxIP\StorSimpleSupport", $Pwd)
     $sessOptions = New-PSSessionOption -SkipCACheck -SkipCNCheck -SkipRevocationCheck
     $ps = New-PSSession -Computer <databox IP> -ConfigurationName Minishell -Credential $Cred -UseSSL -SessionOption $sessOptions
     Enter-PSSession $ps
     ```

4. **Start Data Erase**
   - Run the following command:
     ```powershell
     $Pwd = ConvertTo-SecureString <Customer Password> -AsPlainText -Force
     Start-PodReprovision -OOBEPassword $Pwd
     ```

By following these steps, you should be able to erase the data on the Data Box Pod even if the copy job is stuck in a paused state.
