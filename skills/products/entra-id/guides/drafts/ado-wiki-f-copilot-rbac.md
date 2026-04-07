---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure RBAC for Resources/Copilot for Azure RBAC"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20RBAC%20for%20Resources%2FCopilot%20for%20Azure%20RBAC"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD-Account-Management
- cw.AAD-Workflow
- cw.AAD-RBAC
- Management Groups
- Limitations
- Known Issues
- cw.comm-secaccmgt
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::


<div style="border: 1px solid #ccc; padding: 10px; border-radius: 5px;">
 <h2 style="font-size: 20pt; margin-top: 0;">TSG Quick Reference</h2>

- <h2><a href="https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=2138546&anchor=workflow">TSG Workflow</a></h2>

  <p style="margin-top: -10px; margin-bottom: 0;">
    This section shows a visual flow of the troubleshooting steps. Clicking a box takes you directly to the instructions for that step.
  </p>

</div>


<br><span style="color: red;">**IMPORTANT**</span>: This feature will initially launch as an experiment to 50% of the tenants that have at least one active subscription. Within those selected tenants, the feature will be visible across all their associated subscriptions.

This setup allows engineering to evaluate how Copilot impacts role assignment behavior. Metrics such as the average number of permissions per assignment and time spent in the Roles tab will be compared between tenants that have access to the feature and those that do not.

[[_TOC_]]

# Compliance note

This wiki contains test and/or lab data only.

___

# Feature Summary

Azure Copilot (free to use) now includes intelligent capabilities to help administrators manage Azure Role-Based Access Control (RBAC) more efficiently. With over 17,000 permissions and 585+ roles in Azure, assigning the right access while maintaining least privilege can be complex. This new feature introduces three new handlers that simplify the process from the **Access control (IAM)** blade at any scope, including management groups:

## Permission-Based Role Picker

**Summary**

Azure Copilot streamlines the process of assigning roles and permissions by interpreting user intent and guiding admins through a least-privileged, permission-based selection flow. Whether the task is managing Azure Functions or granting access to a Key Vault, Copilot helps ensure secure and efficient role assignments.

  This experience is powered by the `AddRoleAssignmentCopilotHandler`, which enables the Permission-Based Role Picker to guide users through role selection and assignment.

**How It Works**

1. **Suggest relevant permissions**

Admins can describe a task using natural language. For example:

*"I need to give a user permission to manage a key vault."*

Copilot interprets the request and identifies the necessary permissions.

![PermRolePick1](/.attachments/AAD-Account-Management/2138546/PermRolePick1.jpg)

2. **Offer guided options**

  Admins can choose from the following:

- **Select permissions**

  Copilot recommends the least-privileged built-in or custom role that satisfies the permissions.

- **Recommend other permissions**

  Refine or expand the permission set or scope.

  ![PermRolePick2](/.attachments/AAD-Account-Management/2138546/PermRolePick2.jpg)

- **Recommend other roles**

  View a list of roles, ordered by least privilege, that can fulfill the task.

- **Select role**

  Go to the Add role assignments page with:

  - The **Members** tab pre-filled

  - The selected role ready for assignment to a user, group, service principal, or managed identity

  ![PermRolePick3](/.attachments/AAD-Account-Management/2138546/PermRolePick3.jpg)

3. **Complete the role assignment**

  The admin proceeds through the standard role assignment flow.

___

## Custom Role Creation

**Summary**

Creating custom roles in Azure can be complex due to the abstract nature of permissions. Azure Copilot simplifies this by allowing admins to use natural language prompts to generate tailored roles with just the right permissions.

**How It Works**

Admins can describe what they need in plain language. For example:

*"Help me create a custom role to create managed identities with just the required number of permissions."*

Copilot responds with two main options:

1. **Select permissions**

Proceed with the recommended permission set. This takes the user to the **Create custom role** blade, where they can:

- Name the role

- Make final edits

- Click **Review + create** to finish

    ![CreateCRPrompt](/.attachments/AAD-Account-Management/2138546/CreateCRPrompt.jpg)

2. **I need to add more permissions**

Expand the roles capabilities by adding additional permissions. For example:

