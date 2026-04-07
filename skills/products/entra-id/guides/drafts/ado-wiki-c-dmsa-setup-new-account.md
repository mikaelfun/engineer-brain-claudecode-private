---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AD Changes in Windows Server 2025 and Windows 11 24H2/dMSA - Delegated Managed Service Account/Setup a new dMSA account"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAD%20Changes%20in%20Windows%20Server%202025%20and%20Windows%2011%2024H2%2FdMSA%20-%20Delegated%20Managed%20Service%20Account%2FSetup%20a%20new%20dMSA%20account"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1541915&Instance=1541915&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1541915&Instance=1541915&Feedback=2)

___
<div id='cssfeedback-end'></div>

[[_TOC_]]

#Configure a new dMSA account
A delegated Managed Service Account (dMSA) is an Active Directory (AD) account that enables secure management of credentials. Unlike traditional service accounts, dMSAs don't require manual management of passwords as AD automatically manages the password, ensuring that it remains secure. Additionally, dMSAs can be delegated specific permissions to access resources in the domain, providing an efficient way to manage access control. Setting up a dMSA is currently only available in Windows Server Preview

In this section you would learn on how to create a brand new dMSA account from scratch and configure the SNMP trap service on the client machine. 

##**Pre-Reqs:** <br>

Following the steps below you would be able to setup a dMSA account in your lab: 

(At this moment Windows Server 2025 and Windows 11 24H2 is a preview build.  You can download the latest ISO's from the below location)
(When Windows Server 2025 and Windows11 24H2 becomes GA (General availability) you can download the ISO's or VHDX from MSDN and install the required information)  
 
 **Location:** \\\winbuilds\release\rs_prerelease <br>
**Server build**: \\\winbuilds\release\rs_prerelease\27639.1000.240607-1427\amd64fre\vhdx\vhdx_server_serverdatacenter_en-us <br>
**Client build**: \\\winbuilds\release\rs_prerelease\27639.1000.240607-1427\amd64fre\vhdx\vhdx_client_enterprise_en-us_vl <br>


##**Machine requirements** 

1. Windows Server 2025 domain controller 
2. Windows11 24H2 client machine 

(We assume that you already have promoted a domain controller and joined the client machine to the domain) 

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
New-ADServiceAccount -CreateDelegatedServiceAccount -KerberosEncryptionType AES256 -Name dMSASnmp -DNSHostName dMSASnmp.contoso.com
```

**Default location of the dMSA account in Active Directory**
- Open adsiedit.msc
- Connect to domain partition
- Browse to CN=Managed Service Accounts and you would find the new dMSA account that we just created

![image.png](/.attachments/image-608b1c3e-4524-40c3-850b-eb7996b48466.png =800x350)

3. Configure the Client machine to retrieve the password of the dMSA account.  Our client machine name is Client2

```
Set-ADServiceAccount -Identity dMSAsnmp -PrincipalsAllowedToRetrieveManagedPassword Client2$
```

4. Validate if the permissions are setup correctly on the Client machine for the dMSA account.  When you review the output you would find the **PrincipalsAllowedToRetrieveManagedPassword** attribute with the DN of the client machine. 

```
Get-ADServiceAccount -Identity dMSAsnmp -Properties PrincipalsAllowedToRetrievemanagedPassword
```



**Output**

Review the attribute **PrincipalsAllowedToRetrieveManagedPassword** and you would find the DN of the client machine {CN=CLIENT2,CN=Computers,DC=contoso,DC=com}.


```
PS C:\ Get-ADServiceAccount -Identity dMSAsnmp -Properties PrincipalsAllowedToRetrievemanagedPassword


DistinguishedName                          : CN=dMSASnmp,CN=Managed Service Accounts,DC=contoso,DC=com
Enabled                                    : True
Name                                       : dMSASnmp
ObjectClass                                : msDS-DelegatedManagedServiceAccount
ObjectGUID                                 : 7625b5a4-7042-4e41-a580-12fcd92025e9
PrincipalsAllowedToRetrieveManagedPassword : {CN=CLIENT2,CN=Computers,DC=contoso,DC=com}
SamAccountName                             : dMSASnmp$
SID                                        : S-1-5-21-292515003-2047763813-3813526205-1111
UserPrincipalName                          :
```

5. Configure the **msDS-DelegatedMSAState** on the dMSA to a value 3

![image.png](/.attachments/image-0b2f2154-d7fd-46d3-8ce5-2449943f32a3.png =700x450)

```
PS C:\Users\Administrator> Get-ADServiceAccount -Identity dMSAsnmp -Properties msDS-DelegatedMSAState


DistinguishedName      : CN=dMSASnmp,CN=Managed Service Accounts,DC=contoso,DC=com
Enabled                : True
msDS-DelegatedMSAState : 3
Name                   : dMSASnmp
ObjectClass            : msDS-DelegatedManagedServiceAccount
ObjectGUID             : e3d37df1-75b6-48e8-9be1-aa46cc79c5ea
SamAccountName         : dMSASnmp$
SID                    : S-1-5-21-930589040-471629420-3595709274-1104
UserPrincipalName      :
```

6. Sign-In to Windows11 24H2 client machine which is joined to the domain and open command prompt and add the below reg key

**Reboot the machine after configuring the registry key**

```
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System\Kerberos\Parameters" /v "DelegatedMSAEnabled" /t REG_DWORD /d 1 /f
```

**RESTART the client machine**

7. Sign-In and open services.msc search for the service SNMP Trap service and double click on the service and go to the Log On tab

![image.png](/.attachments/image-fbf0a1bb-c382-4885-b856-bb6721359f9c.png =800x450)


![image.png](/.attachments/image-c7e42982-b354-441f-819a-1c4622967da2.png =350x400)

8. Select this account, click on browse.  Now select Locations and choose "Entire directory" and enter the newly created dMSA account and click OK

![image.png](/.attachments/image-f59b3c59-884e-4425-a3de-2e551d95ef28.png =500x250)

9. Remove the password field and leave the password as blank and click on Apply

![image.png](/.attachments/image-2bd39117-6f8b-4be6-b8b4-169fb4abf7e9.png =350x400)

10. You would get a prompt like the below

![image.png](/.attachments/image-4ed441a0-b695-4ba0-a97e-b58a90970446.png =350x200) 

11. Now you can start the service 

![image.png](/.attachments/image-9dcb952b-9467-4a89-b6b0-7b0b0d9eeb6a.png =800x450)