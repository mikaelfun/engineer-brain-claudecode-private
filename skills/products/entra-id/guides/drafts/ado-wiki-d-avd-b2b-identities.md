---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD B2B/AVD Support for External B2B Identities"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.EntraID
-  cw.comm-extidmgt
- B2B Collaboration
---
:::template /.templates/Shared/findAuthorContributor.md
:::

:::template /.templates/Shared/MBIInfo.md
:::



[[_TOC_]]


# Compliance note

This wiki contains test and/or lab data only.

___

# Feature overview

Azure Virtual Desktop (AVD) now supports External B2B Identities.

- External users can sign in using their home Entra ID, federated identity providers (e.g., Okta, Ping), or social identities (e.g., Gmail, Outlook).
- Users can switch organizations in the Windows App or Web client to access resources in guest tenants.
- Single Sign-On (SSO) is supported across clients, with consent prompts managed via Microsoft Graph.
- Admins can assign resources to external users just like internal users.
- Conditional Access (CA) policies can be targeted specifically to B2B users.
- Granular access controls allow resource-level restrictions and MFA enforcement.

___

# Terms and Definitions

| Term | Description |
|-----|-----|
| Home tenant | The location where the user identity is created and managed. This could be an Entra ID tenant, MSA, Google, Ping, OKTA and others |
| Resource tenant | The Entra ID B2B tenant where the user identity was invited to |
| B2B | Business-to-business functionality in Entra ID that allows an Entra ID tenant to invite external user identities so they can access resources in the B2B tenant |
| B2C | Business-to-consumer functionality in Entra ID that allows the creation of a branded experience to manage user identities and invite external user identities so they can access resources in the B2C tenant |

___

# Support Boundaries

| Senario | Supported By | SAP |
|-----|-----|-----|
| B2B Sign-in to AVD using Windows app for Windows or MacOS or Web client | Azure Virtual Desktop | Azure/Azure Virtual Desktop/Authenticating to Azure Virtual Desktop/Using Single Sign-On with Azure virtual Desktop |
| RDP fails for the default local administrator account, even after removing the AADLoginForWindows extension. | MSaaS POD Azure IaaS VM Connectivity (Premier) | Azure/Virtual Machine running Windows/Cannot connect to my VM |
| Outbound network traffic from the Azure VM to the Internet is failing. | Azure Networking POD | Azure/Virtual Machine running Windows/Azure Features/Azure Networking |
| Problems assigning RBAC Role membership to **Virtual Machine Administrator Login** or **Virtual Machine User Login** Azure RBAC roles. | AAD - Account Management | Azure/Microsoft Entra Directories, Domains, and Objects/Role Based Access Control (RBAC) for Azure Resources (IAM)/Problems with RBAC role assignments |
| Deployment of a new VM with AADLoginForWindows fails | AAD - Authentication | Azure/Virtual Machine running Windows/VM Extensions not operating correctly/Azure Active Directory Login extension issue |
| Install/Update/Removal the AADLoginForWindows VM extension to an existing VM fails, but not with other extensions. | AAD - Authentication | Azure/Virtual Machine running Windows/VM Extensions not operating correctly/Azure Active Directory Login extension issue. |
| RDP works for the default local administrator account, but AAD login fails. | AAD - Authentication | Azure/Virtual Machine running Windows/VM Extensions not operating correctly/Azure Active Directory Login extension issue |
| The AADLoginForWindows extension fails to add/remove users from local Administrators or Users groups when the external user's membership changes in the **Virtual Machine Administrator Login** or **Virtual Machine User Login** Azure RBAC role. | AAD - Authentication | Azure/Virtual Machine running Windows/VM Extensions not operating correctly/Azure Active Directory Login extension issue |
| The AADLoginForWindows Extension installed, but B2B Managed, Federated, or external users assigned to **Virtual Machine Administrator Login** or **Virtual Machine User Login** Azure RBAC roles fail to login. | AAD - Authentication | Azure/Virtual Machine running Windows/VM Extensions not operating correctly/Azure Active Directory Login extension issue |

___

# Supported External Identity Types

