---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Identity Governance/SAP cIAG Integration in Entitlement Management"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FIdentity%20Governance%2FSAP%20cIAG%20Integration%20in%20Entitlement%20Management"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD Synchronization
- cw.AAD Workflow
- cw.AzureAD
- cw.TSG
---
:::template /.templates/Shared/findAuthorContributor.md
:::

:::template /.templates/Shared/MBIInfo.md
:::



[[_TOC_]]

# Compliance note

This wiki contains test/lab data only.

___

# Summary

This feature enables administrators to integrate **SAP Cloud Identity Access Governance (cIAG)** with **Microsoft Entra Entitlement Management**, allowing SAP business roles to be brought into Entra catalogs as resources. After connecting SAP and adding these roles, admins can create **self-service access packages** so users can request SAP roles just like any other supported resource.

**Key Capabilities:**

- Seamless connection between SAP IAG and Entra Entitlement Management.
- **Uses Microsoft Entra user provisioning** to ensure identities are synchronized across SAP Cloud Identity Services and SAP IAG.
- Ability to create and manage access packages that include SAP roles.
- Approval workflows routed through SAP IAG.
- Provisioning of roles across both systems for consistent governance.

___

# Limitaitons

Catalog delegation and specific roles for protecting SAP Role assignments in Access Packages will be available prior to General Availability.

___

# Pre-Requisites

## Licensing and Roles

- Microsoft Entra ID Governance or Microsoft Entra Suite licenses

- User assigned to the **Identity Governance Administrator** role

___

## Azure Setup

