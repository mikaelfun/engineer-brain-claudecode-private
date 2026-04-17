---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/ADFS and WAP/ADFS - Delegated AD FS Powershell Commandlet"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FADFS%20and%20WAP%2FADFS%20-%20Delegated%20AD%20FS%20Powershell%20Commandlet"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.comm-adfs
- cw.adfs troubleshooting
- SCIM Identity
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   
[[_TOC_]] 


#Delegating AD FS Powershell Commandlet Access to Non-Admin Users

###Public Article Reference
[Delegate AD FS PowerShell commandlet access to nonadmin users | Microsoft Learn](https://learn.microsoft.com/en-us/windows-server/identity/ad-fs/operations/delegate-ad-fs-pshell-access)  
[Overview of Just Enough Administration (JEA) - PowerShell | Microsoft Learn](https://learn.microsoft.com/en-us/powershell/scripting/security/remoting/jea/overview?view=powershell-7.5)

#Internal 
By default, AD FS administration via PowerShell can only be accomplished by AD FS administrators. For many large organizations, this may not be a viable  
operational model when dealing with other personas such as a help desk
personnel.

With Just Enough Administration (JEA), customers can now delegate specific commandlets to different personnel groups.

A good example of this use case is allowing help desk personnel to query AD FS
account lockout status and reset account lockout state in AD FS once a user has
been vetted. In this case, the commandlets that would need to be delegated are:


-   Get-ADFSAccountActivity

-   Set-ADFSAccountActivity

-   Reset-ADFSAccountLockout  

We use this example in the rest of this document. However, one can customize
this to also allow delegation to set properties of relying parties and hand this
off to application owners within the organization.

##Create the required groups necessary to grant users permissions.

1.  Create a[Group Managed Service
    Account](https://docs.microsoft.com/en-us/windows-server/security/group-managed-service-accounts/group-managed-service-accounts-overview).
    The gMSA account is used to allow the JEA user to access network resources
    as other machines or web services. It provides a domain identity which can
    be used to authenticate against resources on any machine within the domain.
    The gMSA account is granted with the necessary administrative rights later
    in the setup. For this example, we call the account**gMSAjea**.

2.  Create an Active Directory group which can be populated with users that need
    to be granted the rights to the delegated commands. In this example, help
    desk personnel are granted permissions to read, update, and reset the ADFS
    lockout state. We refer to this group throughout the example
    as**JEAGroup**.


##Install the gMSA account on the ADFS Server

Create a service account which has administrative rights to the ADFS servers.  
This can be performed on the domain controller or remotely as long as the AD RSAT package is installed.  
The service account must be created in the same forest as the ADFS server. Modify the example values to the configuration of
your farm.

\# This command should only be run if this is the first time gMSA accounts are
enabled in the forest

```Powershell
Add-KdsRootKey -EffectiveTime ((get-date).addhours(-10))
```


![](/.attachments/AAD-Authentication/437286/add_kdsrootkey.png)



\# Run this on every node that you want to have JEA configured on

```Powershell
$adfsServer = Get-ADComputer ADFS1
```

![](/.attachments/AAD-Authentication/437286/adfsserver_getadcmputer.png)

\# Run targeted at domain controller

![](/.attachments/AAD-Authentication/437286/serviceconnect.png)
```Powershell
$serviceaccount = New-ADServiceAccount gMSAjea -DNSHostName 'fabrikam.tk' -PrincipalsAllowedToRetrieveManagedPassword $adfsServer passthru
```

Run this for every node
```Powershell
Add-ADComputerServiceAccount -Identity ADFS1 -ServiceAccount $ServiceAccount
```


![](/.attachments/AAD-Authentication/437286/add_adcomputerserviceaccount.png)

Install the gMSA account on the ADFS server. This needs to be run on every ADFS
node in the farm.
```Powershell
Install-ADServiceAccount 'gMSAjea$'
```

### Grant the gMSA Account admin rights

If the farm is using delegated administration, grant the gMSA Account admin rights by adding it to the existing group, which has delegated admin access.  
If the farm isn't using delegated administration, grant the gMSA account admin rights by making it the local administration group on all of the AD FS servers.
Make sure to add JEA GMSA Account in the Local Administrator Group in your ADFS Servers.  

### Create the JEA role file


We will now create a Folder called ADFSActivity under C:\\Program Files\\WindowsPowerShell\\Modules and couple of subfolders named
**RoleCapabilities** and **SessionConfiguration**.

![](/.attachments/AAD-Authentication/437286/rolecapa.png)

In a notepad,  save the PowerShell Configuration Role File with the following content as **ADFSActivity.psrc** in the **RoleCapabilities** subfolder.
```
@{
GUID = 'b35d3985-9063-4de5-81f8-241be1f56b52'
ModulesToImport = 'adfs'
VisibleCmdlets = 'Reset-AdfsAccountLockout', 'Get-ADFSAccountActivity', 'Set-ADFSAccountActivity'
}
````

  
##Create the JEA session configuration file
In **SessionConfiguration** subfolder create a faile **ADFSActivity.pssc** with the following content

```
@{
SchemaVersion = '2.0.0.0'
GUID = 'ffb4c0b2-f161-4ddc-a769-d2419b489170'
SessionType = 'RestrictedRemoteServer'
ModulesToImport = 'ADFSActivity'
GroupManagedServiceAccount = 'fabrikam\\gmsajea'
RoleDefinitions = \@{ 'fabrikam\\JEAGroup' = \@{ RoleCapabilities ='ADFSActivity' } }
}
```
## Install the JEA session configuration on the AD FS server
On the **AD FS** servers, we must register the session configuration:


```Powershell
Register-PSSessionConfiguration -Name 'ADFSActivity' -Path .\\ADFSActivity.pssc  -Force
```

![](/.attachments/AAD-Authentication/437286/registerpssession.png)

![](/.attachments/AAD-Authentication/437286/programfiles.png)

##Operational instructions

To use the delegated commands:
```Powershell
Enter-pssession -ComputerName 'ADFS1.fabrikam.tk' -ConfigurationName "ADFSActivity" -Credential <UserInJEAGroup>

Get-AdfsAccountActivity <user1@fabrikam.tk>
```
Make sure Verify WinRM service is listening for WS-Management Requests by running the command Winrm quickconfig

---
##Troubleshooting
---
