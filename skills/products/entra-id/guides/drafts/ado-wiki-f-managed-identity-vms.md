---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure RBAC for Resources/System-Assigned Managed Identity Integration with VMs"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20RBAC%20for%20Resources%2FSystem-Assigned%20Managed%20Identity%20Integration%20with%20VMs"
importDate: "2026-04-06"
type: troubleshooting-guide
note: "Full content is 105463 chars. This draft contains the first 30000 chars. See sourceUrl for complete content."
---

---
Tags:
- cw.AAD
- cw.AAD-Account-Management
- cw.AAD-Workflow
- cw.Managed-Identities
- cw.Acct-Support-boundaries
- cw.comm-objprinmgt
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::

[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Account-Management](/Tags/AAD%2DAccount%2DManagement) [AAD-Workflow](/Tags/AAD%2DWorkflow) [Managed-Identities](/Tags/Managed%2DIdentities)   
 


[[_TOC_]]

# Feature Overview

## List of Services that Support MSI

Here is an up-to-date list of Azure services that support the use of Managed service Identities.

[Which Azure services support Managed Service Identity?](https://docs.microsoft.com/en-us/azure/active-directory/msi-overview#which-azure-services-support-managed-service-identity)

## Support Boundaries

The Support Boundaries below use Virtual Machines as an example because Compute Resource Provider (CRP) was the first RP to integrate Managed Service Identities into their service.

**IMPORTANT**: As more Azure Resource Providers integrate Managed Service Identities into their feature, these boundaries can be applied to those feature teams. The reason ownership of many of the Scenarios below start with the feature team and not Cloud Identity, is because each resource provider must change their code to work with Managed Service Identity service.

<table>
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<thead>
<tr class="header">
<th>Scenario</th>
<th>Supported By</th>
<th>PG Escalation</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td style="vertical-align:top">RDP or SSH fail after adding the IMDS plug-in</td>
<td style="vertical-align:top">IaaS Connect Vertical </td>
<td style="vertical-align:top">IcM to Compute PG (Compute will transfer to Managed Identity Service PG if needed)</td>
</tr>
<tr class="even">
<td style="vertical-align:top">Deployment of a new VM with SystemAssignedMSI fails</td>
<td style="vertical-align:top">[MSaaS POD Azure IaaS Core TKE](https://msaas.support.microsoft.com/queue/a4be322d-b139-e711-8125-002dd8151754) </td>
<td style="vertical-align:top">IcM to Compute PG (Compute will transfer to Managed Identity Service PG if needed)</td>
</tr>
<tr class="odd">
<td style="vertical-align:top">Minimum default RBAC role membership required for MSI to perform operation X in Azure Storage?</td>
<td style="vertical-align:top">Incubation team - The target Storage resource provider</td>
<td style="vertical-align:top">IcM to Storage PG (Storage will transfer to Managed Identity Service PG if needed)</td>
</tr>
<tr class="even">
<td style="vertical-align:top">Questions about requirements/configuration of custom RBAC roles</td>
<td style="vertical-align:top">Support Team for the target resource provider being accessed</td>
<td style="vertical-align:top">PG for the Azure feature being accessed(example: IcM to Compute PG - Compute will transfer to Managed Identity Service PG if needed)</td>
</tr>
<tr class="odd">
<td style="vertical-align:top">Questions about adding an MSI service principal to an RBAC role to provide access to Azure Storage</td>
<td style="vertical-align:top">Incubation team - The target Storage resource provider</td>
<td style="vertical-align:top">IcM to StoragePG (Storagewill transfer to Managed Identity Service PG if needed)</td>
</tr>
<tr class="even">
<td style="vertical-align:top">Cant connect to Azure Storage with a valid token using Azure RBAC</td>
<td style="vertical-align:top">Incubation team - The target Storage resource provider</td>
<td style="vertical-align:top">IcM to StoragePG (Storagewill transfer to Managed Identity Service PG if needed)</td>
</tr>
<tr class="odd">
<td style="vertical-align:top">az login --identity or Connect-AzureRmAccount -Identity fails to sign-in with the SystemAssigned account</td>
<td style="vertical-align:top">AAD - Authentication</td>
<td style="vertical-align:top">IcM to Managed Identity Service PG</td>
</tr>
<tr class="even">
<td style="vertical-align:top">A VM does not appear in the Object Picker on the Access Control (IAM) blade</td>
<td style="vertical-align:top">[MSaaS POD Azure IaaS Core TKE](https://msaas.support.microsoft.com/queue/a4be322d-b139-e711-8125-002dd8151754) </td>
<td style="vertical-align:top">IcM to Compute PG (Compute will transfer to MSI if needed)</td>
</tr>
<tr class="odd">
<td style="vertical-align:top">SystemAssigned MSI that is assigned to an RBAC role fails to obtain an Access Token, or the token is not valid.</td>
<td style="vertical-align:top">Determine if other methods work:
<ol>
<li>PoSh, CLI or Curl works, but SDK fails = SDK team</li>
<li>PoSh, CLI or Curl works, and the SDK fails
<ol>
<li>Rule out the Resource Provider (If assigned to a VM and failing, assign to an App Service and test.)</li>
</ol></li>
</ol></td>
<td style="vertical-align:top"><ol>
<li>ICM to SDK Team</li>
<li>IcM to Resource Provider PG and that team will escalate to Managed Identity Service PG if needed.</li>
</ol></td>
</tr>
<tr class="even">
<td style="vertical-align:top">Can't add a service principal to an RBAC role from the Access Control (IAM) blade, but other methods work.</td>
<td style="vertical-align:top">AAD - Account Management</td>
<td style="vertical-align:top">IcM toPolicy Administration Service / Azure RBAC UX</td>
</tr>
<tr class="odd">
<td style="vertical-align:top">Can't add a service principal to an RBAC role from PoSh, CLI or Access Control (IAM)blade</td>
<td style="vertical-align:top">AAD - Account Management</td>
<td style="vertical-align:top">ICM to Policy Administration Service PG</td>
</tr>
<tr class="even">
<td style="vertical-align:top">Certificate Rotation is failing</td>
<td style="vertical-align:top">AAD - Account Management</td>
<td style="vertical-align:top">IcM to Managed Identity PG (they will transfer to Compute PG if needed)</td>
</tr>
<tr class="odd">
<td style="vertical-align:top">Certificate thumbprint on the service principal does not match the thumbprint in the VM properties in ACIS.</td>
<td style="vertical-align:top">[MSaaS POD Azure IaaS Core TKE](https://msaas.support.microsoft.com/queue/a4be322d-b139-e711-8125-002dd8151754)  - The resource provider (CRP) must make this request correctly</td>
<td style="vertical-align:top">IcM to Compute PG (Compute will transfer to MSI if needed)</td>
</tr>
<tr class="even">
<td style="vertical-align:top">SDK is failing to leverage SystemAssigned or UserAssigned MSIs</td>
<td style="vertical-align:top">Support Team for the Resource Provider making the request</td>
<td style="vertical-align:top">PG for the Resource Provider making the request / IcM to Compute PG (Compute will transfer to Managed Identity Service PG if needed)</td>
</tr>
<tr class="odd">
<td style="vertical-align:top">Application Authentication Library</td>
<td style="vertical-align:top">Azure Security</td>
<td style="vertical-align:top">IcM to Azure Security</td>
</tr>
</tbody>
</table>









# Known Issues

## Issue 1: Access Sporadically Failswith Error code 403

Customers testing authorization to resources for the first 30 minutes after creating a Managed Service Identity may encounter a high number of 403 failures.

The reason for this unpredictable behavior is that global cache for the RBAC role is validating against different instances in the cloud that have not been populated yet. Initial replication can take up to 30 minutes globally. However, RBAC updates in the same region take 2 seconds to replicate and 5s for the permissions to replicate globally if RBAC is modified in another region.

### Troubleshooting

The parameter to force creation of a new access\_token from IMDS is "**bypass\_cache=true**". Usage would look like:

```
    curl "http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https%3A%2F%2Fmanagement.azure.com%2F&bypass_cache=true" -H Metadata:true
```

**Note**: It is not recommend to use this parameter except for testing, or if you absolutely must for app layer caching, as there is a performance hit to grab new tokens compared with getting the cached token.

### Solution \#1

If the customer cannot tolerate these failures for the first 30 minutes, have the customer set up RBAC before retrieving/using the token for the first time.

## Issue 2: Unable to Get a Token After Tenant Migration

A customer who migrated the Azure Resource from a Pre-Production tenant to a Production tenant discovers their MSI can no longer get an Access Token. They might also observe that the MSI does not appear under Enterprise Apps in Azure Active Directory like it did in the Pre-Production tenant.

There is a know issue with Tenant Migration where the servicePrincipal that is created in MSODS does not get created by MSI in the new tenant after the migration.

### Solution \#2

This will be fixed by General Availability to occur spontaneously or be trigger manually. At this time the only solution for SystemAssigned Identities is to delete and recreate the Azure Resource that is using the SystemAssigned identity.








# Integration Flow for MSI Extension

![IntegrationFlowForMSIExtensionUpdate](/.attachments/AAD-Account-Management/183934/7363e550-c4eb-e665-1ee9-7b307a8268d0639px-IntegrationFlowForMSIExtensionUpdate.jpg)

1.  A VM Admin requests a Compute Resource Provider (CRP) deployment through Azure Resource Provider (ARM) when they add an MSI to a VM by
    1.  deploying a new VM with a deployment template that includes entries for **identity:type:systemAssigned** and the **Microsoft.ManagedIdentity** virtual machine extension.
    2.  clicking "**Enable**" under "**Managed Service Identity**" on the **Properties** blade of an existing VM.
2.  ARM notifies MSI about resource creation which triggers MSI to create an implicit service principal in AAD (MSODS) giving it a displayName of%VMName%. This service principal is implicit because MSI is not a feature that is directly visible to the customer.
    1.  MSI issues a Client Authentication certificate for the VM with these certificate parameters
        1.  **Subject Name** the full URI to the VM object (CN = /subscriptions/\<subscriptionid\>/resourcegroups/\<resourcegroup\>/providers/Microsoft.Compute/virtualMachines/\<vmname\>)
        2.  **Issuer** Microsoft.ManagedIdentity
3.  MSI returns resource metadata about the service principal back to ARM in a signed URL. This signed URL includes both resource ID and identity ID.
4.  ARM passes this metadata in the signed URL to CRP via a header:
    1.  x-ms-identity-url  The URL to the data plane of MSI for the given resource
    2.  x-ms-identity-principal-id - The object id of the identity resource
    3.  x-ms-client-tenant-id - The tenant id of the resource
5.  CRP loops through ARM, which has the signed URL, to receive the certificate, along with certificate metadata (i.e. when it needs to be refreshed, oid, tenant id, etc)
6.  CRP pushes the certificate to the VM's computer's personal certificate store (certlm.msc) and it installs the MSI Extension (ManagedIdentityExtension) using the metadata.
    1.  It also populates the **principalId** attribute on the VM under the **systemAssigned** **identity** property.
    2.  Once the ManagedIdentityExtension is installed, it runs as a stand-alone web server process called msi-extension.exe.
7.  The Resource Provider that the managed identity is assigned to is responsible for rotating certificates every 46 days. For App Services, the App services RP performs this. In the case of VMs the IMDS service on the Azure host performs this.
    1.  The MSI service cleans up older keys on the Service Principal Credential with each rotation, leaving up to three old certificates.

<!-- end list -->

  - The MSI Extension is responsible for fetching AAD tokens via a Web requests by talking to ESTS using the service principal as the identity and the certificate as the secret.
  - The ARM UX for Access Control (IAM) blade adds the VM to the RBAC role, but ARM is actually adding the%VMName% service principal to the role.

The objectID of server principals are immutable (they never change). The objectId of VMs on the other hand are not immutable (they change when the VM is moved to a new RG/subscription). Since the objectIDs of VMs are not immutable, they cannot be used to reliably assign RBAC roles in PAS. When RBAC role assignment takes place, it pulls the service principal objectID from the VM in ARM and commits the membership to PAS. RBAC role assignments remain up-to-date in PAS as VMs are moved to between subscriptions and resource groups because it uses the service principal objectID placed on the VM.ObjectID changes for VMS when they are moved, but the ObjectID for service principals are immutable (never change)

  - Deleting a VM that has the MSI extension installed causes the MSI backed service principal to get deleted as well. When this happens, membership in all Azure RBAC roles is also deleted.

## Authentication and Authentication Flow

The VM gains access to the customer's resources once the objectID of the service principal stored on the Identity property of the VM has been added to the role.

### Authentication

The MSI Extension issues an invoke-webrequest message that authenticates with Azure Active Directory to obtain a security token.

  - The MSI Extension uses the ApplicationID as its identity and the certificate as the password when it authenticates against the customer's Azure AD tenant.
  - ESTS issues the access token to the MSI Extension.

### Authorization

Once the MSI Extension has a security token, an Invoke-WebReqest call is sent to request an access token for management plane access to the resource where the VM has been assigned RBAC membership. In the same way, the MSI Extension uses the security token to request access the data plane where the VM has been assigned permission by that feature's resource provider.

Any data that is passed in calls will be encrypted with the private key.

A great example of an Azure feature that has both management and data plane access, is Key Vault. The Key Vault Access Policy is defined in ARM (management plane) and data plane permissions to keys and secrets (objects stored in the vault) are managed by Key Vault Resource Provider.

For a detailed explanation see [Secure your key vault](https://docs.microsoft.com/en-us/azure/key-vault/key-vault-secure-your-key-vault#management-plane-access-control).








# How To Configure and Manage
The MSI Extension can be deployed to new and existing Windows and Linux VMs running in Azure using the new UI option, a VM Deployment Template or AzureRM PowerShell cmdlets.

## Create MSI Enabled VMs

### Using PowerShell

AzureRM PowerShell Module version 4.3.1 introduces support for Managed Service Identities with an update to New-AzureRmVMConfig which has a new parameter called -IdentityType {SystemAssigned}.

### Using Azure CLI 2.

Pass the --assign-identity switch with the command:

```
    az vm create --resource-group <ResourceGroup> --location westus --name <VMName> --size Basic_A2 --admin-username <AdminAccount> --image UbuntuLTS --storage-account <StorageAccountName> --storage-container-name vhds --use-unmanaged-disk --image UbuntuLTS --generate-ssh-keys --assign-identity
```

## Deployment Template

This section also covers defining a systemAssigned identity to be created in MSI using an ARM based VM deployment template. It also covers how to add the MSI Extension and how to assign the MSI service principal to an Azure RBAC role.using a deployment template.

### MSI Samples on GitHub

<https://github.com/rashidqureshi/MSI-Samples>

### Deploy the MSI extension to new Windows or Linux VMs using a deployment template

  - Add the [Template Deployment](https://portal.azure.com/#create/Microsoft.Template) blade
  - Click "**Create a Linux virtual machine**" or "**Create a Windows virtual machine**" link
  - Fill in all of the required field like, new or existing **Resource Group, Admin username** and **password** and **dns label prefix** and select the desired **OS version**
  - Click **Edit template**
  - Locate **"type": "Microsoft.Compute/virtualMachines",**

<!-- end list -->

``` 
            "type": "Microsoft.Compute/virtualMachines",
            "name": "[variables('vmName')]",
            "location": "[resourceGroup().location]",
            "dependsOn": [
```

  - Add a systemAssigned Identity to the VM directly between **"location": "\[resourceGroup().location\]",** and **"dependsOn": \[**

<!-- end list -->

``` 
            "type": "Microsoft.Compute/virtualMachines",
            "name": "[variables('vmName')]",
            "location": "[resourceGroup().location]",
            "identity": {
                "type": "systemAssigned"
                },
            "dependsOn": [
```

**IMPORTANT**: Be sure to Save your changes after each edit. This will help with identifying where any invalid changes are made.

  - Next, locate **"storageUri"**. It will look like one of these two examples

<!-- end list -->

``` 
        "diagnosticsProfile": {
          "bootDiagnostics": {
            "enabled": "true",
            "storageUri": "[reference(resourceId('Microsoft.Storage/storageAccounts/', variables('storageAccountName'))).primaryEndpoints.blob]"
          }
        }
      }
    },

-OR-

        "diagnosticsProfile": {
          "bootDiagnostics": {
            "enabled": "true",
            "storageUri": "[reference(resourceId('Microsoft.Storage/storageAccounts/', variables('storageAccountName'))).primaryEndpoints.blob]"
          }
        }
      }
    }
],
```

  - Add the MSI Extension below the left-most closing squiggly brace "}" to enable MSI Extension.
  - Make sure to specify the correct extension to be used
      - Windows = ManagedIdentityExtensionForWindows
      - Linux = ManagedIdentityExtensionForLinux

**IMPORTANT**: Start by adding a comma after the left-most closing squiggly brace "}". In the first of the two examples above, there is a comma directly after the closing squiggly brace as seen just above the -OR-.

``` 
            "storageUri": "[reference(resourceId('Microsoft.Storage/storageAccounts/', variables('storageAccountName'))).primaryEndpoints.blob]"
          }
        }
      }
    },

        {
        "type": "Microsoft.Compute/virtualMachines/extensions",
        "name": "[concat(variables('vmName'),'/ManagedIdentityExtensionForWindows')]",
        "apiVersion": "2015-05-01-preview",
        "location": "[resourceGroup().location]",
        "dependsOn": [
            "[concat('Microsoft.Compute/virtualMachines/', variables('vmName'))]"
        ],
        "properties": {
            "publisher": "Microsoft.ManagedIdentity",
            "type": "ManagedIdentityExtensionForWindows",
            "typeHandlerVersion": "1.0",
            "autoUpgradeMinorVersion": true,
            "settings": {
                "port": 50342
            }
        }
    }

  ],
```

  - At this point you will want to change things in the template like
      - "nicName": "myVMNic",
      - "publicIPAddressName": "myPublicIP",
      - "vmName": "SimpleWinVM"
      - "virtualNetworkName": "MyVNET",
      - "vmSize": "Standard\_A2"
  - Finally, if there are no errors in the template, you will be able to click **Save**.
  - Start the deployment by clicking **Purchase.**

To add the MSI service principal to an Azure RBAC Role after the extension has been installed, see the **Adding the MSI Service Principal to the RBAC Role** section above.

### Deploy the MSI extension to a Windows Virtual Machine Scale Set (VMSS)

The VMSS development team created the [Deploy a Windows scale set with MSI](https://azure.microsoft.com/en-us/resources/templates/201-vmss-msi-windows/) QuickStart template. Simply click the "**Deploy to Azure**" button.

#### Call the template in PowerShell

```
    PS C:\> New-AzureRmResourceGroupDeployment -Name <deployment-name> -ResourceGroupName <resource-group-name> -TemplateUri https://raw.githubusercontent.com/azure/azure-quickstart-templates/master/201-vmss-msi-windows/azuredeploy.json
```

#### Call the template in Azure CLI

```
    azure config mode arm
    azure group deployment create <my-resource-group> <my-deployment-name> --template-uri https://raw.githubusercontent.com/azure/azure-quickstart-templates/master/201-vmss-msi-windows/azuredeploy.json
```

## Using Azure CLI 2.0

[Install Azure CLI 2.0](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) for your desired configuration. This example uses the Bash shell on Windows 10 RS2 command prompt. Make sure bash is using the latest packages by updating the list of packages and fetch them:

  - The sudo commands only apply to Debian family (which includes Ubuntu). These scenarios use Debian commands.

  - Yum is used for Fedora family (RedHat and Centos)

  - Zypper is used for Suse family
    
    ```
        c:\> bash
        sudo apt-get update
        sudo apt-get upgrade
    ```
    
    See [this doc](https://docs.microsoft.com/en-us/cli/azure/) to install Azure CLI 2.0. To install azure CLI 2.0 on Windows 10 from the Bash shell use these commands:
    
    ```
        echo "deb [arch=amd64] https://packages.microsoft.com/repos/azure-cli/ wheezy main" | sudo tee /etc/apt/sources.list.d/azure-cli.list
        sudo apt-key adv --keyserver packages.microsoft.com --recv-keys 417A0893
        sudo apt-get install apt-transport-https
        sudo apt-get update && sudo apt-get install azure-cli
    ```
    
    This [document references](https://docs.microsoft.com/en-us/cli/azure/) all of the CLI commands. Usage examples can be found by typing the command and adding --h at the end.

Login to your tenant:

```
    az login
```

This command will prompt the admin to connect to open a browser and connect to https://aka.ms/devicelogin where they must enter the code to authenticate.
Once the VM administrator is authenticated, make sure the correct subscription is set as the default (if more than one exists):

```
    az account list --all
    az account set --subscription <SubscriptionID>
```









# Troubleshooting

Perform the steps below to verify the VM extension installed, that it is running, that it is able to reqest an access token and that the VM can access the resource that the MSI has been given access to.

**Note:** The [VM extension is being deprecated](https://docs.microsoft.com/en-us/azure/active-directory/managed-identities-azure-resources/how-to-use-vm-token#get-a-token-using-http) in January 2019. Customers that are using the VM extension must configure their applications to call the Infrastructure Metadata Service (IMDS) endpoint instead. Once they have changed their application, they can remove the VM extension.

## Workflow

This section redirects to a [Troubleshooting Workflow](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=184004) for Adding System Assigned Identities to Azure RBAC Roles.

  - Verify the VM Extension was Successfully Installed
  - Verify the MSI Service Principal for the VM was created
  - Verify the **PrincipalID** (objectId of the service principal) is added to the the VM object.
  - Verify the VM (its service principal) can be added to RBAC roles.
  - Verify the msi-extension.exe process is running inside of the VM.
  - Verify an access token (authentication) can be requested using Invoke-WebRequest (Windows) or curl (Linux)
  - Verify the access token can be consumed to gain access the resource where the VM (its service principal) has been granted access and has the correct permission to perform the requested task (authorization).

## Verify the VM Extension was Successfully Installed (being deprecated)

The VM extension for managed service identity is being deprecated. It is being replaced with the IMDS plug-in. Customers should be encouraged to change their code to call the IMDS endpoint to acquire access tokens in preparation.

**Note:** The [VM extension is being deprecated](https://docs.microsoft.com/en-us/azure/active-directory/managed-identities-azure-resources/how-to-use-vm-token#get-a-token-using-http) in January 2019. Customers that are using the VM extension must configure their applications to call the Infrastructure Metadata Service (IMDS) endpoint instead. Once they have changed their application, they can remove the VM extension.

### Windows

![WindowsVMExtension](/.attachments/AAD-Account-Management/183934/1571be88-1fd5-b8d0-b5cd-5d8a76ee6521WindowsVMExtension.jpg)

#### Using PowerShell

Obtain the status of the ManagedIdentity VM Extension for Windows

```
    PS C:\> Get-AzureRmVMExtension -ResourceGroupName '<ResourceGroup>' -VMName <VMName> -Name 'ManagedIdentityExtensionForWindows'
    
    ResourceGroupName       : <ResourceGroup>
    VMName                  : <VMName>
    Name                    : ManagedIdentityExtensionForWindows
    Location                : westus
    Etag                    : null
    Publisher               : Microsoft.ManagedIdentity
    ExtensionType           : ManagedIdentityExtensionForWindows
    TypeHandlerVersion      : 1.0
    Id                      : /subscriptions/<SubscriptionID>/resourceGroups/<ResourceGroup>/providers/Microsoft.Compute/virtualMachines/<VMName>/extensions/ManagedIdentityExtensionForWindows
    PublicSettings          : {
                                "port": 50342
                              }
    ProtectedSettings       :
    ProvisioningState       : Succeeded
    Statuses                :
    SubStatuses             :
    AutoUpgradeMinorVersion : True
    ForceUpdateTag          :
```

### Linux

![LinuxVMExtension](/.attachments/AAD-Account-Management/183934/e05063bd-a78d-b7fb-78f9-d58d499bdfd51186px-LinuxVMExtension.jpg)

#### Using Azure CLI 2.0

Obtain the status of the ManagedIdentity VM Extension for Linux

```
    az login
    az account list --all
    az account set --subscription <SubscriptionID>
    az vm extension list --h
    az vm extension list --resource-group <ResourceGroupName> --vm-name <VMName>
    
    [
      {
        "autoUpgradeMinorVersion": true,
        "forceUpdateTag": null,
        "id": "/subscriptions/<SubscriptionID>/resourceGroups/<ResourceGroupName>/providers/Microsoft.Compute/virtualMachines/<VMName>/extensions/ManagedIdentityExtensionForLinux",
        "instanceView": null,
        "location": "westus",
        "name": "ManagedIdentityExtensionForLinux",
        "protectedSettings": null,
        "provisioningState": "Succeeded",
        "publisher": "Microsoft.ManagedIdentity",
        "resourceGroup": "<ResourceGroupName>",
        "settings": {
          "port": 50342
        },
        "tags": null,
        "type": "Microsoft.Compute/virtualMachines/extensions",
        "typeHandlerVersion": "1.0",
        "virtualMachineExtensionType": "ManagedIdentityExtensionForLinux"
      }
    ]
```

**NOTE**: If the customer is using SystemAssigned service principals for Virtual Machine Scale Sets (VMSS), the powershell commands above will not return the extension states because these are virtualMachineScaleSets objects and the cmdlets do not works against these.

## MSI Extension Download URL

The GoalState.\#\#.xml located under /var/lib/waagent has the URLs that the agent downloads. An example of this URL is located in the \<ExtensionsConfig\> section:

```
    <ExtensionsConfig>http://168.63.129.16:80/machine/27445809-5c87-4494-9c4e-66fe8da78994/9c78c856%2Dc682%2D4a64%2Da41a%2D605464ab8231.%5Fchrboum00?comp=config&amp;type=extensionsConfig&amp;incarnation=11</ExtensionsConfig>
```

## Sign-In As the SystemAssigned MSI

### Using PowerShell

Connect-AzureRmAccount -Identity allows you to sign-in with the SystemAssigned identity on a Windows computer that has the latest AzureRM Module installed.

```
    PS C:\> Connect-AzureRmAccount -Identity
```

### Using Azure CLI

From the Linux VM in Azure, you can sign-in as the SystemAssigned MSI, install the latest Azure CLI 2.0 and run this command:

    az login --identity

The output should look like this:

```
    az login --identity
    [
      {
        "environmentName": "AzureCloud",
        "id": "43e19234-####-####-####-############",
        "isDefault": true,
        "name": "MSI@50342",
        "state": "Enabled",
        "tenantId": "7dd2219b-####-####-####-############",
        "user": {
          "name": "systemAssignedIdentity",
          "type": "servicePrincipal"
        }
      }
    ]
```

## Identify the MSI Service Principal of the VM

This section outlines the naming convention of MSI service principals and provides methods to locate the ObjectID, ApplicationID and Certificate Thumbprint used by the MSI.

If the VM is successfully deployed and the MSI Extension installed, verify the Service Principal was successfully using these steps:

  - Click the "**Access Control (IAM)**" blade of any resource in the same subscription
  - Click **+Add** and select any role
  - Click the drop-down for '**Assign access to**' and select '**Virtual Machine**'
  - Select the correct Subscription
  - Select the Resource Group where the Virtual Machine resides.

The '**Virtual Machine**' option in the '**Access control (IAM)**' performs a query against ARM looking for Virtual Machines that have the '**PrincipalId**' attribute on the '**SystemAssigned**' Identity property populated. If selecting 'Virtual Machine' fails to discover the VM, verify the correct subscription and resource group have been selected. Another method to determine if the service principal was created and that there is not a problem with the '**Access control (IAM)**' blade itself, use the steps above to **+Add** a role member, only this time leave '**Assign access to**' set to '**Azure AD user, group, or application**' and see if the MSI created service principal is discovered in a query against MSODS.

![VMAddedToIAMBlade](/.attachments/AAD-Account-Management/183