---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AD Changes in Windows Server 2025 and Windows 11 24H2/dMSA - Delegated Managed Service Account/Sample log analysis/Creation dMSA account & Configure permissions for client"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAD%20Changes%20in%20Windows%20Server%202025%20and%20Windows%2011%2024H2%2FdMSA%20-%20Delegated%20Managed%20Service%20Account%2FSample%20log%20analysis%2FCreation%20dMSA%20account%20%26%20Configure%20permissions%20for%20client"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1569488&Instance=1569488&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1569488&Instance=1569488&Feedback=2)

___
<div id='cssfeedback-end'></div>

[[_TOC_]]

#Successful creation of a dMSA account
Analyzing good logs is crucial for troubleshooting software issues because they provide a detailed record of the system's operations, helping to identify deviations from normal behavior. Using the Kepner-Tregoe (KT) process, one can systematically evaluate logs by first defining the problem, then gathering and analyzing data to determine its cause. 

Logs reveal what works well under normal conditions, establishing a baseline. When issues arise, comparing current logs to this baseline highlights discrepancies, making it easier to pinpoint and resolve the problem. Effective log analysis thus accelerates problem-solving and enhances system reliability by quickly identifying and addressing the root cause of issues

<span style="color:Orange">**Important:** <br>

The following log analysis consists of snippets and does not represent a comprehensive examination. 

**The below sample log analysis is for 2 scenario:**

- Creation of new dMSA account
- Assigning the permissions to the client machine to retreive password of dMSA (PrincipalsAllowedToRetrieveManagedPassword)

