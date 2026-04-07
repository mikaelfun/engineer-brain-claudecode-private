---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/DP Processes Guidelines and others/IdM (Account Managment & Sync)/Sync - Technical processes to collect information/Password Writeback Not Working"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDP%20Processes%20Guidelines%20and%20others%2FIdM%20(Account%20Managment%20%26%20Sync)%2FSync%20-%20Technical%20processes%20to%20collect%20information%2FPassword%20Writeback%20Not%20Working"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Password Writeback Not Working

## Steps

**1.** Get a non-admin test user (test@contoso.com) in Entra ID and ask them to perform SSPR using aka.ms/sspr.

**2.** Open CMD on the primary DC and run (attach the file in DTM):

```
ldifde -f c:\export.txt -r "(Userprincipalname=test@contoso.com)"
```

Confirm if the user has the attribute "adminCount" set to "1". If so, this is the reason why SSPR is failing.

**3.** Open PS on the primary DC and run (attach the file in DTM):

```powershell
get-addefaultdomainpasswordpolicy
```

**4.** Open PS on the primary DC and run (attach the file in DTM):

```
net user test /domain
```

**5.** Collect event viewer logs without any filter (attach the file in DTM):

- Do you see servicebus connectivity issues? Then, this points to a networking issue
- Do you see a restriction changing the password? Then, the DC is throwing an exception and the password cannot be changed

**6.** Open PS in both Connect Sync and Primary DC and run (take a screenshot):

```powershell
Get-ItemProperty -Path HKLM:\System\CurrentControlSet\Control\Lsa | select restrictremotesam
```

**7.** Open PS in the Primary DC and run (take a screenshot):

```powershell
Import-Module ActiveDirectory
Get-ADFineGrainedPasswordPolicy -Filter *
```

**8.** Open the affected object in the local AD -> Security -> Advanced -> Effective Access -> Select a user -> Select the AD Connector account -> View Effective Access

Confirm that the following attributes shows green:
- Reset password
- Change password
- Write permissions on lockoutTime
- Write permissions on pwdLastSet

**9.** Confirm if the object and all parent OUs has the inheritance enabled. Right click -> Properties -> Security -> Advanced (if you see "Enable inheritance" it's because inheritance is not enabled)

**10.** Open a web browser at AAD Connect server and navigate to these two URLs:

- https://ssprdedicatedsbprodscu.servicebus.windows.net/
- https://ssprdedicatedsbprodncu.servicebus.windows.net/

The following output must be displayed on both URLs:

```xml
<feed xmlns="http://www.w3.org/2005/Atom"><title type="text">Publicly Listed Services</title>...</feed>
```

**11.** At same server, open a PowerShell console and execute:

```powershell
Test-NetConnection -ComputerName ssprdedicatedsbprodscu.servicebus.windows.net -Port 443
Test-NetConnection -ComputerName ssprdedicatedsbprodncu.servicebus.windows.net -Port 443
```

TcpTestSucceeded should be True.

**12.** Execute a webrequest through PowerShell to the endpoints:

```powershell
Invoke-webrequest -Uri https://ssprdedicatedsbprodscu.servicebus.windows.net
Invoke-webrequest -Uri https://ssprdedicatedsbprodncu.servicebus.windows.net
```

**13.** Confirm if TLS 1.2 is properly enabled:

https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/reference-connect-tls-enforcement

**14.** Open the Wizard, disable Password-Writeback, configure Connect Sync. Run the wizard, enable Password-Writeback, configure Connect Sync.
