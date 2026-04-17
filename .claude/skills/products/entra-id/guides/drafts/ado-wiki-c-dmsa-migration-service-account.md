---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AD Changes in Windows Server 2025 and Windows 11 24H2/dMSA - Delegated Managed Service Account/Migration of an existing service account to dMSA"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAD%20Changes%20in%20Windows%20Server%202025%20and%20Windows%2011%2024H2%2FdMSA%20-%20Delegated%20Managed%20Service%20Account%2FMigration%20of%20an%20existing%20service%20account%20to%20dMSA"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1541938&Instance=1541938&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1541938&Instance=1541938&Feedback=2)

___
<div id='cssfeedback-end'></div>

#Migrate a service account to dMSA
A delegated Managed Service Account (dMSA) is an Active Directory (AD) account that enables secure management of credentials. Unlike traditional service accounts, dMSAs don't require manual management of passwords as AD automatically manages the password, ensuring that it remains secure. Additionally, dMSAs can be delegated specific permissions to access resources in the domain, providing an efficient way to manage access control. Setting up a dMSA is currently only available in Windows Server Preview

In this section you would learn on how to migrate a service account to a dMSA account 

##**Pre-Reqs:** <br>

Following the steps below you would be able to setup a dMSA account in your lab: 

(At this moment Windows Server 2025 and Windows 11 24H2 is a preview build.  You can download the latest ISO's from the below location)
(When Windows Server 2025 and Windows11 24H2 becomes GA (General availability) you can download the ISO's or VHDX from MSDN and install the required information)  
 
 **Location:** \\\winbuilds\release\rs_prerelease <br>
**Server build**: \\\winbuilds\release\rs_prerelease\27639.1000.240607-1427\amd64fre\vhdx\vhdx_server_serverdatacenter_en-us <br>
**Client build**: \\\winbuilds\release\rs_prerelease\27639.1000.240607-1427\amd64fre\vhdx\vhdx_client_enterprise_en-us_vl <br>


##**Machine requirements** 

1. Windows Server 2025 domain controller 
2. Windows11 24H2 client machine or a Windows Server 2025 domain joined machine


**Steps to create a service account and configure as a service:**
(The below steps we are preparing the environment to have a service account) 

1. You can use an existing service account or create a new service account with the command below.
This command would create a User account in active directory with the name "FinAppService" 

```
New-ADUser -Name "FinAppService" -SamAccountName "FinAppService" -UserPrincipalName "FinAppService@contoso.com" -Path "CN=Users,DC=contoso,DC=com" -AccountPassword(Read-Host -AsSecureString "Input Password") -Enabled $true
```

2. Lets setup an SPN (Service Principal name) for the service account that we created

```
Set-ADUser -Identity FinAppService -ServicePrincipalNames @{Add='HTTP/FinAppService.contoso.com'}
```
3. Sign-In to Windows11 - 24H2 machine and open services, search for the service SNMP Trap service and double click on the service and go to the Log On tab

![image.png](/.attachments/image-fbf0a1bb-c382-4885-b856-bb6721359f9c.png =800x450)

![image.png](/.attachments/image-c7e42982-b354-441f-819a-1c4622967da2.png =350x400)

4.  Select "This account" and click on Browse.  Search for the FinAppService Account 

![image.png](/.attachments/image-e696f76a-cb58-4fac-8f45-95a47b52733e.png =500x400)

5. Input the password that you used to create the service account and click OK

![image.png](/.attachments/image-44efa3d3-9fb2-49bc-9a45-ac846190c9f1.png =350x400)

6. Start the service



**Windows Server 2025 Domain Controller:**

1. Open an elevated Powershell commandlet and run the below command:
(This below step has to be performed only configuring the KDSRoot key for the first time.  You do not need to follow the steps if KdsRootkey is already created)

```
Get-KdsRootKey
```

If the output comes up as blank then the environment is not setup with a KdsRootKey
(This steps is also performed when you are creating a gMSA account in the environment)

If you do not get an output then proceed running the below command. 

```
Add-KdsRootKey EffectiveTime ((get-date).addhours(-10))
```

2. Create a new dMSA account : Account name that we are creating is called dMSASnmp
```
New-ADServiceAccount -CreateDelegatedServiceAccount -KerberosEncryptionType AES256 -Name dMSAFinApp -DNSHostName dMSAFinApp.contoso.com
```

**Default location of the dMSA account in Active Directory**
- Open adsiedit.msc
- Connect to domain partition
- Browse to CN=Managed Service Accounts and you would find the new dMSA account that we just created

![image.png](/.attachments/image-f73872a4-8f1b-4d6a-adf6-0eb142007d60.png =800x350)

3. Lets start the migration process of the service account

```
Start-ADServiceAccountMigration -Identity dMSAFinApp -SupersededAccount "CN=FinAppService,CN=Users,DC=contoso,DC=com"
```
**The start of the migration would be documented in the Directory services event logs.** 

```
Log Name:      Directory Service
Source:        Microsoft-Windows-ActiveDirectory_DomainService
Date:          6/19/2024 7:54:00 AM
Event ID:      3085
Task Category: Security
Level:         Information
Keywords:      Classic
User:          CONTOSO\Administrator
Computer:      DCA.contoso.com
Description:
A Delegated Managed Service Account Migration Operation Succeeded. 
 
Operation:
START-MIGRATION 
RequestedBy:
CONTOSO\Administrator 
ErrorCode:
0 
ErrorMessage:
No Error.
 
ServiceAccount:
CN=FinAppService,CN=Users,DC=contoso,DC=com 
ServiceAccountOriginalState:
0 
 
DMSAAccount:
CN=dMSAFinApp,CN=Managed Service Accounts,DC=contoso,DC=com 
DMSAAccountOriginalState:
0
```


4. Assign permissions to the Client machine to retrieve password

```
Set-ADServiceAccount -Identity dMSAFinApp -PrincipalsAllowedToRetrieveManagedPassword Client$
```

5. Verify if the  PrincipalsAllowedToRetrieveManagedPassword is updated on the dMSA account

```
Get-ADServiceAccount -Identity dMSAFinApp -Properties PrincipalsAllowedToRetrievemanagedPassword
```

**Output:**

```
PS C:\> Get-ADServiceAccount -Identity dMSAFinApp -Properties PrincipalsAllowedToRetrievemanagedPassword


DistinguishedName                          : CN=dMSAFinApp,CN=Managed Service Accounts,DC=contoso,DC=com
Enabled                                    : True
Name                                       : dMSAFinApp
ObjectClass                                : msDS-DelegatedManagedServiceAccount
ObjectGUID                                 : 4c7969db-66e0-4215-b867-0b85069d2430
PrincipalsAllowedToRetrieveManagedPassword : {CN=CLIENT,CN=Computers,DC=contoso,DC=com}
SamAccountName                             : dMSAFinApp$
SID                                        : S-1-5-21-292515003-2047763813-3813526205-1112
UserPrincipalName                          :
```

6. Using LDP.exe, connect & authenticate to the domain partition.  Validate the below attributes. 

![image.png](/.attachments/image-3a5943d1-cb26-4db7-b72b-23ae9fa781ee.png =600x300)

##Client configuration Windows11 24H2 or Windows Server 2025 machine

1. Sign-In to the client machine or the server

2. Configure the registry key: (Copy paste the below into an elevated command prompt)

```
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System\Kerberos\Parameters" /v "DelegatedMSAEnabled" /t REG_DWORD /d 1 /f
```

3. Enable Kerberos event logging on the client machine

- Open event viewer
- Applications and Services Logs
- Microsoft\Windows\Security-Kerberos
- Right click on operational and click on enable


4. Restart the SNMP trap service Or sometimes you would also need to restart the server and then restart the service

```
restart-Service -Name SNMPTrap 
```

10. Review the events in the Kerbers-Client:

- Open event viewer
- Applications and Services Logs
- Microsoft\Windows\Security-Kerberos
- Right click on operational and click on enable

**Review the events:** 

```
Log Name:      Microsoft-Windows-Kerberos/Operational
Source:        Microsoft-Windows-Security-Kerberos
Date:          6/10/2024 5:28:56 PM
Event ID:      308
Task Category: None
Level:         Information
Keywords:      
User:          CONTOSO\FinAppSvc
Computer:      Client.contoso.com
Description:
Adding machine to the Principals Allowed Managed Password attribute of a DMSA
DC Used: \\DCA
DMSA Distinguished Name: CN=dMSAFinApp,CN=Managed Service Accounts,DC=contoso,DC=com
Linked Account: FinAppSvc
Domain Name:  CONTOSO.COM
Previously Authorized: true
Status: 0x0
```

```
Log Name:      Microsoft-Windows-Kerberos/Operational
Source:        Microsoft-Windows-Security-Kerberos
Date:          6/10/2024 5:28:56 PM
Event ID:      307
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      Client2.contoso.com
Description:
The Kerberos client has discovered a DMSA migration
Old Account Name: FinAppSvc
New Account Name: dMSAFinApp$
Domain Name: CONTOSO.COM
Status: 0x0
Migration Complete: false
```


11. Complete the service account migration

```
Complete-ADServiceAccountMigration Identity dMSAFinApp SupersededAccount "CN=FinApp Service Account,CN=Users,DC=contoso,DC=com"
```

**Event logs for completion of the migration in Directory services event logs**

```
Log Name:      Directory Service
Source:        Microsoft-Windows-ActiveDirectory_DomainService
Date:          6/20/2024 1:06:42 AM
Event ID:      3085
Task Category: Security
Level:         Information
Keywords:      Classic
User:          CONTOSO\Administrator
Computer:      DCA.contoso.com
Description:
A Delegated Managed Service Account Migration Operation Succeeded. 
 
Operation:
COMPLETE-MIGRATION 
RequestedBy:
CONTOSO\Administrator 
ErrorCode:
0 
ErrorMessage:
No Error.
 
ServiceAccount:
CN=FinAppService,CN=Users,DC=contoso,DC=com 
ServiceAccountOriginalState:
1 
 
DMSAAccount:
CN=dMSAFinApp,CN=Managed Service Accounts,DC=contoso,DC=com 
DMSAAccountOriginalState:
1
```


**Using LDP.exe review the dMSA service account attributes:** <br>
**Review the attributes:**
1. msDS-DelegatedMSAState
2. msDS-ManagedAccountPrecededByLink
3. msDS-SupersededManagedAccountLinkBL
4. servicePrincipalName

![image.png](/.attachments/image-ad1a078c-5d99-4c35-a620-993bd1dfd846.png =800x400)

**Other events:**

```
Log Name:      Directory Service
Source:        Microsoft-Windows-ActiveDirectory_DomainService
Date:          6/25/2024 9:10:27 AM
Event ID:      2946
Task Category: Security
Level:         Information
Keywords:      Classic
User:          ANONYMOUS LOGON
Computer:      DCA.contoso.com
Description:
A caller successfully fetched the password of a group managed service account. 
 
Group Managed Service Account Object: 
CN=dMSAFinApp1,CN=Managed Service Accounts,DC=contoso,DC=com 
Caller SID: 
S-1-5-7 
Caller IP: 

```

```
Log Name:      Directory Service
Source:        Microsoft-Windows-ActiveDirectory_DomainService
Date:          6/24/2024 3:09:19 AM
Event ID:      3054
Task Category: Security
Level:         Warning
Keywords:      Classic
User:          ANONYMOUS LOGON
Computer:      DCA.contoso.com
Description:
The directory has been configured to allow implicit owner privileges when initially setting or modifying the nTSecurityDescriptor attribute during LDAP add and modify operations. Warning events will be logged, but no requests will be blocked. 
 
This setting is not secure and should only be used as a temporary troubleshooting step. Please review the suggested mitigations in the link below.  
```

```
Log Name:      Directory Service
Source:        Microsoft-Windows-ActiveDirectory_DomainService
Date:          6/24/2024 3:09:19 AM
Event ID:      3051
Task Category: Security
Level:         Warning
Keywords:      Classic
User:          ANONYMOUS LOGON
Computer:      DCA.contoso.com
Description:
The directory has been configured to not enforce per-attribute authorization during LDAP add operations. Warning events will be logged, but no requests will be blocked. 
 
This setting is not secure and should only be used as a temporary troubleshooting step. Please review the suggested mitigations in the link below. 
```