- Entra ID account from a different Entra tenants in the same cloud.
- Account from a different Identity Providers federated with Entra ID using WS-Fed/SAML.
- Social IDP account such as Microsoft Account, Google, Facebook that support WS-Fed/SAML.

## External Account Types in Entra

- **Social IDP Account**: Email account that does not live in home tenant. It's just an emails account ie Gmail, Outlook, Facebook, etc...
- **Microsoft account**: aka: MSA account
- **External Entra Account**: Entra account that was invited to resource tenant but lives in another home tenant.

![Items](/.attachments/AAD-Account-Management/2251938/Items.jpg)

___

# AVD Authentication and Connection Flows

## Native Clients - Subscribe

1. User clicks **Subscribe** or **Subscribe with URL**

2. Request a token in their home cloud/tenant (URL) or Azure Public by default

3. User selects their account or adds a new one

4. Retrieve the resources in their home tenant if available

5. Query all other tenants the user is part of. Return list of tenants.

6. Client makes one home tenant authenticated call to the AVD service passing their list of tenants to see if they have AVD resources in those other tenants. The service makes a check access call without impersonating the user using OID and tenant to see if they have resources in each tenants.

7. For each tenant with resources, attempt to retrieve the resources silently by getting a tenanted token. Scale concern
   - a. If successful, add the resources to the Connection Center and save the tenant information
   - b. If fails, add a notification to the Connection Center that resources are available in that tenant and save the tenant information
   
8. When users client the Subscribe option after 7b, request in token in the appropriate tenant to retrieve the resources.

___

# Known Issues

## Guest User Lacks RBAC Role Assignment

In this scenario, the guest user is assigned to Application Group, but not assigned to the **Virtual Machine Administrator Login** or **Virtual Machine User Login** Azure RBAC role.

The user signs in successfully to the Windows App, with the Contoso resource domain listed for the signed in guest user. However, clicking **Connect** on the device pool fails with this error:

| Image | Text |
|-----|-----|
| Title: Remote Desktop<br><br>Body: An authentication error has occurred.<br>The logon attempt failed<br><br>Remote computer: avd25-1<br><br>Details: Error code: 0x0<br>Extended error code: 0x0<br>Timestamp (UTC): YYYY-MM-DDTHH:MM:SS.###Z<br>Activity ID: <guid><br><br>Press Ctrl+C to copy. | ~[WinAppError1](/.attachments/AAD-Account-Management/2251938/WinAppError1.jpg) |

A simple test is to perform a Web client sign-in.

1. Get the tenant ID of the resource tenant where the AVD computers are running.

2. Open a browser and navigate to: https://windows365.microsoft.com/ent?tenant={resource_tenantid}.

3. Click **Connect** and this error occurs:

![CaptureWCLogs](/.attachments/AAD-Account-Management/2251938/CaptureWCLogs.jpg)

**Client logs**:

```text
Subdetails: %s,RDPClient,AuthChallenge,[Client][Connection][Auth][RDS_AAD] Start RDS AAD auth process
[Connection] Status update: Connection Status: Establishing secure connection
[Telemetry::Event] Type: %s Details: %s 
 Subdetails: %s,RDPClient,AuthChallenge,Connect using RDS AAD Protocol.
[Client][Connection][Auth] Can fallback to AcquireTokenPopup to obtain Access Token: false
[Telemetry::Event] Type: %s Details: %s 
 Subdetails: %s,RDPClient,AuthChallenge,Acquiring RDS AAD Auth token with fallback enabled: false
[Telemetry::Event] Type: %s Details: %s 
 Subdetails: %s,RDPClient,AuthChallenge,[Client][Connection][Auth][RDS_AAD] Start RDS AAD auth process
Disconnecting...
Disconnected: reason = 10006
[Telemetry::Event] Type: %s Details: %s 
 Subdetails: %s,RDPClient,DisconnectReason,LogonFailed Code: 10006
[Connection] Disconnected
```

The Web Client logs indicate the sign in failure is within the Remote Desktop Service (RDS) AAD auth process, and the AVD support team should validate all required steps have been followed. In this case, the the **Virtual Machine Administrator Login** or **Virtual Machine User Login** Azure RBAC role needs to be assigned to the guest user account.

