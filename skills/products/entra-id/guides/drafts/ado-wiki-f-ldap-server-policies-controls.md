---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/LDAP/LDAP Server/LDAP Server: More Information"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/LDAP/LDAP%20Server/LDAP%20Server%3A%20More%20Information"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/890420&Instance=890420&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/890420&Instance=890420&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This document provides an overview of LDAP (Lightweight Directory Access Protocol) policies, controls, and error handling to help you manage and troubleshoot LDAP queries effectively.

[[_TOC_]]
<BR>

# What can be controlled on server side?

## LDAP policies

LDAP policies are specified using the `lDAPAdminLimits` attribute. The `lDAPAdminLimits` attribute of a `queryPolicy` object is a multivalued string where each string value encodes a name-value pair. In the encoding, the name and value are separated by an "=". For example, the encoding of the name "MaxActiveQueries" with value "0" is "MaxActiveQueries=0". Each name is the name of an LDAP policy, and the value is a value of that policy.

There can be multiple `queryPolicy` objects in a forest. A Domain Controller (DC) determines the `queryPolicy` object that contains its policies according to the following logic:
- If the `queryPolicyObject` attribute is present on the DC's `nTDSDSA` object, the DC uses the `queryPolicy` object referenced by it.
- Otherwise, if the `queryPolicyObject` attribute is present on the `nTDSSiteSettings` object for the site to which the DC belongs, the DC uses the `queryPolicy` object referenced by it.
- Otherwise, the DC uses the `queryPolicy` object whose Distinguished Name (DN) is "CN=Default Query Policy,CN=Query-Policies" relative to the `nTDSService` object (for example, "CN=Default Query Policy, CN=Query-Policies, CN=Directory Service, CN=Windows NT, CN=Services" relative to the root of the config Naming Context (NC)).

Further details about LDAP policies can be found in the following articles:

