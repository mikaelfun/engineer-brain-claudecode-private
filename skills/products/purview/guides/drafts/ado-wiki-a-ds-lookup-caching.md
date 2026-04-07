---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/AD RMS/How To: AD RMS/How To: DS lookup caching"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAD%20RMS%2FHow%20To%3A%20AD%20RMS%2FHow%20To%3A%20DS%20lookup%20caching"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# Introduction

AD RMS servers query AD via global catalog (GC) servers. These lookups are cached in the AD RMS directory services database. These looks up are cached for 12 hours or more. Group membership changes may take up to 24 hours to update in the AD RMS cache.

One may clear these cached entries, disable the caching, or re-enable the caching if needed. 

**Any script / samples are subject to the disclaimer.**

# Disclaimer
```
******************************************************************************

THIS SOFTWARE/TOOL/INFORMATION IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY 
KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF 
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO 
EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES 
OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, 
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
DEALINGS IN THE SOFTWARE.

******************************************************************************
```

# Samples

## Clearing the existing cache
The following clears all the entries from the caching DB tables.

```
/* Clear all caching table entries in the AD RMS Directory Service DB.

   Need to do an IIS reset on all cluster members after running the  
   following script. 

*/ 

USEDRMS_DirectoryServices_<your database NAME here> 

 
-- Clear all entries from the PrincipalAliases table
DELETE FROM PrincipalAliases 
WHERE PrincipalName !='' 

-- Clear all entries from the GroupAliases table
DELETE FROM GroupAliases 
WHERE GroupName !='' 

-- Clear all entries from the GroupMembership table
DELETE FROM GroupMembership 
WHERE GroupID !='' 

-- Clear all entries from the PrincipalIdentifiers table
DELETE FROM PrincipalIdentifiers 
WHERE PrincipalID !='' 

-- Clear all entries from the PrincipalMembership table
DELETE FROM PrincipalMembership 
WHERE PrincipalID!='' 

-- Clear all entries from the GroupIdentifiers
DELETE FROM GroupIdentifiers
WHERE GroupGUID !='' 
```

## Disabling caching
The following disables any AD lookup caching. All lookups will query a GC.

```
/* Disable GC caching in AD RMS. 
   Need to do an IIS reset on all cluster members after running the  
   following script. 
*/ 

-- Update the USE command to use your configuration database name! 
USE DRMS_Config_ipc_cpandl_com_443 
UPDATE dbo.DRMS_ClusterPolicies 

SET PolicyData = 0 

WHERE PolicyName IN ( 'DirectoryServicesDatabaseGroupCacheExpirationMinutes',  
'DirectoryServicesDatabasePrincipalCacheExpirationMinutes',  
'DirectoryServicesMemoryContactGroupMembershipCacheMaxSize',  
'DirectoryServicesMemoryGroupCacheExpirationMinutes',  
'DirectoryServicesMemoryGroupIdCacheMaxSize',  
'DirectoryServicesMemoryGroupMembershipCacheMaxSize',  
'DirectoryServicesMemoryPrincipalCacheExpirationMinutes',  
'DirectoryServicesMemoryPrincipalCacheMaxSize'); 
```

## Enabling caching
The following re-enables AD RMS AD query caches. It uses the default settings from a Windows Server 2019 AD RMS server.
```
/* Enables GC caching in AD RMS. 
   Caching is reset to AD RMS 2019 default settings. 

   Need to do an IIS reset on all cluster members after running the  
   following script. 

*/ 

-- Update the USE command to use your configuration database name! 
USE DRMS_Config_ipc_cpandl_com_443 

UPDATE dbo.DRMS_ClusterPolicies 

SET PolicyData = 720 
WHERE PolicyName IN ( 'DirectoryServicesDatabaseGroupCacheExpirationMinutes',  
'DirectoryServicesDatabasePrincipalCacheExpirationMinutes',  
'DirectoryServicesMemoryGroupCacheExpirationMinutes',  
'DirectoryServicesMemoryPrincipalCacheExpirationMinutes'); 

UPDATE dbo.DRMS_ClusterPolicies 
SET PolicyData = 1000 
WHERE PolicyName IN ('DirectoryServicesMemoryContactGroupMembershipCacheMaxSize'); 

UPDATE dbo.DRMS_ClusterPolicies 
SET PolicyData = 10000 
WHERE PolicyName IN ( 'DirectoryServicesMemoryGroupIdCacheMaxSize',  
'DirectoryServicesMemoryGroupMembershipCacheMaxSize',  
'DirectoryServicesMemoryPrincipalCacheMaxSize'); 
```

# Links
 - _Ignore the title - it is about clearing the cache_ [AD RMS Policy Templates](https://docs.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2008-R2-and-2008/ee221094(v=ws.10)?redirectedfrom=MSDN)
