---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AD Changes in Windows Server 2025 and Windows 11 24H2/Domain and Forest Functional level"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAD%20Changes%20in%20Windows%20Server%202025%20and%20Windows%2011%2024H2%2FDomain%20and%20Forest%20Functional%20level"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1669786&Instance=1669786&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1669786&Instance=1669786&Feedback=2)

___
<div id='cssfeedback-end'></div>

![VNext-Banner.png](/.attachments/VNext-Banner-098bb40b-bb91-44b9-9e54-14a3e12b6701.png)
[[_TOC_]]

<span style="color:CornflowerBlue">**Note:** <span style="color:Black">Before diving into the details of the new feature, this document provides a primer on the topic to ensure readers have the necessary background and context to fully understand the changes.

**Pre-Req information**
- Active Directory Domain Services functional levels [Click here](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/active-directory-functional-levels)
- Identifying your functional level upgrade [Click here](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/plan/identifying-your-functional-level-upgrade)

#Domain and Forest Functional Levels


**AD Domain and Forest Functional Levels**: Cliff provided a detailed explanation of the domain and forest functional levels in Active Directory, including the introduction of new DFL and FFL with Server 2025. This discussion aimed to prepare the team for supporting customers transitioning to 2025, highlighting the importance of understanding these levels for effective support.

**Why Functional levels:** 

- To gate new features
- Necessary code is present on the DC to handle the feature 

- To introduce Windows Server 2025 DC the pre-req is Windows 2016 DFL & FFL and Upgrade to Windows Server 2016

**More information:**
- Explanation of DFL/FFL: Cliff detailed the purpose of domain and forest functional levels (DFL/FFL) in Active Directory, explaining their role in gating the use of certain features and the requirement for uniformity across domains to enable new functionalities.

- Introduction of New Levels: He mentioned the introduction of new DFL and FFL with Server 2025, noting that the last update was in 2016 and that there were no new levels introduced in 2019 or 2022.

- Transition to Server 2025: Cliff discussed the transition process to Server 2025, including the requirement for a minimum of 2016 DFL/FFL, and the option for in-place upgrades with subsequent reminders to upgrade DFL/FFL.

- Customer Transition Support: The conversation aimed to prepare the team for effectively supporting customers during their transition to Server 2025, emphasizing the importance of understanding the new DFL and FFL.


------------------------------------------------------------------------

# Setting the context: Domain and Forest Functional Levels

In Active Directory (AD), **Domain Functional Level (DFL)** and **Forest Functional Level (FFL)** are configurations that determine the available features in a domain or forest based on the version of Windows Server running on domain controllers. Each level enables certain AD features, but it also requires that all domain controllers (DCs) in the domain or forest run a specific minimum version of Windows Server. 

### 1. **Domain Functional Level (DFL)**
   - **Definition**: DFL defines the functionality available within a single Active Directory domain. It governs which AD features are available based on the Windows Server versions running on the domain controllers in that domain.
   - **Effect**: As you raise the DFL, newer features and enhancements specific to that level become available. However, all domain controllers in the domain must be running at or above the Windows Server version associated with that functional level.
   
   **Examples of features tied to DFL**:
   - **Windows Server 2008 DFL**: Fine-grained password policies.
   - **Windows Server 2012 DFL**: Dynamic Access Control (DAC) and Group Managed Service Accounts (gMSA).
   - **Windows Server 2016 DFL**: Privileged Access Management (PAM) and Azure AD Connect synchronization.

### 2. **Forest Functional Level (FFL)**
   - **Definition**: FFL determines the functionality available across all domains within a forest. It governs the features that require coordination or interaction between multiple domains. Like DFL, FFL restricts the features based on the version of Windows Server running on domain controllers, but at the forest level.
   - **Effect**: When the FFL is raised, it enables features across the entire forest. This means all domains in the forest must have their DFL raised to the corresponding level, and all domain controllers in every domain must meet the same Windows Server version requirement.
   
   **Examples of features tied to FFL**:
   - **Windows Server 2008 FFL**: Cross-domain management of password policies and improved replication topology.
   - **Windows Server 2012 FFL**: Global catalog replication improvements and Active Directory Recycle Bin.
   - **Windows Server 2016 FFL**: Privileged Access Management and improvements in time synchronization (accurate time service).

### Relationship between DFL and FFL
   - **DFL** applies to individual domains, whereas **FFL** applies to the entire forest.
   - The **DFL** must be at or above a minimum level for the **FFL** to be raised.
   - You can have multiple domains within a forest at different DFLs, but the FFL represents the minimum supported level for the entire forest.

