---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/DP Processes Guidelines and others/IdM (Account Managment & Sync)/Sync - Technical processes to collect information/User attributes not syncing from AD to Entra ID via Connect Sync"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDP%20Processes%20Guidelines%20and%20others%2FIdM%20(Account%20Managment%20%26%20Sync)%2FSync%20-%20Technical%20processes%20to%20collect%20information%2FUser%20attributes%20not%20syncing%20from%20AD%20to%20Entra%20ID%20via%20Connect%20Sync"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# User Attributes Not Syncing from AD to Entra ID via Connect Sync

For directory extension attribute sync issues, see the section at the end.

## Steps

**1.** Confirm Connect Sync supported version (2.2.1.0 or later)

**2.** Confirm that you see delta sync cycles running and you don't see any "no-start-ma" or "stopped-deletion-threshold-exceeded" on Connect Sync:

- "no-start-ma": https://learn.microsoft.com/en-us/troubleshoot/azure/entra/entra-id/user-prov-sync/troubleshoot-aad-connect-objects-attributes#connectivity-with-ad
- "stopped-deletion-threshold-exceeded": https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/how-to-connect-sync-feature-prevent-accidental-deletes

**3.** Collect an ldifde of the object

```
ldifde -f c:\export.txt -r "(Userprincipalname=user@contoso.com)"
```

Investigate the ldifde file:
- Check if "msExchRecipientTypeDetails" is set to "2". If so, the object is a linked mailbox and we do not support syncing linked mailboxes.

**4.** Collect Connect Sync properties:
Open the wizard -> Configure -> Troubleshoot -> Launch -> 3 -> Attach the file in DTM

**5.** Make a change in the object in AD -> Run a delta synchronization via PS -> Look for the import from the on-premises connector -> Do you see the update there?

Look for the export for the cloud connector -> Do you see the update there?

**6.** Open the Metaverse search -> Search the user by the UPN:

Open the object (Metaverse) -> Open the on-premises connector -> Do you see the imported attribute there? If so:
Open the object (Metaverse) -> Do you see the imported attribute there? If so:
Open the object (Metaverse) -> Open the cloud connector -> Do you see the attribute there?

- If not, do you see any Export error on the top?
- If so, which is the error?

**7.** If the customer has "mail" defined as the joining attribute, confirm that the user has the mail set in AD on the non-syncing object.

Ref: https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/how-to-connect-install-custom#select-how-users-should-be-identified-in-your-on-premises-directories

**8.** If all the previous steps didn't guide you to a solution, collect the following information using ADSyncTools:

```powershell
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Install-Module -Name ADSyncTools
Get-module ADSyncTools
```

Run these 3 cmdlets for each source (Metaverse, cloud connector, on-prem connector):

```powershell
# Information from the MV:
Export-ADSyncToolsObjects -ObjectId '<objectId>' -Source Metaverse

# Information from the Cloud CS:
Export-ADSyncToolsObjects -DistinguishedName 'CN={...}' -ConnectorName 'tenant.onmicrosoft.com - AAD'

# Information from the On-prem CS:
Export-ADSyncToolsObjects -DistinguishedName 'CN=User,OU=...,DC=contoso,DC=com' -ConnectorName 'contoso.com'
```

Ref: https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/reference-connect-adsynctools#export-adsynctoolsobjects

## Directory Extension Attributes Troubleshooting

1. Is the attribute not synchronized OR not visible via PowerShell? To confirm:

```powershell
Connect-MgGraph -Scopes "User.Read.All","Group.ReadWrite.All"
(Get-MgUser -UserId user@contoso.com -Property extension_<appId>_<attrName>).AdditionalProperties
```

- If you see the value there, there is nothing wrong with the synchronization
- If you don't see the value there:
  - Confirm the customer configured the Extension Property in Connect Sync
  - Confirm that you don't have an export error on the user (Steps 2, 3, and 6)
