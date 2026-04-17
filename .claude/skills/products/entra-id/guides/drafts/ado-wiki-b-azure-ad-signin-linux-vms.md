---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Device Registration/Archived Wikis/Azure AD Sign-in for Azure Linux VMs"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FDevice%20Registration%2FArchived%20Wikis%2FAzure%20AD%20Sign-in%20for%20Azure%20Linux%20VMs"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure AD Sign-in for Azure Linux VMs

# Summary

The Azure Identity Product Group created a Virtual Machine Extension called '**AADLoginForLinux**'?that provides a new way to sign-in to Linux VMs in Azure using Azure AD credentials.

Interactive sign-in to Azure Linux VMs can now be controlled using two new Azure Role-Based Access Control (RBAC) roles called '**Virtual Machine Administrator Login**' and '**Virtual Machine User Login**'. Assigning an Azure AD User to either of these roles makes it possible for Azure AD User accounts to perform interactive login to Azure IaaS Linux virtual machines.

The Primary goal of this feature is to restrict/control interactive login to Linux VMs running in Azure to Azure AD accounts that have been granted access using the new Azure RBAC DataAction permission of '**Microsoft.Compute/virtualMachines/login/action**'. This permission by itself allows Azure AD users to sign-in as a normal user. When this permission is combined with the the '**Microsoft.Compute/virtualMachines/loginAsAdmin/action**' DataAction, the Azure AD user can sign-in as an administrator. It is not a stated goal to use that logged in security context to perform actions against Azure AD and ARM.

# Demo of Successful Azure AD Sign-in to Linux

This demonstrates how Azure AD Sign-in to Linux experience using the device login flow.

![AADSiginToLinux](/.attachments/AAD-Authentication/183983/AADSiginToLinux.gif)

# Beta Engineer

David Everett was the Beta engineer for both Linux and Windows releases of Azure AD Sign-in. If you need assistance while this is in Public Preview, please contact deverett@microsoft.com in email or Teams.

# Local Group Management

In order for Azure AD users to interactively login to the Linux VM, the AADLoginForLinux Extension creates two local groups called Aad\_admins and Aad\_users once Azure AD RBAC role members perform an interactive login:

  - Aad\_admins; sudoers
  - Aad\_users

# Benefits

## Improved security

This approach has many security benefits:

  - You can use your corporate AD credentials to log in to Azure Linux VMs. There is no need to create local administrator accounts and manage credential lifetime.
  - By reducing your reliance on local administrator accounts, you do not need to worry about credential loss/theft, users configuring weak credentials etc.
  - The password complexity and password lifetime policies configured for your Azure AD directory help secure Linux VMs as well.
  - The VM is not susceptible to password brute force attacks on local administrator accounts.
  - You can configure multiple factor authentication or conditional access control policies to further secure log in to Azure virtual machines.

## Seamless collaboration

Using RBAC roles you can specify who has access to a given VM, as a regular user or with administrator privileges. When users join or leave your team, you can easily update the RBAC policy for the VM to grant or deny access as appropriate. This experience is much simpler than having to scrub VMs to remove unnecessary SSH public keys. When employees leave your organization, if their user account is disabled in Azure AD, they no longer have access to your resources.

# Limitations

- The userPrincipalName (UPN) of Azure AD Users must be in all lowercase in order to sign-into the VMs. The user will be repeatedly prompted for their password if uppercase is used anywhere in the UPN. **Example**: username@contoso.onmicrosoft.com@52.###.###.222