**Sample Log location**
[Creation & Assigning permissions sample log location](https://microsoft.sharepoint.com/:t:/t/CSSLearningWindowsCommercial/EfSuvL7bOgFPt130Y2wJ6Q0BO9E3cJbsHqCEF3bwZ3hetA?e=2Wzri1)

##Log Analysis of Creation of new dMSA

**Logs that was enabled on the Windows Server 2025 Domain Controller**

Configure NTDSA logging & tracing by running the below command:

```
Open an elevated command prompt on the Domain Controller
logman create trace "NTDSA" -ow -o c:\NTDSA.etl -p {90717974-98DB-4E28-8100-E84200E22B3F} 0xffffffffffffffff 0xff -nb 16 16 -bs 1024 -mode Circular -f bincirc -max 2048 -ets
```

```
Open a elevated PowerShell command and run the command:
New-ADServiceAccount -CreateDelegatedServiceAccount -KerberosEncryptionType AES256 -Name dMSASharepoint -DNSHostName dMSASharepoint.contoso.com
```

###Step1: Validating if the schema is msds-delegatedmsastate attribute is present

```
[2] 0374.0600::07/08/24-14:41:02.4083761 [dblayer] dbopt_c5531 dbOptFilterEx() - Search using filter: ( &  (objectClass=attributeSchema)  (lDAPDisplayName=msds-delegatedmsastate) )  Scope:0x2
[2] 0374.0600::07/08/24-14:41:02.4083766 [dblayer] dbopt_c5545 dbOptFilterEx() - Searching filter tree for indices pFil:0000025C8CFC2540
[2] 0374.0600::07/08/24-14:41:02.4083773 [dblayer] dbopt_c3498 dbCollectIndicesAndFilter() - Creating KEY_INDEX for AND filter pFil:0000025C8CFC2540 count:2
[2] 0374.0600::07/08/24-14:41:02.4083782 [dblayer] dbopt_c1616 dbCollectIndicesItemFilter() - Creating KEY_INDEX for filters pFil1:0000025C8CFC2600 pFil1->pIndex:0000000000000000 pFil1->pAC:<NULL> pFil2:0000000000000000 pFil2->pIndex:0000000000000000 pFil2->pAC:<NULL>
[2] 0374.0600::07/08/24-14:41:02.4083793 [dblayer] dbopt_c1694 dbCollectIndicesItemFilter() - Item filter attcache resolved pFil1:0000025C8CFC2600 name:objectClass attSearchFlags:0x9
[2] 0374.0600::07/08/24-14:41:02.4083801 [DBLayer] dbjetex_c2183 JetSetCurrentIndex4Exception() - Set the current index. sesid:0000025C8B2F0920 tableid:0000025C8B3D1280 szIndexName:INDEX_00000000 grbit:0 dsid:0x2100363
[2] 0374.0600::07/08/24-14:41:02.4083819 [dblayer] dbopt_c1804 dbCollectIndicesItemFilter() - Switched to index:INDEX_00000000
[2] 0374.0600::07/08/24-14:41:02.4083837 [dblayer] dbsearch_c5404 dbMakeKeyIndex() - Creating KEY_INDEX for szIndex:INDEX_00000000 MakeKeyOption:0x0 fUseSearchTable:0 fGetNumRecs:-1 fSetCurrentIndex:0 cIndexRanges:1
[2] 0374.0600::07/08/24-14:41:02.4083917 [dblayer] dbsearch_c5570 dbMakeKeyIndex() - JetGetRecordPositionEx for lower bound returned centriesLT:5028 and RecPos.centriesTotal:11025
[2] 0374.0600::07/08/24-14:41:02.4083920 [dblayer] dbsearch_c5687 dbMakeKeyIndex() - Making key for upper bound
[2] 0374.0600::07/08/24-14:41:02.4083985 [dblayer] dbsearch_c5802 dbMakeKeyIndex() - JetGetRecordPositionEx for upper bound returned centriesLT:6494 and RecPos.centriesTotal:10955
[2] 0374.0600::07/08/24-14:41:02.4083990 [dblayer] dbtools_c9125 dbComputeApproximateRecordCount() - BeginPos.centriesLT:5028 BeginPos.centriesTotal:11025 EndPos.centriesLT:6494 EndPos.centriesTotal:10955 ullNormalizedEntriesTotal:10990 ullNormalizedEntriesBeforeBegin:5013 ullNormalizedEntriesBeforeEnd:6515 dwApproxCount:1503
[2] 0374.0600::07/08/24-14:41:02.4084027 [dblayer] dbopt_c2262 dbCollectIndicesItemFilter() - Created KEY_INDEX for filters filter:(objectClass=attributeSchema:1503) pIndex:0000025C8CFC2F20 indexName:INDEX_00000000 pFil1:0000025C8CFC2600 pFil2:0000000000000000 fPDNT:0 fSubtree:0
[2] 0374.0600::07/08/24-14:41:02.4084036 [dblayer] dbopt_c1616 dbCollectIndicesItemFilter() - Creating KEY_INDEX for filters pFil1:0000025C8CFC26E0 pFil1->pIndex:0000000000000000 pFil1->pAC:<NULL> pFil2:0000000000000000 pFil2->pIndex:0000000000000000 pFil2->pAC:<NULL>
[2] 0374.0600::07/08/24-14:41:02.4084040 [dblayer] dbopt_c1694 dbCollectIndicesItemFilter() - Item filter attcache resolved pFil1:0000025C8CFC26E0 name:lDAPDisplayName attSearchFlags:0x9
[2] 0374.0600::07/08/24-14:41:02.4084048 [DBLayer] dbjetex_c2183 JetSetCurrentIndex4Exception() - Set the current index. sesid:0000025C8B2F0920 tableid:0000025C8B3D1280 szIndexName:INDEX_000201CC grbit:0 dsid:0x2100363
[2] 0374.0600::07/08/24-14:41:02.4084061 [dblayer] dbopt_c1804 dbCollectIndicesItemFilter() - Switched to index:INDEX_000201CC
[2] 0374.0600::07/08/24-14:41:02.4084070 [dblayer] dbsearch_c5404 dbMakeKeyIndex() - Creating KEY_INDEX for szIndex:INDEX_000201CC MakeKeyOption:0x0 fUseSearchTable:0 fGetNumRecs:-1 fSetCurrentIndex:0 cIndexRanges:1
[2] 0374.0600::07/08/24-14:41:02.4169801 [dblayer] dbsearch_c5570 dbMakeKeyIndex() - JetGetRecordPositionEx for lower bound returned centriesLT:718 and RecPos.centriesTotal:1620
[2] 0374.0600::07/08/24-14:41:02.4169809 [dblayer] dbsearch_c5687 dbMakeKeyIndex() - Making key for upper bound
[2] 0374.0600::07/08/24-14:41:02.4170085 [dblayer] dbopt_c2262 dbCollectIndicesItemFilter() - Created KEY_INDEX for filters filter:(lDAPDisplayName=msds-delegatedmsastate:1) pIndex:0000025C8CFC31F0 indexName:INDEX_000201CC pFil1:0000025C8CFC26E0 pFil2:0000000000000000 fPDNT:0 fSubtree:0
[2] 0374.0600::07/08/24-14:41:02.4170118 [dblayer] dbopt_c5567 dbOptFilterEx() - Search completed for filter tree for indices pFil:0000025C8CFC2540 indexCount:2
[2] 0374.0600::07/08/24-14:41:02.4170176 [dblayer] dbopt_c5586 dbOptFilterEx() - Filter tree state after collect indices pFil: ( &  (objectClass=attributeSchema:1503)  (lDAPDisplayName=msds-delegatedmsastate:1) ) 
```

###Step2: Creating the dMSA account dMSASharepoint account 

```
[0] 0374.0600::07/08/24-14:41:02.4323197 [LDAP] command_cxx4897 LDAP_CONN::AddRequest() - Adding object. DN:CN=dMSASharepoint,CN=Managed Service Accounts,DC=contoso,DC=com AttrCount:7
[0] 0374.0600::07/08/24-14:41:02.4323197 [LDAP] command_cxx4897 LDAP_CONN::AddRequest() - Adding object. DN:CN=dMSASharepoint,CN=Managed Service Accounts,DC=contoso,DC=com AttrCount:7
[0] 0374.0600::07/08/24-14:41:02.4333541 [dblayer] dbcache_c1962 dnGetCacheByPDNTRdn() - Found record in global cache cGlobalCacheHits:2 pCachedName:DNT=0xBD2-PDNT=0x2-NCDNT=0xBEB-rdnType=0x150019-sdID=0x0-dwHashRDN=0x23259FD-Guid=00000000-0000-0000-0000-000000000000-objClass=0x3000D-objFlag=0x0-sidLen=0-sid=<None>-RDN=<com>-Ancestors=<NOT_YET>
[0] 0374.0600::07/08/24-14:41:02.4333547 [dblayer] dbsubj_c3833 dbGetDNTFromStringName() - Found name component iNamePart:0 DNT:0xbd2 GUID:00000000-0000-0000-0000-000000000000 RDN:com objflag:0
[0] 0374.0600::07/08/24-14:41:02.4333758 [dblayer] dbcache_c1962 dnGetCacheByPDNTRdn() - Found record in global cache cGlobalCacheHits:2 pCachedName:DNT=0xBD3-PDNT=0xBD2-NCDNT=0x2-rdnType=0x150019-sdID=0x49-dwHashRDN=0x2326739F-Guid=203dee99-6b9f-421f-a556-cf984764da5f-objClass=0xA0043-objFlag=0x1-sidLen=24-sid=<S-1-5-21-2422538340-773130246-1656619828>-RDN=<contoso>-Ancestors=<NOT_YET>
[0] 0374.0600::07/08/24-14:41:02.4333762 [dblayer] dbsubj_c3833 dbGetDNTFromStringName() - Found name component iNamePart:1 DNT:0xbd3 GUID:00000000-0000-0000-0000-000000000000 RDN:contoso objflag:1
[0] 0374.0600::07/08/24-14:41:02.4333941 [dblayer] dbcache_c2043 dnGetCacheByPDNTRdn() - Found record in local cache pCachedName:DNT=0xBE5-PDNT=0xBD3-NCDNT=0xBD3-rdnType=0x3-sdID=0x96-dwHashRDN=0x2FE429A9-Guid=a80f7b1d-5456-4b90-ad56-83e6699633ca-objClass=0x30017-objFlag=0x1-sidLen=0-sid=<None>-RDN=<Managed Service Accounts>-Ancestors=<NOT_YET>
[0] 0374.0600::07/08/24-14:41:02.4333945 [dblayer] dbsubj_c3833 dbGetDNTFromStringName() - Found name component iNamePart:2 DNT:0xbe5 GUID:00000000-0000-0000-0000-000000000000 RDN:Managed Service Accounts objflag:1
[0] 0374.0600::07/08/24-14:41:02.4333950 [dblayer] dbsubj_c4268 dbGetDNTFromStringName() - Found DN by stringname name:CN=Managed Service Accounts,DC=contoso,DC=com 
[2] 0374.0600::07/08/24-14:41:02.4449811 [dblayer] dbsubj_c3674 dbGetDNTFromStringName() - Retreived GUID from last component DN:CN=dMSASharepoint,CN=Managed Service Accounts,DC=contoso,DC=com GUID:6e7ea51c-2c19-4964-9171-588ed02830f1
2] 0374.0600::07/08/24-14:41:02.4449863 [dblayer] dbsubj_c3238 dbGetDNTFromDSName() - Failed to find name:CN=dMSASharepoint,CN=Managed Service Accounts,DC=contoso,DC=com GUID:6e7ea51c-2c19-4964-9171-588ed02830f1 ret:8333
[2] 0374.0600::07/08/24-14:41:02.4449878 [dblayer] dbtools_c2087 dbInitRec() - Initializing Jet record JetRetrieveBits:0x0 JetCacheRec:0 JetNewRec:-1 fIsMetaDataCached:0 fIsLinkMetaDataCached:0
[2] 0374.0600::07/08/24-14:41:02.4449931 [dblayer] dbtools_c2147 dbInitRec() - Completed Jet record init DNT:5253
[2] 0374.0600::07/08/24-14:41:02.4449935 [dblayer] dbobj_c2334 DBAddAttVal2() - Adding value for attr:0X90002
[2] 0374.0600::07/08/24-14:41:02.4450039 [CORE] mdadd_c2611 SetAtts() - Setting att:objectSid
[2] 0374.0600::07/08/24-14:41:02.4450056 [CORE] mdupdate_c8005 AddAtt() - Adding attribute:0x90092 name:objectSid
[2] 0374.0600::07/08/24-14:41:02.4450130 [CORE] mdadd_c2611 SetAtts() - Setting att:sAMAccountName
[2] 0374.0600::07/08/24-14:41:02.4450133 [CORE] mdupdate_c8005 AddAtt() - Adding attribute:0x900dd name:sAMAccountName
[2] 0374.0600::07/08/24-14:41:02.4450160 [CORE] mdadd_c2611 SetAtts() - Setting att:userAccountControl
[2] 0374.0600::07/08/24-14:41:02.4450164 [CORE] mdupdate_c8005 AddAtt() - Adding attribute:0x90008 name:userAccountControl
[2] 0374.0600::07/08/24-14:41:02.4450182 [CORE] mdadd_c2611 SetAtts() - Setting att:localPolicyFlags
[2] 0374.0600::07/08/24-14:41:02.4450186 [CORE] mdupdate_c8005 AddAtt() - Adding attribute:0x90038 name:localPolicyFlags
[2] 0374.0600::07/08/24-14:41:02.4450199 [CORE] mdadd_c2611 SetAtts() - Setting att:objectClass
[2] 0374.0600::07/08/24-14:41:02.4450202 [CORE] mdupdate_c8005 AddAtt() - Adding attribute:0x0 name:objectClass
[2] 0374.0600::07/08/24-14:41:02.4450216 [CORE] mdadd_c2611 SetAtts() - Setting att:sAMAccountType
[2] 0374.0600::07/08/24-14:41:02.4450219 [CORE] mdupdate_c8005 AddAtt() - Adding attribute:0x9012e name:sAMAccountType
[2] 0374.0600::07/08/24-14:41:02.4450239 [CORE] mdadd_c2611 SetAtts() - Setting att:dNSHostName
[2] 0374.0600::07/08/24-14:41:02.4450243 [CORE] mdupdate_c8005 AddAtt() - Adding attribute:0x9026b name:dNSHostName
[2] 0374.0600::07/08/24-14:41:02.4450268 [CORE] mdadd_c2611 SetAtts() - Setting att:msDS-DelegatedMSAState
[2] 0374.0600::07/08/24-14:41:02.4450272 [CORE] mdupdate_c8005 AddAtt() - Adding attribute:0x90944 name:msDS-DelegatedMSAState
[2] 0374.0600::07/08/24-14:41:02.4450288 [CORE] mdadd_c2611 SetAtts() - Setting att:msDS-ManagedPasswordInterval
[2] 0374.0600::07/08/24-14:41:02.4450298 [CORE] mdupdate_c8005 AddAtt() - Adding attribute:0x90897 name:msDS-ManagedPasswordInterval
[2] 0374.0600::07/08/24-14:41:02.4450316 [CORE] mdadd_c2611 SetAtts() - Setting att:msDS-SupportedEncryptionTypes
[2] 0374.0600::07/08/24-14:41:02.4450319 [CORE] mdupdate_c8005 AddAtt() - Adding attribute:0x907ab name:msDS-SupportedEncryptionTypes
[2] 0374.0600::07/08/24-14:41:02.4450337 [CORE] mdadd_c2611 SetAtts() - Setting att:nTSecurityDescriptor
[2] 0374.0600::07/08/24-14:41:02.4450341 [CORE] mdupdate_c8005 AddAtt() - Adding attribute:0x20119 name:nTSecurityDescriptor
[2] 0374.0600::07/08/24-14:41:02.4460946 [CORE] mdadd_c3137 SetSpecialAtts() - Setting special attribute object:CN=dMSASharepoint,CN=Managed Service Accounts,DC=contoso,DC=com
[2] 0374.0600::07/08/24-14:41:02.4460990 [dblayer] dbobj_c2334 DBAddAttVal2() - Adding value for attr:0
[2] 0374.0600::07/08/24-14:41:02.4461000 [dblayer] dbobj_c2334 DBAddAttVal2() - Adding value for attr:0
[2] 0374.0600::07/08/24-14:41:02.4461025 [dblayer] dbobj_c2334 DBAddAttVal2() - Adding value for attr:0
[2] 0374.0600::07/08/24-14:41:02.4461040 [dblayer] dbobj_c2334 DBAddAttVal2() - Adding value for attr:0
[2] 0374.0600::07/08/24-14:41:02.4461047 [dblayer] dbobj_c2334 DBAddAttVal2() - Adding value for attr:0
[2] 0374.0600::07/08/24-14:41:02.4461055 [dblayer] dbobj_c2334 DBAddAttVal2() - Adding value for attr:0
[2] 0374.0600::07/08/24-14:41:02.4461069 [dblayer] dbobj_c2334 DBAddAttVal2() - Adding value for attr:0X20001
[2] 0374.0600::07/08/24-14:41:02.4461094 [dblayer] dbobj_c2334 DBAddAttVal2() - Adding value for attr:0X31
[2] 0374.0600::07/08/24-14:41:02.4461099 [dblayer] dbsyntax_c839 ExtIntDist() - Translating external DSNAME:CN=dMSASharepoint,CN=Managed Service Accounts,DC=contoso,DC=com 
[2] 0374.0600::07/08/24-14:41:02.4527463 [CORE] mdadd_c2225 LocalAdd() - Added object name:CN=dMSASharepoint,CN=Managed Service Accounts,DC=contoso,DC=com
[2] 0374.0600::07/08/24-14:41:02.4527823 [dblayer] dbsubj_c2803 dbGetDNTFromDSName() - Params name:NameLen=63-Name=<CN=dMSASharepoint,CN=Managed Service Accounts,DC=contoso,DC=com>-GUID=6e7ea51c-2c19-4964-9171-588ed02830f1-SidLen:28-Sid=<S-1-5-21-2422538340-773130246-1656619828-1111> ulFlags:0x0 fSearchByGuid:1 fSearchByStringName:1 fSearchBySid:0
Ancestors=<NOT_YET>
[2] 0374.0600::07/08/24-14:41:02.4636296 [CORE] mdmod_c2035 LocalModify() - Modifying object:CN=dMSASharepoint,CN=Managed Service Accounts,DC=contoso,DC=com callerType:[::1]:51729
[2] 0374.0600::07/08/24-14:41:02.4636310 [CORE] thstate_c1711 SetActiveThreadStateLdapDnDSAllocString() - pTHS:0000025CFFF03D48 operationID:73a9444b-6b5c-4194-a963-092e47035f3f ThreadInfo:CN=dMSASharepoint,CN=Managed Service Accounts,DC=contoso,DC=com
[2] 0374.0600::07/08/24-14:41:02.4636322 [CORE] mdmod_c1471 LocalModify_SpecialAttributes() - Modify object:CN=dMSASharepoint,CN=Managed Service Accounts,DC=contoso,DC=com DNT:5253 fSAM:-1
[2] 0374.0600::07/08/24-14:41:02.4636434 [CORE] mdupdate_c8069 ReplaceAtt() - Replacing value for attribute:0x90034
[0] 0374.0600::07/08/24-14:41:02.4853473 [CORE] thstate_c2567 free_thread_state() - pTHS:0000025CFFF03D48 operationID:73a9444b-6b5c-4194-a963-092e47035f3f dsInternalOperationID:222221bc-9561-40ef-ac18-d9d71bfe5d78 functionName:ldap_add LdapDN:CN=dMSASharepoint,CN=Managed Service Accounts,DC=contoso,DC=com memoryUsage:110031
[0] 0374.0600::07/08/24-14:41:02.4853492 [CORE] thstate_c1286 SetActiveThreadStateInfoDSAllocString() - pTHS:0000025CFFF03D48 operationID:73a9444b-6b5c-4194-a963-092e47035f3f ThreadInfo:Inactive
```

##Assigning the permissions to the client machine to retreive password of dMSA (PrincipalsAllowedToRetrieveManagedPassword)
In the below command we are assigning the member machine account to retrieve the password of dMSASharepoint dMSA account

Configure NTDSA logging & tracing by running the below command:
**Logs that was enabled on the Windows Server 2025 Domain Controller**

```
Open an elevated command prompt on the Domain Controller
logman create trace "NTDSA" -ow -o c:\NTDSA.etl -p {90717974-98DB-4E28-8100-E84200E22B3F} 0xffffffffffffffff 0xff -nb 16 16 -bs 1024 -mode Circular -f bincirc -max 2048 -ets
```
Command to assign permissions to the member machine account on the dMSASharepoint account
```
Set-ADServiceAccount -Identity dMSASharepoint -PrincipalsAllowedToRetrieveManagedPassword member$
```

###Log Analysis

Checking if the dMSA account dMSASharepoint is present

```
[1] 0374.0CF8::07/08/24-14:45:45.7982708 [dblayer] dbopt_c5531 dbOptFilterEx() - Search using filter: ( &  ( |  (sAMAccountName=dMSASharepoint)  (sAMAccountName=dMSASharepoint$) )  ( |  ( &  (objectClass=msDS-ManagedServiceAccount)  (objectCategory=CN=ms-DS-Managed-Service-Account,CN=Schema,CN=Configuration,DC=contoso,DC=com) )  (objectClass=msDS-GroupManagedServiceAccount)  (objectClass=msDS-DelegatedManagedServiceAccount) ) )  Scope:0x2
```
Checking if the machine account member is present and assigning permissions

```
[0] 0374.0CF8::07/08/24-14:45:45.8051977 [dblayer] dbopt_c5531 dbOptFilterEx() - Search using filter: ( &  (sAMAccountName=member$)  ( |  (objectClass=group)  (objectClass=user) ) )  Scope:0x2
[0] 0374.0CF8::07/08/24-14:45:45.8052578 [dblayer] dbfilter_c5616 dbChooseOptimizedIndex() - Found firstFilter:(sAMAccountName=member$:1) pOptimizedIndex:0000025C8E9AB1B0 bIsForSort:0 ulEstimatedRecsInRange:1
[0] 0374.0CF8::07/08/24-14:45:45.8052584 [dblayer] dbfilter_c6471 dbChooseIndex() - Optimized index is better than default index pOptimizedIndex:(sAMAccountName=member$:1) pDefaultIndex:(DNT_index=*:3120) pOptimizedIndex:0000025C8E9AB1B0 pDefaultIndex:0000025C8E9AAE10 pOptimizedIndex->ulEstimatedRecsInRange:1 pDefaultIndex->ulEstimatedRecsInRange:3120
[0] 0374.0CF8::07/08/24-14:45:45.8052587 [dblayer] dbfilter_c6536 dbChooseIndex() - Cannot intersect with default index defaultIndexInfo.fDontIntersectDefaultIndex:1
[0] 0374.0CF8::07/08/24-14:45:45.8052592 [dblayer] dbfilter_c6630 dbChooseIndex() - No possible intersection of scope and filter index ranges so use smaller index range filter:(sAMAccountName=member$:1) pDB->Key.pIndex:0000025C8E9AB1B0 pAC:sAMAccountName index:INDEX_000900DD ulEstimatedRecsInRange:1
[0] 0374.0CF8::07/08/24-14:45:45.8052606 [CORE] mdsearch_c2635 FindFirstSearchObject() - Candidate pIndex:0000025C8E9AB1B0 indexName:INDEX_000900DD isIntersection:0 ulEstimatedRecsInRange:1
[0] 0374.0CF8::07/08/24-14:45:45.8052612 [DBLayer] dbjetex_c2183 JetSetCurrentIndex4Exception() - Set the current index. sesid:0000025C8B2F1460 tableid:0000025C8B3DCCE0 szIndexName:INDEX_000900DD grbit:0 dsid:0x20a092d
```