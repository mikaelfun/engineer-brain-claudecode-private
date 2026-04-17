---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Azure Monitor/How-To/ICM/How to provide product group access to support data for ICM incidents"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Azure%20Monitor/How-To/ICM/How%20to%20provide%20product%20group%20access%20to%20support%20data%20for%20ICM%20incidents"
importDate: "2026-04-06"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Introduction
---
A major challenge in creating Customer Reported Incidents (CRIs) via the IcM tool that is used to escalate issues from CSS to product groups is that support data is not allowed to be attached to IcM incidents as per [Business Rule: Apps & Infra: Data Handling Scenarios](https://aka.ms/CommercialDataHandling).

Support data is defined as: *Data received or gathered in the context of a support case. This includes all text, sound, video, image files, or software. It also includes things like logs, traces, scripts, source code, dumps, and more.*

In order to provide support data to the product group in a way that meets compliance, data should be uploaded to [Data Transfer Manager (DTM)](https://aka.ms/dtm) and then the assigned engineering resource given permission to that data in DTM.

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#efd9fd">

**Note**

For more information on handling support data and the rare cases when a DTM alternative may be used, see https://aka.ms/CommercialDataHandling.
</div>

# Instructions
---
There are three options for providing PG access to support data stored in [Data Transfer Manager (DTM)](https://aka.ms/dtm):

<div style="margin:25px">

<details closed>
<summary><b>Option 1 - CSS support request owner grants PG DRI access in DfM.</b> (click to expand)</summary>
<div style="margin:25px">

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">

**Important**

DRI must be onboarded to DfM and assigned the "DFM Case Worker" role in order to utilize this option.  If you are not onboarded to Dynamics for Microsoft (DfM), see section [How to get onboarded to Dynamics for Microsoft (DfM)](#how-to-get-onboarded-to-dynamics-for-microsoft-(dfm)).
</div>

1. The CSS Support Engineer (SE) opens a collaboration case in Dynamics for Microsoft (DfM) and assigns it to the PG DRI.

   <div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#efd9fd">
   
   **Note**
   
   The PG DRI does not need to do anything in the DfM tool, just the assignment of the collaboration case assigns the required permission to access support data.
   </div>

1. The PG DRI will now have access to the support data using the [Data Transfer Manager (DTM)](https://aka.ms/dtm) tool.

   a. Open a browser and navigate to [Data Transfer Manager (DTM)](https://aka.ms/dtm).
   b. Paste the **support request** (a.k.a. case number) into the dialog and click **Go**.
   
      ![image.png](/.attachments/image-4c6eac39-09a9-4847-8893-f3e82e949f4b.png)
 
   c. To download a file, click on the filename.

</div>
</details>

<details closed>
<summary><b>Option 2 - PG DRI uses DfM JIT process to gain access.</b> (click to expand)</summary>
<div style="margin:25px">

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">

**Important**

DRI must be onboarded to DfM in order to utilize this option.  If you are not onboarded to Dynamics for Microsoft (DfM), see section [How to get onboarded to Dynamics for Microsoft (DfM)](#how-to-get-onboarded-to-dynamics-for-microsoft-(dfm)).
</div>

1. Open a browser and navigate to [OneSupport](https://aka.ms/onesupport).
1. In the **search dialog**, paste in the support request number (a.k.a. case number) and then click on the support request presented in the drop-down.

   ![image.png](/.attachments/image-e9170e0d-eb3c-411f-b0f8-8ea46936f5b7.png)

1. In the **actions ribbon**, click **Request JIT access**.

   ![image.png](/.attachments/image-2b988d0d-7de0-4aef-9b8e-791a436e8751.png)

1. In the **Support data access request** dialog, populate **Request Reason** by selecting **Working on escalation**, then click **Submit**.

   ![image.png](/.attachments/image-90045ba3-da2a-482b-a10d-b6972a9fbac0.png)

1. **Wait for the JIT request to be approved.**

1. Once the JIT request has been approved, you will now have access to the support data using the [Data Transfer Manager (DTM)](https://aka.ms/dtm) tool.

   a. Open a browser and navigate to [Data Transfer Manager (DTM)](https://aka.ms/dtm).
   b. Paste the **support request** (a.k.a. case number) into the dialog and click **Go**.
   
      ![image.png](/.attachments/image-4c6eac39-09a9-4847-8893-f3e82e949f4b.png)
 
   c. To download a file, click on the filename.

</div>
</details>

<details closed>
<summary><b>Option 3 - Grant Internal Access to Non-DfM users.</b> (click to expand)</summary>
<div style="margin:25px">

1. See article [Grant Internal Access to Non-DfM users](https://dev.azure.com/CSSToolsPM/Dynamics%20for%20Microsoft/_wiki/wikis/DfM/501/Grant-Internal-Access-to-Non-DfM-users) for instructions on granting the access.

1. Along with the link to the Data Transfer Manager (DTM) workspace, provide the PG resource with the link to [Engineering team access](https://dev.azure.com/CSSToolsPM/Dynamics%20for%20Microsoft/_wiki/wikis/DfM/501/Grant-Internal-Access-to-Non-DfM-users?anchor=engineering-team-access).

**Instruction Video**

[Available here.](https://dev.azure.com/Supportability/6f9dfd80-6071-4f7b-8bf9-c97214ca68cf/_apis/git/repositories/bebfc12e-d2ce-4ed1-8a64-d64c20264fd2/Items?path=/.attachments/Grant%20Internal%20Access%20to%20Non-DfM%20users-20220907_094444-Meeting%20Recording-f4cbe6bf-39d7-4950-a02d-46a396ff1a2e.mp4&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1&sanitize=true&includeContentMetadata=true&versionDescriptor.version=wikiMaster)

**Troubleshooting**

1. See the troubleshooting section of article [Grant Internal Access to Non-DfM users](https://dev.azure.com/CSSToolsPM/Dynamics%20for%20Microsoft/_wiki/wikis/DfM/501/Grant-Internal-Access-to-Non-DfM-users).

</div>
</details>

<details closed>
<summary><b>Option 4 - Use a virtual machine provisioned through MyWorkspace.</b> (click to expand)</summary>
<div style="margin:25px">

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;background-color:#d7eaf8">

**Important**

This option should only be used in the event that none of the above DTM options are available or applicable.
</div>

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;background-color:#d7eaf8">

**Important**

Once the data has been successfully retrieved by the PG resource, the virtual machine should be deleted to ensure the data is not retained outside of appropriate systems such as DTM for any longer than is absolutely necessary.
</div>

1. Create a new workspace and deploy a virtual machine in [MyWorkspace](https://aka.ms/myworkspace).

1. Navigate into your deployed workspace and virtual machine and start it.

1. Click the **JIT Status** button.

   ![image.png](/.attachments/image-7f92d8be-6b22-400d-ad8f-40c5772d761d.png)

1. Under **JIT RDP Access**, click **Activate** and then select the duration that you want to be able to access the virtual machine.

   ![image.png](/.attachments/image-ac582348-ecc0-47a9-926a-1eab24978af5.png)

1. Wait for **JIT Status** to change to **Active**.

   ![image.png](/.attachments/image-717b8bf6-694e-43ac-924a-b3d2466706e1.png)

1. Click on **Connect**, review the administrator username and password, then click on **Download RDP file for Machine** to connect to the virtual machine.

   ![image.png](/.attachments/image-c34c2efc-d352-4ee9-b2c5-7870d4a37bbe.png)

1. Copy the data to the virtual machine.

1. Navigate back to the workspace properties by clicking on **Workspace Properties**.

   ![image.png](/.attachments/image-7f34d21f-e992-4eb3-9dce-c09bece099c3.png)

1. Click on **Ownership**, then click **Add Shared Owner**.

   ![image.png](/.attachments/image-4e56490e-69c3-4feb-bbf4-4e65eade845f.png)

1. Type in the **User Principal Name** (alias@microsoft.com) of the person you want to add, then click **Add**.

1. Click on **Save** to save the changes to the workspace.

1. Advise your contact to navigate to https://aka.ms/myworkspace and the details of the workspace and virtual machine that you created for them.

1. Have them follow steps 2 through 6 to enable JIT access to the virtual machine and then connect and copy the data.
</div>
</details>

</div>

# Reporting DTM Issues
---
If you believe there is a problem occurring with the Data Transfer Management (DTM) tool, follow the steps below to report:

1. Navigate to [Business Tools Support (BTS)](https://aka.ms/bts) portal.

1. Click on **Create Support Case**.

1. Populate the **Service (Product/Application)** property selecting **Data Transfer Management (DTM)**.

1. Populate the rest of the properties and click **Submit**.

# How to get onboarded to Dynamics for Microsoft (DfM)
---
Onboarding to DfM is performed through a bot.  See article [DFM WW/EU Account Management](https://bts.microsoftcrmportals.com/support/MoreInfoDetails/) for more details.

# How to unsuspend your Dynamics for Microsoft (DfM) account
---
DfM accounts are automatically suspended if they are not used for a period of time.  If your account gets suspended, see article [DFM WW/EU Account Management](https://bts.microsoftcrmportals.com/support/MoreInfoDetails/) for details on how to unsuspend your account.