- [LDAP Policies | Microsoft Learn](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-adts/3f0137a1-63df-400c-bf97-e1040f055a99)
- [Active Directory LDAP Policy - TechNet Wiki](https://social.technet.microsoft.com/wiki/contents/articles/14559.active-directory-ldap-policy.aspx)

## LDAP controls

LDAP version 3 (LDAPv3) operations can be customized through the use of controls. The clients choose which ones to use, but the server decides which ones it supports.

- [Using Controls | Microsoft Learn](https://learn.microsoft.com/en-us/previous-versions/windows/desktop/ldap/using-controls)
- [LDAP Extended Controls | Microsoft Learn](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-adts/3c5e87db-4728-4f29-b164-01dd7d7391ea)

# Processing search results
##Paging search results
LDAP clients can retrieve a result set in small pieces. The Simple Paged Result extended control allows this type of retrieval. This can be useful when the client is accessing the server across a slow connection, or when the number of items returned from a query exceeds the server-side administrative limit (the default of `MaxPageSize` is 1,000).

The interaction between client and server is as follows:
1.	The client sends the server a search request with the Simple Paged Results control (OID 1.2.840.113556.1.4.319), an empty cookie and the initial page size
2.	The server returns the number of entries specified by the page size and the cookie, which contains information about where to continue the search later
3.	The client sends the next search request with the same parameters and the same cookie included
4.	The server sends the next set of results based on the information from the cookie, then updates the cookie as well to know where to continue later. If the number of objects doesnt fill the page, the LDAP query is complete, and the response contains no page cookie.
5.	If no cookie is returned by the server, the client must consider the paged search to be successfully complete

More information: [How LDAP Server Cookies Are Handled | Microsoft Learn](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/how-ldap-server-cookies-are-handled)

##Ranged attribute retrieval
When retrieving the values from a multivalued attribute, LDAP servers often place limits on the maximum number of attribute values that can be retrieved in a single query. This is controlled by the `MaxValRange` policy.  If an attribute has more members than can be returned by the server in a single call, the only way to enumerate all of the attribute values is through the use of the **range** option. Range retrieval involves requesting a limited number of attribute values in a single query.

The interaction between client and server is as follows:
1. The client specifies the range and the attribute it would like to query. For example, to retrieve the 1st through the 1500th values of the member attribute, the attributes list in the SearchRequest would specify the AttributeDescription: "member;range=0-1499"
2. The server will then return the range and specify what it was: "member;0-1499=cn=User1"
3. When continuing, client specifies value range it wants to see. For example, to return all the remainder values starting with the 1501st: "member;1500-*"
4. The last set of values returned by the server has an open-end range specifier to let the client know that it returned all the values: "member;1500-*=cn=User1"

More information: [Searching Using Range Retrieval | Microsoft Learn](https://learn.microsoft.com/en-us/previous-versions/windows/desktop/ldap/searching-using-range-retrieval
)
##Sorting search results
When an LDAP client needs search results sorted and is not able or is unwilling to perform the sort itself, the client can request that the server do it. The Sort control allows the client to give the server the information required to sort the result set.

The interaction between client and server is as follows.

The interaction between client and server is as follows:
1. The client sends the server a search request with the Sort control, which specifies the sort keys. Each sort key consists of an AttributeType, an Ordering Rule, and a flag that indicates whether entries are sorted in forward or reverse order.
2. The server then tells the client whether the sorting operation is successful and returns entries.

More information: [[MS-ADTS]: LDAP_SERVER_SORT_OID and LDAP_SERVER_RESP_SORT_OID | Microsoft Learn](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-adts/6b7b93f1-7c1a-45c2-9544-c067b94bba20)


# Matching rules

You can create LDAP filters to search for attributes that are composed of bit flags (such as the `userAccountControl` attribute of user and computer objects, or the `groupType` attribute of group objects). To search against these types of attributes, you need to use bitwise search filters, which are implemented in a search filter as matching rules.

The format of the filter is `(attributename:MatchingRuleOID:=value)`.

We have the following matching rules supported by Windows LDAP servers:


|Capability name	  | OID |
|--|--|
| LDAP_MATCHING_RULE_BIT_AND | 1.2.840.113556.1.4.803 |
|LDAP_MATCHING_RULE_BIT_OR  | 1.2.840.113556.1.4.804 |
|LDAP_MATCHING_RULE_TRANSITIVE_EVAL  | 1.2.840.113556.1.4.1941 |
| LDAP_MATCHING_RULE_DN_WITH_DATA | 1.2.840.113556.1.4.2253 |

As an example, we will use the `userAccountControl` attribute (ref. [UserAccountControl property flags - Windows Server | Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/windows-server/identity/useraccountcontrol-manipulate-account-properties#list-of-property-flags)).

To disable a normal account you need to set the following flags:


| Property flag | Value in hexadecimal | Value in decimal |
|--|--|--|
| ACCOUNTDISABLE	 | 0x0002	 | 2 |
| NORMAL_ACCOUNT	 |0x0200  |  512|




So a disabled normal account has the `userAccountControl` value of 0x0202 (0x0002 + 0x0200). In decimal, its 514.

###LDAP_MATCHING_RULE_BIT_AND
This rule is equivalent to a bitwise "AND" operation. Using the previous example, an AND matching rule looks like this: `(userAccountControl:1.2.840.113556.1.4.803:=514)`.  
This will find objects where the `userAccountControl` value of 2 and 512 are both set, so it returns all normal accounts that are disabled.

###LDAP_MATCHING_RULE_BIT_OR
This rule is equivalent to a bitwise "OR" operation. You can use the matching rule `(userAccountControl:1.2.840.113556.1.4.804:=514)`.  
This will find objects where the `userAccountControl` value of either 2 or 512 is set. So it will return all normal accounts and will return all disabled accounts as well.


# Error handling

LDAP servers return errors in the response in clear text. List of
LDAP API return values is here: <A 
href="https://learn.microsoft.com/en-us/previous-versions/windows/desktop/ldap/return-values">Return
Values | Microsoft Learn</A>

Microsoft Active Directory (AD) returns a hint to the source location where the problem happened.

For Example:  

&nbsp;&nbsp;&nbsp;&nbsp;0000207B: UpdErr: DSID-03050FA3, problem 6002 (OBJ_CLASS_VIOLATION), data 0

&nbsp;&nbsp;&nbsp;&nbsp;DSID: <mark>03050FA3</mark>, 0305 identifies file (dir 3, file 5), 0FA3 is the line in the file (line 4003)

<BR>

This is a response that can later be translated into a file and line number using the tool like this:

 

&nbsp;&nbsp;&nbsp;&nbsp;D:\temp>dsid <mark>03050FA3</mark>

&nbsp;&nbsp;&nbsp;&nbsp;dir 3, file 5 (src\mdadd.c), line 4003  
  
<BR>

This can be used to check the source code while troubleshooting an LDAP error to figure out what caused the error.  


You can download the tool [here](https://supportability.visualstudio.com/d71be795-62a4-4613-9918-217237a648ba/_apis/git/repositories/7d4ee831-cd65-46bb-9527-bae6917085be/items?path=/WindowsDirectoryServices/.attachments/LDAP/dsid.exe&versionDescriptor%5BversionOptions%5D=0&versionDescriptor%5BversionType%5D=0&versionDescriptor%5Bversion%5D=master&resolveLfs=true&%24format=octetStream&api-version=5.0&download=true)

For third-party analysis beyond the LDAP error code explanation, you have to talk to the vendor.

Typical errors:

- WILL_NOT_PERFORM: Request violates higher-level rules of the Directory Server (deletion of protected objects, change to protected attributes)
- Error in attribute conversion: Attribute data does not convert to target type for storage in the database
- NO_OBJECT: Target or subject object (such as when adding DN-type values) does not exist
- INSUFF_ACCESS_RIGHTS: No permissions to change target object in the way desired
- ENTRY_EXISTS: Duplicate value for multi-valued attribute or new target name in use on object rename
- CANT_ON_NON_LEAF: Operation not allowed on non-leaf (like delete objects that have children)
- NAMING_VIOLATION: Schema possible superior does not match the parent for new object
- OBJ_CLASS_VIOLATION: Change violates schema rules for the object

### Common third-party server issues

- Be aware of connectivity issues like IPsec requirements
- No authentication protocol match:
  - Client does not know how to get Kerberos ticket
  - Client does not know/support other security protocols server has
  - No matching encryption algorithms (SASL options)
- Assumes AD schema or may need to be changed for client API differences (such as client expects `Samaccountname` and the server doesnt know this)
- Expects controls that are not supported
- Higher level client APIs do not support non-AD server features:
  - Aliases
  - RDN-type attributes can be multi-value
  - Has problems with more RDN type attribute like `sn`, `UID`, 
  - Specify object using multi-value RDN
- Must use LDAP C or S.DS.P API instead of ADSI or System.Directoryservices


# References

-  [LDAP considerations](https://learn.microsoft.com/en-us/windows-server/administration/performance-tuning/role/active-directory-server)
-  [How
Active Directory Searches Work: Active Directory | Microsoft Learn](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2003/cc755809(v=ws.10))