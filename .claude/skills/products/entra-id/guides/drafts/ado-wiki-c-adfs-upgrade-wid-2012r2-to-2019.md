---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/ADFS and WAP/ADFS Databases/ADFS Upgrade ADFS running on WID from 2012R2 to 2019"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.comm-adfs
- cw.adfs upgrade
- SCIM Identity
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

[**Tags**](/Tags): [comm-adfs](/Tags/comm%2Dadfs) [AAD-Authentication](/Tags/AAD%2DAuthentication) [AAD-ADFS](/Tags/AAD%2DADFS) [AAD-Troubleshooting](/Tags/AAD%2DTroubleshooting) [AAD-Workflow](/Tags/AAD%2DWorkflow) [AAD-Migration](/Tags/AAD%2DMigration) 
 

# Upgrading to AD FS in Windows Server 2019 using a WID database from 2012R2

**Note**

Only begin an upgrade with a definitive time frame planned for completion. It is
not recommended to keep AD FS in a mixed mode state for an extended period of
time, as leaving AD FS in a mixed mode state may cause issues with the farm.

## Upgrading a Windows Server 2012 R2 to Windows Server 2019

The following document will describe how to upgrade your AD FS farm in Windows
Server 2012R2 to AD FS in Windows Server 2019 when you are using a WID database.

### AD FS Farm Behavior Levels (FBL)

In AD FS for Windows Server 2016, the farm behavior level (FBL) was introduced.
This is farm-wide setting that determines the features the AD FS farm can use.

The following table lists the FBL values by Windows Server version:

| **TABLE 1**                |         |                                       |
|----------------------------|---------|---------------------------------------|
| **Windows Server Version** | **FBL** | **AD FS Configuration Database Name** |
| 2012 R2                    | 1       | AdfsConfiguration                     |
| 2019                       | 4       | AdfsConfigurationV4                   |

**Note**

Upgrading the FBL creates a new AD FS configuration database. See the table
above for the names of the configuration database for each Windows Server AD FS
version and FBL value.

### New vs Upgraded farms

By default, the FBL in a new AD FS farm matches the value for the Windows Server
version of the first farm node installed.

An AD FS server of a later version can be joined to an AD FS 2012 R2 farm, and
the farm will operate at the same FBL as the existing node(s). When you have
multiple Windows Server versions operating in the same farm at the FBL value of
the lowest version, your farm is said to be "mixed". However, you will not be
able to take advantage of the features of the later versions until the FBL is
raised. With a mixed farm:

-   Administrators can add new Windows Server 2019 federation servers to an
    existing Windows Server 2012 R2 farm. As a result, the farm is in "mixed
    mode" and operates at the same farm behavior level as the original farm. To
    ensure consistent behavior across the farm, features of the newer Windows
    Server AD FS versions cannot be configured or used.

-   Before the FBL can be raised, administrators must remove the AD FS nodes of
    previous Windows Server versions from the farm. In the case of a WID farm,
    note that this requires one of the new Windows Server 2019 federation
    servers to be promoted to the role of primary node in the farm.

-   Once all federation servers in the farm are at the same Windows Server
    version, the FBL can be raised. As a result, any new AD FS Windows Server
    2019 features can then be configured and used.

Be aware that while in mixed farm mode, the AD FS farm is not capable of any new
features or functionality introduced in AD FS in Windows Server 2019. This means
organizations that want to try out new features cannot do this until the FBL is
raised. So if your organization is looking to test the new features prior to
raising the FBL, you will need to deploy a separate farm to do this.

**The remainder of the is document provides the steps for adding a Windows
Server 2019 federation server to a Windows Server 2012 R2 environment and then
raising the FBL to Windows Server 2019.**

**Note**

Before you can move to AD FS in Windows Server 2019 FBL, you must remove all the
Windows Server 2012 R2 nodes. You cannot just upgrade a Windows Server 2012 R2
OS to Windows Server 2019 and have it become a 2019 node. You will need to
remove it and replace it with a new 2019 node.

It?s highly recommended to join **1 later version server into the existing farm
first**, complete the upgrade FBL process and then join other new later version
servers to the elevated farm. This would help prevent unexpected issues where
the old farm was running on FBL 1 and the idea of ADFS farm was not introduced.

