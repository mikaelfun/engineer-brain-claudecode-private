---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure RBAC for Resources/Troubleshooting Adding System Assigned Identities to Azure RBAC Roles"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20RBAC%20for%20Resources%2FTroubleshooting%20Adding%20System%20Assigned%20Identities%20to%20Azure%20RBAC%20Roles"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD-Account-Management
- cw.AAD-Workflow
- cw.Managed-Identities
- Systems Assigned Managed Identity
- Troubleshooting scenarios with VM
- cw.comm-secaccmgt
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   
 

[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD Account Management](/Tags/AAD-Account-Management) [AAD Workflow](/Tags/AAD-Workflow) [Managed-Identities](/Tags/Managed%2DIdentities)  
 


[[_TOC_]]

## Overview

This is the Troubleshooting Workflow for Adding Managed Service Identity (MSI) Enabled VMs to Azure RBAC Roles.

For detailed data collection and troubleshooting steps, see the [Azure AD Adding MSI Enabled VMs to Azure RBAC Roles](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=183934).

### Quick Checklist:

  - Verify the VM Extension was Successfully Installed
  - Verify the MSI Service Principal for the VM was created
  - Verify the�**PrincipalID**�(objectId of the service principal) is added to the the VM object.
  - Verify the VM (its service principal) can be added to RBAC roles.
  - Verify the msi-extension.exe process is running inside of the VM.
  - Verify an access token (authentication) can be requested using Invoke-WebRequest (Windows) or curl (Linux)
  - Verify the access token can be consumed to gain access the resource where the VM (its service principal) has been granted access and has the correct permission to perform the requested task (authorization).

### Does the VM appear in the list of 'Virtual Machines' in the 'Access Control (IAM)' blade?

  - No: Verify the following

<!-- end list -->

1.  The correct Subscription was selected
2.  the correct resource group was selected
3.  the ManagedIdentity extension is installed on the VM
4.  the VM has a SystemAssigned 'identity' property on it
5.  the 'principalID' of the SystemAssigned 'identity property' is populated with the ObjectID of the MSI service principal
6.  the MSI service principal is present in MSODS.

<!-- end list -->

  - Examine the contents of the "Automation script" blade on the VM object to see if 'SystemIdentity' was specified in the deployment template. If the VM deployment failed or the MSI service principal was not automatically created when it was added to the VM, the IaaS POD should file an IcM with Compute PG. If Compute PG determines the MSI service was at fault, the Compute PG has agreed to escalate to the MSI PG.
  - If no MSI was deployed to the VM, try adding a Managed Identity using the UX on the VM properties or with an Automation script.
  - If the MSI service principal exists but the Extension is not on the VM, try adding/re-adding it using PowerShell or CLI.

### Can the VM selected in the 'Access control (IAM)' blade be added to an RBAC role?

  - No: Verify the following:

<!-- end list -->

1.  The person adding the VM to the RBAC role is a role Owner.
2.  the VM can be added to the role using PowerShell or Azure CLI 2.0 instead

<!-- end list -->

  - If the VM is discovered from the "Access control (IAM)" blade but fails to add the VM to the RBAC role, but it can be added to the RBAC role using PowerShell or CLI, then this is an AAD - Account Management issue.
  - If the objectID of the MSI service principal fails to add to the RBAC role using all means, and the user issuing the commands is a role Owner, then an IcM should be filed with the Administration Service (PAS) PG.

### Was the MSI extension deployed to a new or existing VM?

  - **New** **VM**: Did the VM deploy successfully?
      - No: Attempt to redeploy the VM with just the MSI extension.If deployment still fails, deploy with the MSI extension and determine if the extension can be installed from the Azure VM Properties UX
      - Yes: Did the MSI Extension install successfully?
          - No: Examine the Deployment logs from the "Automation script" blade on the VM object, attempt to add the MSI Extension using the Azure VM Properties UX
          - Yes: Examine the MSI VM Extension Logs and verify the VM has the same certificate as the MSI service principal.
  - **Existing VM**: Was the extension added using a Automation script or from the Azure VM Properties UX?
      - Automation Script:
          - Examine the Deployment logs, attempt to add the MSI Extension using the Azure VM Properties UX
      - Azure VM Properties UX:
          - Examine the Activity logs of the VM

