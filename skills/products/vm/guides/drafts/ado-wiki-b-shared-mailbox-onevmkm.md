---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/Processes/Knowledge Management (KM)/KM Admins/Shared Mailbox (onevmkm)_Process"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/Processes/Knowledge%20Management%20%28KM%29/KM%20Admins/Shared%20Mailbox%20%28onevmkm%29_Process"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---

Tags:

- cw.KM

- cw.Process

- cw.Reviewed-03-2026

---



::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md

:::





[[_TOC_]]



# Overview

The KM Admins have a Non-Person Shared-Mailbox "**OneVM Knowledge Management**" (onevmkm) primarily used in automations to send KM/wiki related communications.





# Manage Account

Management of the account is done through Core Identity, [here](https://coreidentity.microsoft.com/manage/Service/microsoft/onevmkm).<br>

Configurable settings include the display name, owners, and mailbox permissions.



To manage of the account:

1. You must be an owner of the account.

2. Go [here](https://coreidentity.microsoft.com/manage/Service/microsoft/onevmkm) to Core Identity

3. Switch to the desired tab.

4. Make any neccessary changes (see below for more details).





## Owners

Only the owners of the account are able to manage its settings.<br>

There are two types of owners:

- Primary Owner

   - Owners that typically have full admin privileges over the account, including being able to delete the account, change owners, and approve any changes to the account itself. Groups cannot be added as primary owners.

- Secondary Owner

   - Owners that typically have a more limited scope to execute things such as a change to update the display name, etc. Groups cannot be added as secondary owners.



The current owners are:

|Name|Alias|Type|

|-----|-----|-----|

| Clayton Fuselier | clfuseli | Primary |

| Subbu Konathala | sukon | Primary |





## Mailbox Permissions

Mailbox permissions controls who can access the shared mailbox.

There are two main permissions we delegate:

- Full Access + Send As

   - **(Recommended)** Allows the delegate to open the mailbox and view, add, and remove the contents of the mailbox. Allows the delegate to send messages as if they came directly from the mailbox.

- Send As

   - Allows the delegate to send messages as if they came directly from the mailbox. There's no indication that the message was sent by the delegate. Doesn't allow the delegate to read the contents of the mailbox.



Only KM Admins have delegated mailbox permissions.<br>

Current permissions are:

|Name|Alias|Permission|

|-----|-----|-----|

| Clayton Fuselier | clfuseli | Full Access + Send As |

| Heath Rensink | herensin | Full Access + Send As |

| Sagar Yele | sayele | Full Access + Send As |

| Subbu Konathala | sukon | Full Access + Send As |





# Send As

To send as the shared mailbox, you must have [mailbox permissions](#mailbox-permissions) as described above.



1. Open a new email in Outlook.

2. Make sure you have the **From** field is selected, under **Options** in the ribbon.<br>

![km-shared-mailbox-sendas-1.png](/.attachments/Processes/Knowledge-Management/Shared-Mailbox/km-shared-mailbox-sendas-1.png)

3. Click the dropdown on the **From** field and choose **Other Email Address**.<br>

![km-shared-mailbox-sendas-2.png](/.attachments/Processes/Knowledge-Management/Shared-Mailbox/km-shared-mailbox-sendas-2.png)

4. Enter the email address of the shared mailbox (onevmkm@microsoft.com) into the popup.

5. Dismiss the warning about "label requirements".

6. Compose the email as needed. **Be sure to remove your signature!**

7. Send the email.





# Open the Mailbox

If you have Full Access, the shared mailbox should automatically be added to your Outlook's folder pane.



If you don't see it, try closing and reopening Outlook. If you still don't see it, do the following:

1. In Outlook, go to **File** -> **Account Settings** -> **Account Settings...**<br>

![km-shared-mailbox-open-1.png](/.attachments/Processes/Knowledge-Management/Shared-Mailbox/km-shared-mailbox-open-1.png)

2. Select your current profile in the new window, then click **Change...**<br>

![km-shared-mailbox-open-2.png](/.attachments/Processes/Knowledge-Management/Shared-Mailbox/km-shared-mailbox-open-2.png)

3. Click the gray button for **More Settings** on the Exchange Account Settings popup.

4. Go to the **Advanced** tab and click **Add**<br>

5. Enter the shared-mailbox's full email address (onevmkm@microsoft.com) and click **OK**.<br>

6. It should now list the shared-mailbox in the "Open these additional mailboxes" window. Click **OK** to close the window.

![km-shared-mailbox-open-6.png](/.attachments/Processes/Knowledge-Management/Shared-Mailbox/km-shared-mailbox-open-6.png)

7. Close the remining open windows.

8. Your folder pane should now show the shared-mailbox and you can expand/explore the mailbox.<br>

![km-shared-mailbox-open-5.png](/.attachments/Processes/Knowledge-Management/Shared-Mailbox/km-shared-mailbox-open-5.png)





# More Information

- https://support.microsoft.com/en-us/office/open-and-use-a-shared-mailbox-in-outlook-d94a8e9e-21f1-4240-808b-de9c9c088afd





::: template /.templates/Processes/Knowledge-Management/KM-Feedback-Template.md

:::

