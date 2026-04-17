---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Sandbox/PCY or Region Specific Process Information Content/STA-EEE Corner/Centennial/Domain Join Failure"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/609257"
importDate: "2026-04-06"
type: troubleshooting-guide
---

#### Most common reasons for domain join failures
- Account is MFA enabled
- Wrong Username or Password
- Account does not have permissions to join domain
- Wrong DNS servers in vNET
- Account is not member of AADDS (AAD DS only)
- User did not change password (AAD DS only)


### Identify why domain join failed

#### Option 1 - ASC

- Go to [ASC](https://azuresupportcenter.msftcloudes.com) and enter case number
- Go to Resource Explorer -> Switch to Resource Provider View -> Expand Microsoft.Compute -> select VM that failed to join domain
- Select Extensions
- Expand joindomain and will see failure reason 

#### Option 2 - Collect Logs

- Collect [Inspect IaaS](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/464548/WVD-Logs-and-Traces#inspect-iaas) or [WVD Collect](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/464548/WVD-Logs-and-Traces#wvd-collect-powershell-script)
- Review NetSetup.LOG which is the domain join log

#### Option 3 - PowerShell

- Ask customer to run following commands in PowerShell
   ```
   Install-Module Az.Compute -Scope CurrentUser
   ```
   ```
   Connect-AzAccount -subscription <subscription id>        
   ```
   ```
   Get-AzVM -ResourceGroupName <RG of the host pool> -VMName <VM that failed to join the domain> -Status
   ```

<br/>

---

Once have identified why domain join failed can use following troubleshooting steps:

---

<br/>

### Troubleshooting

#### Determine if customer is hitting an issue already documented on the [AVD troubleshooting docs](https://docs.microsoft.com/en-us/azure/virtual-desktop/troubleshoot-set-up-issues#error-your-deployment-failedhostnamejoindomain)

## Confirm the account is not MFA enabled
1. Login to ASC -> go to Tenant Explorer
1. Select User -> enter user account -> click Run
1. Select User MFA Settings. Is says enabled tell customer to disable MFA on account then try again

#### Confirm the credentials are correct
- If credentials are incorrect will see 4625 events in Security Log.
- Collect [Inspect IaaS](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/464548/WVD-Logs-and-Traces#inspect-iaas) or [WVD Collect](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/464548/WVD-Logs-and-Traces#wvd-collect-powershell-script) on DC and/or VM -> filter for event 4625
- Another option is ask customer to RDP into VM and try to join to domain manually

#### Confirm the account has permissions to join computer to domain. 
- Ask customer what groups account is member of in AD Users and Computers
- If user is not member of Domain Admins or Administrators groups then need to confirm account has been delegated permissions to join computers to domain.
- By default computer objects are created in Computers OU when joined to domain
- However customer may have specified specific OU in template by selecting Yes to "Specify domain or unit"
   - In AD Users and Computers right click on OU where computer object will be created -> Properties -> Security Tab -> Advanced -> Confirm the account has following permissions on OU
- If doesn't have correct permissions then grant correct permissions to join computer to domain

#### Confirm Distinguished name is entered in correct format
- customer may have specified specific OU in template by selecting Yes to "Specify domain or unit"
- OU path is the distinguished name of OU
- To get distinguished name of OU enable Advanced features in AD Users and Computers > Right click on OU -> Properties -> Attribute Editor -> Double click distinguishedName

#### Confirm the DNS settings on the vNET
- Ask customer what the IP's of their domain controllers are
- In ASC go to Resource Explorer -> Switch to Resource Provider View -> Expand Microsoft.Compute -> select VM that failed to join domain
- Scroll down and click the link next to Virtual Network
- Confirm with customer the DNS servers are correct
- If DNS server(s) are wrong tell customer needs to [update](https://docs.microsoft.com/en-us/azure/virtual-network/manage-virtual-network#change-dns-servers)

#### Collaboration Request
- If need further assistance with domain join issue open a collaboration task
   - On-prem domain join: `Windows\Windows 10\Windows 10 Enterprise multi-session\Active Directory\On-premises Active Directory domain join`
   - Azure Active Directory Domain Join: `Windows\Windows 10\Windows 10 Enterprise multi-session\Active Directory\Active Directory\Azure Active Directory (AAD) join issues`
   - Azure Active Directory Domain Services domain join: `Azure\Azure Active Directory Domain Services (VM  Domain Controllers)\Azure AD Domain Services\User sign-in-domain join issues`