## B2B Guest Users Fail to Connect on AAD DS�Joined Session Hosts (Error 10009)
The AVD session hosts were Microsoft Entra Domain Services (AAD DS) joined.

Authentication and feed discovery succeeded, but the connection failed during the AVD orchestration phase.  
The failure surfaced as a disconnect in the AVD client experience.

**Observed Error**
- **DisconnectReason:** OrchestrationResponseError  
- **Error Code:** 10009  
- **Error Message:** E_PROXY_TENANT_CANNOT_FIND_USER_IN_ACTIVE_DIRECTORY  
- **Underlying Exception:**  
  `Microsoft.RDInfra.RDAgent.Service.AddUserToLocalGroupAdErrorNoSuchMemberException`

This indicates the AVD session host agent failed while attempting to resolve the user identity and add the user to required local security groups on the VM.

**Root Cause**
This behavior is **by design** when using external B2B guest users with **AAD DS joined** AVD session hosts.

Key points:
- External B2B guest users exist only in **Microsoft Entra ID**
- **AAD DS does not contain or resolve external or guest identities**
- During orchestration, the AVD session host agent attempts to resolve the user against the directory backing the VM
- Because the session host is AAD DS joined, the user cannot be resolved, and orchestration fails with error **10009**

This is a platform limitation, not a regression or configuration issue.

**Supported Solution**
Migrate AVD session hosts to **Microsoft Entra ID joined** virtual machines.

Microsoft Entra ID joined session hosts are the **only supported configuration** for:
- Azure Virtual Desktop access by external B2B guest users
- Successful identity resolution and local group assignment during orchestration

There is **no supported workaround** for using B2B guest users on AAD DS joined AVD session hosts.

