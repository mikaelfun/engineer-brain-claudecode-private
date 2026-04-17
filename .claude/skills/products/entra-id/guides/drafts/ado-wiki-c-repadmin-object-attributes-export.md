---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AD Replication/Workflow:  Verify | Determine Replication Health and Status/Determine Replication Status of a Single Object/Object Attributes"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/AD%20Replication/Workflow%3A%20%20Verify%20%7C%20Determine%20Replication%20Health%20and%20Status/Determine%20Replication%20Status%20of%20a%20Single%20Object/Object%20Attributes"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/423395&Instance=423395&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/423395&Instance=423395&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This article explains how to export and view attribute data in Active Directory using tools like Repadmin and LDIFDE. It provides examples and detailed instructions for using these commands.



Sometimes it is necessary to dump out the attributes on an object.

There are multiple methods to export and view attribute data.

Active Directory Users and Computers and ADSIEDIT are great at viewing and allowing you to edit attributes.

The main tools for exporting attributes are Repadmin and LDIFDE (LDAP Data Interchange Format Directory Exchange).

## Using Repadmin /showattr to export attributes

This command `repadmin /showattr` will dump out the object attributes.

This is the main help page for this command: [Repadmin /showattr Help Page](https://docs.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2012-R2-and-2012/cc742051(v=ws.11))

Here is an example of the usage:

The syntax of the command is `repadmin /showattr dcname "dn of object"`

You can use a period for `dcname` and it will connect to the local Domain Controller (DC). You can also use an asterisk (*) to query all DCs.

It is suggested to add the switches `/long` and `/allvalues`, which are optional but will make the output more useful.

- **/allvalues** displays all attribute values. By default, only 20 attribute values are displayed for an attribute.
- **/long** displays one line per attribute value.

**Example:**
````
Repadmin /showattr . "cn=standard,ou=test,dc=contoso,dc=com" /long /allvalues

Repadmin: running command /showattr against full DC localhost

DN: CN=standard,OU=Test,DC=contoso,DC=com

    4> objectClass: top;
          person;
          organizationalPerson;
          user
    1> cn: standard
    1> userCertificate: <1847 byte blob>
    1> givenName: standard
    1> distinguishedName: CN=standard,OU=Test,DC=contoso,DC=com
    1> instanceType: 0x4 = ( WRITE )
    1> whenCreated: 2/14/2020 12:34:06 PM Pacific Daylight Time
    1> whenChanged: 5/12/2020 11:31:20 AM Pacific Daylight Time
    1> displayName: standard
    1> uSNCreated: 12997
    3> memberOf: CN=group2,DC=contoso,DC=com;
          CN=child-universal,OU=Employees,DC=child,DC=contoso,DC=com;
          CN=group1,DC=contoso,DC=com
    1> uSNChanged: 1294603
    1> name: standard
    1> objectGUID: 0af99c8f-1b4c-455c-9145-21dd3bdc034f
    1> userAccountControl: 0x200 = ( NORMAL_ACCOUNT )
    1> badPwdCount: 0
    1> codePage: 0
    1> countryCode: 0
    1> badPasswordTime: 4/29/2020 6:47:16 AM Pacific Daylight Time
    1> lastLogoff: (never)
    1> lastLogon: 5/7/2020 8:38:01 AM Pacific Daylight Time
    1> pwdLastSet: 4/17/2020 12:31:13 PM Pacific Daylight Time
    1> primaryGroupID: 513 = ( GROUP_RID_USERS )
    1> userParameters: m:                    d
    1> objectSid: S-1-5-21-1820684929-1112662569-1270537518-1107
    1> accountExpires: (never)
    1> logonCount: 135
    1> sAMAccountName: standard
    1> sAMAccountType: 805306368 = ( NORMAL_USER_ACCOUNT )
    1> userPrincipalName: standard@contoso.com
    1> lastKnownParent: OU=Test,DC=contoso,DC=com
    1> objectCategory: CN=Person,CN=Schema,CN=Configuration,DC=contoso,DC=com
    1> msNPAllowDialin: TRUE
    5> dSCorePropagationData: 6/18/2020 1:02:39 PM Pacific Daylight Time;
          6/16/2020 2:50:49 PM Pacific Daylight Time;
          3/6/2020 6:29:25 AM Pacific Daylight Time;
          3/6/2020 6:29:25 AM Pacific Daylight Time;
          0x1 = ( NEW_SD ), 0x1 = ( NEW_SD ), 0x0 = (  ), 0x0 = (  )
    1> lastLogonTimestamp: 5/9/2020 5:13:03 AM Pacific Daylight Time
    1> msDS-LastSuccessfulInteractiveLogonTime: 5/7/2020 8:38:01 AM Pacific Daylight Time
    1> msDS-FailedInteractiveLogonCountAtLastSuccessfulLogon: 0
    1> msDS-LastKnownRDN: standard
````

This will connect to Active Directory and export all the attributes for the selected object.

For replication, this mainly comes into play if we need to check the consistency of an object and its associated attributes on multiple DCs. You can run the command against multiple DCs or use an asterisk (*) for the `dcname` to get all domain controllers.

## Using LDIFDE to export data

The LDIFDE utility can also export attribute data.

This is the main help page for LDIFDE: [LDIFDE Help Page](https://docs.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2012-R2-and-2012/cc731033(v=ws.11))

This command, for example, would export the object **CN=will,OU=test,DC=contoso,DC=com** to a file named **user.ldf**:

**ldifde -f user.ldf -d CN=will,OU=test,DC=contoso,DC=com**

This is what the file will contain:
````
dn: CN=will,OU=test,DC=contoso,DC=com
changetype: add
objectClass: top
objectClass: person
objectClass: organizationalPerson
objectClass: user
cn: will
givenName: will
distinguishedName: CN=will,OU=test,DC=contoso,DC=com
instanceType: 4
whenCreated: 20191105173809.0Z
whenChanged: 20200210203055.0Z
displayName: will
uSNCreated: 77641
memberOf: CN=Domain Admins,CN=Users,DC=contoso,DC=com
uSNChanged: 993628
name: will
objectGUID:: qdLIFLeQek2yZBzHeQEGmg==
userAccountControl: 512
badPwdCount: 0
codePage: 0
countryCode: 0
badPasswordTime: 132258449239560667
lastLogoff: 0
lastLogon: 132258819278343194
scriptPath: mapdrive.bat
pwdLastSet: 132249732467316801
primaryGroupID: 513
objectSid:: AQUAAAAAAAUVAAAAKm0s7HspGu8/NKK3XQQAAA==
adminCount: 1
accountExpires: 9223372036854775807
logonCount: 141
sAMAccountName: will
sAMAccountType: 805306368
managedObjects: CN=CONTOSO-RODC,OU=Domain Controllers,DC=contoso,DC=com
userPrincipalName: will@johnbay999.onmicrosoft.com
objectCategory: CN=Person,CN=Schema,CN=Configuration,DC=contoso,DC=com
dSCorePropagationData: 20200205192717.0Z
dSCorePropagationData: 20200131202606.0Z
dSCorePropagationData: 20200131195649.0Z
dSCorePropagationData: 20200114215846.0Z
dSCorePropagationData: 16010714223236.0Z
mS-DS-ConsistencyGuid:: qdLIFLeQek2yZBzHeQEGmg==
lastLogonTimestamp: 132258402552392299
msDS-AuthenticatedAtDC:
 CN=CONTOSO-RODC,OU=Domain Controllers,DC=contoso,DC=com
msDS-KeyCredentialLink:
 B:854:00020000200001CA88C94A82F6891D7A6DD07D5EAB710480B47E9D76234A2E80F17CADF7
 07365A200002A6AFA43F832202BD85E928CD840E704F6CF84F0F30C7C44A525F62DAD7735F961B
 0103525341310008000003000000000100000000000000000000010001B9D151B5A0BCDF5B064E
 47E9205035459031F82BC7ABB50441AF3D8A55F9376C6D8D786820D9CA0BB03BB69C70C11DA290
 C5AE5B6A40B2241787B3B7C7BD5C6135D17F65FF3E01CA38D8831C0EADE7B1A163F0C26D64CAEB
 DA47265B08083D35AB168550C08ED57F2657FBFD42C974CB5CD8F55D692BF0DAE1E72A4999FEE9
 630946DB447CA43FDA76EB5299D6856FA50F83BD5DB0C2DA7C7880BFAC0B7639F278D0F2DD0060
 8C42A6087179600C2D34B1303D13D2D6224F9E4EDCDBDCFA0101470FEAA6CB1AE0AC7A5B0D9943
 7704DFC0D35E5A66304E5F854F38545575FB6E37F08BCA36753F269FEBC7D307A699A250B59076
 F9F33A2388F734D628D4D26D0100040101000501100006ADE70C813CA1024082A4AD8526130E18
 0F0007010000000002000000000000000000080008000000000000004008000948F163EEDB95D7
 48:CN=will,OU=test,DC=contoso,DC=com
msDS-KeyCredentialLink:
 B:854:000200002000014BB5435576BB93F6255799651CFC3847D299913A351A542D282F392B7E
 B80CFD200002757AB60A98CBB3DB1051D4138F78AD4416A96BDBDC92E7B00D137E9352F16CDD1B
 0103525341310008000003000000000100000000000000000000010001B8F8413B6656BC761362
 70FA894C1A5CDD4A915373404F172A48E89741843C690ADDA69D2D4781CF729EE35E7035D46EDF
 765C371E52EB956EC7E50A33992658E8B5B551B8F246AE6BB33AF1AA18DB9C00626DC9B5BFA49D
 E474087248EF6D9FD89BBB308F1D202305E789735F0CAF2B3A23683E0E73C5BADF6D377D325DF3
 65E8B9B171BAAA9DB4D609BBD76C2D11054662CDB73947C433627385E95C8A0CF7A08732E9D674
 3FBC0721535BBF800560131255B27D1785FAB19B5DE67AE55945DAA045DAAAA634CDC575319113
 16BD477746DCBD00296ED7980B3C0FBDEBEC98A330A73BE362678EE103C8EE9BD0D8C9268A45BA
 6A67A91340791EF9414FC20101000401010005011000061DCC1096DE087547A74CA7151CEB775D
 0F000701000000000200000000000000000008000800000000000000400800094AA7B0054795D7
 48:CN=will,OU=test,DC=contoso,DC=com
````

It is the same information as displayed by `repadmin /showattr`. The format is a little different, but the data is the same.

One advantage of LDIFDE is that you can export an entire tree or even the entire domain.

The utility will export starting at the distinguished name level.

For example: `ldifde -f domain.txt -d "dc=contoso,dc-com"`

This will export the entire domain to a file named `domain.txt`.

## Using LDP to export attribute data

You can also copy the attribute data if you view an object using LDP.
You simply double click the user and select the data that is displayed in the right pane.

![image.png](/.attachments/image-f4d66649-66f8-452c-bb04-72bb9040733b.png)