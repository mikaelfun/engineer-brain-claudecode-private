---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/User, computer, group, and object management/Workflow: DS Object Mgmt: Tools/LDIFDE"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/User%2C%20computer%2C%20group%2C%20and%20object%20management/Workflow%3A%20DS%20Object%20Mgmt%3A%20Tools/LDIFDE"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/419599&Instance=419599&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/419599&Instance=419599&Feedback=2)

___
<div id='cssfeedback-end'></div>

**What is LDIFDE?**

LDIFDE (LDAP Data Interchange Format Directory Exchange) is a powerful tool to dump Active Directory (AD) objects and attributes to a text file from AD in order to view the data or to import it into another AD. It can also be handy for modifying existing objects or creating new ones, such as new schema objects or attributes.

[555636](https://support.microsoft.com/en-us/help/555636) LDIFDE - Export / Import data from Active Directory - LDIFDE commands

### Export all objects in the Users container from DC1
```plaintext
ldifde -f c:\accounts.ldf -d "CN=Users,DC=CONTOSO,DC=COM" -s DC1
```

### Export all LDS objects
```plaintext
ldifde -f c:\ADLDS.ldf -d "DC=test,DC=local" -s localhost:50000
```

### List specific attributes
```plaintext
ldifde -f c:\temp\objects.ldf -d "CN=Users,DC=CONTOSO,DC=COM" -l samaccountname,name
```

### Omit attributes from the output file while exporting objects
```plaintext
ldifde -f c:\DNSzone.ldf -d "DC=contoso.com,CN=MicrosoftDNS,DC=ForestDnsZones,DC=contoso,DC=com" -o instancetype,whencreated,whenchanged,objectguid,dSCorePropagationData,uSNCreated,uSNChanged
```
- The omit parameter is very handy when planning to import the data to a different forest. Without excluding the above attributes, the import will fail as those attributes can only be set by the system.

### Import the above DNS Zone to a different domain
```plaintext
ldifde -i -f "c:\temp\DNSzone.ldf"
```
_TODO: You need to replace the base DN for the other domain with the LDIFDE /C parameter._

### Modify a users attributes
```plaintext
ldifde -i -f "c:\temp\Testuser.ldf"
```
Input file when the attribute exists already:
```plaintext
dn: CN=testuser,OU=Test,DC=CONTOSO,DC=COM
changetype: modify
replace: streetAddress
streetAddress: 5thAvenue
-
```
Input file when the attribute does not exist:
```plaintext
dn: CN=testuser,OU=Test,DC=CONTOSO,DC=COM
changetype: modify
add: streetAddress
streetAddress: 5thAvenue
-
```

### Replace an existing value in a users multi-valued attribute
```plaintext
ldifde -i -f "c:\temp\Testuser.ldf"
```
```plaintext
dn: CN=testuser,OU=Test,DC=CONTOSO,DC=COM
changetype: modify
delete: departmentNumber
departmentNumber: description 1
-
add: departmentNumber
departmentNumber: description 3
-
```

### Blank user's attribute
```plaintext
ldifde -i -f "c:\temp\Testuser.ldf"
```
```plaintext
dn: CN=testuser,OU=Test,DC=CONTOSO,DC=COM
changetype: modify
delete: streetAddress
-
```

### Deleting a user
```plaintext
ldifde -i -f "c:\temp\Testuser3.ldf"
```
```plaintext
dn: CN=testuser3,OU=Test,DC=CONTOSO,DC=COM
changetype: delete
```

### Extending AD schema with your own custom attribute
Before going to edit customer production schema, please talk to an Escalation Engineer (EE) or Support escalation Engineer (SEE) from the ADS Pod.
- See [How To Extend the Schema](https://docs.microsoft.com/en-us/windows/win32/ad/how-to-extend-the-schema)
- By using the below command, the same attribute can be imported to multiple forests without the need to modify the LDIF file with the forest DN.

```plaintext
ldifde -i -f c:\Schema_Ext_v1.ldf -k -j . -c "CN=Schema,CN=Configuration,DC=X" #schemaNamingContext
```
**Schema_Ext_v1.ldf**
```plaintext
dn: CN=NewAttribute,CN=Schema,CN=Configuration,DC=X
changetype: add
adminDescription: NewAttribute
adminDisplayName: NewAttribute
attributeID: 1.2.840.113556.1.8000.2554.999999.31382.44756.19466.38905.11741698.12834678.1.10.2.1
attributeSyntax: 2.5.5.8
cn: NewAttribute
distinguishedName: CN=NewAttribute,CN=Schema,CN=Configuration,DC=X
instanceType: 4
isSingleValued: TRUE
lDAPDisplayName: NewAttribute
name: NewAttribute
objectCategory: CN=Attribute-Schema,CN=Schema,CN=Configuration,DC=X
objectClass: top
objectClass: attributeSchema
oMSyntax: 1
showInAdvancedViewOnly: TRUE

dn:
changetype: modify
add: schemaUpdateNow
schemaUpdateNow: 1
-

dn: CN=user,CN=Schema,CN=Configuration,DC=X
changetype: ntdsSchemaModify
add: mayContain
mayContain: NewAttribute
-

dn:
changetype: modify
add: schemaUpdateNow
schemaUpdateNow: 1
-
```

- Notes:

````
attributeSyntax: 2.5.5.8 
oMSyntax: 1 
are the values for a Boolean attribute. 
````
 
````
attributeSyntax: 2.5.5.9 
oMSyntax: 2 
are the values for a Integer attribute. 
````