**References**
- Azure Virtual Desktop - [Supported identities and authentication methods](https://learn.microsoft.com/en-us/azure/virtual-desktop/authentication)

See also [Known issues](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/2253490/Troubleshooting?anchor=b2b-guest-users-failing-to-connect-on-aad-ds%E2%80%93joined-session-hosts-(error-10009)) in the AVD Support wiki page.

___

# Guest Invite Flow

1. Admin from the resource tenant selects **Invite External User** and enters the UPN of the guest.
2. The guest user opens their email and clicks the link to accept the invitation.
3. User clicks **Accept** on the permission request.

___

# Create Entra Joined Host Pool

1. See [Deploy Microsoft Entra joined VMs](https://learn.microsoft.com/en-us/azure/virtual-desktop/azure-ad-joined-session-hosts#deploy-microsoft-entra-joined-vms).

![domain2Join](/.attachments/AAD-Account-Management/2251938/domain2Join.jpg)

___

# Add RBAC Role Assignments

1. Navigate to resource group where VM is > **Access Control (IAM)**

2. Add **Virtual Machine Administrator Login** role assignment to any cloud only user in the resource tenant.

   ![VMA](/.attachments/AAD-Account-Management/2251938/VMA.jpg)

3. Add **Virtual Machine User Login** role assignment to external user.

   ![VMU](/.attachments/AAD-Account-Management/2251938/VMU.jpg)

___

# Assign Users to Application Group

1. Navigate to Application Group of Host Pool and add both admin user and external user

   ![AppG](/.attachments/AAD-Account-Management/2251938/AppG.png)

___

# Update Host Pool

1. Configure EntraSSO

- [Enable Microsoft Entra authentication for RDP](https://learn.microsoft.com/en-us/azure/virtual-desktop/configure-single-sign-on#enable-microsoft-entra-authentication-for-rdp)
- [Hide the consent prompt dialog](https://learn.microsoft.com/en-us/azure/virtual-desktop/configure-single-sign-on#hide-the-consent-prompt-dialog) 

2. Enable EntraSSO

   ![EnableSSO](/.attachments/AAD-Account-Management/2251938/EnableSSO.jpg)


3. Enable Clipboard and Drive redirection.

   ![CBD](/.attachments/AAD-Account-Management/2251938/CBD.jpg)

___

# Assign Licenses (Optional)

1. AVD does not strictly enforce Microsoft 365 licensing but our [docs](https://learn.microsoft.com/en-us/azure/virtual-desktop/prerequisites?tabs=portal#operating-systems-and-licenses) say its required.

___

# Configure Client Device and AVD VM

1. Login to client device with administrator account.

2. Open an elevated command prompt and enter this command to add a registry key (this will not be necessary after GA):

   ```command
REG ADD "HKLM\SOFTWARE\Microsoft\WindowsApp\Flights" /v EnableIdSignInUx /t REG_DWORD /d 1
   ```

3. Save following PowerShell Script as `EnableB2B.ps1`.

   ```powershell
   # Define the registry paths
   $featureOverridesPath = "HKLM:\SYSTEM\CurrentControlSet\Control\FeatureManagement\Overrides\8"
   $policyOverridesPath = "HKLM:\SYSTEM\CurrentControlSet\Policies\Microsoft\FeatureManagement\Overrides"
   
   # Create the main FeatureManagement Overrides path if it doesn't exist
   if (-not (Test-Path $featureOverridesPath)) {
       New-Item -Path $featureOverridesPath -Force | Out-Null
   }
   
   # Define subkeys and values for FeatureManagement Overrides
   $featureKeys = @(
       @{ SubKey = "1452641421"; EnabledState = 2; EnabledStateOptions = 0 },
       @{ SubKey = "156965516";  EnabledState = 2; EnabledStateOptions = 0 },
       @{ SubKey = "1853569164"; EnabledState = 2; EnabledStateOptions = 0 },
       @{ SubKey = "2991557773"; EnabledState = 2; EnabledStateOptions = 0 }
   )
   
   # Create subkeys and set values
   foreach ($key in $featureKeys) {
    $fullPath = Join-Path $featureOverridesPath $key.SubKey
    if (-not (Test-Path $fullPath)) {
        New-Item -Path $fullPath -Force | Out-Null
    }
    New-ItemProperty -Path $fullPath -Name "EnabledState" -Value $key.EnabledState -PropertyType DWord -Force | Out-Null
    New-ItemProperty -Path $fullPath -Name "EnabledStateOptions" -Value $key.EnabledStateOptions -PropertyType DWord -Force | Out-Null
   }
   
   # Create the Policy Overrides path if it doesn't exist
   if (-not (Test-Path $policyOverridesPath)) {
    New-Item -Path $policyOverridesPath -Force | Out-Null
   }
   
   # Define values for Policy Overrides
   $policyValues = @{
    "882258575"   = 1
    "1230538894"  = 1
    "1398311054"  = 1
    "1633192078"  = 1
   }
   
   # Set the policy values
foreach ($name in $policyValues.Keys) {
    New-ItemProperty -Path $policyOverridesPath -Name $name -Value $policyValues[$name] -PropertyType DWord -Force | Out-Null
}
   ```

4. Install the **Windows App** from Microsoft Store.

   ![WinApp](/.attachments/AAD-Account-Management/2251938/WinApp.jpg)

5. Subscribe normally using the cloud only account that has administrator permissions on AVD VM.

   ![AddAdminAccount](/.attachments/AAD-Account-Management/2251938/AddAdminAccount.jpg)

6. Connect to VM.

   ![ConnectAsAdmin](/.attachments/AAD-Account-Management/2251938/ConnectAsAdmin.jpg)

7. Copy `EnableB2B.ps1` PowerShell script to VM.

   ![Script](/.attachments/AAD-Account-Management/2251938/Script.jpg)

8. Open PowerShell as administrator > change to directory containing `EnableB2B.ps1` and enter following commands:

   ```powershell
   cd <location of EnableB2B.ps1>
   Set-ExecutionPolicy -ExecutionPolicy Unrestricted -Force
   .\EnableB2B.ps1 
   ```

9. Restart the VM.

___

# B2B Sign-in to VM

## WindowsApp for Windows

1. In the **Windows App** click the account picture > **Sign in with another account**

   ![WinAppAccountPick](/.attachments/AAD-Account-Management/2251938/WinAppAccountPick.jpg)

2. Select **Sign-in options**

   ![SI-Options](/.attachments/AAD-Account-Management/2251938/SI-Options.jpg)

3. Select **Sign in to an organization**

   ![SI-Org](/.attachments/AAD-Account-Management/2251938/SI-Org.jpg)

4. Enter the resource tenant name where the VMs are located.

   ![ResOrg](/.attachments/AAD-Account-Management/2251938/ResOrg.jpg)

5. Enter email of external user.

   ![B2BSI](/.attachments/AAD-Account-Management/2251938/B2BSI.jpg)

6. Authenticate
   - When you invite external user the mechanism used to login will be enforced by Entra or chosen by the user.
   - If using password, it's the same password used to login to the corresponding account.
   - For example: If gmail account, enter gmail password, if Microsoft account, enter Microsoft account password, if Entra ID account enter Entra ID account password, etc.
   - This user is configured to receive passcode via email to authenticate.

7. Subscribe was successful.

   ![SubSuccess](/.attachments/AAD-Account-Management/2251938/SubSuccess.jpg)

8. Connect to the VM

   ![B2BConnectVM](/.attachments/AAD-Account-Management/2251938/B2BConnectVM.jpg)

9. Connection was successful

   ![ConnectSuccess](/.attachments/AAD-Account-Management/2251938/ConnectSuccess.jpg)


___

## Web Client

1. Open web browser and go to `https://windows.cloud.microsoft?tenant=YourTenant.onmicrosoft.com`

   ![WebURL](/.attachments/AAD-Account-Management/2251938/WebURL.jpg)

2. Select **Sign-in options**

   ![SI-Options](/.attachments/AAD-Account-Management/2251938/SI-Options.jpg)

3. Enter email of external user

   ![EXTSignIn](/.attachments/AAD-Account-Management/2251938/EXTSignIn.jpg)

4. Authenticate.

5. Subscribe was successful

   ![SuccessWebSubscribe](/.attachments/AAD-Account-Management/2251938/SuccessWebSubscribe.jpg)

6. Click **Connect**

   ![WebConnectVM](/.attachments/AAD-Account-Management/2251938/WebConnectVM.jpg)

7. Connection was successful

   ![InWebVM](/.attachments/AAD-Account-Management/2251938/InWebVM.jpg)

___

## Windows App for MacOS

1. Install the Windows App from the Apps store on the Mac device. (Once Public Preview on MacOS is supported).

2. After download completes copy to Applications.

3. Open Windows App Beta > **Add** > **Add Workspace**.

   ![AddWorkspace](/.attachments/AAD-Account-Management/2251938/AddWorkspace.jpg)

4. Enter feed URL `https://rdweb.wvd.microsoft.com/api/arm/feeddiscovery?aadtenant=tenantname.onmicrosoft.com` > **Add**.

   ![TenantAdd](/.attachments/AAD-Account-Management/2251938/TenantAdd.jpg)

5. Enter the UPN of external user.

   ![UPN](/.attachments/AAD-Account-Management/2251938/UPN.jpg)

6. Authenticate.

7. Subscribe was successful

   ![MacOSSuccess](/.attachments/AAD-Account-Management/2251938/MacOSSuccess.jpg)

8. Click **Connect**

9. Connection was successful

___

# Troubleshooting

If a user is unable to sign in using the Windows App, follow these steps:

**1. Try the Web Client**
 Ask the customer to attempt signing in via the **Web client**, which also captures logs for troubleshooting.

**2. Use the Web Client URL**
 Replace `{resource_tenantid}` in the link below with the actual **resource tenant ID**:

```json
https://windows365.microsoft.com/ent?tenant={resource_tenantid}
```

**Example**:
If the resource tenant ID is 12345678-aaaa-bbbb-cccc-1234567890ab, the URL becomes:
https://windows365.microsoft.com/ent?tenant=12345678-aaaa-bbbb-cccc-1234567890ab

**3. Capture Logs**
 If the connection fails, ask the customer to click **Capture logs** which downloads a `Web Client Logs.txt` file.


