---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Troubleshooting Guides/Getting Outlook Safe Senders"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=/Troubleshooting%20Guides/Getting%20Outlook%20Safe%20Senders"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Getting Outlook Safe Senders

## From Outlook Desktop
1. Click on Junk in the Outlook ribbon
2. Click on Junk E-Mail Options then the Safe Senders tab
3. Click Export to File and save as `<user>-TrustedSendersAndDomains.txt`

## PowerShell - On Premises
```powershell
$user = "<user>"
$ts = (Get-Date).ToUniversalTime().ToString("yyyyMMdd_HHmmss")
$data = Get-MailboxJunkEmailConfiguration -Identity $user
$data.TrustedSendersAndDomains > "$ts.$user-TrustedSendersAndDomains.txt"
```

## PowerShell - Exchange Online
```powershell
$user = "<user>"
$UserCredential = Get-Credential
$Session = New-PSSession -ConfigurationName Microsoft.Exchange -ConnectionUri https://outlook.office365.com/powershell-liveid/ -Credential $UserCredential -Authentication Basic -AllowRedirection
Import-PSSession $Session
$ts = (Get-Date).ToUniversalTime().ToString("yyyyMMdd_HHmmss")
$data = Get-MailboxJunkEmailConfiguration -Identity $user
$data.TrustedSendersAndDomains > "$ts.$user-TrustedSendersAndDomains.txt"
```
