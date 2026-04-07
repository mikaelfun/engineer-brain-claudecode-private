---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files Sync/TSGs/TSG AFS Enable files and folder Auditing on Windows Server_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Azure%20Files%20Sync/TSGs/TSG%20AFS%20Enable%20files%20and%20folder%20Auditing%20on%20Windows%20Server_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Azure-Files-Sync
- cw.TSG
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::
 

[[_TOC_]]

# Summary

This TSG aims to guide you on providing the best effort to instruct our users on implementing file/folder level auditing in Windows Server for those requiring more tracking. We view this as the customer's responsibility. 

**Overview**

**To enable file auditing on a file or folder in Windows:**

 1. Locate the file or folder you want to audit in Windows Explorer.
 2. Right-click the file or folder and then click Properties.
 3. Click the Security tab.
 4. Click Advanced.
 5. Click the Auditing tab.
 6. If you are using Windows Server 2008, click Edit.
 7. Click Add.
 8. Enter the name of a user or group you want to audit for the selected file or folder and click Check Names to validate your entry. For example, enter Everyone.
 9. Click OK.
 10. Select Success and Failure next to Full control to audit everything for the selected file or folder.
 11. Optionally, evident Success and Failure for unwanted events, such as:
    - Read Attributes
    - Read extended attributes
    - Write extended attributes
    - Read permissions
 12. Click OK in each window until you are back at the Windows Explorer window.
 13. Repeat these steps for all files or folders you want to audit.

> Source: <https://support.solarwinds.com/SuccessCenter/s/article/Enable-File-Auditing-in-Windows> 

![tsg_AFS_auditing_1.png](/.attachments/SME-Topics/Azure-Files-Sync/tsg_AFS_auditing_1.png)	

**Viewing Audit logs**

 1. Open the Event viewer
   - Open Start -> Run
   - Type **eventvwr** and hit Enter
 2. Select the Security section.
 3. On the right side, click on Search and type the filename that should be an audit. In this example: FileToTrackAccess.txt
 4. At the Details of the found Audit registry, look for the Logon ID, and remember it.
 5. Again, on the right side, click on Search and type the Logon ID we're looking for.
 6. The logs will show the IP address on the Details.

> Source: <https://support.plesk.com/hc/en-us/articles/213913725-How-to-set-up-file-audit-on-Windows-server-> 

![tsg_AFS_auditing_2.png](/.attachments/SME-Topics/Azure-Files-Sync/tsg_AFS_auditing_2.png)	


#### More Information 

- [Azure File Sync Workflow_Storage](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/510939)


::: template /.templates/Processes/Knowledge-Management/Azure-Files-Sync-Feedback-Template.md
:::
