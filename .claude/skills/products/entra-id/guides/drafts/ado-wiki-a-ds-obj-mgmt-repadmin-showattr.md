---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/User, computer, group, and object management/Workflow: DS Object Mgmt: Tools/Repadmin | Showattr"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/User%2C%20computer%2C%20group%2C%20and%20object%20management/Workflow%3A%20DS%20Object%20Mgmt%3A%20Tools/Repadmin%20%7C%20Showattr"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/419702&Instance=419702&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/419702&Instance=419702&Feedback=2)

___
<div id='cssfeedback-end'></div>

# Overview

Repadmin with the /ShowATTR switch is a useful tool to validate what attributes a Domain Controller (DC) currently has and what values they have. It also shows the count of items in multi-value attributes. This tool is best paired with a [repadmin /showobjmeta](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/419701/Repadmin-showobjmeta) capture to see what each Domain Controller has for the current information.

# Usage

The "ShowATTR" switch for Repadmin.exe takes the name of a Domain Controller or an asterisk (*) to represent all DCs in the forest. It then takes the Distinguished Name (DN) of the object you want to query.

**Example Command:**

```plaintext
Repadmin /showattr * CN=MoveMe1,OU=ADMT,OU=Emps,DC=contoso,DC=com /atts: /allvalues /long /deleted /extended > ATTR_OUTPUT.txt
```


| Flag | Description |
|------|-------------|
| /showATTR | Repadmin flag to show attributes against a certain object |
| * | Denotes to search every DC in the forest. Can also be replaced with a single DC's name or a list of DCs |
| CN=MoveMe1,OU=ADMT,OU=Emps,DC=contoso,DC=com | Distinguished Name of the object to query |

# Example Output

This is an example of the output from a user named "MoveMe1" in the ADMT Organizational Unit (OU) under the Emps OU in the Contoso Domain:

*Note: You can see on the second DC's output that there is a broken DC where it lists the DSA GUID and not the Domain Controller name.*

Repadmin: running command /showattr against full DC contoso-dc01.contoso.com

**DN: CN=MoveMe1,OU=ADMT,OU=Emps,DC=contoso,DC=com**

```plaintext
    4> objectClass: top; person; organizationalPerson; user 
    1> cn: MoveMe1 
    1> givenName: MoveMe1 
    1> distinguishedName: CN=MoveMe1,OU=ADMT,OU=Emps,DC=contoso,DC=com 
    1> instanceType: 0x4 = ( WRITE ) 
    1> whenCreated: 10/26/2016 6:28:36 AM Pacific Standard Time 
    1> whenChanged: 12/16/2016 9:22:38 AM Pacific Standard Time 
    1> displayName: MoveMe1 
    1> uSNCreated: 258793 
    1> uSNChanged: 316892 
    1> name: MoveMe1 
    1> objectGUID: e9631bf1-235f-4390-9f1c-cb5ca883ebaa 
    1> userAccountControl: 0x10200 = ( NORMAL_ACCOUNT | DONT_EXPIRE_PASSWD ) 
    1> badPwdCount: 0 
    1> codePage: 0 
    1> countryCode: 0 
    1> homeDirectory: \\contoso.com\Fake 
    1> homeDrive: Z: 
    1> badPasswordTime: (never) 
    1> lastLogoff: (never) 
    1> lastLogon: 12/16/2016 9:28:05 AM Pacific Standard Time 
    1> pwdLastSet: 10/26/2016 6:28:36 AM Pacific Standard Time 
    1> primaryGroupID: 513 = ( GROUP_RID_USERS ) 
    1> objectSid: S-1-5-21-3571930230-921432301-1488896092-1135 
    1> accountExpires: (never) 
    1> logonCount: 5 
    1> sAMAccountName: MoveMe1 
    1> sAMAccountType: 805306368 = ( NORMAL_USER_ACCOUNT ) 
    1> userPrincipalName: MoveMe1@contoso.com 
    1> objectCategory: CN=Person,CN=Schema,CN=Configuration,DC=contoso,DC=com 
    5> dSCorePropagationData: 1/26/2017 12:43:40 PM Pacific Standard Time; 1/26/2017 12:43:40 PM Pacific Standard Time; 12/5/2016 1:29:24 PM Pacific Standard Time; 10/26/2016 6:28:36 AM Pacific Standard Time; 0x1 = ( NEW_SD ), 0x1 = ( NEW_SD ), 0x1 = ( NEW_SD ), 0x0 = (  ) 
    1> lastLogonTimestamp: 12/16/2016 9:22:38 AM Pacific Standard Time 
```

Repadmin: running command /showattr against full DC 057a0713-fa86-41f2-8d75-f6d68ecf3968._msdcs.contoso.com

**DN: CN=MoveMe1,OU=ADMT,OU=Emps,DC=contoso,DC=com**

```plaintext
    4> objectClass: top; person; organizationalPerson; user 
    1> cn: MoveMe1 
    1> givenName: MoveMe1 
    1> distinguishedName: CN=MoveMe1,OU=ADMT,OU=Emps,DC=contoso,DC=com 
    1> instanceType: 0x4 = ( WRITE ) 
    1> whenCreated: 10/26/2016 6:28:36 AM Pacific Standard Time 
    1> whenChanged: 3/9/2017 12:45:45 PM Pacific Standard Time 
    1> displayName: MoveMe1 
    1> uSNCreated: 18145 
    1> uSNChanged: 18145 
    1> name: MoveMe1 
    1> objectGUID: e9631bf1-235f-4390-9f1c-cb5ca883ebaa 
    1> userAccountControl: 0x10200 = ( NORMAL_ACCOUNT | DONT_EXPIRE_PASSWD ) 
    1> codePage: 0 
    1> countryCode: 0 
    1> homeDirectory: \\contoso.com\Fake 
    1> homeDrive: Z: 
    1> pwdLastSet: 10/26/2016 6:28:36 AM Pacific Standard Time 
    1> primaryGroupID: 513 = ( GROUP_RID_USERS ) 
    1> objectSid: S-1-5-21-3571930230-921432301-1488896092-1135 
    1> accountExpires: (never) 
    1> sAMAccountName: MoveMe1 
    1> sAMAccountType: 805306368 = ( NORMAL_USER_ACCOUNT ) 
    1> userPrincipalName: MoveMe1@contoso.com 
    1> objectCategory: CN=Person,CN=Schema,CN=Configuration,DC=contoso,DC=com 
```