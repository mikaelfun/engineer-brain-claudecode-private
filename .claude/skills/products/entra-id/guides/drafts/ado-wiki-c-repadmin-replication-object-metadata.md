---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AD Replication/Workflow:  Verify | Determine Replication Health and Status/Determine Replication Status of a Single Object/Replication Object Metadata"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/AD%20Replication/Workflow%3A%20%20Verify%20%7C%20Determine%20Replication%20Health%20and%20Status/Determine%20Replication%20Status%20of%20a%20Single%20Object/Replication%20Object%20Metadata"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/423396&Instance=423396&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/423396&Instance=423396&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This article provides detailed instructions on using the `repadmin` command to view replication object metadata in a domain environment. It explains the syntax, usage, and examples of obtaining replication metadata from writable partitions and global catalog servers. Additionally, it covers viewing metadata using LDP.EXE.

# Viewing replication object metadata using repadmin

The `repadmin` command can view replication object metadata. The main switch for viewing the replication metadata is `/showobjmeta`. You can find the online help for this switch [here](https://docs.microsoft.com/previous-versions/windows/it-pro/windows-server-2012-R2-and-2012/cc742104(v=ws.11)).

The primary use of this command is to determine if objects have replicated to different domain controllers and to identify when and where an attribute was last changed.

## Syntax
The syntax of the command is as follows:
```
Repadmin /showobjmeta dcname "DN of output to query"
```
You can use a period instead of `dcname` to use the local connected domain controller.

## Obtaining replication metadata from writable partition

Here is an example of an object:
```
C:\Users\Administrator>repadmin /showobjmeta . CN=will,OU=test,DC=contoso,DC=com

Repadmin: running command /showobjmeta against full DC localhost

29 entries.
Loc.USN                           Originating DSA  Org.USN  Org.Time/Date        Ver Attribute
=======                           =============== ========= =============        === =========
  77641               Default-First-Site-Name\DC1     77641 2019-11-05 09:38:09    1 objectClass
  77641               Default-First-Site-Name\DC1     77641 2019-11-05 09:38:09    1 cn
  77641               Default-First-Site-Name\DC1     77641 2019-11-05 09:38:09    1 givenName
  77641               Default-First-Site-Name\DC1     77641 2019-11-05 09:38:09    1 instanceType
  77641               Default-First-Site-Name\DC1     77641 2019-11-05 09:38:09    1 whenCreated
  77641               Default-First-Site-Name\DC1     77641 2019-11-05 09:38:09    1 displayName
 848792               Default-First-Site-Name\DC1    848792 2020-01-31 12:26:06    2 nTSecurityDescriptor
 848526               Default-First-Site-Name\DC1    848526 2020-01-31 11:56:30    3 name
  77647               Default-First-Site-Name\DC1     77647 2019-11-05 09:38:09    4 userAccountControl
  77642               Default-First-Site-Name\DC1     77642 2019-11-05 09:38:09    1 codePage
  77642               Default-First-Site-Name\DC1     77642 2019-11-05 09:38:09    1 countryCode
 848324               Default-First-Site-Name\DC2    548926 2020-01-31 11:40:46    4 dBCSPwd
  77691               Default-First-Site-Name\DC1     77691 2019-11-05 09:46:12    1 scriptPath
  77642               Default-First-Site-Name\DC1     77642 2019-11-05 09:38:09    1 logonHours
 848324               Default-First-Site-Name\DC2    548926 2020-01-31 11:40:46    4 unicodePwd
 848324               Default-First-Site-Name\DC2    548926 2020-01-31 11:40:46    4 ntPwdHistory
 848324               Default-First-Site-Name\DC2    548926 2020-01-31 11:40:46    4 pwdLastSet
  77642               Default-First-Site-Name\DC1     77642 2019-11-05 09:38:09    1 primaryGroupID
 848324               Default-First-Site-Name\DC2    548927 2020-01-31 11:40:46    3 supplementalCredentials
  77641               Default-First-Site-Name\DC1     77641 2019-11-05 09:38:09    1 objectSid
 848792               Default-First-Site-Name\DC1    848792 2020-01-31 12:26:06    1 adminCount
  77642               Default-First-Site-Name\DC1     77642 2019-11-05 09:38:09    1 accountExpires
 848324               Default-First-Site-Name\DC2    548926 2020-01-31 11:40:46    4 lmPwdHistory
  77641               Default-First-Site-Name\DC1     77641 2019-11-05 09:38:09    1 sAMAccountName
  77641               Default-First-Site-Name\DC1     77641 2019-11-05 09:38:09    1 sAMAccountType
 529001               Default-First-Site-Name\DC1    529001 2020-01-09 12:57:31    2 userPrincipalName
  77641               Default-First-Site-Name\DC1     77641 2019-11-05 09:38:09    1 objectCategory
 209006               Default-First-Site-Name\DC1    209006 2019-11-21 12:55:37    1 mS-DS-ConsistencyGuid
 993628               Default-First-Site-Name\DC1    993628 2020-02-10 12:30:55    7 lastLogonTimestamp

4 entries.

Type    Attribute     Last Mod Time                            Originating DSA  Loc.USN Org.USN Ver
======= ============  =============                           ================= ======= ======= ===
        Distinguished Name
        =============================
PRESENT msDS-AuthenticatedAtDC 2019-11-07 06:42:27   eb393ea9-606f-4d8c-8431-c18821487933   85431   19543   1
        CN=CONTOSO-RODC,OU=Domain Controllers,DC=contoso,DC=com
PRESENT msDS-AssignedAuthNPolicy 2020-01-07 12:31:34            Default-First-Site-Name\DC1  500922  500922   1
        CN=test policy\0ADEL:aec9140e-8834-45c5-b519-48af2cdc4bc1,CN=Deleted Objects,CN=Configuration,DC=contoso,DC=com
PRESENT msDS-KeyCredentialLink 2020-01-09 13:24:53            Default-First-Site-Name\DC1  529103  529103   1
        CN=will,OU=test,DC=contoso,DC=com
PRESENT msDS-KeyCredentialLink 2020-01-10 06:55:14            Default-First-Site-Name\DC1  532370  532370   1
        CN=will,OU=test,DC=contoso,DC=com
```

The data will show if the object is present on the queried domain controller, when and where the attribute was last changed, and how often the object was changed.

For example, the attribute `lastLogonTimestamp` has the following values:
```
Loc. USN     993628                               - This is the USN number on the local domain controller
Originating DSA    Default-First-Site-Name\DC1    - This is the domain controller who last changed the attribute
Orig. USN   993628                                - This is the USN value of the DC who made the last change
Orig. Time/Date    2020-02-10 12:30:55            - This is the time and date of the last change
Version    7                                      - This is the version number of the change. The version number starts at 0 and will increase with each change. So this attribute has changed 7 times.
```

If replication is working and consistent, this data will mainly be identical on every domain controller.

Some attributes are not replicated. For example, the `cn` attribute is not a replicated attribute.

When we get the same object from a second domain controller, we see this data:
```
C:\Users\Administrator>repadmin /showobjmeta dc2 CN=will,OU=test,DC=contoso,DC=com

29 entries.

Loc.USN                           Originating DSA  Org.USN  Org.Time/Date        Ver Attribute
=======                           =============== ========= =============        === =========
  12555               Default-First-Site-Name\DC1     77641 2019-11-05 09:38:09    1 objectClass
 549153               Default-First-Site-Name\DC2    549153 2020-01-31 11:56:38    2 cn
  12555               Default-First-Site-Name\DC1     77641 2019-11-05 09:38:09    1 givenName
  12555               Default-First-Site-Name\DC1     77641 2019-11-05 09:38:09    1 instanceType
  12555               Default-First-Site-Name\DC1     77641 2019-11-05 09:38:09    1 whenCreated
  12555               Default-First-Site-Name\DC1     77641 2019-11-05 09:38:09    1 displayName
 549440               Default-First-Site-Name\DC1    848792 2020-01-31 12:26:06    2 nTSecurityDescriptor
 549153               Default-First-Site-Name\DC1    848526 2020-01-31 11:56:30    3 name
  12555               Default-First-Site-Name\DC1     77647 2019-11-05 09:38:09    4 userAccountControl
  12555               Default-First-Site-Name\DC1     77642 2019-11-05 09:38:09    1 codePage
  12555               Default-First-Site-Name\DC1     77642 2019-11-05 09:38:09    1 countryCode
 548926               Default-First-Site-Name\DC2    548926 2020-01-31 11:40:46    4 dBCSPwd
  12555               Default-First-Site-Name\DC1     77691 2019-11-05 09:46:12    1 scriptPath
  12555               Default-First-Site-Name\DC1     77642 2019-11-05 09:38:09    1 logonHours
 548926               Default-First-Site-Name\DC2    548926 2020-01-31 11:40:46    4 unicodePwd
 548926               Default-First-Site-Name\DC2    548926 2020-01-31 11:40:46    4 ntPwdHistory
 548926               Default-First-Site-Name\DC2    548926 2020-01-31 11:40:46    4 pwdLastSet
  12555               Default-First-Site-Name\DC1     77642 2019-11-05 09:38:09    1 primaryGroupID
 548927               Default-First-Site-Name\DC2    548927 2020-01-31 11:40:46    3 supplementalCredentials
  12555               Default-First-Site-Name\DC1     77641 2019-11-05 09:38:09    1 objectSid
 549440               Default-First-Site-Name\DC1    848792 2020-01-31 12:26:06    1 adminCount
  12555               Default-First-Site-Name\DC1     77642 2019-11-05 09:38:09    1 accountExpires
 548926               Default-First-Site-Name\DC2    548926 2020-01-31 11:40:46    4 lmPwdHistory
  12555               Default-First-Site-Name\DC1     77641 2019-11-05 09:38:09    1 sAMAccountName
  12555               Default-First-Site-Name\DC1     77641 2019-11-05 09:38:09    1 sAMAccountType
 329604               Default-First-Site-Name\DC1    529001 2020-01-09 12:57:31    2 userPrincipalName
  12555               Default-First-Site-Name\DC1     77641 2019-11-05 09:38:09    1 objectCategory
  91836               Default-First-Site-Name\DC1    209006 2019-11-21 12:55:37    1 mS-DS-ConsistencyGuid
 610945               Default-First-Site-Name\DC1    993628 2020-02-10 12:30:55    7 lastLogonTimestamp

4 entries.

Type    Attribute     Last Mod Time                            Originating DSA  Loc.USN Org.USN Ver
======= ============  =============                           ================= ======= ======= ===
        Distinguished Name
        =============================
PRESENT msDS-AuthenticatedAtDC 2019-11-07 06:42:27   eb393ea9-606f-4d8c-8431-c18821487933   19543   19543   1
        CN=CONTOSO-RODC,OU=Domain Controllers,DC=contoso,DC=com
PRESENT msDS-AssignedAuthNPolicy 2020-01-07 12:31:34            Default-First-Site-Name\DC1  328458  500922   1
        CN=test policy\0ADEL:aec9140e-8834-45c5-b519-48af2cdc4bc1,CN=Deleted Objects,CN=Configuration,DC=contoso,DC=com
PRESENT msDS-KeyCredentialLink 2020-01-09 13:24:53            Default-First-Site-Name\DC1  329851  529103   1
        CN=will,OU=test,DC=contoso,DC=com
PRESENT msDS-KeyCredentialLink 2020-01-10 06:55:14            Default-First-Site-Name\DC1  334035  532370   1
        CN=will,OU=test,DC=contoso,DC=com
```
Notice the `cn` attribute has a different date and timestamp and says it was changed on `DC2`. This is an example of an attribute that is not replicated. But the replicated attributes should all look the same.

## Obtaining replication metadata from global catalog server

If an object is stored in the global catalog partition, when you query a global catalog that is in a different domain, you will see the same object but only the attributes that are replicated to the global catalog partition.

For example, here is the same object on a child domain controller:
```
C:\Users\Administrator>repadmin /showobjmeta child-dc1.child.contoso.com CN=will,OU=test,DC=contoso,DC=com

16 entries.

Loc.USN                           Originating DSA  Org.USN  Org.Time/Date        Ver Attribute
=======                           =============== ========= =============        === =========
 248651               Default-First-Site-Name\DC1     77641 2019-11-05 09:38:09    1 objectClass
 603326         Default-First-Site-Name\CHILD-DC1    603326 2020-01-31 11:56:41    2 cn
 248651               Default-First-Site-Name\DC1     77641 2019-11-05 09:38:09    1 givenName
 248651               Default-First-Site-Name\DC1     77641 2019-11-05 09:38:09    1 instanceType
 248651               Default-First-Site-Name\DC1     77641 2019-11-05 09:38:09    1 whenCreated
 248651               Default-First-Site-Name\DC1     77641 2019-11-05 09:38:09    1 displayName
 603633               Default-First-Site-Name\DC1    848792 2020-01-31 12:26:06    2 nTSecurityDescriptor
 603326               Default-First-Site-Name\DC1    848526 2020-01-31 11:56:30    3 name
 248651               Default-First-Site-Name\DC1     77647 2019-11-05 09:38:09    4 userAccountControl
 248651               Default-First-Site-Name\DC1     77642 2019-11-05 09:38:09    1 primaryGroupID
 248651               Default-First-Site-Name\DC1     77641 2019-11-05 09:38:09    1 objectSid 
 248651               Default-First-Site-Name\DC1     77641 2019-11-05 09:38:09    1 sAMAccountName 
 248651               Default-First-Site-Name\DC1     77641 2019-11-05 09:38:09    1 sAMAccountType 
 355568               Default-First-Site-Name\DC1    529001 2020-01-09 12:57:31    2 userPrincipalName 
 248651               Default-First-Site-Name\DC1     77641 2019-11-05 09:38:09    1 objectCategory 
 724148               Default-First-Site-Name\DC1    993628 2020-02-10 12:30:55    7 lastLogonTimestamp 

0 entries. 

Type    Attribute     Last Mod Time                            Originating DSA  Loc.USN Org.USN Ver 
======= ============  =============                           ================= ======= ======= === 
        Distinguished Name 
        ============================= 
```

If you want to query for the existence of an object on every DC, you can use a command like this:

**Repadmin /showobjmeta * "dn of object"**

This will query every DC in the forest for the object and report the results.

## Viewing metadata with LDP.exe

Replication object metadata can also be viewed using LDP.EXE

You can use LDP to connect and bind to the domain controller

If you right click on any object, choose advanced replication metadata
This will essentially show the same data that repadmin /showobjmeta displays

Here is an example of the output:  

![image.png](/.attachments/image-ad5f328a-a1c5-45f0-832f-dc15544053f4.png)



In LDP, the attributes are just shown as the Attribute ID. You will not see the friendly name of the attribute. You can lookup up the ID by using the methods in this article:
[ADDS: Schema: How to convert an attributeId (attid) to an OID and ldap display name](https://internal.evergreen.microsoft.com/topic/861c8a03-dc34-2c2c-8206-b4d893bb07b5)