---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/User, computer, group, and object management/Workflow: DS Object Mgmt: Tools/LDP"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/User%2C%20computer%2C%20group%2C%20and%20object%20management/Workflow%3A%20DS%20Object%20Mgmt%3A%20Tools/LDP"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/419697&Instance=419697&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/419697&Instance=419697&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**
This article provides a comprehensive guide on using LDP.exe for LDAP operations in Active Directory or AD LDS. It includes instructions on connecting, testing connections, binding, viewing directory NCs, dumping ntds.dit, invoking Active Directory SDProp processes, searching the directory, and viewing AD object's security descriptors.

# What is LDP.exe

LDP.exe is a very handy tool that can be used to perform LDAP (Lightweight Directory Access Protocol) operations such as connect, bind, search, modify, add, and delete against Active Directory (AD) or AD LDS (Active Directory Lightweight Directory Services). It can also be used to view replication metadata and Active Directory security descriptors.

## Connecting using ldp.exe

You can connect using LDP.exe by launching ldp.exe, selecting Connection > Connect, and entering the Domain Controller (DC) name or LDS name and its port:

 ![Screenshot of LDP connection window](/.attachments/UserComputerGroupObjectMgmt/LDP.png)

Alternatively, you can launch the command followed by the LDAP server:
- `Ldp.exe localhost` (from the DC)
- `Ldp.exe DC1`
- `Ldp.exe ADLDS:80000`

## Testing connection with SLDAP

Simple bash one-liner:
**`Ldp.exe DC1:636`**

Or from the UI by selecting Connection > Connect:

![Screenshot of LDP connection window](/.attachments/UserComputerGroupObjectMgmt/LDP_1.png)

![Screenshot of LDP connection window](/.attachments/UserComputerGroupObjectMgmt/LDP_2.png)

## Testing LDAP bind

If not chosen, the default Bind type is **"Bind as currently logged on user"**. Other types are "Bind with different user credentials", "Simple bind", or other methods:

![Screenshot of LDP bind options](/.attachments/UserComputerGroupObjectMgmt/LDP_3.png)

### Failure Examples:
````
0 = ldap_set_option(ld, LDAP_OPT_ENCRYPT, 1) 
res = ldap_bind_s(ld, NULL, &NtAuthIdentity, NEGOTIATE (1158)); // v.3 
{NtAuthIdentity: User='administrator'; Pwd=<unavailable>; domain = 'contoso'} 
Error <49>: ldap_bind_s() failed: Invalid Credentials. 
Server error: 80090311: LdapErr: DSID-0C09056D, comment: AcceptSecurityContext error, data 51f, v2580 
Error 0x80090311 No authority could be contacted for authentication. 
````
````
ldap_search_s(ld, "(null)", 2, "(proxyAddresses=smtp:user@contoso.com)", attrList,  0, &msg) 
Error: Search: Operations Error. <1> 
Server error: 000004DC: LdapErr: DSID-0C0906E8, comment: In order to perform this operation a successful bind must be completed on the connection., data 0, v1db1 
Error 0x4DC The operation being requested was not performed because the user has not been authenticated. 
Result <1>: 000004DC: LdapErr: DSID-0C0906E8, comment: In order to perform this operation a successful bind must be completed on the connection., data 0, v1db1 
````
````
res = ldap_simple_bind_s(ld, 'let me in', <unavailable>); // v.3  
Error <53>: ldap_simple_bind_s() failed: Unwilling To Perform  
Server error: 00002035: LdapErr: DSID-0C0903AD, comment: The server has been configured to deny unauthenticated simple binds., data 0, v4563 
Error 0x2035 The server is unwilling to process the request 
````

### Success Example:
````
0 = ldap_set_option(ld, LDAP_OPT_ENCRYPT, 1) 
res = ldap_bind_s(ld, NULL, &NtAuthIdentity, NEGOTIATE (1158)); // v.3 
{NtAuthIdentity: User='NULL'; Pwd=<unavailable>; domain = 'NULL'} 
Authenticated as: 'CONTOSO\sagiv'.
````

