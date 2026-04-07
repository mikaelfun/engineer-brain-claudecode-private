---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra Global Secure Access (ZTNA)/Internal Docs/Global Secure Access - NRPT issues"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20Global%20Secure%20Access%20%28ZTNA%29%2FInternal%20Docs%2FGlobal%20Secure%20Access%20-%20NRPT%20issues"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.comm-hybauth
- SCIM Identity
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

The�**Name Resolution Policy Table (NRPT)**�is a feature in Windows operating systems that allows administrators to define rules for DNS name resolution. The Global Secure Access client for Windows uses NRPT for the [Private DNS feature](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1551602/Private-DNS-Support-for-GSA).

This article does not include any details about the purpose and configuration of Private DNS. In case it's necessary, please read it in the article referenced before.

# Private DNS

In Advanced Diagnostics Private DNS rules appear, if Private DNS is enabled and the profile was successfully retrieved.

![image.png](/.attachments/image-0dd2cf0a-3b78-4411-8365-19ee1ae6754c.png)

# Health check for "NRPT rules set"

It helps to detect NRPT related issues (In some cases, the result may be misleading and could indicate an error even if the feature is functioning correctly. Therefore, it's crucial to distinguish between a genuine issue and a problem with the health check.). The check only appears, if Private DNS is enabled and the profile was successfully retrieved.

![image.png](/.attachments/image-291ed7e1-6003-445c-bc24-6e53728a608a.png)

# Health check for "NRPT rules set" reports False

Why is the result of the check is False?

**1. DNS suffix search list is not configured correctly**

**2. The NRPT policies are not configured**

**3. The output of `netsh namespace show policy` is empty**

**4. NRPT check fails on a computer with non-English language setting**

**5. Sign out does not clear the NRPT configuration added by the GSA client**

Important: The GSA client configures the settings on the client, no manual intervention is required.

# Troubleshooting

**1. DNS suffix search list is not configured correctly**

The single label suffix must be added to the DNS suffix search list. To verify this, please run `IPCONFIG /ALL`.

![image.png](/.attachments/image-bb078be6-1c6a-4dac-b46c-bb076dc90803.png)

If this suffix is missing from the DNS Suffix Search List, disable the GSA Client, start the data collection using the **Advanced log collection** and [Process Monitor - Sysinternals | Microsoft Learn](https://learn.microsoft.com/en-us/sysinternals/downloads/procmon), while you enable the GSA client. Check the data and define the next steps.

**2. The NRPT policies are not configured**

The GSA NRPT policies are created based on the Private DNS rules under `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\Dnscache\Parameters\DnsPolicyConfig\`. It generates an error, if all or any of them is missing from the registry.

If the entries are missing under the registry key above, disable the GSA Client, start the data collection using the **Advanced log collection** and [Process Monitor - Sysinternals | Microsoft Learn](https://learn.microsoft.com/en-us/sysinternals/downloads/procmon), while you enable the GSA client. Check the data and define the next steps.

**3. The output of `netsh namespace show policy` shows no policies (empty)**

This may happen, even if the registry entries do exist under `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\Dnscache\Parameters\DnsPolicyConfig\`. In this case, please check, if the regkey `HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Windows NT\DNSClient\DnsPolicyConfig` does exist without any subentries. 

If yes, please take the following test: 

+ If the computer is domain joined, please ensure that it's connected to the corpnet and Domain Controller(s) are in line of sight. (This can be validated using the command: `nltest /sc_query:<domain_name>`)
+ Delete the regkey _DnsPolicyConfig_ (`HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Windows NT\DNSClient\`)
+ run gpupdate /force from a command line (you can skip it, if the computer is not domain joined)
+ Wait a bit and if the registry key does not reappear, please disable and enable the GSA client and check, if the issue is resolved.

If the computer is Domain Joined and the registry key reappear, please take the next steps:
 
Info: This happens because of a malformed GPO that applies empty NRPT settings. Details [here](https://internal.evergreen.microsoft.com/en-us/topic/net-local-nrpt-rules-are-not-applied-ad-group-policy-creating-key-dnspolicyconfig-ce0714d9-819f-f3fa-c8e2-e8c8c8dd4735).

a) Sign in to one of the Domain Controllers in the domain that the affected computer is member of

b) Run the PowerShell script below:

```
# =========================================================================
# THIS CODE-SAMPLE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EITHER 
# EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES 
# OF MERCHANTABILITY AND/OR FITNESS FOR A PARTICULAR PURPOSE.
#
# This sample is not supported under any Microsoft standard support program 
# or service. The code sample is provided AS IS without warranty of any kind. 
# Microsoft further disclaims all implied warranties including, without 
# limitation, any implied warranties of merchantability or of fitness for a 
# particular purpose. The entire risk arising out of the use or performance
# of the sample and documentation remains with you. In no event shall 
# Microsoft, its authors, or anyone else involved in the creation, 
# production, or delivery of the script be liable for any damages whatsoever 
# (including, without limitation, damages for loss of business profits, 
# business interruption, loss of business information, or other pecuniary 
# loss) arising out of  the use of or inability to use the sample or 
# documentation, even if Microsoft has been advised of the possibility of 
# such damages.
#=========================================================================
# This script helps identifying Group Policies managing DNS NRPT rules and
# Group Policies containing an incorrect DnsPolicyConfig setting.

Cls

# Retrieving the SYSVOL path

$dnsSettings = Get-DnsClientGlobalSetting
$primaryDnsSuffix = $dnsSettings.SuffixSearchList[0]
$sysvolPath = "\\$primaryDnsSuffix\sysvol\$primaryDnsSuffix"

# Define the initial search string

$searchString = "dnspolicyconfig"

# Define file names to search

$fileName = "registry.pol"

$files = Get-ChildItem -Path $sysvolPath -Recurse -Filter $fileName -File

# Array to store paths of files that contain the search string

$matchingFiles = @()
$matchingFiles2 = @()

# Loop through each file and check if it contains the search strings

foreach ($file in $files) {
    try {
        $content = Get-Content -Path $file.FullName -Encoding Unicode
        if ($content -like "*$searchString*") {
            if ($content -like "*$searchString\*") {
                $matchingFiles2 += $file.FullName
            } else {
                $matchingFiles += $file.FullName
            }
        }
    } catch {
        Write-Host "Failed to read file $($file.FullName): $_"
    }
}

# Display results

Write-Host "Searchstring: '$searchString'"

if ($matchingFiles.Count -eq 0 -and $matchingFiles2.Count -eq 0) {
    Write-Host "No policy files containing the search strings were found on '$sysvolPath'."
} else {
    if ($matchingFiles.Count -ne 0) {
        Write-Host "Policy files containing empty DnsPolicyConfig on '$sysvolPath':"
        $matchingFiles | ForEach-Object { Write-Host $_ }
        Write-Host ""
    }
    if ($matchingFiles2.Count -ne 0) {
        Write-Host "Policy files containing real NRPT configuration on '$sysvolPath':"
        $matchingFiles2 | ForEach-Object { Write-Host $_ }
    }
}
```

c) If you encounter the message 'No policy files containing the search strings were found,' it indicates that the script was either run on the incorrect computer or the issue you are troubleshooting does not pertain to this problem.

d) In the output, you should see the path of one or more�`Registry.pol`�files under 'Policy files containing empty DnsPolicyConfig on ...'. If you only see 'Policy files containing real NRPT configuration on ...', please proceed to step l).

Example:
![image.png](/.attachments/image-e5605878-e870-42d8-ba75-74c8c1972c03.png)

e) Although we don't anticipate any issues, please proceed by taking a backup of the GPOs. [Backup and restore Group Policy in Windows | Microsoft Learn](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/group-policy/group-policy-backup-restore)

f) Run the Powershell cmds below by replacing the GUIDs from the policy path for all the GUIDs (one by one!). 

```
Set-GPRegistryValue -Guid "{GUID}" -Key "HKLM\SOFTWARE\Policies\Microsoft\Windows NT\DNSClient\DnsPolicyConfig" -ValueName "Test" -Type DWORD -Value 0

Remove-GPRegistryValue -Guid "{GUID}" -Key "HKLM\SOFTWARE\Policies\Microsoft\Windows NT\DNSClient\DnsPolicyConfig"
```
g) Wait until the change is replicated to all of the Domain Controllers.

h) On the client (connected to the corporate network) execute **gpupdate /force**.

i) Verify that the empty regkey _DnsPolicyConfig_ (`HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Windows NT\DNSClient\`) does not exist anymore.

j) Disable and enable the GSA Client.

k) Double check the Health Check.

l) If you only see 'Policy files containing real NRPT configuration on ...', please check the policies in the GPMC (Group Policy Management Console). Only focus on the policies, which apply to the affected computers.

If the NRPT section contains rules, confirm whether you still need them. If you don't need the rules, delete them. If you do need the rules and apply the GPO on a device with the Global Secure Access client, the private DNS option won't work 

**Important:** If you need assistance with managing Group Policy actions, please collaborate with the Directory Services support team. For DNS NRPT-related questions, please contact the on-premises Networking Team.

**4. NRPT check fails on a computer with non-English language setting**

In this case Private DNS works correctly, the single label suffix is added to the DNS suffix search list, `netsh namespace show policy` shows the policies, independent from this the check fails.

Please add the case Id to the work item.

Work item: https://identitydivision.visualstudio.com/Engineering/_workitems/edit/3099172

**5. Sign out does not clear the NRPT configuration added by the GSA client**

Signing out from the GSA client does not clear the NRPT configuration added by the GSA client. This can cause unexpected behaviors, as DNS traffic cannot be forwarded through GSA after sign-out, leading to failures in accessing destinations with publicly resolvable names, such as AD FS

Please add the case Id to the work item.

Work item: https://identitydivision.visualstudio.com/Engineering/_workitems/edit/3180409

# Data Analysis

In case you require help with the data analysis, please reach out to us over the AVA channel below.

If you have any feedback on this article or you need assistance, please contact us over [Cloud Identity - Authentication | Global Secure Access (ZTNA) | Microsoft Teams](https://teams.microsoft.com/l/channel/19%3A3b8ba43678fb47a9bf82e03512c34423%40thread.skype/Global%20Secure%20Access%20(ZTNA)?groupId=0f0f4ddf-6429-4dfe-83d2-1a28cb88fadd&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47) or send  a [request / feedback](https://forms.microsoft.com/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbR36COL1ZDnJAnLWpaiURTuNUOFBNNFcwNUJDU1hQNkVDQzNON0VSMzY1Ti4u) to the Hybrid Authentication Experiences Community.