- An **Azure Subscription** with a **Microsoft Azure Key Vault**

  - [Quickstart: Create a key vault using the Azure portal](https://learn.microsoft.com/en-us/azure/key-vault/general/quick-create-portal)
- User assigned at least the **Key Vault Secrets Officer** role for the appropriate Key Vault
- Create a SAP IAG Client Secret in the Key Vault

  - [Quickstart: Set and retrieve a secret from Azure Key Vault using the Azure portal](https://learn.microsoft.com/en-us/azure/key-vault/secrets/quick-create-portal)
- **SAP Cloud Identity Services**
  - The instance should already be integrated with Microsoft Entra for:
    - **User Provisioning**: [Configure SAP Cloud Identity Services for automatic user provisioning with Microsoft Entra ID](https://learn.microsoft.com/en-us/entra/identity/saas-apps/sap-cloud-platform-identity-authentication-provisioning-tutorial)
    - **User Single Sign-On  (Optional)**: [Configure SAP Cloud Identity Services for Single sign-on with Microsoft Entra ID](https://learn.microsoft.com/en-us/entra/identity/saas-apps/sap-hana-cloud-platform-identity-authentication-tutorial)
- **SAP Cloud Identity and Access Governance (IAG)**
  - Valid SAP IAG tenant license
  - Support from the SAP BTP administrator to complete these requirements:
    - The Entra user configuring the connector must:
      - Be synced to both SAP Cloud Identity Services (IAS) and SAP IAG
      - Be a member of **IAG_SUPER_ADMIN** group and the **CIAG_Super_Admin** role in SAP BTP to add SAP IAG Access Rights as Resource in Microsoft Entra Entitlement Management.
  - SAP IAG with pre-requisites outlined in this internal wiki.

___

# Support Boundaries

___

# Architecture

![Architecture](/.attachments/AAD-Account-Management/2298663/Architecture.jpg)

___

# Connect Entitlement Management to SAP IAG instances

This process creates a self-service request workflows using access packages that enable users to request SAP business roles efficiently.

## Part 1: Prep SAP IAG instance to connect with Entra

To synchronize user-group and attribute data from your **SAP Cloud Identity** tenant into **SAP Cloud Identity Access Governance (IAG)**, follow these steps:

### 1. Register the IAG Sync System Administrator

- In the SAP Cloud Identity tenant, go to **Administrators**.

- Select **+ Add** > **Add System**.

- Name the system **IAG Sync**.

- Assign the following provisioning roles: 
  - **Manage Users**

  - **Manage Groups**

  - **Proxy System API**

  - **Real-Time Provisioning API**

  - **Identity Provisioning Tenant Admin API**

    ![RegSIAGadmin](/.attachments/AAD-Account-Management/2298663/RegSIAGadmin.jpg)

- Under **Configure System Authentication** > **Certificate:**

  - Generate a certificate and click **Save**.
  - Keep the downloaded .p12 certificate file and its password in a secure location.
  - Alternatively, upload an existing .p12 certificate.

  ![ConfigCert](/.attachments/AAD-Account-Management/2298663/ConfigCert.jpg)

___

### 2. Create the BTP HTTP Destination

- In the **SAP BTP subaccount**, go to:
   - **Connectivity > Destination Certificates > Create**
   - Choose **Generation method: Import** and upload the **.p12 certificate** from the previous step.
- Next, navigate to:
  
   - **Connectivity > Destinations > New Destination > From Scratch**
- Configure the destination:
   - **Name:** `SAP_Identity_Services_Identity_Directory`
   - **Type:** `HTTP`
   - **URL:** `https://<SCI_TENANT_ID>.accounts.ondemand.com`
   - **Proxy Type:** `Internet`
   - **Authentication:** `ClientCertificate`
- Set up authentication:
   - Use your **Client ID/Secret** or the certificate you uploaded earlier.
   - **Store Source:** `DestinationService`
   - **Key Store Location:** Select the same certificate from the dropdown list.
- Add these properties:
   - `Accept = application/scim+json`
   
   - `GROUPSURL = /Groups`
   
   - `USERSURL = /Users`
   
   - `serviceURL = /scim`
   
     ![BTPHTTPDest](/.attachments/AAD-Account-Management/2298663/BTPHTTPDest.jpg)

___

### 3. Point IAG to the Destination

- In the **IAG Configuration** app, go to **Application Parameters**.
- Find **UserSource > SourceSystem**.
- Click **Edit** and enter:
   `SAP_Identity_Services_Identity_Directory`

___

### 4. Execute the SCI User Group Sync Job

- In **IAG**, open **Job Scheduler**.
- Click **Schedule Job**, select **SCI User Group Sync**.
- Choose **Start Immediately** or set a recurrence, then confirm.
- Monitor execution and logs in **Job History**.

___

### 5. Create IPS_PROXY Destination in SAP BTP

**Prerequisite:** An administrator user is created in IAS, and the username/password are available.

1. In your **SAP BTP subaccount**, go to **Connectivity > Destinations > Create > From Scratch**.
2. Add the following details: 
   - **Name:** `IPS_PROXY`
   - **Authentication:** `BasicAuthentication`
   - **Type:** `HTTP`
   - **User:** Client ID of the IAS administrator (IAG Sync user from Step 1)
   - **Password:** Password of the IAS administrator
   - **Description:** IPS Destination
   - **Proxy Type:** `Internet`
   - **URL:** `https://<YOUR_IPS_TENANT>.<DOMAIN>.hana.ondemand.com`
3. Add this property: 
   - `Accept = application/scim+json`
   - `ServiceURL - /ipsproxy/service/api/v1/scim/` 
   3. `USERSURL - /Users` 
   4. `GROUPSURL - /Groups`

___

### 6. Create an Application in IAG

**Prerequisite:** IPS Proxy systems must already be created in **SAP Cloud Identity Services**.

- In **IAG**, go to **Application** > click **+** to create a new application.
- Add a description for the application.

For detailed instructions on role assignments, destination configurations, and scheduling options, refer to SAPs documentation: [Syncing User Groups from SAP Identity Services into IAG](https://help.sap.com/docs/SAP_CLOUD_IDENTITY_ACCESS_GOVERNANCE/e12d8683adfa4471ac4edd40809b9038/de385218e7f94ce9ad62b1c3488413dd.html?version=CLOUDFOUNDRY).

___

## Part 2: Connect the SAP IAG instance in Microsoft Entra 

**Prerequisite:**

- An **Azure Subscription**
- An **Azure Key Vault** to store SAP IAG information

### Configure SAP IAG Connector in Microsoft Entra

1. Go to the **Microsoft Entra Admin Center**:
   
    - Sign in with an account that has at least **Identity Governance Administrator** permissions.
    
2. Navigate to **Identity Governance**, then under **Entitlement Management**, select **Control Configurations**.
   
    > **Note**: Setting up the connector requires either tenant-level administrator permissions or Identity Governance Administrator permissions.
    
3. On the **Control Configurations** page, find the **Manage External Connectors** card and click **View Connectors**.

    ![ManageConnect](/.attachments/AAD-Account-Management/2298663/ManageConnect.jpg)

4. On the **Connectors** page, click **New connector**.

5. In the **New Connector** dialog, open the dropdown and select **SAP IAG**.

    ![SAPIAGConnect](/.attachments/AAD-Account-Management/2298663/SAPIAGConnect.jpg)

6. After selecting SAP IAG, the admin will be prompted to enter these details: **Name**, **Description**, **Subscription**, **Key Vault Name**, **Secret Key**, **Client ID**, **SAP IAG Access Token URL**, and **IAG URL**.

    > **Note**: Entra Admins must work with the SAP BTP Tenant Administrator to obtain the correct SAP BTP details listed in the table that is below the image.

    ![ConfigConnector](/.attachments/AAD-Account-Management/2298663/ConfigConnector.jpg)
    

| Field | Description | Provided by |
|-----|-----|-----|
| Type | Default: IAG | Microsoft Entra |
| Name | Custom | Customer |
| Description | Customer | Customer |
| Endpoint URL | Base URL for all SAP IAG services (this is used to fetch roles or check role assignment status) | The customer obtains this information from SAP BTP. When the service is subscribed, a service key and endpoint URL are generated. These details are found in the BTP subaccount, but they are only visible to the SAP BTP Tenant Administrator. |
| Secret Name | Azure Key Vault Secret name where the Client Secret was stored | 1. In SAP, go to **Instances and Subscriptions**, click **View Credentials**, and copy value from the **clientsecret** parameter.<br><i>Example:</i>![GetCliSecret](/.attachments/AAD-Account-Management/2298663/GetCliSecret.jpg)<br>2. If the customer doesnt already have an Azure Key Vault, create one. If they do, simply [create a new secret](https://learn.microsoft.com/en-us/azure/key-vault/secrets/quick-create-portal) using the copied **clientsecret** value.<br><i>Example:</i>![NameKVSecret](/.attachments/AAD-Account-Management/2298663/NameKVSecret.jpg)<br>3. Finally, enter the **Secret Name** from Key Vault into the required field. |
| Client ID | Client identifier | Customer obtains this from SAP BTP. When service is subscribed, this will come with service Key and can be viewed by tenant admin only. |
| SAP IAG Access Token URL | Base URL for generating an authentication token to call SAP IAG <br/>services | This information is obtained from SAP BTP. When the service is subscribed, a service key and endpoint URL are generated. These details are available in the BTP subaccount and can only be viewed by the SAP BTP Tenant Administrator.<br><br>To access them:<br>1. Go to the **Instance** tab.<br>2. Select the **GRC IAG api Space-Scoped Broker** instance.<br>3. View the **Service Keys** details.<br>![SKDetails](/.attachments/AAD-Account-Management/2298663/SKDetails.jpg)<br>4. Copy the **URL** parameter and add the suffix `/oauth/token` before using it in the New Connector. |
| IAG URL | API Base URL<br><br>Customer obtains from SAP BTP. When service is subscribed, a service key is generated along with endpoint URL as well. This information can be found in BTP subaccount. Its only visible by SAP BTP tenant admin.  Go to **BTP Cockpit**, **Instances and Subscriptions** and locate their SAP IAG Service instance (Service Technical Name: `grc-iag-api`), then click **View Credentials**, and copy the `ARQAPI` value. | ![IAGURL](/.attachments/AAD-Account-Management/2298663/IAGURL.jpg) |

7. After completing the *New Connector* template, click **Create**to set up the connector. 

___

## Part 3: Add SAP IAG Roles to EM Catalog and Access Package

1. Navigate to Entitlement Management, select **Catalogs**, and click **New Catalog** to create one.

2. After creating the catalog, open the **Resources** tab and click **Add resources**.

3. Click the **SAP IAG** button to open the context pane.

- From the dropdown, choose the SAP IAG instance that was connected.

- Next, select **SAP IAG Access Rights** from the list and click **Add**.

   ![SAPResource](/.attachments/AAD-Account-Management/2298663/SAPResource.jpg)

4. After the SAP IAG instance is added to the catalog:

- Go to the **Access packages** tab and click **New access package**.
- In the **Resource roles** tab, select **SAP IAG**, then choose **SAP IAG Access Rights**.

5. In the resources table, select the business roles to be included in the access package and click **Next**.

   ![SelectRole](/.attachments/AAD-Account-Management/2298663/SelectRole.jpg)

6. On the **Requests** tab, create the first policy to define who can request the access package and set approval options:

   - Select **For Users in your Directory**.

   - Choose **Specific Users and Groups** to restrict access to Private Preview participants.

     >  **Recommended**: Create a new Microsoft Entra group for this.

   - Configure approval settings as needed.

   - Ensure **Enable new requests** is selected.

   - Click **Next: Requestor Information**.

     ![Policy](/.attachments/AAD-Account-Management/2298663/Policy.jpg)

7. In the **Requestor Information** tab:
   
- Click **Next: Lifecycle**.
  
8. In the **Lifecycle** tab:

   - Enter the number of days to grant access.
   
   - Make sure **Require Access Review** is unchecked.
   
   - Click **Next: Rules**.
   
     ![CreatePolicy](/.attachments/AAD-Account-Management/2298663/CreatePolicy.jpg)
   
9. Click **Create** to complete the access package setup. For more details on configuring access packages, see our documentation.

10. After saving, users in the specified group can request the package through the [My Access](https://myacess.microsoft.com) portal. For instructions on requesting an access package, refer to [Request access to an access package in entitlement management]([Request an access package - entitlement management - Microsoft Entra ID Governance | Microsoft Learn](https://learn.microsoft.com/en-us/entra/id-governance/entitlement-management-request-access)).

___

## Part 4: Testing

After configuring the new SAP IAG Connector, IT admins can run an end-to-end test:

1. Create a new SAP IAG Business Role.

2. Create an Access Package that grants access to this new role.

3. Sign in as a user and request the access package.

4. For detailed instructions on requesting an access package, see the documentation.

5. Confirm that the role is assigned in SAP IAG.

___

# Troubleshooting

___

# ICM Path

**Owning Service**: Azure AD Entitlement Lifecycle Management

**Owning Team**: Triage