## Viewing the Directory NCs and navigating using LDP.exe

You can view the list of directory partitions once you have successfully bound by selecting View > Tree:

 ![Screenshot of LDP tree view](/.attachments/UserComputerGroupObjectMgmt/LDP_4.png)

## Dumping ntds.dit using LDP

- On the menu bar, select **Browse > Modify**.
- Edit for Attribute: **dumpdatabase**.
- Edit for Values: **name ncname objectclass objectguid instancetype isDeleted isRecycled**.
- Click Enter. The Entry List box contains the following entry:
  - [Add]dumpdatabase: name ncname objectclass objectguid instancetype isDeleted isRecycled
- Click the **Extended** and **Run** options.

 ![Screenshot of LDP modify window](/.attachments/UserComputerGroupObjectMgmt/LDP_5.png)

- The NTDS.dmp file is created in the NTDS folder.

## Invoking the two Active Directory SDProp processes

- On the **Browse** menu, click on **Modify**.
- Edit for Attribute: **FixUpInheritance**.
- Edit for Values: **Yes**.
- Click Enter. The Entry List box contains the following entry:
  - [Add]FixUpInheritance: Yes
- Click the **Run** option.

 ![Screenshot of LDP modify window](/.attachments/UserComputerGroupObjectMgmt/LDP_6.png)

- On the **Browse** menu, click on **Modify**.
- Edit for Attribute: **RunProtectAdminGroupsTask**.
- Edit for Values: **1**.
- Click Enter. The Entry List box contains the following entry:
  - [Add]RunProtectAdminGroupsTask: 1
- Click the **Run** option.

 ![Screenshot of LDP modify window](/.attachments/UserComputerGroupObjectMgmt/LDP_7.png)

## Searching the Directory using LDP.exe (including return query statistics)

- On the **Options** menu, click **Controls**.
- In the Controls dialog box, expand the **Load Predefined** pull-down menu, click **Search Stats**, and then click **OK**.

 ![Screenshot of LDP controls window](/.attachments/UserComputerGroupObjectMgmt/LDP_8.png)

- On the **Browse** menu, click **Search**.
- In the Search dialog box, select the **Options** button.
- Ensure the **Extended** check box is selected on the Search Options dialog box and select **OK**.

 ![Screenshot of LDP search options window](/.attachments/UserComputerGroupObjectMgmt/LDP_9.png)

- In the Search window, specify the **Base DN**, the search **filter**, and its **scope**.
- Click on **Run** and check the CallTime, entries Returned, and Visited, etc.

 ![Screenshot of LDP search window](/.attachments/UserComputerGroupObjectMgmt/LDP_10.png)

## Viewing AD object's security descriptors via LDP.exe

You can view the NT Security Descriptors of an object using LDP. The NT Security Descriptor contains the object's Owner, Group, ACL, and SACL.

- To view the "Security Descriptor" of an object, right-click on the object, select Advanced > Security Descriptor.

 ![Screenshot of LDP security descriptor window](/.attachments/UserComputerGroupObjectMgmt/LDP_11.png)

 ![Screenshot of LDP security descriptor window](/.attachments/UserComputerGroupObjectMgmt/LDP_12.png)

- Select **SACL** to retrieve the object's SACL.
- Select **Text dump** to dump the security descriptor as text in the right pane.

 ![Screenshot of LDP text dump window](/.attachments/UserComputerGroupObjectMgmt/LDP_13.png)

If you do not choose any of the above options, the Descriptor dialog box is displayed where you can modify the object's SD, for example:

 ![Screenshot of LDP descriptor dialog box](/.attachments/UserComputerGroupObjectMgmt/LDP_14.png)

 ![Screenshot of LDP descriptor dialog box](/.attachments/UserComputerGroupObjectMgmt/LDP_15.png)


More information  
https://docs.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2012-r2-and-2012/cc771022(v%3Dws.11)