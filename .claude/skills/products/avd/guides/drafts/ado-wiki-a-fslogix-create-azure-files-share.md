---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Sandbox/In-Development Content/[AVD Lab] 11 - [Optional] Set up FSLogix Profile for your users/[AVD Lab] 11.2 - [FSLogix] Create an Azure Files share"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop?pagePath=/Sandbox/In-Development%20Content/%5BAVD%20Lab%5D%2011.2%20-%20%5BFSLogix%5D%20Create%20an%20Azure%20Files%20share"
importDate: "2026-04-06"
type: troubleshooting-guide
---

|Contributors|
|--|
| [Robert Klemencz](mailto:Robert.Klemencz@microsoft.com) |

---

1.  Login to the Azure portal: [https://portal.azure.com](https://portal.azure.com/)
    
2.  Search for **storage account** and select the **Storage accounts** entry under **Services**.

3. On the **Storage Center** page, click on the newly created storage account name.

4. On your storage account's page, navigate to **Data storage > File shares** and click **File share**.

    The New file share wizard will open.

5. On the **Basics** page:
   - Enter a **Name** for your file share.
     - This name is entirely up to you, but for easier reference in our lab, it is recommended to use something pointing to the purpose of the share (e.g.: avdlabfslogix)
     - Leave **Access tier** on **Transaction optimized**.
     - When ready, click **Next: Backup >**.

   - On the **Backup** page:
     - **Uncheck** the checkbox for **Enable backup**.
     - For the purpose of this lab, we don't need backups.
     - When ready, click **Next: Review >**.

   - On the **Review + create** page, verify if everything is correct and when ready, click **Create**.

---
content checked: 20251217