*"Please also include permissions to manage Azure Functions."*

![ExpandCRCreation](/.attachments/AAD-Account-Management/2138546/ExpandCRCreation.jpg)

___

## Nudge Buttons for Feature Discovery

Azure Copilot features are most effective when users know how to engage with them. To increase awareness and adoption, contextual **nudge buttons** have been added to the IAM experience. These buttons highlight what Copilot can do and guide users through advanced workflows like role selection, description generation, and condition definition.

**How It Works**

Nudge buttons appear contextually and help users discover Copilot capabilities by simulating common workflows:

- **Selecting the right role**

Guides users through choosing the appropriate role for a given task.

![NudgeButton3](/.attachments/AAD-Account-Management/2138546/NudgeButton3.jpg)

- **Generating role descriptions**

For example, the *Generate description with Copilot* nudge on the **Members** tab can automatically create a role description using context from the selected principal and role definition.

![NudgeButtons](/.attachments/AAD-Account-Management/2138546/NudgeButtons.jpg)

- **Defining role conditions**

Helps users specify conditions for when and how a role should apply.

![NudgeButton2](/.attachments/AAD-Account-Management/2138546/NudgeButton2.jpg)

### Additional Notes

- This feature is part of **Azure Copilot** and is **free**.

- It is distinct from Security Copilot (part of Microsoft Entra, subscription required).

- It does **not** affect Copilot for Defender for Cloud.

___

# Requirements

- Azure Subscription

___

# Roles

Users assigned to the Reader role can ask Copilot to suggest a role assignment to create VMs. However, it may not open the blade and definitely will not let them **Save**.

___

# Limitations

Role Picker does not yet support prompts that require multiple roles.

___

# Support Boundaries

**What is Copilot in Azure?**

Copilot in Azure helps users perform tasks that are already possible in the Azure portal. It simply makes those tasks faster and easier.

**Where does support begin?**

Support starts with the technology area related to the task.

For example, if the task involves Azure RBAC, the support request should go to the **Security and Access Management** team using a Support Area Path below `Azure/Microsoft Entra Directories, Domains, and Objects/Role Based Access Control (RBAC) for Azure Resources (IAM)`.

**What if the customer isn't satisfied with Copilots response?**

Encourage them to use the feedback option in Copilot. This ensures their input reaches the right team.

If they've already submitted feedback but still want to escalate an RBAC issue, open an ICM to the [Policy Administration Service](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=2138546&anchor=icm-path).

**What if Copilot itself isn't working?**

Major issues like failure to launch should be routed to the Compute team using the Support Area Path of `Azure/Microsoft Copilot in Azure/Issue with Microsoft Copilot in Azure/Microsoft Copilot in Azure not functioning as expected`.

___

# Access Points for Role Assignment via Copilot

This feature is only available in the **Add role assignment** blade. It can be accessed both through the **Copilot can help pick role** button or the **Copilot** button in the ribbon.

[Return to Copilot TSG Workflow](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=2138546&anchor=workflow)
___

# Prompt Engineering

When crafting prompts for Copilot, specificity is key, especially when working with the **Role Picker** handler.

 **Too General**

A prompt like:

  *"What are the least privileged roles to manage secrets in Key Vault?"*

...is too broad. It will not trigger the **Role Picker handler**. Instead, Copilot will treat it as a general Q&A and respond using public documentation.

 **Better Prompts**

To activate **Role Picker handler** verify the user prompt contains key works such as:

- *"help me pick a role"*

- *"what is the least privileged role for"*

- *"Help me make an assignment."*

- *"I want to assign users the permission they need to manage secrets in Key Vault."*

- *'what role is appropriate for assigning azure role assignments?"*

- *"I want to be able to read blobs and stop vms"*

- *"give me a role with the following permissions: Microsoft.Storage/storageAccounts/read,Microsoft.Authorization/classicAdministrators/read"*

These are action-oriented and guide Copilot to the right handler.

