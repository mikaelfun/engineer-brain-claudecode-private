---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AD Changes in Windows Server 2025 and Windows 11 24H2/Jet 32K Feature"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAD%20Changes%20in%20Windows%20Server%202025%20and%20Windows%2011%2024H2%2FJet%2032K%20Feature"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1669792&Instance=1669792&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1669792&Instance=1669792&Feedback=2)

___
<div id='cssfeedback-end'></div>

![VNext-Banner.png](/.attachments/VNext-Banner-098bb40b-bb91-44b9-9e54-14a3e12b6701.png)

[[_TOC_]]

<span style="color:CornflowerBlue">**Note:** <span style="color:Black">Before diving into the details of the new feature, this document provides a primer on the topic to ensure readers have the necessary background and context to fully understand the changes.

#**Pre-Req information**
- ESE Deep Dive: Part 1: The Anatomy of an ESE database [Click here](https://techcommunity.microsoft.com/t5/ask-the-directory-services-team/ese-deep-dive-part-1-the-anatomy-of-an-ese-database/ba-p/400496#:~:text=This%20is%20Linda%20Taylor%2C%20Senior,:%2D%20))
- Extensible Storage engine [Click here](https://learn.microsoft.com/en-us/windows/win32/extensible-storage-engine/extensible-storage-engine)


# Historic JET information
In Active Directory (AD), the **JET (Joint Engine Technology)** database engine is used to store and manage the AD database (NTDS.DIT). 

AD uses JET database as underlying data storage.  An AD object is stored in JET as a row in the database.  A row in JET is stored in a JET page.  Each row starts from a main page, with each non-empty column in that row either stores its value directly on the main page if the value size is <= 4 bytes(or 8 bytes? some constant number that JET chooses), or stores a pointer (LVID- long value ID in JETs term, 4 bytes) in the main page pointing to an off-page storage place to the real value of this attribute.  

This design introduces the maximum number of multi-value attribute in AD, that an AD object can only have number of attribute values that can fit in a JET main object page, including all the values from single or multi value attributes

**ESE Client: Server applications using ESE database**

[Read this article for more information about ESE](https://aka.ms/ESEdeepdivePart2)

![image.png](/.attachments/image-cd84cccf-e2b6-4876-b3d4-5990552e18a4.png =800x400)

**Other ESE Client:**
The ESE side of things. AD is one huge client of ESE, but there are many other Windows components which use an ESE database (and non-Microsoft software too), so your knowledge in this area is actually very applicable for those other areas. Some examples are below

![image.png](/.attachments/image-ece8ddaa-ffd9-4287-b03a-1b98ab55264e.png =800x400)

##Default Page Size:

The default page size for this database has historically been 4 KB (kilobytes), but the **8 KB page size** was introduced as an option to improve certain performance and scalability aspects. However, using the **8 KB page size** in AD has some limitations and considerations.

**How to validate a page size:**

You can run esentutl command identify the page size and in the below example you would find that the NTDS.DIT has a page size of 8K.
**esentutl /mh ntds.dit /vss**

![image.png](/.attachments/image-f700da53-0208-4833-b2ee-2bba3a5edbc2.png =400x400)


### Limitations of Using 8 KB Pages in Active Directory

1. **Limited Support for Older Domain Controllers**
   - **Backward Compatibility**: Older domain controllers that use the 4 KB page size are incompatible with a database upgraded to use 8 KB pages. Therefore, if you have domain controllers running older versions of Windows Server (e.g., Windows Server 2008 R2, 2012), they cannot participate in the same domain if some DCs are using 8 KB page sizes.
   - **Upgrade Requirement**: All domain controllers must be upgraded to a Windows Server version that supports the 8 KB page size (typically Windows Server 2016 and later). This limits mixed-version environments.

2. **Migration Complexity**
   - **No Direct Downgrade**: Once the Active Directory database has been upgraded to the 8 KB page size, there is no simple way to downgrade it back to the 4 KB page size. Downgrading would require a full demotion and re-promotion of the domain controller, which can be disruptive.
   - **Backup and Restore Considerations**: If a backup of the database is taken using the 8 KB page size, restoring it to a system expecting 4 KB pages is not possible. This requires careful planning for disaster recovery.

3. **Potential Compatibility Issues with Tools**
   - **Third-Party Tools**: Some third-party tools or applications that interact with Active Directory or the NTDS.DIT file might not be fully tested or compatible with the 8 KB page size. While most tools that work with AD should support the 8 KB format, it is important to verify compatibility before making the switch.
   - **Custom Scripts and Integrations**: If there are custom scripts, integrations, or services built around the AD database, they may need to be reviewed to ensure compatibility with the larger page size.

4. **Impact on Memory and Storage Utilization**
   - **Increased Cache Memory Usage**: Using 8 KB pages can lead to higher memory usage for caching in the database engine, as larger page sizes might require more cache to store commonly accessed data. This could impact the performance on domain controllers with limited memory resources.
   - **Potential Disk Space Impact**: Although the database can become more efficient with larger page sizes, in some cases, this might lead to more disk space usage, especially when dealing with lots of smaller records. More data is packed into each page, which could reduce fragmentation but might also increase the amount of unused space in each page.

5. **Replication Considerations**
   - **Replication Bandwidth**: Although the page size affects the local database storage, it does not directly affect replication itself. However, in environments with both 4 KB and 8 KB page size domain controllers, managing replication between domain controllers might become more complicated, especially during transitions or upgrades.
   - **Replication Latency**: In some scenarios, larger pages might slightly increase latency if domain controllers have to process more data at a time, though this is typically minimal.

6. **Performance Gains May Vary**
   - **Workload-Specific**: The performance benefits of switching to an 8 KB page size are not guaranteed across all environments. The 8 KB page size may improve performance in scenarios with large attributes or dense data, but in environments where records are typically smaller (e.g., most user attributes), the benefits might be marginal or even negative in terms of memory overhead.

7. **Increased Risk of Data Corruption**
   - **Larger Pages Increase Corruption Impact**: With larger pages, if corruption occurs within the database, it can affect more data than with smaller 4 KB pages. A single page corruption could impact more records or indices, potentially making recovery more complex.

## Benefits of 8 KB Pages (Despite Limitations)
While there are limitations, its important to note that the **8 KB page size** also provides some **significant benefits** in certain scenarios, such as:
   - **Improved Performance for Large AD Databases**: In large Active Directory environments with many objects and attributes, using 8 KB pages can reduce database I/O and improve performance.
   - **Reduced Database Fragmentation**: Larger page sizes can help reduce fragmentation within the NTDS.DIT file, improving read/write efficiency.
   - **Better Performance for Large Attributes**: Environments where many objects contain large attributes (e.g., user certificates or other large blobs) may see performance improvements due to fewer I/O operations required to store or retrieve the data.

### Conclusion
Using 8 KB pages in Active Directory can offer performance and scalability benefits, but it comes with limitations related to backward compatibility, potential migration challenges, memory and storage utilization, and third-party tool compatibility. Organizations considering a switch to 8 KB page sizes should carefully weigh these factors, particularly in mixed-version environments or those with resource constraints. Proper testing and planning are essential to avoid potential issues.

___

##**Limitation of JET 8K** 

When using the JET database engine with an 8 KB page size in Active Directory, there are specific limitations related to **attributes** in terms of size, structure, and storage. These limitations impact how Active Directory stores and retrieves attributes within its database, specifically the **NTDS.DIT** file.

Here are the key limitations of attributes with respect to the JET 8 KB page size in Active Directory:

### 1. **Maximum Size of Single Attribute Value**
   - **8 KB Page Size Limitation**: With an 8 KB page size, the maximum size for a single attribute value that can be stored directly in the database is **8 KB minus overhead**. This includes any overhead for indexing or structure management within the database page. Therefore, the largest single value that can be stored efficiently within a page is slightly less than 8 KB.
   - **Implication**: If an attribute value exceeds the page size limit (e.g., a large object like a certificate or a multi-line string), it may require special handling, such as being stored **out-of-page** in a different part of the database. This can affect database performance.

### 2. **Handling of Large Attributes (Multi-Valued or Single Large Attributes)**
   - **Out-of-Page Storage**: For attribute values that are larger than the 8 KB page limit, the JET engine moves them to a separate section of the database known as the **long-value table**. This introduces an additional level of complexity for storage and retrieval, potentially slowing down operations that require reading or writing large attributes.
   - **Performance Impact**: Storing attributes out-of-page can increase the I/O overhead, as accessing such attributes involves more disk reads and writes. This is particularly relevant for multi-valued attributes (e.g., group memberships, user certificates) that can quickly exceed the 8 KB threshold.

### 3. **Multi-Valued Attribute Limits**
   - **Individual Value Size Limit**: Each individual value within a multi-valued attribute is still subject to the 8 KB page size limitation. For example, if an attribute can hold multiple values (e.g., a users group memberships), each value must fit within the 8 KB page size limit.
   - **Overall Multi-Value Limit**: While each individual value in a multi-valued attribute is limited to 8 KB, the overall size of the multi-valued attribute is significantly larger. However, when multiple values are stored out-of-page, it can degrade query performance due to additional overhead in accessing scattered data locations.

### 4. **Attribute Indexing Limitations**
   - **Index Page Size Dependency**: Some attributes are indexed for faster querying. However, the size of the index entries is also constrained by the page size (8 KB in this case). If the indexed attribute values are too large, indexing becomes less efficient, leading to potential performance bottlenecks during searches or lookups.
   - **Index Fragmentation**: When large attributes are stored in separate pages or out-of-page storage, it can cause fragmentation in the index structure, which may degrade the performance of queries that rely on those indices.

### 5. **Attribute Size and Replication**
   - **Replication Overhead**: Large attributes, especially those stored out-of-page, can impact **replication** performance. Replicating large objects between domain controllers involves transmitting larger chunks of data over the network. The larger the attribute, the greater the replication traffic, which can cause delays, especially in environments with limited bandwidth.
   - **Multi-Valued Attributes and Replication**: For multi-valued attributes, especially when large, each value change could trigger more frequent replication, adding to the replication load.

### 6. **Object Size Limit in Active Directory**
   - **Overall Object Size**: While individual attribute values are limited by the 8 KB page size, Active Directory also has a maximum limit for the overall size of an **object** (a user, group, etc.) in the NTDS.DIT database. The maximum size of an entire object in AD is around **2 GB**. However, practical limits (due to performance and replication concerns) are typically much lower.

### 7. **Practical Impact on Large Object Storage (e.g., Binary Data)**
   - **Attributes Like Certificates or BLOBs**: Some attributes store large binary objects (e.g., user certificates, profile data). These large attributes are particularly affected by the 8 KB page size limitation, as they are more likely to be stored out-of-page. This can slow down access to these attributes and may impact applications that depend on large attribute retrieval.

### 8. **Limitations on Large LDAP Queries**
   - **LDAP Query Limits**: Large attributes stored across multiple pages or out-of-page may slow down LDAP queries that target those attributes. The additional I/O required to access fragmented or out-of-page data can increase query latency, particularly for complex searches involving multiple domain controllers or large datasets.

### Summary of Attribute Limitations with 8 KB Pages:
- **Single attribute value size** is limited to 8 KB (minus overhead).
- **Out-of-page storage** is required for attributes exceeding 8 KB, which can affect performance.
- **Multi-valued attributes** are constrained by the 8 KB limit per value, though overall size is much larger.
- **Indexing** large attributes can cause inefficiency and fragmentation, impacting search/query performance.
- **Replication traffic** increases with large attributes, leading to potential delays in environments with slow network links.

While the 8 KB page size increases efficiency for larger objects and reduces fragmentation for large attributes, it introduces complexities and performance considerations that must be carefully managed in environments with large or multi-valued attributes.

______

#JET 32K feature

Active Directory Domain Services (AD DS) and Lightweight Directory Services (LDS) uses an Extensible Storage Engine (ESE) database. Since its introduction in Windows 2000, ESE used an 8k page database size, this architecture limited the scale of forest and domain objects. A 32k page database format offers an improvement in scalability using 64-bit Long Value IDs (LIDs). Multi-valued attributes are now able to hold approximately 3,200 values.

The JET 32k page feature is now using a 32k main object page instead of the previously 8k main object page, that increases the maximum number of values in an object we can support in AD.  This feature also changes the format of a LVID from 4 byte to 8 byte.

This feature does not change the size of a single attribute value we support.  JET database support up to 2147483647 bytes in a single value of binary type.  These are some limitations of some particular attribute size that are imposed by other modules, but not by JET/AD.  For example, I believe the DACL size limitation is set by OS.  

All these limitations are not affected by the 32k page feature.   We do not expect this feature would change either replication speed or database size.  

##Requirements:
Before you can enable the Database 32k pages optional feature in your Active Directory Domain Services, your environment needs to meet the following requirements.

- Your Active Directory forest and domain is operational and free from replication errors. To learn more about replication errors, see Diagnose Active Directory replication failures.
- All domain controllers are running Windows Server 2025 or later, and have a 32k page capable database.
- Domain and forest functional levels are upgraded to Windows Server 2025 or later. To learn more about raising the functional levels, see Raise Active Directory domain and forest functional levels.
- Identify all your DCs hosting the Global Catalog (GC) and FSMO roles. Create and verify backups of these Active Directory Domain Services domain controllers before making changes.
- Validate your backup software is compatible with the 32k page database format by backing up and restoring a 32k page capable database in a test environment.

**Considerations**
When you create a backup of an AD database, the page size of the database is preserved on a backup media. Before Windows Server 2025, all backup media used 8k-page databases, which was the only page size supported. However, a server running Windows Server 2025 or later might have either an 8k or 32k page database format in 8k page simulation mode. For example, a Windows Server 2025 machine might have an 8K page database if it was in-place upgraded from an earlier version. It might have a 32k page database format in 8k page simulation mode if it was:

- Installed as a new DC in a Windows Server 2025 forest.
- Promoted to a DC over-the-wire. For example, promoted as a new replica.
- Restored from a 32k page database format backup image.

Before you enable the Database 32k pages optional feature, you can use either 8k or 32k page database format backup media to restore a Windows Server 2025 domain controller. After you enable the Database 32k pages optional feature, you can only use 32k page database format backup media to restore a Windows Server 2025 domain controller. You should also consider that enabling the larger 32k page sizes can affect server performance due to increased memory usage.

**Warning:** <br>
Once you have enabled the Database 32k pages optional feature, you can't revert back to the previous 8k page simulation mode. As a result, any 8k-page backup media created prior to enabling the feature will be unusable unless you perform a complete authoritative forest recovery.



##Benefits

- The introduction of 32k page support significantly increases the number of attribute values that can be stored in a single object, improving database efficiency. This feature is essential for larger data requirements.

With the increase of the Jet Size 8k to 32k --> 4X attribute values 

**Ex:** For a given Active Directory object increasing the size would now contribute to an single valued attribute can store 3200 attribute values to previously compared to 1200.  (**attribute:** Service Principal name)




##Page Size Modes:

**Windows Server 2025 mode**: If your Active Directory was promoted using a Windows Server 2025 media then the default page size is 32K. 

**8K simulation mode:** 
Consider a scenario where you have Domain Controllers with different operating systems like Windows Server 2022, Windows Server 2016 and Windows Server 2025.

**Native mode:** When all Domain Controllers in the environment is running Windows Server 2025 you can raise the domain and forest functional level to Windows Server 2025 to enable the database to use 32K mode.

##How to enable
The Database 32k pages optional feature offers a huge improvement in scalability. Beginning with Windows Server 2025, new Active Directory forest and domains are installed with a 32k page database format. By default these new forests and domains use an 8k page simulation mode to support previous versions. An upgraded DC continues to use an 8K database format and pages. Moving to a 32k database page-size is a forest-wide operation and requires that all domain controllers in the forest have a 32k page capable database.

##Pre-Requisites to enable

- Review the article [32k pages in Active Directory Domain Services and Active Directory Lightweight Domain Services for other considerations before enabling the 32k page feature](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/32k-pages-optional-feature).
- Your Active Directory domain is operational and free from replication errors. To learn more about replication errors, [see Diagnose Active Directory replication failures.](https://learn.microsoft.com/en-us/troubleshoot/windows-server/active-directory/diagnose-replication-failures)
- All domain controllers are running Windows Server 2025 or later, and have a 32k page capable database.
- Domain and forest functional levels must be upgraded to Windows Server 2025 or later. To learn more about raising the functional levels, see the [article Raise Active Directory domain and forest functional levels.](https://learn.microsoft.com/en-us/troubleshoot/windows-server/active-directory/raise-active-directory-domain-forest-functional-levels)
- Identify all your domain controllers hosting the Global Catalog (GC) and FSMO roles. Create and verify backups of these Active Directory Domain Services domain controllers before making changes.
- Validate your backup software is compatible with the 32k page database format by backing up and restoring a 32k page capable database in a test environment.
- Your account must be a member of the Enterprise Admins group or have equivalent permissions.

**Optional: Verify if you already have a 32k page capable data**
[Read this article to verify](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/enable-32k-pages-optional-feature?tabs=desktop#optional-verify-you-have-a-32k-page-capable-database)

##Enable the feature

The 32k page database size is an optional feature in AD and isn't enabled by default. To enable the Database 32k pages optional feature in your forest or domain, follow the steps.

1. Sign in to a domain controller.
2. Open an elevated PowerShell prompt.
3. Run the following command to enable the Database 32k pages optional feature. In this example, the command enables this feature for the device named vNextDC01.contoso.com in the contoso.com domain. Make sure to replace the values for the Server and Target parameters with your own values.

```
$params = @{
    Identity = 'Database 32k pages feature'
    Scope = 'ForestOrConfigurationSet'
    Server = 'vNextDC01'
    Target = 'contoso.com'
}
Enable-ADOptionalFeature @params
```
4. When you run the command, you're prompted to confirm the action. Enter Yes or Yes to All to proceed. An example of the output is shown in the following image.

![image.png](/.attachments/image-1f607002-e6ae-4927-a359-5062f39e2826.png =1000x400)

5. After the Database 32k pages optional feature is enabled, monitor the replication traffic after the change


# 64 bit LVID (long value ID)

### Technical Summary: Introduction of 64-bit LVID Feature with JET 32k Page

- Incremental, not re-usable resources
- Support more off-page values during a DC database life
- Reduced Offline defragmentation maintanence overhead

The JET 32k page feature in Active Directory introduces a significant enhancement known as the 64-bit Long Value ID (LVID) feature. This feature addresses a critical limitation associated with the storage of large attribute values in the JET database.

In the JET database context, large attribute values that cannot fit within a single database page are stored off-page. These off-page values are referenced using a Long Value ID (LVID), which acts as an index rather than a direct memory pointer. Historically, these LVIDs have been 32-bit, allowing for a maximum of 4 billion unique off-page values. However, once this limit is reached, no additional off-page values can be stored, necessitating an offline defragmentation or a complete rebuild of the domain controller to reclaim LVID space.

The introduction of 64-bit LVIDs with the JET 32k page feature extends the maximum number of unique off-page values significantly, providing a much larger addressable space. This enhancement ensures a longer operational life for domain controllers by reducing the frequency of offline maintenance required to reclaim LVID space. By adopting 64-bit LVIDs, Active Directory environments can now handle a vastly greater number of large attribute values, thereby improving scalability and reducing administrative overhead associated with LVID exhaustion.

An additional feature is activated when the 32K JET feature is enabled. Previously, when a record hit the 8K limit and a new value was added (either a single-column value or a value in a multi-value column), JET could convert some values to JET long values (LV) and store the long-value ID (LVID) on the page. This allowed the actual record size to exceed 8K by using long values, which are employed for binary blobs (octet arrays) and strings.

With a 32K page record, JET long values are only utilized when the total column data size approaches the 32K limit. Therefore, it is not straightforward to sum all value sizes to determine if a record will fit into an 8K page. The logic is more intricate, requiring an assessment of how many values could be potentially replaced with long value IDs. Additionally, long value IDs are 64-bit in 32K replicas and 32-bit in 8K replicas, adding another layer of complexity.

In summary, the 64-bit LVID feature enhances the JET 32k page functionality by significantly increasing the capacity for off-page value storage, resulting in improved efficiency and extended operational periods for domain controllers before maintenance is required.