##### To upgrade your AD FS farm to Windows Server 2019 Farm Behavior Level

1.  Using Server Manager, install the Active Directory Federation Services Role
    on the Windows Server 2019

2.  Using the AD FS Configuration wizard, join the new Windows Server 2019
    server to the existing AD FS farm.

    ![](/.attachments/AAD-Authentication/386932/ADFS_Wizard.png)



3.  On the Windows Server 2019 federation server, open AD FS management. Note
    that management capabilities are not available because this federation
    server is not the primary server.

    ![](/.attachments/AAD-Authentication/386932/ADFS_Second.png)



4.  On the Windows Server 2019 server, open an elevated PowerShell command
    window and run the following cmdlet:
    ```powershell
    Set-AdfsSyncProperties -Role PrimaryComputer
    ```

    ![](/.attachments/AAD-Authentication/386932/ADFS_Sycn_Role.png)



5.  On the AD FS server that was previously configured as primary, open an
    elevated PowerShell command window, and run the following cmdlet:
    ```powershell
    Set-AdfsSyncProperties -Role SecondaryComputer -PrimaryComputerName {FQDN}
    ```
    ![](/.attachments/AAD-Authentication/386932/ADFS_Sync.png)



6.  Now on the Windows Server 2019 federation server open AD FS Management. Note
    that now all the admin capabilities appear because the primary role has been
    transferred to this server.

    ![](/.attachments/AAD-Authentication/386932/ADFS_main.png)



7.  If you are upgrading an AD FS 2012 R2 farm to 2019, the farm upgrade
    requires the AD schema to be **at least level 85**. To check the schema,
    locate the schema master of your domain with command `Netdom query fsmo \|
    findstr -i schema`.

    ![](/.attachments/AAD-Authentication/386932/netdom.png)

> The command should return the name of the domain controller where you need
>   to run adprep.exe. Update the schema locally on the domain controller
>   hosting the Schema master role.

>   Using "ADSIEdit.msc " or/and "LDP.exe" tools, navigate to:
>   "CN=Schema,CN=Configuration,DC=domain,DC=local" and review the current
>   "objectVersion" attribute. It can be done by using command "dsquery \*
>   cn=schema,cn=configuration,dc=domainname,dc=local -scope base -attr
>   objectVersion"

>   The following value mapping indicates the mapping of values to version.

>   ????????Windows Server 2008 operating system (AD DS): 44

>   ????????Windows Server 2008 R2 operating system (AD DS): 47

>   ????????Windows Server 2012 operating system (AD DS): 56

>   ????????Windows Server 2012 R2 operating system (AD DS): 69

>   ????????Windows Server 2016 operating system (AD DS): 87

>   ????????Windows Server 2019 operating system (AD DS): 88

>   To upgrade the schema, With the Windows Server 2019 installation media, open
>   a command prompt and navigate to support\\adprep directory. Run the
>   following:?adprep /forestprep

   ![](/.attachments/AAD-Authentication/386932/netdom.png)



> Once that completes run?adprep/domainprep

>   **Note**

>   Prior to running the next step, ensure Windows Server is current by running
>   Windows Update from Settings. Continue this process until no further updates
>   are needed.

![](/.attachments/AAD-Authentication/386932/adprep.png)



8.  Now on the Windows Server 2019 Server open PowerShell and run the following
    cmdlet:

> **Note**

>   All 2012 R2 servers must be removed from the farm before running the next
>   step. You don?t need to uninstall the ADFS role from your 2012R2 servers at
>   this point, the recommendation is to move them out from the load balancer
>   configuration and turn the ADFS service off. Should anything go wrong and
>   can?t be fixed quickly you can go back by turning on the ADFS 2012R2
>   servers, make one primary and avoid impacting the business. If you find
>   yourself in this situation, just make sure everything else is pointing to
>   the old ADFS servers.

>   After you have successfully completed the upgrade process and validated
>   everything is working as expected. You can uninstall the ADFS role from the
>   old 2012r2 servers and get rid of them.