- Users that inherit access rights through nested groups or role assignments aren't currently supported. The user or group must be directly assigned the required role assignments. For example, the use of management groups or nested group role assignments won't grant the correct permissions to allow the user to sign in. [Reference](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/login-using-aad#other-limitations)

- LDAP and Azure AD login are not supported concurrently.

# Public Preview Documentation

[Preview: Log in to a Linux virtual machine in Azure using Azure Active Directory authentication](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/login-using-aad#supported-azure-regions-and-linux-distributions)

# Requirements

- At this time customers are advised to enable a System Assigned managed identity on  Azure Linux VMs that are enabled for Azure AD Login. This is not a requirement yet, but the current extension does have some behavioral benefits by having an identity enabled. In the future this will be a requirement.
- The VM's network configuration must permit outbound access to the following endpoints over TCP port 443:

https://login.microsoftonline.com
https://login.windows.net
https://device.login.microsoftonline.com
https://pas.windows.net
https://management.azure.com
https://packages.microsoft.co

# Support Boundaries

The **AADLoginForLinux** VM Extension was built by the Azure Identity product group. This extension is primarily supported by the AAD - Authentication support team. The IaaS VM POD does not support every VM extension VM because the individual support teams have the specialty to support dependencies in the VM extension that their product group made. In the case of AAD Sign-in VM extensions, even during deployment of the extension, this would involve components like Device Registration, Managed Identity and Policy Administration Service (Azure RBAC Role assignment). 

<span style="color:#FF0000">**IMPORTANT**</span>: If assistance is needed from another support team, those teams should be engaged with a collaboration problem.

For more guidance on support boundaries/case management, see the extension specific workflows below.

| Scenario                                                                                                                                                                                           | Supported By             | PG Escalation                           |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | --------------------------------------- |
| SSH fails for the default local administrator account, even after removing the AADLoginForLinux extension.                                                                                                   | IaaS Connect Vertical       | IcM to CRP PG |
| Outbound network traffic from the VM to the Internet is failing.                                                                                                   | Azure Networking POD       |  |
| Problems assigning RBAC Role membership                                                                                                                                                  | AAD - Account Management         | IcM to Policy Administration Service PG |
| Deployment of a new VM with AADLoginForLinux fails                                                                                                                          | AAD - Authentication        | IcM to Cloud Identity AuthN Client/OneAuth-MSAL C++ PG |
| Install/Update/Removal the AADLoginForLinux VM extension to an existing VM fails, but not with other extensions.                                                | AAD - Authentication        | IcM to Cloud Identity AuthN Client/OneAuth-MSAL C++ PG |
| The Azure AD user is not receiving the interactive keyboard prompt directing them to browse to https://microsoft.com/devicelogin and enter the code.                                                                                                                                                            | AAD - Authentication | ICM to Cloud Identity AuthN Client/OneAuth-MSAL C++ PG |
| The AADLoginForLinux Extension installed, but Managed or Federated users assigned to '**Virtual Machine Administrator Login**' or '**Virtual Machine User Login**' Azure RBAC roles fail to login. | AAD - Authentication     | ICM to ESTS PG                          |

# Supported Azure Linux Distributions

The following Linux distributions are supported for this functionality:

| Distribution  | Version                   |
| ------------- | ------------------------- |
| CentOS | CentOS 6, CentOS 7, CentOS 8 |
| Debian | Debian 9, Debian 10 |
| openSUSE | openSUSE Leap 42.3 |
| RedHat Enterprise Linux | RHEL 6, RHEL 7, RHEL 8 |
| SUSE Linux Enterprise Server | SLES 12 |
| Ubuntu Server | Ubuntu 14.04 LTS, Ubuntu Server 16.04, and Ubuntu Server 18.04, Ubuntu Server 20.04 |

# Limitations

- The userPrincipalName (UPN) of Azure AD Users must be in all lowercase in order to sign-into the VMs. The user will be repeatedly prompted for their password if uppercase is used anywhere in the UPN. **Example**: username@contoso.onmicrosoft.com@52.###.###.222

- Users that inherit access rights through nested groups or role assignments aren't currently supported. The user or group must be directly assigned the required role assignments. For example, the use of management groups or nested group role assignments won't grant the correct permissions to allow the user to sign in. [Reference](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/login-using-aad#other-limitations)

- LDAP and Azure AD login are not supported concurrently.

# Public Preview Documentation

[Preview: Log in to a Linux virtual machine in Azure using Azure Active Directory authentication](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/login-using-aad#supported-azure-regions-and-linux-distributions)

# Known Issues/Errors

## Issue 0: E-mail Login Triggers Password Prompt Instead of a ChallengeResponseAuthentication for Device Login

The new extension, package version aadlogin-1.0.012830001-1.x86_64.rpm was released on July 6, 2020 which has a dependency that is not satisfied in RHEL 7.6.

### Soluiton 0: E-mail Login Triggers Password Prompt Instead of a ChallengeResponseAuthentication for Device Login

An updated package, version aadlogin-1.0.012920001-1.x86_64.rpm, was released on July 16, 2020 which addresses this issue.

**NOTE**: The latest package builds can be found by visiting [Index of /rhel/7/prod/](http://packages.microsoft.com/rhel/7/prod/).

## Issue 1: Access Denied

Managed or Federated users go through the entire login sequence only to get an '**Access denied**' error message.

```
    username@computerx64:~$ ssh winfed@contoso.com@13.##.###.109
    To sign in, use a web browser to open the page https://microsoft.com/devicelogin and enter the code FFQGKNFTF to authenticate. Press ENTER when ready.
    
    Access denied:  to sign-in you be assigned a role with action 'Microsoft.Compute/virtualMachines/login/action', for example 'Virtual Machine User Login'
    
    To sign in, use a web browser to open the page https://microsoft.com/devicelogin and enter the code FTZR5CBR4 to authenticate. Press ENTER when ready.
```

**Root Cause**: The message returned states the user performing the interactive login must be assigned to an RBAC role that contains the '**Microsoft.Compute/virtualMachines/login/action**' DataAction.

### Solution 1: Access Denied
Add the user to the built-in **Virtual Machine Administrator Login** or **Virtual Machine User Login** RBAC roles. If needed, the customer can create a Custom RBAC role containing the RBAC '**Microsoft.Compute/virtualMachines/login/action**' DataAction.

## Issue 2: Permission denied

The pam\_aad.so module is not sending callbacks to the client to perform the devicelogin.

```
Feb  6 10:04:09 VMNAME sshd[54911]: pam_aad(sshd:auth): HttpResponse 200: {"user_code":"C45FGVYJR","device_code":"CAQABAAEAAABeAFzDwllzTYGDLh_qYbH8uzh0ivGv5BFX8U1R8ZLSWjQSbuB9JQzKSMsSoO7p7fqNKvOeSH1aAXuKCKRcE92cmDSDY2xuOM6qI-uK2fht3XX6buJBIgTFgZQ3cQVz_gjqsiGIZiHdwt__bJnynjI2ktruQsVIQVUYO9TNh3ATrxoHSQrwwkg0Ozurb32lZMIgAA","verification_url":"https://microsoft.com/devicelogin","expires_in":"900","interval":"5","message":"To sign in, use a web browser to open the page https://microsoft.com/devicelogin and enter the code C45FGVYJR to authenticate."}
Feb  6 10:04:09 VMNAME sshd[54911]: pam_aad(sshd:auth): Message:To sign in, use a web browser to open the page https://microsoft.com/devicelogin and enter the code C45FGVYJR to authenticate.#012DeviceCode:CAQABAAEAAABeAFzDwllzTYGDLh_qYbH8uzh0ivGv5BFX8U1R8ZLSWjQSbuB9JQzKSMsSoO7p7fqNKvOeSH1aAXuKCKRcE92cmDSDY2xuOM6qI-uK2fht3XX6buJBIgTFgZQ3cQVz_gjqsiGIZiHdwt__bJnynjI2ktruQsVIQVUYO9TNh3ATrxoHSQrwwkg0Ozurb32lZMIgAA#012ExpiresIn:900#012Interval:5
Feb  6 10:04:09 VMNAME sshd[54911]: pam_aad(sshd:auth): Failed to call back client. Make sure ChallengeResponseAuthentication in /etc/ssh/sshd_config is set to 'yes'.
```

Examine the **/etc/ssh/sshd\_config** file and it shows "**ChallengeResponseAuthentication no**" is set. This should be set to **yes**.

Here is a demo of what the failing sign-in looks like. Compare it with the [Demo of Successful Azure AD Sign-in to Linux](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageID=183983&anchor=demo-of-successful-azure-ad-sign-in-to-linux).

![PasswordReset](/.attachments/AAD-Authentication/183983/PasswordReset.gif)

**Root Cause**: If **ChallengeResponseAuthentication** is set to '**no**' it will prevent the pam\_aad.so module from sending callbacks to the client. The extension install script is responsible for setting this to '**yes**', but actions like **Password reset** tend to revert the value back to **no**.

### Solution 2: Permission denied

Edit the **/etc/ssh/sshd\_config** file by setting **ChallengeResponseAuthentication** back to **yes**.

**Important**: Whenever a change is made to the **sshd\_config** file, the sshd service must be restarted to see its effects. This can be done by running **service sshd restart**. An alternative to editing the file is to remove and reinstall the VM extension. The enable script is responsible for setting the config files and restarting sshd, etc.

The PG is ware of this and has determined that covering this with documentation is sufficient. If a customer thinks otherwise, file and ICM.

## Issue 3: Repeated Code Prompts

After entering the code on the devicelogin page the browser may advance to another devicelogin page asking for the code again. 

**Root Cause**: This can happen if the browser has cached Azure AD credentials and those cached Azure AD credentials are different from the ones entered in Bash shell.

### Solution 3: Repeated Code Prompts

The workaround is to use an InPrivate or InCognito browser. Typos in the UPN will also produce this effect.

## Issue 4: Connection Timed Out

Performing tasks which require elevation, like service restarts can fail with an error of **Connection timed out**.

By default the aad\_pam module configures aad\_admins to require a login when they try to run elevated. This is considered more secure, and is the default for RHEL. By design the AADLoginForLinux extension follows the same rule everywhere. Unfortunately the device flow process is not very fast and can generate timeouts like the one shown here:

```
    andy@contoso.com@<computername>:~$ service sshd restart
    ==== AUTHENTICATING FOR org.freedesktop.systemd1.manage-units ===
    Authentication is required to restart 'ssh.service'.
    Multiple identities can be used for authentication:
    1.  Ubuntu (localadmin)
    2.  Adam Stanfield (andy@contoso.com)
    Choose identity to authenticate as (1-2): 2
    Info: To sign in, use a web browser to open the page https://microsoft.com/devicelogin and enter the code F5HQKEWED to authenticate.
    Failed to restart sshd.service: Connection timed out
    See system logs and 'systemctl status sshd.service' for details.
    andy@contoso.com@<computername>:~$ service sshd restart
    ==== AUTHENTICATING FOR org.freedesktop.systemd1.manage-units ===
    Authentication is required to restart 'ssh.service'.
    Multiple identities can be used for authentication:
    1.  Ubuntu (localadmin)
    2.  Adam Stanfield (andy@contoso.com)
    Choose identity to authenticate as (1-2): 1
    Password:
    ==== AUTHENTICATION COMPLETE ===
    andy@contoso.com@<computername>:~$
```

### Solution 4: Connection Timed Out

There are several options:

1.  Try again. Elevation does require a login but Linux caches it for 5 minutes if the command is called using sudo (ie: **sudo service sshd restart**). Once it's cached for sudo, the user can run several elevated commands with only one login. Caching of devicelogin credentials so the AAD user can call **service sshd restart** instead of **sudo service sshd restart**) will likely be added in the future.
    1.  It helps to have an InPrivate web browser already connected to https://microsoft.com/devicelogin, then all the user has to do is enter the code.
2.  Run **sudo -i**. This will prompt the user to perform the device flow, but after that they are switches to a root shell and can do anything without more prompts to authenticate.
3.  Least desirable. Turn off the requirement for sudo to authenticate. Open **/etc/sudoers.d/aad\_admins** and change the file content to look like this:

<!-- end list -->

```
    %aad_admins ALL=(ALL) NOPASSWD:ALL
```

## Issue 5: Continuous Password Prompts

The entire UPN of Azure AD Users must be in all lowercase in order to sign-into the VMs.? The user is repeatedly prompted for their password if uppercase is used anywhere in the UPN.

**Correct**: username@contoso.com@52.###.###.222

**Incorrect**: username@Contoso.com@52.###.###.222

```
    username@COMPUTERNAMR:~$ ssh username@Contoso.com@13.##.###.190
    Password:
    Password:
    
    username@COMPUTERNAMR:~$ ssh username@Contoso.com@13.##.###.190
    Password:
    Password:
    
    username@COMPUTERNAMR:~$ ssh username@contoso.com@13.##.###.190
    To sign in, use a web browser to open the page https://microsoft.com/devicelogin and enter the code FYSA25CH9 to authenticate. Press ENTER when ready.
    Welcome to Ubuntu 16.04.3 LTS (GNU/Linux 4.13.0-1011-azure x86_64)
    
     * Documentation:  https://help.ubuntu.com
     * Management:     https://landscape.canonical.com
     * Support:        https://ubuntu.com/advantage
    
      Get cloud support with Ubuntu Advantage Cloud Guest:
        http://www.ubuntu.com/business/services/cloud
    
    50 packages can be updated.
    0 updates are security updates.
    
    
    Last login: Mon Apr  2 14:46:26 2018 from 47.###.###.80
    andy@contoso.com@deUbAAD:~$
```

## Issue 6: SSH doesn't present the device login url for VMs in Central India

Customers following the [public document](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/login-using-aad) to create and deploy a Linux VM in Central India find login to azure vm using Azure AD credentials fail to get the device login option.

Turning on debug level logging for auth.log on distros that are not Redhat shows the location as "Indiacentral", but the failure seen in the auth.log shows the extension is looking for "Centralindia".  Provisioning the same VM in a different location allows Azure AD Sign-in to work.

**Snippet from Authlog**:

```
Feb  4 04:06:43 MyVM sshd[62550]: pam_aad(sshd:auth): Location:CentralIndia#012SubscriptionId:62540353####-####-####-############*ResourceGroup:TestRG#012ScaleSet:#012Name:SomeVM#012Type:Linux Canonical UbuntuServer 18.04-LTS
Feb  4 04:06:43 MyVM sshd[62550]: pam_aad(sshd:auth): Calling https://management.azure.com/metadata/endpoints?api-version=2017-12-01
Feb  4 04:06:44 MyVM sshd[62550]: pam_aad(sshd:auth): HttpResponse 200: {"galleryEndpoint":"https://gallery.azure.com/","graphEndpoint":"https://graph.windows.net/","portalEndpoint":"https://portal.azure.com/","graphAudience":"https://graph.windows.net/","authentication":{"loginEndpoint":"https://login.windows.net/","audiences":["https://management.core.windows.net/","https://management.azure.com/"],"tenant":"common","identityProvider":"AAD"},"cloudEndpoint":{"public":{"endpoint":"management.azure.com","locations":["westus","westus2","eastus","centralus","centraluseuap","southcentralus","northcentralus","westcentralus","eastus2","eastus2euap","brazilsouth","brazilus","northeurope","westeurope","eastasia","southeastasia","japanwest","japaneast","koreacentral","koreasouth","indiasouth","indiawest","indiacentral","australiaeast","australiasoutheast","canadacentral","canadaeast","uknorth","uksouth2","uksouth","ukwest","francecentral","francesouth","australiacentral","australiacentral2","uaecentral","uaenorth","southafricanorth","southafricawest","switzerlandnorth","switzerlandwest","germanynorth","germanywestcentral","norwayeast","norwaywest"]},"chinaCloud":{"endpoint":"management.chinacloudapi.cn","locations":["chinaeast","chinanorth","chinanorth2","chinaeast2"]},"usGovCloud":{"endpoint":"management.usgovcloudapi.net","locations":["usgovvirginia","usgoviowa","usdodeast","usdodcentral","usgovtexas","usgovarizona"]},"germanCloud":{"endpoint":"management.microsoftazure.de","locations":["germanycentral","germanynortheast"]}}}
Feb  4 04:06:44 MyVM sshd[62550]: pam_aad(sshd:auth): Cannot find the cloud instance for location CentralIndia
Feb  4 04:06:44 MyVM sshd[62550]: pam_aad(sshd:auth): pam_sm_authenticate returned 131074
```

### Solution 6: SSH doesn't present the device login url for VMs in Central India

This issue is being tracked in [ICM 173695435](https://portal.microsofticm.com/imp/v3/incidents/details/173695435/home)

## Issue 7: Permission denied (publickey,gssapi-keyex,gssapi-with-mic,keyboard-interactive)

Enabling the SystemAssigned Identity on Redhat VMs running the AADLoginForLinux VM extension causes SSH sign in using Azure AD accounts to fail with *Permission denied (publickey,gssapi-keyex,gssapi-with-mic,keyboard-interactive).*  This problem does not happen on other Linux distros like Ubuntu, and it may also occur if the managed identity is UserAssigned.

Azure AD Sign-in with Debug logging enabled in /etc/pam.d/system-auth-aad shows the call to PAS endpoint to lookup RBAC role membership is failing.

```
Jul 22 22:38:14 <computername> polkitd[1012]: Unregistered Authentication Agent for unix-process:10641:160125 (system bus name :1.30, object path /org/freedesktop/PolicyKit1/AuthenticationAgent, locale en_US.UTF-8) (disconnected from bus)
Jul 22 22:39:00 <computername> sshd[10664]: nss_aad: CURL: Failed to call https://pas.windows.net/AadLogin/username%40contoso.onmicrosoft.com?api-version=2018-01-01 (35). A PKCS #11 module returned CKR_DEVICE_ERROR, indicating that a problem has occurred with the token or slot.
Jul 22 22:39:00 <computername> sshd[10664]: pam_aad(sshd:auth): AadAuthenticate, Version: 1.0.012920001; CorrelationId: 4c97048a-bed7-412e-abd7-7244df098fa5
Jul 22 22:39:00 <computername> sshd[10664]: pam_aad(sshd:auth): CURL: Failed to call https://management.azure.com/subscriptions/43e19234-####-####-####-############/resourceGroups/deRG/providers/Microsoft.Compute/virtualMachines/<computername>?api-version=2017-05-01 (35). A PKCS #11 module returned CKR_DEVICE_ERROR, indicating that a problem has occurred with the token or slot.
Jul 22 22:39:02 <computername> sshd[10661]: error: PAM: System error for username@contoso.onmicrosoft.com from 47.###.###.154
Jul 22 22:39:02 <computername> sshd[10661]: Connection closed by 47.###.###.154 port 57152 [preauth]
[root@<computername> log]#
```

### Solution 7: Permission denied (publickey,gssapi-keyex,gssapi-with-mic,keyboard-interactive)

This issue was worked in [ICM 197765012](https://portal.microsofticm.com/imp/v3/incidents/details/197765012/home) and [ICM 195825905](https://portal.microsofticm.com/imp/v3/incidents/details/195825905/home).

A fix was deployed on Jult 23, 2020 in version 1.0.013000 is published at [Index of /rhel/7/prod/](http://packages.microsoft.com/rhel/7/prod/). No special steps to get the latest build are needed. The extension always picks up the newest packages.

**NOTE**: There is an extension version and there is package version. The extension version has not changed for awhile and the version looks old but it always installs the newest packages.

## Issue 8: SSH Fails with "User account has expired for illegal user"

Linux VMs with a User Assigned Managed Identity assigned prevents Azure AD Sign-in of Member accounts. Also, System and/or User Assigned Managed Identities assigned to the VM prevent Azure AD Sign-in of Guest accounts.

Examination of debug auth logs shows the user gets an access token from Azure AD, but PAM returns an Error saying, "*User account has expired for illegal user \<name>*" as shown here:

```
Oct  1 09:19:42 loan-optics-dev-msTest6 sshd[5701]: pam_aad(sshd:auth): AccessToken:eyJ0eXAiOi...
Oct  1 09:19:42 loan-optics-dev-msTest6 sshd[5701]: pam_aad(sshd:auth): Access token header: {"typ":"JWT","alg":"RS256","x5t":"kg2LYs2T0CTjIfj4rt6JIynen38","kid":"kg2LYs2T0CTjIfj4rt6JIynen38"}
Oct  1 09:19:42 loan-optics-dev-msTest6 sshd[5701]: pam_aad(sshd:auth): Access token body: {"aud":"https://pas.windows.net/CheckMyAccess/Linux","iss":"https://sts.windows.net/8981001d-####-####-####-############/","iat":1601543681,"nbf":1601543681,"exp":1601547581,"acr":"1","aio":"AYQAe/8RAAAAzVrcYl8Dfn/L7J9NnNTlsIzFYPfab2Jcwab33JEeV8Rg2EnOSuP8WuTxphgbWeMEJEcREJwclW/iwzSvSxZx88XgBFUQA0pQCtB61FjgS8ejudD6S+W8OvUKzU3gprSESxDzwy+rLlbCF51pAlWpTmDp14HA1O6ajqeGANddhWA=","altsecid":"5::10030############","amr":["pwd","mfa"],"appid":"756bccdc-####-####-####-############","appidacr":"0","email":"username@contoso.com","family_name":"tester","given_name":"test","groups":["f407e98e-####-####-####-############","b113c346-####-####-####-############","f5949fa3-####-####-####-############","dfce05cd-####-####-####-############"],"idp":"https://sts.windows.net/587b6ea1-####-####-####-############/","ipaddr":"13.##.##.52","name":"Tester, Test","oid":"f00eca7b-####-####-####-############","puid":"1003############","rh":"0.ASEAHQCBiR5WPkqwV9KSpEf_PtzMa3UeHFZFt6T-bq_mHTUhADA.","scp":"user_impersonation","sub":"6AiY4_P6BdYjMgjn5g7rKF_BiOLbLpu7oQIx6cVoQ34","tid":"001d8981-####-####-####-############,"unique_name":"username@contoso.com","uti":"w758A1OGLEaWZo-wpJnUAA","ver":"1.0"}
Oct  1 09:19:42 loan-optics-dev-msTest6 sshd[5701]: pam_aad(sshd:auth): pam_sm_authenticate returned 0
Oct  1 09:19:42 loan-optics-dev-msTest6 sshd[5701]: pam_aad(sshd:account): AadAuthorize, Version: 1.0.013390001; CorrelationId: a7d1cff1-f463-4629-ae28-b9b1e14f6ad6
Oct  1 09:19:42 loan-optics-dev-msTest6 sshd[5701]: pam_aad(sshd:account): Login granted for username@contoso.com as an admin.
Oct  1 09:19:42 loan-optics-dev-msTest6 sshd[5692]: error: PAM: User account has expired for illegal user username@contoso.com from 85.###.##.188
Oct  1 09:19:42 loan-optics-dev-msTest6 sshd[5692]: Failed keyboard-interactive/pam for invalid user username@contoso.com from 85.###.##.188 port 33568 ssh2
Oct  1 09:19:42 loan-optics-dev-msTest6 sshd[5692]: fatal: monitor_read: unpermitted request 104
Oct  1 09:20:01 loan-optics-dev-msTest6 CRON[5736]: pam_aad(cron:setcred): pam_sm_setcred was called for user root with flags 32770
Oct  1 09:20:01 loan-optics-dev-msTest6 CRON[5737]: pam_aad(cron:setcred): pam_sm_setcred was called for user root with flags 32770
Oct  1 09:20:01 loan-optics-dev-msTest6 CRON[5737]: pam_aad(cron:setcred): pam_sm_setcred returned 25
```

**Root Cause**: This is due to a known bug in service.  The PG is moving to a solution where all VMs with Azure AD integration will require a system managed identity.

When the user tries to connect, the first thing SSHD does is check if the user exists. With the new functionality, PAS calls Graph using the System Assigned managed identity. This call is returning "not found". This doesn't work for Guest users because the graph call only checks for account existence by UPN, not email.

Even if the user is invalid, SSHD will call the authentication and authorization modules. This code path checks both the UPN and email and succeeds. However the user is already invalid according to the first call. At this point SSHD starts trying other login options and either one of them returns the error message seen in the logs, or it is produced by the SSHD process itself.

Removing the System Assigned and User Assigned managed identity allows Guests to sign-in. This happens because the login part falls back to the old behavior where no Graph call is made by PAS and "lies" that the user exists without checking Azure AD. However, this will cause problems when calling sudo. The first call will succeed, but the next will fail if done within 5 minutes.

The bottom line is, if username@contoso.com is not a Guest it should work as expected, so long as a System Assigned managed identity is enabled. Having just a User Assigned managed identity triggers this code path for Member accounts and fails with this error when there is no System Assigned managed identity.

On October 7, 2020 the PG made the required changes for the service to support email sign-ins the same way as UPNs when checking for user existence. The fix will take 1-2 weeks to deploy. Once deployed, Azure AD Login will be broken for Guest accounts only, and only on the very first login. After that Guest user are registered in /etc/aadpasswd file and sign-in is served from there.

**NOTE**: The first time login can be made to work for Guest users by using *aaduseradd* to add their account to the aadpasswd list as shown below:

```
cd /etc
aaduseradd --comment username-guest --oid bd4802f0-####-####-####-############ username@microsoftsupport.com
cat aadpasswd
username@microsoft.com:91b27a97-####-####-####-############:7476285:7476285:David Lastname:/home/username:/bin/bash
username@microsoftsupport.com:bd4802f0-####-####-####-############:7490090:7490090:username-guest:/home/username_1:/bin/bash
```

### Solution 8: SSH Fails with "User account has expired for illegal user"

As of oct 6, 2020, the PG is woriing on a service side fix to treat email sign-ins the same way as UPNs when checking for user existence.

Until the fix is released, the customer has two options if they are getting *User account has expired for illegal user username@contoso.com from 85.###.##.188* error:

1. A Memeber user is attempting to sign-in and a User Assigned managed identity is assigned to the VM with no System Assigned managed identity enabled.

- If the user failing to sign-in is a Member, verify a System Assigned managed identity is enabled.

2. A Guest user is trying to sign-in without a Sytem Assigned and/or User Assigned managed identity enabled.

- If the user failing to sign-in is a Guest, remove all System Assigned and User Assigned managed identities

**NOTE**: At some point in the future, installation of the extension will fail if a system assigned managed identity is missing.

## Issue 9: Sudo su -- Elevation not Prompting for OTP

After installing package aadlogin-1.0.014460002 of AADLoginForLinux authentication to VM the user is no longer prompted for a One Time Passcode (OTP) when elevating to SU using **sudo su --**. Prior to this package SUDO used to prompt for a new OTP using the device login flow. The new behavior lets the user get directly to SU without a One Time Passcode.

**Root cause**: The default behavior for Ubuntu (for local account that is) is to <u>not</u> ask for reauthentication when calling sudo. RedHad is heading in the same direction with version 8. So, Identity PG decided to change the default AADLogin behavior to not prompt either.

### Solution 9: Sudo su -- Elevation not Prompting for OTP

If the customer prefers the old behavior where access to SU requires OTP, they can enable it by trying these workarounds:

1. Add a system assigned managed identity to the VM from the Azure portal.
2. If solution 1 is not working, edit **/etc/sudoers.d/aad\_admins** and make this change:

| Current (no prompt) | Old Behavior (prompt) |
|----|----|
| %aad_admins ALL=(ALL) NOPASSWD:ALL | %aad_admins ALL=(ALL) ALL |

**NOTE**: If adding a system assigned identity doesn't help, there is likely an unknown problem that needs to be investigated.

The problem people are seeing is when they open a sudo session. The proper way is to call `sudo -i`, which works. However, many come from Unix where the command is `sudo su --`. This command runs authorization (without authentication) and fails if there is no managed identity. The sudo behavior may also be different in the different Linux flavors.

Sudo authentication is controlled by the `aad_admins` file, not managed identity. However, a managed identity is needed for the authorization path where `sudo su --` is called. If the customer calls `sudo program_not_using_pam`, it will work regardless if the VM has a managed identity or not.

The safest option is to have the managed identity enabled. At some point the extension will start failing installation if it is not enabled. When this change is required OTP will happen every time there is an authz call without authn and the VM doesn't have a managed identity. This means running sudo on VMs without a managed identity will be way more annoying, but at least it will work.

## Issue 10: DeviceLogin Fails with Access Denied

Device Login fails with Access Denied after the UPN was changed.

```bash
To sign in, use a web browser to open the page https://microsoft.com/devicelogin and enter the code RR5PKL8YU to authenticate. Press ENTER when ready.

Access denied

Using keyboard-interactive authentication.
```

**Root Cause**: UPN change is not supported and has to be manually fixed.

## Solution 10: DeviceLogin Fails with Access Denied

A local administrator must run `aaduserdel`, which will remove the user record from /etc/aadpasswd and from any groups. Then the log in will work again.

1. SSH to the VM as local admin
2. Run this command to remove the old UPN names.

`sudo aaduserdel --remove username@oldupnname.com`

3. Verify all instances of username@oldupnname.com are gone.

```bash 
sudo cat /etc/group
getent group admin
getent group aad_admin
```
4. Perform Azure AD Sign-in using the new UPN:

```bash
ssh username@newuppnname.com@40.##.###.8
```

**NOTE**: The `admin` and `aad_admins` membership is maintained automatically. On each log in the user is added to theese groups if admin access is allowed and is removed if only normal user access is allowed. `/etc/sudoers.d/Aad_admins` is registered in `sudoers.d`.

## Issue 11: Azure Linux VM Sign-In cloud app is not Registered

The **Azure Linux VM Sign-In* cloud app is not registered in Azure AD tenant that the Azure Subscription is assigned to. This prevents the customer from excluding the cloud app in conditional access policies that require strong authentication when WHfB is not configured.

### Solution 11: Azure Linux VM Sign-In cloud app is not Registered

Have a Global administrator manually register the AppId of the **Azure Linux VM Sign-In* cloud app.

```powershell
Connect-MgGraph -Scopes Application.ReadWrite.All
New-MgServicePrincipal -AppId 'ce6ff14a-7fdc-4685-bbe0-f6afdfcfa8e0'
```

# Troubleshooting

Verify the required endpoints are accessible from the VM using the command line:

- If prompted for a WHfB PIN, enter the one for your signed in account and hit enter to get content retured.

```bash
curl https://login.microsoftonline.com/ -D -
curl https://enterpriseregistration.windows.net/ -D -
curl https://device.login.microsoftonline.com/ -D -
curl https://pas.windows.net/ -D -
curl https://pas.windows.net/common/buildinfo
curl -H Metadata:true "http://169.254.169.254/metadata/identity/info?api-version=2018-02-01"
curl https://login.microsoftonline.com/<TenantID>/ -D -
```

Unable to Sign-in with Azure AD Accounts

## Azure RBAC (Role-Based Access Control)

The [Azure RBAC (Role-Based Access Control)](https://www.csssupportwiki.com/index.php/curated:Azure_RBAC_\(Role-Based_Access_Control\)) workflow.

## RBAC Commands (Customer)

### First, Get the role 'Name' and '**ID'**

The '**Name**' or '**ID**' of the Azure RBAC role of interest is needed when querying the Azure RBAC Role Assignments in the next command.

**Note**: These commands also dump other important information like the **Actions** and **DataActions** that can be performed by members of this role.

### PowerShell

```
    PS C:\> Get-AzureRmRoleDefinition -Name 'Virtual Machine Administrator Login'
    
    
    Name             : Virtual Machine Administrator Login
    Id               : 1c0163c0-47e6-4577-8991-ea5c82e286e4
    IsCustom         : False
    Description      : -  Users with this role have the ability to login to a virtual machine with Windows administrator
                       or Linux root user privileges.
    Actions          : {}
    NotActions       : {}
    DataActions      : {Microsoft.Compute/virtualMachines/login/action,
                       Microsoft.Compute/virtualMachines/loginAsAdmin/action}
    NotDataActions   : {}
    AssignableScopes : {/}
```

### Azure CLI 2.0

  - Using version 2.0.30 or later.

<!-- end list -->

```
    ga@Azure:~$ az role definition list --name 'Virtual Machine Administrator Login'
    [
      {
        "additionalProperties": {},
        "assignableScopes": [
          "/"
        ],
        "description": "-  Users with this role have the ability to login to a virtual machine with Windows administrator or Linux root user privileges.",
        "id": "/subscriptions/43e19234-####-####-####-############/providers/Microsoft.Authorization/roleDefinitions/1c0163c0-47e6-4577-8991-ea5c82e286e4",
        "name": "1c0163c0-47e6-4577-8991-ea5c82e286e4",
        "permissions": [
          {
            "actions": [],
            "additionalProperties": {},
            "dataActions": [
              "Microsoft.Compute/virtualMachines/login/action",
              "Microsoft.Compute/virtualMachines/loginAsAdmin/action"
            ],
            "notActions": [],
            "notDataActions": []
          }
        ],
        "roleName": "Virtual Machine Administrator Login",
        "roleType": "BuiltInRole",
        "type": "Microsoft.Authorization/roleDefinitions"
      }
    ]
```

### Next, List role Members and their Assigned Scope

Using the '**Name**' or '**ID**' of the Azure RBAC role of interest, query the Azure RBAC Role member assignments and identify the assigned Scope.

**PowerShell**

```
    PS C:\> Get-AzureRmRoleAssignment -RoleDefinitionId 1c0163c0-47e6-4577-8991-ea5c82e286e4
    
    
    RoleAssignmentId   : /subscriptions/43e19234-####-####-####-############/resourcegroups/deCentUS-EUAP/providers/Microso
                         ft.Authorization/roleAssignments/061b30ed-ab18-4389-bcdc-da24c3be9f52
    Scope              : /subscriptions/43e19234-####-####-####-############/resourcegroups/deCentUS-EUAP
    DisplayName        : Adam Stanfield
    SignInName         : AdamS@contoso.com
    RoleDefinitionName : Virtual Machine Administrator Login
    RoleDefinitionId   : 1c0163c0-47e6-4577-8991-ea5c82e286e4
    ObjectId           : 579d54a6-####-####-####-############
    ObjectType         : User
    CanDelegate        : False
```

**Azure CLI 2.0**

```
    ga@Azure:~$ az role assignment list --role 1c0163c0-47e6-4577-8991-ea5c82e286e4 --include-inherited --all
    [
      {
        "additionalProperties": {},
        "canDelegate": null,
        "id": "/subscriptions/43e19234-####-####-####-############/resourcegroups/deCentUS-EUAP/providers/Microsoft.Authorization/roleAssignments/061b30ed-ab18-4389-bcdc-da24c3be9f52",
        "name": "061b30ed-ab18-4389-bcdc-da24c3be9f52",
        "principalId": "579d54a6-####-####-####-############",
        "principalName": "AdamS@contoso.com",
        "resourceGroup": "deCentUS-EUAP",
        "roleDefinitionId": "/subscriptions/43e19234-####-####-####-############/providers/Microsoft.Authorization/roleDefinitions/1c0163c0-47e6-4577-8991-ea5c82e286e4",
        "roleDefinitionName": "Virtual Machine Administrator Login",
        "scope": "/subscriptions/43e19234-####-####-####-############/resourcegroups/deCentUS-EUAP",
        "type": "Microsoft.Authorization/roleAssignments"
      },
    ]
```

## Client-Side Logs

The following logs can be used to determine why Azure AD Login is failing:

| File Name | Location | Description | Verbosity|
| ------------ | ----------- | ----------- | ----------- | 
| <u>auth.log</u><br><br>**NOTE**: On RHEL (Redhat) this is saved to the <u>secure</u> log in the same location. | /var/log/  | This log records all sign-in activity |  |
| <u>common-auth</u><br><br>**NOTE**: On RHEL (Redhat) this is saved in the <u>system-auth-aad</u> in the same location. | /etc/pam.d/ | This file is where pam\_aad is registered and debug logging can be enabled. | To enable debug level logging in the auth.log, locate the line that ends with?**pam\_aad.so**?and add '?**debug**' to the end like this:?**pam\_aad.so debug.** |
| <u>sshd\_config</u> | /etc/ssh/ | The extension install script sets it to yes so that the message can be sent back to the SSH client to connect to the web URL to perform device sign-in | This should show <b>ChallengeResponseAuthentication yes</b> |

## Service-Side Tracing (Kusto)

Service-side tracing against ESTS can be performed using Kusto.

  - See the '**Collecting the auth.log or secure log**' section to collect the auth.log from the VM, or use the **Inspect IaaS Disk** diagnostic. This should capture the secure log from Redhat servers as well.

# ICM Path for AADLoginForLinux Extension Issues

## Cloud Identity AuthN Client

The Cloud Identity AuthN Client team supports bugs for all aspects of this VM extension:

  - Install
  - Update
  - Uninstall
  - Failure to install the libcurl3 package
  - Failure to set ChallengeResponseAuthentication yes in /etc/pam.d/common-auth
  - Failure to add pam\_aad.so to /etc/pam.d/common-auth
  - The pam\_aad module fails to add a user that is a member of Virtual Machine Administrator Login to Aad\_admins and sudoers.
  - The Devicelogin interrupt not appearing in the shell

Support Engineers should file an ICM using this Support Engineer?[ICM Template.](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=Z2T221)

TAs should route ICMs here:

  - **Service**: Cloud Identity AuthN Client
  - **Team**: Cloud Identity AuthN Client/OneAuth-MSAL C++

## EvoSTS (ESTS)

EvoSTS (ESTS) - This team handles issues involving the EvoSTS authentication service.? This is the token issuance portion of Azure Active Directory.Please make sure you have reviewed the support workflows on csssupportwiki.com and consult an Cloud Identity TA prior to submitting.

### Support Engineer ICM Template

Support Engineers should file an ICM using this Support Engineer [ICM Template.](https://portal.microsofticm.com/imp/v3/incidents/cri?tmpl=83L3k1)

### Target ICM Team (TA use)

  - **Owning Service**: ESTS
  - **Owning Team**: Incident Triage

# Public Documentation

[Login to an Azure Linux virtual machine using Azure AD authentication *\[Preview\]*](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/login-using-aad) 06/16/2018

# Training