### Functional Level Compatibility
   - Before raising the DFL or FFL, ensure all domain controllers are running the appropriate versions of Windows Server that support the new functional level.
   - **Raising** the functional level is a one-way process. Once raised, it cannot be **lowered** back unless you revert the domain controllers or restore from a backup.

### Common DFL and FFL Levels:
   - **Windows Server 2003**
   - **Windows Server 2008**
   - **Windows Server 2012**
   - **Windows Server 2016** (the latest available as of Windows Server 2022)

### Why DFL/FFL Matters
   - Functional levels enable new features that improve security, scalability, and performance in Active Directory environments.
   - They ensure domain and forest controllers are operating on a compatible and updated version of Windows Server, preventing legacy system limitations.

In summary, DFL and FFL are critical for managing AD features and ensuring compatibility within your domain and forest. They determine what features can be utilized and ensure domain controllers are up-to-date.


#Microsoft stopped introducing new Domain Functional Levels (DFL) and Forest Functional Levels (FFL) in Windows Server 2019 and 2022 for several strategic and technical reasons:

### 1. **Mature Feature Set**
   By the time Windows Server 2016 was released, Active Directory (AD) had already matured, offering a comprehensive set of features at the DFL and FFL levels. Many essential AD features, such as Kerberos improvements, authentication enhancements, and group policy refinements, had already been integrated. There were no significant new features that required a new DFL or FFL.

### 2. **Cloud and Hybrid Focus**
   Microsoft shifted its development focus towards **cloud-first** and **hybrid environments**, integrating Active Directory with Azure Active Directory (Azure AD). As organizations increasingly adopt cloud services, much of the innovation now revolves around hybrid identity management, security, and integration with cloud services, reducing the need for on-premises-only functional level updates.

   - **Azure AD** is becoming a central part of identity management for many organizations, and it doesn't rely on the traditional DFL/FFL mechanism.
   - Features like **Azure AD Connect** enable synchronization between on-premises AD and Azure AD, without needing new domain or forest functional levels.

### 3. **Backward Compatibility and Simplified Migrations**
   Introducing new DFL and FFL levels would complicate migrations, as organizations would need to ensure all domain controllers are running compatible versions of Windows Server. By keeping the DFL and FFL at Windows Server 2016, Microsoft allows:
   - Easier co-existence of mixed-version domain controllers (e.g., Windows Server 2012, 2016, 2019, 2022).
   - Simplified domain and forest migrations without needing to worry about incompatible functional levels.

### 4. **Focus on Security and Performance Enhancements**
   In Windows Server 2019 and 2022, the emphasis was on improving security, performance, and management rather than changing the fundamental functional levels. Features like **Windows Defender ATP**, **SMB improvements**, **enhanced PowerShell tools**, and **hybrid management capabilities** were the focus areas rather than introducing new AD-specific features that would require a new functional level.

### 5. **Stability and Reliability**
   Maintaining the same DFL/FFL provides more stability in Active Directory environments. Organizations can upgrade their domain controllers without having to reconfigure domain or forest functional levels. This approach helps ensure smoother transitions, especially for organizations with complex and large Active Directory environments.

### 6. **No Critical Features Tied to Higher DFL/FFL**
   Most new features and improvements in Windows Server 2019 and 2022 are either independent of DFL/FFL or work with the existing functional levels. Therefore, there was no need to introduce a higher functional level to support those features.

In summary, the decision to stop introducing new DFL and FFL in Windows Server 2019 and 2022 reflects Microsofts strategy of focusing on cloud integration, security enhancements, and providing stable, backward-compatible environments rather than introducing incremental functional-level changes for on-premises AD.

___

#Troubleshooting Functional levels

Troubleshooting issues related to **Domain Functional Level (DFL)** and **Forest Functional Level (FFL)** in Active Directory (AD) involves identifying potential misconfigurations, incompatibilities, or replication problems that arise when raising or managing functional levels. Below is a step-by-step guide to help troubleshoot DFL and FFL issues:

### 1. **Verify Current DFL and FFL**
   The first step in troubleshooting is to determine the current DFL and FFL for your Active Directory environment.

   - **Check DFL**:
     ```bash
     Get-ADDomain | Select-Object DomainMode
     ```
     This PowerShell command displays the domain functional level.

   - **Check FFL**:
     ```bash
     Get-ADForest | Select-Object ForestMode
     ```
     This PowerShell command displays the forest functional level.

   You can also use **Active Directory Domains and Trusts** or **AD Administrative Center** to view DFL and FFL in the GUI.

