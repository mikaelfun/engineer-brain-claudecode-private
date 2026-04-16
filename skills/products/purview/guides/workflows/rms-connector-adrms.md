# Purview RMS Connector 与 AD RMS — 排查工作流

**来源草稿**: `ado-wiki-a-connector-spns.md`, `ado-wiki-a-default-iis-settings-rms-connector.md`, `ado-wiki-a-ds-lookup-caching.md`, `ado-wiki-a-fiddler-trace-rms-connector.md`, `ado-wiki-a-iis-kerberos-configuration-for-ad-rms.md`, `ado-wiki-a-restore-ad-rms-databases.md`, `ado-wiki-a-rms-connector-tsg.md`, `ado-wiki-a-view-ad-rms-certificates-in-iis.md`, `ado-wiki-b-learn-default-iis-settings.md`, `ado-wiki-b-rms-v1-cluster-key-password.md`, `ado-wiki-b-rms-v1-configuration.md`, `ado-wiki-b-rms-v1-install.md`, `onenote-rms-connector-troubleshooting.md`
**Kusto 引用**: `rms-auth-tracking.md`
**场景数**: 86
**生成日期**: 2026-04-07

---

## Scenario 1: Introduction
> 来源: ado-wiki-a-connector-spns.md | 适用: 未标注

### 排查步骤
The RMS connector creates Azure AD service principals (SPs). There is a main connector SP, `Aadrm_S-1-7-0`. There are other SPs, for each authorized identity in the connector configuration (e.g. Exchange Servers).

`[来源: ado-wiki-a-connector-spns.md]`

---

## Scenario 2: Inspecting Connector SPNs
> 来源: ado-wiki-a-connector-spns.md | 适用: 未标注

### 排查步骤
To search Entra for the Connector service principals, use the Azure AZ PowerShell Module.

`[来源: ado-wiki-a-connector-spns.md]`

---

## Scenario 3: Useful Commands
> 来源: ado-wiki-a-connector-spns.md | 适用: 未标注

### 排查步骤
| Command | Description |
|---------|-------------|
| `Get-AzADServicePrincipal` | Retrieve a list of Entra Id service principals (SPs) |
| `Get-AzADServicePrincipal \| fl` | Retrieve a detailed list of Entra Id SPs |
| `Get-AzADServicePrincipal \| Sort-Object -Property DisplayName \| ft DisplayName,AppId,Id` | Retrieve a list ordered by DisplayName |
| `Get-AzADServicePrincipal \| Where-Object {$_.ServicePrincipalName -Match "aadrm"} \| fl` | Retrieve AADRM SPs with details |
| `Get-AzADServicePrincipal \| Where-Object {$_.ServicePrincipalName -Match "aadrm"} \| fl Id,AppId,ObjectType,DisplayName,ServicePrincipalName,ServicePrincipalType,AccountEnabled` | Succinct list of AADRM SPs |
| `Get-AzADServicePrincipal \| Where-Object {$_.Displayname -Match "Microsoft.Azure.ActiveDirectoryRightsManagement"} \| fl DisplayName,ServicePrincipalName,AdditionalProperties` | Get Connector SPNs including created date |

`[来源: ado-wiki-a-connector-spns.md]`

---

## Scenario 4: Introduction
> 来源: ado-wiki-a-default-iis-settings-rms-connector.md | 适用: 未标注

### 排查步骤
When it comes to IIS and the RMS Connector, in a perfect world one would use the RMS Connector installer and let that configure IIS. After installation one may bind a certificate in IIS for SSL. Other than that, no one would ever change anything in IIS on the connector. Do not change the authentication settings.

`[来源: ado-wiki-a-default-iis-settings-rms-connector.md]`

---

## Scenario 5: SSL Settings
> 来源: ado-wiki-a-default-iis-settings-rms-connector.md | 适用: 未标注

### 排查步骤
In IIS, under _Default Web Site_, select `SSL Settings`.

Default settings:
- Require SSL: **Unchecked**
- Client Certificates: **Ignore**

`[来源: ado-wiki-a-default-iis-settings-rms-connector.md]`

---

## Scenario 6: Authentication
> 来源: ado-wiki-a-default-iis-settings-rms-connector.md | 适用: 未标注

### 排查步骤
The authentication settings start at the _Default Web Site_ and through the child objects under that.

| Level | Enabled Authentication |
|-------|----------------------|
| Default Web Site | Anonymous Authentication only |
| Bin | Windows Authentication only |
| Certification | Windows Authentication only |
| Licensing | Windows Authentication only |

`[来源: ado-wiki-a-default-iis-settings-rms-connector.md]`

---

## Scenario 7: NTFS Permissions
> 来源: ado-wiki-a-default-iis-settings-rms-connector.md | 适用: 未标注

### 排查步骤
**Never, ever, ever** alter the NTFS permissions on the RMS Connector's service files.

The most common files customers modify (based on old AD RMS documentation):
- `ServerCertification.asmx` in the Certification pipeline
- `License.asmx` in the Licensing pipeline

`[来源: ado-wiki-a-default-iis-settings-rms-connector.md]`

---

## Scenario 8: Default file locations
> 来源: ado-wiki-a-default-iis-settings-rms-connector.md | 适用: 未标注

### 排查步骤
- RMS Connector IIS files: `C:\Program Files\Microsoft Rights Management connector\Web Service`
- ServerCertification.asmx: `C:\Program Files\Microsoft Rights Management connector\Web Service\certification\ServerCertification.asmx`
- License.asmx: `C:\Program Files\Microsoft Rights Management connector\Web Service\licensing\License.asmx`

`[来源: ado-wiki-a-default-iis-settings-rms-connector.md]`

---

## Scenario 9: Default NTFS Permissions
> 来源: ado-wiki-a-default-iis-settings-rms-connector.md | 适用: 未标注

### 排查步骤
Both `ServerCertification.asmx` and `License.asmx` have the same file permissions:
- `ALL APPLICATION PACKAGES`, `ALL RESTRICTED APPLICATION PACKAGES`, and `Users` have `Read` and `Read & execute` permissions.
- `SYSTEM` and `Administrators` are granted more, as expected.

`[来源: ado-wiki-a-default-iis-settings-rms-connector.md]`

---

