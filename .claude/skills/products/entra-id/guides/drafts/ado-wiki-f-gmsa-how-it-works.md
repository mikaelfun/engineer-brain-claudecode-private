---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/GMSA/Workflow: gMSA : How gMSA works"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FGMSA%2FWorkflow%3A%20gMSA%20%3A%20How%20gMSA%20works"
importDate: "2026-04-07"
type: troubleshooting-guide
---

### Summary
This article explains the Microsoft Key Distribution Service (kdssvc.dll) and its role in securely obtaining keys for Active Directory accounts. It details the process of password retrieval for group Managed Service Accounts (gMSA) and how services are configured to use gMSAs.

### Microsoft key distribution service (kdssvc.dll)

The Microsoft Key Distribution Service (kdssvc.dll) provides the mechanism to securely obtain the latest key or a specific key with a key identifier for an Active Directory account. The Key Distribution Service shares a secret that is used to create keys for the account. These keys are periodically changed. For a group Managed Service Account (gMSA), the domain controller computes the password on the key provided by the Key Distribution Services, in addition to other attributes of the gMSA. Member hosts can obtain the current and preceding password values by contacting a domain controller.

An administrator specifies what accounts are allowed to fetch the password of gMSA from Active Directory by specifying the object in the PrincipalsAllowedToRetrieveManagedPassword attribute on the gMSA. It can be any users, groups, or computers.

```
DistinguishedName                          : CN=TestGMSA,CN=Managed Service Accounts,DC=Contoso,DC=com
Enabled                                    : True
Name                                       : TestGMSA
ObjectClass                                : msDS-GroupManagedServiceAccount
ObjectGUID                                 : 17617ca4-3c7c-4d53-93eb-fd5deb76fd08
PrincipalsAllowedToRetrieveManagedPassword : {CN=ManagedUserGroup,CN=Users,DC=Contoso,DC=com}
SamAccountName                             : TestGMSA$****
SID                                        : S-1-5-21-2793855656-3212918259-3796561446-1108
```

When a domain member wants to start a new logon session with a gMSA, the Netlogon service is called by Kerberos to get the current password of the gMSA if the local storage is not recent enough. With the current information, the Kerberos client performs Key Distribution Center (KDC) calls.

Netlogon performs this task using an LDAP query against the gMSA account asking for the constructed attribute "msDS-ManagedPassword," which has current and previous password information. The Domain Controller has the implementation of the gMSA password retrieval in the LDAP server code as it is a constructed attribute. If the client requesting the password has the permission to fetch the gMSA password (derived from PrincipalsAllowedToRetrieveManagedPassword properties), the KDC service on the Domain Controller provides the requested information to the Kerberos client.

**If this is the first call to fetch the gMSA password after the password has expired, it also triggers an update to the Active Directory password of the gMSA. You would see pwdlastset match this timestamp.**

When you configure any service with gMSA, Windows does not actually know it is dealing with a managed account. The administrator configures gMSA to log on as an account in the service property and leaves the password blank. logoncli.dll under services.msc queries the registry ServiceAccountManaged for the service to understand if this service is managed by gMSA:

```
Date:	07-10-2023 07:03:44.8906734
Thread:	4196
Class:	Registry
Operation:RegQueryValue
Result:	NAME NOT FOUND
Path:	HKLM\System\CurrentControlSet\Services\<Service Name>\ServiceAccountManaged
Duration:0.0000017
Length:	16
```

If the registry is unavailable, Windows accepts that this might be a gMSA and so during a logon call, it opens a connection to Active Directory and asks for the password using the function NetpFetchLSASecretCredsEx.

Once it gets the password, it understands that the service is a managed service and updates the registry ServiceAccountManaged=True for the service.

```
Date:	07-10-2023 07:03:44.8906961
Thread:	4196
Class:	Registry
Operation:RegSetValue
Result:	SUCCESS
Path:	HKLM\System\CurrentControlSet\Services\<service name>\ServiceAccountManaged
Duration:0.0000143
Type:	REG_BINARY
Length:	4
Data:	01 00 00 00
```

### Sample Netlogon.log

A sample example of netlogon.log while configuring a service (snmptrap service was used in this example):

```
10/07 07:03:44 [MSA] [664] Entering NetrQueryServiceAccount for account CONTOSO\TestGMSA$, Level 0
10/07 07:03:44 [MSA] [664] Entering NetpQueryServiceAccountInfo0
10/07 07:03:44 [MISC] [664] DsGetDcName function called: client PID=4916, Dom:CONTOSO Acct:(null) Flags: RET_DNS
10/07 07:03:44 [MSA] [664] Entering NetpFetchLSASecretCredsEx
10/07 07:03:44 [MSA] [664] Exiting NetpFetchLSASecretCredsEx with Status 0x00000000
10/07 07:03:44 [MSA] [664] Exiting NetrQueryServiceAccount for account CONTOSO\TestGMSA$, Status 0x00000000
```