**Note:** See [AddRoleAssignment.copilot.json](https://dev.azure.com/msazure/One/_git/AD-IAM-Services-ADIUX?path=%2Fsrc%2FADRBACExtension%2FExtension.UX%2Fcopilot%2FAddRoleAssignment.copilot.json) for the full list of example prompts used in source. 

 **Current Limitation**

Role Picker does not yet support prompts that require multiple roles.

For example:

  *"I want to assign users the permission they need to manage secrets and keys in Key Vault."*

This will attempt to find a single role that covers both permissions, rather than suggesting two separate roles.

[Return to Copilot TSG Workflow](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=2138546&anchor=workflow)

___

# Capture Browser Trace

If the issue happens every time, ask the customer to copy:

- The prompt they submitted

- The Copilot response

  **Note**: If the issue doesn't always reproduce and you don't want to lose the session, skip the browser trace and go straight to [getting the Session ID](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=2138546&anchor=get-the-session-id).

**If the issue does reproduce:**

1. In Copilot, click the ellipses (...) and select **New chat**.

  ![NewChat](/.attachments/AAD-Account-Management/2138546/NewChat.jpg)

2. Press **F12** in the browser to open **Developer tools**.

3. Check the box for **Preserve log**.

4. Re-enter the same prompt that caused the issue.

5. Once the error occurs again, download the **HAR file**.

  ![DownloadHAR](/.attachments/AAD-Account-Management/2138546/DownloadHAR.jpg)

[Return to Copilot TSG Workflow](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=2138546&anchor=workflow)

___

# Get the Session ID

1. While still in Copilot (after the issue reproduces), press **CTRL**+**ALT**+**D** to open troubleshooting details. 

2. Look in the **bottom-right corner** and **copy the Session ID**.

  ![GetSessionID](/.attachments/AAD-Account-Management/2138546/GetSessionID.jpg)

**Tip:** It's ideal to capture a browser trace when the prompt is submitted. But if you're unsure the issue will reproduce, grab the [Session ID](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=2138546&anchor=get-the-session-id) first, then try to [capture a browser trace](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=2138546&anchor=capture-browser-trace).

3. To find information for each specific Copilot response, press **CTRL**+**ALT**+**D** **again**. Yellow boxes should appear for each Copilot response message. From that, collect **CorrelationId** and **ActivityId** and check the **PluginIds** for the response that user finds problematic. The **CorrelationId** and **PluginIds** will differ for each message.

  ![PluginIds](/.attachments/AAD-Account-Management/2138546/PluginIds.jpg)

  If the PluginId is not `addroleassignmentcopilothandler` or `AddRoleAssignmentCopilotHandler`, then it means that the user query has not been properly routed to this feature. Routing is a known issue with the Azure Copilot platform.

[Return to Copilot TSG Workflow](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=2138546&anchor=workflow)

___

# Troubleshooting

Admins can issue suggestion prompts for RBAC from anywhere within the **Access Control (IAM)** blade.

- If the admin doesnt see a list of permissions, they should start the **Add role assignment** flow and then click the **Copilot can help pick role** helper prompt.

___

# Workflow

:::mermaid
graph TD
 A[Start]
 A1["Verify which blade is the user on"]
 B["1. Collect Tenant ID and Subscription ID"]
 C["2. Record the prompt and Copilot's response"]
 D["Is the prompt supported?\n\n- Verify the prompt is not too general"]
 D1["Valid prompt fails"]
 D2["Does refined prompt work as desired?"]
 D3["Close case"]
 E["3. Capture a browser trace of the prompt and response"]
 F["4. Get the Session ID"]
 G["Examine service-side trace logs in ASC"]
 H["File ICM\n\n- Supply items 1-4 in the ICM"]

 A --> A1
 A1 --> B
 B --> C
 C --> D
 D -->|Yes| D1
 D1 --> E
 D -->|No| D2
 D2 -->|No| E
 D2 -->|Yes| D3
 E --> F
 F --> G
 G --> H

 %% Clickable links
 click A1 href "https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=2138546&anchor=access-points-for-role-assignment-via-copilot" "Access Points for Role Assignment"
 click D href "https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=2138546&anchor=prompt-engineering" "Prompt Engineering Guidance"
 click E href "https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=2138546&anchor=capture-browser-trace" "How to capture browser trace"
 click F href "https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=2138546&anchor=get-the-session-id" "How to get Session ID"
 click G href "https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=2138546&anchor=kusto-web-ux-(asc)" "Examine logs in ASC"
 click H href "https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=2138546&anchor=icm-path" "File an ICM"

 %% Class definitions
 classDef clickable fill:blue,stroke:#fff,stroke-width:1px,color:white;
 class A1,D,E,F,G,H clickable
:::

## Azure Support Center (ASC)

### Kusto Web UX (ASC)

1. In ASC, navigate to **Kusto Web UX** and click the *ASC Kusto Web UX* link.
2. From the **Select cluster to add:** drop-down, select `azportalpartnerrow.westus`.
3. Select the `AzurePortal` database.
4. Select the `ExtTelemetry` table.

#### Trace Role Assignment (ASC)

Use the following query to view client-side telemetry related to role assignments.

This example shows the `action` taken and the associated `data`.

- Be sure to replace `<SessionID>` with the actual session ID from the customer.

```json
ExtTelemetry //working query for Copilot in Azure
| where env_time > ago(1d)
| where sessionId == "<SessionID>" // change to any session id
| where extension == "Microsoft_Azure_AD"
//| where action == "initialize //"OpenedNudgeButton" //"CopilotInitialRecomendation" //"addRoleAssignments" //"OpenedNudgeButton"
//| where assetType == "error" //Use this to trace errors only.
| project TIMESTAMP, assetType, action, data
```

If the feature worked correctly, you should see an action with `"CopilotInitialRecomendation"`. The associated `data` field will contain the recommended permissions and role.

**Privacy Note**: To protect customer privacy, Copilot conversations are not logged, except when using the Microsoft tenant (Tenant ID: 72f988bf-86f1-41af-91ab-2d7cd011db47).

**Debugging Steps**

If you need to debug a scenario:

1. Reproduce the prompt and responses using an [FDPO (aka: internal) subscription](https://aka.ms/mcapsnewazuresub) under the Microsoft tenant.

2. Continue troubleshooting using the [Kusto (Client)](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=2138546&anchor=kusto-(client)) outside of ASC.

**Important**: The Kusto Client is required because ASC's Kusto Web UX needs Global Administrator rights in the Microsoft tenant to side-load the tenant ID in ASC.

**If You Don't Have FDPO or Kusto Access**

You can still use the **Portal Event Flow** below to understand what's happening in ASC:

**Portal Event Flow**

0. Admin loads the **Add role assignment** blade.

    - **Action:** `initialize`

      **Data:** `{"message":"addPermissions"}`

1. Admin clicks **Copilot can help pick role**:

    - **Action:** `OpenedNudgeButton`

      **Data:** `{"message":"addPermissions"}`.

    - **Action:** `addPermissions

      **Data:** `{"interactionSource":"button","target":"AddRoleAssignmentsSelectRoleTab"}`

    - **Action:** `nudge`

      **Data:** *(empty)*

    - **Action:** `nudge`

      **Data:** `{"nudgeResult":{"result":"Ok"}}`

2. Admin submits prompt:

    "I need to give a user the permission needed to create user assigned managed identities."
    
    Copilot responds with:
  
    `Microsoft.ManagedIdentity/userAssignedIdentities/write`

       No backend activity is generated for this step.

3. Admin clicks **Select permissions**

    Copilot responds with:

    ```code
    We recommend Managed Identity Contributor role.
    
    This role is least privileged, built-in, has at least a condition, and contains the previous permissions.
    ```

    Copilot also opens a blade showing all **Actions** permissions supported by the recommended role, with an option to view **DataActions**.

    - **Action:** `CopilotInitialRecomendation`
      **Data:** 
      
      ```json
      {
        "permissions": [
          "Microsoft.ManagedIdentity/userAssignedIdentities/write"
        ],
        "lessPrivilegedRoleId": "e40ec5ca-96e0-45a2-b4ff-59039f2c2b59",
        "scope": "/subscriptions/78cd376b-####-####-####-############"
      }
      ```

    - **Action:** `GET`

      **Data:** containing a `GetRoleDefinitions` call for the [built-in role(s)](https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles) that satisfies the prompt.

    - **Action:** `GET`
      **Data:** `GetProviderOperations` call to discover available permissions

4. **Admin clicks Select role**

    Copilot launches the **Add role assignment** blade allowing the admin to proceed with the normal role assignment flow.

    - **Action:** `SelectedRoleByCopilot`
    
      **Data:** `{"message":"e40ec5ca-96e0-45a2-b4ff-59039f2c2b59"}` showing the selected RoleDefinition ID.

    - **Action:** `RoleToBeSelected`

      **Data:** `{"message":"e40ec5ca-96e0-45a2-b4ff-59039f2c2b59"}` showing RoleDefinition ID that will be targeted by clicking **Select role**.

If this does not provide the information you need and you don't have an FDPO subscription and Kusto client access to debug this further, you can file an ICM.

[Return to Copilot TSG Workflow](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=2138546&anchor=workflow)

___

## Kusto (Client)

### Permission

**Note**: For access outside of ASC, see [Azure Portal Telemetry Data Access](https://eng.ms/docs/products/azure-portal-framework-ibizafx/telemetry/data-access).

| Access Model | Recommended |
|-----|-----|
| Using MSFT-AzVPN with Corpnet identity |  Request Azure Portal Data Access group entitlement |
| Using a SAW device with AME | SAW + production identity + AZURE-ALL-PSV group |

___

### Connection

**Cluster**: `azportalpartnerrow.westus.kusto.windows.net`

**Database**: `AzurePortal`

**Table**: `ExtTelemetry`

**Prerequisite**

This assumes the initial query under [Trace Role Assignment (ASC)](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=2138546&anchor=trace-role-assignment-(asc)) was performed and you now have a repro of the customer issue in an FDPO internal subscription.

**Next Step: View Conversation Logs**

Use the provided query to view conversation logs, which include:

- The source of each message (e.g., Copilot, user, clientHandler)

- The backend interactions between Copilot and the handler

**Note**: `LogConversationTurn` entries are only available when using the Microsoft tenant.

```json
ExtTelemetry //working query for Copilot in Azure 
| where sessionId == "<SessionID>" // change to any session id 
| where extension == "Microsoft_Azure_Copilot" 
| where action == "LogConversationTurn" 
| project data 
```

**If Copilot Fails to Respond**

In rare cases where Copilot errors out and doesn't return a natural language response (as seen in `LogConversationTurn`), you can get more details from the `CoPilotSvcTraces` table:

```json
cluster('azportalpartnerrow.westus.kusto.windows.net').database('AzurePortalRP').CoPilotSvcTraces
| where correlationId == "K6Z8zL4Dh9kJfbqcmiwmSU-us|0000015"
```

You can also check the `CoPilotSvcErrors` table for additional error context.

___

# ICM Path

If the RBAC handler in Azure fails to make a suggestion or 

- **Owning Service**: `Policy Administration Service`

- **Owning Team**: `Azure RBAC UX`

___

# Training

## Deep Dive 264708 - Copilot for Azure RBAC

Identity PM, Yihe Guo, presents on Copilot for Azure RBAC Role Picker. The session addresses the challenges faced by Azure RBAC admins in selecting appropriate roles due to the vast number of built-in roles and permissions. Yihe introduced the Copilot feature, which assists admins by translating natural language queries into specific permissions and recommending the least privileged roles. The session included a detailed walkthrough of the Copilot's functionality, its integration within the Azure platform, and troubleshooting steps for common issues. Participants also discussed known limitations and future enhancements for the tool.

**Title:**Deep Dive 264708 - Copilot for Azure RBAC

**Format:**Self-paced eLearning

**Duration:**22 minutes

**Audience:**Cloud Identity Support community **Security and Access Management**

**Microsoft Confidential** Items not in Public Preview or released to the General Audience should be considered confidential. All Dates are subject to change.

**Tool Availability:** July 1, 2025

**Training Completion:**July 1, 2025

**Region**: All regions

**Course Location:**[QA](https://aka.ms/AAwpywz) and [PPT](https://aka.ms/AAwpr57)