## Scenario 10: Introduction
> 来源: ado-wiki-a-ds-lookup-caching.md | 适用: 未标注

### 排查步骤
AD RMS servers query AD via global catalog (GC) servers. These lookups are cached in the AD RMS directory services database. These looks up are cached for 12 hours or more. Group membership changes may take up to 24 hours to update in the AD RMS cache.

One may clear these cached entries, disable the caching, or re-enable the caching if needed. 

**Any script / samples are subject to the disclaimer.**

`[来源: ado-wiki-a-ds-lookup-caching.md]`

---

## Scenario 11: Disclaimer
> 来源: ado-wiki-a-ds-lookup-caching.md | 适用: 未标注

### 排查步骤
```
******************************************************************************

THIS SOFTWARE/TOOL/INFORMATION IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY 
KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF 
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO 
EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES 
OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, 
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
DEALINGS IN THE SOFTWARE.

******************************************************************************
```

`[来源: ado-wiki-a-ds-lookup-caching.md]`

---

## Scenario 12: Clearing the existing cache
> 来源: ado-wiki-a-ds-lookup-caching.md | 适用: 未标注

### 排查步骤
The following clears all the entries from the caching DB tables.

```
/* Clear all caching table entries in the AD RMS Directory Service DB.

   Need to do an IIS reset on all cluster members after running the  
   following script. 

*/ 

USEDRMS_DirectoryServices_<your database NAME here> 

 
-- Clear all entries from the PrincipalAliases table
DELETE FROM PrincipalAliases 
WHERE PrincipalName !='' 

-- Clear all entries from the GroupAliases table
DELETE FROM GroupAliases 
WHERE GroupName !='' 

-- Clear all entries from the GroupMembership table
DELETE FROM GroupMembership 
WHERE GroupID !='' 

-- Clear all entries from the PrincipalIdentifiers table
DELETE FROM PrincipalIdentifiers 
WHERE PrincipalID !='' 

-- Clear all entries from the PrincipalMembership table
DELETE FROM PrincipalMembership 
WHERE PrincipalID!='' 

-- Clear all entries from the GroupIdentifiers
DELETE FROM GroupIdentifiers
WHERE GroupGUID !='' 
```

`[来源: ado-wiki-a-ds-lookup-caching.md]`

---

## Scenario 13: Disabling caching
> 来源: ado-wiki-a-ds-lookup-caching.md | 适用: 未标注

### 排查步骤
The following disables any AD lookup caching. All lookups will query a GC.

```
/* Disable GC caching in AD RMS. 
   Need to do an IIS reset on all cluster members after running the  
   following script. 
*/ 

-- Update the USE command to use your configuration database name! 
USE DRMS_Config_ipc_cpandl_com_443 
UPDATE dbo.DRMS_ClusterPolicies 

SET PolicyData = 0 

WHERE PolicyName IN ( 'DirectoryServicesDatabaseGroupCacheExpirationMinutes',  
'DirectoryServicesDatabasePrincipalCacheExpirationMinutes',  
'DirectoryServicesMemoryContactGroupMembershipCacheMaxSize',  
'DirectoryServicesMemoryGroupCacheExpirationMinutes',  
'DirectoryServicesMemoryGroupIdCacheMaxSize',  
'DirectoryServicesMemoryGroupMembershipCacheMaxSize',  
'DirectoryServicesMemoryPrincipalCacheExpirationMinutes',  
'DirectoryServicesMemoryPrincipalCacheMaxSize'); 
```

`[来源: ado-wiki-a-ds-lookup-caching.md]`

---

## Scenario 14: Enabling caching
> 来源: ado-wiki-a-ds-lookup-caching.md | 适用: 未标注

### 排查步骤
The following re-enables AD RMS AD query caches. It uses the default settings from a Windows Server 2019 AD RMS server.
```
/* Enables GC caching in AD RMS. 
   Caching is reset to AD RMS 2019 default settings. 

   Need to do an IIS reset on all cluster members after running the  
   following script. 

*/ 

-- Update the USE command to use your configuration database name! 
USE DRMS_Config_ipc_cpandl_com_443 

UPDATE dbo.DRMS_ClusterPolicies 

SET PolicyData = 720 
WHERE PolicyName IN ( 'DirectoryServicesDatabaseGroupCacheExpirationMinutes',  
'DirectoryServicesDatabasePrincipalCacheExpirationMinutes',  
'DirectoryServicesMemoryGroupCacheExpirationMinutes',  
'DirectoryServicesMemoryPrincipalCacheExpirationMinutes'); 

UPDATE dbo.DRMS_ClusterPolicies 
SET PolicyData = 1000 
WHERE PolicyName IN ('DirectoryServicesMemoryContactGroupMembershipCacheMaxSize'); 

UPDATE dbo.DRMS_ClusterPolicies 
SET PolicyData = 10000 
WHERE PolicyName IN ( 'DirectoryServicesMemoryGroupIdCacheMaxSize',  
'DirectoryServicesMemoryGroupMembershipCacheMaxSize',  
'DirectoryServicesMemoryPrincipalCacheMaxSize'); 
```

`[来源: ado-wiki-a-ds-lookup-caching.md]`

---

## Scenario 15: Links
> 来源: ado-wiki-a-ds-lookup-caching.md | 适用: 未标注