### 2. **Check Domain Controller Versions**
   Ensure all domain controllers (DCs) are running a version of Windows Server that supports the target functional level. Incompatible or older versions can prevent raising the functional levels.

   - **Check DC versions**:
     ```bash
     Get-ADDomainController -Filter * | Select-Object Name, OperatingSystem
     ```
     This will list all domain controllers and their operating system versions.

   Make sure every DC is running at least the version required by the current or intended functional level.

### 3. **Ensure Replication Health**
   Functional level changes rely on proper replication across all domain controllers. Replication issues can cause delays or failures when raising DFL/FFL.

   - **Check Replication Status**:
     Run the following command to detect replication issues:
     ```bash
     repadmin /replsummary
     ```
     This command provides a summary of replication status for all domain controllers.

   - **Detailed Replication Check**:
     ```bash
     repadmin /showrepl
     ```
     This shows replication partners and any errors between domain controllers.

   - **Fix Replication Issues**:
     If there are replication errors, troubleshoot the specific replication failure (e.g., DNS issues, network connectivity problems, or AD database corruption) before proceeding with functional level changes.

### 4. **Check for Lingering Objects**
   Lingering objects are outdated objects left in the AD database due to replication issues. These can cause problems when raising the functional level, as outdated information is propagated across domain controllers.

   - **Check for Lingering Objects**:
     ```bash
     repadmin /removelingeringobjects
     ```
     This removes any stale objects that can interfere with replication or functional level updates.

### 5. **Verify Compatibility with Applications**
   Some applications or services that rely on Active Directory may not support higher functional levels. Before raising the DFL or FFL, check whether the applications in your environment are compatible with the higher functional levels.

   - **Check vendor documentation**: Ensure that all mission-critical apps (like Exchange, SQL Server, etc.) support the new DFL/FFL.
   - **Test in a lab environment**: If possible, set up a test environment to verify compatibility before applying changes in production.

### 6. **Check Permissions**
   Ensure that the account being used to raise the DFL or FFL has the appropriate permissions.

   - **Domain Functional Level**: The account must be a member of the **Domain Admins** group.
   - **Forest Functional Level**: The account must be a member of the **Enterprise Admins** group.

   Attempting to raise the functional level without the required permissions can result in access denied errors.

### 7. **Raise DFL/FFL with Caution**
   When ready to raise the functional levels, perform the task during a maintenance window, and make sure backups of the AD database (system state) are available.

   - **Raise DFL**:
     ```bash
     Set-ADDomainMode -Identity "DomainName" -DomainMode Windows2016Domain
     ```
     (Replace "DomainName" with your domain and `Windows2016Domain` with the desired level.)

   - **Raise FFL**:
     ```bash
     Set-ADForestMode -Identity "ForestName" -ForestMode Windows2016Forest
     ```
     (Replace "ForestName" with your forest and `Windows2016Forest` with the desired level.)

   Ensure the operation completes without errors and verify that it has successfully taken effect.

### 8. **Review Event Logs**
   Check the **Event Viewer** on all domain controllers for any errors related to functional level changes.

   - **Look for errors** in:
     - **Directory Service** log (logs related to AD).
     - **System** log (for system-wide issues like replication or DNS problems).
     - **DFS Replication** logs (if using DFS).

   Pay attention to errors or warnings around replication, schema mismatches, or version incompatibilities.

### 9. **Revisit Schema Upgrades**
   If you're encountering issues after raising the FFL/DFL, verify that the AD schema has been properly updated. Schema updates are required when introducing new versions of Windows Server into a domain or forest.

   - **Check Schema Version**:
     ```bash
     Get-ADObject (Get-ADRootDSE).schemaNamingContext -Property objectVersion
     ```
     This will return the schema version. Ensure it matches the schema version required by the functional level.

   - **Update Schema (if needed)**:
     If youre deploying new domain controllers, you might need to update the schema using:
     ```bash
     adprep /forestprep
     adprep /domainprep
     ```
     Ensure this step has been properly completed.

### Common Issues and Fixes
- **Replication Delays**: Check replication health and force replication using `repadmin /syncall`.
- **Incompatible Domain Controllers**: Ensure that all DCs are running the required version of Windows Server for the intended functional level.
- **Permissions Errors**: Ensure you're using an account with the appropriate domain or forest-level admin permissions.
- **Application Failures**: Ensure that critical applications are compatible with the raised functional levels.

By following these steps, you can effectively troubleshoot most DFL and FFL-related issues in Active Directory.