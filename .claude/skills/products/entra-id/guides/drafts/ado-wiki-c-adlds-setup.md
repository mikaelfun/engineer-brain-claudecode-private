---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/ADLDS/ADLDS setup"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FADLDS%2FADLDS%20setup"
importDate: "2026-04-07"
type: troubleshooting-guide
---

**Summary:** Step-by-step guide for installing and configuring AD LDS, including unique instance creation, replica setup, and unattended installation via answer files.

### Step 1: Install AD LDS

**A) For Server OS Versions:**
1. Open Server Manager > Manage > Add Roles and Features
2. Choose "Role-based or feature-based installation"
3. Check "Active Directory Lightweight Directory Services"
4. Click Install

**B) For Client OS versions:**
1. Run "control.exe" > Programs > Turn Windows Features on or off
2. Locate "Active Directory Lightweight Directory Services" and enable
3. Install Admin Tools via Settings > System > Optional features > search "lightweight"

PowerShell alternative:
```powershell
$path = "C:\windows\adam"
If(!(test-path -PathType container $path)) {
    Add-WindowsFeature -Name "ADLDS" -IncludeAllSubFeature -IncludeManagementTools
}
```

### Step 2: Create a Unique Instance

1. Open AD LDS Setup Wizard (Server Manager > Tools, or `C:\windows\adam\adaminstall.exe`)
2. Choose "A unique instance"
3. Provide instance name
4. Configure ports (default: LDAP 389, SSL 636 — adjust if on DC)
5. Create application directory partition (optional)
6. Set file locations for database and logs
7. Choose service account (Network Service Account or domain account)
8. Specify administrators (recommended: add Domain Group like "Domain Admins")
9. Import LDIF files if needed
10. Review and Install

### Step 3: Create a Replica Instance (Optional)

1. Open AD LDS Setup Wizard
2. Choose "A replica of an existing instance"
3. Provide source server name and port
4. Configure instance name, ports, file locations
5. Specify admin credentials of the configuration set
6. Select application partitions to replicate
7. Review and Install

### Create an Instance Using an Unattended File

**Unique instance** — save as `Unique.txt`, run: `C:\Windows\adam\adaminstall.exe /answer:C:\temp\unique.txt`

```ini
[ADAMInstall]
InstallType=Unique
InstanceName=INSTANCE1
InstanceDescription=INSTANCE1 LDS instance
LocalLDAPPortToListenOn=50000
LocalSSLPortToListenOn=50001
NewApplicationPartitionToCreate=DC=INSTANCE1,DC=local
ServiceAccount=contoso\ldsadmin
ServicePassword=xxxxxxxxxxxxxxxxxxxxxx
AddPermissionsToServiceAccount=yes
ImportLDIFFiles="MS-ADAM-Upgrade-1.LDF" "MS-ADAM-Upgrade-3.LDF" "MS-User.LDF" "MS-UserProxy.LDF" "MS-UserProxyFull.LDF" "MS-adamschemaw2k3.LDF" "MS-adamschemaw2k8.LDF" "MS-AdamSyncMetadata.LDF" "MS-ADLDS-DisplaySpecifiers.LDF" "MS-AZMan.LDF" "MS-InetOrgPerson.LDF" "MS-MembershipTransitive.LDF" "MS-ParentDistname.LDF" "MS-ReplValMetadataExt.LDF" "MS-SecretAttributeCARs.LDF" "MS-SetOwnerBypassQuotaCARs.LDF"
Administrator=contoso\ldsadmingroup
SourceUsername=contoso\ldsadmin
SourcePassword=xxxxxxxxxxxxxxxxxxxxxx
```

**Important notes:**
- `Administrator` in answer file can only specify a domain user (not group). Add domain group to Administrators after install.
- `NewApplicationPartitionToCreate` is optional but recommended.
- `ServicePassword` and `SourcePassword` are wiped from answer file after install.
- Recommend NetworkService as service account for domain members (auto-configures replication).
- `ImportLDIFFiles` — the sample list covers all LDF files in Windows Server 2025. Remove "MS-ADAM-Upgrade-3.LDF" for Server 2019/2022.
- `ConfigurationSetLevel` — auto-set to highest possible DFL. Default: 10 (Server 2025), 7 (Server 2016/2019/2022).

**Replica instance** — save as `Replica.txt`, run: `C:\windows\adam\adaminstall.exe /answer:C:\temp\Replica.txt`

```ini
[ADAMInstall]
InstallType=Replica
InstanceName=INSTANCE1
InstanceDescription=INSTANCE1 LDS instance
SourceServer=LDS1.contoso.com
SourceLDAPPort=50000
LocalLDAPPortToListenOn=50000
LocalSSLPortToListenOn=50001
ApplicationPartitionsToReplicate=*
AddPermissionsToServiceAccount=yes
ServiceAccount=CONTOSO\LdsAdmin
ServicePassword=xxxxxxxxxxxxxxxxxxxxxx
SourceUsername=contoso\ldsadmin
SourcePassword=xxxxxxxxxxxxxxxxxxxxxx
```

- `SourceServer` and `SourceLDAPPort` — source replication server and port
- `ApplicationPartitionsToReplicate=*` — replicate all partitions