>   Before running the invoke PowerShell command to initiate the FBL raise,
>   please execute below command to check if the prerequisites are met.

>   **Test-AdfsFarmBehaviorLevelRaise**

![](/.attachments/AAD-Authentication/386932/testadfsfarm.png)

> **Invoke-AdfsFarmBehaviorLevelRaise**

![](/.attachments/AAD-Authentication/386932/WID_precheck.png)



9.  When prompted, type Y. This will begin raising the level. Once this
    completes you have successfully raised the FBL.

    ![](/.attachments/AAD-Authentication/386932/rolecomputer.png)



10.  Now, if you go to AD FS Management, you will see the new capabilities have
    been added for the later AD FS version

     ![](/.attachments/AAD-Authentication/386932/service_overview.png)



11.  Likewise, you can use the PowerShell cmdlet:?Get-AdfsFarmInformation?to show
    you the current FBL.

     ![](/.attachments/AAD-Authentication/386932/getadfsfarm.png)

     > In 2019 ADFS farm you should see ?4? in the ?Current Farm Behavior? above.

12.  You can add other later versions of ADFS servers into the elevated farm now
    by installing the ADFS role and select ?Add to existing farm? option.

13.  To upgrade the WAP servers to the latest level, on each Web Application
    Proxy, re-configure the WAP by executing the following PowerShell cmdlet in
    an elevated window:

> \$trustcred = Get-Credential -Message "Enter Domain Administrator
>   credentials"

>   Install-WebApplicationProxy -CertificateThumbprint {SSLCert} -fsname fsname
>   -FederationServiceTrustCredential \$trustcred

>   Remove old servers from the cluster and keep only the WAP servers running
>   the latest server version, which were reconfigured above, by running the
>   following Powershell cmdlet.

>   Set-WebApplicationProxyConfiguration -ConnectedServersName WAPServerName1,
>   WAPServerName2

>   Check the WAP configuration by running the
>   Get-WebApplicationProxyConfiguration cmdlet. The ConnectedServersName will
>   reflect the server run from the prior command.

>   Get-WebApplicationProxyConfiguration

>   To upgrade the ConfigurationVersion of the WAP servers, run the following
>   Powershell command.

>   Set-WebApplicationProxyConfiguration -UpgradeConfigurationVersion

>   This will complete the upgrade of the WAP servers.

If your ADFS SSL certificate is about to expire, it?s recommended to either roll
over the SSL certificate prior or after the upgrade process. If this was not
done, update the SSL certificate by set-adfssslcertificate command in a ?mixed?
mod farm might fail.

You can follow the instructions in below link to update the ADFS SSL certificate
in mixed mode farm properly.

<https://docs.microsoft.com/en-us/windows-server/identity/ad-fs/overview/ad-fs-faq#on-a-mixed-mode-farm-i-get-error-when-trying-to-set-the-new-ssl-certificate-using-set-adfssslcertificate--thumbprint-how-can-i-update-the-ssl-certificate-in-a-mixed-mode-ad-fs-farm>

**Note**

A known PRT issue exists in AD FS 2019 if Windows Hello for Business with a
Hybrid Certificate trust is performed. You may encounter this error in ADFS
Admin event logs: Received invalid Oauth request. The client 'NAME' is forbidden
to access the resource with scope 'ugs'. To remediate this error:

1.  Launch AD FS management console. Brose to "Services \> Scope Descriptions"

2.  Right click "Scope Descriptions" and select "Add Scope Description"

3.  Under name type "ugs" and Click Apply \> OK

4.  Launch Powershell as Administrator

5.  Execute the command `Get-AdfsApplicationPermission`. Look for the ScopeNames
    :{openid, aza} that has the ClientRoleIdentifier. Make a note of the
    ObjectIdentifier.

6.  Execute the command `Set-AdfsApplicationPermission -TargetIdentifier
    <ObjectIdentifier from step 5> -AddScope 'ugs'`

7.  Restart the ADFS service.

8.  On the client: Restart the client. User should be prompted to provision
    WHFB.

9.  If the provisioning window does not pop up then need to collect NGC trace
    logs and further troubleshoot.