### 排查步骤
- _Ignore the title - it is about clearing the cache_ [AD RMS Policy Templates](https://docs.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2008-R2-and-2008/ee221094(v=ws.10)?redirectedfrom=MSDN)

`[来源: ado-wiki-a-ds-lookup-caching.md]`

---

## Scenario 16: Introduction
> 来源: ado-wiki-a-fiddler-trace-rms-connector.md | 适用: 未标注

### 排查步骤
The RMS Connector runs in **system context.** To collect a Fiddler trace for RMS Connector traffic Fiddler must run in system context.

`[来源: ado-wiki-a-fiddler-trace-rms-connector.md]`

---

## Scenario 17: Steps to run the Fiddler in System context
> 来源: ado-wiki-a-fiddler-trace-rms-connector.md | 适用: 未标注

### 排查步骤
1. Download the [**PSExec**](https://learn.microsoft.com/en-us/sysinternals/downloads/psexec) tool on the RMS Connector server and extract it.
2. Open an elevated command prompt.
3. Navigate to the folder where PSExec is extracted.
4. Run `psexec -i -s <Path to the Fiddler exe>`.
   - Example: `psexec -i -s C:\Users\sysadm.CONTOSO\AppData\Local\Programs\Fiddler\Fiddler.exe`
5. Enable the SSL decryption from Fiddler Tools -> Options menu.
6. Reproduce the issue and make sure you are able to see the RMS connector traffic in the Fiddler.

`[来源: ado-wiki-a-fiddler-trace-rms-connector.md]`

---

## Scenario 18: Proxy Configuration
> 来源: ado-wiki-a-fiddler-trace-rms-connector.md | 适用: 未标注

### 排查步骤
If the Connector is configured to use a proxy server, change the setting to use Fiddler as the Proxy and configure the Fiddler to use the network proxy.

1. Go to `HKLM\Software\Microsoft\AADRN\Connector` to check if the `ProxyAddress` settings is enabled for the Connector. If it is not, you can ignore the next step.
2. Update this **ProxyAddress** with the Fiddler proxy address: `http://127.0.0.1:8888`.
3. Enable the custom proxy setting in Fiddler.
   - Go to Tools-> Options -> Gateway -> Manual Proxy Configurations. Add customer's proxy address.
4. If they have Proxy bypass list, please add them as well.

`[来源: ado-wiki-a-fiddler-trace-rms-connector.md]`

---

## Scenario 19: Introduction
> 来源: ado-wiki-a-iis-kerberos-configuration-for-ad-rms.md | 适用: 未标注

### 排查步骤
In some cases AD RMS cluster name configuration is configured to use Kerberos authentication. When using Kerberos authentication, where the Kerberos service principal (SPN) is on the AD RMS service account, ensure IIS is configured properly.

`[来源: ado-wiki-a-iis-kerberos-configuration-for-ad-rms.md]`

---

## Scenario 20: Purpose
> 来源: ado-wiki-a-iis-kerberos-configuration-for-ad-rms.md | 适用: 未标注

### 排查步骤
This is not an authoritative guide for configuring Kerberos authentication. It is a way to do so, for guidance.

`[来源: ado-wiki-a-iis-kerberos-configuration-for-ad-rms.md]`

---

## Scenario 21: AD RMS Service Account
> 来源: ado-wiki-a-iis-kerberos-configuration-for-ad-rms.md | 适用: 未标注

### 排查步骤
**Service Principal Names (SPN)**
During authentication AD RMS clients will query active directory for a Kerberos SPN. In this case the RMS cluster FQDN is `irm.moose.local`. The Kerberos service request for a web service is `HTTP`. Note this has no relationship to whether AD RMS is using the http or https protocol. In the end clients are looking for an SPN of `HTTP/irm.moose.local`.

There are two ways to configure a SPN on an account in AD. You may use a command line tool, `setspn.exe` or the AD Users and Computer GUI. We'll use the GUI in this wiki. 

Once the appropriate SPNs are registered on the service account it must be trusted for delegation.

`[来源: ado-wiki-a-iis-kerberos-configuration-for-ad-rms.md]`

---

## Scenario 22: Registering SPNs
> 来源: ado-wiki-a-iis-kerberos-configuration-for-ad-rms.md | 适用: 未标注

### 排查步骤
1. Open AD Users and Computers (ADUC)
2. Go under `View` and enable `Advanced Features`.
3. Navigate to the RMS service account, right click, and choose properties. 
4. In the properties page:
 - Go to the `Attribute Editor` tab. 
 - Press the `Filter` button and choose `Show only attributes that have values`.
5. Scroll to the `servicePrincipalName` attribute and double click it. 
 - In the multi-valued string editor dialog add the `HTTP/irm.moose.local` text and press add. 
 - Press OK to finish this dialog.

`[来源: ado-wiki-a-iis-kerberos-configuration-for-ad-rms.md]`

---

## Scenario 23: Trusting for Delegation
> 来源: ado-wiki-a-iis-kerberos-configuration-for-ad-rms.md | 适用: 未标注

### 排查步骤
Continue on in ADUC from the previous step.

1. On the RMS service account's property page, select the `Delegation` tab. 
 - Enable the 'Trust this user for delegation to specified services only' and `Use Kerberos only` radio buttons. 
 - Press the `Add` button.
2. In the `Add Services` dialog, press the `Users and Computers...` button and use it to choose the RMS service account.
3. Under `Available services` choose the HTTP for the RMS cluster name and press OK.
4. The service account is now trusted to do Kerberos for the HTTP service.

`[来源: ado-wiki-a-iis-kerberos-configuration-for-ad-rms.md]`

---

## Scenario 24: IIS
> 来源: ado-wiki-a-iis-kerberos-configuration-for-ad-rms.md | 适用: 未标注

### 排查步骤
When using a service account for the Kerberos authentication, the following setting needs to be configured.

1. Open IIS Management Console.
2. Navigate to the `_wmcs` object.
3. Choose Authentication from the center section.
4. Go to Windows authentication and choose `Advanced Settings`.
5. Ensure `Enable Kernel-mode authentication` is selected.

`[来源: ado-wiki-a-iis-kerberos-configuration-for-ad-rms.md]`

---

## Scenario 25: Introduction
> 来源: ado-wiki-a-restore-ad-rms-databases.md | 适用: 未标注

### 排查步骤
It is possible to restoring an AD RMS cluster from preexisting AD RMS databases. This means if you have a SQL backups if the RMS databases we may rebuild a completely failed RMS cluster.

Generally this works well as long as: 
 - the previous AD RMS server's cluster key password is known, and 
 - the AD RMS trusted publishing domains were centrally managed*.

*AD RMS default software managed keys are stored in the configuration database. A custom software key or an HSM key are not stored in the DB.

`[来源: ado-wiki-a-restore-ad-rms-databases.md]`

---

## Scenario 26: Recovery
> 来源: ado-wiki-a-restore-ad-rms-databases.md | 适用: 未标注

### 排查步骤
To recover AD RMS by using the original AD RMS databases we'll do the following process.

`[来源: ado-wiki-a-restore-ad-rms-databases.md]`

---

## Scenario 27: Steps
> 来源: ado-wiki-a-restore-ad-rms-databases.md | 适用: 未标注

### 排查步骤
1. On the new AD RMS server to be, add the AD RMS role. Do not configure the role, just add it.
2. Handle the SCP part (discussed below).
3. Run the AD RMS configuiration process.
4. If we did step 2 correctly, our configuration process will be as follows.
 - SQL (this assumes that the SQL DBs are in the same location as before - see below)
   - Choose the Join an existing cluster option
   - Provide the SQL server / instance
   - Select the existing Configuration database
 - Service account
    - Provide the existing AD RMS service account that was configured in the previous cluster
 - Cluster key password
    - Provide the cluster key password that protected the previous AD RMS installation
 - The rest of the wizard

Once completed there is a new AD RMS server, effectively a new member of the existing AD RMS cluster. It will have all the same AD RMS centrally managed trusted publishing domains (TPDs) as before.

`[来源: ado-wiki-a-restore-ad-rms-databases.md]`

---

## Scenario 28: Service Connection Point (SCP)
> 来源: ado-wiki-a-restore-ad-rms-databases.md | 适用: 未标注

### 排查步骤
A crucial part of this process is to have the `join an existing cluster` option in the AD RMS configuration. This option is available if the SCP is registered in AD. 

**Is the RMS SCP (service connection point) still registered in AD?**

Check: [AD RMS How-to: The SCP](https://learn.microsoft.com/en-us/archive/technet-wiki/52869.ad-rms-how-to-the-scp)

`[来源: ado-wiki-a-restore-ad-rms-databases.md]`

---

## Scenario 29: SCP is registered
> 来源: ado-wiki-a-restore-ad-rms-databases.md | 适用: 未标注

### 排查步骤
If the SCP is still registered with the URL from the original AD RMS configuration, we're good. If not, we need to work around it.

`[来源: ado-wiki-a-restore-ad-rms-databases.md]`

---

## Scenario 30: No SCP
> 来源: ado-wiki-a-restore-ad-rms-databases.md | 适用: 未标注

### 排查步骤
If SCP is not registered, we'll use a registry key on the AD RMS server that is to be configured.

Add the AD RMS role to the server. Once the AD RMS role is added the registry key is present. We need to add the `GICURL` value. In the example below I am using the SCP URL from the SCP wiki article. This URL should be the previous AD RMS cluster's SCP URL.
```
HKLM\Software\Microsoft\DRMS
Name:  GICURL
Type:  REG_SZ
Value: "https://ipc.relecloud.com/_wmcs/certification"
```

Once the `GICURL` is correctly configured, the "join an existing cluster" option will be available in the RMS role configuration wizard.

`[来源: ado-wiki-a-restore-ad-rms-databases.md]`

---

## Scenario 31: SQL
> 来源: ado-wiki-a-restore-ad-rms-databases.md | 适用: 未标注

### 排查步骤
If the AD RMS databases reside in the same SQL server and instance as before, no extra steps are needed. 

If the AD RMS databases are in a different location we need follow the steps `Modify newly restore database settings` in [Relocating the AD RMS database - The simple but complete guide](https://learn.microsoft.com/en-us/archive/technet-wiki/14887.relocating-the-ad-rms-database-the-simple-but-complete-guide)

`[来源: ado-wiki-a-restore-ad-rms-databases.md]`

---

## Scenario 32: Introduction
> 来源: ado-wiki-a-rms-connector-tsg.md | 适用: 未标注

### 排查步骤
The RMS Connector service integrates on-premises server applications (Exchange, SharePoint, FCI) with AIP/AADRM for encryption. It does NOT provide sensitivity label functionality.

**Key**: On-premises Exchange does not need Connector integration if user mailboxes are on-premises and only Outlook on Windows/Mac is used. Connector integration is needed only when Exchange servers themselves need RMS functionality (OWA, mobile mail clients with on-premises mailboxes).

`[来源: ado-wiki-a-rms-connector-tsg.md]`

---

## Scenario 33: Step 1: Connector Connectivity
> 来源: ado-wiki-a-rms-connector-tsg.md | 适用: 未标注

### 排查步骤
Before troubleshooting application integration, verify the Connector itself works.

`[来源: ado-wiki-a-rms-connector-tsg.md]`

---

## Scenario 34: Admin Wizard
> 来源: ado-wiki-a-rms-connector-tsg.md | 适用: 未标注

### 排查步骤
The RMS Connector administration tool runs as user context. The Connector service running as system context needs separate verification.

`[来源: ado-wiki-a-rms-connector-tsg.md]`

---

## Scenario 35: Running as system context
> 来源: ado-wiki-a-rms-connector-tsg.md | 适用: 未标注

### 排查步骤
1. Open an elevated command prompt.
2. Run `iisreset`.
3. Check the application event log for successful retrieval of authorized accounts (Event ID 1004 = success).

If Event 1004 is NOT logged → troubleshoot Connector-to-Azure connectivity first.

`[来源: ado-wiki-a-rms-connector-tsg.md]`

---

## Scenario 36: Step 2: Service Authorizations
> 来源: ado-wiki-a-rms-connector-tsg.md | 适用: 未标注

### 排查步骤
For Exchange/SharePoint/FCI to use the Connector, they must be authorized. See [Authorizing servers to use the RMS connector](https://learn.microsoft.com/en-us/azure/information-protection/install-configure-rms-connector#authorizing-servers-to-use-the-rms-connector).

`[来源: ado-wiki-a-rms-connector-tsg.md]`

---

## Scenario 37: Step 3: Service Connectivity (Client Registry Settings)
> 来源: ado-wiki-a-rms-connector-tsg.md | 适用: 未标注

### 排查步骤
Exchange/SharePoint/FCI servers require registry settings to discover/redirect to the Connector. See [Configuring servers for the Azure Rights Management connector](https://learn.microsoft.com/en-us/azure/information-protection/configure-servers-rms-connector).

Use `GenConnectorConfig.ps1` with `-CreateRegEditFiles` parameter to generate .reg files:
```powershell
.\GenConnectorConfig.ps1 -ConnectorUri http://MyConnector -CreateRegEditFiles
```

`[来源: ado-wiki-a-rms-connector-tsg.md]`

---

## Scenario 38: Exchange Troubleshooting
> 来源: ado-wiki-a-rms-connector-tsg.md | 适用: 未标注

### 排查步骤
1. Run `Get-IRMConfiguration` and save output.
2. Run `Test-IRMConfiguration -sender user@contoso.com` and save output.
3. Grab IRM Logs generated during test execution.
4. Note any RMS Connector errors in Windows Application event log.

**Common Error**: `VerifyMachineCertificateChainFailedException` → See [How To: Exchange cryptographic overrides](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/11297/How-To-Exchange-cryptographic-overrides).

#### IRM Logs
See [Information Rights Management logging](https://learn.microsoft.com/en-us/exchange/information-rights-management-logging-exchange-2013-help).

`[来源: ado-wiki-a-rms-connector-tsg.md]`

---

## Scenario 39: SharePoint Troubleshooting
> 来源: ado-wiki-a-rms-connector-tsg.md | 适用: 未标注

### 排查步骤
SharePoint uses MSIPC (like Office on Windows). MSIPC logs location:
`C:\ProgramData\Microsoft\MSIPC\Server`

**Note**: Some directories are hidden/system protected. Enable "Show hidden files" and uncheck "Hide protected operating system files" in Explorer.

Under `C:\ProgramData\Microsoft\MSIPC\Server` there will be SID-named directories for the SharePoint Farm accounts, each containing log files.

#### IRM-integrated document libraries
- Content stored unencrypted in library; protected on download.
- If download fails → troubleshoot SharePoint side.
- If file downloads but won't open → troubleshoot client side.

See internal KB for SharePoint IRM issues: KB4500944.

`[来源: ado-wiki-a-rms-connector-tsg.md]`

---

## Scenario 40: FCI
> 来源: ado-wiki-a-rms-connector-tsg.md | 适用: 未标注

### 排查步骤
FCI may be an RMS Connector client but no documented cases yet.

`[来源: ado-wiki-a-rms-connector-tsg.md]`

---

## Scenario 41: Introduction
> 来源: ado-wiki-a-view-ad-rms-certificates-in-iis.md | 适用: 未标注

### 排查步骤
AD RMS servers may use HTTPS for the service URLs. This requires an SSL certificate in IIS.

The purpose for this article is to find and view the AD RMS certificate in IIS.

`[来源: ado-wiki-a-view-ad-rms-certificates-in-iis.md]`

---

## Scenario 42: AD RMS Console
> 来源: ado-wiki-a-view-ad-rms-certificates-in-iis.md | 适用: 未标注

### 排查步骤
Open AD RMS console and make sure the AD RMS service is configured to use the **HTTPS** URLs. If it is using only **HTTP**, then there is no need to configure SSL certificate in IIS.

`[来源: ado-wiki-a-view-ad-rms-certificates-in-iis.md]`

---

## Scenario 43: IIS
> 来源: ado-wiki-a-view-ad-rms-certificates-in-iis.md | 适用: 未标注

### 排查步骤
Use the Internet Information Services (IIS) MMC to view the certificate bound to IIS for AD RMS service.

`[来源: ado-wiki-a-view-ad-rms-certificates-in-iis.md]`

---

## Scenario 44: Find the certificate
> 来源: ado-wiki-a-view-ad-rms-certificates-in-iis.md | 适用: 未标注

### 排查步骤
1. Open the IIS MMC.
2. Navigate to the Default Web Site.
3. On the right hand side select `Bindings...`
4. In the `Site Bindings` dialog, select `https` and choose `Edit...`
5. In the `Edit Site Binding` window click `View...` on the SSL certificate already bound to the site.

The certificate dialog opens.

`[来源: ado-wiki-a-view-ad-rms-certificates-in-iis.md]`

---

## Scenario 45: View the certificate
> 来源: ado-wiki-a-view-ad-rms-certificates-in-iis.md | 适用: 未标注

### 排查步骤
- The `General` tab shows the:
    - Name (_Issued to_),
    - Validity range, and
    - Private key status of the certificate.
- The `Details` tab displays other information.
- The `Certification Path` presents the:
    - Certificate hierarchy, and 
    - Certificate status.

`[来源: ado-wiki-a-view-ad-rms-certificates-in-iis.md]`

---

## Scenario 46: Verify the certificate
> 来源: ado-wiki-a-view-ad-rms-certificates-in-iis.md | 适用: 未标注

### 排查步骤
- On the `General` tab check the certificate is issued to the server name (or RMS cluster name), is valid per the date, and has the private key.
 - On the `Certification Path` tab ensure we trust the issuing certification authorities (CAs) and the certificate state is OK.

`[来源: ado-wiki-a-view-ad-rms-certificates-in-iis.md]`

---

## Scenario 47: Introduction
> 来源: ado-wiki-b-learn-default-iis-settings.md | 适用: 未标注

### 排查步骤
When it comes to IIS and AD RMS, in a perfect world one would use the role install & configuration process to configure IIS. After installation one may bind a certificate in IIS for SSL. Other than that, _no one would ever change anything in IIS_ on the AD RMS server. And please, do not change the authentication settings.

However, it is not a perfect world. And customers like to break things. This document highlights some of the common default IIS settings on working AD RMS server.

Included are some NTFS permissions.

`[来源: ado-wiki-b-learn-default-iis-settings.md]`

---

## Scenario 48: SSL Settings
> 来源: ado-wiki-b-learn-default-iis-settings.md | 适用: 未标注

### 排查步骤
In IIS, under _Default Web Site_, select `SSL Settings`.

The default settings are as follows.
 - Require SSL: **_Unchecked_**
 - Client Certificates: **_Ignore_**

`[来源: ado-wiki-b-learn-default-iis-settings.md]`

---

## Scenario 49: Authentication
> 来源: ado-wiki-b-learn-default-iis-settings.md | 适用: 未标注

### 排查步骤
The authentication settings start at the _Default Web Site_ and through the child objects under that. 
 - Default Web Site has only Anonymous Authentication configured.
 - All other pipelines, including _wmcs, admin, certification, decommission, groupexpansion, and licensing, only have Windows Authentication enabled.

`[来源: ado-wiki-b-learn-default-iis-settings.md]`

---

## Scenario 50: Default Web Site
> 来源: ado-wiki-b-learn-default-iis-settings.md | 适用: 未标注

### 排查步骤
- Only `Anonymous Authentication` is enabled.

`[来源: ado-wiki-b-learn-default-iis-settings.md]`

---

## Scenario 51: _wmcs
> 来源: ado-wiki-b-learn-default-iis-settings.md | 适用: 未标注

### 排查步骤
- Only `Windows Authentication` is enabled.

`[来源: ado-wiki-b-learn-default-iis-settings.md]`

---

## Scenario 52: Certification
> 来源: ado-wiki-b-learn-default-iis-settings.md | 适用: 未标注

### 排查步骤
- Only `Windows Authentication` is enabled.

`[来源: ado-wiki-b-learn-default-iis-settings.md]`

---

## Scenario 53: Licensing
> 来源: ado-wiki-b-learn-default-iis-settings.md | 适用: 未标注

### 排查步骤
- Only `Windows Authentication` is enabled.

`[来源: ado-wiki-b-learn-default-iis-settings.md]`

---

## Scenario 54: File System
> 来源: ado-wiki-b-learn-default-iis-settings.md | 适用: 未标注

### 排查步骤
Occasionally, with AD RMS, one may need to modify permissions on the ServerCertification.asmx file. This was done when integrating Exchange or SharePoint with AD RMS.

`[来源: ado-wiki-b-learn-default-iis-settings.md]`

---

## Scenario 55: Default file locations
> 来源: ado-wiki-b-learn-default-iis-settings.md | 适用: 未标注

### 排查步骤
- AD RMS IIS files: `C:\inetpub\wwwroot\_wmcs`
 - ServerCertification.asmx: `C:\inetpub\wwwroot\_wmcs\certification\ServerCertification.asmx`
 - License.asmx: `C:\inetpub\wwwroot\_wmcs\licensing\License.asmx`

`[来源: ado-wiki-b-learn-default-iis-settings.md]`

---

## Scenario 56: RMS v1 - Cluster Key Password
> 来源: ado-wiki-b-rms-v1-cluster-key-password.md | 适用: 未标注

### 排查步骤
RMS v1 used a password. It behaved just as a cluster key password from AD RMS, just named differently.

`[来源: ado-wiki-b-rms-v1-cluster-key-password.md]`

---

## Scenario 57: Reset Password
> 来源: ado-wiki-b-rms-v1-cluster-key-password.md | 适用: 未标注

### 排查步骤
Note the super user section above the password when resetting the cluster key password.

> **Note**: Most content in the original wiki page is screenshot-based. Refer to the source URL for visual guidance.

`[来源: ado-wiki-b-rms-v1-cluster-key-password.md]`

---

## Scenario 58: RMS v1 - Configuration
> 来源: ado-wiki-b-rms-v1-configuration.md | 适用: 未标注

### 排查步骤
Again, many moons ago, one must enroll for a server licensor certificate (SLC), among other things.

`[来源: ado-wiki-b-rms-v1-configuration.md]`

---

## Scenario 59: Enroll
> 来源: ado-wiki-b-rms-v1-configuration.md | 适用: 未标注

### 排查步骤
Starting in 2012 Microsoft discontinued the UDDI service that managed the SLC enrollment and renewal. You renewed the SLC one last time and it effectively never expired.

Reference: [Renewing the SLC for RMS v1 after May 2012](https://social.technet.microsoft.com/wiki/contents/articles/15042.renewing-the-slc-for-rms-v1-after-may-2012.aspx)

`[来源: ado-wiki-b-rms-v1-configuration.md]`

---

## Scenario 60: Offline Request
> 来源: ado-wiki-b-rms-v1-configuration.md | 适用: 未标注

### 排查步骤
Use the offline request process when internet-based enrollment is unavailable. (Screenshots in original wiki.)

`[来源: ado-wiki-b-rms-v1-configuration.md]`

---

## Scenario 61: Import SLC
> 来源: ado-wiki-b-rms-v1-configuration.md | 适用: 未标注

### 排查步骤
Import the SLC through the AD RMS administration console. (Screenshots in original wiki.)

`[来源: ado-wiki-b-rms-v1-configuration.md]`

---

## Scenario 62: Default Admin Site
> 来源: ado-wiki-b-rms-v1-configuration.md | 适用: 未标注

### 排查步骤
Access via the AD RMS Administration console. (Screenshot in original wiki.)

`[来源: ado-wiki-b-rms-v1-configuration.md]`

---

## Scenario 63: Manage SCP
> 来源: ado-wiki-b-rms-v1-configuration.md | 适用: 未标注

### 排查步骤
Register/Unregister the SCP (service connection point).

`[来源: ado-wiki-b-rms-v1-configuration.md]`

---

## Scenario 64: Register SCP
> 来源: ado-wiki-b-rms-v1-configuration.md | 适用: 未标注

### 排查步骤
Register SCP via the AD RMS MMC → server properties → SCP tab → Change SCP.

`[来源: ado-wiki-b-rms-v1-configuration.md]`

---

## Scenario 65: Unregister SCP
> 来源: ado-wiki-b-rms-v1-configuration.md | 适用: 未标注

### 排查步骤
Unregister SCP via the same AD RMS MMC path.

> **Note**: Most content in the original wiki page is screenshot-based. Refer to the source URL for visual guidance.

`[来源: ado-wiki-b-rms-v1-configuration.md]`

---

## Scenario 66: RMS v1 - Install
> 来源: ado-wiki-b-rms-v1-install.md | 适用: 未标注

### 排查步骤
Back in the olden days, before AD RMS, there was RMS v1. Welcome.

`[来源: ado-wiki-b-rms-v1-install.md]`

---

## Scenario 67: Install
> 来源: ado-wiki-b-rms-v1-install.md | 适用: 未标注

### 排查步骤
Step-by-step installation of RMS v1 through the wizard. (Screenshots in original wiki.)

`[来源: ado-wiki-b-rms-v1-install.md]`

---

## Scenario 68: Configure
> 来源: ado-wiki-b-rms-v1-install.md | 适用: 未标注

### 排查步骤
Post-installation configuration of RMS v1. (Screenshots in original wiki.)

> **Note**: Most content in the original wiki page is screenshot-based. Refer to the source URL for visual guidance.

`[来源: ado-wiki-b-rms-v1-install.md]`

---

## Scenario 69: RMS Connector Troubleshooting
> 来源: onenote-rms-connector-troubleshooting.md | 适用: Mooncake ✅

### 排查步骤
> Source: OneNote — Mooncake POD Support Notebook / Information Protection (AIP) / RMS Connector
> Status: draft (from onenote-extract)

`[来源: onenote-rms-connector-troubleshooting.md]`

---

## Scenario 70: ADO Wiki Reference
> 来源: onenote-rms-connector-troubleshooting.md | 适用: 未标注

### 排查步骤
https://dev.azure.com/SupportabilityWork/Azure%20Security/_wiki/wikis/Information%20Protection/1910/RMS-Connector

`[来源: onenote-rms-connector-troubleshooting.md]`

---

## Scenario 71: RMS Connector Installation Log
> 来源: onenote-rms-connector-troubleshooting.md | 适用: 未标注

### 排查步骤
```
%LocalAppData%\Temp\Microsoft Rights Management connector_<date and time>.log
```

`[来源: onenote-rms-connector-troubleshooting.md]`

---

## Scenario 72: RMS Connector Event Log
> 来源: onenote-rms-connector-troubleshooting.md | 适用: 未标注

### 排查步骤
- Location: **Event Viewer → Application**
- Source: `Microsoft RMS connector`

`[来源: onenote-rms-connector-troubleshooting.md]`

---

## Scenario 73: SharePoint MSIPC Log
> 来源: onenote-rms-connector-troubleshooting.md | 适用: 未标注

### 排查步骤
```
C:\ProgramData\Microsoft\MSIPC\Server
```

`[来源: onenote-rms-connector-troubleshooting.md]`

---

## Scenario 74: SharePoint Event Log
> 来源: onenote-rms-connector-troubleshooting.md | 适用: 未标注

### 排查步骤
- **Event Viewer → Application**
- **Event Viewer → Applications and Services Logs → Microsoft → SharePoint Products**

`[来源: onenote-rms-connector-troubleshooting.md]`

---

## Scenario 75: 用途
> 来源: rms-auth-tracking.md | 适用: 未标注

### 排查步骤
追踪 Azure RMS 服务的 Azure AD 认证请求，排查登录失败、条件访问阻止等问题。

**Azure RMS ResourceId**: `00000012-0000-0000-c000-000000000000`

---

`[来源: rms-auth-tracking.md]`

---

## Scenario 76: 执行方式
> 来源: rms-auth-tracking.md | 适用: 未标注

### 排查步骤
> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://estscnn2.chinanorth2.kusto.chinacloudapi.cn`
> - database: `ESTS`

`[来源: rms-auth-tracking.md]`

---

## Scenario 77: 必要参数
> 来源: rms-auth-tracking.md | 适用: 未标注

### 排查步骤
| 参数 | 必填 | 说明 |
|------|------|------|
| {starttime} | 是 | 开始时间 |
| {endtime} | 是 | 结束时间 |
| {tenantId} | 否 | 租户 ID |
| {correlationId} | 否 | 关联 ID |
| {userId} | 否 | 用户对象 ID |

`[来源: rms-auth-tracking.md]`

---

## Scenario 78: 查询语句
> 来源: rms-auth-tracking.md | 适用: 未标注

### 排查步骤
```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
let correlationid = "{correlationId}";
let userobjectId = "{userId}";
PerRequestTableIfx
| where env_time between (starttime .. endtime)
| extend targetid = iff(correlationid <> '', correlationid, iff(tenantid <> '', tenantid, 'non-exist'))
| where CorrelationId =~ targetid or Tenant =~ targetid or TenantId =~ targetid or UserTenantId =~ targetid
| where UserPrincipalObjectID contains userobjectId
| where ResourceId == '00000012-0000-0000-c000-000000000000'  // Azure RMS
| project env_time, CorrelationId, ErrorCode, ApplicationDisplayName, Client, 
         ResourceId, ResourceDisplayName, ClientIp, RequestId, Result, 
         MaskedResponse, HttpStatusCode, HttpMethod, ApplicationId, 
         VerificationCert, Call, OriginalHost, Tenant, TenantId, UserTenantId, 
         ThrTenant, UserTenantMfaStatus, DeviceId, DomainName, FaultDomain, 
         UserPrincipalObjectID, ServicePrincipalObjectID, OTData, ITData, 
         LastPasswordChangeTimestamp
| order by env_time asc
```

`[来源: rms-auth-tracking.md]`

---

## Scenario 79: 结果字段说明
> 来源: rms-auth-tracking.md | 适用: 未标注

### 排查步骤
| 字段 | 说明 |
|------|------|
| env_time | 事件时间 |
| CorrelationId | 关联 ID |
| ErrorCode | AAD 错误码 (AADSTS) |
| ApplicationDisplayName | 应用程序名称 |
| ResourceDisplayName | 资源名称 (Azure RMS) |
| Result | 结果 |
| HttpStatusCode | HTTP 状态码 |
| ClientIp | 客户端 IP |
| TenantId | 租户 ID |
| UserPrincipalObjectID | 用户对象 ID |
| DeviceId | 设备 ID |
| UserTenantMfaStatus | MFA 状态 |

---

`[来源: rms-auth-tracking.md]`

---

## Scenario 80: 执行方式
> 来源: rms-auth-tracking.md | 适用: 未标注

### 排查步骤
> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://estscnn2.chinanorth2.kusto.chinacloudapi.cn`
> - database: `ESTS`

`[来源: rms-auth-tracking.md]`

---

## Scenario 81: 用途
> 来源: rms-auth-tracking.md | 适用: 未标注

### 排查步骤
根据 correlationId 查询 AAD 登录失败的详细错误信息。

`[来源: rms-auth-tracking.md]`

---

## Scenario 82: 查询语句
> 来源: rms-auth-tracking.md | 适用: 未标注

### 排查步骤
```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let correlationid = "{correlationId}";
DiagnosticTracesIfx
| where env_time between (starttime .. endtime)
| where CorrelationId == correlationid
| project env_time, Message, Exception
| extend haskeyvalue = iff(Message contains "AADSTS" or Exception contains "AADSTS", 1, 0)
| project env_time, Message, Exception, haskeyvalue
| order by env_time asc
```

`[来源: rms-auth-tracking.md]`

---

## Scenario 83: 结果字段说明
> 来源: rms-auth-tracking.md | 适用: 未标注

### 排查步骤
| 字段 | 说明 |
|------|------|
| env_time | 事件时间 |
| Message | 消息（可能包含 AADSTS 错误详情） |
| Exception | 异常信息 |
| haskeyvalue | 标记是否包含 AADSTS 错误 (1=是) |

---

`[来源: rms-auth-tracking.md]`

---

## Scenario 84: 执行方式
> 来源: rms-auth-tracking.md | 适用: 未标注

### 排查步骤
> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://estscnn2.chinanorth2.kusto.chinacloudapi.cn`
> - database: `ESTS`

`[来源: rms-auth-tracking.md]`

---

## Scenario 85: 查询语句
> 来源: rms-auth-tracking.md | 适用: 未标注

### 排查步骤
```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
PerRequestTableIfx
| where env_time between (starttime .. endtime)
| where TenantId =~ tenantid or Tenant =~ tenantid or UserTenantId =~ tenantid
| where ResourceId == '00000012-0000-0000-c000-000000000000'  // Azure RMS
| where Result != "Success" and ErrorCode != ""
| summarize Count = count() by ErrorCode, ApplicationDisplayName
| order by Count desc
```

---

`[来源: rms-auth-tracking.md]`

---

## Scenario 86: 常见 AADSTS 错误码
> 来源: rms-auth-tracking.md | 适用: 未标注

### 排查步骤
| 错误码 | 说明 |
|--------|------|
| AADSTS50076 | 需要 MFA |
| AADSTS50105 | 用户未分配到应用程序 |
| AADSTS53003 | 被条件访问策略阻止 |
| AADSTS65001 | 用户未同意应用程序 |
| AADSTS70011 | 无效的请求范围 |
| AADSTS90072 | 用户租户禁用外部 IdP 访问 |

---

`[来源: rms-auth-tracking.md]`

---

# Kusto 查询参考

## 来源: `rms-auth-tracking.md`

# Azure RMS 认证追踪

## 用途

追踪 Azure RMS 服务的 Azure AD 认证请求，排查登录失败、条件访问阻止等问题。

**Azure RMS ResourceId**: `00000012-0000-0000-c000-000000000000`

---

## 查询 1: 查询 Azure RMS 登录请求

### 执行方式

> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://estscnn2.chinanorth2.kusto.chinacloudapi.cn`
> - database: `ESTS`

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {starttime} | 是 | 开始时间 |
| {endtime} | 是 | 结束时间 |
| {tenantId} | 否 | 租户 ID |
| {correlationId} | 否 | 关联 ID |
| {userId} | 否 | 用户对象 ID |

### 查询语句

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
let correlationid = "{correlationId}";
let userobjectId = "{userId}";
PerRequestTableIfx
| where env_time between (starttime .. endtime)
| extend targetid = iff(correlationid <> '', correlationid, iff(tenantid <> '', tenantid, 'non-exist'))
| where CorrelationId =~ targetid or Tenant =~ targetid or TenantId =~ targetid or UserTenantId =~ targetid
| where UserPrincipalObjectID contains userobjectId
| where ResourceId == '00000012-0000-0000-c000-000000000000'  // Azure RMS
| project env_time, CorrelationId, ErrorCode, ApplicationDisplayName, Client, 
         ResourceId, ResourceDisplayName, ClientIp, RequestId, Result, 
         MaskedResponse, HttpStatusCode, HttpMethod, ApplicationId, 
         VerificationCert, Call, OriginalHost, Tenant, TenantId, UserTenantId, 
         ThrTenant, UserTenantMfaStatus, DeviceId, DomainName, FaultDomain, 
         UserPrincipalObjectID, ServicePrincipalObjectID, OTData, ITData, 
         LastPasswordChangeTimestamp
| order by env_time asc
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| env_time | 事件时间 |
| CorrelationId | 关联 ID |
| ErrorCode | AAD 错误码 (AADSTS) |
| ApplicationDisplayName | 应用程序名称 |
| ResourceDisplayName | 资源名称 (Azure RMS) |
| Result | 结果 |
| HttpStatusCode | HTTP 状态码 |
| ClientIp | 客户端 IP |
| TenantId | 租户 ID |
| UserPrincipalObjectID | 用户对象 ID |
| DeviceId | 设备 ID |
| UserTenantMfaStatus | MFA 状态 |

---

## 查询 2: 查询诊断跟踪日志 (AADSTS 错误详情)

### 执行方式

> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://estscnn2.chinanorth2.kusto.chinacloudapi.cn`
> - database: `ESTS`

### 用途

根据 correlationId 查询 AAD 登录失败的详细错误信息。

### 查询语句

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let correlationid = "{correlationId}";
DiagnosticTracesIfx
| where env_time between (starttime .. endtime)
| where CorrelationId == correlationid
| project env_time, Message, Exception
| extend haskeyvalue = iff(Message contains "AADSTS" or Exception contains "AADSTS", 1, 0)
| project env_time, Message, Exception, haskeyvalue
| order by env_time asc
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| env_time | 事件时间 |
| Message | 消息（可能包含 AADSTS 错误详情） |
| Exception | 异常信息 |
| haskeyvalue | 标记是否包含 AADSTS 错误 (1=是) |

---

## 查询 3: 统计 RMS 登录失败

### 执行方式

> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://estscnn2.chinanorth2.kusto.chinacloudapi.cn`
> - database: `ESTS`

### 用途

按错误码统计 Azure RMS 的登录失败情况。

### 查询语句

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
PerRequestTableIfx
| where env_time between (starttime .. endtime)
| where TenantId =~ tenantid or Tenant =~ tenantid or UserTenantId =~ tenantid
| where ResourceId == '00000012-0000-0000-c000-000000000000'  // Azure RMS
| where Result != "Success" and ErrorCode != ""
| summarize Count = count() by ErrorCode, ApplicationDisplayName
| order by Count desc
```

---

## 常见 AADSTS 错误码

| 错误码 | 说明 |
|--------|------|
| AADSTS50076 | 需要 MFA |
| AADSTS50105 | 用户未分配到应用程序 |
| AADSTS53003 | 被条件访问策略阻止 |
| AADSTS65001 | 用户未同意应用程序 |
| AADSTS70011 | 无效的请求范围 |
| AADSTS90072 | 用户租户禁用外部 IdP 访问 |

---

## 关联查询

- [mip-request-analysis.md](./mip-request-analysis.md) - MIP 请求日志分析

---

