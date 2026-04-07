---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/Processes/Knowledge Management (KM)/KM Admins/PIM Access Group for Project Administrators_Process"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/Processes/Knowledge%20Management%20%28KM%29/KM%20Admins/PIM%20Access%20Group%20for%20Project%20Administrators_Process"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---

Tags:

- cw.KM

- cw.Process

- cw.Reviewed-08-2024

---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::




[[_TOC_]]



# Overview

This page covers how to manage the Priviledged Identity Management (PIM) group **ADO-SUPPORTABILITY-AZUREIAASVM-PA-JIT**, and how to elevate your access into the group to gain Project Administrator permissions within the AzureIaaSVM ADO Project.



Membership in this group expires every 12 months and must be extended. You will receive an email as you near expiration. Follow those instructions to extend your membership.



<br>



# Elevating Access into the PIM Group

**Note:** If you are not already a member of the PIM group, you will not be able to elevate your access.

1. Navigate to [My roles | Groups](https://ms.portal.azure.com/#view/Microsoft_Azure_PIMCommon/ActivationMenuBlade/~/aadgroup).

2. Under **Eligible assignments** find the **Member** role entry for the group **ADO-SUPPORTABILITY-AZUREIAASVM-PA-JIT** and click **Activate**.<br>

![](/.attachments/Processes/Knowledge-Management/PIM-Group/PIM-Eligible-Assignments.png)

3. Provide a justification/reason in the side bar when prompted, then click **Activate** and wait for the process to complete.

4. Return to the [AzureIaaSVM wiki](https://aka.ms/vmwiki).

5. Open your **User Settings** in the top right right and click to refresh your permissions.<br>

![](/.attachments/Processes/Knowledge-Management/PIM-Group/PIM-Refresh-Permissions.png)

6. You should now have elevated permissions equal to that of Project Administrator.



**Note:** Your elevated access will auto-expire in 8hrs (or less if specified during step 3). If you wish to end your elevated access sooner, repeat steps 1-2 but click **Deactivate** this time.



<br>



# Adding a New Member to the PIM Group

**Note:** Only owners of the PIM group can add new members.

1. Navigate to [Priviledged Identity Management | Groups](https://ms.portal.azure.com/#blade/Microsoft_Azure_PIMCommon/CommonMenuBlade/aadgroup).

2. Search for the group **ADO-SUPPORTABILITY-AZUREIAASVM-PA-JIT** and select it.

3. Go to **Roles** in the left menu and then select **Add assignment** at the top.<br>

![](/.attachments/Processes/Knowledge-Management/PIM-Group/PIM-Roles-Menu.png)

4. Set the role as **Member** and click the "No member selected" to open the member/group blade.

5. Search for the user(s) to add by their name or alias and check the appropriate box. Once you've select the user(s) to add, click **Select** at the bottom of the blade.

6. Confirm the desired user(s) are listed, then click **Next**.<br>

![](/.attachments/Processes/Knowledge-Management/PIM-Group/PIM-Add-Assignment.png)

7. Ensure the **Assignment type** is **Eligible**, and leave **Assignment starts/ends** with their default values of one year.

8. Click **Assign**.

   - Note: This will generate an email to all owners of the PIM group as well as the selected user(s).

9. Once complete, the user(s) will be able to [elevate their access](#elevating-access-into-the-pim-group).



::: template /.templates/Processes/Knowledge-Management/KM-Feedback-Template.md

:::

