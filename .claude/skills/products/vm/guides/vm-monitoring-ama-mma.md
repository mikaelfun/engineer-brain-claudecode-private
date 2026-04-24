# VM AMA/MMA 监控代理 — 排查速查

**来源数**: 4 (AW, KB, ML, ON) | **条目**: 21 | **21V**: 19/21
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Customer cannot remove FixLinuxDiagnostic extension from Linux VM; removal command fails because the | The ARM relationship for the FixLinuxDiagnostic extension is broken, preventing  | First reinstall the extension to recreate the ARM relationship using one of thes | 🔵 7.5 | AW |
| 2 | Windows VM extension fails with '<command> is not recognized as an internal or external command, ope | The PATH system environment variable is misconfigured, or cmd.exe has preconfigu | 1) Open Command Prompt in the VM and reproduce the error to identify which comma | 🔵 7.5 | AW |
| 3 | Extension installation fails with 'the system cannot find the file specified, Code: 1007' or 'Failed | ComSpec environment variable changed from 'c:\windows\system32\cmd.exe' to anoth | Reset ComSpec: PowerShell [Environment]::SetEnvironmentVariable('ComSpec', 'c:\w | 🔵 7.5 | AW |
| 4 | VM deployment from Azure Compute Gallery image fails with VMMarketplaceInvalidInput: Creating a virt | Purchase Plan information is missing or incorrectly specified when deploying a V | Specify purchase plan information in the deployment template: add purchasePlan b | 🔵 7.5 | AW |
| 5 | When trying to view VM Screenshot in Boot Diagnostics, the following error might happen Failed to ge | There can be multiple causes to this issue: Virtual Machines with Operating Syst | Depending on the cause, you can try: Virtual Machines with Operating System Wind | 🔵 7 | KB |
| 6 | Azure custom VM image: timezone not set to China Standard Time; IPv6 not disabled; pagefile on D: te | Azure does not support custom unattend files beyond AdditionalUnattendContent (o | Use PowerShell DSC with RebootNodeIfNeeded=True: (1) Move pagefile+temp disk: Mo | 🔵 7 | ON |
| 7 | Genomics workflow fails with 'Unable to reach the storage account <account>. Make sure the name is c | Incorrect storage account name was specified in the workflow submission command | Copy the exact storage account name directly from the Access keys page of the st | 🔵 6.5 | AW |
| 8 | EnableVMAccess / Reset Password fails with 'The password does not meet the password policy requireme | Local or domain group policy on the VM sets 'Minimum password length' higher tha | Use a password of at least 14 characters (maximum configurable by policy) and en | 🔵 6.5 | AW |
| 9 | Reset password fails with 'The password does not meet the password policy requirements' via EnableVM | Local or domain password group policy on the VM requires minimum password length | Use a password with 14 characters (maximum configurable by Minimum password leng | 🔵 6.5 | AW |
| 10 | Unable to remove FixLinuxDiagnostic extension from Linux VM; ARM relationship is broken preventing s | The ARM relationship for the FixLinuxDiagnostic extension is corrupted or missin | Reinstall the extension first using Set-AzureRmVMExtension to recreate the ARM r | 🔵 6.5 | AW |
| 11 | Extension install fails on Windows VM with 'the system cannot find the file specified, Code: 1007' o | ComSpec environment variable changed from c:\windows\system32\cmd.exe to somethi | Set ComSpec back: [Environment]::SetEnvironmentVariable('ComSpec', 'c:\windows\s | 🔵 6.5 | AW |
| 12 | Azure Advisor no longer displays Potential yearly savings based on retail pricing aggregation on cos | By design change effective September 30 2024, Azure removed the aggregated yearl | Customers can calculate aggregated yearly savings manually: https://learn.micros | 🔵 6.5 | AW |
| 13 | Elastic SAN volume created from Managed Disk snapshot via PowerShell shows as not initialized. Issue | PowerShell command missing -CreationDataCreateSource DiskSnapshot switch. Withou | Add -CreationDataCreateSource DiskSnapshot parameter when creating Elastic SAN v | 🔵 6.5 | AW |
| 14 | AIB build fails with VMMarketplaceInvalidInput error when using Azure Compute Gallery custom image ( | ACG images with plan information (3rd party marketplace images like CIS) cannot  | Use the original marketplace image directly as source in the AIB template with a | 🔵 6.5 | AW |
| 15 | AIB build fails with VMMarketplaceInvalidInput when using CIS hardened or 3rd-party Marketplace imag | AIB does not support using ACG images that require plan information (3rd-party M | Use the original Marketplace image directly as the source in the AIB template (t | 🔵 6.5 | AW |
| 16 | Turbo boost CPU frequency information not displayed in Msv2/Mdsv2 series VMs. Commands turbostat and | By design. Msv2/Mdsv2 VMs are hosted on older Gen servers where Hyper-V does not | Inform customer this is expected behavior (by design). Turbo boost is enabled at | 🔵 6.5 | ON |
| 17 | SCVMM configures whether to use Winrm over http or https during the installation of the VMM Server.  | Configuration of the port to be used by VMM server to contact the Hyper-v nodes  | Run the command below on the hyper-V node to remove the winrm listener on HTTPS: | 🔵 6 | KB |
| 18 | Delayed Assignment in SBAManager/VDM ignores the scheduled time and immediately assigns the case to  | The 24x7 flag was not removed from the DFM case before setting up Delayed Assign | Before setting Delayed Assignment in SBAManager: (1) Open the case in DFM, (2) R | 🔵 5.5 | AW |
| 19 | After manually taking ownership of a case in DfM and meeting IR, the case gets reassigned to another | VDM/SBAManager Bot was not notified of the manual case assignment. VDM is unawar | After manually taking ownership in DfM and meeting IR, immediately tell the SBAM | 🔵 5.5 | AW |
| 20 | Cannot SSH to Azure Linux VM, syslog shows: Permissions 0777 for '/etc/ssh/sshKeyName' are too open  | The /etc/ssh configuration directory or files have incorrect permissions (e.g.,  | Restore correct permissions: chmod -R 644 /etc/ssh; chmod 600 /etc/ssh/ssh_host* | 🔵 5.5 | ML |
| 21 | Azure Linux CustomScript extension 2.0.5 reruns the previous command unexpectedly after auto-update | Bug in Microsoft.Azure.Extensions.CustomScript 2.0.5 extension causes previous c | Uninstall CustomScript extension to avoid rerun, or wait for auto-update to 2.0. | 🔵 5.5 | ML |

## 快速排查路径

1. **Customer cannot remove FixLinuxDiagnostic extension from Linux VM; removal comma**
   - 根因: The ARM relationship for the FixLinuxDiagnostic extension is broken, preventing direct removal via Remove-AzureRmVMExten
   - 方案: First reinstall the extension to recreate the ARM relationship using one of these commands: (1) Set-AzureRmVMExtension with the original GUID name and
   - `[🔵 7.5 | AW]`

2. **Windows VM extension fails with '<command> is not recognized as an internal or e**
   - 根因: The PATH system environment variable is misconfigured, or cmd.exe has preconfigured commands that interfere with extensi
   - 方案: 1) Open Command Prompt in the VM and reproduce the error to identify which command is failing. 2) Check if the PATH variable contains the required exe
   - `[🔵 7.5 | AW]`

3. **Extension installation fails with 'the system cannot find the file specified, Co**
   - 根因: ComSpec environment variable changed from 'c:\windows\system32\cmd.exe' to another value (e.g., Java/JDK path). Windows 
   - 方案: Reset ComSpec: PowerShell [Environment]::SetEnvironmentVariable('ComSpec', 'c:\windows\system32\cmd.exe', 'Machine'). Or CMD: SET ComSpec=c:\windows\s
   - `[🔵 7.5 | AW]`

4. **VM deployment from Azure Compute Gallery image fails with VMMarketplaceInvalidIn**
   - 根因: Purchase Plan information is missing or incorrectly specified when deploying a VM from an ACG image created from a third
   - 方案: Specify purchase plan information in the deployment template: add purchasePlan block with product, name, and publisher fields. Alternatively use Power
   - `[🔵 7.5 | AW]`

5. **When trying to view VM Screenshot in Boot Diagnostics, the following error might**
   - 根因: There can be multiple causes to this issue: Virtual Machines with Operating System Windows 2008 R2 (or older) don't prod
   - 方案: Depending on the cause, you can try: Virtual Machines with Operating System Windows 2008 R2 (or older) don't produce VM Health Report. --> There's no 
   - `[🔵 7 | KB]`