### Was the VM added to an RBAC role as part of the deployment?

  - Yes: The IaaS POD should verify the following:
      - the SystemAssigned 'identity' property was added to the VM object.
      - the VM was added to the RBAC role.
      - the RN\_%VMName% service principal exists.
          - If the SystemAssigned 'identity' property was added to the VM object, but the service principal does not exist then IaaS POD should collaborate with the AAD - Account Management team or file an IcM with the Compute PG.
      - the VM can obtain an Access Token. If this fails, engage AAD - Authentication
      - the VM can obtain and access token and perform a GET web request against the Azure Resource, using the access token against the resource where the VM has RBAC role membership. If this fails, engage the support team that owns the resource being accessed.
  - No: If the VM deployed and the MSI Extension is installed, verify the VM can be added to an RBAC role in Azure from the "Access control (IAM)" blade or from PowerShell or Azure CLI.

### Was the VM Extension successfully Installed?

  - No: Examine the Activity log of the VM. Can it be installed using an alternative method like an Automation script, from the Properties blade of the VM? If the MSI service principal exists, re-add the extension using PowerShell.
  - Yes: Was the MSI Service Principal (RN\_%VMNAME%) for the VM created?
      - No: File an IcM against Azure Compute. The Compute PG has agreed to transfer to MSI PG if needed.

### Is the VM using the correct ApplicationID according to the MSI VM Extension Logs?

  - No: File an IcM against Azure Compute if the ApplicationID of MSI service principal in the MSI VM Extension logs does not match the AppId of the RN\_%VMName% object in AAD. The Compute PG will transfer to MSI PG if needed.
  - Yes: Verify the Managed Identity certificate in the VM has the same thumbprint as the certificate on the MSI service principal credential.
      - If the certificate thumbprint is not correct, engage AAD - Account Management

### Is the VM using the correct certificate according to the MSI VM Extension Logs?

  - No: Determine if the VM or the service principal credential has the newer version of the certificate.
      - Remove and re-add the MSI Extension to see if this corrects the issue.
          - If the certificate thumbprint is not correct, engage AAD - Account Management
              - Alternatively, file an IcM with Azure Compute to determine why the certificates are not in sync on the VM and on the service principal.

### Does the Client Authentication Certificate issued by Managed Identity match on the VM and the MSI service principal credential?

  - No: Determine if the VM or the service principal credential has a different version of the certificate.
      - Remove and re-add the MSI Extension to see if this corrects the issue.
          - Alternatively, file an IcM with Azure Compute to determine why the certificates are not in sync on the VM and on the service principal.
  - Yes: Verify the following...
      - the Managed Identity extension is installed
      - the VM has been added to an RBAC role in Azure.
      - the VM can authenticate and obtain an access token using a GET web request from within the VM. Contact the AAD - Authentication team if this fails.
      - Verify the VM can use the access token and perform a GET request against the resource in Azure that the VM has RBAC role membership. If this fails, engage the support team that owns the resource being accessed.

### Is the MSI Extension is Running on the VM?

  - No: Verify the MSI extension is installed.
      - Reboot the VM
          - Log on the VM and determine if the process is running.
      - Remove and Re-add the MSI Extension.
      - File an IcM against Azure Compute if the msi-extension.exe fails to run.
  - Yes: Verify the web request is being sent to the correct port specified when the extension was configured.
      - Use Get-AzureRmVMExtension to see this.

### Is the VM (MSI service principal) added to the correct RBAC role, correct scope (Subscription, Resource Group or Resource) in Azure?

  - No: Have a role Owner add the VM to the correct Azure role from the "Access control (IAM) blade, PowerShell or Azure CLI.
  - Yes: Verify the MSI is actually in the role using Get-AzureRmADServicePrincipal -SearchString RN\_\<VMName\>

### Can the MSI Extension get an Access Token (Authentication)?

  - No: Verify the following:

<!-- end list -->

1.  the ObjectID is populated on the principalId attribute of the SystemAssigned identity property on the VM object in Azure.
2.  the VM is added to the 'Access control (IAM)' blade of the desired resource in Azure.
3.  the MSI is listed as a member of the RBAC role from PowerShell or Azure CLI 2.0
    1.  If all of these are correct and you cannot obtain an access token from AAD, engage AAD - Authentication

<!-- end list -->

  - Yes: Engage the support team for the Azure resource being accessed and verify the following...
      - the VM is authorized to use the resource where it has RBAC membership
          - try consuming the requested access token by issuing a GET web request from the VM.
      - If the service has its own resource provider outside of ARM, like Key Vault does for objects within the vault, add the VM to the Permissions of the resource

### Can the VM can consume the access token and can access the resource it has RBAC membership (Authorization)?

  - No: Verify the role that the VM is a member if has the correct level of RBAC permissions.
      - Engage the Support Team that owns the Azure Resource being accessed. That team is responsible for knowing what RBAC permissions are required to access their service.
