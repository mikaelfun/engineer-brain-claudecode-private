---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Active Directory Disaster Recovery/SYSVOL Recovery (When using DFSR)"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FActive%20Directory%20Disaster%20Recovery%2FSYSVOL%20Recovery%20(When%20using%20DFSR)"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1668283&Instance=1668283&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1668283&Instance=1668283&Feedback=2)

___
<div id='cssfeedback-end'></div>

## Table of Contents
- [Usage](#usage)
- [DFS Windows Server Requirements](#dfs-windows-server-requirements)
- [SYSVOL Recovery for DFSR Windows Server](#sysvol-recovery-for-dfsr-windows-server)

---

### Summary
This guide provides detailed steps for recovering SYSVOL content to a previous state after an undesired change. It includes verifying SYSVOL content, enabling features, restoring from backup, and verifying event logs.

---

### Usage
This section describes the options to recover the SYSVOL content to a previous state after an undesired change.

### DFS Windows Server requirements
By default, the tools for Distributed File System Replication (DFSR) are not available on Servers. You will need to ensure that you have access to the DFSRDiag utility by installing the DFS Management Tools.

### SYSVOL recovery for DFSR Windows Server
1. Verify the SYSVOL content. The recommended option is to remove partial folders and restore from backup:  

![image.png](/.attachments/image-0a911fb1-836d-4b94-9f73-4e06071cec7f.png)

2. Open DSA.MSC.
3. Enable both the features in **DSA.MSC**:  

![image.png](/.attachments/image-d3b9f06e-3e6f-44b1-88b4-01046f7b0fb5.png)

4. Go to the SYSVOL subscription object for the domain controller that will be authoritative (containing good backup after restoring):  

![image.png](/.attachments/image-0cb4288a-6277-4cda-93a7-a9ca1b687a34.png)

5. Right-click the SYSVOL subscription object and click **Properties** to open the subscription object properties:  

![image.png](/.attachments/image-84d6ace1-ce08-4067-9cc6-71a30eccd719.png)

6. click on the attribute editor:  

![image.png](/.attachments/image-787eba28-dad4-4aec-868a-2bfcce280a88.png)

7. Go to Value and click **False**.
8. Click **OK**.
9. Repeat the same steps for all other Domain Controller DFSR subscription objects in the Domain:  

![image.png](/.attachments/image-d0712537-3602-4dc4-85e7-0d8141e2d19f.png)

10. Force Active Directory replication between all the domain controllers in the domain. In a relatively small environment with a few Domain Controllers (DCs), you can use the following two commands to trigger the incoming and outgoing replication of each DC:
    ```shell
    for /f %i in ('dsquery server -o rdn') do start repadmin /syncall %i /Aed
    for /f %i in ('dsquery server -o rdn') do start repadmin /syncall %i /AedP
    ```

11. DFSR uses a polling interval to detect changes in the Active Directory configuration. To speed this up, it is recommended that you run `dfsrdiag pollad` on the domain controllers.

    >  **Notes:**
    > - Windows requires this DFSR feature to be installed to use DFSRDIAG and DFSR management tools. To install the tools, run the following PowerShell command:
    >     ```powershell
    >     Install-WindowsFeature RSAT-DFS-Mgmt-Con
    >     ```
    > - Any command prompt window should be opened with administrator privileges.
    > - You can trigger the polling process on all DCs using the following command:
    >     ```shell
    >     for /f %i in ('dsquery server -o rdn') do dfsrdiag pollad /member:%i
    >     ```

12. Verify the DFSR event log for **Event 4114** that replication is halted:
    ```
    Log Name:      DFS Replication
    Source:        DFSR
    Event ID:      4114
    Task Category: None
    Level:         Information
    Keywords:      Classic
    User:          N/A
    Description:
    The replicated folder at local path C:\Windows\SYSVOL\domain has been disabled. The replicated folder will not participate in replication until it is enabled. All data in the replicated folder will be treated as pre-existing data when this replicated folder is enabled.
    ```

13. Go back to the domain controller subscription object that will host the restored data.
14. Open **msDFSROptions**.
15. Set the value to **1**:  

![image.png](/.attachments/image-1ed6f5a9-d5d0-4216-a342-c4113d05b580.png)

16. Open the Windows Server backup.
17. Select **Recover**.
18. Click **Files and folders**.
19. Select the SYSVOL content:  

![image.png](/.attachments/image-3d82d809-6919-4f68-b44a-50cae825aeed.png)

20. Click **Original location**.
21. Click **Overwrite the existing versions with the recovered versions**.
22. Select the **Restore access control list (ACL) permissions to the file or folder being recovered** check box:  

![image.png](/.attachments/image-fb8e58ed-6b85-4414-99be-d442dfd99c77.png)

23. Confirm and then click **Recover**. The restoration process starts.  

![image.png](/.attachments/image-c3963ae4-723e-4cbc-931f-3fb5f6a923f7.png)

24. Verify the SYSVOL data after restore:  

![image.png](/.attachments/image-0a911fb1-836d-4b94-9f73-4e06071cec7f.png)

25. Go back to the recovered domain controller subscription object.
26. Set msDFSR-Enabled back to **TRUE**:  

![image.png](/.attachments/image-6963dd7e-869b-4bc9-9299-8f52ac98d235.png)

27. Verify the DFSR event logs for **Event 4602**.
    ```
    Log Name:      DFS Replication
    Source:        DFSR
    Event ID:      4602
    Task Category: None
    Level:         Information
    Keywords:      Classic
    User:          N/A
    Description:
    The DFS Replication service successfully initialized the SYSVOL replicated folder at local path C:\Windows\SYSVOL\domain. This member is the designated primary member for this replicated folder. No user action is required. To check for the presence of the SYSVOL share, open a command prompt window and then type "net share".
    Additional Information:
    Replicated Folder Name: SYSVOL Share
    Replicated Folder ID: 9B7A95EE-81EB-40C5-A2D9-89E76B45C074
    Replication Group Name: Domain System Volume
    Replication Group ID: EE103687-F8CB-4D3F-9902-B972A73E9A43
    Member ID: F52AF3BE-EFDE-4707-AB5E-0DF7B93E5D1A
    ```

28. Verify the DFSR event logs for **Event 4614**.
    ```
    Log Name:      DFS Replication
    Source:        DFSR
    Event ID:      4614
    Task Category: None
    Level:         Warning
    Keywords:      Classic
    User:          N/A
    Description:
    The DFS Replication service initialized SYSVOL at local path C:\Windows\SYSVOL\domain and is waiting to perform initial replication. The replicated folder will remain in the initial synchronization state until it has replicated with its partner . If the server was in the process of being promoted to a domain controller, the domain controller will not advertize and function as a domain controller until this issue is resolved. This can occur if the specified partner is also in the initial synchronization state, or if sharing violations are encountered on this server or the synchronization partner. If this event occurred during the migration of SYSVOL from File Replication service (FRS) to DFS Replication, changes will not replicate out until this issue is resolved. This can cause the SYSVOL folder on this server to become out of sync with other domain controllers.
    Additional Information:
    Replicated Folder Name: SYSVOL Share
    Replicated Folder ID: 9B7A95EE-81EB-40C5-A2D9-89E76B45C074
    Replication Group Name: Domain System Volume
    Replication Group ID: EE103687-F8CB-4D3F-9902-B972A73E9A43
    Member ID: F52AF3BE-EFDE-4707-AB5E-0DF7B93E5D1A
    Read-Only: 0
    ```

29. Verify the DFSR event logs for **Event 4604**.
    ```
    Log Name:      DFS Replication
    Source:        DFSR
    Event ID:      4604
    Task Category: None
    Level:         Information
    Keywords:      Classic
    User:          N/A
    Description:
    The DFS Replication service successfully initialized the SYSVOL replicated folder at local path C:\Windows\SYSVOL\domain. This member has completed initial synchronization of SYSVOL with partner <DC NAME>. To check for the presence of the SYSVOL share, open a command prompt window and then type "net share".
    Additional Information:
    Replicated Folder Name: SYSVOL Share
    Replicated Folder ID: 9B7A95EE-81EB-40C5-A2D9-89E76B45C074
    Replication Group Name: Domain System Volume
    Replication Group ID: EE103687-F8CB-4D3F-9902-B972A73E9A43
    Member ID: F52AF3BE-EFDE-4707-AB5E-0DF7B93E5D1A
    Sync partner: <DC NAME>
    ```

30. Run `dfsrdiag pollad` on the domain controllers. You can trigger the polling process on all DCs using the following command:
    ```shell
    for /f %i in ('dsquery server -o rdn') do dfsrdiag pollad /member:%i
    ```

31. Using the command `net share`, verify that SYSVOL and Netlogon shares are available. If NETLOGON is not available but SYSVOL is, then verify that the scripts folder exists.

32. Go back to the other domain controller(s) subscription object(s).
33. Set **msDFSR-Enabled** back to **TRUE**.
34. Repeat the same steps for all other domain controller DFSR subscription objects in the domain.  

![image.png](/.attachments/image-6963dd7e-869b-4bc9-9299-8f52ac98d235.png)

35. Force Active Directory replication between all domain controllers in the domain.
    > **Note:** In a relatively small environment with a few DCs, you can use the following two commands to trigger the incoming and outgoing replication of each DC:
    ```shell
    for /f %i in ('dsquery server -o rdn') do start repadmin /syncall %i /Aed
    for /f %i in ('dsquery server -o rdn') do start repadmin /syncall %i /AedP
    ```

36. Run `dfsrdiag pollad` on the domain controllers. You can trigger the polling process on all DCs using the following command:
    ```shell
    for /f %i in ('dsquery server -o rdn') do dfsrdiag pollad /member:%i
    ```

37. Evaluate if all DCs are sharing SYSVOL. You can run `net view` on each DC to inspect the DC's list of shares or use the following command to inspect all DCs remotely:
    ```shell
    For /f %i IN ('dsquery server -o rdn') do @echo %i && @(net view \\%i | find "SYSVOL") & echo
    ```

    Additionally, To check the DFS Replication state on domain controllers on **Windows Server 2025**, you can run the following command to query the WMI namespace for the SYSVOL replicated folder using Get-CimInstance:

    ```shell
    foreach ($s in (dsquery server -o rdn)) { Get-CimInstance -ComputerName $s -Namespace root\MicrosoftDFS -ClassName DfsrReplicatedFolderInfo | Where-Object {$_.ReplicatedFolderName -eq 'SYSVOL share'} | Select-Object @{Name='Server';Expression={$s}}, ReplicationGroupName, ReplicatedFolderName, State }
    ```

    Domain Controllers running Windows Server 2019 and older versions you can query the domain for theSYSVOLShare replicated folder by using WMI as follows::
    ```shell
    For /f %i IN ('dsquery server -o rdn') do @echo %i && @wmic /node:"%i" /namespace:\\root\microsoftdfs path dfsrreplicatedfolderinfo WHERE replicatedfoldername='SYSVOL share' get replicationgroupname,replicatedfoldername,state
    ```

    The "state" values can be any of the following:
    - 0 = Uninitialized
    - 1 = Initialized
    - 2 = Initial Sync
    - 3 = Auto Recovery
    - **4 = Normal**
    - 5 = In Error

    > **Note:** Another method to check the DFSR functionality is by creating a test file on SYSVOL using the following command:
    ```shell
    Echo "test" >C:\Windows\SYSVOL\domain\Policies\repltest.txt
    ```